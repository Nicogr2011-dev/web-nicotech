function GoogleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.66-.22-2.45H12v4.63h6.48c-.28 1.5-1.13 2.78-2.4 3.63v3.02h3.89c2.28-2.1 3.55-5.2 3.55-8.83z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.89-3.02c-1.08.72-2.46 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.94H1.28v3.11C3.26 21.3 7.3 24 12 24z"
      />
      <path fill="#FBBC05" d="M5.29 14.29a7.2 7.2 0 0 1 0-4.58V6.6H1.28a12 12 0 0 0 0 10.8z" />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0 7.3 0 3.26 2.7 1.28 6.6l4.01 3.11C6.23 6.87 8.88 4.75 12 4.75z"
      />
    </svg>
  );
}

export function SocialLoginButtons({
  onGoogleClick,
  disabled,
}: {
  onGoogleClick: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <button
        type="button"
        onClick={onGoogleClick}
        disabled={disabled}
        className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-hairline bg-surface px-3.5 py-2.5 text-sm font-semibold text-body transition-colors hover:bg-page disabled:opacity-50"
      >
        <GoogleIcon />
        Continuar con Google
      </button>
    </div>
  );
}
