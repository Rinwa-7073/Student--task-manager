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
    loggedMinutes: 75,
    estimatedMinutes: 120,
    subtasks: JSON.stringify([
      { id: 'st-seed-1', title: 'Number of Islands (BFS)', completed: true },
      { id: 'st-seed-2', title: 'Clone Graph', completed: true },
      { id: 'st-seed-3', title: 'Course Schedule (Topological Sort)', completed: false },
      { id: 'st-seed-4', title: 'Word Ladder (Shortest Path)', completed: false },
      { id: 'st-seed-5', title: 'Pacific Atlantic Water Flow', completed: false },
    ]),
  },
  {
    title: 'Practice window functions in SQL',
    description: 'RANK, DENSE_RANK, ROW_NUMBER, and running totals.',
    priority: 'MEDIUM',
    status: 'TODO',
    category: 'SQL',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    loggedMinutes: 25,
    estimatedMinutes: 60,
    subtasks: JSON.stringify([
      { id: 'st-seed-6', title: 'Department top 3 salaries (DENSE_RANK)', completed: true },
      { id: 'st-seed-7', title: 'Cumulative monthly sales (SUM OVER)', completed: false },
      { id: 'st-seed-8', title: 'Lead and Lag time difference problems', completed: false },
    ]),
  },
  {
    title: 'Deploy portfolio project to production',
    description: 'Ship the Student Task Manager to Vercel + Railway and update the README.',
    priority: 'HIGH',
    status: 'TODO',
    category: 'PROJECT',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    loggedMinutes: 50,
    estimatedMinutes: 90,
    subtasks: JSON.stringify([
      { id: 'st-seed-9', title: 'Setup production environment secrets', completed: true },
      { id: 'st-seed-10', title: 'Configure frontend build on Vercel', completed: false },
      { id: 'st-seed-11', title: 'Deploy backend API container', completed: false },
      { id: 'st-seed-12', title: 'Record 2-min demo walkthrough video', completed: false },
    ]),
  },
  {
    title: 'Apply to 10 SDE internship postings',
    description: 'Tailor resume bullet points per job description.',
    priority: 'MEDIUM',
    status: 'TODO',
    category: 'APPLICATION',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    loggedMinutes: 30,
    estimatedMinutes: 60,
    subtasks: JSON.stringify([
      { id: 'st-seed-13', title: 'Google Summer of Code / Early Careers', completed: true },
      { id: 'st-seed-14', title: 'Microsoft University Grad Portal', completed: false },
      { id: 'st-seed-15', title: 'Atlassian Engineering Internship', completed: false },
    ]),
  },
  {
    title: 'Mock interview — system design basics',
    description: 'Cover load balancing, caching, and database sharding fundamentals.',
    priority: 'LOW',
    status: 'TODO',
    category: 'INTERVIEW_PREP',
    dueDate: null,
    loggedMinutes: 0,
    estimatedMinutes: 45,
    subtasks: JSON.stringify([
      { id: 'st-seed-16', title: 'Consistent hashing review', completed: false },
      { id: 'st-seed-17', title: 'Cache invalidation strategies', completed: false },
    ]),
  },
  {
    title: 'Refactor DSA notes into a public repo',
    description: 'Organize solved problems by pattern for quick revision.',
    priority: 'LOW',
    status: 'COMPLETED',
    category: 'OTHER',
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    loggedMinutes: 45,
    estimatedMinutes: 45,
    subtasks: JSON.stringify([
      { id: 'st-seed-18', title: 'Two Pointers and Sliding Window cheat sheet', completed: true },
      { id: 'st-seed-19', title: 'Binary Search patterns template', completed: true },
    ]),
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

  console.log(`✅ Seeded 1 user (${DEMO_USER.email} / ${DEMO_USER.password}) and ${sampleTasks.length} rich tasks.`);
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
