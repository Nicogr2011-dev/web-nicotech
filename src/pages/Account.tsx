import { useRef, useState } from "react";
import { SiteNav } from "@/components/nav/SiteNav";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, IconInput } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import { PersonIcon, MailIcon, LockIcon } from "@/components/ui/Icon";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useAuth } from "@/lib/AuthContext";
import { ADMIN_EMAIL } from "@/lib/admin";
import { subscribeToCallPush } from "@/lib/webpush";

type Message = { type: "ok" | "error"; text: string };

function InlineMessage({ message }: { message: Message | null }) {
  if (!message) return null;
  return <p className={`text-sm ${message.type === "error" ? "text-coral" : "text-mint"}`}>{message.text}</p>;
}

export default function AccountPage() {
  const { user, updateName, updateEmail, updatePassword, uploadAvatar, deleteAccount } = useAuth();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPending, setAvatarPending] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const [namePending, setNamePending] = useState(false);
  const [nameMsg, setNameMsg] = useState<Message | null>(null);

  const emailPasswordRef = useRef<HTMLInputElement>(null);
  const [emailPending, setEmailPending] = useState(false);
  const [emailMsg, setEmailMsg] = useState<Message | null>(null);

  const currentPasswordRef = useRef<HTMLInputElement>(null);
  const newPasswordRef = useRef<HTMLInputElement>(null);
  const [passwordPending, setPasswordPending] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<Message | null>(null);

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deletePending, setDeletePending] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [pushPending, setPushPending] = useState(false);
  const [pushMsg, setPushMsg] = useState<Message | null>(null);

  async function handleActivatePush() {
    setPushPending(true);
    setPushMsg(null);
    const { error } = await subscribeToCallPush();
    setPushPending(false);
    setPushMsg(
      error ? { type: "error", text: error } : { type: "ok", text: "Listo — este dispositivo recibirá el aviso." }
    );
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarPending(true);
    setAvatarError(null);
    const { error } = await uploadAvatar(file);
    setAvatarPending(false);
    if (error) setAvatarError(error);
    e.target.value = "";
  }

  async function handleNameSubmit(formData: FormData) {
    const name = String(formData.get("name") ?? "");
    setNamePending(true);
    setNameMsg(null);
    const { error } = await updateName(name);
    setNamePending(false);
    setNameMsg(error ? { type: "error", text: error } : { type: "ok", text: "Nombre actualizado." });
  }

  async function handleEmailSubmit(formData: FormData) {
    const email = String(formData.get("email") ?? "");
    const currentPassword = String(formData.get("currentPassword") ?? "");
    setEmailPending(true);
    setEmailMsg(null);
    const { error } = await updateEmail(email, currentPassword);
    setEmailPending(false);
    if (error) {
      setEmailMsg({ type: "error", text: error });
      return;
    }
    setEmailMsg({ type: "ok", text: "Email actualizado." });
    if (emailPasswordRef.current) emailPasswordRef.current.value = "";
  }

  async function handlePasswordSubmit(formData: FormData) {
    const currentPassword = String(formData.get("currentPassword") ?? "");
    const newPassword = String(formData.get("newPassword") ?? "");
    setPasswordPending(true);
    setPasswordMsg(null);
    const { error } = await updatePassword(currentPassword, newPassword);
    setPasswordPending(false);
    if (error) {
      setPasswordMsg({ type: "error", text: error });
      return;
    }
    setPasswordMsg({ type: "ok", text: "Contraseña actualizada." });
    if (currentPasswordRef.current) currentPasswordRef.current.value = "";
    if (newPasswordRef.current) newPasswordRef.current.value = "";
  }

  async function handleDelete() {
    setDeletePending(true);
    setDeleteError(null);
    const { error } = await deleteAccount(deletePassword);
    setDeletePending(false);
    if (error) {
      setDeleteError(error);
      return;
    }
    // Recarga completa (en vez de navigate) para evitar que RequireAuth
    // reaccione al usuario recién borrado y nos mande a /login antes de
    // que la navegación a "/" se aplique.
    window.location.assign("/#/");
  }

  return (
    <div className="flex min-h-screen flex-col bg-page">
      <SiteNav authed userName={user?.name ?? user?.email} tier={user?.tier} avatarUrl={user?.avatarUrl} />

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-12 sm:px-6">
        <h1 className="font-display text-3xl font-extrabold text-body">Mi cuenta</h1>

        <Card className="mt-8 p-6">
          <h2 className="font-display text-lg font-bold text-body">Apariencia</h2>
          <p className="mt-1 text-sm text-muted">
            "Sistema" sigue el ajuste de tu dispositivo; elige "Claro" u "Oscuro" para forzarlo siempre.
          </p>
          <div className="mt-4">
            <ThemeToggle />
          </div>
        </Card>

        {user?.email.toLowerCase() === ADMIN_EMAIL ? (
          <Card className="mt-6 p-6">
            <h2 className="font-display text-lg font-bold text-body">Notificaciones de llamada</h2>
            <p className="mt-1 text-sm text-muted">
              Activa los avisos en este dispositivo para enterarte cuando alguien pulse "Llamar" en /contacto.
            </p>
            <Button variant="secondary" className="mt-4" disabled={pushPending} onClick={handleActivatePush}>
              {pushPending ? "Activando…" : "Activar avisos en este dispositivo"}
            </Button>
            <div className="mt-3">
              <InlineMessage message={pushMsg} />
            </div>
          </Card>
        ) : null}

        <Card className="mt-6 p-6">
          <h2 className="font-display text-lg font-bold text-body">Foto de perfil</h2>
          <div className="mt-4 flex items-center gap-4">
            <Avatar name={user?.name ?? user?.email} avatarUrl={user?.avatarUrl} size={72} />
            <div>
              <Button
                type="button"
                variant="secondary"
                disabled={avatarPending}
                onClick={() => fileInputRef.current?.click()}
              >
                {avatarPending ? "Subiendo…" : "Cambiar foto"}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <p className="mt-2 text-xs text-muted">JPG, PNG o WEBP, máx. 2 MB.</p>
            </div>
          </div>
          {avatarError ? <p className="mt-3 text-sm text-coral">{avatarError}</p> : null}
        </Card>

        <Card className="mt-6 p-6">
          <h2 className="font-display text-lg font-bold text-body">Nombre</h2>
          <form action={handleNameSubmit} className="mt-4 space-y-3">
            <Field label="Nombre" htmlFor="account-name">
              <IconInput
                id="account-name"
                name="name"
                defaultValue={user?.name}
                icon={<PersonIcon size={16} />}
                required
              />
            </Field>
            <InlineMessage message={nameMsg} />
            <Button type="submit" disabled={namePending}>
              {namePending ? "Guardando…" : "Guardar nombre"}
            </Button>
          </form>
        </Card>

        <Card className="mt-6 p-6">
          <h2 className="font-display text-lg font-bold text-body">Email</h2>
          <form action={handleEmailSubmit} className="mt-4 space-y-3">
            <Field label="Nuevo email" htmlFor="account-email">
              <IconInput
                id="account-email"
                name="email"
                type="email"
                defaultValue={user?.email}
                icon={<MailIcon size={16} />}
                required
              />
            </Field>
            <Field label="Contraseña actual" htmlFor="account-email-password">
              <IconInput
                ref={emailPasswordRef}
                id="account-email-password"
                name="currentPassword"
                type="password"
                placeholder="Para confirmar el cambio"
                icon={<LockIcon size={16} />}
                required
              />
            </Field>
            <InlineMessage message={emailMsg} />
            <Button type="submit" disabled={emailPending}>
              {emailPending ? "Guardando…" : "Guardar email"}
            </Button>
          </form>
        </Card>

        <Card className="mt-6 p-6">
          <h2 className="font-display text-lg font-bold text-body">Contraseña</h2>
          <form action={handlePasswordSubmit} className="mt-4 space-y-3">
            <Field label="Contraseña actual" htmlFor="account-current-password">
              <IconInput
                ref={currentPasswordRef}
                id="account-current-password"
                name="currentPassword"
                type="password"
                icon={<LockIcon size={16} />}
                required
              />
            </Field>
            <Field label="Nueva contraseña" htmlFor="account-new-password">
              <IconInput
                ref={newPasswordRef}
                id="account-new-password"
                name="newPassword"
                type="password"
                minLength={8}
                placeholder="Mínimo 8 caracteres"
                icon={<LockIcon size={16} />}
                required
              />
            </Field>
            <InlineMessage message={passwordMsg} />
            <Button type="submit" disabled={passwordPending}>
              {passwordPending ? "Guardando…" : "Guardar contraseña"}
            </Button>
          </form>
        </Card>

        <Card className="mt-6 border border-coral/30 p-6">
          <h2 className="font-display text-lg font-bold text-coral">Eliminar cuenta</h2>
          <p className="mt-1 text-sm text-muted">
            Se borrará tu cuenta y todas tus suscripciones registradas. Esta acción no se puede deshacer.
          </p>

          {!confirmingDelete ? (
            <Button variant="danger" className="mt-4" onClick={() => setConfirmingDelete(true)}>
              Eliminar cuenta
            </Button>
          ) : (
            <div className="mt-4 space-y-3">
              <Field label="Confirma tu contraseña" htmlFor="account-delete-password">
                <IconInput
                  id="account-delete-password"
                  type="password"
                  icon={<LockIcon size={16} />}
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  required
                />
              </Field>
              {deleteError ? <p className="text-sm text-coral">{deleteError}</p> : null}
              <div className="flex gap-3">
                <Button variant="danger" disabled={deletePending || !deletePassword} onClick={handleDelete}>
                  {deletePending ? "Eliminando…" : "Confirmar eliminación"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setConfirmingDelete(false);
                    setDeletePassword("");
                    setDeleteError(null);
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
