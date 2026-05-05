import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import Script from 'next/script'
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
  openGraph: {
    title: 'AngoPress',
    description: 'Distribua press releases para os melhores jornalistas de Angola.',
    type: 'website',
    locale: 'pt_AO',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-AO">
      <head />
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        {/* Inline script runs before React hydration to avoid flash of wrong theme */}
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='light')document.documentElement.classList.add('light');}catch(e){}})();`,
          }}
        />
        <ScrollReveal />
        {children}
      </body>
    </html>
  )
}
