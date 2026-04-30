export interface Plan {
  id: string
  name: string
  description?: string
  price: number
  maxSendsMonth: number
  maxJournalists: number
  features: string[]
}

export interface FeaturedPressRelease {
  id: string
  title: string
  summary: string | null
  publishedAt: string | null
  user: { name: string; company: string | null }
}
