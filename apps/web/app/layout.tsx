import type { Metadata } from 'next'
import { Providers } from '@/components/Providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'AngoPress',
  description: 'Plataforma de Mailing de Imprensa',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" className="light">
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
