import { NavBar } from '@/components/landing/NavBar'
import { Footer } from '@/components/landing/Footer'

export default function PressReleasesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavBar transparentUntil={160} />
      {children}
      <Footer />
    </>
  )
}
