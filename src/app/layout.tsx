// order matters
import "~/styles/globals.css";
// import '@lukaprsina/mdxeditor/style.css'
// import '@mdxeditor/editor/style.css'
import 'modified-editor/style.css'

import { Inter } from "next/font/google";

import ResponsiveShell from "./responsive_shell";
import { new_article } from './actions';

import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import Providers from "./providers";

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
    <Providers>
      <html lang="en">
        <head>
          <ColorSchemeScript />
        </head>
        <body className={`font-sans ${inter.variable}`}>
          <MantineProvider>
            <ResponsiveShell new_article={new_article}>
              {children}
            </ResponsiveShell>
          </MantineProvider>
        </body>
      </html>
    </Providers>
  );
}
