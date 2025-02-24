import { db } from "~/server/db";

const generateUsername = (name: string) => {
  return name?.split(" ").join("");
};

const generateUniqueUsername = async (name: string) => {
  let count = 1;
  let username = generateUsername(name);
  let userExists = await db.user.findUnique({
    where: { username },
  });

  while (userExists) {
    username = `${generateUsername(name)}${count}`;
    userExists = await db.user.findUnique({
      where: { username },
    });
    count++;
  }

  return username;
};

export default generateUniqueUsername;
