import { z } from 'zod';

export const createShiftSchema = z.object({
  body: z.object({
    title: z
      .string({
        error: (issue) =>
          issue.input === undefined ? "Title is required" : "Title must be a string",
      })
      .min(1, { error: "Title cannot be empty" }),

    // ISO 8601, by default only accepts UTC (Z)
    startTime: z.iso.datetime({ error: "Invalid datetime string! Must be UTC." }),
    endTime: z.iso.datetime({ error: "Invalid datetime string! Must be UTC." }),

    capacity: z.number().int().min(1, { error: "Capacity must be at least 1" }),
  }),
});