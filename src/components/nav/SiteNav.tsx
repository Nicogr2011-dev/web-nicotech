import { useState } from "react";
import { Link } from "react-router-dom";
import { ButtonLink } from "@/components/ui/Button";
import { PaletteDots } from "@/components/ui/PaletteDots";
import { DownloadIcon, MenuIcon, CloseIcon } from "@/components/ui/Icon";
import { UserMenu } from "@/components/nav/UserMenu";
import { TierBadge } from "@/components/nav/TierBadge";
import { Avatar } from "@/components/ui/Avatar";

function scrollToHowItWorks() {
  document.getElementById("como-funciona")?.scrollIntoView({ behavior: "smooth" });
}

export function SiteNav({
  authed = false,
  userName,
  tier,
  avatarUrl,
}: {
  authed?: boolean;
  userName?: string;
  tier?: "BASICO" | "PREMIUM" | "PREMIUM_LITE";
  avatarUrl?: string | null;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

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
            <>
              <Link to="/precios" className="hidden text-sm font-medium text-slate hover:text-ink sm:inline">
                Precios
              </Link>
              <Link to="/cuenta" className="hidden text-sm font-medium text-slate hover:text-ink sm:inline">
                Mi cuenta
              </Link>
              <Link to="/" className="hidden text-sm font-medium text-slate hover:text-ink sm:inline">
                Ver la web
              </Link>
              <UserMenu userName={userName} tier={tier} avatarUrl={avatarUrl} />
            </>
          ) : (
            <>
              <button onClick={scrollToHowItWorks} className="hidden text-sm font-medium text-slate hover:text-ink sm:inline">
                Cómo funciona
              </button>
              <Link to="/precios" className="hidden text-sm font-medium text-slate hover:text-ink sm:inline">
                Precios
              </Link>
              <Link to="/login" className="hidden text-sm font-medium text-slate hover:text-ink sm:inline">
                Iniciar sesión
              </Link>
              <ButtonLink href="/register" className="!hidden px-5 py-2.5 text-sm sm:!inline-flex">
                Crear cuenta gratis
              </ButtonLink>
            </>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
            className="flex items-center justify-center rounded-full p-2 text-ink hover:bg-ink/5 sm:hidden"
          >
            {mobileOpen ? <CloseIcon size={22} /> : <MenuIcon size={22} />}
          </button>
        </div>
      </nav>

      {mobileOpen ? (
        <div className="border-t border-black/5 bg-white px-4 py-3 sm:hidden">
          <div className="flex flex-col divide-y divide-black/5">
            {authed ? (
              <>
                {userName ? (
                  <div className="flex items-center justify-between py-3">
                    <span className="flex items-center gap-2">
                      <Avatar name={userName} avatarUrl={avatarUrl} size={26} />
                      <span className="text-sm font-medium text-slate">{userName}</span>
                    </span>
                    {tier ? <TierBadge tier={tier} /> : null}
                  </div>
                ) : null}
                <Link to="/" onClick={() => setMobileOpen(false)} className="py-3 text-sm font-medium text-ink">
                  Ver la web
                </Link>
                <Link to="/instalar" onClick={() => setMobileOpen(false)} className="py-3 text-sm font-medium text-ink">
                  ¡Descárgalo!
                </Link>
                <Link to="/precios" onClick={() => setMobileOpen(false)} className="py-3 text-sm font-medium text-ink">
                  Precios
                </Link>
                <Link to="/cuenta" onClick={() => setMobileOpen(false)} className="py-3 text-sm font-medium text-ink">
                  Mi cuenta
                </Link>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    scrollToHowItWorks();
                    setMobileOpen(false);
                  }}
                  className="py-3 text-left text-sm font-medium text-ink"
                >
                  Cómo funciona
                </button>
                <Link to="/precios" onClick={() => setMobileOpen(false)} className="py-3 text-sm font-medium text-ink">
                  Precios
                </Link>
                <Link to="/instalar" onClick={() => setMobileOpen(false)} className="py-3 text-sm font-medium text-ink">
                  ¡Descárgalo!
                </Link>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="py-3 text-sm font-medium text-ink">
                  Iniciar sesión
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="py-3 text-sm font-semibold text-azure">
                  Crear cuenta gratis
                </Link>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
