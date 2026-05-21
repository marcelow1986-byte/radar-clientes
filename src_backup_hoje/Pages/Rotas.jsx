function Rotas({
  rotas,
  nomeNovaRota,
  setNomeNovaRota,
  criarRota,
  abrirRota,
  rotaSelecionada,
  clientesDaRota,
  buscaClienteRota,
  setBuscaClienteRota,
  clientes,
  adicionarClienteNaRota,
}) {
  return (
    <section className="painel">
      <h2>🛣️ Rotas Alterado</h2>

      <div className="form-rota">
        <input
          type="text"
          placeholder="Nome da rota. Ex: Rota 19/05/2026"
          value={nomeNovaRota}
          onChange={(e) => setNomeNovaRota(e.target.value)}
        />

        <button type="button" onClick={criarRota}>
          Criar rota
        </button>
      </div>

      <h3>Minhas rotas</h3>

      {rotas.length === 0 ? (
        <p>Nenhuma rota criada ainda.</p>
      ) : (
        <div className="grid-rotas">
          {rotas.map((rota) => (
            <div className="card-rota" key={rota.id}>
              <h3>{rota.nome}</h3>

              <p>
                <strong>Status:</strong> {rota.status}
              </p>

              <p>
                <strong>Data:</strong> {rota.data_rota || "-"}
              </p>

              <p>
                <strong>Clientes:</strong> {rota.total_clientes || 0}
              </p>

              <button
  type="button"
  onClick={() => {
    alert("Clique chegou no botão Ver rota");
  }}
>
  Ver rota
</button>
            </div>
          ))}
        </div>
      )}
{rotaSelecionada && (
  <div className="rota-detalhe">
    <h3>Rota aberta: {rotaSelecionada.nome}</h3>

    <p>
      <strong>Total de clientes na rota:</strong>{" "}
      {clientesDaRota.length}
    </p>
<div className="rota-adicionar-cliente">
  <input
    type="text"
    placeholder="Buscar cliente para adicionar..."
    value={buscaClienteRota}
    onChange={(e) => setBuscaClienteRota(e.target.value)}
  />
</div>

{buscaClienteRota.trim() !== "" && (
  <div className="grid-clientes-rota">
    {clientes
      .filter((cliente) => {
        const termo = buscaClienteRota.toLowerCase();

        return (
          cliente.cliente?.toLowerCase().includes(termo) ||
          cliente.codigo_cliente?.toLowerCase().includes(termo) ||
          cliente.cidade?.toLowerCase().includes(termo)
        );
      })
      .slice(0, 20)
      .map((cliente) => (
        <div className="card-cliente-rota" key={cliente.id}>
          <h3>{cliente.cliente}</h3>

          <p>
            <strong>Código:</strong> {cliente.codigo_cliente}
          </p>

          <p>
            <strong>Cidade:</strong> {cliente.cidade} / {cliente.uf}
          </p>

          <button
            type="button"
            onClick={() => adicionarClienteNaRota(cliente)}
          >
            Adicionar na rota
          </button>
        </div>
      ))}
  </div>
)}

    {clientesDaRota.length === 0 ? (
      <p>Nenhum cliente adicionado nesta rota.</p>
    ) : (
      <div className="grid-clientes-rota">
        {clientesDaRota.map((item) => (
          <div className="card-cliente-rota" key={item.id}>
            <h3>Cliente ID: {item.cliente_id}</h3>

            <p>
              <strong>Sequência:</strong> {item.sequencia || "-"}
            </p>

            <p>
              <strong>Status:</strong> {item.status || "PENDENTE"}
            </p>

            <p>
              <strong>Visitado:</strong>{" "}
              {item.visitado ? "Sim" : "Não"}
            </p>
          </div>
        ))}
      </div>
    )}
  </div>
)}
)}
    </section>
  );
}

export default Rotas;