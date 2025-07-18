import { z } from "zod";

export const userSettingsSchema = z.object({
  firstName: z.string().min(2, {
    message: "A keresztnévnek legalább 2 karakter hosszúnak kell lennie.",
  }),
  lastName: z.string().min(2, {
    message: "A vezetéknévnek legalább 2 karakter hosszúnak kell lennie.",
  }),
});
