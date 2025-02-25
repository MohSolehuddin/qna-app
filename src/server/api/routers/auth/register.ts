import argon2 from "argon2";
// import { uploadToCloudinary } from "~/lib/cloudinary";
import { registerInputSchema } from "~/lib/schema/registerSchema";
import generateUniqueUsername from "~/lib/utils/generateUniqueUsername";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const registerRouter = createTRPCRouter({
  register: publicProcedure
    .input(registerInputSchema)
    .mutation(async ({ ctx, input }) => {
      console.log("this code is running well for adding user");

      const imageUrl: string | null = null;
      console.log("Image input", input.image);
      // if (input.image) {
      //   const base64Data = input.image.split(",")[1]; // Ambil data setelah "data:image/png;base64,"
      //   const imageBuffer = Buffer.from(base64Data, "base64"); // Konversi ke Buffer
      //   imageUrl = await uploadToCloudinary(imageBuffer);
      // }

      const username = await generateUniqueUsername(input.name);
      const password = await argon2.hash(input.password);

      const user = await ctx.db.user.create({
        data: {
          name: input.name,
          username,
          email: input.email,
          password,
          image: imageUrl,
        },
      });

      await ctx.db.account.create({
        data: {
          userId: user.id,
          type: "credentials",
          provider: "credentials",
        },
      });
      return user;
    }),
});
