import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { TierBadge } from "@/components/nav/TierBadge";

export function UserMenu({ userName, tier }: { userName?: string; tier?: "BASICO" | "PREMIUM" }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await logout();
    navigate("/");
  }

  return (
    <div className="flex items-center gap-3">
      {userName ? (
        <span className="hidden items-center gap-2 sm:flex">
          <span className="text-sm font-medium text-slate">{userName}</span>
          {tier ? <TierBadge tier={tier} /> : null}
        </span>
      ) : null}
      <button
        onClick={handleSignOut}
        className="rounded-full bg-ink/5 px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-ink/10"
      >
        Cerrar sesión
      </button>
    </div>
  );
}
