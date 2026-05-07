import type { Metadata } from 'next'
import localFont from 'next/font/local'
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
  title: 'AngoPress — A plataforma de Press Releases de Angola',
  description:
    'Distribua os seus press releases para os principais jornalistas angolanos com rastreamento de aberturas, cliques e bounces em tempo real.',
  keywords: ['press release', 'angola', 'jornalistas', 'assessoria de imprensa', 'angopress'],
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: 'AngoPress',
    description: 'Distribua press releases para os melhores jornalistas de Angola.',
    type: 'website',
    locale: 'pt_AO',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-AO" className={`light ${inter.variable} ${spaceGrotesk.variable}`}>
      <head />
      <body className="font-sans antialiased">
        <ScrollReveal />
        {children}
      </body>
    </html>
  )
}
