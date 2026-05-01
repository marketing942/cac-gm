"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { signOut } from "@/app/login/actions";

interface NavItem {
  key: string;
  label: string;
  href: string;
  disabled?: boolean;
}

function IconHamburger({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function IconChart({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function IconTarget({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function IconScale({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v17" />
      <path d="M5 8l7-5 7 5" />
      <path d="M3 13l4 6h-1" />
      <path d="M7 19H3" />
      <path d="M21 13l-4 6h1" />
      <path d="M17 19h4" />
    </svg>
  );
}

function IconGauge({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function IconClose({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconLogout({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

const ITEMS: NavItem[] = [
  { key: "cac", label: "CAC", href: "/" },
  { key: "breakeven", label: "Breakeven", href: "/breakeven" },
  { key: "metas", label: "Metas Anuais", href: "/metas" },
  { key: "pace", label: "Pace", href: "/pace" },
];

const ITEM_ICONS: Record<string, React.ReactNode> = {
  cac: <IconChart />,
  breakeven: <IconScale />,
  metas: <IconTarget />,
  pace: <IconGauge />,
};

const SIDEBAR_KEY = "cac-dashboard-sidebar-open";

interface SidebarProps {
  userEmail?: string | null;
  isAdmin?: boolean;
}

export function Sidebar({ userEmail = null, isAdmin = false }: SidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_KEY);
    if (stored !== null) setOpen(stored === "true");
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) localStorage.setItem(SIDEBAR_KEY, String(open));
  }, [open, mounted]);

  // Close mobile drawer with Escape
  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [mobileOpen]);

  const width = open ? "w-[220px]" : "w-[64px]";

  return (
    <>
      {/* Floating hamburger for mobile (shows when drawer closed) */}
      <button
        onClick={() => setMobileOpen(true)}
        aria-label="Abrir menu"
        className="fixed left-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-850 bg-surface-1 text-fg shadow-lg md:hidden"
      >
        <IconHamburger />
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
        />
      )}

      <aside
        className={[
          "flex-shrink-0 border-r border-zinc-850 bg-surface-1 transition-[width] duration-300 ease-out",
          width,
          // Desktop: sticky in flex row
          "hidden md:sticky md:top-0 md:block md:h-screen",
          // Mobile: fixed drawer
          mobileOpen
            ? "!fixed !left-0 !top-0 !z-50 !block !h-screen !w-[240px] shadow-2xl"
            : "",
        ].join(" ")}
      >
        <div className="flex h-full flex-col">
          {/* Brand + toggle */}
          <div className="flex items-center justify-between border-b border-zinc-850 px-3 py-4">
            {(open || mobileOpen) && (
              <div className="min-w-0 overflow-hidden">
                <div className="truncate text-[13px] font-extrabold tracking-tight text-fg">
                  GM Educação
                </div>
                <div className="truncate text-[10px] font-medium text-fg-muted">
                  Painel executivo
                </div>
              </div>
            )}
            <button
              onClick={() =>
                mobileOpen ? setMobileOpen(false) : setOpen((v) => !v)
              }
              aria-label={open ? "Recolher menu" : "Expandir menu"}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-fg-body transition-colors hover:bg-surface-2 hover:text-fg"
            >
              {mobileOpen ? <IconClose /> : <IconHamburger />}
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto px-2 py-3">
            <div
              className={[
                "mb-2 px-2 text-[9px] font-bold uppercase tracking-[1.2px] text-fg-muted",
                open || mobileOpen ? "" : "hidden",
              ].join(" ")}
            >
              Dashboards
            </div>
            <ul className="space-y-1">
              {ITEMS.filter((item) => item.key !== "breakeven" || isAdmin).map((item) => {
                const isActive =
                  !item.disabled &&
                  (item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href));
                const isDisabled = item.disabled;
                return (
                  <li key={item.key}>
                    <a
                      href={isDisabled ? undefined : item.href}
                      title={
                        isDisabled
                          ? `${item.label} · em breve`
                          : item.label
                      }
                      onClick={(e) => {
                        if (isDisabled) e.preventDefault();
                        if (!isDisabled) setMobileOpen(false);
                      }}
                      className={[
                        "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-semibold transition-colors",
                        isActive
                          ? "bg-surface-2 text-fg"
                          : "text-fg-body hover:bg-surface-2 hover:text-fg",
                        isDisabled ? "cursor-not-allowed opacity-45" : "cursor-pointer",
                        open || mobileOpen ? "" : "justify-center",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "flex h-5 w-5 flex-shrink-0 items-center justify-center",
                          isActive ? "text-fg" : "",
                        ].join(" ")}
                      >
                        {ITEM_ICONS[item.key]}
                      </span>
                      {(open || mobileOpen) && (
                        <>
                          <span className="flex-1 truncate">{item.label}</span>
                          {isDisabled && (
                            <span className="rounded px-1.5 py-px text-[8px] font-bold uppercase tracking-wide text-fg-muted">
                              em breve
                            </span>
                          )}
                          {isActive && (
                            <span
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ background: "#4ade80" }}
                            />
                          )}
                        </>
                      )}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer: theme + user + version */}
          <div className="border-t border-zinc-850 p-3">
            {open || mobileOpen ? (
              <>
                <div className="mb-2 px-1 text-[9px] font-bold uppercase tracking-[1.2px] text-fg-muted">
                  Aparência
                </div>
                <ThemeToggle />

                {userEmail && (
                  <div className="mt-3 border-t border-zinc-850 pt-3">
                    <div className="mb-1.5 px-1 text-[9px] font-bold uppercase tracking-[1.2px] text-fg-muted">
                      Conta
                    </div>
                    <div
                      className="truncate px-1 text-[11px] font-semibold text-fg-body"
                      title={userEmail}
                    >
                      {userEmail}
                    </div>
                    <form action={signOut}>
                      <button
                        type="submit"
                        className="mt-2 flex w-full items-center gap-2 rounded-lg border border-zinc-850 bg-surface-2 px-2.5 py-1.5 text-[11px] font-semibold text-fg-body transition-colors hover:border-red-500/40 hover:text-red-600 dark:hover:text-red-400"
                      >
                        <IconLogout />
                        <span>Sair</span>
                      </button>
                    </form>
                  </div>
                )}

                <div className="mt-3 px-1 text-[9px] font-medium text-fg-muted">
                  v1.0 · GM Educação
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <ThemeToggle compact />
                {userEmail && (
                  <form action={signOut}>
                    <button
                      type="submit"
                      title={`Sair (${userEmail})`}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-fg-body transition-colors hover:bg-surface-2 hover:text-red-600 dark:hover:text-red-400"
                    >
                      <IconLogout />
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
