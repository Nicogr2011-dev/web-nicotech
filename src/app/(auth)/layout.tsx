import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-mist px-4 py-12">
      <Link href="/" className="mb-8 font-display text-2xl font-extrabold text-ink">
        Nico<span className="text-azure">tech</span>
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
