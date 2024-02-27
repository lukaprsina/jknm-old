"use client"

import { SessionProvider } from "next-auth/react"
import {
    QueryClient,
    QueryClientProvider,
} from '@tanstack/react-query'

const queryClient = new QueryClient()

function Providers({ children }: { children: React.ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <SessionProvider>
                {children}
            </SessionProvider>
        </QueryClientProvider>
    )
}

export default Providers