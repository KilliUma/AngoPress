import { Megaphone } from 'lucide-react'
import { Card } from '@/components/ui/Card'

export default function CampanhasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Campanhas</h1>
        <p className="text-neutral-500 mt-1">Gerencie e envie campanhas de press release.</p>
      </div>
      <Card>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-violet-50 flex items-center justify-center mb-4">
            <Megaphone size={28} className="text-violet-500" />
          </div>
          <h2 className="text-lg font-semibold text-neutral-800">Em desenvolvimento</h2>
          <p className="text-sm text-neutral-500 mt-2 max-w-sm">
            O módulo de campanhas estará disponível em breve. Aqui poderá criar, agendar e
            acompanhar os seus envios.
          </p>
        </div>
      </Card>
    </div>
  )
}
