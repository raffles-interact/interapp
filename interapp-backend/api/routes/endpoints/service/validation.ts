import { AttendanceStatus } from '@db/entities';
import { z } from 'zod';

export const ServiceIdFields = z.object({
  service_id: z.coerce
    .number()
    .int()
    .nonnegative()
    .max(2 ** 32 - 1),
});

const validateStartEndTime = (value: { start_time?: string; end_time?: string }) => {
  if (!value.start_time || !value.end_time) return true;
  const startTime = new Date().setHours(
    ...(value.start_time.split(':').map((a) => parseInt(a)) as [number, number]),
  );
  const endTime = new Date().setHours(
    ...(value.end_time.split(':').map((a) => parseInt(a)) as [number, number]),
  );
  return startTime < endTime;
};

const _CreateServiceFields = z.object({
  name: z.string(),
  contact_email: z.string().email(),
  day_of_week: z.number().int().min(0).max(6),
  start_time: z.string().regex(/^([0-1]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/),
  end_time: z.string().regex(/^([0-1]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/),
  service_ic_username: z.string(),
  description: z.string().optional(),
  contact_number: z
    .number()
    .refine((n) => n.toString().length === 8)
    .optional(),
  website: z.string().optional(),
  promotional_image: z.string().optional(),
  enable_scheduled: z.boolean(),
  service_hours: z.number().int().nonnegative(),
});

export const UpdateServiceFields = z
  .object({
    ...ServiceIdFields.shape,
    ..._CreateServiceFields.partial().shape,
  })
  .refine(validateStartEndTime, 'start_time must be before end_time');

export const CreateServiceFields = _CreateServiceFields.refine(
  validateStartEndTime,
  'start_time must be before end_time',
);

export const ServiceSessionIdFields = z.object({
  service_session_id: z.coerce
    .number()
    .int()
    .nonnegative()
    .max(2 ** 32 - 1),
});

const validateServiceSessionStartEndTime = (value: { start_time?: string; end_time?: string }) => {
  if (!value.start_time || !value.end_time) return true;
  return new Date(value.start_time) < new Date(value.end_time);
};

const _CreateServiceSessionFields = z.object({
  service_id: z
    .number()
    .int()
    .nonnegative()
    .max(2 ** 32 - 1),
  start_time: z.string(),
  end_time: z.string(),
  ad_hoc_enabled: z.boolean(),
  service_hours: z.number().int().nonnegative(),
});

export const CreateServiceSessionFields = _CreateServiceSessionFields.refine(
  validateServiceSessionStartEndTime,
  'start_time must be before end_time',
);

export const UpdateServiceSessionFields = z
  .object({
    ...ServiceSessionIdFields.shape,
    ..._CreateServiceSessionFields.partial().shape,
  })
  .refine(validateServiceSessionStartEndTime, 'start_time must be before end_time');

export const AllServiceSessionsFields = z.object({
  ...ServiceIdFields.partial().shape,
  page: z.coerce.number().int().nonnegative(),
  page_size: z.coerce.number().int().nonnegative(),
});

export const ServiceSessionUserIdFields = z.object({
  service_session_id: z.coerce
    .number()
    .int()
    .nonnegative()
    .max(2 ** 32 - 1),
  username: z.string(),
});

export const ServiceSessionUserBulkFields = z.union([
  z.object({
    service_session_id: z.coerce
      .number()
      .int()
      .nonnegative()
      .max(2 ** 32 - 1),
  }),
  z.object({
    username: z.string(),
  }),
]);

const _ServiceSessionUserFields = z.object({
  ad_hoc: z.boolean(),
  attended: z.nativeEnum(AttendanceStatus),
  is_ic: z.boolean(),
});

export const CreateServiceSessionUserFields =
  ServiceSessionUserIdFields.merge(_ServiceSessionUserFields);

export const CreateBulkServiceSessionUserFields = z.object({
  service_session_id: z
    .number()
    .int()
    .nonnegative()
    .max(2 ** 32 - 1),
  users: z.array(
    z.object({
      username: z.string(),
      ad_hoc: z.boolean(),
      attended: z.nativeEnum(AttendanceStatus),
      is_ic: z.boolean(),
    }),
  ),
});

export const DeleteBulkServiceSessionUserFields = z.object({
  service_session_id: z
    .number()
    .int()
    .nonnegative()
    .max(2 ** 32 - 1),
  usernames: z.array(z.string()),
});

export const UpdateServiceSessionUserFields = ServiceSessionUserIdFields.merge(
  _ServiceSessionUserFields.partial(),
);

export const VerifyAttendanceFields = z.object({
  hash: z.string(),
});
