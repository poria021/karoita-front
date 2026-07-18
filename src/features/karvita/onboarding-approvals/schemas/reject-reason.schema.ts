import { z } from 'zod';

export const rejectReasonSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, 'لطفاً علت نقص یا عدم تایید مدارک را بنویسید یا انتخاب کنید.'),
});

export type RejectReasonFormValues = z.infer<typeof rejectReasonSchema>;
