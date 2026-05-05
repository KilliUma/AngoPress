import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/Providers'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

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
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
