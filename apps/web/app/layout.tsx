import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { Providers } from '@/components/Providers'
import './globals.css'

const inter = localFont({
  src: './fonts/inter-variable.woff2',
  variable: '--font-body',
  display: 'swap',
  weight: '100 900',
})

const spaceGrotesk = localFont({
  src: './fonts/space-grotesk-variable.woff2',
  variable: '--font-display',
  display: 'swap',
  weight: '300 700',
})

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
    <html lang="pt" className={`light ${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
