import { UserRole } from "@prisma/client";
import prisma from "../../shared/prisma";
import * as bcrypt from "bcrypt";
import config from "../../config";
export const initiateSuperAdmin = async () => {
  const payload: any = {
    name: "Super Admin",
    email: "belalhossain22000@gmail.com",
    password: "12345678",
  };

  const isExistUser = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (isExistUser) return;
  const hashedPassword: string = await bcrypt.hash(
    payload.password,
    Number(config.bcrypt_salt_rounds)
  );
  await prisma.$transaction(async (transaction) => {
    await transaction.user.create({
      data: {
        email: payload.email,
        password: hashedPassword,
        role: UserRole.SUPER_ADMIN,
      },
    });

    await transaction.admin.create({
      data: {
        name: payload.name,
        email: payload.email,
      },
    });
  });
};
