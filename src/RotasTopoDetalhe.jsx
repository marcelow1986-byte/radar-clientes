function RotasTopoDetalhe({
  rotaSelecionada,
  clientesDaRota,
  abrirRota,
  setModoTelaRota,
  perfil,
  usuarioId,
  reabrirRota,
  finalizarRota,
}) {
  return (
    <>
      <div className="topo-detalhe-rota">
        <button
          type="button"
          className="btn-voltar-rota"
          onClick={() => {
            abrirRota(null);
            setModoTelaRota("lista");
          }}
        >
          ← Voltar para rotas
        </button>

        <div className="info-topo-rota">
          <div className="info-rota-box">
            <strong>
              {rotaSelecionada.data_rota || "25/05/2026"}
            </strong>

            <span>Data da Rota</span>
          </div>

          <div className="info-rota-box">
            <strong
              className={`status-rota-topo status-${rotaSelecionada.status}`}
            >
              ● {rotaSelecionada.status}
            </strong>

            <span>Status da Rota</span>
          </div>

          <div className="info-rota-box">
            <strong>{clientesDaRota.length}</strong>

            <span>Total de clientes</span>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: "18px",
          marginTop: "10px",
        }}
      >
        {(rotaSelecionada.status === "FECHADA" ||
          rotaSelecionada.status === "FINALIZADA") &&
          (perfil?.tipo_perfil === "admin" ||
            rotaSelecionada.criado_por === usuarioId) && (
            <button
              type="button"
              onClick={() => reabrirRota(rotaSelecionada)}
            >
              Reabrir rota
            </button>
          )}

        {rotaSelecionada.status === "EM_ANDAMENTO" && (
          <button
            type="button"
            onClick={() => finalizarRota(rotaSelecionada)}
          >
            Finalizar rota
          </button>
        )}
      </div>
    </>
  );
}

export default RotasTopoDetalhe;