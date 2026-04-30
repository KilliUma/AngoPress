export default function AntiSpamPage() {
  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-12">
      <article className="mx-auto max-w-3xl rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-neutral-900">Política Anti-spam</h1>
        <p className="mt-4 text-neutral-600">
          A AngoPress foi criada para comunicação profissional com a imprensa, não para envio de
          mensagens não solicitadas ou campanhas abusivas.
        </p>
        <h2 className="mt-8 text-lg font-semibold text-neutral-900">Regras de envio</h2>
        <p className="mt-2 text-neutral-600">
          Todos os envios devem identificar claramente a entidade remetente, respeitar o contexto
          editorial dos destinatários e incluir mecanismo de descadastro.
        </p>
        <h2 className="mt-8 text-lg font-semibold text-neutral-900">Descadastro</h2>
        <p className="mt-2 text-neutral-600">
          Jornalistas podem cancelar a recepção através do link de opt-out presente nos emails. Após
          o descadastro, o contacto é bloqueado para novos envios.
        </p>
        <h2 className="mt-8 text-lg font-semibold text-neutral-900">Reputação</h2>
        <p className="mt-2 text-neutral-600">
          Reclamações, bounces permanentes e abuso podem resultar na suspensão da conta.
        </p>
      </article>
    </main>
  )
}
