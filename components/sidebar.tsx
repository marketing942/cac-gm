"use client";

import { useState, useEffect } from "react";
import { ThemeToggle } from "./theme-toggle";

interface NavItem {
  key: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  active?: boolean;
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

function IconCoins({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6" />
      <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
      <path d="M7 6h1v4" />
      <path d="M16.71 13.88l.7.71-2.82 2.82" />
    </svg>
  );
}

function IconPie({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
      <path d="M22 12A10 10 0 0 0 12 2v10z" />
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

const ITEMS: NavItem[] = [
  { key: "cac", label: "CAC", href: "/", icon: <IconChart />, active: true },
  { key: "leads", label: "Leads", href: "#", icon: <IconTarget />, disabled: true },
  { key: "vendas", label: "Vendas", href: "#", icon: <IconCoins />, disabled: true },
  { key: "financeiro", label: "Financeiro", href: "#", icon: <IconPie />, disabled: true },
];

const SIDEBAR_KEY = "cac-dashboard-sidebar-open";

export function Sidebar() {
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
              {ITEMS.map((item) => {
                const isActive = item.active;
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
                        {item.icon}
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

          {/* Footer: theme + version */}
          <div className="border-t border-zinc-850 p-3">
            {open || mobileOpen ? (
              <>
                <div className="mb-2 px-1 text-[9px] font-bold uppercase tracking-[1.2px] text-fg-muted">
                  Aparência
                </div>
                <ThemeToggle />
                <div className="mt-3 px-1 text-[9px] font-medium text-fg-muted">
                  v1.0 · GM Educação
                </div>
              </>
            ) : (
              <div className="flex justify-center">
                <ThemeToggle compact />
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
