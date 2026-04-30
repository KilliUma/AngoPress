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

async function getPlans(): Promise<Plan[]> {
  try {
    const res = await fetch(`${process.env.API_URL}/api/v1/subscriptions/plans`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any[] = await res.json()
    return data.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description ?? undefined,
      price: Math.round(Number(p.priceMonthlyAoa)),
      maxSendsMonth: p.maxSendsMonth ?? 0,
      maxJournalists: p.maxJournalists ?? 9999,
      features: Array.isArray(p.features) ? p.features : [],
    }))
  } catch {
    return []
  }
}

async function getFeatured(): Promise<FeaturedPressRelease[]> {
  try {
    const res = await fetch(`${process.env.API_URL}/api/v1/press-releases/public/featured`, {
      next: { revalidate: 300 },
    })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

async function getPublicStats(): Promise<HeroStats | undefined> {
  try {
    const res = await fetch(`${process.env.API_URL}/api/v1/admin/public-stats`, {
      next: { revalidate: 600 },
    })
    if (!res.ok) return undefined
    return res.json()
  } catch {
    return undefined
  }
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
