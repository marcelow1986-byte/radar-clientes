import { useState } from "react";
import {
  Tag,
  MapPin,
  Map,
  Phone,
  MessageCircle,
  Navigation,
  Trash2,
  CheckCircle
} from "lucide-react";
import RotasLista from "./RotasLista.jsx";
import RotasTopoDetalhe from "./RotasTopoDetalhe.jsx";
import RotasOperacao from "./RotasOperacao.jsx";
import RotasManutencao from "./RotasManutencao.jsx";
import RotasPlanejamento from "./RotasPlanejamento.jsx";
import RotasBarraAcoes from "./RotasBarraAcoes.jsx";


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
ordenarRotaPorDistancia,
usuariosPerfis,
usuarioResponsavelRota,
setUsuarioResponsavelRota,
filtroResponsavelRotas,
setFiltroResponsavelRotas,
alterarResponsavelRota,
filtroStatusRotas,
setFiltroStatusRotas,
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
  perfil={perfil}
usuariosPerfis={usuariosPerfis}
usuarioResponsavelRota={usuarioResponsavelRota}
setUsuarioResponsavelRota={setUsuarioResponsavelRota}
  setAbaRota={setAbaRota}
  setModoTelaRota={setModoTelaRota}
  filtroResponsavelRotas={filtroResponsavelRotas}
setFiltroResponsavelRotas={setFiltroResponsavelRotas}
filtroStatusRotas={filtroStatusRotas}
setFiltroStatusRotas={setFiltroStatusRotas}
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

          <RotasBarraAcoes
  rotaSelecionada={rotaSelecionada}
  buscaClienteRota={buscaClienteRota}
  setBuscaClienteRota={setBuscaClienteRota}
  fecharRota={fecharRota}
  reabrirRota={reabrirRota}
  modoReordenar={modoReordenar}
  setModoReordenar={setModoReordenar}
  abaRota={abaRota}
  setAbaRota={setAbaRota}
/>

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

{abaRota === "manutencao" && (
  <RotasManutencao
    clientesDaRota={clientesDaRota}
    rotaSelecionada={rotaSelecionada}
    buscarCliente={buscarCliente}
    modoReordenar={modoReordenar}
    alterarSequenciaClienteRota={alterarSequenciaClienteRota}
    alterarStatusClienteRota={alterarStatusClienteRota}
    abrirMaps={abrirMaps}
    removerClienteDaRota={removerClienteDaRota}
  />
)} 
  </>
)}

{modoTelaRota === "planejamento" && (
  <RotasPlanejamento
    rotaSelecionada={rotaSelecionada}
    clientesDaRota={clientesDaRota}
    clientes={clientes}
    buscaClienteRota={buscaClienteRota}
    setBuscaClienteRota={setBuscaClienteRota}
    buscarCliente={buscarCliente}
    adicionarClienteNaRota={adicionarClienteNaRota}
    removerClienteDaRota={removerClienteDaRota}
    alterarSequenciaClienteRota={alterarSequenciaClienteRota}
    fecharRota={fecharRota}
    modoReordenar={modoReordenar}
    setModoReordenar={setModoReordenar}
    reabrirRota={reabrirRota}
perfil={perfil}
usuarioId={usuarioId}
ordenarRotaPorDistancia={ordenarRotaPorDistancia}
usuariosPerfis={usuariosPerfis}
alterarResponsavelRota={alterarResponsavelRota}
  />
)}

  </>
)}
    </section>
  );
}

export default Rotas;