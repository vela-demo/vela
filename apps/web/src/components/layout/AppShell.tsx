"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";
import { useNotificationsContext } from "@/contexts/NotificationsContext";
import { useKeyboardShortcutsContext } from "@/contexts/KeyboardShortcutsContext";
import { CreatePostModal } from "@/components/modals/CreatePostModal";
import { WalletModal } from "@/components/modals/WalletModal";
import SearchBar from "@/components/SearchBar";
import {
  getStoredThemePreference,
  storeThemePreference,
  type ThemePreference,
} from "@/components/ThemeBootstrap";

/* ── Freighter banner ──────────────────────────────────────── */
function FreighterBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div
      role="alert"
      className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm"
      style={{
        background: "rgba(120,53,15,0.6)",
        borderBottom: "1px solid rgba(180,83,9,0.4)",
      }}
    >
      <span style={{ color: "#fbbf24" }}>
        Freighter not detected.{" "}
        <a
          href="https://freighter.app"
          target="_blank"
          rel="noopener noreferrer"
          className="underline font-semibold"
        >
          Install the extension
        </a>{" "}
        to connect your wallet.
      </span>
      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        style={{ color: "rgba(251,191,36,0.7)" }}
        className="hover:opacity-100 transition-opacity"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

/* ── Nav item data ─────────────────────────────────────────── */
const NAV_ITEMS = [
  {
    href: "/feed",
    label: "Home",
    icon: (active: boolean) => (
      <svg className="w-5 h-5" fill={active ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.5 1.5 0 012.092 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
  },
  {
    href: "/explore",
    label: "Explore",
    icon: (active: boolean) => (
      <svg className="w-5 h-5" fill={active ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 0z" />
      </svg>
    ),
  },
  {
    href: "/notifications",
    label: "Activity",
    icon: (active: boolean) => (
      <svg className="w-5 h-5" fill={active ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
    ),
  },
  {
    href: "/pools",
    label: "Pools",
    icon: (active: boolean) => (
      <svg className="w-5 h-5" fill={active ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
      </svg>
    ),
  },
  {
    href: "/dm",
    label: "Messages",
    icon: (active: boolean) => (
      <svg className="w-5 h-5" fill={active ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
  },
  {
    href: "/governance",
    label: "Governance",
    icon: (active: boolean) => (
      <svg className="w-5 h-5" fill={active ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
      </svg>
    ),
  },
  {
    href: "/profile",
    label: "Profile",
    icon: (active: boolean) => (
      <svg className="w-5 h-5" fill={active ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
] as const;

/* ── Sidebar Logo ─────────────────────────────────────────── */
function VelaLogo() {
  return (
    <Link href="/feed" className="flex items-center gap-2.5 px-2 py-1 rounded-xl mb-4" aria-label="Vela home">
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect width="28" height="28" rx="8" fill="var(--brand)" />
        <path d="M8 8L14 20L20 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="14" cy="20" r="2" fill="white" />
      </svg>
      <span
        className="sidebar-wordmark font-semibold text-xl tracking-tight"
        style={{ color: "var(--fg)" }}
      >
        Vela
      </span>
    </Link>
  );
}

/* ── Main AppShell ─────────────────────────────────────────── */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { address, connected, network, connect, disconnect } = useWallet();
  const { unreadCount } = useNotificationsContext();
  const { registerComposeHandler, unregisterComposeHandler, registerSearchRef } =
    useKeyboardShortcutsContext();

  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [showFreighterBanner, setShowFreighterBanner] = useState(false);
  const [theme, setTheme] = useState<ThemePreference>("dark");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTheme(getStoredThemePreference());
    registerComposeHandler(() => setIsComposeOpen(true));
    registerSearchRef(searchRef as React.RefObject<HTMLInputElement | null>);
    return () => unregisterComposeHandler();
  }, [registerComposeHandler, unregisterComposeHandler, registerSearchRef]);

  const toggleTheme = useCallback(() => {
    const next: ThemePreference = theme === "dark" ? "light" : "dark";
    setTheme(next);
    storeThemePreference(next);
  }, [theme]);

  const handleConnect = useCallback(async () => {
    try {
      await connect();
    } catch {
      setShowFreighterBanner(true);
    }
  }, [connect]);

  function truncate(addr: string) {
    return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
  }

  return (
    <div className="app-shell">
      {/* ── Left sidebar ─────────────────────────── */}
      <aside
        className="hidden md:flex fixed left-0 top-0 h-dvh w-60 flex-col overflow-y-auto border-r z-40"
        style={{ background: "var(--bg)", borderColor: "var(--border)", padding: "16px 12px 24px", gap: "4px", scrollbarWidth: "none" }}
        aria-label="Main navigation"
      >
        <VelaLogo />

        {/* Nav links */}
        <nav className="flex flex-col gap-0.5 flex-1">
          {NAV_ITEMS.map((item) => {
            // Profile href is dynamic — point to the connected wallet's profile,
            // or to /profile/edit (wallet-gate) when not connected
            const href =
              item.href === "/profile"
                ? connected && address
                  ? `/profile/${address}`
                  : "/profile/edit"
                : item.href;

            const isActive =
              item.href === "/feed"
                ? pathname === "/" || pathname.startsWith("/feed")
                : item.href === "/profile"
                ? pathname.startsWith("/profile")
                : pathname.startsWith(item.href);

            const showBadge = item.href === "/notifications" && unreadCount > 0;

            return (
              <Link
                key={item.href}
                href={href}
                className={`sidebar-nav-item ${isActive ? "active" : ""}`}
                aria-current={isActive ? "page" : undefined}
                aria-label={showBadge ? `${item.label} (${unreadCount} unread)` : item.label}
              >
                <span className="sidebar-nav-icon relative shrink-0">
                  {item.icon(isActive)}
                  {showBadge && (
                    <span
                      aria-hidden="true"
                      className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white"
                      style={{ background: "var(--brand)" }}
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </span>
                <span className="sidebar-label">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Compose button */}
        <button
          onClick={() => setIsComposeOpen(true)}
          className="sidebar-compose-btn sidebar-nav-item mt-2 font-semibold text-white"
          style={{ background: "var(--brand)", color: "#fff" }}
          aria-label="Compose new post"
        >
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span className="sidebar-compose-label">Post</span>
        </button>

        {/* Bottom: wallet + theme */}
        <div className="mt-auto flex flex-col gap-1 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
          <button
            onClick={toggleTheme}
            className="sidebar-nav-item"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            <span className="shrink-0">
              {theme === "dark" ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
              )}
            </span>
            <span className="sidebar-footer-label">
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </span>
          </button>

          {connected && address ? (
            <button
              onClick={() => setIsWalletOpen(true)}
              className="sidebar-nav-item"
              aria-label={`Wallet: ${address}. Click to manage.`}
            >
              <span
                className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ background: "var(--brand)" }}
                aria-hidden="true"
              >
                {address.slice(1, 3).toUpperCase()}
              </span>
              <span className="sidebar-footer-label min-w-0">
                <span className="block text-sm font-medium" style={{ color: "var(--fg)" }}>
                  {truncate(address)}
                </span>
                {network && (
                  <span className="block text-xs" style={{ color: "var(--fg-muted)" }}>
                    {network}
                  </span>
                )}
              </span>
            </button>
          ) : (
            <button
              onClick={handleConnect}
              className="sidebar-nav-item font-semibold"
              style={{ color: "var(--brand)" }}
            >
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18-3a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3m18-3V6" />
              </svg>
              <span className="sidebar-footer-label">Connect wallet</span>
            </button>
          )}
        </div>
      </aside>

      {/* ── Main content ──────────────────────────── */}
      <div className="md:ml-60 min-h-dvh flex flex-col">
        {/* Top bar — search + wallet on mobile */}
        <div
          className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3"
          style={{
            background: "var(--glass)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          {/* Mobile logo */}
          <Link href="/feed" className="sm:hidden shrink-0" aria-label="Vela home">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <rect width="28" height="28" rx="8" fill="var(--brand)" />
              <path d="M8 8L14 20L20 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="14" cy="20" r="2" fill="white" />
            </svg>
          </Link>

          <div className="flex-1">
            <SearchBar
              onSearch={(q) => router.push(`/search?q=${encodeURIComponent(q)}`)}
              placeholder="Search Vela"
              className="w-full max-w-lg"
              inputRef={searchRef}
            />
          </div>

          {/* Mobile wallet */}
          <div className="sm:hidden shrink-0">
            {connected && address ? (
              <button
                onClick={() => setIsWalletOpen(true)}
                className="font-mono text-xs px-2.5 py-1.5 rounded-lg border"
                style={{ borderColor: "var(--border)", color: "var(--fg-muted)" }}
              >
                {truncate(address)}
              </button>
            ) : (
              <button
                onClick={handleConnect}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white"
                style={{ background: "var(--brand)" }}
              >
                Connect
              </button>
            )}
          </div>
        </div>

        {showFreighterBanner && (
          <FreighterBanner onDismiss={() => setShowFreighterBanner(false)} />
        )}

        {children}
      </div>

      {/* ── Bottom nav (mobile) ───────────────────── */}
      <nav
        className="flex md:hidden fixed bottom-0 left-0 right-0 z-50"
        style={{ height: "calc(60px + env(safe-area-inset-bottom))", paddingBottom: "env(safe-area-inset-bottom)", background: "var(--bg)", borderTop: "1px solid var(--border)" }}
        aria-label="Mobile navigation">
        {NAV_ITEMS.slice(0, 4).map((item) => {
          const isActive =
            item.href === "/feed"
              ? pathname === "/" || pathname.startsWith("/feed")
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors"
              style={{ color: isActive ? "var(--brand)" : "var(--fg-subtle)" }}
              aria-current={isActive ? "page" : undefined}
              aria-label={item.label}
            >
              {item.icon(isActive)}
              <span>{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={() => setIsComposeOpen(true)}
          className="flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium"
          style={{ color: "var(--brand)" }}
          aria-label="Compose new post"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span>Post</span>
        </button>
      </nav>

      {/* ── Modals ──────────────────────────────── */}
      <CreatePostModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        author={address ?? undefined}
      />
      <WalletModal
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        address={address}
        network={network}
        onDisconnect={disconnect}
      />
    </div>
  );
}
