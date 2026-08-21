import z from 'zod';

const INVALID_EMAIL_MESSAGE = 'Invalid email address';
const REQUIRED_EMAIL_MESSAGE = 'Email is required';
const emailValueSchema = z.email({ message: INVALID_EMAIL_MESSAGE });

function getEmailValidationMessage(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return REQUIRED_EMAIL_MESSAGE;
  }

  if (!emailValueSchema.safeParse(trimmedValue).success) {
    return INVALID_EMAIL_MESSAGE;
  }

  return null;
}

export const emailSchema = z
  .string({ error: REQUIRED_EMAIL_MESSAGE })
  .trim()
  .superRefine((value, context) => {
    const message = getEmailValidationMessage(value);

    if (!message) {
      return;
    }

    context.addIssue({
      code: 'custom',
      message,
    });
  })
  .transform((value) => value.toLowerCase());

export const emailSchemaOptional = z
  .string()
  .trim()
  .superRefine((value, context) => {
    if (!value) {
      return;
    }

    const message = getEmailValidationMessage(value);

    if (!message || message === REQUIRED_EMAIL_MESSAGE) {
      return;
    }

    context.addIssue({
      code: 'custom',
      message,
    });
  })
  .transform((value) => value.toLowerCase())
  .optional()
  .or(z.literal(''));
