import { z } from 'zod';

export const ExportsFields = z
  .object({
    id: z.array(z.coerce.number()).or(z.coerce.number()),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
  })
  // add type checks before converting to the desired format
  .refine(
    (data) => {
      if (data.start_date) {
        return new Date(data.start_date) instanceof Date;
      }
      return true;
    },
    {
      message: 'start_date should be a valid date string',
      path: ['start_date'],
    },
  )
  .refine(
    (data) => {
      if (data.end_date) {
        return new Date(data.end_date) instanceof Date;
      }
      return true;
    },
    {
      message: 'end_date should be a valid date string',
      path: ['end_date'],
    },
  )

  .refine((data) => Boolean(data.start_date) === Boolean(data.end_date), {
    message: 'Either both start_date and end_date should be present, or none at all',
    path: ['start_date', 'end_date'],
  })
  .refine(
    (data) => {
      if (data.start_date && data.end_date) {
        return new Date(data.start_date) < new Date(data.end_date);
      }
      return true;
    },
    {
      message: 'start_date should be before end_date',
      path: ['start_date', 'end_date'],
    },
  )
  .transform((data) => ({
    ...data,
    id: Array.isArray(data.id) ? data.id : [data.id],
  }));
