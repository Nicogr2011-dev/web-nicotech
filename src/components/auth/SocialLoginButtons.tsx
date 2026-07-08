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

function AppleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-body">
      <path d="M16.365 1.43c0 1.14-.462 2.14-1.213 2.87-.812.8-1.9 1.29-2.94 1.21-.14-1.11.417-2.27 1.19-3.02.79-.78 2.06-1.36 2.96-1.06zM20.68 17.24c-.5 1.15-.74 1.66-1.38 2.68-.9 1.44-2.16 3.23-3.73 3.24-1.4.02-1.76-.9-3.65-.89-1.9.01-2.29.9-3.69.88-1.57-.02-2.76-1.63-3.66-3.07-2.5-3.95-2.77-8.59-1.22-11.06.99-1.58 2.7-2.6 4.44-2.6 1.79 0 2.91 1 4.39 1 1.43 0 2.3-1 4.39-1 1.5 0 3.1.83 4.24 2.24-3.71 2.03-3.11 7.29.87 8.58z" />
    </svg>
  );
}

export function SocialLoginButtons({
  onGoogleClick,
  onAppleClick,
  disabled,
}: {
  onGoogleClick: () => void;
  onAppleClick: () => void;
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
      <button
        type="button"
        onClick={onAppleClick}
        disabled={disabled}
        className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-hairline bg-surface px-3.5 py-2.5 text-sm font-semibold text-body transition-colors hover:bg-page disabled:opacity-50"
      >
        <AppleIcon />
        Continuar con Apple
      </button>
    </div>
  );
}
