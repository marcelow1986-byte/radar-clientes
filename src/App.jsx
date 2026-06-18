import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { supabase } from "./supabaseClient";
import "./app-global.css";
import "./home.css";
import "./clientes.css";
import "./login.css";
import Login from "./Login.jsx";
import "./admin.css";
import "./rotas.css";
import "./modal-cidade.css";
import Rotas from "./Rotas.jsx";
import {
  Users,
  MapPin,
  Route,
  BarChart3,
  Settings,
  ChevronRight,
  LogOut,
  LockOpen,
  PlayCircle,
  Flag,
  CheckCircle,
  UserCheck,
  AlertTriangle,
  Trophy,
  CalendarDays,
} from "lucide-react";

const TELAS_PERSISTIDAS = new Set([
  "home",
  "clientes",
  "proximos",
  "rotas",
  "dashboard",
  "alterarSenha",
  "admin",
]);

const TELA_ATUAL_STORAGE_KEY = "radarClientes:telaAtual";
const ROTA_SELECIONADA_STORAGE_KEY = "radarClientes:rotaSelecionadaId";

function carregarTelaSalva() {
  const telaSalva = window.localStorage.getItem(TELA_ATUAL_STORAGE_KEY);

  return TELAS_PERSISTIDAS.has(telaSalva) ? telaSalva : "home";
}

function App() {
  const [session, setSession] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [senhaAtualInterna, setSenhaAtualInterna] = useState("");
const [novaSenhaInterna, setNovaSenhaInterna] = useState("");
const [confirmarSenhaInterna, setConfirmarSenhaInterna] = useState("");
const [alterandoSenhaInterna, setAlterandoSenhaInterna] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [importando, setImportando] = useState(false);
  const [resumoGeo, setResumoGeo] = useState(null);
  const [geocodificando, setGeocodificando] = useState(false);
  const [localizacaoUsuario, setLocalizacaoUsuario] = useState(null);
  const [modoProximos, setModoProximos] = useState(false);
  const [raioKm, setRaioKm] = useState(50);
  const [modalVisita, setModalVisita] = useState(false);
  const [clienteVisita, setClienteVisita] = useState(null);
  const [observacaoVisita, setObservacaoVisita] = useState("");
  const [gravandoVisita, setGravandoVisita] = useState(false);
  const [telaAtual, setTelaAtual] = useState(carregarTelaSalva);
  const [clientesDaRota, setClientesDaRota] = useState([]);
  const [buscaClienteRota, setBuscaClienteRota] = useState("");
  const [rotas, setRotas] = useState([]);
  const [nomeNovaRota, setNomeNovaRota] = useState("");
  const [usuarioResponsavelRota, setUsuarioResponsavelRota] = useState("");
  const [filtroResponsavelRotas, setFiltroResponsavelRotas] = useState("");
  const [filtroStatusRotas, setFiltroStatusRotas] = useState("");
  const [rotaSelecionada, setRotaSelecionada] = useState(null);
  const [modoReordenarRota, setModoReordenarRota] = useState(false);
  const [sequenciasEditadas, setSequenciasEditadas] = useState({});
  const [modoRecuperacaoSenha, setModoRecuperacaoSenha] = useState(false);
const [novaSenha, setNovaSenha] = useState("");
const [confirmarNovaSenha, setConfirmarNovaSenha] = useState("");
const [origemOrdenacaoRota, setOrigemOrdenacaoRota] = useState("");
const [modalCidadeAberto, setModalCidadeAberto] = useState(false);
const [ultimaCidadeBuscada, setUltimaCidadeBuscada] = useState("");
const [textoCidadeBusca, setTextoCidadeBusca] = useState("");

const [sugestoesCidade, setSugestoesCidade] = useState([]);

const [callbackCidadeSelecionada, setCallbackCidadeSelecionada] = useState(null);

const [carregandoCidade, setCarregandoCidade] = useState(false);
  useEffect(() => {

    if (
      perfil?.tipo_perfil === "admin"
    ) {
      carregarUsuariosPerfis(perfil);
    }

  }, [perfil]);

  async function carregarPerfil(userId) {

  }
  const [usuariosPerfis, setUsuariosPerfis] = useState([]);
  const [carregandoUsuarios, setCarregandoUsuarios] = useState(false);
  const [clientesProximosAtivo, setClientesProximosAtivo] = useState(false);
  const [usuarioPerfilForm, setUsuarioPerfilForm] = useState({
    nome: "",
    email: "",
    user_id: "",
    tipo_perfil: "representante",
    codigo_representante: "",
    ativo: true,
  });

  async function carregarResumoGeo() {
    const { data, error } = await supabase
      .from("clientes")
      .select("id, latitude, longitude, erro_geocodificacao");

    if (error) {
      console.error("Falha ao carregar resumo geo:", error);
      return;
    }

    const total = data.length;
    const comCoordenada = data.filter(
      (item) => item.latitude !== null && item.longitude !== null,
    ).length;
    const comFalha = data.filter(
      (item) => item.erro_geocodificacao !== null,
    ).length;
    const semCoordenada = total - comCoordenada;

    setResumoGeo({
      total,
      comCoordenada,
      semCoordenada,
      comFalha,
    });
  }

  useEffect(() => {
    iniciarSessao();

const hash = window.location.hash;

if (
  window.location.href.includes("type=recovery") ||
  window.location.hash.includes("access_token") ||
  window.location.hash.includes("refresh_token")
) {
  setModoRecuperacaoSenha(true);
}

    const { data } = supabase.auth.onAuthStateChange((_event, sessionAtual) => {
  const estaEmRecuperacao =
    window.location.href.includes("type=recovery") ||
    window.location.hash.includes("access_token") ||
    window.location.hash.includes("refresh_token");

  if (estaEmRecuperacao) {
    setModoRecuperacaoSenha(true);
  }

  setSession(sessionAtual);

  if (sessionAtual?.user) {
    if (!estaEmRecuperacao) {
      if (!window.localStorage.getItem(TELA_ATUAL_STORAGE_KEY)) {
        setTelaAtual("home");
      }
    }

    setRotaSelecionada(null);
    setClientesDaRota([]);
    setBuscaClienteRota("");
    setModoProximos(false);
    setLocalizacaoUsuario(null);
    setOrigemOrdenacaoRota("");

    carregarPerfil(sessionAtual.user.id);
  } else {
    setPerfil(null);
    setClientes([]);
    setRotas([]);
    setRotaSelecionada(null);
    setClientesDaRota([]);

    if (!estaEmRecuperacao) {
      if (!window.localStorage.getItem(TELA_ATUAL_STORAGE_KEY)) {
        setTelaAtual("home");
      }
    }
  }
});

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

useEffect(() => {
  const timer = setTimeout(() => {
    carregarSugestoesCidade(textoCidadeBusca);
  }, 400);

  return () => clearTimeout(timer);
}, [textoCidadeBusca, ultimaCidadeBuscada]);

useEffect(() => {
  window.localStorage.setItem(TELA_ATUAL_STORAGE_KEY, telaAtual);
}, [telaAtual]);

useEffect(() => {
  if (rotaSelecionada?.id) {
    window.localStorage.setItem(
      ROTA_SELECIONADA_STORAGE_KEY,
      String(rotaSelecionada.id),
    );
  }
}, [rotaSelecionada]);

useEffect(() => {
  if (telaAtual !== "rotas" || rotaSelecionada || rotas.length === 0) {
    return;
  }

  const rotaSalvaId = window.localStorage.getItem(ROTA_SELECIONADA_STORAGE_KEY);

  if (!rotaSalvaId) {
    return;
  }

  const rotaSalva = rotas.find((rota) => String(rota.id) === rotaSalvaId);

  if (rotaSalva) {
    abrirRota(rotaSalva);
  }
}, [telaAtual, rotaSelecionada, rotas]);

  async function iniciarSessao() {
    const { data } = await supabase.auth.getSession();
    setSession(data.session);

    if (data.session?.user) {
      await carregarPerfil(data.session.user.id);
    }

    setCarregando(false);
  }

  async function login(e) {
    e.preventDefault();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      alert("Login não realizado: " + error.message);
      return;
    }

    setSession(data.session);
    await carregarPerfil(data.user.id);
  }

  async function enviarRecuperacaoSenha() {
  if (!email.trim()) {
    alert("Informe seu e-mail para receber o link de recuperação.");
    return;
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: window.location.origin,
  });

  if (error) {
    alert("Não foi possível enviar o e-mail de recuperação: " + error.message);
    return;
  }

  alert("Enviamos um e-mail com as instruções para alterar sua senha.");
}
async function salvarNovaSenha() {
  if (!novaSenha.trim()) {
    alert("Informe a nova senha.");
    return;
  }

  if (novaSenha !== confirmarNovaSenha) {
    alert("As senhas não conferem.");
    return;
  }

  const { error } = await supabase.auth.updateUser({
    password: novaSenha,
  });

  if (error) {
    alert("Não foi possível alterar a senha: " + error.message);
    return;
  }

  alert("Senha alterada com sucesso.");

  setModoRecuperacaoSenha(false);

  setNovaSenha("");
  setConfirmarNovaSenha("");

  window.location.hash = "";
}

async function alterarSenhaInterna() {
  if (!senhaAtualInterna.trim()) {
    alert("Informe a senha atual.");
    return;
  }

  if (!novaSenhaInterna.trim()) {
    alert("Informe a nova senha.");
    return;
  }

  if (novaSenhaInterna !== confirmarSenhaInterna) {
    alert("A nova senha e a confirmação não conferem.");
    return;
  }

  setAlterandoSenhaInterna(true);

  const { error: erroLogin } = await supabase.auth.signInWithPassword({
    email: session.user.email,
    password: senhaAtualInterna,
  });

  if (erroLogin) {
    alert("Senha atual inválida.");
    setAlterandoSenhaInterna(false);
    return;
  }

  const { error } = await supabase.auth.updateUser({
    password: novaSenhaInterna,
  });

  if (error) {
    alert("Não foi possível alterar a senha: " + error.message);
    setAlterandoSenhaInterna(false);
    return;
  }

  alert("Senha alterada com sucesso.");

  setSenhaAtualInterna("");
  setNovaSenhaInterna("");
  setConfirmarSenhaInterna("");

  setAlterandoSenhaInterna(false);
}

  async function sair() {

  await supabase.auth.signOut();

  setSession(null);

  setPerfil(null);

  setClientes([]);

  setRotas([]);

  setClientesDaRota([]);

  setRotaSelecionada(null);

  setBuscaClienteRota("");

  setNomeNovaRota("");

  setTelaAtual("home");
  window.localStorage.removeItem(TELA_ATUAL_STORAGE_KEY);
  window.localStorage.removeItem(ROTA_SELECIONADA_STORAGE_KEY);

  setModoProximos(false);

  setLocalizacaoUsuario(null);

  setOrigemOrdenacaoRota("");

  setUsuarioResponsavelRota("");

}

  async function carregarPerfil(userId) {
    const { data, error } = await supabase
      .from("perfis")
      .select("*")
      .eq("user_id", userId)
      .eq("ativo", true)
      .single();

    if (error) {
      alert("Falha ao carregar perfil: " + error.message);
      return;
    }

    setPerfil(data);
    setUsuarioResponsavelRota(userId);
    await carregarUsuariosPerfis();
    await carregarClientes(data);
  }

  async function carregarClientes(perfilUsuario) {
  setCarregando(true);

  let consulta = supabase
    .from("clientes")
    .select("*")
    .order("cliente", { ascending: true });

  if (perfilUsuario.tipo_perfil === "representante") {
    consulta = consulta.eq(
      "codigo_representante",
      perfilUsuario.codigo_representante,
    );
  }

  const { data: clientesData, error } = await consulta;

  if (error) {
    alert("Falha ao carregar clientes: " + error.message);
    setClientes([]);
    setCarregando(false);
    return;
  }

  const { data: geosData, error: erroGeo } = await supabase
    .from("clientes_geolocalizacao")
    .select(`
      codigo_cliente,
      latitude,
      longitude,
      erro_geocodificacao,
      geocodificado_em
    `);

  if (erroGeo) {
    alert("Falha ao carregar geolocalização: " + erroGeo.message);
    setClientes(clientesData || []);
    setCarregando(false);
    return;
  }

  const mapaGeo = {};

  (geosData || []).forEach((geo) => {
    mapaGeo[String(geo.codigo_cliente)] = geo;
  });

  const clientesComGeo = (clientesData || []).map((cliente) => {
    const geo =
      mapaGeo[String(cliente.codigo_cliente)] || null;

    return {
      ...cliente,

      latitude:
        geo?.latitude ?? cliente.latitude ?? null,

      longitude:
        geo?.longitude ?? cliente.longitude ?? null,

      erro_geocodificacao:
        geo?.erro_geocodificacao ??
        cliente.erro_geocodificacao ??
        null,

      geocodificado_em:
        geo?.geocodificado_em ??
        cliente.geocodificado_em ??
        null,
    };
  });

  setClientes(clientesComGeo);

  carregarResumoGeo();

  setCarregando(false);
}

  function abrirModalCidade(callback) {
  setTextoCidadeBusca("");
  setSugestoesCidade([]);
  setCallbackCidadeSelecionada(() => callback);
  setModalCidadeAberto(true);
}

function selecionarCidade(item) {
  setModalCidadeAberto(false);

  setTextoCidadeBusca("");

  setSugestoesCidade([]);

  if (callbackCidadeSelecionada) {
    callbackCidadeSelecionada(item);
  }
}

  function montarEnderecoCompleto(linha) {
    return [
      linha.ENDERECO,
      linha.NUMERO,
      linha.BAIRRO,
      linha.MUNICIPIO,
      linha.UF,
      linha.CEP,
    ]
      .filter(Boolean)
      .join(", ");
  }

  function converterLinhaCliente(linha) {
    return {
      codigo_cliente: String(linha.CD_EMPRESA || "").trim(),
      cliente: String(linha.NOME_COMPLETO || linha.FANTASIA || "").trim(),
      endereco: String(linha.ENDERECO || "").trim(),
      numero: String(linha.NUMERO || "").trim(),
      bairro: String(linha.BAIRRO || "").trim(),
      cidade: String(linha.MUNICIPIO || "").trim(),
      uf: String(linha.UF || "").trim(),
      cep: String(linha.CEP || "").trim(),
      endereco_completo: montarEnderecoCompleto(linha),
      telefone: String(linha.FONE || "").trim(),
      whatsapp: String(linha.FAX_FONE || linha.FONE || "").trim(),
      email: "",
      tipo: String(linha.DIVISAO || linha.TIPO_DE_EMPRESA || "").trim(),
      prioridade: String(linha.CONCEITO || "").trim(),
      status: String(linha.ATIVO || "A").trim(),
      codigo_representante: String(linha.CD_REPRESENTANT || "").trim(),
      observacao: String(linha.FANTASIA || "").trim(),
      updated_at: new Date().toISOString(),
    };
  }

  async function importarPlanilha(event) {
    const arquivo = event.target.files[0];

    if (!arquivo) return;

    if (perfil.tipo_perfil !== "admin") {
      alert("Somente administrador pode importar planilha.");
      return;
    }

    const confirmar = confirm(
      "Esta importação vai substituir a base atual de clientes. Deseja continuar?",
    );

    if (!confirmar) return;

    setImportando(true);

    try {
      const buffer = await arquivo.arrayBuffer();
      const workbook = XLSX.read(buffer);
      const primeiraAba = workbook.SheetNames[0];
      const planilha = workbook.Sheets[primeiraAba];

      const linhas = XLSX.utils.sheet_to_json(planilha, {
        defval: "",
      });

      const clientesImportados = linhas
        .map(converterLinhaCliente)
        .filter((item) => item.codigo_cliente && item.cliente);

      if (!clientesImportados.length) {
        alert("Nenhum cliente válido encontrado na planilha.");
        setImportando(false);
        return;
      }

      const { error: erroLimpeza } = await supabase
        .from("clientes")
        .delete()
        .neq("id", 0);

      if (erroLimpeza) throw erroLimpeza;

      const tamanhoLote = 500;

      for (let i = 0; i < clientesImportados.length; i += tamanhoLote) {
        const lote = clientesImportados.slice(i, i + tamanhoLote);

        const { error: erroInsert } = await supabase
          .from("clientes")
          .insert(lote);

        if (erroInsert) throw erroInsert;
      }

      await supabase.from("importacoes").insert({
        usuario_id: session.user.id,
        nome_arquivo: arquivo.name,
        quantidade_registros: clientesImportados.length,
        tipo_importacao: "completa",
        status: "sucesso",
        mensagem: "Importação completa realizada pelo painel administrativo.",
      });

      alert(`Importação concluída: ${clientesImportados.length} clientes.`);

      await carregarClientes(perfil);
    } catch (erro) {
      alert("Falha na importação: " + erro.message);
    }

    event.target.value = "";
    setImportando(false);
  }

  function aguardar(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function montarEnderecoBusca(item) {
    const endereco = String(item.endereco || "")
      .trim()
      .replace(/^R\s+/i, "Rua ")
      .replace(/^R\.\s+/i, "Rua ")
      .replace(/^AV\s+/i, "Avenida ")
      .replace(/^AV\.\s+/i, "Avenida ")
      .replace(/^EST\.\s+/i, "Estrada ");

    const numero = String(item.numero || "").trim();
    const cidade = String(item.cidade || "").trim();
    const uf = String(item.uf || "").trim();

    return `${endereco} ${numero}, ${cidade}, ${uf}, Brasil`
      .replace(/\s+/g, " ")
      .trim();
  }

  async function buscarCoordenadas(item) {
    const tentativas = [
      montarEnderecoBusca(item),
      `${item.cidade || ""}, ${item.uf || ""}, Brasil`,
    ];

    for (const endereco of tentativas) {
      const url =
        "https://nominatim.openstreetmap.org/search?format=json&limit=1&q=" +
        encodeURIComponent(endereco);

      const resposta = await fetch(url, {
        headers: {
          Accept: "application/json",
        },
      });

      if (!resposta.ok) {
        continue;
      }

      const dados = await resposta.json();

      if (dados.length) {
        return {
          latitude: Number(dados[0].lat),
          longitude: Number(dados[0].lon),
          endereco_usado: endereco,
        };
      }

      await aguardar(1200);
    }

    throw new Error("Endereço não localizado");
  }

async function buscarCoordenadasPorCidade(cidadeInformada) {
  try {
    const cidade = String(cidadeInformada || "").trim();

    if (!cidade) {
      alert("Cidade não informada.");
      return null;
    }

    const textoBusca = cidade.toLowerCase().includes("brasil")
      ? cidade
      : `${cidade}, Rio Grande do Sul, Brasil`;

    const url =
      "https://nominatim.openstreetmap.org/search?format=json&limit=1&q=" +
      encodeURIComponent(textoBusca);

    const resposta = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!resposta.ok) {
      alert("Não foi possível consultar a cidade.");
      return null;
    }

    const dados = await resposta.json();

    if (!Array.isArray(dados) || dados.length === 0) {
      alert("Cidade não localizada. Tente informar cidade e UF. Ex: Parobé RS");
      return null;
    }

    return {
      latitude: Number(dados[0].lat),
      longitude: Number(dados[0].lon),
      municipio_origem: cidade,
    };
  } catch (erro) {
    console.error("Erro ao buscar cidade:", erro);
    alert("Falha ao localizar cidade: " + erro.message);
    return null;
  }
}

async function buscarSugestoesCidade(texto) {
  if (!texto || texto.trim().length < 3) {
    return [];
  }

  const url =
    `https://nominatim.openstreetmap.org/search?` +
    `format=json` +
    `&addressdetails=1` +
    `&limit=5` +
    `&countrycodes=br` +
    `&q=${encodeURIComponent(texto.trim())}`;

  const resposta = await fetch(url);
  const dados = await resposta.json();

  return dados.map((item) => {
    const cidade =
      item.address?.city ||
      item.address?.town ||
      item.address?.village ||
      item.address?.municipality ||
      item.address?.county ||
      "";

    const estado = item.address?.state || "";

    return {
      nome: cidade && estado ? `${cidade} - ${estado}` : item.display_name,
      latitude: Number(item.lat),
      longitude: Number(item.lon),
      display_name: item.display_name,
    };
  });
}

async function carregarSugestoesCidade(texto) {
  const termo = String(texto || "").trim();

  if (termo.length < 3) {
    setSugestoesCidade([]);
    setUltimaCidadeBuscada("");
    return;
  }

  if (termo === ultimaCidadeBuscada) {
    return;
  }

  try {
    setCarregandoCidade(true);
    setUltimaCidadeBuscada(termo);

    const resultados = await buscarSugestoesCidade(termo);

    setSugestoesCidade(resultados);
  } catch (erro) {
    console.error("Erro ao buscar cidades:", erro);
  } finally {
    setCarregandoCidade(false);
  }
}



  function abrirMaps(cliente) {
    if (!cliente?.latitude || !cliente?.longitude) {
      alert("Cliente sem coordenadas.");
      return;
    }

    window.open(
      `https://www.waze.com/pt-BR/live-map/directions?to=ll.${cliente.latitude}%2C${cliente.longitude}`,
      "_blank",
    );
  }

  function abrirAcompanhamento(item) {
    const codigo = String(item?.codigo_cliente || "").padStart(6, "0");

    if (!codigo || codigo === "000000") {
      alert("Cliente sem código para acompanhamento.");
      return;
    }

    window.open(
      `https://phenixportais.cigam.cloud/portalrepresentante/ge/acompanhamento/pesquisa/${codigo}`,
      "_blank",
    );
  }

  function abrirWhatsApp(item) {
    const telefone = (item.whatsapp || item.telefone || "").replace(/\D/g, "");

    if (!telefone) {
      alert("Cliente sem WhatsApp ou telefone cadastrado.");
      return;
    }

    window.open(`https://wa.me/55${telefone}`, "_blank");
  }

  const clientesFiltrados = useMemo(() => {
  let lista = clientes.filter((item) => {
    const termo = filtro.toLowerCase();

    return (
      item.cliente?.toLowerCase().includes(termo) ||
      item.codigo_cliente?.toLowerCase().includes(termo) ||
      item.cidade?.toLowerCase().includes(termo) ||
      item.uf?.toLowerCase().includes(termo) ||
      item.telefone?.toLowerCase().includes(termo) ||
      item.whatsapp?.toLowerCase().includes(termo) ||
      item.tipo?.toLowerCase().includes(termo) ||
      item.prioridade?.toLowerCase().includes(termo) ||
      item.status?.toLowerCase().includes(termo)
    );
  });

  if (modoProximos && localizacaoUsuario) {
    lista = lista
      .filter((item) => item.latitude !== null && item.longitude !== null)
      .map((item) => ({
        ...item,
        distancia_km: calcularDistanciaKm(
          localizacaoUsuario.latitude,
          localizacaoUsuario.longitude,
          Number(item.latitude),
          Number(item.longitude)
        ),
      }))
      .filter((item) => item.distancia_km <= raioKm)
      .sort((a, b) => a.distancia_km - b.distancia_km);
  }

  return lista;
}, [clientes, filtro, modoProximos, localizacaoUsuario, raioKm]);

const indicadoresDashboard = useMemo(() => {
  const totalRotas = rotas.length;

  const abertas = rotas.filter((rota) => rota.status === "ABERTA").length;
  const fechadas = rotas.filter((rota) => rota.status === "FECHADA").length;
  const emAndamento = rotas.filter((rota) => rota.status === "EM_ANDAMENTO").length;
  const finalizadas = rotas.filter((rota) => rota.status === "FINALIZADA").length;

  const totalClientesRotas = rotas.reduce(
    (total, rota) => total + Number(rota.total_clientes || 0),
    0
  );

  const totalVisitados = rotas.reduce(
    (total, rota) => total + Number(rota.total_visitados || 0),
    0
  );

  const totalPendentes = rotas.reduce(
    (total, rota) => total + Number(rota.total_pendentes || 0),
    0
  );

  const percentualConclusao =
  totalClientesRotas > 0
    ? Math.round((totalVisitados / totalClientesRotas) * 100)
    : 0;

    const rankingResponsaveis = rotas.reduce((lista, rota) => {
  const nome = rota.responsavel_nome || "Sem responsável";

  const existente = lista.find((item) => item.nome === nome);

  if (existente) {
    existente.totalRotas += 1;
    existente.totalClientes += Number(rota.total_clientes || 0);
    existente.totalVisitados += Number(rota.total_visitados || 0);
    existente.totalPendentes += Number(rota.total_pendentes || 0);
  } else {
    lista.push({
      nome,
      totalRotas: 1,
      totalClientes: Number(rota.total_clientes || 0),
      totalVisitados: Number(rota.total_visitados || 0),
      totalPendentes: Number(rota.total_pendentes || 0),
    });
  }

  return lista;
}, []);

rankingResponsaveis.sort((a, b) => b.totalVisitados - a.totalVisitados);

const rotasCriticas = rotas
  .filter(
    (rota) =>
      ["ABERTA", "FECHADA", "EM_ANDAMENTO"].includes(rota.status) &&
      Number(rota.total_pendentes || 0) > 0
  )
  .sort((a, b) => Number(b.total_pendentes || 0) - Number(a.total_pendentes || 0))
  .slice(0, 5);

  return {
    totalRotas,
    abertas,
    fechadas,
    emAndamento,
    finalizadas,
    totalClientes: clientes.length,
    totalClientesRotas,
    totalVisitados,
    totalPendentes,
    percentualConclusao,
    rankingResponsaveis,
    rotasCriticas,
  };
}, [rotas, clientes]);

  async function atualizarCoordenadasPendentes() {
    if (perfil.tipo_perfil !== "admin") {
      alert("Somente administrador pode atualizar coordenadas.");
      return;
    }

    setGeocodificando(true);

    try {
      const { data: pendentes, error } = await supabase
        .from("clientes")
        .select("*")
        .is("latitude", null)
        .is("longitude", null)
        .limit(20);

      if (error) {
        throw error;
      }

      if (!pendentes.length) {
        alert("Nenhum cliente pendente.");
        setGeocodificando(false);
        return;
      }

      let sucesso = 0;
      let falha = 0;

      for (const cliente of pendentes) {
        try {
          const geo = await buscarCoordenadas(cliente);

          await supabase
            .from("clientes")
            .update({
              latitude: geo.latitude,
              longitude: geo.longitude,
              erro_geocodificacao: null,
              geocodificado_em: new Date().toISOString(),
            })
            .eq("id", cliente.id);

          sucesso++;
        } catch (erro) {
          await supabase
            .from("clientes")
            .update({
              erro_geocodificacao: erro.message,
              geocodificado_em: new Date().toISOString(),
            })
            .eq("id", cliente.id);

          falha++;
        }

        await aguardar(2500);
      }

      alert(`Processo concluído. Sucesso: ${sucesso} | Falha: ${falha}`);

      await carregarClientes(perfil);
    } catch (erro) {
      alert("Erro geral: " + erro.message);
    }

    setGeocodificando(false);
  }

  function calcularDistanciaKm(lat1, lon1, lat2, lon2) {
    const raioTerra = 6371;

    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return raioTerra * c;
  }

  async function buscarClientesProximos() {
    const usarLocalizacaoAtual = confirm(
      "Deseja usar sua localização atual?\n\nOK = Usar localização atual\nCancelar = Informar cidade manualmente"
    );

    if (usarLocalizacaoAtual) {
      if (!navigator.geolocation) {
        alert("Geolocalização não disponível neste dispositivo.");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (posicao) => {
          setLocalizacaoUsuario({
            latitude: posicao.coords.latitude,
            longitude: posicao.coords.longitude,
            municipio_origem: "Localização atual",
          });

          setOrigemOrdenacaoRota("Localização atual");
          setModoProximos(false);

          setTimeout(() => {
            setModoProximos(true);
          }, 100);
        },
        () => {
          alert("Não foi possível obter sua localização.");
        },
      );

      return;
    }

    abrirModalCidade((cidadeSelecionada) => {
      if (!cidadeSelecionada) {
        return;
      }

      const origem = {
        latitude: cidadeSelecionada.latitude,
        longitude: cidadeSelecionada.longitude,
        municipio_origem: cidadeSelecionada.nome,
      };

      setOrigemOrdenacaoRota(cidadeSelecionada.nome);
      setLocalizacaoUsuario(origem);
      setModoProximos(false);

      setTimeout(() => {
        setModoProximos(true);
      }, 100);
    });
  }

function limparModoProximos() {
  setModoProximos(false);
  setLocalizacaoUsuario(null);
  setClientesProximosAtivo(false);
  setOrigemOrdenacaoRota("");
}

function abrirRotasPorStatus(status) {
  setFiltroStatusRotas(status);
  setFiltroResponsavelRotas("");
  setTelaAtual("rotas");
  carregarRotas();
}

  function abrirModalVisita(cliente) {
    setClienteVisita(cliente);
    setObservacaoVisita("");
    setModalVisita(true);
  }

  function fecharModalVisita() {
    setModalVisita(false);
    setClienteVisita(null);
    setObservacaoVisita("");
  }

  async function registrarVisita() {
    if (!clienteVisita) return;

    setGravandoVisita(true);

    navigator.geolocation.getCurrentPosition(
      async (posicao) => {
        try {
          const { error } = await supabase.from("visitas").insert({
            cliente_id: clienteVisita.id,

            user_id: session.user.id,

            tipo_visita: "VISITA",

            status: "REALIZADA",

            observacao: observacaoVisita,

            latitude: posicao.coords.latitude,
            longitude: posicao.coords.longitude,

            data_visita: new Date().toISOString(),
          });

          if (error) {
            throw error;
          }

          alert("Visita registrada com sucesso.");

          fecharModalVisita();
        } catch (erro) {
          alert("Falha ao registrar visita: " + erro.message);
        }

        setGravandoVisita(false);
      },
      () => {
        alert("Não foi possível obter localização do usuário.");
        setGravandoVisita(false);
      },
    );
  }

  async function abrirTelaProximos() {
    setTelaAtual("proximos");
    setRaioKm(50);

    if (!navigator.geolocation) {
      alert("Geolocalização não disponível.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (posicao) => {
        setLocalizacaoUsuario({
          latitude: posicao.coords.latitude,
          longitude: posicao.coords.longitude,
        });

        setModoProximos(true);
      },
      () => {
        alert("Não foi possível obter localização.");
      },
    );
  }

  const dashboardCards = (
    <div className="dashboard-grid">
      <div
        className="dashboard-card"
        onClick={() => {
          setTelaAtual("clientes");
          setModoProximos(false);
          setLocalizacaoUsuario(null);
        }}
      ></div>

      <div
        className="dashboard-card"
        onClick={() => {
          setTelaAtual("proximos");
          setRaioKm(50);
          buscarClientesProximos();
        }}
      ></div>

      <div
        className="dashboard-card"
        onClick={() => setTelaAtual("rotas")}
      ></div>

      {perfil?.tipo_perfil === "admin" && (
        <div
          className="dashboard-card"
          onClick={() => setTelaAtual("admin")}
        ></div>
      )}
    </div>
  );

  async function carregarRotas() {
   let consultaRotas = supabase
  .from("rotas")
  .select("*")
  .order("created_at", { ascending: false });

    if (perfil?.tipo_perfil !== "admin") {
  consultaRotas = consultaRotas.eq(
    "usuario_responsavel",
    session.user.id
  );
}

    const { data: rotasData, error } = await consultaRotas;

    if (error) {
      alert("Falha ao carregar rotas: " + error.message);
      return;
    }

    const { data: itensRota, error: erroItens } = await supabase
      .from("rota_clientes")
      .select("rota_id, status, visitado");

    if (erroItens) {
      alert("Falha ao carregar resumo das rotas: " + erroItens.message);
      return;
    }

    const listaUsuarios = usuariosPerfis || [];

    const rotasComResumo = (rotasData || []).map((rota) => {
  const itens = (itensRota || []).filter(
    (item) => item.rota_id === rota.id,
  );

  const responsavel = listaUsuarios.find(
    (usuario) => usuario.user_id === rota.usuario_responsavel
  );

  return {
    ...rota,
    responsavel_nome: responsavel?.nome || "",
    total_clientes: itens.length,
    total_visitados: itens.filter(
      (item) => item.status === "VISITADO" || item.visitado === true,
    ).length,
    total_cancelados: itens.filter((item) => item.status === "CANCELADO")
      .length,
    total_pendentes: itens.filter(
      (item) =>
        item.status === "PENDENTE" ||
        item.status === null ||
        item.status === undefined,
    ).length,
  };
});

    setRotas(rotasComResumo);
  }

async function alterarResponsavelRota(rota, novoResponsavel) {
  const usuarioNovo = usuariosPerfis.find(
    (usuario) => usuario.user_id === novoResponsavel
  );

  const novoNomeResponsavel = usuarioNovo?.nome || "";

  const { error } = await supabase
    .from("rotas")
    .update({
      usuario_responsavel: novoResponsavel,
    })
    .eq("id", rota.id);

  if (error) {
    alert("Erro ao alterar responsável: " + error.message);
    return;
  }

  setRotas((rotasAnteriores) =>
    rotasAnteriores.map((item) =>
      item.id === rota.id
        ? {
            ...item,
            usuario_responsavel: novoResponsavel,
            responsavel_nome: novoNomeResponsavel,
          }
        : item
    )
  );

  setRotaSelecionada((rotaAtual) => {
    if (!rotaAtual || rotaAtual.id !== rota.id) {
      return rotaAtual;
    }

    return {
      ...rotaAtual,
      usuario_responsavel: novoResponsavel,
      responsavel_nome: novoNomeResponsavel,
    };
  });
}

  async function abrirRota(rota) {
    if (!rota) {
      setRotaSelecionada(null);
      setClientesDaRota([]);
      setClientesProximosAtivo(true);
      window.localStorage.removeItem(ROTA_SELECIONADA_STORAGE_KEY);
      return;
    }
    setRotaSelecionada(rota);
    window.localStorage.setItem(
      ROTA_SELECIONADA_STORAGE_KEY,
      String(rota.id),
    );

    const { data, error } = await supabase
      .from("rota_clientes")
      .select("*")
      .eq("rota_id", rota.id)
      .order("sequencia", { ascending: true });

    if (error) {
      alert("Falha ao abrir rota: " + error.message);
      return;
    }

    setClientesDaRota(data || []);
  }

  async function abrirRotaCompleta(rota) {
    const { data, error } = await supabase

      .from("rota_clientes")
      .select("*")
      .eq("rota_id", rota.id)
      .order("sequencia", { ascending: true });
    console.log("Clientes da rota:", data);
    console.log("Erro rota completa:", error);

    if (error) {
      alert("Falha ao carregar clientes da rota: " + error.message);
      return;
    }

    if (!data || data.length === 0) {
      alert("Esta rota não possui clientes.");
      return;
    }

    const clientesOrdenados = data
      .map((item) => {
        const cliente = clientes.find((cli) => cli.id === item.cliente_id);

        return {
          ...item,
          cliente,
        };
      })
      .filter(
        (item) =>
          item.cliente && item.cliente.latitude && item.cliente.longitude,
      );

    if (clientesOrdenados.length === 0) {
      alert("Nenhum cliente da rota possui coordenadas.");
      return;
    }

    const destino = clientesOrdenados[clientesOrdenados.length - 1].cliente;

    const intermediarios = clientesOrdenados
      .slice(0, -1)
      .map((item) => `${item.cliente.latitude},${item.cliente.longitude}`)
      .join("|");

    let url = `https://www.google.com/maps/dir/?api=1&travelmode=driving&destination=${destino.latitude},${destino.longitude}`;

    if (intermediarios) {
      url += `&waypoints=${encodeURIComponent(intermediarios)}`;
    }

    window.open(url, "_blank");
  }
  async function adicionarClienteNaRota(cliente) {
    if (!rotaSelecionada) {
      alert("Abra uma rota antes de adicionar clientes.");
      return;
    }

    const jaExiste = clientesDaRota.some(
      (item) => item.cliente_id === cliente.id,
    );

    if (jaExiste) {
      alert("Este cliente já está na rota.");
      setBuscaClienteRota("");
      return;
    }

    const proximaSequencia = clientesDaRota.length + 1;

    const { error } = await supabase.from("rota_clientes").insert({
      rota_id: rotaSelecionada.id,
      cliente_id: cliente.id,
      sequencia: proximaSequencia,
      status: "PENDENTE",
      visitado: false,
    });

    if (error) {
      alert("Falha ao adicionar cliente na rota: " + error.message);
      return;
    }

    setBuscaClienteRota("");

    await abrirRota(rotaSelecionada);
    await carregarRotas();

    setRotaSelecionada((rotaAnterior) => ({
      ...rotaAnterior,
      total_clientes:
        (rotaAnterior?.total_clientes || clientesDaRota.length) + 1,
      total_pendentes: (rotaAnterior?.total_pendentes || 0) + 1,
    }));
  }

  async function criarRota() {
    if (!nomeNovaRota.trim()) {
      alert("Informe o nome da rota");
      return;
    }

    const { error } = await supabase.from("rotas").insert({
  nome: nomeNovaRota.trim(),

  user_id: session.user.id,

  criado_por: session.user.id,

  usuario_responsavel:
  perfil?.tipo_perfil === "admin"
    ? usuarioResponsavelRota
    : session.user.id,

  status: "ABERTA",
});

    if (error) {
      alert("Erro ao criar rota");
      return;
    }

    setNomeNovaRota("");

    await carregarRotas();
  }

  async function excluirRota(rota) {
    const confirmar = confirm("Deseja excluir a rota " + rota.nome + "?");

    if (!confirmar) return;

    const { data: itensExcluidos, error: erroItens } = await supabase
      .from("rota_clientes")
      .delete()
      .eq("rota_id", rota.id)
      .select();

    console.log("Itens excluídos:", itensExcluidos);

    if (erroItens) {
      alert("Falha ao excluir clientes da rota: " + erroItens.message);
      return;
    }

    const { data: rotaExcluida, error } = await supabase
      .from("rotas")
      .delete()
      .eq("id", rota.id)
      .select();

    console.log("Rota excluída:", rotaExcluida);

    if (error) {
      alert("Falha ao excluir rota: " + error.message);
      return;
    }

    if (rotaSelecionada?.id === rota.id) {
      setRotaSelecionada(null);
      setClientesDaRota([]);
    }

    await carregarRotas();
  }

  async function removerClienteDaRota(itemRota) {
    if (!itemRota || !itemRota.id) {
      alert("Cliente da rota não identificado.");
      return;
    }

    const confirmar = confirm("Deseja remover este cliente da rota?");

    if (!confirmar) return;

    const { error } = await supabase
      .from("rota_clientes")
      .delete()
      .eq("id", itemRota.id);

    if (error) {
      alert("Falha ao remover cliente da rota: " + error.message);
      return;
    }

    if (rotaSelecionada) {
      await abrirRota(rotaSelecionada);
    }

    await carregarRotas();
  }

 async function alterarStatusClienteRota(itemRota, novoStatus) {
  if (!itemRota || !itemRota.id) {
    alert("Cliente da rota não identificado.");
    return;
  }

  if (rotaSelecionada?.status === "ABERTA") {
    alert("Para registrar visita, primeiro feche a rota.");
    return;
  }

  if (rotaSelecionada?.status === "FINALIZADA") {
    alert("Rota finalizada. Para alterar clientes, reabra a rota.");
    return;
  }

  const { error } = await supabase
    .from("rota_clientes")
    .update({
      status: novoStatus,
      visitado: novoStatus === "VISITADO",
    })
    .eq("id", itemRota.id);

  if (error) {
    alert("Falha ao atualizar status: " + error.message);
    return;
  }

  const rotaId = itemRota.rota_id || rotaSelecionada?.id;

  const { data: itensAtualizados, error: erroConsulta } = await supabase
    .from("rota_clientes")
    .select("id, status")
    .eq("rota_id", rotaId);

  if (erroConsulta) {
    alert("Status atualizado, mas houve falha ao validar a rota.");
    return;
  }

  const temPendente = (itensAtualizados || []).some(
    (linha) => linha.status === "PENDENTE" || !linha.status
  );

  const temMovimento = (itensAtualizados || []).some(
    (linha) => linha.status === "VISITADO" || linha.status === "CANCELADO"
  );

  let novoStatusRota = rotaSelecionada?.status || "FECHADA";
  let dataFinalizacao = rotaSelecionada?.finalizada_em || null;

  if (!temPendente) {
    novoStatusRota = "FINALIZADA";
    dataFinalizacao = new Date().toISOString();
  } else if (temMovimento) {
    novoStatusRota = "EM_ANDAMENTO";
    dataFinalizacao = null;
  } else {
    novoStatusRota = "FECHADA";
    dataFinalizacao = null;
  }

  const { error: erroRota } = await supabase
    .from("rotas")
    .update({
      status: novoStatusRota,
      finalizada_em: dataFinalizacao,
    })
    .eq("id", rotaId);

  if (erroRota) {
    alert("Status do cliente atualizado, mas houve falha ao atualizar a rota.");
    return;
  }

  const rotaAtualizada = {
    ...rotaSelecionada,
    status: novoStatusRota,
    finalizada_em: dataFinalizacao,
  };

  setRotaSelecionada(rotaAtualizada);

  await abrirRota(rotaAtualizada);
  await carregarRotas();

  if (novoStatusRota === "FINALIZADA") {
    alert("Todos os clientes foram concluídos. Rota finalizada automaticamente.");
  }
}

  async function alterarSequenciaClienteRota(itemRota, novaSequencia) {
    if (!itemRota || !itemRota.id) {
      alert("Cliente da rota não identificado.");
      return;
    }

    if (!novaSequencia || Number(novaSequencia) <= 0) {
      alert("Informe uma sequência válida.");
      return;
    }

    const sequenciaDuplicada = clientesDaRota.some(
      (item) =>
        item.id !== itemRota.id &&
        Number(item.sequencia) === Number(novaSequencia),
    );

    if (sequenciaDuplicada) {
      alert("Já existe outro cliente com esta sequência na rota.");
      return;
    }

    const { error } = await supabase
      .from("rota_clientes")
      .update({
        sequencia: Number(novaSequencia),
      })
      .eq("id", itemRota.id);

    if (error) {
      alert("Falha ao atualizar sequência: " + error.message);
      return;
    }

    if (rotaSelecionada) {
      await abrirRota(rotaSelecionada);
    }

    await carregarRotas();
  }

  async function salvarSequenciaRota() {
    const valores = Object.values(sequenciasEditadas);

    if (valores.some((valor) => !valor || Number(valor) <= 0)) {
      alert(
        "Todas as sequências devem ser preenchidas com número maior que zero.",
      );
      return;
    }

    const unicos = new Set(valores.map((valor) => Number(valor)));

    if (unicos.size !== valores.length) {
      alert("Não é permitido repetir sequência.");
      return;
    }

    for (const item of clientesDaRota) {
      const novaSequencia = Number(sequenciasEditadas[item.id]);

      const { error } = await supabase
        .from("rota_clientes")
        .update({ sequencia: novaSequencia })
        .eq("id", item.id);

      if (error) {
        alert("Falha ao salvar sequência: " + error.message);
        return;
      }
    }

    setModoReordenarRota(false);
    await abrirRota(rotaSelecionada);
  }

  async function fecharRota(rota) {
  if (!rota?.id) return;

  const { data: itensDaRota, error: erroConsulta } = await supabase
    .from("rota_clientes")
    .select("id, status")
    .eq("rota_id", rota.id);

  if (erroConsulta) {
    alert("Falha ao validar clientes da rota: " + erroConsulta.message);
    return;
  }

  const temPendente = (itensDaRota || []).some(
    (item) => item.status === "PENDENTE" || !item.status
  );

  const novoStatus = temPendente ? "FECHADA" : "FINALIZADA";
  const dataFinalizacao =
    novoStatus === "FINALIZADA" ? new Date().toISOString() : null;

  const confirmar = confirm(
    novoStatus === "FINALIZADA"
      ? "A rota não possui clientes pendentes. Deseja fechar e finalizar automaticamente?"
      : "Deseja fechar esta rota?"
  );

  if (!confirmar) return;

  const { error } = await supabase
    .from("rotas")
    .update({
      status: novoStatus,
      finalizada_em: dataFinalizacao,
    })
    .eq("id", rota.id);

  if (error) {
    alert("Falha ao fechar rota: " + error.message);
    return;
  }

  const rotaAtualizada = {
    ...rota,
    status: novoStatus,
    finalizada_em: dataFinalizacao,
  };

  setRotaSelecionada(rotaAtualizada);

  await carregarRotas();

  alert(
    novoStatus === "FINALIZADA"
      ? "Rota finalizada automaticamente, pois não possui clientes pendentes."
      : "Rota fechada com sucesso."
  );
}

  async function iniciarRota(rota) {
    if (!rota?.id) return;

    const { error } = await supabase
      .from("rotas")
      .update({
        status: "EM_ANDAMENTO",
        iniciada_em: new Date().toISOString(),
      })
      .eq("id", rota.id);

    if (error) {
      alert("Falha ao iniciar rota: " + error.message);
      return;
    }

    setRotaSelecionada({
      ...rota,
      status: "EM_ANDAMENTO",
      iniciada_em: new Date().toISOString(),
    });

    await carregarRotas();
  }

 async function finalizarRota(rota) {
  if (!rota?.id) return;

  const { data: itensRota, error: erroBusca } = await supabase
    .from("rota_clientes")
    .select("id, status")
    .eq("rota_id", rota.id);

  if (erroBusca) {
    alert("Falha ao validar clientes da rota: " + erroBusca.message);
    return;
  }

  const pendentes = (itensRota || []).filter(
    (item) => item.status === "PENDENTE" || !item.status
  );

  if (pendentes.length > 0) {
    alert("Ainda existem clientes pendentes na rota.");
    return;
  }

  const confirmar = confirm("Deseja finalizar esta rota?");

  if (!confirmar) return;

  const dataFinalizacao = new Date().toISOString();

  const { error } = await supabase
    .from("rotas")
    .update({
      status: "FINALIZADA",
      finalizada_em: dataFinalizacao,
    })
    .eq("id", rota.id);
    
    console.log("Update finalizada:", {
  rotaId: rota.id,
  status: "FINALIZADA",
  error,
});

  if (error) {
    alert("Falha ao finalizar rota: " + error.message);
    return;
  }

  const rotaFinalizada = {
  ...rota,
  status: "FINALIZADA",
  finalizada_em: dataFinalizacao,
};

setRotaSelecionada(rotaFinalizada);

await carregarRotas();

alert("Rota finalizada com sucesso.");
}

async function reabrirRota(rota) {
  if (!rota?.id) return;

  const confirmar = confirm("Deseja reabrir esta rota?");

  if (!confirmar) return;

  const dataHora = new Date().toLocaleString("pt-BR");
  const statusOrigem = rota.status || "SEM_STATUS";

  let novoStatus = "ABERTA";

  if (statusOrigem === "FINALIZADA") {
    novoStatus = "FECHADA";
  }

  const novaObservacao =
    (rota.observacao || "") +
    `\n[${dataHora}] Rota reaberta de ${statusOrigem} para ${novoStatus} por ${
      perfil?.nome || "usuário"
    }.`;

  const { error } = await supabase
    .from("rotas")
    .update({
      status: novoStatus,
      observacao: novaObservacao,
      finalizada_em: null,
    })
    .eq("id", rota.id);

  if (error) {
    alert("Falha ao reabrir rota: " + error.message);
    return;
  }

  const rotaReaberta = {
    ...rota,
    status: novoStatus,
    observacao: novaObservacao,
    finalizada_em: null,
  };

  setRotaSelecionada(rotaReaberta);

  await carregarRotas();

  alert(`Rota reaberta como ${novoStatus}.`);
}

  async function executarOrdenacaoRotaPorDistancia(rota, origemOrdenacao) {
    if (!origemOrdenacao) {
      return;
    }

    setLocalizacaoUsuario(origemOrdenacao);
    setOrigemOrdenacaoRota(origemOrdenacao.municipio_origem || "");

    const itensValidos = clientesDaRota
      .map((item) => {
        const cliente = clientes.find((cli) => cli.id === item.cliente_id);

        if (!cliente?.latitude || !cliente?.longitude) {
          return null;
        }

        const distancia = calcularDistanciaKm(
          origemOrdenacao.latitude,
          origemOrdenacao.longitude,
          Number(cliente.latitude),
          Number(cliente.longitude)
        );

        return {
          ...item,
          distancia,
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.distancia - b.distancia);

    if (!itensValidos.length) {
      alert("Nenhum cliente da rota possui coordenadas para ordenação.");
      return;
    }

    const confirmar = confirm(
      `Deseja reorganizar a sequência da rota com base na origem ${
        origemOrdenacao.municipio_origem || "selecionada"
      }?`
    );

    if (!confirmar) return;

    for (let i = 0; i < itensValidos.length; i++) {
      const item = itensValidos[i];

      const { error } = await supabase
        .from("rota_clientes")
        .update({ sequencia: i + 1 })
        .eq("id", item.id);

      if (error) {
        alert("Falha ao ordenar rota: " + error.message);
        return;
      }
    }

    const observacaoOrigem =
      (rota.observacao || "") +
      `
[${new Date().toLocaleString("pt-BR")}] Rota ordenada por distância. Origem: ${
        origemOrdenacao.municipio_origem || "Localização atual"
      }.`;

    await supabase
      .from("rotas")
      .update({
        observacao: observacaoOrigem,
      })
      .eq("id", rota.id);

    const rotaAtualizada = {
      ...rota,
      observacao: observacaoOrigem,
    };

    setRotaSelecionada(rotaAtualizada);
    await abrirRota(rotaAtualizada);
    await carregarRotas();

    alert("Rota ordenada por distância.");
  }

  async function ordenarRotaPorDistancia(rota) {
    if (!rota) {
      alert("Nenhuma rota selecionada.");
      return;
    }

    const usarLocalizacaoAtual = confirm(
      "Deseja ordenar usando sua localização atual?\n\nOK = Usar localização atual\nCancelar = Informar cidade manualmente"
    );

    if (usarLocalizacaoAtual) {
      if (!navigator.geolocation) {
        alert("Geolocalização não disponível neste dispositivo.");
        return;
      }

      const origemOrdenacao = await new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (posicao) => {
            resolve({
              latitude: posicao.coords.latitude,
              longitude: posicao.coords.longitude,
              municipio_origem: "Localização atual",
            });
          },
          () => {
            alert("Não foi possível obter sua localização.");
            resolve(null);
          },
        );
      });

      await executarOrdenacaoRotaPorDistancia(rota, origemOrdenacao);
      return;
    }

    abrirModalCidade(async (cidadeSelecionada) => {
      if (!cidadeSelecionada) {
        return;
      }

      const origemOrdenacao = {
        latitude: cidadeSelecionada.latitude,
        longitude: cidadeSelecionada.longitude,
        municipio_origem: cidadeSelecionada.nome,
      };

      await executarOrdenacaoRotaPorDistancia(rota, origemOrdenacao);
    });
  }


  async function carregarUsuariosPerfis(perfilAtual) {

  if (perfilAtual?.tipo_perfil !== "admin") {
    return;
  }

  setCarregandoUsuarios(true);

  const { data, error } = await supabase
    .from("perfis")
    .select("*")
    .order("nome", { ascending: true });
    console.log("ERRO PERFIS:", error);
    console.log("DATA PERFIS:", data);

  if (error) {
    alert("Falha ao carregar usuários: " + error.message);
    setCarregandoUsuarios(false);
    return;
  }

  console.log("Usuarios carregados:", data);
  setUsuariosPerfis(data || []);

  setCarregandoUsuarios(false);
}

  function limparFormularioUsuarioPerfil() {
    setUsuarioPerfilForm({
      nome: "",
      email: "",
      user_id: "",
      tipo_perfil: "representante",
      codigo_representante: "",
      ativo: true,
    });
  }

  async function salvarUsuarioPerfil() {
    if (perfil?.tipo_perfil !== "admin") {
      alert("Somente administrador pode cadastrar usuários.");
      return;
    }

    if (!usuarioPerfilForm.nome.trim()) {
      alert("Informe o nome do usuário.");
      return;
    }

    if (!usuarioPerfilForm.email.trim()) {
      alert("Informe o e-mail do usuário.");
      return;
    }

    if (!usuarioPerfilForm.user_id.trim()) {
      alert("Informe o User ID do Supabase Auth.");
      return;
    }

    if (
      usuarioPerfilForm.tipo_perfil === "representante" &&
      !usuarioPerfilForm.codigo_representante.trim()
    ) {
      alert("Para representante, informe o código do representante CIGAM.");
      return;
    }

    const payload = {
      nome: usuarioPerfilForm.nome.trim(),
      email: usuarioPerfilForm.email.trim(),
      user_id: usuarioPerfilForm.user_id.trim(),
      tipo_perfil: usuarioPerfilForm.tipo_perfil,
      codigo_representante:
        usuarioPerfilForm.tipo_perfil === "representante"
          ? String(usuarioPerfilForm.codigo_representante || "").padStart(
              6,
              "0",
            )
          : null,
      ativo: usuarioPerfilForm.ativo,
    };

    const { error } = await supabase;

    if (error) {
      alert("Falha ao salvar usuário: " + error.message);
      return;
    }

    alert("Usuário salvo com sucesso.");

    limparFormularioUsuarioPerfil();
    
  }


const linkRecuperacaoExpirado =
  window.location.href.includes("otp_expired") ||
  window.location.href.includes("access_denied");

const modoLinkRecuperacao =
  window.location.href.includes("type=recovery") &&
  !linkRecuperacaoExpirado;



if (!session || modoLinkRecuperacao || modoRecuperacaoSenha) {
  return (
    <Login
      email={email}
      setEmail={setEmail}
      senha={senha}
      setSenha={setSenha}
      login={login}
      enviarRecuperacaoSenha={enviarRecuperacaoSenha}
      modoRecuperacaoSenha={modoLinkRecuperacao || modoRecuperacaoSenha}
      novaSenha={novaSenha}
      setNovaSenha={setNovaSenha}
      confirmarNovaSenha={confirmarNovaSenha}
      setConfirmarNovaSenha={setConfirmarNovaSenha}
      salvarNovaSenha={salvarNovaSenha}
    />
  );
}

  if (!perfil) {
    return (
      <div className="app">
        <p>Carregando perfil...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="home-topo">
        <div className="home-topo-overlay">
          <img
            className="home-logo-phenix"
            src="https://phenixonline.com.br/wp-content/uploads/2021/05/Logo-Branco-1.png"
            alt="Phenix"
          />

          <div className="home-acoes-topo">
            <div className="usuario-logado-topo">
              <span>{perfil?.nome || session?.user?.email}</span>
              <small>{perfil?.tipo_perfil}</small>
            </div>
            {telaAtual !== "home" && (
              <button
                type="button"
                className="home-botao-menu"
                onClick={() => setTelaAtual("home")}
              >
                ☰ Menu
              </button>
            )}

            <button className="home-botao-sair" onClick={sair}>
              <LogOut size={18} />
              Sair
            </button>
          </div>

          <div className="home-titulo-topo">
            <h1>Radar de Clientes</h1>
            <p>Rotas, clientes próximos e oportunidades comerciais</p>
          </div>
        </div>
      </header>

      {telaAtual === "home" && (
        <>
          <div className="home-menu-cards">
            <button
              className="home-card-menu"
              onClick={() => {
                setTelaAtual("clientes");
                setModoProximos(false);
                setLocalizacaoUsuario(null);
                setOrigemOrdenacaoRota("");
              }}
            >
              <div className="home-icone-menu">
                <Users size={42} />
              </div>

              <div className="home-conteudo-menu">
                <h3>Clientes</h3>
                <p>Consulta completa de clientes</p>
              </div>

              <ChevronRight size={28} />
            </button>

            <button
              className="home-card-menu"
              onClick={() => {
                setTelaAtual("proximos");
                setRaioKm(50);
                buscarClientesProximos();
              }}
            >
              <div className="home-icone-menu">
                <MapPin size={42} />
              </div>

              <div className="home-conteudo-menu">
                <h3>Próximos</h3>
                <p>Clientes próximos da sua localização</p>
              </div>

              <ChevronRight size={28} />
            </button>

            <button
              className="home-card-menu"
              onClick={() => {
                setTelaAtual("rotas");
                carregarRotas();
              }}
            >
              <div className="home-icone-menu">
                <Route size={42} />
              </div>

              <div className="home-conteudo-menu">
                <h3>Rotas</h3>
                <p>Planejamento e execução de rotas</p>
              </div>

              <ChevronRight size={28} />
            </button>

            <button
              className="home-card-menu"
              onClick={() => {
                setTelaAtual("dashboard");
                carregarRotas();
              }}
            >
              <div className="home-icone-menu">
                <BarChart3 size={42} />
              </div>

              <div className="home-conteudo-menu">
                <h3>Dashboard</h3>
                <p>Indicadores e análises do negócio</p>
              </div>

              <ChevronRight size={28} />
            </button>

<button
  className="home-card-menu"
  onClick={() => {
    setTelaAtual("alterarSenha");
  }}
>
  <div className="home-icone-menu">
    <Settings size={42} />
  </div>

  <div className="home-conteudo-menu">
    <h3>Alterar senha</h3>
    <p>Atualize sua senha de acesso</p>
  </div>

  <ChevronRight size={28} />
</button>

            {perfil?.tipo_perfil === "admin" && (
              <button
                className="home-card-menu"
                onClick={() => {
                  setTelaAtual("admin");
                  carregarUsuariosPerfis();
                }}
              >
                <div className="home-icone-menu">
                  <Settings size={42} />
                </div>

                <div className="home-conteudo-menu">
                  <h3>Administração</h3>
                  <p>Importação e gerenciamento</p>
                </div>

                <ChevronRight size={28} />
              </button>
            )}
          </div>
        </>
      )}

{telaAtual === "alterarSenha" && (
  <section className="painel-admin">
    <h2>Alterar senha</h2>

    <div className="admin-bloco">
      <p>Informe sua senha atual e defina uma nova senha de acesso.</p>

      <div className="admin-form-usuarios">
        <div>
          <label>Senha atual</label>
          <input
            type="password"
            value={senhaAtualInterna}
            onChange={(e) => setSenhaAtualInterna(e.target.value)}
          />
        </div>

        <div>
          <label>Nova senha</label>
          <input
            type="password"
            value={novaSenhaInterna}
            onChange={(e) => setNovaSenhaInterna(e.target.value)}
          />
        </div>

        <div>
          <label>Confirmar nova senha</label>
          <input
            type="password"
            value={confirmarSenhaInterna}
            onChange={(e) => setConfirmarSenhaInterna(e.target.value)}
          />
        </div>
      </div>

      <div className="admin-acoes">
        <button
          type="button"
          onClick={alterarSenhaInterna}
          disabled={alterandoSenhaInterna}
        >
          {alterandoSenhaInterna ? "Alterando..." : "Alterar senha"}
        </button>

        <button
          type="button"
          onClick={() => {
            setSenhaAtualInterna("");
            setNovaSenhaInterna("");
            setConfirmarSenhaInterna("");
            setTelaAtual("home");
          }}
        >
          Cancelar
        </button>
      </div>
    </div>
  </section>
)}

      {perfil.tipo_perfil === "admin" && telaAtual === "admin" && (
        <section className="painel-admin">
          <h2>Área Administrativa</h2>

          <div className="admin-bloco">
            <h3>Importação de Clientes</h3>

            <p>Importação completa da base de clientes exportada do Oracle.</p>

            {resumoGeo && (
              <div className="resumo-geo">
                <p>
                  <strong>Total de clientes:</strong> {resumoGeo.total}
                </p>

                <p>
                  <strong>Com coordenada:</strong> {resumoGeo.comCoordenada}
                </p>

                <p>
                  <strong>Sem coordenada:</strong> {resumoGeo.semCoordenada}
                </p>

                <p>
                  <strong>Com falha:</strong> {resumoGeo.comFalha}
                </p>
              </div>
            )}

            <p>
              <button
                type="button"
                onClick={atualizarCoordenadasPendentes}
                disabled={geocodificando}
              >
                Atualizar coordenadas pendentes
              </button>
            </p>

            {geocodificando && <p>Atualizando coordenadas, aguarde...</p>}

            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={importarPlanilha}
              disabled={importando}
            />

            {importando && <p>Importando clientes, aguarde...</p>}
          </div>

          <div className="admin-bloco">
            <h3>Manutenção de Usuários</h3>

            <p>Ajuste o perfil do usuário já criado no Supabase Auth.</p>

            <div
  className="admin-form-usuarios"
  style={{
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    maxWidth: "400px",
  }}
>
              <div>
                <label>Nome</label>
                <input
                  type="text"
                  value={usuarioPerfilForm.nome}
                  onChange={(e) =>
                    setUsuarioPerfilForm({
                      ...usuarioPerfilForm,
                      nome: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label>E-mail</label>
                <input
                  type="email"
                  value={usuarioPerfilForm.email}
                  onChange={(e) =>
                    setUsuarioPerfilForm({
                      ...usuarioPerfilForm,
                      email: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label>User ID Supabase</label>
                <input
                  type="text"
                  value={usuarioPerfilForm.user_id}
                  onChange={(e) =>
                    setUsuarioPerfilForm({
                      ...usuarioPerfilForm,
                      user_id: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label>Tipo de perfil</label>
                <select
                  value={usuarioPerfilForm.tipo_perfil}
                  onChange={(e) =>
                    setUsuarioPerfilForm({
                      ...usuarioPerfilForm,
                      tipo_perfil: e.target.value,
                      codigo_representante:
                        e.target.value === "representante"
                          ? usuarioPerfilForm.codigo_representante
                          : "",
                    })
                  }
                >
                  <option value="admin">Admin</option>
                  <option value="tecnico">Técnico</option>
                  <option value="representante">Representante</option>
                </select>
              </div>

              {usuarioPerfilForm.tipo_perfil === "representante" && (
                <div>
                  <label>Código representante CIGAM</label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="000000"
                    value={usuarioPerfilForm.codigo_representante}
                    onChange={(e) =>
                      setUsuarioPerfilForm({
                        ...usuarioPerfilForm,
                        codigo_representante: e.target.value.replace(/\D/g, ""),
                      })
                    }
                  />
                </div>
              )}

              <div className="admin-check">
                <label>
                  <input
                    type="checkbox"
                    checked={usuarioPerfilForm.ativo}
                    onChange={(e) =>
                      setUsuarioPerfilForm({
                        ...usuarioPerfilForm,
                        ativo: e.target.checked,
                      })
                    }
                  />
                  Usuário ativo
                </label>
              </div>
            </div>

            <div className="admin-acoes">
              <button type="button" onClick={salvarUsuarioPerfil}>
                Salvar usuário
              </button>

              <button type="button" onClick={limparFormularioUsuarioPerfil}>
                Limpar
              </button>

              <button type="button" onClick={carregarUsuariosPerfis}>
                Atualizar lista
              </button>
            </div>

            <div className="admin-lista-usuarios">
              <h3>Usuários cadastrados</h3>

              {carregandoUsuarios ? (
                <p>Carregando usuários...</p>
              ) : usuariosPerfis.length === 0 ? (
                <p>Nenhum usuário cadastrado.</p>
              ) : (
                usuariosPerfis.map((usuario) => (
                  <div className="admin-card-usuario" key={usuario.user_id}>
                    <div>
                      <strong>{usuario.nome}</strong>
                      <span>{usuario.email}</span>
                    </div>

                    <div>
                      <span className="admin-badge">{usuario.tipo_perfil}</span>

                      {usuario.codigo_representante && (
                        <span className="admin-badge secundario">
                          Rep. {usuario.codigo_representante}
                        </span>
                      )}

                      <span
                        className={
                          usuario.ativo
                            ? "admin-badge ativo"
                            : "admin-badge inativo"
                        }
                      >
                        {usuario.ativo ? "Ativo" : "Inativo"}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setUsuarioPerfilForm({
                          nome: usuario.nome || "",
                          email: usuario.email || "",
                          user_id: usuario.user_id || "",
                          tipo_perfil: usuario.tipo_perfil || "representante",
                          codigo_representante:
                            usuario.codigo_representante || "",
                          ativo: usuario.ativo === true,
                        })
                      }
                    >
                      Editar
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      )}

      <main className="conteudo">
        {(telaAtual === "clientes" || telaAtual === "proximos") && (
          <section className="painel">
            <h2>Clientes</h2>

            <input
              className="campo-busca"
              type="text"
              placeholder="Buscar por cliente, código, cidade, UF, telefone..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />

            <div className="clientes-toolbar">
  {modoProximos ? (
    <button type="button" onClick={limparModoProximos}>
      Limpar proximidade
    </button>
  ) : (
    <button type="button" onClick={buscarClientesProximos}>
      Clientes próximos de mim
    </button>
  )}
</div>

            {modoProximos && (
             <div className="controle-raio controle-raio-card">
                {origemOrdenacaoRota && (
  <p className="origem-localizacao">
    <strong>Origem da busca:</strong> {origemOrdenacaoRota}
  </p>
)}
                <label>Raio de busca:</label>

                <select
                  value={raioKm}
                  onChange={(e) => setRaioKm(Number(e.target.value))}
                >
                  <option value={10}>10 km</option>
                  <option value={25}>25 km</option>
                  <option value={50}>50 km</option>
                  <option value={100}>100 km</option>
                  <option value={200}>200 km</option>
                </select>
              </div>
            )}

            <p>Total exibido: {clientesFiltrados.length}</p>

            {carregando ? (
              <p>Carregando clientes...</p>
            ) : (
              <div className="grid-clientes">
                {clientesFiltrados.map((item) => (
                  <div className="card-cliente" key={item.id}>
                    <h3>{item.cliente || "Cliente sem nome"}</h3>

                    <p>
                      <strong>Código:</strong> {item.codigo_cliente || "-"}
                    </p>

                    <p>
                      <strong>Cidade:</strong> {item.cidade || "-"} /{" "}
                      {item.uf || "-"}
                      {item.distancia_km !== undefined
                        ? ` | Distância: ${item.distancia_km.toFixed(1)} km`
                        : ""}
                    </p>

                    <p>
                      <strong>Endereço:</strong> {item.endereco_completo || "-"}
                    </p>

                    <p>
                      <strong>Telefone:</strong> {item.telefone || "-"}
                    </p>

                    <p>
                      <strong>WhatsApp:</strong> {item.whatsapp || "-"}
                    </p>

                    <p>
                      <strong>Representante:</strong>{" "}
                      {item.codigo_representante || "-"}
                    </p>

                    <p>
                      <strong>Tipo:</strong> {item.tipo || "Não informado"}
                    </p>

                    <p>
                      <strong>Prioridade:</strong>{" "}
                      {item.prioridade || "Não informada"}
                    </p>

                    <p>
                      <strong>Status:</strong> {item.status || "Não informado"}
                    </p>

                    <div className="acoes">
                      <button onClick={() => abrirMaps(item)}>Waze</button>

                      <button onClick={() => abrirWhatsApp(item)}>
                        WhatsApp
                      </button>

                      <button
                        type="button"
                        className="botao-acao"
                        onClick={() => {
                          const codigo = String(
                            item.codigo_cliente || "",
                          ).padStart(6, "0");

                          window.open(
                            `https://phenixportais.cigam.cloud/portalrepresentante/ge/acompanhamento/pesquisa/${codigo}`,
                            "_blank",
                          );
                        }}
                      >
                        Acomp.
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

       {telaAtual === "dashboard" && (
  <section className="painel dashboard-painel">
    <h2>Dashboard</h2>

    <div className="dashboard-grupo">
      <h3>
        <Route size={22} />
        Rotas
      </h3>

      <div className="dashboard-indicadores">
        <div className="dashboard-indicador">
          <Route size={30} />
          <span>Total de rotas</span>
          <strong>{indicadoresDashboard.totalRotas}</strong>
        </div>

        <div
          className="dashboard-indicador dashboard-card-click"
          onClick={() => abrirRotasPorStatus("ABERTA")}
        >
          <LockOpen size={30} />
          <span>Abertas</span>
          <strong>{indicadoresDashboard.abertas}</strong>
        </div>

        <div
          className="dashboard-indicador dashboard-card-click"
          onClick={() => abrirRotasPorStatus("FECHADA")}
        >
          <Flag size={30} />
          <span>Fechadas</span>
          <strong>{indicadoresDashboard.fechadas}</strong>
        </div>

        <div
          className="dashboard-indicador dashboard-card-click"
          onClick={() => abrirRotasPorStatus("EM_ANDAMENTO")}
        >
          <PlayCircle size={30} />
          <span>Em andamento</span>
          <strong>{indicadoresDashboard.emAndamento}</strong>
        </div>

        <div
          className="dashboard-indicador dashboard-card-click"
          onClick={() => abrirRotasPorStatus("FINALIZADA")}
        >
          <CheckCircle size={30} />
          <span>Finalizadas</span>
          <strong>{indicadoresDashboard.finalizadas}</strong>
        </div>
      </div>
    </div>

    <div className="dashboard-grupo">
      <h3>
        <Users size={22} />
        Clientes
      </h3>

      <div className="dashboard-indicadores">
        <div className="dashboard-indicador">
          <Users size={30} />
          <span>Clientes cadastrados</span>
          <strong>{indicadoresDashboard.totalClientes}</strong>
        </div>

        <div className="dashboard-indicador">
          <Route size={30} />
          <span>Clientes em rotas</span>
          <strong>{indicadoresDashboard.totalClientesRotas}</strong>
        </div>

        <div className="dashboard-indicador">
          <UserCheck size={30} />
          <span>Visitados</span>
          <strong>{indicadoresDashboard.totalVisitados}</strong>
        </div>

        <div className="dashboard-indicador">
          <AlertTriangle size={30} />
          <span>Pendentes</span>
          <strong>{indicadoresDashboard.totalPendentes}</strong>
        </div>

        <div className="dashboard-indicador dashboard-indicador-destaque">
          <Flag size={30} />
          <span>Conclusão das rotas</span>
          <strong>{indicadoresDashboard.percentualConclusao}%</strong>
        </div>
      </div>
    </div>

    <div className="dashboard-duas-colunas">
      <div className="dashboard-grupo">
        <h3>
          <Trophy size={22} />
          Ranking por responsável
        </h3>

        <div className="dashboard-ranking">
          {indicadoresDashboard.rankingResponsaveis.length === 0 ? (
            <p>Nenhuma rota encontrada.</p>
          ) : (
            indicadoresDashboard.rankingResponsaveis.map((item) => (
              <div className="dashboard-ranking-item" key={item.nome}>
                <div>
                  <strong>{item.nome}</strong>
                  <span>
                    {item.totalRotas} rota(s) · {item.totalClientes} cliente(s)
                  </span>
                </div>

                <div>
                  <strong>{item.totalVisitados}</strong>
                  <span>visitados</span>
                </div>

                <div>
                  <strong>{item.totalPendentes}</strong>
                  <span>pendentes</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="dashboard-grupo">
        <h3>
          <AlertTriangle size={22} />
          Rotas com pendências
        </h3>

        <div className="dashboard-ranking">
          {indicadoresDashboard.rotasCriticas.length === 0 ? (
            <p>Nenhuma rota com pendência encontrada.</p>
          ) : (
            indicadoresDashboard.rotasCriticas.map((rota) => (
              <div
                className="dashboard-ranking-item dashboard-ranking-click"
                key={rota.id}
                onClick={() => {
                  setTelaAtual("rotas");
                  abrirRota(rota);
                }}
              >
                <div>
                  <strong>{rota.nome}</strong>
                  <span>
                    {rota.responsavel_nome || "Sem responsável"} · {rota.status}
                  </span>
                </div>

                <div>
                  <strong>{rota.total_clientes || 0}</strong>
                  <span>clientes</span>
                </div>

                <div>
                  <strong>{rota.total_pendentes || 0}</strong>
                  <span>pendentes</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  </section>
)}

        {telaAtual === "rotas" && (
          <Rotas
            rotas={rotas}
            usuariosPerfis={usuariosPerfis}
            usuarioResponsavelRota={usuarioResponsavelRota}
            setUsuarioResponsavelRota={setUsuarioResponsavelRota}
            nomeNovaRota={nomeNovaRota}
            setNomeNovaRota={setNomeNovaRota}
            criarRota={criarRota}
            abrirRota={abrirRota}
            rotaSelecionada={rotaSelecionada}
            clientesDaRota={clientesDaRota}
            buscaClienteRota={buscaClienteRota}
            setBuscaClienteRota={setBuscaClienteRota}
            clientes={clientes}
            adicionarClienteNaRota={adicionarClienteNaRota}
            abrirMaps={abrirMaps}
            abrirWhatsApp={abrirWhatsApp}
            removerClienteDaRota={removerClienteDaRota}
            alterarStatusClienteRota={alterarStatusClienteRota}
            excluirRota={excluirRota}
            fecharRota={fecharRota}
            reabrirRota={reabrirRota}
            abrirRota={abrirRota}
            abrirRotaCompleta={abrirRotaCompleta}
            alterarSequenciaClienteRota={alterarSequenciaClienteRota}
            iniciarRota={iniciarRota}
            finalizarRota={finalizarRota}
            abrirAcompanhamento={abrirAcompanhamento}
            perfil={perfil}
            usuarioId={session.user.id}
            calcularDistanciaKm={calcularDistanciaKm}
            abrirAcompanhamento={abrirAcompanhamento}
            ordenarRotaPorDistancia={ordenarRotaPorDistancia}
            filtroResponsavelRotas={filtroResponsavelRotas}
setFiltroResponsavelRotas={setFiltroResponsavelRotas}
alterarResponsavelRota={alterarResponsavelRota}
filtroStatusRotas={filtroStatusRotas}
setFiltroStatusRotas={setFiltroStatusRotas}
          />
        )}
      </main>

      {modalCidadeAberto && (
        <div className="modal-cidade-overlay">
          <div className="modal-cidade">
            <div className="modal-cidade-cabecalho">
              <h2>Selecionar cidade</h2>
              <p>Digite pelo menos 3 letras e escolha uma das sugestões.</p>
            </div>

            <input
              type="text"
              placeholder="Ex.: Parobé, Novo Hamburgo, Porto Alegre"
              value={textoCidadeBusca}
              onChange={(e) => setTextoCidadeBusca(e.target.value)}
              autoFocus
            />

            {carregandoCidade && (
              <div className="cidade-carregando">Buscando cidades...</div>
            )}

            {!carregandoCidade && textoCidadeBusca.trim().length > 0 && textoCidadeBusca.trim().length < 3 && (
              <div className="cidade-ajuda">Digite mais caracteres para iniciar a busca.</div>
            )}

            {!carregandoCidade && textoCidadeBusca.trim().length >= 3 && sugestoesCidade.length === 0 && (
              <div className="cidade-ajuda">Nenhuma cidade encontrada. Tente informar cidade e UF.</div>
            )}

            <div className="cidade-lista">
              {sugestoesCidade.map((item, index) => (
                <button
                  key={`${item.nome}-${index}`}
                  type="button"
                  className="cidade-item"
                  onClick={() => selecionarCidade(item)}
                >
                  <strong>{item.nome}</strong>
                  <span>{item.display_name}</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              className="cidade-fechar"
              onClick={() => {
                setModalCidadeAberto(false);
                setTextoCidadeBusca("");
                setSugestoesCidade([]);
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {modalVisita && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 99999,
          }}
        >
          <div
            style={{
              background: "#fff",
              width: "90%",
              maxWidth: "500px",
              padding: "25px",
              borderRadius: "18px",
              boxShadow: "0 10px 35px rgba(0,0,0,0.25)",
            }}
          >
            <h2>Registrar visita</h2>

            <p>
              <strong>Cliente:</strong> {clienteVisita?.cliente}
            </p>

            <textarea
              placeholder="Observações da visita..."
              value={observacaoVisita}
              onChange={(e) => setObservacaoVisita(e.target.value)}
            />

            <div className="acoes-modal">
              <button
                type="button"
                onClick={registrarVisita}
                disabled={gravandoVisita}
              >
                Confirmar visita
              </button>

              <button
                type="button"
                onClick={fecharModalVisita}
                disabled={gravandoVisita}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default App;
