import { Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-800 to-brand-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white tracking-tight">
            <span className="inline-flex items-center gap-2">
              <span className="w-10 h-10 rounded-full border-4 border-white flex items-center justify-center text-white font-black text-xl">
                A
              </span>
              Press
            </span>
          </h1>
          <p className="text-brand-300 mt-2 text-sm">Plataforma Digital de Mailing de Imprensa</p>
        </div>

        {/* Formulário */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
