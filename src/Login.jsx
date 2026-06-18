function Login({
  email,
  setEmail,
  senha,
  setSenha,
  login,
  enviarRecuperacaoSenha,
  modoRecuperacaoSenha,
  novaSenha,
  setNovaSenha,
  confirmarNovaSenha,
  setConfirmarNovaSenha,
  salvarNovaSenha,
}) {
  return (
    <div className="login-page">
      <div className="login-bg-overlay" />

      <div className="login-card-premium">
        <div className="login-topo">
          <img
            className="login-logo-phenix"
            src="https://phenixonline.com.br/wp-content/uploads/2021/05/Logo-azul.png"
            alt="Phenix"
          />

          <div className="login-titulos">
            <h1>Radar Clientes</h1>

            <p>Rotas, clientes próximos e oportunidades comerciais</p>
          </div>
        </div>

        {modoRecuperacaoSenha ? (
  <form
    onSubmit={(e) => {
      e.preventDefault();
      salvarNovaSenha();
    }}
    className="login-form-premium"
  >
    <div className="campo-login">
      <label>Nova senha</label>

      <input
        type="password"
        placeholder="Digite a nova senha"
        value={novaSenha}
        onChange={(e) => setNovaSenha(e.target.value)}
      />
    </div>

    <div className="campo-login">
      <label>Confirmar nova senha</label>

      <input
        type="password"
        placeholder="Confirme a nova senha"
        value={confirmarNovaSenha}
        onChange={(e) => setConfirmarNovaSenha(e.target.value)}
      />
    </div>

    <button type="submit" className="botao-login-premium">
      Alterar senha
    </button>
  </form>
) : (
  <form onSubmit={login} className="login-form-premium">
    <div className="campo-login">
      <label>E-mail</label>

      <input
        type="email"
        placeholder="Digite seu e-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
    </div>

    <div className="campo-login">
      <label>Senha</label>

      <input
        type="password"
        placeholder="Digite sua senha"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
      />
    </div>

    <button type="submit" className="botao-login-premium">
      Entrar no Radar
    </button>

    <button
      type="button"
      className="botao-recuperar-senha"
      onClick={enviarRecuperacaoSenha}
    >
      Esqueci minha senha
    </button>
  </form>
)}
      </div>
    </div>
  );
}

export default Login;