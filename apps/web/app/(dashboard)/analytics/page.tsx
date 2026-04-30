import { BarChart2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Analytics</h1>
        <p className="text-neutral-500 mt-1">Acompanhe o desempenho das suas campanhas.</p>
      </div>
      <Card>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-sky-50 flex items-center justify-center mb-4">
            <BarChart2 size={28} className="text-sky-500" />
          </div>
          <h2 className="text-lg font-semibold text-neutral-800">Em desenvolvimento</h2>
          <p className="text-sm text-neutral-500 mt-2 max-w-sm">
            O módulo de analytics estará disponível em breve. Aqui verá taxas de abertura, cliques e
            relatórios detalhados por campanha.
          </p>
        </div>
      </Card>
    </div>
  )
}
