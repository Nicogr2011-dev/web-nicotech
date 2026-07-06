import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CHANGELOG, CURRENT_VERSION, formatVersion } from "@/lib/changelog";

export function Changelog() {
  const [open, setOpen] = useState(false);
  const older = [...CHANGELOG].reverse().slice(1);

  return (
    <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <h2 className="text-center font-display text-3xl font-extrabold text-ink">Qué ha cambiado</h2>
      <p className="mt-2 text-center text-sm text-slate">Versión actual: {formatVersion(CURRENT_VERSION)}</p>

      <Card className="mt-8 p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display font-bold text-ink">{CURRENT_VERSION.title}</h3>
            <p className="mt-1 text-sm text-slate">{CURRENT_VERSION.description}</p>
          </div>
          <Badge
            tone={CURRENT_VERSION.confidential ? "danger" : CURRENT_VERSION.type === "MAJOR" ? "active" : "pending"}
          >
            {formatVersion(CURRENT_VERSION)}
          </Badge>
        </div>
      </Card>

      <div className="mt-4 text-center">
        <button
          onClick={() => setOpen((v) => !v)}
          className="text-sm font-semibold text-azure hover:underline"
        >
          {open ? "Ocultar historial de versiones" : "Ver todas las versiones"}
        </button>
      </div>

      {open ? (
        <div className="mt-6 space-y-3">
          {older.map((entry) => (
            <Card key={formatVersion(entry)} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-display text-sm font-bold text-ink">{entry.title}</h4>
                  <p className="mt-1 text-sm text-slate">{entry.description}</p>
                </div>
                <Badge tone={entry.confidential ? "danger" : entry.type === "MAJOR" ? "active" : "pending"}>
                  {formatVersion(entry)}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      ) : null}
    </section>
  );
}
