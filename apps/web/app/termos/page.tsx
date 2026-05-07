import { LegalDocumentPage } from '@/components/legal/LegalDocumentPage'
import { getLegalContent } from '@/lib/cms'
import type { Metadata } from 'next'
import { FileText } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Termos de Uso — AngoPress',
  description: 'Condições que regem o uso da plataforma AngoPress.',
}

export const revalidate = 3600

export default async function TermosPage() {
  const { termos } = await getLegalContent()

  return (
    <LegalDocumentPage
      doc={termos}
      indexIcon={FileText}
      alternateHref="/privacidade"
      alternateLabel="Política de Privacidade"
      contactPrefix="Dúvidas sobre estes termos? Contacte"
    />
  )
}
