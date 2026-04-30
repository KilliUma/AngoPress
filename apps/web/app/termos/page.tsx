export default function TermosPage() {
  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-12">
      <article className="mx-auto max-w-3xl rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-neutral-900">Termos de Uso</h1>
        <p className="mt-4 text-neutral-600">
          Ao usar a AngoPress, o cliente compromete-se a enviar comunicações legítimas,
          identificáveis e relacionadas com assessoria de imprensa ou comunicação institucional.
        </p>
        <h2 className="mt-8 text-lg font-semibold text-neutral-900">Uso permitido</h2>
        <p className="mt-2 text-neutral-600">
          É proibido usar a plataforma para spam, conteúdos ilegais, falsas identidades ou
          comunicações que violem direitos de terceiros.
        </p>
        <h2 className="mt-8 text-lg font-semibold text-neutral-900">Assinaturas</h2>
        <p className="mt-2 text-neutral-600">
          Os planos são activados manualmente após confirmação de pagamento. A AngoPress pode
          suspender contas com pagamentos pendentes, abuso de envio ou reclamações recorrentes.
        </p>
        <h2 className="mt-8 text-lg font-semibold text-neutral-900">Suporte</h2>
        <p className="mt-2 text-neutral-600">Dúvidas sobre estes termos: suporte@angopress.ao.</p>
      </article>
    </main>
  )
}
