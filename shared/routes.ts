import { z } from 'zod';
import { restaurants, menuItems, recommendations } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  restaurants: {
    list: {
      method: 'GET' as const,
      path: '/api/restaurants' as const,
      responses: {
        200: z.array(z.custom<typeof restaurants.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/restaurants/:id' as const,
      responses: {
        200: z.custom<typeof restaurants.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    menu: {
      method: 'GET' as const,
      path: '/api/restaurants/:id/menu' as const,
      responses: {
        200: z.array(z.custom<typeof menuItems.$inferSelect>()),
        404: errorSchemas.notFound,
      },
    }
  },
  recommendations: {
    list: {
      method: 'GET' as const,
      path: '/api/recommendations' as const,
      responses: {
        200: z.array(z.custom<typeof recommendations.$inferSelect>()),
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
