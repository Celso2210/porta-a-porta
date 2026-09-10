import { SolicitacaoViagem, Parada, Motorista, OfertaMotorista, OfertaVaga, TurnoViagem } from '../types';
import { MOTORISTA_JOSE, USUARIO_CELSO } from '../data/mockData';
import { 
  enviarNotificacaoPropostaMotorista, 
  enviarNotificacaoCorridaAceita,
  enviarNotificacaoConfirmacaoPassageiro,
  enviarNotificacaoMotoristaChegou 
} from './notificationService';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, onSnapshot, deleteDoc } from 'firebase/firestore';
import { calcularDistanciaEntreLocais } from './routeCalculator';

export interface DriverTripPlan {
  motoristaId: string;
  motorista: Motorista;
  cidadeOrigem: string;
  cidadeDestino: string;
  horarioSaida: string;
  vagasDesejadas: number;
  vagasOcupadas: number;
  passageirosConfirmados: {
    solicitacaoId: string;
    nome: string;
    telefone: string;
    enderecoEmbarque: string;
    enderecoDesembarque: string;
    vagas: number;
    valor: number;
    taxaReserva: number;
    valorLiquidoMotorista: number;
    horarioEstimado: string;
  }[];
  paradasGeradas: Parada[];
}

const STORAGE_KEY_SOLICITACOES = 'portaaporta_solicitacoes_v5';
const STORAGE_KEY_DRIVER_PLAN = 'portaaporta_driver_plan_v5';
const STORAGE_KEY_OFERTAS_VAGAS = 'portaaporta_ofertas_vagas_v5';

// Vagas padrão iniciais cadastradas pelos motoristas (ex: José com 4 vagas de manhã, Carlos com 1 vaga à tarde)
const INITIAL_DEFAULT_OFERTAS_VAGAS: OfertaVaga[] = [
  {
    id: 'OFR_JOSE_01',
    motoristaId: MOTORISTA_JOSE.id,
    motoristaNome: MOTORISTA_JOSE.nome,
    motoristaTelefone: MOTORISTA_JOSE.telefone,
    motoristaAvatar: MOTORISTA_JOSE.avatar,
    motoristaNota: MOTORISTA_JOSE.nota,
    veiculoModelo: MOTORISTA_JOSE.veiculo.modelo,
    veiculoPlaca: MOTORISTA_JOSE.veiculo.placa,
    cidadeOrigem: 'Água Doce do Norte',
    cidadeDestino: 'Vitória',
    data: 'Hoje',
    turno: 'manha',
    vagasTotais: 4,
    vagasDisponiveis: 4,
    valorPorVaga: 40.00,
    observacoes: 'Linha regular da manhã com 4 vagas livres. Ar-condicionado e porta a porta.',
    status: 'ativa',
    criadoEm: 'Hoje às 06:30'
  },
  {
    id: 'OFR_ROBERTO_04',
    motoristaId: 'DRV_ROBERTO',
    motoristaNome: 'Roberto Alves',
    motoristaTelefone: '(27) 99765-4321',
    motoristaAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    motoristaNota: 4.9,
    veiculoModelo: 'Renault Duster 1.6 Dynamique',
    veiculoPlaca: 'KLP-4920',
    cidadeOrigem: 'Água Doce do Norte',
    cidadeDestino: 'Vitória',
    data: 'Hoje',
    turno: 'manha',
    vagasTotais: 4,
    vagasDisponiveis: 3,
    valorPorVaga: 40.00,
    observacoes: 'Descendo pela manhã para Vitória/Serra. Bagageiro espaçoso.',
    status: 'ativa',
    criadoEm: 'Hoje às 07:00'
  },
  {
    id: 'OFR_FABIANO_05',
    motoristaId: 'DRV_FABIANO',
    motoristaNome: 'Fabiano Pereira',
    motoristaTelefone: '(27) 99812-3456',
    motoristaAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    motoristaNota: 5.0,
    veiculoModelo: 'Toyota Corolla Cross XRE',
    veiculoPlaca: 'OXZ-8134',
    cidadeOrigem: 'Água Doce do Norte',
    cidadeDestino: 'Vitória',
    data: 'Hoje',
    turno: 'manha',
    vagasTotais: 4,
    vagasDisponiveis: 2,
    valorPorVaga: 40.00,
    observacoes: 'Conforto total, ar gelando. Parada para café em Colatina.',
    status: 'ativa',
    criadoEm: 'Hoje às 07:15'
  },
  {
    id: 'OFR_CARLOS_02',
    motoristaId: 'DRV_CARLOS',
    motoristaNome: 'Carlos Silva',
    motoristaTelefone: '(27) 99844-3321',
    motoristaAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    motoristaNota: 4.8,
    veiculoModelo: 'Chevrolet Tracker (Turbo)',
    veiculoPlaca: 'RQI-7B32',
    cidadeOrigem: 'Barra de São Francisco',
    cidadeDestino: 'Vitória',
    data: 'Hoje',
    turno: 'tarde',
    vagasTotais: 3,
    vagasDisponiveis: 2,
    valorPorVaga: 45.00,
    observacoes: 'Estou descendo a trabalho e tenho vagas disponíveis para levar passageiro.',
    status: 'ativa',
    criadoEm: 'Hoje às 11:15'
  },
  {
    id: 'OFR_MARCOS_03',
    motoristaId: 'DRV_MARCOS',
    motoristaNome: 'Marcos Vinícius',
    motoristaTelefone: '(27) 99654-9870',
    motoristaAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    motoristaNota: 4.9,
    veiculoModelo: 'Toyota Corolla Cross',
    veiculoPlaca: 'OKY-5921',
    cidadeOrigem: 'Vitória',
    cidadeDestino: 'Água Doce do Norte',
    data: 'Hoje',
    turno: 'noite',
    vagasTotais: 4,
    vagasDisponiveis: 3,
    valorPorVaga: 40.00,
    observacoes: 'Retorno para o interior no turno da noite. Saída às 18:30.',
    status: 'ativa',
    criadoEm: 'Hoje às 14:00'
  }
];

// Viagens padrão de exemplo para passageiros na rota
const INITIAL_DEFAULT_SOLICITACOES: SolicitacaoViagem[] = [
  {
    id: 'SOL_CELSO_01',
    passageiroId: USUARIO_CELSO.id,
    passageiroNome: 'Celso',
    passageiroTelefone: '(27) 99876-5432',
    passageiroAvatar: USUARIO_CELSO.avatar,
    cidadeOrigem: 'Água Doce do Norte',
    cidadeDestino: 'Vitória da Conquista',
    enderecoEmbarque: 'Rua das Flores, 120 - Centro, Água Doce do Norte',
    enderecoDesembarque: 'Av. Olívia Flores, 450 - Candeias, Vitória da Conquista',
    qtdPassageiros: 1,
    qtdMalas: 2,
    modalidade: 'compartilhada',
    distanciaKm: 420,
    valorTotal: 50.00,
    taxaReserva: 5.00,
    valorLiquidoMotorista: 45.00,
    valorRestanteEmbarque: 45.00,
    taxaReservaPaga: true,
    metodoPagamentoTaxa: 'PIX Instantâneo',
    horarioDesejado: '08:00',
    status: 'confirmada',
    motoristaId: MOTORISTA_JOSE.id,
    motoristaNome: MOTORISTA_JOSE.nome,
    motoristaTelefone: MOTORISTA_JOSE.telefone,
    motoristaAvatar: MOTORISTA_JOSE.avatar,
    motoristaVeiculo: MOTORISTA_JOSE.veiculo.modelo,
    motoristaPlaca: MOTORISTA_JOSE.veiculo.placa,
    motoristaNota: MOTORISTA_JOSE.nota,
    criadoEm: 'Há 5 min'
  },
  {
    id: 'SOL_MARIANA_02',
    passageiroId: 'USR_MARIANA',
    passageiroNome: 'Mariana Costa',
    passageiroTelefone: '(27) 99777-1122',
    passageiroAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    cidadeOrigem: 'Água Doce do Norte',
    cidadeDestino: 'Vitória',
    enderecoEmbarque: 'Av. Sebastião Resende, 45 - Centro, Água Doce do Norte',
    enderecoDesembarque: 'Rua Aleixo Netto, 1200 - Praia do Canto, Vitória',
    qtdPassageiros: 1,
    qtdMalas: 2,
    modalidade: 'compartilhada',
    distanciaKm: 260,
    valorTotal: 45.00,
    taxaReserva: 4.50,
    valorLiquidoMotorista: 40.50,
    valorRestanteEmbarque: 40.50,
    taxaReservaPaga: true,
    metodoPagamentoTaxa: 'PIX Instantâneo',
    horarioDesejado: '14:00',
    status: 'aguardando_motorista',
    criadoEm: 'Há 15 min'
  },
  {
    id: 'SOL_MARCOS_03',
    passageiroId: 'USR_MARCOS',
    passageiroNome: 'Marcos Vinícius',
    passageiroTelefone: '(27) 99654-9870',
    passageiroAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    cidadeOrigem: 'Água Doce do Norte',
    cidadeDestino: 'Vitória',
    enderecoEmbarque: 'Rua Principal, 88 - Bairro Novo, Água Doce do Norte',
    enderecoDesembarque: 'Av. Nossa Senhora dos Navegantes, 900 - Enseada, Vitória',
    qtdPassageiros: 3,
    qtdMalas: 3,
    modalidade: 'exclusiva',
    distanciaKm: 260,
    valorTotal: 180.00,
    taxaReserva: 18.00,
    valorLiquidoMotorista: 162.00,
    valorRestanteEmbarque: 162.00,
    taxaReservaPaga: true,
    metodoPagamentoTaxa: 'PIX Instantâneo',
    horarioDesejado: '19:00',
    status: 'aguardando_motorista',
    criadoEm: 'Há 30 min'
  }
];

const INITIAL_DRIVER_PLAN: DriverTripPlan = {
  motoristaId: MOTORISTA_JOSE.id,
  motorista: MOTORISTA_JOSE,
  cidadeOrigem: 'Todas',
  cidadeDestino: 'Todas',
  horarioSaida: '08:00',
  vagasDesejadas: 4,
  vagasOcupadas: 1,
  passageirosConfirmados: [
    {
      solicitacaoId: 'SOL_CELSO_01',
      nome: 'Celso',
      telefone: '(27) 99876-5432',
      enderecoEmbarque: 'Rua das Flores, 120 - Centro, Água Doce do Norte',
      enderecoDesembarque: 'Av. Vitória, 500 - Centro, Vitória',
      vagas: 1,
      valor: 50.00,
      taxaReserva: 5.00,
      valorLiquidoMotorista: 45.00,
      horarioEstimado: '08:00'
    }
  ],
  paradasGeradas: []
};

// In-memory state with localStorage sync
let solicitacoesState: SolicitacaoViagem[] = loadSolicitacoes();
let driverPlanState: DriverTripPlan = loadDriverPlan();
let ofertasVagasState: OfertaVaga[] = loadOfertasVagas();

function loadSolicitacoes(): SolicitacaoViagem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SOLICITACOES);
    if (raw) {
      const parsed: SolicitacaoViagem[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Se Celso não estiver na lista (ex: cache antigo), garante que ele esteja disponível para o motorista
        const hasCelso = parsed.some(s => s.passageiroNome.toLowerCase().includes('celso'));
        if (!hasCelso) {
          return [INITIAL_DEFAULT_SOLICITACOES[0], ...parsed];
        }
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Erro ao ler localStorage de solicitações:', e);
  }
  return [...INITIAL_DEFAULT_SOLICITACOES];
}

function loadDriverPlan(): DriverTripPlan {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DRIVER_PLAN);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Erro ao ler localStorage do driver plan:', e);
  }
  return INITIAL_DRIVER_PLAN;
}

function loadOfertasVagas(): OfertaVaga[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_OFERTAS_VAGAS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Erro ao ler localStorage de ofertas de vagas:', e);
  }
  return [...INITIAL_DEFAULT_OFERTAS_VAGAS];
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY_SOLICITACOES, JSON.stringify(solicitacoesState));
    localStorage.setItem(STORAGE_KEY_DRIVER_PLAN, JSON.stringify(driverPlanState));
    localStorage.setItem(STORAGE_KEY_OFERTAS_VAGAS, JSON.stringify(ofertasVagasState));
  } catch (e) {
    console.warn('Erro ao salvar estado:', e);
  }
}

// Sincroniza uma solicitação específica no Firestore
async function syncSolicitacaoFirestore(sol: SolicitacaoViagem) {
  try {
    const docRef = doc(db, 'solicitacoes_viagem', sol.id);
    await setDoc(docRef, { ...sol }, { merge: true });
  } catch (err) {
    console.warn('Firestore sync solicitacao avisou:', err);
  }
}

// Sincroniza uma oferta de vaga específica no Firestore
async function syncOfertaVagaFirestore(oferta: OfertaVaga) {
  try {
    const docRef = doc(db, 'ofertas_vagas', oferta.id);
    await setDoc(docRef, { ...oferta }, { merge: true });
  } catch (err) {
    console.warn('Firestore sync oferta vaga avisou:', err);
  }
}

// Listeners for reactive updates
type Listener = () => void;
const listeners: Set<Listener> = new Set();

function notifyListeners() {
  saveState();
  listeners.forEach(l => {
    try { l(); } catch (e) { console.error(e); }
  });
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('portaaporta_state_changed'));
  }
}

// Cross-tab synchronization via storage event
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY_SOLICITACOES) {
      solicitacoesState = loadSolicitacoes();
      listeners.forEach(l => l());
    }
    if (e.key === STORAGE_KEY_DRIVER_PLAN) {
      driverPlanState = loadDriverPlan();
      listeners.forEach(l => l());
    }
    if (e.key === STORAGE_KEY_OFERTAS_VAGAS) {
      ofertasVagasState = loadOfertasVagas();
      listeners.forEach(l => l());
    }
  });

  window.addEventListener('portaaporta_state_changed', () => {
    solicitacoesState = loadSolicitacoes();
    driverPlanState = loadDriverPlan();
    ofertasVagasState = loadOfertasVagas();
    listeners.forEach(l => l());
  });

  // Ouve atualizações em tempo real do Firestore para suportar múltiplos navegadores/dispositivos
  try {
    const colRef = collection(db, 'solicitacoes_viagem');
    onSnapshot(colRef, (snapshot) => {
      let changed = false;
      snapshot.docChanges().forEach((change) => {
        const data = change.doc.data() as SolicitacaoViagem;
        const index = solicitacoesState.findIndex(s => s.id === change.doc.id);
        if (change.type === 'added') {
          if (index === -1) {
            solicitacoesState = [data, ...solicitacoesState];
            changed = true;
          }
        } else if (change.type === 'modified') {
          if (index !== -1) {
            solicitacoesState[index] = { ...solicitacoesState[index], ...data };
            changed = true;
          } else {
            solicitacoesState = [data, ...solicitacoesState];
            changed = true;
          }
        } else if (change.type === 'removed') {
          if (index !== -1) {
            solicitacoesState = solicitacoesState.filter(s => s.id !== change.doc.id);
            changed = true;
          }
        }
      });
      if (changed) {
        saveState();
        listeners.forEach(l => {
          try { l(); } catch (e) { console.error(e); }
        });
      }
    }, (err) => {
      console.warn('onSnapshot solicitacoes_viagem avisou:', err);
    });

    // Ouve ofertas de vagas no Firestore
    const vagasColRef = collection(db, 'ofertas_vagas');
    onSnapshot(vagasColRef, (snapshot) => {
      let changed = false;
      snapshot.docChanges().forEach((change) => {
        const data = change.doc.data() as OfertaVaga;
        const index = ofertasVagasState.findIndex(v => v.id === change.doc.id);
        if (change.type === 'added') {
          if (index === -1) {
            ofertasVagasState = [data, ...ofertasVagasState];
            changed = true;
          }
        } else if (change.type === 'modified') {
          if (index !== -1) {
            ofertasVagasState[index] = { ...ofertasVagasState[index], ...data };
            changed = true;
          } else {
            ofertasVagasState = [data, ...ofertasVagasState];
            changed = true;
          }
        } else if (change.type === 'removed') {
          if (index !== -1) {
            ofertasVagasState = ofertasVagasState.filter(v => v.id !== change.doc.id);
            changed = true;
          }
        }
      });
      if (changed) {
        saveState();
        listeners.forEach(l => {
          try { l(); } catch (e) { console.error(e); }
        });
      }
    }, (err) => {
      console.warn('onSnapshot ofertas_vagas avisou:', err);
    });
  } catch (e) {
    console.warn('Erro ao inicializar listener Firestore:', e);
  }
}

export function subscribeToTripStore(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSolicitacoes(): SolicitacaoViagem[] {
  return [...solicitacoesState];
}

export function getSolicitacaoById(id: string): SolicitacaoViagem | undefined {
  return solicitacoesState.find(s => s.id === id);
}

export function getMinhaSolicitacaoAtiva(passageiroId: string = USUARIO_CELSO.id): SolicitacaoViagem | undefined {
  return solicitacoesState.find(
    s => s.passageiroId === passageiroId && 
    !['cancelada', 'concluida', 'recusada'].includes(s.status)
  );
}

export function getDriverPlan(): DriverTripPlan {
  return { ...driverPlanState };
}

export function setDriverSearchPlan(origem: string, destino: string, horarioSaida: string = '08:00', vagas: number = 4) {
  driverPlanState = {
    ...driverPlanState,
    cidadeOrigem: origem,
    cidadeDestino: destino,
    horarioSaida: horarioSaida,
    vagasDesejadas: vagas
  };
  notifyListeners();
}

/**
 * Algoritmo de roteirização para gerar ordem otimizada de paradas
 */
export function gerarParadasOtimizadas(plan: DriverTripPlan): Parada[] {
  const paradas: Parada[] = [];
  let ordem = 1;

  // Embarques primeiro
  plan.passageirosConfirmados.forEach((pass) => {
    paradas.push({
      id: `PAR_EMB_${pass.solicitacaoId}`,
      viagemId: 'VG_ATUAL',
      tipo: 'embarque',
      passageiroId: pass.solicitacaoId,
      passageiroNome: pass.nome,
      endereco: pass.enderecoEmbarque,
      lat: -18.4812 + (ordem * 0.003),
      lng: -40.7621 + (ordem * 0.002),
      ordem: ordem++,
      status: 'pendente',
      horarioEstimado: pass.horarioEstimado
    });
  });

  // Desembarques depois
  plan.passageirosConfirmados.forEach((pass) => {
    paradas.push({
      id: `PAR_DES_${pass.solicitacaoId}`,
      viagemId: 'VG_ATUAL',
      tipo: 'desembarque',
      passageiroId: pass.solicitacaoId,
      passageiroNome: pass.nome,
      endereco: pass.enderecoDesembarque,
      lat: -20.3155 + (ordem * 0.004),
      lng: -40.3128 + (ordem * 0.003),
      ordem: ordem++,
      status: 'pendente',
      horarioEstimado: 'Chegada destino'
    });
  });

  return paradas;
}

/**
 * O motorista visualiza a lista de chamados reais e clica em "Aceitar Chamado".
 * Vincula o motorista real, altera o status para 'proposta_aceita_motorista' e aguarda a confirmação do passageiro.
 */
export async function motoristaAceitarPassageiro(
  solicitacaoId: string,
  horarioSaidaProposto: string = '08:00',
  motorista: Motorista = MOTORISTA_JOSE
) {
  const sol = solicitacoesState.find(s => s.id === solicitacaoId);
  if (!sol) return false;

  const vagasRestantes = Math.max(0, driverPlanState.vagasDesejadas - (driverPlanState.vagasOcupadas + sol.qtdPassageiros));

  let updatedSol: SolicitacaoViagem | null = null;

  // Atualiza a solicitação com status 'proposta_aceita_motorista' (aguardando confirmação do passageiro)
  solicitacoesState = solicitacoesState.map(item => {
    if (item.id === solicitacaoId) {
      updatedSol = {
        ...item,
        status: 'proposta_aceita_motorista' as const,
        motoristaId: motorista.id,
        motoristaNome: motorista.nome,
        motoristaTelefone: motorista.telefone,
        motoristaAvatar: motorista.avatar,
        motoristaVeiculo: motorista.veiculo.modelo,
        motoristaPlaca: motorista.veiculo.placa,
        motoristaNota: motorista.nota,
        horarioSaidaProposto,
        vagasRestantesNoCarro: vagasRestantes
      };
      return updatedSol;
    }
    return item;
  });

  // Adiciona passageiro à viagem ativa do motorista
  const novoPassageiro = {
    solicitacaoId: sol.id,
    nome: sol.passageiroNome,
    telefone: sol.passageiroTelefone,
    enderecoEmbarque: sol.enderecoEmbarque,
    enderecoDesembarque: sol.enderecoDesembarque,
    vagas: sol.qtdPassageiros,
    valor: sol.valorTotal,
    taxaReserva: sol.taxaReserva || (Math.round(sol.valorTotal * 0.10 * 100) / 100),
    valorLiquidoMotorista: sol.valorLiquidoMotorista || (Math.round(sol.valorTotal * 0.90 * 100) / 100),
    horarioEstimado: horarioSaidaProposto || driverPlanState.horarioSaida
  };

  const passageirosAtualizados = [
    ...driverPlanState.passageirosConfirmados.filter(p => p.solicitacaoId !== solicitacaoId),
    novoPassageiro
  ];

  const novasVagasOcupadas = passageirosAtualizados.reduce((acc, p) => acc + p.vagas, 0);

  const updatedPlan: DriverTripPlan = {
    ...driverPlanState,
    vagasOcupadas: novasVagasOcupadas,
    passageirosConfirmados: passageirosAtualizados,
    paradasGeradas: []
  };

  updatedPlan.paradasGeradas = gerarParadasOtimizadas(updatedPlan);
  driverPlanState = updatedPlan;

  if (updatedSol) {
    syncSolicitacaoFirestore(updatedSol);
  }

  // Dispara notificação destacada ao passageiro (Modal Toast com dados do carro e botão WhatsApp)
  await enviarNotificacaoCorridaAceita({
    usuarioUid: sol.passageiroId === USUARIO_CELSO.id ? 'celso_passageiro' : sol.passageiroId,
    motoristaNome: motorista.nome,
    motoristaTelefone: motorista.telefone,
    motoristaVeiculo: motorista.veiculo?.modelo || 'Chevrolet Spin Prata (7 Lugares)',
    motoristaPlaca: motorista.veiculo?.placa || 'ABC-1234',
    motoristaAvatar: motorista.avatar,
    motoristaNota: motorista.nota || 4.9,
    passageiroNome: sol.passageiroNome,
    horarioSaida: horarioSaidaProposto,
    origem: sol.cidadeOrigem,
    destino: sol.cidadeDestino,
    enderecoEmbarque: sol.enderecoEmbarque,
    solicitacaoId: solicitacaoId
  });

  notifyListeners();
  return true;
}

/**
 * Passageiro confirma a corrida após o motorista ter aceitado.
 * O status passa para 'confirmada', liberando o contato e localização via WhatsApp!
 */
export async function passageiroConfirmarCorrida(solicitacaoId: string) {
  let updatedSol: SolicitacaoViagem | null = null;

  solicitacoesState = solicitacoesState.map(item => {
    if (item.id === solicitacaoId) {
      updatedSol = {
        ...item,
        status: 'confirmada' as const
      };
      return updatedSol;
    }
    return item;
  });

  if (updatedSol) {
    syncSolicitacaoFirestore(updatedSol);
    const sol = updatedSol as SolicitacaoViagem;
    await enviarNotificacaoConfirmacaoPassageiro(
      sol.motoristaId || 'motorista_jose',
      sol.passageiroNome,
      sol.horarioDesejado || '08:00',
      `${sol.cidadeOrigem} ➔ ${sol.cidadeDestino}`,
      sol.id
    );
  }

  notifyListeners();
  return true;
}

/**
 * O motorista chegou ao endereço de embarque do passageiro
 */
export async function motoristaChegouAoEmbarque(solicitacaoId: string) {
  let updatedSol: SolicitacaoViagem | null = null;

  solicitacoesState = solicitacoesState.map(item => {
    if (item.id === solicitacaoId) {
      updatedSol = {
        ...item,
        status: 'motorista_chegou' as const
      };
      return updatedSol;
    }
    return item;
  });

  if (updatedSol) {
    syncSolicitacaoFirestore(updatedSol);
    const sol = updatedSol as SolicitacaoViagem;
    await enviarNotificacaoMotoristaChegou(
      sol.passageiroId === USUARIO_CELSO.id ? 'celso_passageiro' : sol.passageiroId,
      sol.motoristaNome || MOTORISTA_JOSE.nome,
      sol.enderecoEmbarque,
      sol.id
    );
  }

  notifyListeners();
  return true;
}

/**
 * O motorista inicia o trajeto intermunicipal com os passageiros a bordo
 */
export function motoristaIniciarViagem(solicitacaoId: string) {
  let updatedSol: SolicitacaoViagem | null = null;

  solicitacoesState = solicitacoesState.map(item => {
    if (item.id === solicitacaoId) {
      updatedSol = {
        ...item,
        status: 'em_viagem' as const
      };
      return updatedSol;
    }
    return item;
  });

  if (updatedSol) {
    syncSolicitacaoFirestore(updatedSol);
  }

  notifyListeners();
  return true;
}

/**
 * O motorista conclui a viagem no destino
 */
export function motoristaConcluirViagem(solicitacaoId: string) {
  let updatedSol: SolicitacaoViagem | null = null;

  solicitacoesState = solicitacoesState.map(item => {
    if (item.id === solicitacaoId) {
      updatedSol = {
        ...item,
        status: 'concluida' as const
      };
      return updatedSol;
    }
    return item;
  });

  if (updatedSol) {
    syncSolicitacaoFirestore(updatedSol);
  }

  notifyListeners();
  return true;
}

/**
 * Cancela a solicitação (seja pelo passageiro ou pelo motorista)
 */
export function cancelarSolicitacao(solicitacaoId: string) {
  let updatedSol: SolicitacaoViagem | null = null;

  solicitacoesState = solicitacoesState.map(item => {
    if (item.id === solicitacaoId) {
      updatedSol = {
        ...item,
        status: 'cancelada' as const
      };
      return updatedSol;
    }
    return item;
  });

  // Remove do plano de passageiros confirmados do motorista
  driverPlanState = {
    ...driverPlanState,
    passageirosConfirmados: driverPlanState.passageirosConfirmados.filter(p => p.solicitacaoId !== solicitacaoId),
    paradasGeradas: driverPlanState.paradasGeradas.filter(p => p.passageiroId !== solicitacaoId)
  };
  driverPlanState.vagasOcupadas = driverPlanState.passageirosConfirmados.reduce((acc, p) => acc + p.vagas, 0);

  if (updatedSol) {
    syncSolicitacaoFirestore(updatedSol);
  }

  notifyListeners();
  return true;
}

/**
 * Desfaz o aceite de um passageiro (retornando a solicitação para aguardando_motorista)
 */
export function motoristaDesfazerAceite(solicitacaoId: string) {
  let updatedSol: SolicitacaoViagem | null = null;
  solicitacoesState = solicitacoesState.map(item => {
    if (item.id === solicitacaoId) {
      updatedSol = {
        ...item,
        status: 'aguardando_motorista' as const,
        motoristaId: undefined,
        motoristaNome: undefined,
        motoristaTelefone: undefined,
        motoristaAvatar: undefined,
        motoristaVeiculo: undefined,
        motoristaPlaca: undefined,
        motoristaNota: undefined
      };
      return updatedSol;
    }
    return item;
  });

  driverPlanState = {
    ...driverPlanState,
    passageirosConfirmados: driverPlanState.passageirosConfirmados.filter(p => p.solicitacaoId !== solicitacaoId),
    paradasGeradas: driverPlanState.paradasGeradas.filter(p => p.passageiroId !== solicitacaoId)
  };
  driverPlanState.vagasOcupadas = driverPlanState.passageirosConfirmados.reduce((acc, p) => acc + p.vagas, 0);

  if (updatedSol) {
    syncSolicitacaoFirestore(updatedSol);
  }

  notifyListeners();
  return true;
}

/**
 * O motorista recusa ou oculta a solicitação
 */
export function motoristaRecusarPassageiro(solicitacaoId: string) {
  solicitacoesState = solicitacoesState.filter(s => s.id !== solicitacaoId);
  notifyListeners();
}

/**
 * Compatibilidade: O passageiro aceita a proposta do motorista
 */
export async function passageiroAceitarMotorista(solicitacaoId: string) {
  return motoristaAceitarPassageiro(solicitacaoId);
}

/**
 * Adiciona uma nova solicitação vinda do fluxo de passageiro
 */
export function adicionarNovaSolicitacao(novaSol: Omit<SolicitacaoViagem, 'id' | 'criadoEm' | 'status'>): SolicitacaoViagem {
  const taxaReservaCalc = novaSol.taxaReserva ?? (Math.round(novaSol.valorTotal * 0.10 * 100) / 100);
  const valorLiquidoCalc = novaSol.valorLiquidoMotorista ?? (Math.round(novaSol.valorTotal * 0.90 * 100) / 100);
  const valorRestanteCalc = novaSol.valorRestanteEmbarque ?? valorLiquidoCalc;

  const solicitacao: SolicitacaoViagem = {
    ...novaSol,
    taxaReserva: taxaReservaCalc,
    valorLiquidoMotorista: valorLiquidoCalc,
    valorRestanteEmbarque: valorRestanteCalc,
    taxaReservaPaga: novaSol.taxaReservaPaga ?? true,
    metodoPagamentoTaxa: novaSol.metodoPagamentoTaxa || 'PIX Instantâneo',
    id: `SOL_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    status: 'aguardando_motorista',
    criadoEm: 'Agora'
  };

  solicitacoesState = [solicitacao, ...solicitacoesState];
  syncSolicitacaoFirestore(solicitacao);
  notifyListeners();
  return solicitacao;
}

/**
 * Remove uma solicitação pelo ID
 */
export function removerSolicitacao(id: string) {
  solicitacoesState = solicitacoesState.filter(s => s.id !== id);
  notifyListeners();
}

/**
 * Limpa todas as solicitações
 */
export function limparTodasSolicitacoes() {
  solicitacoesState = [];
  notifyListeners();
}

/**
 * Restaura chamados de exemplo
 */
export function restaurarChamadosExemplo() {
  solicitacoesState = [...INITIAL_DEFAULT_SOLICITACOES];
  notifyListeners();
}

/**
 * Retorna as ofertas de motoristas com as vagas restantes atualizadas
 */
export function getOfertasComVagasAtualizadas(): OfertaMotorista[] {
  const vagasLivres = Math.max(0, driverPlanState.vagasDesejadas - driverPlanState.vagasOcupadas);

  return [
    {
      id: 'OFR_001',
      motoristaId: driverPlanState.motoristaId,
      motoristaNome: driverPlanState.motorista.nome,
      motoristaAvatar: driverPlanState.motorista.avatar,
      motoristaNota: driverPlanState.motorista.nota,
      veiculoInfo: `${driverPlanState.motorista.veiculo.modelo} (${driverPlanState.motorista.veiculo.placa}) • Ar & Bagageiro`,
      cidadeOrigem: driverPlanState.cidadeOrigem,
      cidadeDestino: driverPlanState.cidadeDestino,
      dataSaida: '2026-07-24',
      horarioSaida: driverPlanState.horarioSaida,
      vagasDisponiveis: vagasLivres,
      vagasTotais: driverPlanState.vagasDesejadas,
      valorPorVaga: 40.00,
      observacoes: 'Embarque porta a porta. Rota otimizada para passageiros confirmados.',
      passageirosConfirmados: driverPlanState.passageirosConfirmados.map(p => ({
        id: p.solicitacaoId,
        nome: p.nome,
        vagas: p.vagas,
        bairroEmbarque: p.enderecoEmbarque
      }))
    }
  ];
}

/**
 * Retorna todas as ofertas de vagas publicadas pelos motoristas
 */
export function getOfertasVagas(): OfertaVaga[] {
  return [...ofertasVagasState];
}

/**
 * Retorna uma oferta de vaga pelo ID
 */
export function getOfertaVagaById(id: string): OfertaVaga | undefined {
  return ofertasVagasState.find(v => v.id === id);
}

/**
 * O motorista publica uma oferta de vagas no seu carro
 * Pode ser 1 vaga (motorista viajando) ou até 4 vagas (linha regular completa),
 * especificando se é de manhã, tarde ou noite.
 */
export function publicarOfertaVaga(
  dados: Omit<OfertaVaga, 'id' | 'criadoEm' | 'status' | 'vagasDisponiveis'> & { vagasDisponiveis?: number }
): OfertaVaga {
  const novaVaga: OfertaVaga = {
    ...dados,
    vagasDisponiveis: dados.vagasDisponiveis !== undefined ? dados.vagasDisponiveis : dados.vagasTotais,
    id: `OFR_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    status: 'ativa',
    criadoEm: 'Agora'
  };

  ofertasVagasState = [novaVaga, ...ofertasVagasState];
  syncOfertaVagaFirestore(novaVaga);
  notifyListeners();
  return novaVaga;
}

/**
 * Remove uma oferta de vaga
 */
export function removerOfertaVaga(id: string) {
  ofertasVagasState = ofertasVagasState.filter(v => v.id !== id);
  try {
    deleteDoc(doc(db, 'ofertas_vagas', id)).catch(err => console.warn(err));
  } catch (e) {
    console.warn(e);
  }
  notifyListeners();
}

/**
 * Busca vagas de motoristas disponíveis para o trajeto e turno desejados.
 * Compara origem, destino e turno ('manha' | 'tarde' | 'noite') e verifica se há vagas livres.
 */
export function buscarVagasMotoristaDisponiveis(
  origem: string,
  destino: string,
  turno?: TurnoViagem,
  vagasNecessarias: number = 1
): OfertaVaga[] {
  const norm = (str: string) => (str || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  const oNorm = norm(origem);
  const dNorm = norm(destino);

  return ofertasVagasState.filter(vaga => {
    if (vaga.status !== 'ativa') return false;
    if (vaga.vagasDisponiveis < vagasNecessarias) return false;

    const vagaOrigem = norm(vaga.cidadeOrigem);
    const vagaDestino = norm(vaga.cidadeDestino);

    // Comparação inteligente de cidades e corredores da Grande Vitória
    const origemCompativel = 
      !oNorm || 
      oNorm === 'todas' || 
      vagaOrigem === 'todas' || 
      vagaOrigem.includes(oNorm) || 
      oNorm.includes(vagaOrigem);

    const grandeVitoria = ['vitoria', 'serra', 'vila velha', 'cariacica', 'grande vitoria'];
    const destInGV = grandeVitoria.some(g => dNorm.includes(g));
    const vagaInGV = grandeVitoria.some(g => vagaDestino.includes(g));

    const destinoCompativel = 
      !dNorm || 
      dNorm === 'todas' || 
      vagaDestino === 'todas' || 
      vagaDestino.includes(dNorm) || 
      dNorm.includes(vagaDestino) ||
      (destInGV && vagaInGV);

    if (!origemCompativel || !destinoCompativel) return false;

    // Se informou turno, filtra pelo turno
    if (turno && vaga.turno !== turno) return false;

    return true;
  });
}

/**
 * Passageiro reserva uma vaga diretamente da oferta do motorista.
 * Reduz as vagas disponíveis do motorista e cria a solicitação confirmada diretamente para contato WhatsApp!
 */
export async function reservarVagaMotorista(
  ofertaId: string,
  dadosPassageiro: {
    id: string;
    nome: string;
    telefone: string;
    avatar?: string;
    enderecoEmbarque: string;
    enderecoDesembarque: string;
    vagas: number;
    malas?: number;
    valorTotal?: number;
    distanciaKm?: number;
  }
): Promise<{ solicitacao: SolicitacaoViagem; oferta: OfertaVaga } | null> {
  const vaga = ofertasVagasState.find(v => v.id === ofertaId);
  if (!vaga || vaga.vagasDisponiveis < dadosPassageiro.vagas) return null;

  const novasVagasDisponiveis = vaga.vagasDisponiveis - dadosPassageiro.vagas;
  const novoStatus = novasVagasDisponiveis <= 0 ? 'lotada' : 'ativa';

  const reservaPassageiro = {
    solicitacaoId: `SOL_VAGA_${Date.now()}`,
    passageiroId: dadosPassageiro.id,
    passageiroNome: dadosPassageiro.nome,
    passageiroTelefone: dadosPassageiro.telefone,
    vagas: dadosPassageiro.vagas,
    horarioConfirmado: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  const passageirosAtualizados = [...(vaga.passageirosReservados || []), reservaPassageiro];

  const vagaAtualizada: OfertaVaga = {
    ...vaga,
    vagasDisponiveis: novasVagasDisponiveis,
    status: novoStatus,
    passageirosReservados: passageirosAtualizados
  };

  ofertasVagasState = ofertasVagasState.map(v => v.id === ofertaId ? vagaAtualizada : v);
  syncOfertaVagaFirestore(vagaAtualizada);

  const valorTotal = dadosPassageiro.valorTotal || (vaga.valorPorVaga * dadosPassageiro.vagas);
  const taxaReserva = Math.round(valorTotal * 0.10 * 100) / 100;
  const valorLiquido = Math.round(valorTotal * 0.90 * 100) / 100;

  // Cria a solicitação de viagem com status 'confirmada', liberando o WhatsApp imediatamente!
  const novaSol: SolicitacaoViagem = {
    id: reservaPassageiro.solicitacaoId,
    passageiroId: dadosPassageiro.id,
    passageiroNome: dadosPassageiro.nome,
    passageiroTelefone: dadosPassageiro.telefone,
    passageiroAvatar: dadosPassageiro.avatar,
    cidadeOrigem: vaga.cidadeOrigem,
    cidadeDestino: vaga.cidadeDestino,
    enderecoEmbarque: dadosPassageiro.enderecoEmbarque,
    enderecoDesembarque: dadosPassageiro.enderecoDesembarque,
    qtdPassageiros: dadosPassageiro.vagas,
    qtdMalas: dadosPassageiro.malas || 1,
    modalidade: 'compartilhada',
    distanciaKm: dadosPassageiro.distanciaKm || calcularDistanciaEntreLocais(vaga.cidadeOrigem, vaga.cidadeDestino).distanciaKm || 120,
    valorTotal,
    taxaReserva,
    valorLiquidoMotorista: valorLiquido,
    valorRestanteEmbarque: valorTotal,
    taxaReservaPaga: true,
    metodoPagamentoTaxa: 'PIX Instantâneo',
    horarioDesejado: vaga.turno === 'manha' ? '08:00' : vaga.turno === 'tarde' ? '14:00' : '19:00',
    turno: vaga.turno,
    status: 'confirmada', // Confirmada! Vai direto para o WhatsApp
    motoristaId: vaga.motoristaId,
    motoristaNome: vaga.motoristaNome,
    motoristaTelefone: vaga.motoristaTelefone,
    motoristaAvatar: vaga.motoristaAvatar,
    motoristaVeiculo: vaga.veiculoModelo,
    motoristaPlaca: vaga.veiculoPlaca,
    motoristaNota: vaga.motoristaNota,
    vagasRestantesNoCarro: novasVagasDisponiveis,
    criadoEm: 'Agora'
  };

  solicitacoesState = [novaSol, ...solicitacoesState];
  syncSolicitacaoFirestore(novaSol);

  notifyListeners();
  return { solicitacao: novaSol, oferta: vagaAtualizada };
}
