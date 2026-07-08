import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FolderIcon } from "@/components/ui/Icon";

export function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <Card className="flex flex-col items-center gap-4 px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-azure/10">
        <FolderIcon size={26} color="#3a86ff" />
      </div>
      <div>
        <h3 className="font-display text-xl font-bold text-body">Aún no tienes suscripciones registradas</h3>
        <p className="mt-1 text-sm text-muted">Añade la primera para empezar a organizarlas.</p>
      </div>
      <Button onClick={onAdd}>+ Añadir suscripción</Button>
    </Card>
  );
}
