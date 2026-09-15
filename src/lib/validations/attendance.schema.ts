import { z } from 'zod';

export const attendanceRecordSchema = z.object({
  event_id: z.number().int().positive(),
  session_id: z.number().int().positive().optional().nullable(),
  faculty_id: z.number().int().positive().optional().nullable(),
  registration_id: z.number().int().positive().optional().nullable(),
  attendance_status: z.enum(['PRESENT', 'ABSENT']).default('PRESENT'),
  attendance_method: z.enum(['MANUAL', 'QR']).default('MANUAL'),
});

export const qrCheckInSchema = z.object({
  qr_token: z.string().min(3, 'QR token is required'),
  session_id: z.number().int().positive().optional().nullable(),
  event_id: z.number().int().positive().optional().nullable(),
});

export const bulkAttendanceSchema = z.object({
  event_id: z.number().int().positive(),
  session_id: z.number().int().positive(),
  attendees: z.array(z.object({
    faculty_id: z.number().int().positive().optional().nullable(),
    registration_id: z.number().int().positive().optional().nullable(),
    attendance_status: z.enum(['PRESENT', 'ABSENT']),
  })),
});
