import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import './globals.css'
import { ScrollReveal } from '@/components/ScrollReveal'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
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
    <html lang="pt-AO" className="light">
      <head />
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        <ScrollReveal />
        {children}
      </body>
    </html>
  )
}
