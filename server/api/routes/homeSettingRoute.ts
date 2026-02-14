import { createHomeSettingSchema, updateHomeSettingSchema, homeSettingResponseSchema } from 'server/shared/dtos/HomeSetting';
import { errorSchemas } from 'server/shared/utils/errorSchemas';
import { z } from 'zod';

export const api = {
  homeSettings: {
    list: {
      method: 'GET' as const,
      path: '/api/admin/homeSettings',
      responses: {
        200: z.array(homeSettingResponseSchema),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/admin/homeSettings',
      input: createHomeSettingSchema,
      responses: {
        201: homeSettingResponseSchema,
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/admin/homeSettings/:id',
      responses: {
        200: homeSettingResponseSchema,
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/admin/homeSettings/:id',
      input: updateHomeSettingSchema,
      responses: {
        200: homeSettingResponseSchema,
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/admin/homeSettings/:id',
      responses: {
        200: z.object({ success: z.boolean() }),
        404: errorSchemas.notFound,
      },
    },
  },
};
