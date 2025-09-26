import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";

export const awsRouter = createTRPCRouter({
  sendQuery: publicProcedure
    .input(
      z.object({
        query: z.string(),
      }),
    )
    .query(async ({ input }) => {
      // TODO: Implement
    }),
});
