import { LegalDocumentPage } from '@/components/legal/LegalDocumentPage'
import { getLegalContent } from '@/lib/cms'
import type { Metadata } from 'next'
import { ShieldCheck } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Política de Privacidade — AngoPress',
  description: 'Como a AngoPress recolhe, usa e protege os seus dados pessoais.',
}

export const revalidate = 3600

export default async function PrivacidadePage() {
  const { privacidade } = await getLegalContent()

  return (
    <LegalDocumentPage
      doc={privacidade}
      indexIcon={ShieldCheck}
      alternateHref="/termos"
      alternateLabel="Termos de Uso"
      contactPrefix="Questões sobre privacidade? Contacte"
    />
  )
}
