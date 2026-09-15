import { z } from 'zod';
import { VOLUNTEER } from '../config/limits';

const { MAX_NAME_LENGTH, MAX_EMAIL_LENGTH } = VOLUNTEER;

// distinguishes a missing field from a field of the wrong type
const requiredString = (field: string) =>
  z.string({
    error: (issue) =>
      issue.input === undefined ? `${field} is required` : `${field} must be a string`,
  });

export const createVolunteerSchema = z.object({
  body: z.object({
    name: requiredString("Name")
      .trim() // remove white space
      .min(1, { error: "Name cannot be empty" })
      .max(MAX_NAME_LENGTH, { error: `Name must be ${MAX_NAME_LENGTH} characters or fewer` }),

    email: requiredString("Email")
      .trim() // remove white space
      .toLowerCase()
      .max(MAX_EMAIL_LENGTH, { error: `Email must be ${MAX_EMAIL_LENGTH} characters or fewer` })
      .pipe(z.email({ error: "Invalid email format" })), // ensure email format is correct
  }),
});