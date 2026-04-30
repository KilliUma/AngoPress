export default function PrivacidadePage() {
  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-12">
      <article className="mx-auto max-w-3xl rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-neutral-900">Política de Privacidade</h1>
        <p className="mt-4 text-neutral-600">
          A AngoPress recolhe apenas os dados necessários para gerir contas, assinaturas,
          jornalistas, campanhas e métricas de desempenho dos envios.
        </p>
        <h2 className="mt-8 text-lg font-semibold text-neutral-900">Dados tratados</h2>
        <p className="mt-2 text-neutral-600">
          Podemos tratar nome, email, empresa, telefone, dados de plano, contactos de jornalistas,
          histórico de campanhas e eventos técnicos como entrega, abertura, clique e descadastro.
        </p>
        <h2 className="mt-8 text-lg font-semibold text-neutral-900">Finalidade</h2>
        <p className="mt-2 text-neutral-600">
          Os dados são usados para prestar o serviço, garantir segurança, cumprir pedidos de
          descadastro, gerar relatórios e apoiar a operação comercial da plataforma.
        </p>
        <h2 className="mt-8 text-lg font-semibold text-neutral-900">Contacto</h2>
        <p className="mt-2 text-neutral-600">
          Para pedidos de acesso, correcção ou remoção, contacte suporte@angopress.ao.
        </p>
      </article>
    </main>
  )
}
