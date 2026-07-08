import { useEffect, useState } from "react";

const STORAGE_KEY = "nicotech_cookie_consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-hairline bg-surface/95 px-4 py-4 shadow-soft-lg backdrop-blur-sm sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <p className="text-center text-sm text-muted sm:text-left">
          Usamos únicamente cookies necesarias para que Nicotech funcione — nada de publicidad ni rastreo.
        </p>
        <button
          onClick={accept}
          className="shrink-0 rounded-full bg-azure px-5 py-2 text-sm font-semibold text-white shadow-soft transition-transform hover:-translate-y-0.5"
        >
          Vale, lo entiendo
        </button>
      </div>
    </div>
  );
}
