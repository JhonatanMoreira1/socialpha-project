// app/page.tsx
import { getPosts } from "@/actions/post.action";
import { getDbUserId, syncUser } from "@/actions/user.action";
import CreatePost from "@/components/CreatePost";
import PostCard from "@/components/PostCard";
import WhoToFollow from "@/components/WhoToFollow";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/dist/server/api-utils";

export default async function Home() {
  const user = await currentUser();
  const dbUserId = await getDbUserId();

  try {
    // Se o usuário estiver logado mas não estiver sincronizado, sincronize-o
    if (user && !dbUserId) {
      await syncUser();
    }
  } catch (error) {
    console.error("Error in syncUser2:", error);

    // Você pode exibir uma mensagem de erro ou redirecionar para uma página de erro
  } finally {
    const posts = await getPosts();
    return (
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        <div className="lg:col-span-6">
          {/* Exibe o CreatePost apenas se o usuário estiver logado */}
          {user && dbUserId ? <CreatePost /> : null}

          <div className="space-y-6">
            {/* Exibe os posts, independentemente de haver um usuário logado */}
            {posts.map((post) => (
              <PostCard key={post.id} post={post} dbUserId={dbUserId} />
            ))}
          </div>
        </div>

        <div className="hidden lg:block lg:col-span-4 sticky top-20">
          {/* Exibe o WhoToFollow apenas se o usuário estiver logado */}
          {user && dbUserId ? <WhoToFollow /> : null}
        </div>
      </div>
    );
  }
}
