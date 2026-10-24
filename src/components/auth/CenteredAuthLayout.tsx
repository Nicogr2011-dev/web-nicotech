import { Link } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import { PaletteDots } from "@/components/ui/PaletteDots";

/** Marco de las pantallas sueltas de cuenta (confirmar email): logo arriba y una tarjeta centrada. */
export function CenteredAuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(160deg,#eef2ff_0%,#f7f8fa_45%,#fef6ea_100%)] px-4 py-12 dark:bg-[linear-gradient(160deg,#141726_0%,#0a0c10_45%,#171310_100%)]">
      <div className="w-full max-w-[400px]">
        <div className="mb-5 text-center">
          <Link to="/" className="font-display text-2xl font-extrabold text-body">
            Nico<span className="text-azure">tech</span>
          </Link>
          <div className="mt-2.5 flex justify-center">
            <PaletteDots size={7} />
          </div>
        </div>

        <Card className="p-8 text-center" style={{ animation: "card-in 0.35s ease-out" }}>
          {children}
        </Card>
      </div>
    </div>
  );
}
