"use server";

import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getProfileByUsername } from "./profile.action";
import { Prisma } from "@prisma/client";

// Sincroniza o usuário com o banco de dados

// actions/user.action.ts
export async function syncUser() {
  try {
    const { userId } = await auth();

    const user = await currentUser();

    if (!user) return null;
    if (!userId) return syncUser();

    // Adiciona um pequeno atraso para garantir que o usuário esteja disponível no banco de dados

    const existingUser = await prisma.user.findUnique({
      where: {
        clerkId: userId,
      },
    });

    if (existingUser) {
      revalidatePath("/");
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

    revalidatePath("/"); //proximoa opção: set timeout (não commitado)

    return dbUser;
  } catch (error) {
    console.error("Error in syncUser:", error);
    throw new Error("error in sync user");
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
