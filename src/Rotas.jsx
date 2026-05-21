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
import RotasOperacao from "./RotasOperacao.jsx";

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
abrirAcompanhamento,
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
  <RotasOperacao
    rotaSelecionada={rotaSelecionada}
    clientesDaRota={clientesDaRota}
    buscaClienteRota={buscaClienteRota}
    setBuscaClienteRota={setBuscaClienteRota}
    clientes={clientes}
    adicionarClienteNaRota={adicionarClienteNaRota}
    fecharRota={fecharRota}
    modoReordenar={modoReordenar}
    setModoReordenar={setModoReordenar}
    abaRota={abaRota}
    setAbaRota={setAbaRota}
    clienteAtual={clienteAtual}
    proximosClientes={proximosClientes}
    totalClientes={totalClientes}
    totalVisitados={totalVisitados}
    totalPendentes={totalPendentes}
    totalCancelados={totalCancelados}
    percentualConcluido={percentualConcluido}
    buscarCliente={buscarCliente}
    alterarSequenciaClienteRota={alterarSequenciaClienteRota}
    alterarStatusClienteRota={alterarStatusClienteRota}
    abrirMaps={abrirMaps}
    abrirAcompanhamento={abrirAcompanhamento}
    reabrirRota={reabrirRota}
  />

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