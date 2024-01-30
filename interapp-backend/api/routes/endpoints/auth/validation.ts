import { z } from 'zod';

export const SignupFields = z.object({
  user_id: z
    .number()
    .int()
    .nonnegative()
    .max(2 ** 32 - 1),
  username: z.string().min(5),
  email: z.string().refine((value) => !new RegExp(process.env.SCHOOL_EMAIL_REGEX!).test(value), {
    message: 'Email does not match the required pattern',
  }),
  password: z.string(),
});

export type SignupFields = z.infer<typeof SignupFields>;

export const SigninFields = z.object({
  username: z.string(),
  password: z.string(),
});

export type SigninFields = z.infer<typeof SigninFields>;
