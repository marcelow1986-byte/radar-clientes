import {
  Map,
  Trash2,
  Play,
  Pencil,
  CalendarDays,
  Users,
  CheckCircle2,
  Clock3,
  XCircle,
  Route,
} from "lucide-react";

function RotasLista({
  rotas,
  nomeNovaRota,
  setNomeNovaRota,
  criarRota,
  abrirRota,
  abrirRotaCompleta,
  excluirRota,
  setAbaRota,
  setModoTelaRota,
}) {
  return (
    <>
      <div className="rotas-header-premium">
        <div className="rotas-header-info">
          <div className="rotas-header-icone">
            <Route size={28} />
          </div>

          <div>
            <h2>Rotas cadastradas</h2>
            <p>Gerencie suas rotas e acompanhe o desempenho</p>
          </div>
        </div>

        <div className="form-rota-premium">
          <input
            type="text"
            placeholder="Nome da rota"
            value={nomeNovaRota}
            onChange={(e) => setNomeNovaRota(e.target.value)}
          />

          <button type="button" onClick={criarRota}>
            + Criar rota
          </button>
        </div>
      </div>

      <div className="tabela-rotas-premium">
        <div className="tabela-rotas-cabecalho">
          <div>Rota</div>
          <div>Data</div>
          <div>Status</div>
          <div>Clientes</div>
          <div>Visitados</div>
          <div>Pendentes</div>
          <div>Cancelados</div>
        </div>

        {rotas.map((rota) => (
          <div className="tabela-rotas-linha" key={rota.id}>
            <div className="tabela-rotas-linha-topo">
              <div className="rota-nome-premium">
                <Route size={20} />

                <div className="rota-nome-texto">
                  <strong>{rota.nome}</strong>
                </div>
              </div>

              <div className="rota-info-premium">
                <CalendarDays size={15} />
                {rota.data_rota || "-"}
              </div>

              <div>
                <span className={`badge-rota-premium status-${rota.status}`}>
                  {rota.status}
                </span>
              </div>

              <div className="rota-info-premium indicador-rota">
                <Users size={15} />
                
                <strong>{rota.total_clientes || 0}</strong>
              </div>

              <div className="rota-info-premium indicador-rota visitados">
                <CheckCircle2 size={15} />
                
                <strong>{rota.total_visitados || 0}</strong>
              </div>

              <div className="rota-info-premium indicador-rota pendentes">
                <Clock3 size={15} />
                
                <strong>{rota.total_pendentes || 0}</strong>
              </div>

              <div className="rota-info-premium indicador-rota cancelados">
                <XCircle size={15} />
                
                <strong>{rota.total_cancelados || 0}</strong>
              </div>
            </div>

            <div className="acoes-rota-premium">
              <button
                type="button"
                className="btn-rota-executar"
                onClick={() => {
                  setAbaRota("operacao");
                  abrirRota(rota);
                  setModoTelaRota("execucao");
                }}
              >
                <Play size={14} />
                Executar
              </button>

              <button
                type="button"
                className="btn-rota-secundario"
                onClick={() => {
                  abrirRota(rota);
                  setModoTelaRota("planejamento");
                }}
              >
                <Pencil size={14} />
                Planejar
              </button>

              <button
                type="button"
                className="btn-rota-secundario"
                onClick={() => abrirRotaCompleta(rota)}
              >
                <Map size={14} />
                Mapa
              </button>

              <button
                type="button"
                className="btn-rota-excluir"
                onClick={() => excluirRota(rota)}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default RotasLista;