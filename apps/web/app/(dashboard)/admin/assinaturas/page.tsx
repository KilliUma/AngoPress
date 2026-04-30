import { CreditCard } from 'lucide-react'

export const metadata = {
  title: 'Assinaturas | Admin',
}

export default function SubscriptionsAdminPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Assinaturas</h1>
        <p className="text-neutral-600 mt-1">Gestão de subscrições ativas e facturação.</p>
      </div>
      <div className="bg-white border rounded-xl p-12 text-center flex flex-col items-center">
        <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center mb-4">
          <CreditCard size={24} />
        </div>
        <h3 className="text-lg font-medium text-neutral-900">Página em Desenvolvimento</h3>
        <p className="text-neutral-500 max-w-sm mt-2">
          Esta funcionalidade de administração estará disponível em breve.
        </p>
      </div>
    </div>
  )
}
