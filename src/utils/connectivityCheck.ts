import { PrismaClient } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

export async function checkConnectivity() {
  try {
    await auth();
    await prisma.$connect();
  } catch (error) {
    console.error("Erro de conectividade:", error);
    throw new Error("Erro de conectividade com Clerk ou NeonDB");
  }
}
