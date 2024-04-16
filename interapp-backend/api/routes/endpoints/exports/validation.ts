import { z } from 'zod';

export const ExportsFields = z
  .object({
    id: z.array(z.coerce.number()).or(z.coerce.number()),
  })
  .transform((val) => (Array.isArray(val.id) ? val.id : [val.id]));
