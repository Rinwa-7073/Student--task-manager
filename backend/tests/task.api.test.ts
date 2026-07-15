import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';

/**
 * End-to-end integration tests exercising the Task API through real HTTP
 * requests against the Express app (Supertest boots it in-process — no
 * separate server needed). Requires `DATABASE_URL` to point at a usable
 * SQLite file and the Prisma Client to be generated
 * (`npm run prisma:generate`) before running `npm test`.
 */
describe('Task API', () => {
  const app = createApp();
  let createdId: string;

  it('GET /health returns 200 with an OK payload', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST /api/v1/tasks creates a task', async () => {
    const res = await request(app).post('/api/v1/tasks').send({
      title: 'Write integration tests',
      description: 'Cover every Task endpoint',
      priority: 'HIGH',
      status: 'TODO',
      category: 'PROJECT',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({ title: 'Write integration tests', priority: 'HIGH' });
    createdId = res.body.data.id;
  });

  it('POST /api/v1/tasks rejects an invalid payload', async () => {
    const res = await request(app).post('/api/v1/tasks').send({ title: '' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/v1/tasks returns a paginated list', async () => {
    const res = await request(app).get('/api/v1/tasks').query({ page: 1, limit: 10 });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toMatchObject({ page: 1, limit: 10 });
  });

  it('GET /api/v1/tasks/:id returns the created task', async () => {
    const res = await request(app).get(`/api/v1/tasks/${createdId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(createdId);
  });

  it('GET /api/v1/tasks/:id returns 404 for an unknown id', async () => {
    const res = await request(app).get('/api/v1/tasks/nonexistent000000000000');
    expect(res.status).toBe(404);
  });

  it('PATCH /api/v1/tasks/:id partially updates a task', async () => {
    const res = await request(app)
      .patch(`/api/v1/tasks/${createdId}`)
      .send({ priority: 'LOW' });
    expect(res.status).toBe(200);
    expect(res.body.data.priority).toBe('LOW');
  });

  it('PUT /api/v1/tasks/:id fully replaces a task', async () => {
    const res = await request(app).put(`/api/v1/tasks/${createdId}`).send({
      title: 'Replaced title',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      category: 'DSA',
    });
    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Replaced title');
  });

  it('PATCH /api/v1/tasks/:id/complete toggles completion', async () => {
    const first = await request(app).patch(`/api/v1/tasks/${createdId}/complete`);
    expect(first.status).toBe(200);
    expect(first.body.data.status).toBe('COMPLETED');

    const second = await request(app).patch(`/api/v1/tasks/${createdId}/complete`);
    expect(second.status).toBe(200);
    expect(second.body.data.status).not.toBe('COMPLETED');
  });

  it('GET /api/v1/tasks/statistics returns aggregate counts', async () => {
    const res = await request(app).get('/api/v1/tasks/statistics');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('total');
    expect(res.body.data).toHaveProperty('byStatus');
  });

  it('DELETE /api/v1/tasks/:id removes the task', async () => {
    const res = await request(app).delete(`/api/v1/tasks/${createdId}`);
    expect(res.status).toBe(204);

    const followUp = await request(app).get(`/api/v1/tasks/${createdId}`);
    expect(followUp.status).toBe(404);
  });

  it('GET /unknown-route returns a JSON 404', async () => {
    const res = await request(app).get('/unknown-route');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
