import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GM Educação · Dashboards",
  description:
    "Painel executivo de controle de CAC e métricas operacionais · CPPEM, Colégio CPPEM e Unicive",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
  },
};

const themeInitScript = `
  (function () {
    try {
      var key = 'cac-dashboard-theme';
      var t = localStorage.getItem(key) || 'system';
      var sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      var isDark = t === 'dark' || (t === 'system' && sysDark);
      if (isDark) document.documentElement.classList.add('dark');
    } catch (e) {}
  })();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        className="antialiased"
        style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
