import { createTenantSchema, updateTenantSchema, tenantResponseSchema } from 'server/shared/dtos/Tenant';
import { errorSchemas } from 'server/shared/utils/errorSchemas';
import { z } from 'zod';

export const api = {
  tenants: {
    list: {
      method: 'GET' as const,
      path: '/api/admin/tenants',
      responses: {
        200: z.array(tenantResponseSchema),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/admin/tenants',
      input: createTenantSchema,
      responses: {
        201: tenantResponseSchema,
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/admin/tenants/:id',
      responses: {
        200: tenantResponseSchema,
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/admin/tenants/:id',
      input: updateTenantSchema,
      responses: {
        200: tenantResponseSchema,
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/admin/tenants/:id',
      responses: {
        200: z.object({ message: z.string() }),
        404: errorSchemas.notFound,
      },
    },
  },
};
