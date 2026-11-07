import type { Metadata } from "next";
import "./globals.css";
import { WalletProvider } from "@/components/WalletProvider";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import { GuidedTourProvider } from "@/contexts/GuidedTourContext";
import { GuidedTour } from "@/components/onboarding/GuidedTour";
import { ThemeBootstrap } from "@/components/ThemeBootstrap";
import { KeyboardShortcutsProvider } from "@/contexts/KeyboardShortcutsContext";
import { KeyboardShortcutsModal } from "@/components/KeyboardShortcutsModal";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "Vela",
  description: "Decentralised social on Stellar",
  icons: {
    icon: [
      { url: "/logo/logo-icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", type: "image/x-icon" },
    ],
    shortcut: "/logo/logo-icon.svg",
    apple: "/logo/logo-icon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Prevent flash of unstyled theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('vela_theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';}document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme='dark';}})();`,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <ServiceWorkerRegistration />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-violet-600 focus:text-white focus:rounded-lg focus:font-semibold"
        >
          Skip to content
        </a>
        <ThemeBootstrap />
        <WalletProvider>
          <OnboardingProvider>
            <GuidedTourProvider>
              <NotificationsProvider>
                <KeyboardShortcutsProvider>
                  <AppShell>
                    <main id="main-content" tabIndex={-1}>
                      {children}
                    </main>
                  </AppShell>
                  <GuidedTour />
                  <KeyboardShortcutsModal />
                </KeyboardShortcutsProvider>
              </NotificationsProvider>
            </GuidedTourProvider>
          </OnboardingProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
