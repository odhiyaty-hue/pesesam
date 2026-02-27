import { z } from "zod";
import { 
  insertTournamentSchema, 
  users, tournaments, participants, matches, results 
} from "./schema";

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  unauthorized: z.object({ message: z.string() }),
};

export const api = {
  users: {
    me: {
      method: "GET" as const,
      path: "/api/users/me" as const,
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      }
    },
    sync: {
      method: "POST" as const,
      path: "/api/users/sync" as const,
      input: z.object({
        id: z.string(),
        email: z.string(),
        realName: z.string().optional(),
        ingameName: z.string().optional(),
        avatarUrl: z.string().optional(),
      }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
      }
    }
  },
  tournaments: {
    list: {
      method: "GET" as const,
      path: "/api/tournaments" as const,
      responses: { 200: z.array(z.custom<typeof tournaments.$inferSelect>()) }
    },
    get: {
      method: "GET" as const,
      path: "/api/tournaments/:id" as const,
      responses: {
        200: z.custom<typeof tournaments.$inferSelect>(),
        404: errorSchemas.notFound,
      }
    },
    create: {
      method: "POST" as const,
      path: "/api/tournaments" as const,
      input: insertTournamentSchema,
      responses: { 201: z.custom<typeof tournaments.$inferSelect>() }
    },
    join: {
      method: "POST" as const,
      path: "/api/tournaments/:id/join" as const,
      responses: { 200: z.custom<typeof participants.$inferSelect>(), 400: errorSchemas.validation }
    },
    generateBracket: {
      method: "POST" as const,
      path: "/api/tournaments/:id/generate" as const,
      responses: { 200: z.array(z.custom<typeof matches.$inferSelect>()) }
    }
  },
  matches: {
    listByTournament: {
      method: "GET" as const,
      path: "/api/tournaments/:id/matches" as const,
      responses: { 200: z.array(z.custom<typeof matches.$inferSelect>()) }
    },
    get: {
      method: "GET" as const,
      path: "/api/matches/:id" as const,
      responses: { 200: z.custom<typeof matches.$inferSelect>(), 404: errorSchemas.notFound }
    },
    confirmWinner: {
      method: "POST" as const,
      path: "/api/matches/:id/confirm" as const,
      input: z.object({ winnerId: z.string() }),
      responses: { 200: z.custom<typeof matches.$inferSelect>() }
    }
  },
  results: {
    listByMatch: {
      method: "GET" as const,
      path: "/api/matches/:id/results" as const,
      responses: { 200: z.array(z.custom<typeof results.$inferSelect>()) }
    },
    upload: {
      method: "POST" as const,
      path: "/api/matches/:id/results" as const,
      input: z.object({ screenshotUrl: z.string() }),
      responses: { 201: z.custom<typeof results.$inferSelect>() }
    },
    delete: {
      method: "DELETE" as const,
      path: "/api/results/:id" as const,
      responses: { 204: z.void() }
    }
  },
  upload: {
    // used to proxy ImgBB
    method: "POST" as const,
    path: "/api/upload" as const,
    responses: { 200: z.object({ url: z.string() }) }
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
