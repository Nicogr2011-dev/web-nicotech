import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";

export function UserMenu({ userName }: { userName?: string }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await logout();
    navigate("/");
  }

  return (
    <div className="flex items-center gap-3">
      {userName ? <span className="hidden text-sm font-medium text-slate sm:inline">{userName}</span> : null}
      <button
        onClick={handleSignOut}
        className="rounded-full bg-ink/5 px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-ink/10"
      >
        Cerrar sesión
      </button>
    </div>
  );
}
