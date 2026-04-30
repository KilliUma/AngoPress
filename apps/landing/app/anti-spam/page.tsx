export default function AntiSpamPage() {
  return (
    <main className="min-h-screen bg-[rgb(var(--background))] px-4 py-16 text-white">
      <article className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold">Política Anti-spam</h1>
        <p className="mt-5 text-white/60">
          Todos os envios devem identificar o remetente, respeitar o contexto editorial dos
          jornalistas e incluir link de descadastro.
        </p>
        <h2 className="mt-10 text-xl font-semibold">Opt-out</h2>
        <p className="mt-3 text-white/60">
          Contactos que cancelam a recepção ficam bloqueados para novos envios na plataforma.
        </p>
      </article>
    </main>
  )
}
