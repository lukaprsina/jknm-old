"use client";

import { SessionProvider } from "next-auth/react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import QueryProvider from "~/server/query";
import { TooltipProvider } from "~/components/ui/tooltip";

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider
      disableHoverableContent
      delayDuration={500}
      skipDelayDuration={0}
    >
      <QueryProvider>
        <SessionProvider>{children}</SessionProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryProvider>
    </TooltipProvider>
  );
}

export default Providers;
