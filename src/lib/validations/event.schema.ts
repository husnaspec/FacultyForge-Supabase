import { z } from 'zod';

export const createEventSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().optional(),
  event_type: z.enum(['FDP', 'WORKSHOP', 'SEMINAR', 'TRAINING', 'STTP']).default('FDP'),
  objectives: z.string().optional(),
  target_audience: z.string().optional(),
  eligibility: z.string().optional(),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  duration_hours: z.number().positive().default(16),
  capacity: z.number().int().positive().default(50),
  delivery_mode: z.enum(['OFFLINE', 'ONLINE', 'HYBRID']).default('HYBRID'),
  venue: z.string().optional(),
  department_id: z.number().int().positive(),
  coordinator_faculty_id: z.number().int().positive().optional().nullable(),
  estimated_budget: z.number().nonnegative().default(0),
  expected_outcomes: z.string().optional(),
  learning_outcomes: z.string().optional(),
});

export const updateEventSchema = createEventSchema.partial().extend({
  status: z.enum(['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'REGISTRATION_OPEN', 'ONGOING', 'COMPLETED', 'CANCELLED']).optional(),
  actual_expenditure: z.number().nonnegative().optional(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
