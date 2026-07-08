import { useRef, useState } from "react";
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

const LOGO_TEXT = "Nicotech".split("");
const LOGO_PALETTE = ["#ff5c5c", "#ffc93c", "#2ec4b6", "#3a86ff", "#8338ec", "#ff6fb5"];
const LOGO_CLICKS_NEEDED = 10;
const LOGO_CLICK_WINDOW_MS = 1200;

function LogoMark({ dancing }: { dancing: boolean }) {
  if (!dancing) {
    return (
      <span className="font-display text-xl font-extrabold tracking-tight text-body">
        Nico<span className="text-azure">tech</span>
      </span>
    );
  }
  return (
    <span className="font-display text-xl font-extrabold tracking-tight text-body">
      {LOGO_TEXT.map((char, i) => (
        <span
          key={i}
          className="inline-block"
          style={{
            color: LOGO_PALETTE[i % LOGO_PALETTE.length],
            animation: `letter-dance 0.6s ease-in-out ${i * 0.05}s 3`,
          }}
        >
          {char}
        </span>
      ))}
    </span>
  );
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
  const [logoDancing, setLogoDancing] = useState(false);
  const logoClicksRef = useRef(0);
  const lastLogoClickRef = useRef(0);

  function handleLogoClick() {
    const now = Date.now();
    if (now - lastLogoClickRef.current > LOGO_CLICK_WINDOW_MS) {
      logoClicksRef.current = 0;
    }
    lastLogoClickRef.current = now;
    logoClicksRef.current += 1;

    if (logoClicksRef.current >= LOGO_CLICKS_NEEDED) {
      logoClicksRef.current = 0;
      setLogoDancing(true);
      window.setTimeout(() => setLogoDancing(false), 2000);
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-surface/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link to={authed ? "/dashboard" : "/"} className="flex flex-col items-center" onClick={handleLogoClick}>
          <LogoMark dancing={logoDancing} />
          <PaletteDots />
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            to="/instalar"
            className="hidden items-center gap-1 text-sm font-medium text-muted hover:text-body sm:flex"
          >
            <DownloadIcon size={15} />
            ¡Descárgalo!
          </Link>

          {authed ? (
            <>
              <Link to="/precios" className="hidden text-sm font-medium text-muted hover:text-body sm:inline">
                Precios
              </Link>
              <Link to="/cuenta" className="hidden text-sm font-medium text-muted hover:text-body sm:inline">
                Mi cuenta
              </Link>
              <Link to="/contacto" className="hidden text-sm font-medium text-muted hover:text-body sm:inline">
                Contacto
              </Link>
              <Link to="/" className="hidden text-sm font-medium text-muted hover:text-body sm:inline">
                Ver la web
              </Link>
              <UserMenu userName={userName} tier={tier} avatarUrl={avatarUrl} />
            </>
          ) : (
            <>
              <button onClick={scrollToHowItWorks} className="hidden text-sm font-medium text-muted hover:text-body sm:inline">
                Cómo funciona
              </button>
              <Link to="/precios" className="hidden text-sm font-medium text-muted hover:text-body sm:inline">
                Precios
              </Link>
              <Link to="/login" className="hidden text-sm font-medium text-muted hover:text-body sm:inline">
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
            className="flex items-center justify-center rounded-full p-2 text-body hover:bg-body/5 sm:hidden"
          >
            {mobileOpen ? <CloseIcon size={22} /> : <MenuIcon size={22} />}
          </button>
        </div>
      </nav>

      {mobileOpen ? (
        <div className="border-t border-hairline bg-surface px-4 py-3 sm:hidden">
          <div className="flex flex-col divide-y divide-hairline">
            {authed ? (
              <>
                {userName ? (
                  <div className="flex items-center justify-between py-3">
                    <span className="flex items-center gap-2">
                      <Avatar name={userName} avatarUrl={avatarUrl} size={26} />
                      <span className="text-sm font-medium text-muted">{userName}</span>
                    </span>
                    {tier ? <TierBadge tier={tier} /> : null}
                  </div>
                ) : null}
                <Link to="/" onClick={() => setMobileOpen(false)} className="py-3 text-sm font-medium text-body">
                  Ver la web
                </Link>
                <Link to="/instalar" onClick={() => setMobileOpen(false)} className="py-3 text-sm font-medium text-body">
                  ¡Descárgalo!
                </Link>
                <Link to="/precios" onClick={() => setMobileOpen(false)} className="py-3 text-sm font-medium text-body">
                  Precios
                </Link>
                <Link to="/cuenta" onClick={() => setMobileOpen(false)} className="py-3 text-sm font-medium text-body">
                  Mi cuenta
                </Link>
                <Link to="/contacto" onClick={() => setMobileOpen(false)} className="py-3 text-sm font-medium text-body">
                  Contacto
                </Link>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    scrollToHowItWorks();
                    setMobileOpen(false);
                  }}
                  className="py-3 text-left text-sm font-medium text-body"
                >
                  Cómo funciona
                </button>
                <Link to="/precios" onClick={() => setMobileOpen(false)} className="py-3 text-sm font-medium text-body">
                  Precios
                </Link>
                <Link to="/instalar" onClick={() => setMobileOpen(false)} className="py-3 text-sm font-medium text-body">
                  ¡Descárgalo!
                </Link>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="py-3 text-sm font-medium text-body">
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
