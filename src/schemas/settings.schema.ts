import { z } from "zod";

export const userSettingsSchema = z.object({
  firstName: z.string().min(2, {
    // First name must be at least 2 characters long
    message: "First name must be at least 2 characters long.",
  }),
  lastName: z.string().min(2, {
    // Last name must be at least 2 characters long
    message: "Last name must be at least 2 characters long.",
  }),
});
