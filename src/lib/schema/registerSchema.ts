import { z } from "zod";
import { MIN_NAME_LENGTH, MIN_PASSWORD_LENGTH } from "../constants";

export const registerInputSchema = z.object({
  name: z.string().min(MIN_NAME_LENGTH, {
    message: `Name must be at least ${MIN_NAME_LENGTH} characters.`,
  }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(MIN_PASSWORD_LENGTH, {
    message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
  }),
  image: z.any(),
});

export const registerDatabaseSchema = registerInputSchema.extend({
  username: z.string().min(3, { message: "Username is too short." }),
  password: z.string().min(8, { message: "Password is too short." }),
});
