"use server";

import { PrismaClient } from "@prisma/client";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { checkConnectivity } from "../utils/connectivityCheck";
import Home from "@/app/page";

const prisma = new PrismaClient();

// Sincroniza o usuário com o banco de dados

// actions/user.action.ts
export async function syncUser(retries = 3) {
  try {
    await checkConnectivity();

    const { userId } = await auth();
    const user = await currentUser();

    if (!user || !userId) {
      if (retries > 0) {
        await new Promise((res) => setTimeout(res, 500)); // Pequeno delay
        return await syncUser(retries - 1);
      }
      console.error("Max retries reached in syncUser.");
      return null;
    }

    const existingUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (existingUser) {
      return existingUser;
    }

    const dbUser = await prisma.user.create({
      data: {
        clerkId: userId,
        name: `${user.firstName || ""} ${user.lastName || ""}`,
        username:
          user.username ?? user.emailAddresses[0].emailAddress.split("@")[0],
        email: user.emailAddresses[0].emailAddress,
        image: user.imageUrl,
      },
    });

    return dbUser;
  } catch (error) {
    console.error("Error in syncUser:", error);
    if (retries > 0) {
      console.log(`Tentando novamente... (${retries} tentativas restantes)`);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Espera 1 segundo antes de tentar novamente
      return syncUser(retries - 1);
    }
    return null;
  }
}

// Obtém o usuário pelo clerkId
export async function getUserByClerkId(clerkId: string) {
  return await prisma.user.findUnique({
    where: {
      clerkId,
    },
    include: {
      _count: {
        select: {
          followers: true,
          following: true,
          posts: true,
        },
      },
    },
  });
}

// Obtém o ID do usuário no banco de dados
export async function getDbUserId() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return null;

    const user = await getUserByClerkId(clerkId);
    if (!user) {
      console.warn("Usuário não encontrado no banco de dados.");
      return null;
    }

    return user.id;
  } catch (error) {
    console.error("Erro ao buscar ID do usuário:", error);
    return null;
  }
}

// Obtém 3 usuários aleatórios para a seção "Quem seguir"
export async function getRandomUsers() {
  try {
    const userId = await getDbUserId();

    // Se não houver userId, retorne uma lista vazia
    if (!userId) return [];

    // Busque 3 usuários aleatórios, excluindo o próprio usuário e aqueles que ele já segue
    const randomUsers = await prisma.user.findMany({
      where: {
        AND: [
          { NOT: { id: userId } },
          {
            NOT: {
              followers: {
                some: {
                  followerId: userId,
                },
              },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        _count: {
          select: {
            followers: true,
          },
        },
      },
      take: 3,
    });

    return randomUsers;
  } catch (error) {
    console.error("Error fetching random users:", error);
    return [];
  }
}

// Alterna o estado de seguir/parar de seguir um usuário
export async function toggleFollow(targetUserId: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) return { success: false, error: "Usuário não autenticado" };

    if (userId === targetUserId) {
      throw new Error("Você não pode seguir a si mesmo");
    }

    const existingFollow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: targetUserId,
        },
      },
    });

    if (existingFollow) {
      await prisma.follows.delete({
        where: {
          followerId_followingId: {
            followerId: userId,
            followingId: targetUserId,
          },
        },
      });
    } else {
      await prisma.$transaction([
        prisma.follows.create({
          data: { followerId: userId, followingId: targetUserId },
        }),
        prisma.notification.create({
          data: { type: "FOLLOW", userId: targetUserId, creatorId: userId },
        }),
      ]);
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Erro ao alternar follow:", error);
    return { success: false, error: "Erro ao alternar follow" };
  }
}
