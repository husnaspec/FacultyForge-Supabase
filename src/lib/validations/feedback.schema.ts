import { z } from 'zod';

export const submitFeedbackSchema = z.object({
  faculty_id: z.number().int().positive(),
  content_rating: z.number().int().min(1).max(5).default(5),
  trainer_rating: z.number().int().min(1).max(5).default(5),
  relevance_rating: z.number().int().min(1).max(5).default(5),
  practical_rating: z.number().int().min(1).max(5).default(4),
  organization_rating: z.number().int().min(1).max(5).default(5),
  comments: z.string().optional(),
  suggestions: z.string().optional(),
});
