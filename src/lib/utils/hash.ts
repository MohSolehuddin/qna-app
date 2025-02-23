import argon2 from "argon2";

export const hashPassword = async (password: string): Promise<string> => {
  try {
    const hash = await argon2.hash(password);
    return hash;
  } catch (error) {
    throw error;
  }
};
