import { z } from 'zod';

export const createAssessmentSchema = z.object({
  event_id: z.number().int().positive(),
  assessment_type: z.enum(['PRE', 'POST']),
  title: z.string().min(5),
  total_marks: z.number().positive().default(100),
  passing_marks: z.number().positive().default(50),
});

export const addQuestionSchema = z.object({
  question_text: z.string().min(5),
  option_a: z.string().min(1),
  option_b: z.string().min(1),
  option_c: z.string().min(1),
  option_d: z.string().min(1),
  correct_option: z.enum(['a', 'b', 'c', 'd']),
  marks: z.number().positive().default(10),
  explanation: z.string().optional(),
});

export const submitAssessmentSchema = z.object({
  faculty_id: z.number().int().positive(),
  answers: z.record(z.string(), z.string()).optional(), // { [question_id]: selected_option }
  score: z.number().optional(),
  percentage: z.number().optional(),
});
