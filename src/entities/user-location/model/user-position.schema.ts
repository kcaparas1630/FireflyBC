// A position from the browser's Geolocation API, checked before it enters the store (ADR 027, convention 008).
import { z } from 'zod';

export const userPositionSchema = z.object({
  lng: z.number().min(-180).max(180),
  lat: z.number().min(-90).max(90),
});

export type UserPosition = z.infer<typeof userPositionSchema>;
