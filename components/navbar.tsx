import Link from "next/link";
import { UserMenu } from "@/components/user-menu";
import { getCurrentUser } from "@/lib/auth";

export async function Navbar() {
  const user = await getCurrentUser();

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-8">
        <Link href="/dashboard" className="text-xl font-bold tracking-tight">
          SlugShare
        </Link>
        {user && <UserMenu user={user} />}
      </div>
    </header>
  );
}