import { z } from 'zod';
import { Permissions } from '@utils/permissions';

export const OptionalUsername = z.object({
  username: z.string().min(5).optional(),
});

export const RequiredUsername = z.object({
  username: z.string().min(5),
});

export const ChangePasswordFields = z.object({
  old_password: z.string(),
  new_password: z.string(),
});

export const ChangeEmailFields = OptionalUsername.extend({
  new_email: z
    .string()
    .refine((value) => !new RegExp(process.env.SCHOOL_EMAIL_REGEX!).test(value), {
      message: 'Email must not be school email',
    }),
});

export const TokenFields = z.object({
  token: z.string(),
});

export const PermissionsFields = RequiredUsername.extend({
  permissions: z
    .nativeEnum(Permissions)
    .array()
    .nonempty()
    .refine((value) => value.includes(Permissions.VISTOR), {
      message: 'Permissions must include the visitor permission',
    }),
});

export const ServiceIdFieldsNumeric = RequiredUsername.extend({
  service_id: z
    .number()
    .int()
    .nonnegative()
    .max(2 ** 32 - 1),
});

export const ServiceHoursFields = OptionalUsername.extend({
  hours: z.number().int().nonnegative(),
});

export const ServiceHoursBulkFields = z.array(
  z.object({
    username: z.string().min(5),
    hours: z.number().int(),
  }),
);

export const UpdateUserServicesFields = z.object({
  service_id: z
    .number()
    .int()
    .nonnegative()
    .max(2 ** 32 - 1),
  data: z
    .object({
      action: z.enum(['add', 'remove']),
      username: z.string().min(5),
    })
    .array(),
});

export const ProfilePictureFields = z.object({
  profile_picture: z.string(),
});
