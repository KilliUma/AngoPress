import type { Plan, FeaturedPressRelease } from '@/components/landing/types'
import type { HeroStats } from '@/components/landing/HeroSection'
import { getLandingContent } from '@/lib/cms'
import { NavBar } from '@/components/landing/NavBar'
import { HeroSection } from '@/components/landing/HeroSection'
import { StatsBar } from '@/components/landing/StatsBar'
import { AboutSection } from '@/components/landing/AboutSection'
import { HowItWorksSection } from '@/components/landing/HowItWorksSection'
import { ForWhoSection } from '@/components/landing/ForWhoSection'
import { PricingSection } from '@/components/landing/PricingSection'
import { PressReleasesShowcase } from '@/components/landing/PressReleasesShowcase'
import { NewsSection } from '@/components/landing/NewsSection'
import { JournalistCTASection } from '@/components/landing/JournalistCTASection'
import { Footer } from '@/components/landing/Footer'

function resolveApiBaseUrl(): string {
  const apiUrl = process.env.API_URL?.trim()
  if (apiUrl) return apiUrl.replace(/\/$/, '')

  const appUrl = process.env.APP_URL?.trim()
  if (appUrl) {
    try {
      return new URL(appUrl).origin
    } catch {
      // Ignora APP_URL inválido e segue para fallback local.
    }
  }

  return 'http://localhost:3001'
}

async function fetchFromCandidates<T>(paths: string[], revalidate: number): Promise<T | null> {
  const base = resolveApiBaseUrl()

  for (const path of paths) {
    try {
      const controller = new AbortController()
      const t = setTimeout(() => controller.abort(), 3000)
      const res = await fetch(`${base}${path}`, {
        next: { revalidate },
        signal: controller.signal,
      })
      clearTimeout(t)
      if (!res.ok) continue
      return (await res.json()) as T
    } catch {
      // Tenta o próximo endpoint candidato.
    }
  }

  return null
}

async function getPlans(): Promise<Plan[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await fetchFromCandidates<any[]>(
    ['/api/v1/subscriptions/plans', '/api/subscriptions/plans'],
    3600,
  )
  if (!Array.isArray(data)) return []

  return data.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description ?? undefined,
    price: Math.round(Number(p.priceMonthlyAoa)),
    maxSendsMonth: p.maxSendsMonth ?? 0,
    maxJournalists: p.maxJournalists ?? 9999,
    features: Array.isArray(p.features) ? p.features : [],
  }))
}

async function getFeatured(): Promise<FeaturedPressRelease[]> {
  const data = await fetchFromCandidates<FeaturedPressRelease[]>(
    ['/api/v1/press-releases/public/featured', '/api/press-releases/public/featured'],
    300,
  )
  return Array.isArray(data) ? data : []
}

async function getPublicStats(): Promise<HeroStats | undefined> {
  const data = await fetchFromCandidates<HeroStats>(
    ['/api/v1/admin/public-stats', '/api/admin/public-stats'],
    600,
  )
  return data ?? undefined
}

export default async function HomePage() {
  const [plans, featured, heroStats, landingContent] = await Promise.all([
    getPlans(),
    getFeatured(),
    getPublicStats(),
    getLandingContent(),
  ])
  return (
    <>
      <NavBar />
      <main>
        <HeroSection stats={heroStats} content={landingContent.hero} />
        <StatsBar stats={heroStats} />
        <AboutSection stats={heroStats} content={landingContent.about} />
        <HowItWorksSection content={landingContent.howItWorks} />
        <PressReleasesShowcase featured={featured} />
        <ForWhoSection />
        <NewsSection content={landingContent.news} />
        <PricingSection plans={plans} content={landingContent.pricing} />
        <JournalistCTASection content={landingContent.journalistCta} />
      </main>
      <Footer />
    </>
  )
}
