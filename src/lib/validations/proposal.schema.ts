import { z } from 'zod';

export const submitProposalSchema = z.object({
  submitted_by: z.string().min(2, 'Submitter name is required'),
});

export const reviewProposalSchema = z.object({
  approver_name: z.string().min(2, 'Approver name is required'),
  approver_role: z.enum(['HOD', 'IQAC', 'DEAN', 'DIRECTOR']).default('HOD'),
  remarks: z.string().optional(),
});

export type SubmitProposalInput = z.infer<typeof submitProposalSchema>;
export type ReviewProposalInput = z.infer<typeof reviewProposalSchema>;
