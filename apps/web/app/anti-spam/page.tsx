import { LegalDocumentPage } from '@/components/legal/LegalDocumentPage'
import { getLegalContent } from '@/lib/cms'
import type { Metadata } from 'next'
import { ShieldAlert } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Política Anti-spam — AngoPress',
  description: 'Diretrizes para garantir comunicações responsáveis e éticas na plataforma.',
}

export const revalidate = 3600

export default async function AntiSpamPage() {
  const { antiSpam } = await getLegalContent()

  return (
    <LegalDocumentPage
      doc={antiSpam}
      indexIcon={ShieldAlert}
      alternateHref="/privacidade"
      alternateLabel="Política de Privacidade"
      contactPrefix="Dúvidas sobre esta política? Contacte"
    />
  )
}
