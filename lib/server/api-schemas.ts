import { z } from "zod";

export const learningProgressRequestSchema = z.object({
  courseId: z.string().trim().min(1).max(120),
  lessonId: z.string().trim().min(1).max(120),
  lessonIndex: z.number().int().min(0).max(500).optional(),
  previousLessonId: z.string().trim().max(120).nullable().optional(),
  totalLessons: z.number().int().min(1).max(1000).optional(),
  durationMinutes: z.number().finite().min(0).max(240).optional(),
  markComplete: z.boolean().optional(),
});

export const learningProgressResponseSchema = z.object({
  progressPercent: z.number().int().min(0).max(100),
  completedLessons: z.number().int().min(0).optional(),
  xpAwarded: z.number().int().optional(),
  optimistic: z.boolean().optional(),
});

export const quizAnswerSchema = z.object({
  qId: z.string().trim().min(1).max(64),
  ans: z.string().trim().min(1).max(8),
});

export const quizSubmitRequestSchema = z.object({
  courseId: z.string().trim().min(1).max(120),
  lessonId: z.string().trim().max(120).optional(),
  answers: z.array(quizAnswerSchema).max(100).default([]),
});

export const quizSubmitResponseSchema = z.object({
  ok: z.boolean(),
  percent: z.number().int().min(0).max(100),
  passed: z.boolean(),
  xpAwarded: z.number().int().min(0).optional(),
});

export function jsonFromSchema<T extends z.ZodTypeAny>(
  schema: T,
  value: unknown,
  init?: ResponseInit
) {
  return Response.json(schema.parse(value), init);
}
