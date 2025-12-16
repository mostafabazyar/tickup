import { Router, Request, Response } from "express";
import { prisma } from "../index";

const router = Router();

// GET /api/objectives - List all objectives
router.get("/", async (req: Request, res: Response) => {
  try {
    const objectives = await prisma.objective.findMany({
      include: {
        owner: true,
        keyResults: {
          include: {
            owner: true,
            checkIns: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(objectives);
  } catch (error) {
    console.error("Error fetching objectives:", error);
    res.status(500).json({ error: "Failed to fetch objectives" });
  }
});

// GET /api/objectives/:id - Get single objective
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const objective = await prisma.objective.findUnique({
      where: { id },
      include: {
        owner: true,
        keyResults: {
          include: {
            owner: true,
            checkIns: true,
          },
        },
        parent: true,
        children: true,
        comments: {
          include: {
            createdBy: true,
          },
        },
      },
    });

    if (!objective) {
      return res.status(404).json({ error: "Objective not found" });
    }

    res.json(objective);
  } catch (error) {
    console.error("Error fetching objective:", error);
    res.status(500).json({ error: "Failed to fetch objective" });
  }
});

// POST /api/objectives - Create new objective
router.post("/", async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      category,
      color,
      quarter,
      endDate,
      ownerId,
      parentId,
    } = req.body;

    // Validation
    if (!title || !ownerId) {
      return res
        .status(400)
        .json({ error: "Title and ownerId are required" });
    }

    // Validate owner exists
    const ownerExists = await prisma.user.findUnique({ where: { id: ownerId } });
    if (!ownerExists) {
      return res.status(400).json({ error: `Owner with id "${ownerId}" does not exist` });
    }

    // Validate parentId exists if provided and not empty. If it does not exist,
    // we will create the objective without a parent and return a warning
    // instead of failing with a 400. This avoids FK errors when frontend
    // accidentally sends stale/mock parent IDs.
    let validParentId: string | null = null;
    let parentWarning: string | null = null;
    if (parentId && typeof parentId === "string" && parentId.trim() !== "") {
      try {
        const parentExists = await prisma.objective.findUnique({ where: { id: parentId } });
        if (!parentExists) {
          parentWarning = `Parent objective with id "${parentId}" does not exist; created without parent.`;
        } else {
          validParentId = parentId;
        }
      } catch (err) {
        parentWarning = `Unable to validate parentId; created without parent.`;
      }
    }

    const objective = await prisma.objective.create({
      data: {
        title,
        description: description || null,
        category: category || "BUSINESS_GROWTH",
        color: color || "gray",
        quarter: quarter || null,
        endDate: endDate ? new Date(endDate) : null,
        ownerId,
        parentId: validParentId,
      },
      include: {
        owner: true,
        keyResults: true,
      },
    });

    if (parentWarning) {
      return res.status(201).json({ objective, warning: parentWarning });
    }

    res.status(201).json(objective);
  } catch (error) {
    console.error("Error creating objective:", error);
    res.status(500).json({ error: "Failed to create objective" });
  }
});

// PUT /api/objectives/:id - Update objective
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      category,
      color,
      quarter,
      endDate,
      ownerId,
      parentId,
      isArchived,
    } = req.body;

    const objective = await prisma.objective.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(category && { category }),
        ...(color && { color }),
        ...(quarter && { quarter }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(ownerId && { ownerId }),
        ...(parentId !== undefined && { parentId }),
        ...(isArchived !== undefined && { isArchived }),
      },
      include: {
        owner: true,
        keyResults: true,
      },
    });

    res.json(objective);
  } catch (error) {
    console.error("Error updating objective:", error);
    res.status(500).json({ error: "Failed to update objective" });
  }
});

// DELETE /api/objectives/:id - Delete objective
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Archive instead of delete (soft delete)
    const objective = await prisma.objective.update({
      where: { id },
      data: { isArchived: true },
    });

    res.json({ message: "Objective archived", objective });
  } catch (error) {
    console.error("Error deleting objective:", error);
    res.status(500).json({ error: "Failed to delete objective" });
  }
});

// GET /api/objectives/:id/key-results - Get key results for objective
router.get("/:id/key-results", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const keyResults = await prisma.keyResult.findMany({
      where: { objectiveId: id },
      include: {
        owner: true,
        checkIns: true,
      },
    });

    res.json(keyResults);
  } catch (error) {
    console.error("Error fetching key results:", error);
    res.status(500).json({ error: "Failed to fetch key results" });
  }
});

export default router;
