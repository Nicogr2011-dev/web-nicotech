import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { UserMenu } from "@/components/nav/UserMenu";

export function SiteNav({ authed = false, userName }: { authed?: boolean; userName?: string }) {
  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href={authed ? "/dashboard" : "/"} className="font-display text-xl font-extrabold tracking-tight text-ink">
          Nico<span className="text-azure">tech</span>
        </Link>

        {authed ? (
          <UserMenu userName={userName} />
        ) : (
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="#como-funciona" className="hidden text-sm font-medium text-slate hover:text-ink sm:inline">
              Cómo funciona
            </Link>
            <Link href="/login" className="text-sm font-medium text-slate hover:text-ink">
              Iniciar sesión
            </Link>
            <ButtonLink href="/register" className="px-5 py-2.5 text-sm">
              Crear cuenta gratis
            </ButtonLink>
          </div>
        )}
      </nav>
    </header>
  );
}
