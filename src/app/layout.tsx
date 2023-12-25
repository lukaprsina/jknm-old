import "~/styles/globals.css";

import { Inter } from "next/font/google";

import '@mantine/core/styles.css';
import { ColorSchemeScript, MantineProvider } from '@mantine/core';

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
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
