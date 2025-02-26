import { getPosts } from "@/actions/post.action";
import { getDbUserId } from "@/actions/user.action";
import CreatePost from "@/components/CreatePost";
import PostCard from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import WhoToFollow from "@/components/WhoToFollow";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import Image from "next/image";

export default async function Home() {
  // Se precisar de um atraso (não recomendado, a menos que seja necessário)
  // await new Promise((resolve) => setTimeout(resolve, 1000));

  // Executando as funções em paralelo para melhorar o desempenho
  const [user, posts, dbUserId] = await Promise.all([
    currentUser(),
    getPosts(),
    getDbUserId(),
  ]);

  // Revalida o cache apenas se necessário após obter os dados
  revalidatePath("/");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
      <div className="lg:col-span-6">
        {user && <CreatePost />}
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} dbUserId={dbUserId} />
          ))}
        </div>
      </div>
      <div className="hidden lg:block lg:col-span-4 sticky top-20">
        <WhoToFollow />
      </div>
    </div>
  );
}
