import { useState } from "react";
import {
  Tag,
  MapPin,
  Map,
  Phone,
  MessageCircle,
  Navigation,
  Trash2,
  CheckCircle,
Lock,
ArrowUpDown,
ClipboardList,
Wrench
} from "lucide-react";
import RotasLista from "./RotasLista.jsx";
import RotasTopoDetalhe from "./RotasTopoDetalhe.jsx";

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
  abrirMaps,
  abrirWhatsApp,
  removerClienteDaRota,
  fecharRota,
  alterarStatusClienteRota,
  excluirRota,
  reabrirRota,
  abrirRotaCompleta,
  alterarSequenciaClienteRota,
iniciarRota,
finalizarRota,
perfil,
usuarioId,
}) {
  const [modoReordenar, setModoReordenar] = useState(false);
const clienteAtual = clientesDaRota.find(
  (item) =>
    item.status === "PENDENTE" ||
    !item.status
);

const [abaRota, setAbaRota] = useState("operacao");
const [modoTelaRota, setModoTelaRota] = useState("lista");

const proximosClientes = clientesDaRota.filter(
  (item) =>
    item.id !== clienteAtual?.id &&
    (item.status === "PENDENTE" || !item.status)
);

const totalClientes = clientesDaRota.length;

const totalVisitados = clientesDaRota.filter(
  (item) => item.status === "VISITADO"
).length;

const totalCancelados = clientesDaRota.filter(
  (item) => item.status === "CANCELADO"
).length;

const totalPendentes = clientesDaRota.filter(
  (item) =>
    item.status === "PENDENTE" ||
    !item.status
).length;

const percentualConcluido =
  totalClientes > 0
    ? Math.round(
        ((totalVisitados + totalCancelados) /
          totalClientes) *
          100
      )
    : 0;


  function buscarCliente(item) {
    return clientes.find((cli) => cli.id === item.cliente_id);
  }



  return (
  <section className="painel">
    {!rotaSelecionada ? (
      <RotasLista
  rotas={rotas}
  nomeNovaRota={nomeNovaRota}
  setNomeNovaRota={setNomeNovaRota}
  criarRota={criarRota}
  abrirRota={abrirRota}
  abrirRotaCompleta={abrirRotaCompleta}
  excluirRota={excluirRota}
  setAbaRota={setAbaRota}
  setModoTelaRota={setModoTelaRota}
/>
      ) : (
        <>
        <RotasTopoDetalhe
  rotaSelecionada={rotaSelecionada}
  clientesDaRota={clientesDaRota}
  abrirRota={abrirRota}
  setModoTelaRota={setModoTelaRota}
  perfil={perfil}
  usuarioId={usuarioId}
  reabrirRota={reabrirRota}
  finalizarRota={finalizarRota}
/>  


          {rotaSelecionada.observacao && (
  <div className="historico-rota">
    <strong>Histórico:</strong>
    <span>{rotaSelecionada.observacao}</span>
  </div>
)}

{modoTelaRota === "execucao" && (
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

{(rotaSelecionada.status === "FECHADA" ||
  rotaSelecionada.status === "FINALIZADA") && (
  <button
    type="button"
    onClick={() => reabrirRota(rotaSelecionada)}
  >
    <Lock size={16} />
    Reabrir rota
  </button>
)}

  {rotaSelecionada.status === "ABERTA" && (
    <>
      <div className="grupo-botoes-rota">

  {!modoReordenar ? (
    <button
  type="button"
  className="btn-rota-acao"
  onClick={() => setModoReordenar(true)}
    >
      <>
  <ArrowUpDown size={16} />
  Reordenar rota
</>
    </button>
  ) : (
    <button
  type="button"
  className="btn-rota-acao"
  onClick={() => setModoReordenar(false)}
>
      <>
  <ArrowUpDown size={16} />
  Finalizar reordenação
</>
    </button>
  )}

  <button
    type="button"
    className={
      abaRota === "operacao"
        ? "aba-rota ativa"
        : "aba-rota"
    }
    onClick={() => setAbaRota("operacao")}
  >
    <>
  <ClipboardList size={16} />
  Operação
</>
  </button>

  <button
    type="button"
    className={
      abaRota === "manutencao"
        ? "aba-rota ativa"
        : "aba-rota"
    }
    onClick={() => setAbaRota("manutencao")}
  >
    <>
  <Wrench size={16} />
   Manutenção
</>
  </button>

</div>
    </>
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
                    <p><strong>Código:</strong> {cliente.codigo_cliente}</p>
                    <p><strong>Cidade:</strong> {cliente.cidade} / {cliente.uf}</p>

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

      <p>
        {percentualConcluido}% concluído
      </p>
    </div>

    <div className="progresso-percentual">
      {percentualConcluido}%
    </div>

  </div>
</div>
  
  

  <div className="barra-progresso">
    <div
      className="barra-progresso-fill"
      style={{
        width: `${percentualConcluido}%`,
      }}
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
  <div className="cliente-atual-pin">
    📍
  </div>

  <div className="cliente-atual-dados">
    <div className="cliente-atual-titulo">
      <h3>{buscarCliente(clienteAtual)?.cliente}</h3>

      <span>
        {clienteAtual.sequencia}º da rota
      </span>
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
        onClick={() =>
          alterarStatusClienteRota(
            clienteAtual,
            "VISITADO"
          )
        }
      >
        ✔ Marcar visitado
      </button>

      <button
        className="btn-atual-waze"
        onClick={() =>
          abrirMaps(
            buscarCliente(clienteAtual)
          )
        }
      >
        🧭 Abrir Waze
      </button>

      <button
        className="btn-atual-cancelar"
        onClick={() =>
          alterarStatusClienteRota(
            clienteAtual,
            "CANCELADO"
          )
        }
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

            <p>
              {cliente?.endereco_completo || "-"}
            </p>

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
)}

{modoTelaRota === "planejamento" && (
  <div className="painel-planejamento-rota">
    <h2>Planejamento da Rota</h2>

    <p>
      Use esta área para adicionar clientes, organizar sequência e preparar a rota antes da execução.
    </p>
<div className="clientes-planejados-rota">
  <h3>Clientes da Rota</h3>

  {clientesDaRota.length === 0 ? (
    <p>Nenhum cliente adicionado nesta rota.</p>
  ) : (
    <div className="lista-planejamento-rota">
      {clientesDaRota.map((item) => {
        const cliente = buscarCliente(item);

        return (
          <div className="linha-planejamento-rota" key={item.id}>
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

            <div>
              <strong>{cliente?.cliente || "Cliente sem nome"}</strong>
              <span>
                {cliente?.cidade || "-"} / {cliente?.uf || "-"}
              </span>
            </div>

            <button
              type="button"
              className="btn-mini-status remover"
              onClick={() => removerClienteDaRota(item)}
            >
              Remover
            </button>
          </div>
        );
      })}
    </div>
  )}
</div>

    <div className="barra-acoes-rota">
      <input
        type="text"
        className="input-busca-rota"
        placeholder="Buscar cliente para adicionar..."
        value={buscaClienteRota}
        onChange={(e) => setBuscaClienteRota(e.target.value)}
      />

      {rotaSelecionada.status === "ABERTA" && (
        <button
          type="button"
          className="btn-rota-acao"
          onClick={() => setModoReordenar(!modoReordenar)}
        >
          Reordenar rota
        </button>
      )}

      {rotaSelecionada.status === "ABERTA" && (
        <button
          type="button"
          onClick={() => fecharRota(rotaSelecionada)}
        >
          Fechar rota
        </button>
      )}
      {(rotaSelecionada.status === "FECHADA" ||
  rotaSelecionada.status === "FINALIZADA") &&
  (perfil?.tipo_perfil === "admin" ||
    rotaSelecionada.criado_por === usuarioId) && (
    <button type="button" onClick={() => reabrirRota(rotaSelecionada)}>
      Reabrir rota
    </button>
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
              <p><strong>Código:</strong> {cliente.codigo_cliente}</p>
              <p><strong>Cidade:</strong> {cliente.cidade} / {cliente.uf}</p>

              <button
                type="button"
                onClick={() => adicionarClienteNaRota(cliente)}
              >
                Adicionar
              </button>
            </div>
          ))}
      </div>
    )}
  </div>
)}
      
         
{abaRota === "manutencao" && (
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
        alterarSequenciaClienteRota(item, e.target.value)
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
              <strong>Cidade:</strong>
              {" "}
              {cliente?.cidade} / {cliente?.uf}
            </p>

            <p>
              <strong>Status:</strong>
              {" "}
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
    onClick={() => removerClienteDaRota(item)}
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
)}

     
  </>

)}
    </section>
  );
}

export default Rotas;