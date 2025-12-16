import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../index";

const router = Router();

// GET /api/users - List all users
router.get("/", async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { name: "asc" },
    });

    // Map avatar to avatarUrl for frontend compatibility
    const usersWithAvatarUrl = users.map(({ avatar, ...user }) => ({
      ...user,
      avatarUrl: avatar,
    }));

    res.json(usersWithAvatarUrl);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// GET /api/users/:id - Get single user
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Map avatar to avatarUrl for frontend compatibility
    const { avatar, ...userWithoutAvatar } = user;
    res.json({
      ...userWithoutAvatar,
      avatarUrl: avatar,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// POST /api/users - Create new user
router.post("/", async (req: Request, res: Response) => {
  try {
    const { id, name, email, username, password, role = "member", avatarUrl } = req.body;

    if (!name || !email || !username || !password) {
      return res.status(400).json({ error: "Name, email, username, and password are required" });
    }

    // Check if username or email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email },
        ],
      },
    });

    if (existingUser) {
      return res.status(409).json({ error: "Username or email already exists" });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = await prisma.user.create({
      data: {
        id: id || undefined,
        name,
        email,
        username,
        password: hashedPassword,
        role,
        avatar: avatarUrl || null, // Map avatarUrl to avatar for database
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    });

    // Return user data with avatarUrl mapped back
    const { avatar, ...userWithoutAvatar } = user;
    res.status(201).json({
      ...userWithoutAvatar,
      avatarUrl: avatar,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

export default router;
