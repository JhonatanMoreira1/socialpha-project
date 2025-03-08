"use server";

import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getProfileByUsername } from "./profile.action";
import { Prisma } from "@prisma/client";

// Sincroniza o usuário com o banco de dados

async function findUserInClerkWithRetry(
  userId: string,
  retries = 3,
  delay = 500
): Promise<any> {
  for (let i = 0; i < retries; i++) {
    const user = await currentUser();
    if (user && user.id === userId) return user; // Retorna o usuário se encontrado
    await new Promise((resolve) => setTimeout(resolve, delay)); // Aguarda antes de tentar novamente
  }
  return null; // Retorna null se o usuário não for encontrado após as retentativas
}

// actions/user.action.ts
export async function syncUser() {
  try {
    const { userId } = await auth();

    if (!userId) return null;

    const clerkUser = await findUserInClerkWithRetry(userId);

    if (!clerkUser) return null;

    // Adiciona um pequeno atraso para garantir que o usuário esteja disponível no banco de dados

    const existingUser = await prisma.user.findUnique({
      where: {
        clerkId: userId,
      },
    });

    if (existingUser) return existingUser;

    const dbUser = await prisma.user.create({
      data: {
        clerkId: userId,
        name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`,
        username:
          clerkUser.username ??
          clerkUser.emailAddresses[0].emailAddress.split("@")[0],
        email: clerkUser.emailAddresses[0].emailAddress,
        image: clerkUser.imageUrl,
      },
    });

    revalidatePath("/"); //proximoa opção: set timeout

    return dbUser;
  } catch (error) {
    console.error("Error in syncUser:", error);
    throw new Error("error in sync user");
  }
}

// Obtém o usuário pelo clerkId
export async function getUserByClerkId(clerkId: string) {
  const user = await prisma.user.findUnique({
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
  return user;
}

// Obtém o ID do usuário no banco de dados
export async function getDbUserId() {
  try {
    const { userId: clerkId } = await auth();

    // Se não houver clerkId, retorne null
    if (!clerkId) return null;

    // Busque o usuário no banco de dados
    const user = await getUserByClerkId(clerkId);

    // Se o usuário não for encontrado, retorne null
    if (!user) return null;

    return user.id;
  } catch (error) {
    console.error("Error in getDbUserId:", error);
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

    // Se não houver userId, retorne
    if (!userId) return;

    // Impede que o usuário siga a si mesmo
    if (userId === targetUserId) throw new Error("You cannot follow yourself");

    // Verifique se o usuário já segue o alvo
    const existingFollow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: targetUserId,
        },
      },
    });

    if (existingFollow) {
      // Deixar de seguir
      await prisma.follows.delete({
        where: {
          followerId_followingId: {
            followerId: userId,
            followingId: targetUserId,
          },
        },
      });
    } else {
      // Seguir
      await prisma.$transaction([
        prisma.follows.create({
          data: {
            followerId: userId,
            followingId: targetUserId,
          },
        }),
        prisma.notification.create({
          data: {
            type: "FOLLOW",
            userId: targetUserId, // Usuário sendo seguido
            creatorId: userId, // Usuário que está seguindo
          },
        }),
      ]);
    }

    // Revalide o cache da página inicial
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Error in toggleFollow:", error);
    return { success: false, error: "Error toggling follow" };
  }
}
