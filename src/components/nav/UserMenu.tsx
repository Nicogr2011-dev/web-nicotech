"use client";

import { signOut } from "next-auth/react";

export function UserMenu({ userName }: { userName?: string }) {
  return (
    <div className="flex items-center gap-3">
      {userName ? <span className="hidden text-sm font-medium text-slate sm:inline">{userName}</span> : null}
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="rounded-full bg-ink/5 px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-ink/10"
      >
        Cerrar sesión
      </button>
    </div>
  );
}
