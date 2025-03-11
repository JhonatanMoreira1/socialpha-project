// app/page.tsx
import { getPosts } from "@/actions/post.action";
import { getDbUserId } from "@/actions/user.action";
import CreatePost from "@/components/CreatePost";
import PostCard from "@/components/PostCard";
import WhoToFollow from "@/components/WhoToFollow";
import { currentUser } from "@clerk/nextjs/server";

export default async function Home() {
  try {
    const user = await currentUser();
    const dbUserId = await getDbUserId();
    const posts = await getPosts();

    // Você pode exibir uma mensagem de erro ou redirecionar para uma página de erro
    return (
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        <div className="lg:col-span-6">
          {/* Exibe o CreatePost apenas se o usuário estiver logado */}
          {user && dbUserId ? <CreatePost /> : null}

          <div className="space-y-6">
            {/* Exibe os posts independentemente de haver um usuário logado */}
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
  } catch (error) {
    return Home();
  }
}
