import "~/styles/globals.css";

import { Inter } from "next/font/google";

import '@mantine/core/styles.css';
import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import ResponsiveShell from "./responsive_shell";

import '@mdxeditor/editor/style.css'
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
        <link rel="apple-touch-icon" sizes="76x76" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#ffffff"></meta>
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
