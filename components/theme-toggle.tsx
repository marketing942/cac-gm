"use client";

import { useState, useEffect } from "react";

export type Theme = "light" | "dark" | "system";

const THEME_KEY = "cac-dashboard-theme";

function applyTheme(t: Theme) {
  if (typeof window === "undefined") return;
  const sysDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = t === "dark" || (t === "system" && sysDark);
  document.documentElement.classList.toggle("dark", isDark);
}

function SunIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function SystemIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  );
}

interface ThemeToggleProps {
  compact?: boolean;
}

export function ThemeToggle({ compact = false }: ThemeToggleProps) {
  const [theme, setTheme] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = (localStorage.getItem(THEME_KEY) as Theme) || "system";
    setTheme(stored);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const change = (t: Theme) => {
    setTheme(t);
    localStorage.setItem(THEME_KEY, t);
    applyTheme(t);
  };

  const cycle = () => {
    const next: Theme =
      theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
    change(next);
  };

  const icon =
    theme === "light" ? <SunIcon /> : theme === "dark" ? <MoonIcon /> : <SystemIcon />;
  const label =
    theme === "light" ? "Claro" : theme === "dark" ? "Escuro" : "Sistema";

  if (compact) {
    return (
      <button
        onClick={cycle}
        suppressHydrationWarning
        title={mounted ? `Tema: ${label} — clique para alternar` : "Tema"}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-850 bg-surface-2 text-fg-body transition-colors hover:bg-surface-3 hover:text-fg"
      >
        {mounted ? icon : <SystemIcon />}
      </button>
    );
  }

  return (
    <div className="flex rounded-lg border border-zinc-850 bg-surface-2 p-[3px]">
      {(["light", "dark", "system"] as const).map((t) => {
        const active = theme === t;
        const tIcon =
          t === "light" ? <SunIcon /> : t === "dark" ? <MoonIcon /> : <SystemIcon />;
        const tLabel = t === "light" ? "Claro" : t === "dark" ? "Escuro" : "Auto";
        return (
          <button
            key={t}
            suppressHydrationWarning
            onClick={() => change(t)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] font-bold transition-all"
            style={{
              background: mounted && active ? "rgb(var(--surface-1))" : "transparent",
              color: mounted && active ? "rgb(var(--fg))" : "rgb(var(--fg-muted))",
              cursor: "pointer",
            }}
          >
            {tIcon}
            {tLabel}
          </button>
        );
      })}
    </div>
  );
}
