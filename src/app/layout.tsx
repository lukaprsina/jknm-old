// order matters
import "~/styles/globals.css";

import { Inter } from "next/font/google";

import { ThemeProvider } from "~/app/theme_provider";
import Providers from "~/app/providers";
import { cn } from "~/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Jamarski klub Novo mesto",
  description: "Jamarski klub Novo mesto",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sl" suppressHydrationWarning>
      <body
        className={cn(
          "relative -z-30 min-h-screen bg-background font-sans antialiased",
          inter.variable,
          "[&_.slate-selected]:!bg-primary/20 [&_.slate-selection-area]:border [&_.slate-selection-area]:border-primary [&_.slate-selection-area]:bg-primary/10",
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>{children}</Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
