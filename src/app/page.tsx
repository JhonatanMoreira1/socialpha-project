// app/page.tsx
import { getPosts } from "@/actions/post.action";
import { getDbUserId, syncUser } from "@/actions/user.action";
import CreatePost from "@/components/CreatePost";
import PostCard from "@/components/PostCard";
import WhoToFollow from "@/components/WhoToFollow";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import NotFound from "./not-found";

export default async function Home() {
  const user = await currentUser();

  // Verifique se o usuário está autenticado
  if (!user) {
    return redirect("/"); // Redireciona para a página de login
  }

  // Verifique se o usuário já está sincronizado
  let dbUserId = await getDbUserId();
  if (!dbUserId) {
    // Se o usuário não estiver sincronizado, tente sincronizá-lo
    const syncedUser = await syncUser();
    if (!syncedUser) {
      // Se a sincronização falhar, redirecione para uma página de erro
      return NotFound;
    }
    // Após a sincronização, obtenha o ID do usuário novamente
    dbUserId = await getDbUserId();
  }

  // Obtenha os posts
  const posts = await getPosts();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
      <div className="lg:col-span-6">
        {user ? <CreatePost /> : null}

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
