import { z } from 'zod';

export const registerEventSchema = z.object({
  faculty_id: z.number().int().positive().optional().nullable(),
  participant_name: z.string().optional(),
  faculty_code: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  department: z.string().optional(),
  designation: z.string().optional(),
  institution_name: z.string().optional(),
  years_of_experience: z.number().optional(),
  teaching_interests: z.string().optional(),
  research_interests: z.string().optional(),
});

export type RegisterEventInput = z.infer<typeof registerEventSchema>;
