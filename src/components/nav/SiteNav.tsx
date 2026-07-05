import { Link } from "react-router-dom";
import { ButtonLink } from "@/components/ui/Button";
import { PaletteDots } from "@/components/ui/PaletteDots";
import { DownloadIcon } from "@/components/ui/Icon";
import { UserMenu } from "@/components/nav/UserMenu";

function scrollToHowItWorks() {
  document.getElementById("como-funciona")?.scrollIntoView({ behavior: "smooth" });
}

export function SiteNav({
  authed = false,
  userName,
  tier,
}: {
  authed?: boolean;
  userName?: string;
  tier?: "BASICO" | "PREMIUM";
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link to={authed ? "/dashboard" : "/"} className="flex flex-col items-center">
          <span className="font-display text-xl font-extrabold tracking-tight text-ink">
            Nico<span className="text-azure">tech</span>
          </span>
          <PaletteDots />
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            to="/instalar"
            className="hidden items-center gap-1 text-sm font-medium text-slate hover:text-ink sm:flex"
          >
            <DownloadIcon size={15} />
            ¡Descárgalo!
          </Link>

          {authed ? (
            <UserMenu userName={userName} tier={tier} />
          ) : (
            <>
              <button onClick={scrollToHowItWorks} className="hidden text-sm font-medium text-slate hover:text-ink sm:inline">
                Cómo funciona
              </button>
              <Link to="/login" className="text-sm font-medium text-slate hover:text-ink">
                Iniciar sesión
              </Link>
              <ButtonLink href="/register" className="px-5 py-2.5 text-sm">
                Crear cuenta gratis
              </ButtonLink>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
