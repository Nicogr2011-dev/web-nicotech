import { clsx } from "clsx";
import { useTheme, type ThemePreference } from "@/lib/ThemeContext";
import { SunIcon, MoonIcon, LaptopIcon } from "@/components/ui/Icon";

const OPTIONS: { value: ThemePreference; label: string; icon: React.ReactNode }[] = [
  { value: "system", label: "Sistema", icon: <LaptopIcon size={16} /> },
  { value: "light", label: "Claro", icon: <SunIcon size={16} /> },
  { value: "dark", label: "Oscuro", icon: <MoonIcon size={16} /> },
];

export function ThemeToggle() {
  const { preference, setPreference } = useTheme();

  return (
    <div className="inline-flex gap-1 rounded-full bg-page p-1">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => setPreference(option.value)}
          className={clsx(
            "flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors",
            preference === option.value ? "bg-surface text-body shadow-soft" : "text-muted hover:text-body"
          )}
        >
          {option.icon}
          {option.label}
        </button>
      ))}
    </div>
  );
}
