import { z } from 'zod';

export const createVolunteerSchema = z.object({
  body: z.object({
    name: z
      .string({
        error: (issue) =>
          issue.input === undefined ? "Name is required" : "Name must be a string",
      })
      .min(1, { error: "Name cannot be empty" }),

    email: z.email({
      error: (issue) =>
        issue.input === undefined ? "Email is required" : "Invalid email format",
    }),
  }),
});