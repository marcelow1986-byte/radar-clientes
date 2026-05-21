import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { supabase } from "./supabaseClient";
import "./App.css";
import "./home.css";
import Rotas from "./Rotas.jsx";
import "./clientes.css";
import "./login.css";
import "./admin.css";
import "./app-global.css";
import {
  Users,
  MapPin,
  Route,
  BarChart3,
  Settings,
  ChevronRight,
  LogOut,
} from "lucide-react";

function App() {
  const [session, setSession] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
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
const [telaAtual, setTelaAtual] = useState("home");
const [clientesDaRota, setClientesDaRota] = useState([]);
const [buscaClienteRota, setBuscaClienteRota] = useState("");
const [rotas, setRotas] = useState([]);
const [nomeNovaRota, setNomeNovaRota] = useState("");
const [rotaSelecionada, setRotaSelecionada] = useState(null);
const [modoReordenarRota, setModoReordenarRota] = useState(false);
const [sequenciasEditadas, setSequenciasEditadas] = useState({});
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
    (item) => item.latitude !== null && item.longitude !== null
  ).length;
  const comFalha = data.filter(
    (item) => item.erro_geocodificacao !== null
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

    const { data } = supabase.auth.onAuthStateChange((_event, sessionAtual) => {
      setSession(sessionAtual);

      if (sessionAtual?.user) {
        carregarPerfil(sessionAtual.user.id);
      } else {
        setPerfil(null);
        setClientes([]);
      }
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

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

  async function sair() {
    await supabase.auth.signOut();
    setSession(null);
    setPerfil(null);
    setClientes([]);
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
        perfilUsuario.codigo_representante
      );
    }

    const { data, error } = await consulta;

    if (error) {
      alert("Falha ao carregar clientes: " + error.message);
      setClientes([]);
    } else {
      setClientes(data || []);
carregarResumoGeo();
    }

    setCarregando(false);
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
      "Esta importação vai substituir a base atual de clientes. Deseja continuar?"
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

  function abrirMaps(cliente) {
  if (!cliente?.latitude || !cliente?.longitude) {
    alert("Cliente sem coordenadas.");
    return;
  }

  window.open(
    `https://www.waze.com/pt-BR/live-map/directions?to=ll.${cliente.latitude}%2C${cliente.longitude}`,
    "_blank"
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
    "_blank"
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

  let clientesFiltrados = clientes.filter((item) => {
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
  clientesFiltrados = clientesFiltrados
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

function buscarClientesProximos() {
  if (!navigator.geolocation) {
    alert("Geolocalização não disponível neste dispositivo.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (posicao) => {
      setLocalizacaoUsuario({
        latitude: posicao.coords.latitude,
        longitude: posicao.coords.longitude,
      });

      setModoProximos(false);

setTimeout(() => {
  setModoProximos(true);
}, 100);
    },
    () => {
      alert("Não foi possível obter sua localização.");
    }
  );
}

function limparModoProximos() {
  setModoProximos(false);
  setLocalizacaoUsuario(null);
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
        const { error } = await supabase
          .from("visitas")
         .insert({
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
    }
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
    }
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
    >
     
    </div>

    <div
  className="dashboard-card"
  onClick={() => {
    setTelaAtual("proximos");
    setRaioKm(50);
    buscarClientesProximos();
  }}
>
 
</div>

    <div
      className="dashboard-card"
      onClick={() => setTelaAtual("rotas")}
    >
      
    </div>

    {perfil?.tipo_perfil === "admin" && (
      <div
        className="dashboard-card"
        onClick={() => setTelaAtual("admin")}
      >
        
      </div>
    )}
  </div>
);

async function carregarRotas() {
  let consultaRotas = supabase
  .from("rotas")
  .select("*")
  .order("created_at", { ascending: false });

if (perfil?.tipo_perfil !== "admin") {
  consultaRotas = consultaRotas.eq("user_id", session.user.id);
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

  const rotasComResumo = (rotasData || []).map((rota) => {
    const itens = (itensRota || []).filter(
      (item) => item.rota_id === rota.id
    );

    return {
      ...rota,
      total_clientes: itens.length,
      total_visitados: itens.filter(
        (item) => item.status === "VISITADO" || item.visitado === true
      ).length,
      total_cancelados: itens.filter(
        (item) => item.status === "CANCELADO"
      ).length,
      total_pendentes: itens.filter(
        (item) =>
          item.status === "PENDENTE" ||
          item.status === null ||
          item.status === undefined
      ).length,
    };
  });

  setRotas(rotasComResumo);
}

async function abrirRota(rota) {
if (!rota) {
  setRotaSelecionada(null);
  setClientesDaRota([]);
  setClientesProximosAtivo(true);
  return;
}
  setRotaSelecionada(rota);

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
      const cliente = clientes.find(
        (cli) => cli.id === item.cliente_id
      );

      return {
        ...item,
        cliente,
      };
    })
    .filter(
      (item) =>
        item.cliente &&
        item.cliente.latitude &&
        item.cliente.longitude
    );

  if (clientesOrdenados.length === 0) {
    alert("Nenhum cliente da rota possui coordenadas.");
    return;
  }

  const destino = clientesOrdenados[clientesOrdenados.length - 1].cliente;

  const intermediarios = clientesOrdenados
    .slice(0, -1)
    .map(
      (item) =>
        `${item.cliente.latitude},${item.cliente.longitude}`
    )
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
    (item) => item.cliente_id === cliente.id
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
    total_clientes: (rotaAnterior?.total_clientes || clientesDaRota.length) + 1,
    total_pendentes: (rotaAnterior?.total_pendentes || 0) + 1,
  }));
}

  

async function criarRota() {
  if (!nomeNovaRota.trim()) {
    alert("Informe o nome da rota");
    return;
  }

  const { error } = await supabase
    .from("rotas")
    .insert({
  nome: nomeNovaRota.trim(),
  user_id: session.user.id,
  criado_por: session.user.id,
  status: "ABERTA",
})

  if (error) {
    alert("Erro ao criar rota");
    return;
  }

  setNomeNovaRota("");

  await carregarRotas();
}

async function excluirRota(rota) {
  const confirmar = confirm(
    "Deseja excluir a rota " + rota.nome + "?"
  );

  if (!confirmar) return;

  const { data: itensExcluidos, error: erroItens } = await supabase
  .from("rota_clientes")
  .delete()
  .eq("rota_id", rota.id)
  .select();

console.log("Itens excluídos:", itensExcluidos);

  if (erroItens) {
  alert(
    "Falha ao excluir clientes da rota: " +
    erroItens.message
  );
  return;
}

  const { data: rotaExcluida, error } = await supabase
  .from("rotas")
  .delete()
  .eq("id", rota.id)
  .select();

console.log("Rota excluída:", rotaExcluida);

  if (error) {
  alert(
    "Falha ao excluir rota: " +
    error.message
  );
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

  const { data, error } = await supabase
  .from("rota_clientes")
  .update({
    status: novoStatus,
    visitado: novoStatus === "VISITADO",
  })
  .eq("id", itemRota.id)
  .select();

console.log("Status atualizado:", data);

  if (error) {
    alert("Falha ao atualizar status: " + error.message);
    return;
  }

  if (rotaSelecionada) {
    await abrirRota(rotaSelecionada);
  }

  await carregarRotas();
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
    Number(item.sequencia) === Number(novaSequencia)
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
    alert("Todas as sequências devem ser preenchidas com número maior que zero.");
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

  const confirmar = confirm("Deseja fechar esta rota?");

  if (!confirmar) return;

  const { error } = await supabase
    .from("rotas")
    .update({
      status: "FECHADA",
    })
    .eq("id", rota.id);

  if (error) {
    alert("Falha ao fechar rota: " + error.message);
    return;
  }

  setRotaSelecionada({
    ...rota,
    status: "FECHADA",
  });

  await carregarRotas();
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

  const confirmar = confirm("Deseja finalizar esta rota?");

  if (!confirmar) return;

  const { error } = await supabase
    .from("rotas")
    .update({
      status: "FINALIZADA",
      finalizada_em: new Date().toISOString(),
    })
    .eq("id", rota.id);

  if (error) {
    alert("Falha ao finalizar rota: " + error.message);
    return;
  }

  setRotaSelecionada({
    ...rota,
    status: "FINALIZADA",
    finalizada_em: new Date().toISOString(),
  });

  await carregarRotas();
}

async function reabrirRota(rota) {
  if (!rota?.id) return;

  const confirmar = confirm("Deseja reabrir esta rota?");

  if (!confirmar) return;

  const dataHora = new Date().toLocaleString("pt-BR");

  const novaObservacao =
    (rota.observacao || "") +
    `\nRota reaberta em ${dataHora} por ${perfil?.nome || "usuário"}.`;

  const { error } = await supabase
    .from("rotas")
    .update({
      status: "ABERTA",
      observacao: novaObservacao,
    })
    .eq("id", rota.id);

  if (error) {
    alert("Falha ao reabrir rota: " + error.message);
    return;
  }

  setRotaSelecionada({
    ...rota,
    status: "ABERTA",
    observacao: novaObservacao,
  });

  await carregarRotas();
}

async function carregarUsuariosPerfis() {
  if (perfil?.tipo_perfil !== "admin") return;

  setCarregandoUsuarios(true);

  const { data, error } = await supabase
    .from("perfis")
    .select("*")
    .order("nome", { ascending: true });

  if (error) {
    alert("Falha ao carregar usuários: " + error.message);
    setCarregandoUsuarios(false);
    return;
  }

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
        ? String(usuarioPerfilForm.codigo_representante || "").padStart(6, "0")
        : null,
    ativo: usuarioPerfilForm.ativo,
  };

  const { error } = await supabase

  if (error) {
    alert("Falha ao salvar usuário: " + error.message);
    return;
  }

  alert("Usuário salvo com sucesso.");

  limparFormularioUsuarioPerfil();
  await carregarUsuariosPerfis();
}

if (!session) {
  return (
    <div className="login-page">

  <div className="login-bg-overlay"></div>

  <div className="login-card-premium">

    <div className="login-topo">

      <img
        src="https://phenixonline.com.br/wp-content/uploads/2021/05/Logo-azul.png"
        alt="Phenix"
        className="login-logo-phenix"
      />

      <div className="login-titulos">
        <h1>Radar Clientes</h1>

        <p>
          Rotas, clientes próximos e oportunidades comerciais
        </p>
      </div>

    </div>

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

    </form>

  </div>

</div>
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

    {perfil.tipo_perfil === "admin" &&
	
  telaAtual === "admin" && (
    <section className="painel-admin">
      <h2>Área Administrativa</h2>

      <div className="admin-bloco">
        <h3>Importação de Clientes</h3>

        <p>
          Importação completa da base de clientes exportada do Oracle.
        </p>

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

        {geocodificando && (
          <p>
            Atualizando coordenadas, aguarde...
          </p>
        )}

        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={importarPlanilha}
          disabled={importando}
        />

        {importando && (
          <p>
            Importando clientes, aguarde...
          </p>
        )}
      </div>

      <div className="admin-bloco">
        <h3>Manutenção de Usuários</h3>

        <p>
          Ajuste o perfil do usuário já criado no Supabase Auth.
        </p>

        <div className="admin-form-usuarios">
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
                  <span className="admin-badge">
                    {usuario.tipo_perfil}
                  </span>

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

   

      {(telaAtual === "clientes" ||
        telaAtual === "proximos") && (
        <section className="painel">

          <h2>Clientes</h2>

          <input
            className="campo-busca"
            type="text"
            placeholder="Buscar por cliente, código, cidade, UF, telefone..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />

          <div className="acoes-filtro">

            {
                clientesProximosAtivo ? (
                     < button
                    type = "button"
                        onClick = {
                        () => {
                            carregarClientes();
                            setClientesProximosAtivo(false);
                        }
                    }
                     >
                    Limpar proximidade
                     <  / button > ) : (
                     < button
                    type = "button"
                        onClick = {
                        buscarClientesProximos
                    }
                     >
                    Clientes próximos de mim
                     <  / button > )
            }

            {modoProximos && (
              <button
                type="button"
                onClick={limparModoProximos}
              >
                Limpar proximidade
              </button>
            )}
          </div>

          {modoProximos && (
            <div className="controle-raio">
              <label>
                Raio de busca:
              </label>

              <select
                value={raioKm}
                onChange={(e) =>
                  setRaioKm(Number(e.target.value))
                }
              >
                <option value={10}>10 km</option>
                <option value={25}>25 km</option>
                <option value={50}>50 km</option>
                <option value={100}>100 km</option>
                <option value={200}>200 km</option>
              </select>
            </div>
          )}

          <p>
            Total exibido: {clientesFiltrados.length}
          </p>

          {carregando ? (
            <p>
              Carregando clientes...
            </p>
          ) : (
            <div className="grid-clientes">
              {clientesFiltrados.map((item) => (
                <div
                  className="card-cliente"
                  key={item.id}
                >
                  <h3>
                    {item.cliente || "Cliente sem nome"}
                  </h3>

                  <p>
                    <strong>Código:</strong> {item.codigo_cliente || "-"}
                  </p>

                  <p>
                    <strong>Cidade:</strong>{" "}
                    {item.cidade || "-"} / {item.uf || "-"}
                    {item.distancia_km !== undefined
                      ? ` | Distância: ${item.distancia_km.toFixed(1)} km`
                      : ""}
                  </p>

                  <p>
                    <strong>Endereço:</strong>{" "}
                    {item.endereco_completo || "-"}
                  </p>

                  <p>
                    <strong>Telefone:</strong>{" "}
                    {item.telefone || "-"}
                  </p>

                  <p>
                    <strong>WhatsApp:</strong>{" "}
                    {item.whatsapp || "-"}
                  </p>

                  <p>
                    <strong>Representante:</strong>{" "}
                    {item.codigo_representante || "-"}
                  </p>

                  <p>
                    <strong>Tipo:</strong>{" "}
                    {item.tipo || "Não informado"}
                  </p>

                  <p>
                    <strong>Prioridade:</strong>{" "}
                    {item.prioridade || "Não informada"}
                  </p>

                  <p>
                    <strong>Status:</strong>{" "}
                    {item.status || "Não informado"}
                  </p>

                  <div className="acoes">
                    <button onClick={() => abrirMaps(item)}>
                      Waze
                    </button>

                    <button onClick={() => abrirWhatsApp(item)}>
                      WhatsApp
                    </button>

                    <button
  type="button"
  className="botao-acao"
  onClick={() => {
    const codigo = String(item.codigo_cliente || "").padStart(6, "0");

    window.open(
      `https://phenixportais.cigam.cloud/portalrepresentante/ge/acompanhamento/pesquisa/${codigo}`,
      "_blank"
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
{telaAtual === "rotas" && (
  <Rotas
  rotas={rotas}
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
/>

 
)}
     
    </main>
  
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