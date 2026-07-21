import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import bcrypt from 'bcryptjs';

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });

const DEMO_USER = {
  name: 'Demo Student',
  email: 'demo@example.com',
  password: 'password123', // hashed before insert — see main()
};

const sampleTasks = [
  {
    title: 'Solve 5 Graph problems (BFS/DFS)',
    description: 'Focus on connected components and shortest path variants on LeetCode.',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    category: 'DSA',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
  },
  {
    title: 'Practice window functions in SQL',
    description: 'RANK, DENSE_RANK, ROW_NUMBER, and running totals.',
    priority: 'MEDIUM',
    status: 'TODO',
    category: 'SQL',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
  },
  {
    title: 'Deploy portfolio project to production',
    description: 'Ship the Student Task Manager to Vercel + Railway and update the README.',
    priority: 'HIGH',
    status: 'TODO',
    category: 'PROJECT',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
  {
    title: 'Apply to 10 SDE internship postings',
    description: 'Tailor resume bullet points per job description.',
    priority: 'MEDIUM',
    status: 'TODO',
    category: 'APPLICATION',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
  },
  {
    title: 'Mock interview — system design basics',
    description: 'Cover load balancing, caching, and database sharding fundamentals.',
    priority: 'LOW',
    status: 'TODO',
    category: 'INTERVIEW_PREP',
    dueDate: null,
  },
  {
    title: 'Refactor DSA notes into a public repo',
    description: 'Organize solved problems by pattern for quick revision.',
    priority: 'LOW',
    status: 'COMPLETED',
    category: 'OTHER',
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
] as const;

async function main(): Promise<void> {
  console.log('🌱 Seeding database...');

  await prisma.task.deleteMany();
  await prisma.user.deleteMany({ where: { email: DEMO_USER.email } });

  const passwordHash = await bcrypt.hash(DEMO_USER.password, 10);
  const user = await prisma.user.create({
    data: { name: DEMO_USER.name, email: DEMO_USER.email, password: passwordHash },
  });

  for (const task of sampleTasks) {
    await prisma.task.create({ data: { ...task, userId: user.id } });
  }

  console.log(`✅ Seeded 1 user (${DEMO_USER.email} / ${DEMO_USER.password}) and ${sampleTasks.length} tasks.`);
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });