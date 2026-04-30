import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'sonner'
import * as Sentry from '@sentry/react'
import App from './App'
import './styles/globals.css'

// ─── Sentry ───────────────────────────────────────────────────────────────────
if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    release: import.meta.env.VITE_APP_VERSION,
    integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
    tracesSampleRate: import.meta.env.PROD ? 0.2 : 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  })
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minuto
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
})

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-bold text-red-600">Algo correu mal</h1>
      <p className="text-muted-foreground max-w-md text-sm">{error.message}</p>
      <button
        className="rounded-md bg-primary px-4 py-2 text-sm text-white"
        onClick={() => window.location.reload()}
      >
        Recarregar página
      </button>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={({ error }) => <ErrorFallback error={error as Error} />}>
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster position="top-right" richColors closeButton expand visibleToasts={5} offset={16} />
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </Sentry.ErrorBoundary>
  </React.StrictMode>,
)
