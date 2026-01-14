import { createUserSchema, updateUserSchema, userResponseSchema } from 'server/shared/dtos/User';
import { errorSchemas } from 'server/shared/utils/errorSchemas';
import { z } from 'zod';

export const api = {
  users: {
    list: {
      method: 'GET' as const,
      path: '/api/admin/users',
      responses: {
        200: z.array(userResponseSchema),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/admin/users',
      input: createUserSchema,
      responses: {
        201: userResponseSchema,
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/admin/users/:id',
      responses: {
        200: userResponseSchema,
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/admin/users/:id',
      input: updateUserSchema,
      responses: {
        200: userResponseSchema,
        404: errorSchemas.notFound,
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/admin/users/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
};


