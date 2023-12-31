// order matters
import '@mdxeditor/editor/style.css'
import '@mantine/core/styles.css';
import "~/styles/globals.css";

import { Inter } from "next/font/google";

import ResponsiveShell from "./responsive_shell";

import { ColorSchemeScript, MantineProvider } from '@mantine/core';
// import 'prism-themes/themes/prism-one-light.css'

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
    <html lang="en">
      <head>
        <ColorSchemeScript />
      </head>
      <body className={`font-sans ${inter.variable}`}>
        <MantineProvider>
          <ResponsiveShell>
            {children}
          </ResponsiveShell>
        </MantineProvider>
      </body>
    </html>
  );
}
