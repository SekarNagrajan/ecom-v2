import { z } from 'zod';

export const teamsMeetingSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  range: z.tuple([
    z.iso.datetime({
      message: 'Start date is required',
    }),
    z.iso.datetime({
      message: 'End date is required',
    }),
  ]),
  cc: z.array(z.string()).optional(),
  attendees: z.array(z.string()).optional(),
  agenda: z.string().optional(),
});

export const activityTaskSchema = z.object({
  activityType: z.enum(['call', 'activity', 'meeting', 'visit']),
  subject: z.string().min(1, 'Subject is required'),
  dueDate: z.iso.datetime({
    message: 'Due date is required',
  }),
  repeat: z.enum(['no-repeat', 'daily', 'weekly', 'monthly']).optional(),
  priority: z.enum(['high', 'medium', 'low']).optional(),
  status: z
    .enum(['open', 'in-progress', 'negotiation', 'review', 'closed'])
    .optional(),
  assignedTo: z.string().optional(),
  customerId: z.string().optional(),
  description: z.string().optional(),
});

export type TeamsMeetingFormData = z.infer<typeof teamsMeetingSchema>;
export type ActivityTaskFormData = z.infer<typeof activityTaskSchema>;
