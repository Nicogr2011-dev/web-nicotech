import { Link } from "react-router-dom";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-mist px-4 py-12">
      <Link to="/" className="mb-8 font-display text-2xl font-extrabold text-ink">
        Nico<span className="text-azure">tech</span>
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
