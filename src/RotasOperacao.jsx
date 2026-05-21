import {
  Lock,
  ArrowUpDown,
  ClipboardList,
  Wrench,
} from "lucide-react";

function RotasOperacao({
  rotaSelecionada,
  clientesDaRota,
  buscaClienteRota,
  setBuscaClienteRota,
  clientes,
  adicionarClienteNaRota,
  fecharRota,
  modoReordenar,
  setModoReordenar,
  abaRota,
  setAbaRota,
  clienteAtual,
  proximosClientes,
  totalClientes,
  totalVisitados,
  totalPendentes,
  totalCancelados,
  percentualConcluido,
  buscarCliente,
  alterarSequenciaClienteRota,
  alterarStatusClienteRota,
  abrirMaps,
  abrirAcompanhamento,
  reabrirRota,
}) {
  return (
    <>
      <div className="barra-acoes-rota">
        <input
          type="text"
          className="input-busca-rota"
          placeholder="Buscar cliente para adicionar..."
          value={buscaClienteRota}
          onChange={(e) => setBuscaClienteRota(e.target.value)}
        />

        {rotaSelecionada.status === "ABERTA" && (
          <button type="button" onClick={() => fecharRota(rotaSelecionada)}>
            <Lock size={16} />
            Fechar rota
          </button>
        )}

        {rotaSelecionada.status === "ABERTA" && (
          <div className="grupo-botoes-rota">
            {!modoReordenar ? (
              <button
                type="button"
                className="btn-rota-acao"
                onClick={() => setModoReordenar(true)}
              >
                <ArrowUpDown size={16} />
                Reordenar rota
              </button>
            ) : (
              <button
                type="button"
                className="btn-rota-acao"
                onClick={() => setModoReordenar(false)}
              >
                <ArrowUpDown size={16} />
                Finalizar reordenação
              </button>
            )}

            <button
              type="button"
              className={abaRota === "operacao" ? "aba-rota ativa" : "aba-rota"}
              onClick={() => setAbaRota("operacao")}
            >
              <ClipboardList size={16} />
              Operação
            </button>

            <button
              type="button"
              className={abaRota === "manutencao" ? "aba-rota ativa" : "aba-rota"}
              onClick={() => setAbaRota("manutencao")}
            >
              <Wrench size={16} />
              Manutenção
            </button>
          </div>
        )}
      </div>

      {buscaClienteRota.trim() !== "" && (
        <div className="grid-clientes">
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
              <div className="card-cliente" key={cliente.id}>
                <h3>{cliente.cliente}</h3>
                <p>
                  <strong>Código:</strong> {cliente.codigo_cliente}
                </p>
                <p>
                  <strong>Cidade:</strong> {cliente.cidade} / {cliente.uf}
                </p>

                <button type="button" onClick={() => adicionarClienteNaRota(cliente)}>
                  Adicionar
                </button>
              </div>
            ))}
        </div>
      )}

      {abaRota === "operacao" && (
        <div className="layout-operacao-rota">
          <div className="coluna-esquerda-rota">
            <div className="painel-progresso-rota">
              <div className="progresso-topo">
                <div>
                  <h2>Progresso da Rota</h2>
                  <p>{percentualConcluido}% concluído</p>
                </div>

                <div className="progresso-percentual">
                  {percentualConcluido}%
                </div>
              </div>
            </div>

            <div className="barra-progresso">
              <div
                className="barra-progresso-fill"
                style={{ width: `${percentualConcluido}%` }}
              />
            </div>

            <div className="cards-resumo-rota">
              <div className="card-resumo-rota">
                <strong>{totalClientes}</strong>
                <span>Total</span>
              </div>

              <div className="card-resumo-rota">
                <strong>{totalVisitados}</strong>
                <span>Visitados</span>
              </div>

              <div className="card-resumo-rota">
                <strong>{totalPendentes}</strong>
                <span>Pendentes</span>
              </div>

              <div className="card-resumo-rota">
                <strong>{totalCancelados}</strong>
                <span>Cancelados</span>
              </div>
            </div>
          </div>

          <div className="coluna-direita-rota">
            <div className="cabecalho-operacao-rota">
              <div>
                <h2>Execução da Rota</h2>
                <p>Acompanhe o cliente atual e os próximos atendimentos.</p>
              </div>

              <span className="status-execucao-rota">
                {rotaSelecionada.status}
              </span>
            </div>

            {clienteAtual && (
              <div className="painel-cliente-atual">
                <div className="painel-atual-header">
                  <h2>Cliente Atual</h2>

                  <span className="badge-atual">
                    {clienteAtual.sequencia}º da rota
                  </span>
                </div>

                <div className="cliente-atual-linha">
                  <div className="cliente-atual-pin">📍</div>

                  <div className="cliente-atual-dados">
                    <div className="cliente-atual-titulo">
                      <h3>{buscarCliente(clienteAtual)?.cliente}</h3>

                      <span>{clienteAtual.sequencia}º da rota</span>
                    </div>

                    <p>
                      <strong>Endereço:</strong>{" "}
                      {buscarCliente(clienteAtual)?.endereco_completo || "-"}
                    </p>

                    <p>
                      <strong>Cidade:</strong>{" "}
                      {buscarCliente(clienteAtual)?.cidade || "-"} /{" "}
                      {buscarCliente(clienteAtual)?.uf || "-"}
                    </p>

                    <p>
                      <strong>Telefone:</strong>{" "}
                      {buscarCliente(clienteAtual)?.telefone || "-"}
                    </p>
                  </div>
                </div>

                <div className="cliente-atual-acoes-linha">
                  <button
                    className="btn-atual-visitar"
                    onClick={() => alterarStatusClienteRota(clienteAtual, "VISITADO")}
                  >
                    ✔ Marcar visitado
                  </button>

                  <button
                    className="btn-atual-waze"
                    onClick={() => abrirMaps(buscarCliente(clienteAtual))}
                  >
                    🧭 Abrir Waze
                  </button>
				  
				    < button
				   className = "btn-atual-acompanhamento"
				       onClick = {
				       () =>
				       abrirAcompanhamento(
				           buscarCliente(clienteAtual))
				   }
				    >
				   📋 Acompanhamento
				   <  / button >

                  <button
                    className="btn-atual-cancelar"
                    onClick={() => alterarStatusClienteRota(clienteAtual, "CANCELADO")}
                  >
                    ✖ Cancelar
                  </button>
                </div>
              </div>
            )}

            <div className="painel-proximos-clientes">
              <div className="proximos-clientes-topo">
                <h2>Próximos Clientes</h2>
                <span>{proximosClientes.length} pendentes</span>
              </div>

              <div className="lista-proximos-clientes">
                {proximosClientes.map((item) => {
                  const cliente = buscarCliente(item);

                  return (
                    <div className="linha-proximo-cliente" key={item.id}>
                      <div className="linha-proximo-seq">
                        {modoReordenar ? (
                          <input
                            type="text"
                            inputMode="numeric"
                            className="input-sequencia-mini"
                            value={item.sequencia || ""}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) =>
                              alterarSequenciaClienteRota(item, e.target.value)
                            }
                          />
                        ) : (
                          item.sequencia || "-"
                        )}
                      </div>

                      <div className="linha-proximo-info">
                        <h3>{cliente?.cliente || "Cliente sem nome"}</h3>
                        <p>{cliente?.endereco_completo || "-"}</p>
                        <small>
                          {cliente?.cidade || "-"} / {cliente?.uf || "-"}
                        </small>
                      </div>

                      <div className="linha-proximo-status">
                        <strong>{item.status || "PENDENTE"}</strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default RotasOperacao;