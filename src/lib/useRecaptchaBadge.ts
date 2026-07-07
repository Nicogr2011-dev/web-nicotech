import { useEffect } from "react";

/** El badge de reCAPTCHA solo tiene sentido en login/registro (que es donde se usa) —
 * se oculta en el resto de la web. */
export function useRecaptchaBadge() {
  useEffect(() => {
    document.body.classList.add("show-recaptcha-badge");
    return () => document.body.classList.remove("show-recaptcha-badge");
  }, []);
}
