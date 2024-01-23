// order matters
// import '@lukaprsina/mdxeditor/style.css'
import "~/styles/globals.css";
import '@mdxeditor/editor/style.css'
import '@mantine/core/styles.css';

import { Inter } from "next/font/google";

import ResponsiveShell from "./responsive_shell";
import { new_article } from './actions';

import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from './api/uploadthing/core';

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
        <NextSSRPlugin
          /**
           * The `extractRouterConfig` will extract **only** the route configs
           * from the router to prevent additional information from being
           * leaked to the client. The data passed to the client is the same
           * as if you were to fetch `/api/uploadthing` directly.
           */
          routerConfig={extractRouterConfig(ourFileRouter)}
        />
        <MantineProvider>
          <ResponsiveShell new_article={new_article}>
            {children}
          </ResponsiveShell>
        </MantineProvider>
      </body>
    </html>
  );
}
