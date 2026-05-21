function RotasManutencao({
  clientesDaRota,
  rotaSelecionada,
  buscarCliente,
  modoReordenar,
  alterarSequenciaClienteRota,
  alterarStatusClienteRota,
  abrirMaps,
  removerClienteDaRota,
}) {
  return (
    <div className="painel-manutencao">
      <h2>Manutenção da Rota</h2>

      <div className="lista-manutencao">
        {clientesDaRota.map((item) => {
          const cliente = buscarCliente(item);

          return (
            <div
              className="card-manutencao"
              key={item.id}
            >
              <div className="card-manutencao-topo">

                <div className="card-manutencao-seq">
                  {modoReordenar ? (
                    <input
                      type="text"
                      inputMode="numeric"
                      className="input-sequencia-mini"
                      value={item.sequencia || ""}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) =>
                        alterarSequenciaClienteRota(
                          item,
                          e.target.value
                        )
                      }
                    />
                  ) : (
                    item.sequencia || "-"
                  )}
                </div>

                <div className="card-manutencao-info">

                  <h3>
                    {cliente?.cliente}
                  </h3>

                  <p>
                    <strong>Cidade:</strong>{" "}
                    {cliente?.cidade} / {cliente?.uf}
                  </p>

                  <p>
                    <strong>Status:</strong>{" "}
                    {item.status || "PENDENTE"}
                  </p>

                </div>
              </div>

              <div className="card-manutencao-acoes">

                <button
                  type="button"
                  className="btn-mini-status pendente"
                  onClick={() =>
                    alterarStatusClienteRota(
                      item,
                      "PENDENTE"
                    )
                  }
                >
                  Pendente
                </button>

                <button
                  type="button"
                  className="btn-mini-status visitado"
                  onClick={() =>
                    alterarStatusClienteRota(
                      item,
                      "VISITADO"
                    )
                  }
                >
                  Visitado
                </button>

                <button
                  type="button"
                  className="btn-mini-status cancelado"
                  onClick={() =>
                    alterarStatusClienteRota(
                      item,
                      "CANCELADO"
                    )
                  }
                >
                  Cancelado
                </button>

                <button
                  type="button"
                  className="btn-mini-status mapa"
                  onClick={() =>
                    abrirMaps(cliente)
                  }
                >
                  Waze
                </button>

                {rotaSelecionada.status === "ABERTA" && (
                  <button
                    type="button"
                    className="btn-mini-status remover"
                    onClick={() =>
                      removerClienteDaRota(item)
                    }
                  >
                    Remover
                  </button>
                )}

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RotasManutencao;