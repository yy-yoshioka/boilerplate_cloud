// Temporary stub for shared tRPC router types
export type AppRouter = unknown;

export const appRouter = {
  createCaller: () => ({
    user: {
      list: () => [],
    },
  }),
} as const;
