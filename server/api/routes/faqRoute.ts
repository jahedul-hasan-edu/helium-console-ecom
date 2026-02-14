import { createFaqSchema, updateFaqSchema, faqResponseSchema } from 'server/shared/dtos/Faq';
import { errorSchemas } from 'server/shared/utils/errorSchemas';
import { z } from 'zod';

export const api = {
  faqs: {
    list: {
      method: 'GET' as const,
      path: '/api/admin/faqs',
      responses: {
        200: z.array(faqResponseSchema),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/admin/faqs',
      input: createFaqSchema,
      responses: {
        201: faqResponseSchema,
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/admin/faqs/:id',
      responses: {
        200: faqResponseSchema,
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/admin/faqs/:id',
      input: updateFaqSchema,
      responses: {
        200: faqResponseSchema,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/admin/faqs/:id',
      responses: {
        200: z.object({ success: z.boolean() }),
        404: errorSchemas.notFound,
      },
    },
  },
};
