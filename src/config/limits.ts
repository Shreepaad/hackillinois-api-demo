// Domain limits shared by the Zod validators and Mongoose models.

export const SHIFT = {
  MAX_TITLE_LENGTH: 100,
  MAX_CAPACITY: 100,
  MAX_SHIFT_HOURS: 10,
} as const;

export const VOLUNTEER = {
  MAX_NAME_LENGTH: 100,
  MAX_EMAIL_LENGTH: 254,
} as const;