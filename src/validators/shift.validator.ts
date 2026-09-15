import { z } from 'zod';
import { SHIFT } from '../config/limits';

const { MAX_TITLE_LENGTH, MAX_CAPACITY, MAX_SHIFT_HOURS } = SHIFT;

// distinguishes a missing field from a field of the wrong type
const requiredString = (field: string) =>
  z.string({
    error: (issue) =>
      issue.input === undefined ? `${field} is required` : `${field} must be a string`,
  });

const requiredNumber = (field: string) =>
  z.number({
    error: (issue) =>
      issue.input === undefined ? `${field} is required` : `${field} must be a number`,
  });

// ISO 8601, by default only accepts UTC (Z)
const requiredUtcDatetime = (field: string) =>
  z.iso.datetime({
    error: (issue) =>
      issue.input === undefined
        ? `${field} is required`
        : `${field} must be an ISO 8601 UTC datetime (e.g. 2026-09-15T10:00:00Z)`,
  });

export const createShiftSchema = z.object({
  body: z.object({
    title: requiredString("Title")
      .trim()
      .min(1, { error: "Title cannot be empty" })
      .max(MAX_TITLE_LENGTH, { error: `Title must be ${MAX_TITLE_LENGTH} characters or fewer` }),

    startTime: requiredUtcDatetime("Start time"),
    endTime: requiredUtcDatetime("End time"),

    capacity: requiredNumber("Capacity")
      .int({ error: "Capacity must be a whole number" })
      .min(1, { error: "Capacity must be at least 1" })
      .max(MAX_CAPACITY, { error: `Capacity must be ${MAX_CAPACITY} or fewer` }),
  })
  .superRefine((b, ctx) => {
      const start = Date.parse(b.startTime);
      const end = Date.parse(b.endTime);

      // check if either date is invalid
      if (Number.isNaN(start) || Number.isNaN(end)) return;

      // ensure that the starttime is before the endtime
      if (end <= start) {
        ctx.addIssue({
          code: "custom",
          message: "End time must be after start time",
          path: ["endTime"],
        });
      } else if (end - start > MAX_SHIFT_HOURS * 60 * 60 * 1000) {
        ctx.addIssue({
          code: "custom",
          message: `Shift cannot be longer than ${MAX_SHIFT_HOURS} hours`,
          path: ["endTime"],
        });
      }
    }),
});