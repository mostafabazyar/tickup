import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.comment.deleteMany({});
  await prisma.checkIn.deleteMany({});
  await prisma.keyResult.deleteMany({});
  await prisma.objective.deleteMany({});
  await prisma.user.deleteMany({});

  // Hash passwords
  const saltRounds = 10;
  const hashedAdminPassword = await bcrypt.hash('admin', saltRounds);
  const hashedPassword = await bcrypt.hash('password', saltRounds);

  // Create test users matching your frontend mockData
  const users = await Promise.all([
    prisma.user.create({
      data: {
        id: 'u-admin',
        name: 'مدیر سیستم',
        email: 'admin@example.com',
        username: 'admin',
        password: hashedAdminPassword,
        role: 'admin',
        avatar: 'https://i.pravatar.cc/150?u=admin'
      }
    }),
    prisma.user.create({
      data: {
        id: 'u-rezaei',
        name: 'دکتر رضایی',
        email: 'rezaei@example.com',
        username: 'rezaei',
        password: hashedPassword,
        role: 'lead',
        avatar: 'https://i.pravatar.cc/150?u=rezaei'
      }
    }),
    prisma.user.create({
      data: {
        id: 'u-akbari',
        name: 'مهندس اکبری',
        email: 'akbari@example.com',
        username: 'akbari',
        password: hashedPassword,
        role: 'lead',
        avatar: 'https://i.pravatar.cc/150?u=akbari'
      }
    }),
    prisma.user.create({
      data: {
        id: 'u-hosseini',
        name: 'خانم حسینی',
        email: 'hosseini@example.com',
        username: 'hosseini',
        password: hashedPassword,
        role: 'member',
        avatar: 'https://i.pravatar.cc/150?u=hosseini'
      }
    }),
    prisma.user.create({
      data: {
        id: 'u-salehi',
        name: 'آقای صالحی',
        email: 'salehi@example.com',
        username: 'salehi',
        password: hashedPassword,
        role: 'member',
        avatar: 'https://i.pravatar.cc/150?u=salehi'
      }
    }),
  ]);

  console.log(`Created ${users.length} users`);

  // Create sample objectives to match frontend MOCK_OBJECTIVES
  const objective1 = await prisma.objective.create({
    data: {
      id: 'obj-quality-1',
      title: 'افزایش کیفیت و بهینه‌سازی تولید پودر دیالیز',
      description: 'رسیدن به بالاترین استانداردهای کیفی در تولید پودر دیالیز و افزایش ظرفیت تولید برای پاسخ به تقاضای بازار.',
      category: 'QUALITY_STANDARDS',
      color: 'blue',
      isArchived: false,
      ownerId: 'u-akbari',
    },
  });

  // Key Results for objective1
  const kr1 = await prisma.keyResult.create({
    data: {
      id: 'kr-q1',
      title: 'کاهش نرخ ناخالصی در پودر دیالیز از 0.5% به 0.1%',
      category: 'STANDARD',
      type: 'PERCENTAGE',
      unit: '%',
      startValue: 0.5,
      targetValue: 0.1,
      currentValue: 0.2,
      status: 'ON_TRACK',
      reportFrequency: 'WEEKLY',
      startDate: new Date(),
      objectiveId: objective1.id,
      ownerId: 'u-hosseini',
    },
  });

  const kr2 = await prisma.keyResult.create({
    data: {
      id: 'kr-q2',
      title: 'افزایش تولید روزانه از 500 کیلوگرم به 700 کیلوگرم',
      category: 'STANDARD',
      type: 'NUMBER',
      startValue: 500,
      targetValue: 700,
      currentValue: 520,
      status: 'NEEDS_ATTENTION',
      reportFrequency: 'DAILY',
      startDate: new Date(),
      objectiveId: objective1.id,
      ownerId: 'u-akbari',
    },
  });

  // Second sample objective
  const objective2 = await prisma.objective.create({
    data: {
      id: 'obj-rd-1',
      title: 'توسعه و عرضه نسل جدید محفظه‌های دیالیز زیست‌سازگار',
      description: 'تحقیق، توسعه و آماده‌سازی برای تولید انبوه محفظه‌های دیالیز با مواد بیوپلیمر برای کاهش واکنش‌های آلرژیک.',
      category: 'PRODUCT_INNOVATION',
      color: 'green',
      isArchived: false,
      ownerId: 'u-rezaei',
    },
  });

  await prisma.keyResult.createMany({
    data: [
      {
        id: 'kr-rd1',
        title: 'تکمیل فاز اول تحقیق و توسعه تا پایان فصل',
        category: 'BINARY',
        type: 'BINARY',
        currentValue: 0,
        objectiveId: objective2.id,
        ownerId: 'u-rezaei',
      },
      {
        id: 'kr-rd2',
        title: 'دریافت گواهی‌نامه استاندارد پزشکی ISO 13485',
        category: 'BINARY',
        type: 'BINARY',
        currentValue: 0,
        objectiveId: objective2.id,
        ownerId: 'u-hosseini',
      },
      {
        id: 'kr-rd3',
        title: 'افزایش هفتگی نمونه‌های موفق آزمایشگاهی',
        category: 'STANDARD',
        type: 'NUMBER',
        startValue: 0,
        targetValue: 50,
        currentValue: 15,
        reportFrequency: 'WEEKLY',
        objectiveId: objective2.id,
        ownerId: 'u-rezaei',
      }
    ]
  });

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
