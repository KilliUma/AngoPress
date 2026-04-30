import { NavBar } from '@/components/landing/NavBar'
import { Footer } from '@/components/landing/Footer'

export default function NoticiasLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavBar />
      <div className="pt-16">{children}</div>
      <Footer />
    </>
  )
}
