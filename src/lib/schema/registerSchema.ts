import { z } from "zod";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_FILE_SIZE,
  MIN_NAME_LENGTH,
  MIN_PASSWORD_LENGTH,
} from "../constants";

export const registerInputSchema = z.object({
  name: z.string().min(MIN_NAME_LENGTH, {
    message: `Name must be at least ${MIN_NAME_LENGTH} characters.`,
  }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(MIN_PASSWORD_LENGTH, {
    message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
  }),
  image: z
    .custom<FileList>((file) => file instanceof FileList && file.length > 0, {
      message: "Image is required",
    })
    .refine(
      (file) => (file[0]?.size ?? 0) <= MAX_FILE_SIZE,
      "Image must be less than 1MB",
    )
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file[0]?.type ?? ""),
      "Only .jpg, .jpeg, .png and .gif formats are allowed",
    ),
});

export const registerDatabaseSchema = registerInputSchema.extend({
  username: z.string().min(3, { message: "Username is too short." }),
  password: z.string().min(8, { message: "Password is too short." }),
});
