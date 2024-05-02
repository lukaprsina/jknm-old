"use client";

import { SessionProvider } from "next-auth/react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import QueryProvider from "~/server/query";
import { ArticleViewSwitchProvider } from "./article_view";

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ArticleViewSwitchProvider>
        <SessionProvider>{children}</SessionProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </ArticleViewSwitchProvider>
    </QueryProvider>
  );
}

export default Providers;
