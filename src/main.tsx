import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { AuthProvider } from "@/lib/AuthContext";
import { ThemeProvider } from "@/lib/ThemeContext";
import App from "@/App";
import "@/index.css";

console.log(
  "%c" +
    [
      " _   _  _         _              _      ",
      "| \\ | |(_)       | |            | |     ",
      "|  \\| | _   ___  | |_   ___   ___ | |__   ",
      "| . ` || | / __| | __| / _ \\ / __|| '_ \\  ",
      "| |\\  || || (__  | |_ |  __/| (__ | | | | ",
      "|_| \\_||_| \\___|  \\__| \\___| \\___||_| |_| ",
    ].join("\n"),
  "color:#3a86ff;font-family:monospace;font-weight:bold;font-size:11px;"
);
console.log(
  "%c¿Se te dan bien estas cosas? Nos vendría bien alguien así. Escríbenos: hola@nicotech.es",
  "color:#8338ec;font-family:sans-serif;font-size:13px;font-weight:bold;"
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HashRouter>
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </HashRouter>
  </StrictMode>
);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}
