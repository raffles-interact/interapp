import { z } from 'zod';

export const AnnouncementIdFields = z.object({
  announcement_id: z.coerce
    .number()
    .int()
    .nonnegative()
    .max(2 ** 32 - 1),
});

export const CreateAnnouncementFields = z.object({
  creation_date: z.string(),
  title: z.string(),
  description: z.string(),
  username: z.string(),
  image: z.string().optional(),
});

export const UpdateAnnouncementFields = z.object({
  ...AnnouncementIdFields.shape,
  ...CreateAnnouncementFields.partial().shape,
});

export const PaginationFields = z.object({
  page: z.coerce.number().int().nonnegative(),
  page_size: z.coerce.number().int().nonnegative(),
});

export const AnnouncementCompletionFields = AnnouncementIdFields.extend({
  completed: z.boolean(),
});
