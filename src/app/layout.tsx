// order matters
import "~/styles/globals.css";
// import '@lukaprsina/mdxeditor/style.css'
// import '@mdxeditor/editor/style.css'
import 'modified-editor/style.css'

import { Inter } from "next/font/google";

import ResponsiveShell from "./responsive_shell";
import { new_article } from './actions';
import { ThemeProvider } from '~/app/theme_provider';
import Providers from "~/app/providers";
import { cn } from "~/lib/utils";

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
    <html lang="si" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            {children}
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
