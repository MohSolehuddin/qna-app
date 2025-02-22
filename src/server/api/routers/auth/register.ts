import argon2 from "argon2";
import { uploadToCloudinary } from "~/lib/cloudinary";
import { registerInputSchema } from "~/lib/schema/registerSchema";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const registerRouter = createTRPCRouter({
  register: publicProcedure
    .input(registerInputSchema)
    .mutation(async ({ ctx, input }) => {
      console.log("this code is running well for adding user");

      let imageUrl: string | null = null;
      console.log(input.image);
      if (input.image) {
        const base64Data = input.image.split(",")[1]; // Ambil data setelah "data:image/png;base64,"
        const imageBuffer = Buffer.from(base64Data, "base64"); // Konversi ke Buffer
        imageUrl = await uploadToCloudinary(imageBuffer);
      }

      const password = await argon2.hash(input.password);

      const user = await ctx.db.user.create({
        data: {
          name: input.name,
          username:
            input.email.split("@")[0] ?? input.name + new Date().getTime(),
          email: input.email,
          password,
          image: imageUrl,
        },
      });
      const expires_at = new Date().getTime() + 1 * 30;

      await ctx.db.account.create({
        data: {
          userId: user.id,
          type: "credentials",
          provider: "credentials",
          providerAccountId: `${user.name}-${user.id}`,
          access_token: `oke-${user.id}`,
        },
      });
      return user;
    }),
});
