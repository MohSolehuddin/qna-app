import argon2 from "argon2";

export const verifyPassword = async (
  password: string,
  hashPassword: string,
): Promise<boolean> => {
  try {
    const isVerified = await argon2.verify(hashPassword, password);
    return isVerified;
  } catch (error) {
    throw error;
  }
};
