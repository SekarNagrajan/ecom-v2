import { z } from 'zod';

const emailRecipientItemSchema = z
  .email('Enter a valid email')
  .transform((value) => value.toLowerCase());

export const emailComposerFormSchema = z.object({
  to: z
    .array(emailRecipientItemSchema)
    .min(1, 'At least one recipient is required'),
  cc: z.array(emailRecipientItemSchema),
  bcc: z.array(emailRecipientItemSchema),
  subject: z.string().trim().min(1, 'Subject is required'),
  bodyHtml: z
    .string()
    .trim()
    .min(1, 'Message is required')
    .refine(
      (value) => value.replace(/<[^>]+>/g, '').trim().length > 0,
      'Message is required'
    ),
});

export type EmailComposerFormValues = z.infer<typeof emailComposerFormSchema>;
