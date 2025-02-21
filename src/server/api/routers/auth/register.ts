import { uploadToCloudinary } from "~/lib/cloudinary";
import { registerInputSchema } from "~/lib/schema/registerSchema";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const registerRouter = createTRPCRouter({
  register: publicProcedure
    .input(registerInputSchema)
    .mutation(async ({ ctx, input }) => {
      const imageBuffer = Buffer.from(input.image[0], "base64");

      const image = await uploadToCloudinary(imageBuffer);

      return ctx.db.user.create({
        data: {
          name: input.name,
          username:
            input.email.split("@")[0] ?? input.name + new Date().getTime(),
          email: input.email,
          password: input.password,
          image,
        },
      });
    }),
});
