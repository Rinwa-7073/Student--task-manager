import swaggerJsdoc from 'swagger-jsdoc';
import { env } from '@config/env';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Student Task Manager API',
      version: '1.0.0',
      description:
        'REST API for managing placement-preparation tasks (DSA, SQL, projects, applications, and more).',
    },
    servers: [{ url: `http://localhost:${env.PORT}${env.API_PREFIX}` }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Obtain a token from POST /auth/register or POST /auth/login',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'clx1a2b3c0000userxyz1234' },
            name: { type: 'string', example: 'Hritvi' },
            email: { type: 'string', format: 'email' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Task: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'clx1b2c3d0000abcxyz12345' },
            title: { type: 'string', example: 'Solve 3 Graph DSA problems' },
            description: { type: 'string', nullable: true },
            priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'] },
            status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'COMPLETED'] },
            category: {
              type: 'string',
              enum: ['DSA', 'SQL', 'PROJECT', 'APPLICATION', 'INTERVIEW_PREP', 'OTHER'],
            },
            dueDate: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/features/**/*.routes.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);