'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState, type ReactNode } from 'react'
import { AuthProvider } from '@/domains/auth/components/AuthProvider'
import { ThemeProvider } from '@/components/ui/ThemeProvider'

function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000, // 1 minute
                gcTime: 5 * 60 * 1000, // 5 minutes
                retry: 1,
                refetchOnWindowFocus: false,
                refetchOnReconnect: true,
            },
            mutations: {
                retry: 0,
            },
        },
    })
}

let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
    if (typeof window === 'undefined') {
        // Server: always make a new query client
        return makeQueryClient()
    } else {
        // Browser: make a new query client if we don't already have one
        if (!browserQueryClient) browserQueryClient = makeQueryClient()
        return browserQueryClient
    }
}

interface ProvidersProps {
    children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
    const [queryClient] = useState(() => getQueryClient())

    return (
        <ThemeProvider defaultTheme="system">
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    {children}
                </AuthProvider>
                <ReactQueryDevtools initialIsOpen={false} />
            </QueryClientProvider>
        </ThemeProvider>
    )
}
