import React, { useState, useEffect } from 'react';
import { 
  Car, 
  PlusCircle, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  DollarSign, 
  CheckCircle2, 
  Shield, 
  ArrowRight,
  Navigation2,
  Phone,
  MessageSquare,
  MessageCircle,
  Sparkles,
  Award,
  Search,
  Check,
  Luggage,
  BellRing,
  Send,
  AlertCircle,
  TrendingUp,
  SlidersHorizontal,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  X,
  RotateCcw,
  Copy,
  Trash2,
  Loader2,
  FileCheck2,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { OFERTAS_MOTORISTAS_MOCK, MOTORISTA_JOSE, VIAGEM_EXEMPLO_MOCK, CIDADES_MOCK } from '../../data/mockData';
import { OfertaMotorista, SolicitacaoViagem, Parada, OfertaVaga, TurnoViagem } from '../../types';
import { MapCanvas } from '../common/MapCanvas';
import { ChatModal } from '../common/ChatModal';
import { WhatsAppButton } from '../common/WhatsAppButton';
import { MotoristaDocumentosTab } from './MotoristaDocumentosTab';
import { MotoristaReservasTab } from './MotoristaReservasTab';
import { calcularDistanciaEntreLocais } from '../../services/routeCalculator';
import { getMotoristaDocs, subscribeToDocuments } from '../../services/documentService';
import { 
  getSolicitacoes, 
  getDriverPlan, 
  setDriverSearchPlan, 
  motoristaAceitarPassageiro, 
  motoristaChegouAoEmbarque,
  motoristaIniciarViagem,
  motoristaConcluirViagem,
  motoristaRecusarPassageiro,
  motoristaDesfazerAceite,
  passageiroAceitarMotorista,
  passageiroConfirmarCorrida,
  subscribeToTripStore,
  adicionarNovaSolicitacao,
  removerSolicitacao,
  limparTodasSolicitacoes,
  restaurarChamadosExemplo,
  DriverTripPlan,
  getOfertasVagas,
  publicarOfertaVaga,
  removerOfertaVaga
} from '../../services/tripStore';

interface MotoristaDashboardProps {
  onNavigateToPassenger?: () => void;
}

export const MotoristaDashboard: React.FC<MotoristaDashboardProps> = ({ onNavigateToPassenger }) => {
  const [activeTab, setActiveTab] = useState<'buscar_chamados' | 'viagem_ativa' | 'documentos' | 'publicar' | 'ganhos'>('buscar_chamados');
  const [driverPlan, setDriverPlan] = useState<DriverTripPlan>(getDriverPlan());
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoViagem[]>(getSolicitacoes());
  const [motoristaDocs, setMotoristaDocs] = useState(getMotoristaDocs());

  useEffect(() => {
    const unsub = subscribeToDocuments(() => {
      setMotoristaDocs(getMotoristaDocs());
    });
    return () => unsub();
  }, []);
  
  // Feedback toast local do motorista
  const [alertaSucesso, setAlertaSucesso] = useState<string | null>(null);
  const [telefoneCopiado, setTelefoneCopiado] = useState<string | null>(null);

  // Chat state
  const [chatPassenger, setChatPassenger] = useState<{ nome: string; telefone: string } | null>(null);

  // Filtros e Busca do motorista estritamente por: Origem, Destino, Vagas, Malas e Horário (Manhã / Tarde / Noite)
  const [origemFiltro, setOrigemFiltro] = useState<string>('Todas');
  const [destinoFiltro, setDestinoFiltro] = useState<string>('Todas');
  const [vagasDesejadasFiltro, setVagasDesejadasFiltro] = useState<number>(driverPlan.vagasDesejadas || 4);
  const [filtroMalas, setFiltroMalas] = useState<'1' | '2' | '3+'>('2');
  const [turnoHorario, setTurnoHorario] = useState<'todos' | 'manha' | 'tarde' | 'noite'>('todos');
  const [ofertarAoBuscar, setOfertarAoBuscar] = useState<boolean>(false);
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'aguardando_motorista' | 'proposta_aceita_motorista' | 'confirmada'>('todos');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  // Visão da lista: 'disponiveis' para aceitar ou 'aceitos' (a lista dele)
  const [muralView, setMuralView] = useState<'disponiveis' | 'aceitos'>('disponiveis');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Vagas cadastradas no sistema
  const [ofertasVagas, setOfertasVagas] = useState<OfertaVaga[]>(getOfertasVagas());

  // Form para publicar vagas (Linha Completa vs. Viagem Avulsa com vaga sobrando)
  const [tipoLinhaPub, setTipoLinhaPub] = useState<'linha_completa' | 'viagem_avulsa'>('linha_completa');
  const [cidadeOrigemPub, setCidadeOrigemPub] = useState('Água Doce do Norte');
  const [cidadeDestinoPub, setCidadeDestinoPub] = useState('Vitória');
  const [turnoPub, setTurnoPub] = useState<TurnoViagem>('manha');
  const [dataPub, setDataPub] = useState('Hoje');
  const [horarioSaidaPub, setHorarioSaidaPub] = useState('07:30');
  const [vagasPub, setVagasPub] = useState(4);
  const [valorPorVagaPub, setValorPorVagaPub] = useState('40.00');
  const [observacoesPub, setObservacoesPub] = useState('Passo no Hospital Santa Rita e Shopping Vitória.');

  // Sincroniza com o tripStore em tempo real
  useEffect(() => {
    const syncData = () => {
      const plan = getDriverPlan();
      setDriverPlan(plan);
      setSolicitacoes([...getSolicitacoes()]);
      setOfertasVagas([...getOfertasVagas()]);
    };

    syncData();
    const unsubscribe = subscribeToTripStore(syncData);

    const handleCustomEvent = () => syncData();
    window.addEventListener('portaaporta_state_changed', handleCustomEvent);

    return () => {
      unsubscribe();
      window.removeEventListener('portaaporta_state_changed', handleCustomEvent);
    };
  }, []);

  const getHorarioPadraoTurno = (turno: 'manha' | 'tarde' | 'noite') => {
    if (turno === 'manha') return '08:00';
    if (turno === 'tarde') return '14:00';
    return '19:00';
  };

  const handleLancarCorrida = (customOrigem?: string, customDestino?: string) => {
    const origem = customOrigem || (origemFiltro === 'Todas' ? 'Água Doce do Norte' : origemFiltro);
    const destino = customDestino || (destinoFiltro === 'Todas' ? 'Vitória' : destinoFiltro);
    const horario = getHorarioPadraoTurno(turnoHorario);

    // Verifica se já existe oferta idêntica ativa do motorista
    const jaExiste = ofertasVagas.find(
      o => o.motoristaId === MOTORISTA_JOSE.id && 
           o.status === 'ativa' && 
           o.cidadeOrigem.toLowerCase() === origem.toLowerCase() &&
           o.cidadeDestino.toLowerCase() === destino.toLowerCase() &&
           o.turno === turnoHorario
    );

    if (jaExiste) {
      setAlertaSucesso(`ℹ️ Você já possui esta corrida ativa de ${origem} ➔ ${destino} no turno da ${turnoHorario === 'manha' ? 'Manhã' : turnoHorario === 'tarde' ? 'Tarde' : 'Noite'}. Suas vagas continuam ofertadas.`);
      setTimeout(() => setAlertaSucesso(null), 5000);
      return;
    }

    publicarOfertaVaga({
      motoristaId: MOTORISTA_JOSE.id,
      motoristaNome: MOTORISTA_JOSE.nome,
      motoristaTelefone: MOTORISTA_JOSE.telefone,
      motoristaAvatar: MOTORISTA_JOSE.avatar,
      motoristaNota: MOTORISTA_JOSE.nota,
      veiculoModelo: MOTORISTA_JOSE.veiculo.modelo,
      veiculoPlaca: MOTORISTA_JOSE.veiculo.placa,
      cidadeOrigem: origem,
      cidadeDestino: destino,
      turno: turnoHorario,
      data: 'Hoje',
      dataViagem: 'Hoje',
      horarioEstimado: horario,
      vagasTotais: vagasDesejadasFiltro,
      vagasDisponiveis: vagasDesejadasFiltro,
      valorPorVaga: 40.00,
      observacoes: `Corrida lançada por ${MOTORISTA_JOSE.nome}. Saída de ${origem} para ${destino} (${turnoHorario === 'manha' ? 'Manhã' : turnoHorario === 'tarde' ? 'Tarde' : 'Noite'}). Capacidade para até ${vagasDesejadasFiltro} passageiros e ${filtroMalas === '3+' ? '3+ malas' : `${filtroMalas} mala(s)`}. Embarque porta a porta.`,
      tipoLinha: vagasDesejadasFiltro >= 4 ? 'linha_completa' : 'viagem_avulsa'
    });

    setOfertasVagas(getOfertasVagas());
    setDriverSearchPlan(origem, destino, horario, vagasDesejadasFiltro);

    setAlertaSucesso(`🚀 Corrida Lançada com Sucesso! Sua saída de ${origem} para ${destino} (${turnoHorario === 'manha' ? 'Manhã' : turnoHorario === 'tarde' ? 'Tarde' : 'Noite'}) com ${vagasDesejadasFiltro} vagas já está ofertada no sistema para os passageiros reservarem.`);
    setTimeout(() => setAlertaSucesso(null), 6000);
  };

  const handleExecutarBusca = () => {
    setIsSearching(true);
    const horarioEstimado = getHorarioPadraoTurno(turnoHorario);
    const origemTxt = origemFiltro === 'Todas' ? 'Água Doce do Norte' : origemFiltro;
    const destinoTxt = destinoFiltro === 'Todas' ? 'Vitória' : destinoFiltro;
    setDriverSearchPlan(origemFiltro, destinoFiltro, horarioEstimado, vagasDesejadasFiltro);

    if (ofertarAoBuscar) {
      handleLancarCorrida(origemTxt, destinoTxt);
    }

    setTimeout(() => {
      setIsSearching(false);
      const turnoTxt = turnoHorario === 'manha' ? 'Manhã (06h às 12h)' : turnoHorario === 'tarde' ? 'Tarde (12h às 18h)' : 'Noite (18h às 23h)';
      const malasTxt = filtroMalas === '3+' ? '3+ malas' : `${filtroMalas} mala(s)`;
      const msg = `🔍 Busca realizada: ${origemFiltro === 'Todas' ? 'Qualquer Origem' : origemFiltro} ➔ ${destinoFiltro === 'Todas' ? 'Qualquer Destino' : destinoFiltro} | ${vagasDesejadasFiltro} vagas | ${malasTxt} | ${turnoTxt}`;
      setAlertaSucesso(msg);
      setTimeout(() => setAlertaSucesso(null), 5000);
    }, 300);
  };

  const handleAceitarPassageiro = async (sol: SolicitacaoViagem) => {
    // 1. Se for tentar aceitar passageiro compartilhado mas já tiver viagem exclusiva ativa
    if (sol.modalidade !== 'exclusiva') {
      const exclusivaAtiva = passageirosReservados.find(p => p.modalidade === 'exclusiva');
      if (exclusivaAtiva) {
        setAlertaSucesso(`⚠️ Não é possível adicionar passageiro compartilhado: seu veículo está em viagem exclusiva com ${exclusivaAtiva.nome} (Carro Fechado).`);
        setTimeout(() => setAlertaSucesso(null), 5000);
        return;
      }
    }

    // 2. Se for viagem exclusiva e já houver outra exclusiva ativa
    const exclusivaAtiva = passageirosReservados.find(p => p.modalidade === 'exclusiva');
    if (sol.modalidade === 'exclusiva' && exclusivaAtiva && exclusivaAtiva.solicitacaoId !== sol.id) {
      const confirmTroca = window.confirm(
        `Você já possui uma viagem exclusiva ativa com ${exclusivaAtiva.nome}.\n\nDeseja substituir pela viagem exclusiva de ${sol.passageiroNome}?`
      );
      if (!confirmTroca) return;
      motoristaDesfazerAceite(exclusivaAtiva.solicitacaoId);
    } else if (sol.modalidade === 'exclusiva' && passageirosReservados.length > 0) {
      // Se tem passageiros compartilhados no carro e o motorista aceitou a exclusiva
      const passageirosNomes = passageirosReservados.map(p => p.nome).join(', ');
      const confirmExclusiva = window.confirm(
        `A viagem de ${sol.passageiroNome} é EXCLUSIVA (Carro Fechado por R$ ${sol.valorTotal.toFixed(2).replace('.', ',')}).\n\nAo aceitar, o veículo ficará 100% reservado para ${sol.passageiroNome} e os passageiros compartilhados (${passageirosNomes}) serão liberados para outros motoristas.\n\nDeseja confirmar e aceitar esta Viagem Exclusiva?`
      );
      if (!confirmExclusiva) return;
      passageirosReservados.forEach(p => {
        motoristaDesfazerAceite(p.solicitacaoId);
      });
    }

    const horarioSaida = sol.horarioDesejado || '08:00';
    await motoristaAceitarPassageiro(sol.id, horarioSaida, MOTORISTA_JOSE);
    await passageiroConfirmarCorrida(sol.id);

    if (sol.modalidade === 'exclusiva') {
      setAlertaSucesso(`⭐ Viagem Exclusiva de ${sol.passageiroNome} aceita com sucesso! Carro 100% fechado por R$ ${sol.valorTotal.toFixed(2).replace('.', ',')}.`);
    } else {
      setAlertaSucesso(`🚗 Passageiro ${sol.passageiroNome} aceito com sucesso! Adicionado a "Passageiros Reservados".`);
    }
    setTimeout(() => setAlertaSucesso(null), 6000);
  };

  const handleDesfazerAceite = (solId: string, passageiroNome: string) => {
    motoristaDesfazerAceite(solId);
    setAlertaSucesso(`Passageiro ${passageiroNome} liberado da reserva e retornado para disponíveis.`);
    setTimeout(() => setAlertaSucesso(null), 5000);
  };

  const handleSimularReservaCelso = async () => {
    const celsoExistente = solicitacoes.find(s => s.passageiroNome.toLowerCase().includes('celso'));
    if (celsoExistente) {
      await motoristaAceitarPassageiro(celsoExistente.id, celsoExistente.horarioDesejado || '08:00', MOTORISTA_JOSE);
      await passageiroConfirmarCorrida(celsoExistente.id);
    } else {
      const novaSol = adicionarNovaSolicitacao({
        passageiroId: 'USR_CELSO',
        passageiroNome: 'Celso',
        passageiroTelefone: '(27) 99876-5432',
        passageiroAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
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
        motoristaId: MOTORISTA_JOSE.id,
        motoristaNome: MOTORISTA_JOSE.nome,
        motoristaTelefone: MOTORISTA_JOSE.telefone
      });
      await motoristaAceitarPassageiro(novaSol.id, '08:00', MOTORISTA_JOSE);
      await passageiroConfirmarCorrida(novaSol.id);
    }
    setAlertaSucesso('✅ Reserva de Celso (Vitória da Conquista) adicionada em Passageiros Reservados!');
    setTimeout(() => setAlertaSucesso(null), 5000);
  };

  const handleMotoristaChegou = async (solId: string, passageiroNome: string) => {
    await motoristaChegouAoEmbarque(solId);
    setAlertaSucesso(`🔔 Aviso enviado para ${passageiroNome}: Você chegou ao endereço de embarque!`);
    setTimeout(() => setAlertaSucesso(null), 5000);
  };

  const handleIniciarViagemPassageiro = (solId: string, passageiroNome: string) => {
    motoristaIniciarViagem(solId);
    setAlertaSucesso(`🚀 Viagem iniciada com ${passageiroNome} a bordo! Trajeto intermunicipal em andamento.`);
    setTimeout(() => setAlertaSucesso(null), 5000);
  };

  const handleConcluirViagemPassageiro = (solId: string, passageiroNome: string) => {
    motoristaConcluirViagem(solId);
    setAlertaSucesso(`🏁 Viagem de ${passageiroNome} concluída com sucesso no destino!`);
    setTimeout(() => setAlertaSucesso(null), 5000);
  };

  const handleRecusarPassageiro = (sol: SolicitacaoViagem) => {
    motoristaRecusarPassageiro(sol.id);
    setAlertaSucesso(`🚫 Solicitação de ${sol.passageiroNome} foi recusada e removida.`);
    setTimeout(() => setAlertaSucesso(null), 4000);
  };

  const handleCopiarTelefone = (tel: string) => {
    navigator.clipboard.writeText(tel);
    setTelefoneCopiado(tel);
    setTimeout(() => setTelefoneCopiado(null), 3000);
  };

  // Vagas livres calculadas exatamente com base na capacidade escolhida pelo motorista
  const vagasLivres = Math.max(0, vagasDesejadasFiltro - driverPlan.vagasOcupadas);

  const handleCriarChamadoSimulado = (
    nome: string = 'Celso',
    telefone: string = '(27) 99876-5432',
    origem: string = origemFiltro === 'Todas' ? 'Água Doce do Norte' : origemFiltro,
    destino: string = destinoFiltro === 'Todas' ? 'Vitória da Conquista' : destinoFiltro,
    valorTotal: number = 50.00,
    modalidade: 'compartilhada' | 'exclusiva' = 'compartilhada'
  ) => {
    const taxa = Math.round(valorTotal * 0.10 * 100) / 100;
    const liquido = Math.round(valorTotal * 0.90 * 100) / 100;
    const horarioDesejado = '08:00';
    const qtdMalasSim = filtroMalas === '1' ? 1 : filtroMalas === '2' ? 2 : 3;
    const distReal = calcularDistanciaEntreLocais(origem, destino).distanciaKm || 120;

    const sol = adicionarNovaSolicitacao({
      passageiroId: 'USR_' + Date.now(),
      passageiroNome: nome,
      passageiroTelefone: telefone,
      passageiroAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      cidadeOrigem: origem,
      cidadeDestino: destino,
      enderecoEmbarque: `Rua São José, nº 142 - Centro, ${origem} (Em frente à praça central)`,
      enderecoDesembarque: `Av. Juracy Magalhães, 1200 - Centro, ${destino}`,
      qtdPassageiros: 1,
      qtdMalas: qtdMalasSim,
      modalidade: modalidade,
      distanciaKm: distReal,
      valorTotal: valorTotal,
      taxaReserva: taxa,
      valorLiquidoMotorista: liquido,
      valorRestanteEmbarque: liquido,
      taxaReservaPaga: true,
      metodoPagamentoTaxa: 'PIX Instantâneo',
      horarioDesejado: horarioDesejado
    });
    setAlertaSucesso(`✅ Passageiro ${sol.passageiroNome} adicionado à lista (${modalidade === 'exclusiva' ? '⭐ Exclusiva' : '👥 Compartilhada'}): ${sol.cidadeOrigem} ➔ ${sol.cidadeDestino} (R$ ${valorTotal.toFixed(2)})`);
    setTimeout(() => setAlertaSucesso(null), 6000);
  };

  const handleLimparChamados = () => {
    limparTodasSolicitacoes();
    setAlertaSucesso('🧹 Todas as solicitações de viagem foram limpas.');
    setTimeout(() => setAlertaSucesso(null), 4000);
  };

  const handleRestaurarPadrao = () => {
    restaurarChamadosExemplo();
    setAlertaSucesso('🔄 Solicitações restauradas com sucesso.');
    setTimeout(() => setAlertaSucesso(null), 4000);
  };

  // 1. Passageiros Reservados / Aceitos (a lista dele)
  const listaReservadosMap = new Map<string, {
    id: string;
    solicitacaoId: string;
    nome: string;
    telefone: string;
    origem: string;
    destino: string;
    horario: string;
    vagas: number;
    malas: number;
    valor: number;
    enderecoEmbarque: string;
    status: string;
    modalidade?: 'compartilhada' | 'exclusiva';
  }>();

  solicitacoes.forEach(s => {
    const isConfirmadaOuComMotorista = 
      s.motoristaId === MOTORISTA_JOSE.id ||
      s.status === 'confirmada' ||
      s.status === 'proposta_aceita_motorista' ||
      s.status === 'motorista_a_caminho' ||
      s.status === 'motorista_chegou' ||
      s.status === 'em_viagem';
    
    if (isConfirmadaOuComMotorista && s.status !== 'cancelada' && s.status !== 'recusada') {
      listaReservadosMap.set(s.id, {
        id: s.id,
        solicitacaoId: s.id,
        nome: s.passageiroNome,
        telefone: s.passageiroTelefone || '(27) 99876-5432',
        origem: s.cidadeOrigem,
        destino: s.cidadeDestino,
        horario: s.horarioDesejado || '08:00',
        vagas: s.qtdPassageiros || 1,
        malas: s.qtdMalas || 1,
        valor: s.valorTotal || 50.00,
        enderecoEmbarque: s.enderecoEmbarque,
        status: s.status,
        modalidade: s.modalidade || 'compartilhada'
      });
    }
  });

  driverPlan.passageirosConfirmados.forEach(p => {
    if (!listaReservadosMap.has(p.solicitacaoId)) {
      const sol = solicitacoes.find(s => s.id === p.solicitacaoId);
      listaReservadosMap.set(p.solicitacaoId, {
        id: p.solicitacaoId,
        solicitacaoId: p.solicitacaoId,
        nome: p.nome,
        telefone: sol?.passageiroTelefone || '(27) 99876-5432',
        origem: sol?.cidadeOrigem || 'Água Doce do Norte',
        destino: sol?.cidadeDestino || 'Vitória da Conquista',
        horario: sol?.horarioDesejado || '08:00',
        vagas: p.vagas || 1,
        malas: sol?.qtdMalas || 1,
        valor: sol?.valorTotal || 50.00,
        enderecoEmbarque: p.enderecoEmbarque,
        status: p.status || 'confirmada',
        modalidade: sol?.modalidade || 'compartilhada'
      });
    }
  });

  const passageirosReservados = Array.from(listaReservadosMap.values());

  // 2. Passageiros Disponíveis na Rota (Lista Tipo E-mail)
  const passageirosDisponiveis = solicitacoes.filter(s => {
    if (s.status !== 'aguardando_motorista') return false;
    if (listaReservadosMap.has(s.id)) return false;

    // Filtro por Origem
    if (origemFiltro !== 'Todas') {
      const matchOrigem = s.cidadeOrigem.toLowerCase().includes(origemFiltro.toLowerCase()) || 
                          origemFiltro.toLowerCase().includes(s.cidadeOrigem.toLowerCase());
      if (!matchOrigem) return false;
    }

    // Filtro por Destino
    if (destinoFiltro !== 'Todas') {
      const matchDestino = s.cidadeDestino.toLowerCase().includes(destinoFiltro.toLowerCase()) || 
                           destinoFiltro.toLowerCase().includes(s.cidadeDestino.toLowerCase());
      if (!matchDestino) return false;
    }

    // Filtro Turno
    if (turnoHorario !== 'todos') {
      const horaStr = s.horarioDesejado || '08:00';
      const horaNum = parseInt(horaStr.split(':')[0], 10) || 8;
      if (turnoHorario === 'manha') {
        if (horaNum < 5 || horaNum >= 12) return false;
      } else if (turnoHorario === 'tarde') {
        if (horaNum < 12 || horaNum >= 18) return false;
      } else if (turnoHorario === 'noite') {
        if (horaNum < 18 && horaNum >= 5) return false;
      }
    }

    return true;
  });

  // Rota consultada para verificar se o motorista já tem uma oferta ativa dessa ida
  const rotaOrigemConsulta = origemFiltro === 'Todas' ? 'Água Doce do Norte' : origemFiltro;
  const rotaDestinoConsulta = destinoFiltro === 'Todas' ? 'Vitória' : destinoFiltro;

  const ofertaAtiva = ofertasVagas.find(
    v => v.motoristaId === MOTORISTA_JOSE.id && 
         v.status === 'ativa' &&
         v.cidadeOrigem.toLowerCase() === rotaOrigemConsulta.toLowerCase() &&
         v.cidadeDestino.toLowerCase() === rotaDestinoConsulta.toLowerCase() &&
         v.turno === turnoHorario
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 md:p-6">
      {/* Alerta de Sucesso Flutuante */}
      {alertaSucesso && (
        <div className="bg-emerald-50 border-2 border-emerald-500 text-emerald-950 p-4 rounded-2xl flex items-center justify-between shadow-lg animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold shrink-0">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-emerald-950 text-sm block">Atualização em Tempo Real</span>
              <p className="text-xs text-emerald-800">{alertaSucesso}</p>
            </div>
          </div>
          <button 
            onClick={() => setAlertaSucesso(null)}
            className="text-emerald-700 hover:text-emerald-950 text-xs font-bold px-2 py-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Motorista */}
      <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={MOTORISTA_JOSE.avatar}
            alt={MOTORISTA_JOSE.nome}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-sm"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">{MOTORISTA_JOSE.nome}</h1>
              <span className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                Motorista Ouro • {MOTORISTA_JOSE.nota} ⭐
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Veículo: <strong className="text-white">{MOTORISTA_JOSE.veiculo.modelo}</strong> ({MOTORISTA_JOSE.veiculo.placa}) • {MOTORISTA_JOSE.veiculo.cor}
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-700 w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab('buscar_chamados')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'buscar_chamados'
                ? 'bg-emerald-500 text-slate-950 shadow-xs font-black'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Reservas & Buscar</span>
            {passageirosReservados.length > 0 && (
              <span className="ml-1 bg-emerald-400 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {passageirosReservados.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('viagem_ativa')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'viagem_ativa'
                ? 'bg-emerald-500 text-slate-950 shadow-xs font-black'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Navigation2 className="w-3.5 h-3.5" />
            <span>Rota & Embarques ({driverPlan.passageirosConfirmados.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('documentos')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'documentos'
                ? 'bg-emerald-500 text-slate-950 shadow-xs font-black'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Documentos & Veículo</span>
            <span className={`w-2 h-2 rounded-full ${motoristaDocs.statusGeral === 'aprovado' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
          </button>

          <button
            onClick={() => setActiveTab('publicar')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'publicar'
                ? 'bg-emerald-500 text-slate-950 shadow-xs font-black'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Lançar Corrida</span>
            {ofertasVagas.filter(v => v.motoristaId === MOTORISTA_JOSE.id && v.status === 'ativa').length > 0 && (
              <span className="ml-1 bg-emerald-400 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {ofertasVagas.filter(v => v.motoristaId === MOTORISTA_JOSE.id && v.status === 'ativa').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('ganhos')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'ganhos'
                ? 'bg-emerald-500 text-slate-950 shadow-xs font-black'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Ganhos</span>
          </button>
        </div>
      </div>

      {/* ABA 1: PASSAGEIROS RESERVADOS & PESQUISAR PASSAGEIROS */}
      {activeTab === 'buscar_chamados' && (
        <MotoristaReservasTab
          passageirosReservados={passageirosReservados}
          vagasDesejadasFiltro={vagasDesejadasFiltro}
          origemFiltro={origemFiltro}
          setOrigemFiltro={setOrigemFiltro}
          destinoFiltro={destinoFiltro}
          setDestinoFiltro={setDestinoFiltro}
          turnoHorario={turnoHorario}
          setTurnoHorario={setTurnoHorario}
          isSearching={isSearching}
          onSearch={handleExecutarBusca}
          passageirosDisponiveis={passageirosDisponiveis}
          onAceitarPassageiro={handleAceitarPassageiro}
          onDesfazerAceite={handleDesfazerAceite}
          onSimularCelso={handleSimularReservaCelso}
          onSimularPassageiro={handleCriarChamadoSimulado}
        />
      )}

      {/* Conteúdo Aba 2: Rota Ativa & Embarques Gerados (Simplificado e Focado no WhatsApp) */}
      {activeTab === 'viagem_ativa' && (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Cabeçalho da Viagem Ativa */}
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-5 sm:p-6 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-black text-emerald-400 uppercase tracking-wider block">
                  Viagem em Andamento • Conexão Direta Via WhatsApp
                </span>
                <h2 className="text-xl font-black text-white">
                  {driverPlan.cidadeOrigem} ➔ {driverPlan.cidadeDestino}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-500/20 text-emerald-300 font-bold text-xs px-3 py-1.5 rounded-xl border border-emerald-500/40">
                  {driverPlan.passageirosConfirmados.length} Passageiro(s) Confirmado(s)
                </span>
                <span className="bg-slate-700/80 text-slate-200 font-bold text-xs px-3 py-1.5 rounded-xl border border-slate-600">
                  {vagasLivres} vaga(s) livres
                </span>
              </div>
            </div>

            {/* Banner Explicativo do Fluxo Direto via WhatsApp */}
            <div className="p-4 bg-slate-700/60 border border-slate-600 rounded-2xl flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0 shadow-xs">
                <MessageCircle className="w-5 h-5 fill-slate-950" />
              </div>
              <div className="text-xs">
                <span className="font-extrabold text-white block mb-0.5">
                  Coordenação Porta a Porta via WhatsApp
                </span>
                <p className="text-slate-300 leading-relaxed">
                  Para simplificar e evitar complexidade de mapas, clique no botão do WhatsApp de cada passageiro abaixo para pedir a localização em tempo real e combinar o ponto exato de embarque.
                </p>
              </div>
            </div>
          </div>

          {/* Lista de Passageiros da Viagem */}
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-5 sm:p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <h3 className="font-bold text-white text-base">Passageiros & Pontos de Embarque</h3>
                <span className="text-xs text-slate-400">Contate cada passageiro para receber a localização exata</span>
              </div>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-full font-bold">
                {driverPlan.passageirosConfirmados.length > 0 ? `${driverPlan.passageirosConfirmados.length} Confirmado(s)` : 'Sem passageiros'}
              </span>
            </div>

            {driverPlan.passageirosConfirmados.length > 0 ? (
              <div className="space-y-4">
                {driverPlan.passageirosConfirmados.map((pass) => {
                  const solVinculada = solicitacoes.find(s => s.id === pass.solicitacaoId || s.passageiroNome === pass.nome);
                  const telefoneLimpo = (solVinculada?.passageiroTelefone || '(27) 99876-5432').replace(/\D/g, '');

                  return (
                    <div
                      key={pass.solicitacaoId}
                      className="p-4 rounded-2xl bg-slate-700/70 border border-slate-600 space-y-3 shadow-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-600 flex items-center justify-center text-white font-bold text-sm">
                            {pass.nome.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-white text-sm">{pass.nome}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                pass.status === 'embarcou' || pass.status === 'concluido'
                                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              }`}>
                                {pass.status === 'embarcou' ? 'A Bordo' : pass.status === 'concluido' ? 'Concluído' : 'Aguardando Embarque'}
                              </span>
                            </div>
                            <span className="text-xs text-slate-300 block mt-0.5">
                              Telefone: <strong className="text-white">{solVinculada?.passageiroTelefone || '(27) 99876-5432'}</strong>
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-black text-emerald-400 block">
                            R$ {(solVinculada?.valorTotal || 45).toFixed(2).replace('.', ',')}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {solVinculada?.qtdPassageiros || 1} passageiro(s) • {solVinculada?.qtdMalas || 1} mala(s)
                          </span>
                        </div>
                      </div>

                      {/* Endereço de Embarque informado */}
                      <div className="p-3 bg-slate-800/80 rounded-xl text-xs space-y-1 border border-slate-600">
                        <div className="flex items-start gap-2 text-slate-300">
                          <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Endereço de Embarque:</span>
                            <span className="font-semibold text-white">{pass.enderecoEmbarque}</span>
                          </div>
                        </div>
                      </div>

                      {/* Botões de Ação Direta pelo WhatsApp e Status */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-600">
                        {/* Botão Principal: WhatsApp para pedir localização */}
                        <a
                          href={`https://wa.me/55${telefoneLimpo}?text=Ol%C3%A1%20${encodeURIComponent(pass.nome)}!%20Sou%20o%20motorista%20Jos%C3%A9%20do%20Porta%20a%20Porta.%20Estou%20a%20caminho%20do%20seu%20embarque%20em%20${encodeURIComponent(driverPlan.cidadeOrigem)}.%20Por%20favor%2C%20me%20envie%20sua%20localiza%C3%A7%C3%A3o%20em%20tempo%20real%20aqui%20pelo%20WhatsApp%20para%20eu%20te%20buscar!`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 sm:col-span-1"
                        >
                          <MessageCircle className="w-4 h-4 fill-slate-950" />
                          <span>WhatsApp (Pedir Local)</span>
                        </a>

                        {/* Botão Avisar que Chegou no Portão */}
                        <button
                          onClick={() => handleMotoristaChegou(pass.solicitacaoId, pass.nome)}
                          className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95"
                        >
                          <BellRing className="w-4 h-4" />
                          <span>Cheguei no Portão</span>
                        </button>

                        {/* Botão Iniciar Viagem */}
                        <button
                          onClick={() => handleIniciarViagemPassageiro(pass.solicitacaoId, pass.nome)}
                          className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Embarcou • Iniciar</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center space-y-3 bg-slate-700/60 rounded-2xl border border-slate-600">
                <Car className="w-10 h-10 text-slate-400 mx-auto" />
                <h4 className="text-white font-bold text-sm">Nenhum passageiro confirmado no momento</h4>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  Acesse a aba <strong>Mural de Chamados</strong> para aceitar solicitações de passageiros ou publique suas vagas na aba <strong>Publicar Vagas</strong>.
                </p>
                <button
                  onClick={() => setActiveTab('buscar_chamados')}
                  className="py-2.5 px-5 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs transition-all hover:bg-emerald-400 cursor-pointer shadow-xs"
                >
                  Ir para Mural de Chamados
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Chat para o Motorista */}
      {chatPassenger && (
        <ChatModal
          isOpen={!!chatPassenger}
          onClose={() => setChatPassenger(null)}
          userRole="motorista"
          counterpartName={chatPassenger.nome}
          counterpartPhone={chatPassenger.telefone}
          viagemId="VG000123"
          routeInfo={`${driverPlan.cidadeOrigem} ➔ ${driverPlan.cidadeDestino}`}
        />
      )}

      {/* Conteúdo Aba Documentos & Veículo */}
      {activeTab === 'documentos' && (
        <MotoristaDocumentosTab />
      )}

      {/* Conteúdo Aba 3: Publicar Saída Programada / Vagas */}
      {activeTab === 'publicar' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-md space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <h2 className="text-xl font-bold text-white">Lançar Corrida & Ofertar Vagas</h2>
              </div>
              <p className="text-xs text-slate-300">
                Publique sua saída e vagas disponíveis no sistema. Os passageiros que buscarem por esse trajeto e turno encontrarão seu carro para reservar diretamente.
              </p>
            </div>

            {/* Seletor de Tipo de Publicação: Linha Completa vs Vaga Sobrando */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setTipoLinhaPub('linha_completa');
                  setVagasPub(4);
                  setValorPorVagaPub('40.00');
                  setObservacoesPub('Linha regular diária porta a porta. Até 4 passageiros confortáveis com ar-condicionado.');
                }}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                  tipoLinhaPub === 'linha_completa'
                    ? 'bg-emerald-500/20 border-emerald-500 shadow-xs ring-2 ring-emerald-500/20'
                    : 'bg-slate-700/60 border-slate-600 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-400" />
                    Fazer Linha Completa
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-black px-2 py-0.5 rounded-full border border-emerald-500/40">
                    4 Passageiros
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-tight">
                  Ideal para viagens regulares ou vans/veículos com 4 vagas livres aguardando passageiros.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTipoLinhaPub('viagem_avulsa');
                  setVagasPub(1);
                  setValorPorVagaPub('45.00');
                  setObservacoesPub('Estou indo viajar e tenho vaga livre no carro para dividir os custos de combustível.');
                }}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                  tipoLinhaPub === 'viagem_avulsa'
                    ? 'bg-blue-500/20 border-blue-500 shadow-xs ring-2 ring-blue-500/20'
                    : 'bg-slate-700/60 border-slate-600 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-white flex items-center gap-2">
                    <Car className="w-4 h-4 text-blue-400" />
                    Viajando com Vaga Sobrando
                  </span>
                  <span className="text-[10px] bg-blue-500/20 text-blue-300 font-black px-2 py-0.5 rounded-full border border-blue-500/40">
                    1 a 2 Passageiros
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-tight">
                  Ideal para motoristas que já vão viajar e querem levar 1 ou 2 passageiros no trajeto.
                </p>
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const novaVaga = publicarOfertaVaga({
                motoristaId: MOTORISTA_JOSE.id,
                motoristaNome: MOTORISTA_JOSE.nome,
                motoristaTelefone: MOTORISTA_JOSE.telefone,
                motoristaAvatar: MOTORISTA_JOSE.avatar,
                motoristaNota: MOTORISTA_JOSE.nota,
                veiculoModelo: MOTORISTA_JOSE.veiculo.modelo,
                veiculoPlaca: MOTORISTA_JOSE.veiculo.placa,
                cidadeOrigem: cidadeOrigemPub,
                cidadeDestino: cidadeDestinoPub,
                turno: turnoPub,
                data: dataPub,
                dataViagem: dataPub,
                horarioEstimado: horarioSaidaPub,
                vagasTotais: vagasPub,
                vagasDisponiveis: vagasPub,
                valorPorVaga: parseFloat(valorPorVagaPub || '40.00'),
                observacoes: observacoesPub,
                tipoLinha: tipoLinhaPub
              });
              setOfertasVagas(getOfertasVagas());
              setAlertaSucesso(`✅ Vaga publicada com sucesso! ${vagasPub} vaga(s) ofertadas para ${turnoPub === 'manha' ? 'Manhã' : turnoPub === 'tarde' ? 'Tarde' : 'Noite'}. Os passageiros já podem reservar.`);
              setTimeout(() => setAlertaSucesso(null), 5000);
            }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1">Cidade de Saída (Origem)</label>
                  <input
                    type="text"
                    value={cidadeOrigemPub}
                    onChange={(e) => setCidadeOrigemPub(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-700/70 border border-slate-600 rounded-xl text-white text-xs font-semibold focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1">Cidade de Destino</label>
                  <input
                    type="text"
                    value={cidadeDestinoPub}
                    onChange={(e) => setCidadeDestinoPub(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-700/70 border border-slate-600 rounded-xl text-white text-xs font-semibold focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* SELEÇÃO DO TURNO OBRIGATÓRIO (Manhã, Tarde ou Noite) */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                  Turno da Viagem (Obrigatório)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTurnoPub('manha');
                      setHorarioSaidaPub('07:30');
                    }}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                      turnoPub === 'manha'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-slate-700/60 border-slate-600 text-slate-300 hover:text-white'
                    }`}
                  >
                    <span>🌅 Manhã</span>
                    <span className="text-[10px] text-slate-400 font-normal">06h às 12h</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTurnoPub('tarde');
                      setHorarioSaidaPub('13:30');
                    }}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                      turnoPub === 'tarde'
                        ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                        : 'bg-slate-700/60 border-slate-600 text-slate-300 hover:text-white'
                    }`}
                  >
                    <span>☀️ Tarde</span>
                    <span className="text-[10px] text-slate-400 font-normal">12h às 18h</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTurnoPub('noite');
                      setHorarioSaidaPub('19:00');
                    }}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                      turnoPub === 'noite'
                        ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                        : 'bg-slate-700/60 border-slate-600 text-slate-300 hover:text-white'
                    }`}
                  >
                    <span>🌙 Noite</span>
                    <span className="text-[10px] text-slate-400 font-normal">18h às 23h</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1">Data da Viagem</label>
                  <select
                    value={dataPub}
                    onChange={(e) => setDataPub(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-700/70 border border-slate-600 rounded-xl text-white text-xs font-semibold focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Hoje" className="bg-slate-800 text-white">Hoje</option>
                    <option value="Amanhã" className="bg-slate-800 text-white">Amanhã</option>
                    <option value="Segunda-feira" className="bg-slate-800 text-white">Segunda-feira</option>
                    <option value="Sexta-feira" className="bg-slate-800 text-white">Sexta-feira</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1">Vagas Oferecidas</label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={vagasPub}
                    onChange={(e) => setVagasPub(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2.5 bg-slate-700/70 border border-slate-600 rounded-xl text-white text-xs font-semibold focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1">Valor por Vaga (R$)</label>
                  <input
                    type="text"
                    value={valorPorVagaPub}
                    onChange={(e) => setValorPorVagaPub(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-700/70 border border-slate-600 rounded-xl text-emerald-400 text-xs font-bold focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">Observações do Trajeto</label>
                <textarea
                  value={observacoesPub}
                  onChange={(e) => setObservacoesPub(e.target.value)}
                  rows={2}
                  placeholder="Ex: Passo no Hospital, Rodoviária ou Shopping..."
                  className="w-full p-3 bg-slate-700/70 border border-slate-600 rounded-xl text-xs text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="p-4 bg-slate-700/80 border border-slate-600 rounded-2xl text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">Previsão de Ganhos com Vagas Cheias</span>
                    <span className="text-slate-300">{vagasPub} vaga(s) × R$ {valorPorVagaPub} = R$ {(vagasPub * parseFloat(valorPorVagaPub || '0')).toFixed(2)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-emerald-400 uppercase font-bold block">Você Recebe Líquido (90%)</span>
                    <span className="text-emerald-400 text-base font-black">
                      R$ {((vagasPub * parseFloat(valorPorVagaPub || '0')) * 0.90).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-emerald-500 text-slate-950 font-extrabold text-sm shadow-md hover:bg-emerald-400 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-5 h-5 stroke-[2.5]" />
                <span>Lançar Corrida / Ofertar no Sistema</span>
              </button>
            </form>
          </div>

          {/* LISTA DE MINHAS VAGAS PUBLICADAS NO SISTEMA */}
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Car className="w-4 h-4 text-emerald-400" />
                  Minhas Vagas Publicadas no Sistema
                </h3>
                <p className="text-xs text-slate-300">
                  Vagas que você disponibilizou para os passageiros reservarem.
                </p>
              </div>
              <span className="text-xs font-bold text-slate-200 bg-slate-700/80 border border-slate-600 px-3 py-1 rounded-full">
                {ofertasVagas.filter(v => v.motoristaId === MOTORISTA_JOSE.id).length} Vaga(s) Ofertada(s)
              </span>
            </div>

            <div className="space-y-3">
              {ofertasVagas.filter(v => v.motoristaId === MOTORISTA_JOSE.id).map((vaga) => (
                <div
                  key={vaga.id}
                  className="bg-slate-700/70 border border-slate-600 rounded-2xl p-4 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-600/80 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">
                          {vaga.cidadeOrigem} ➔ {vaga.cidadeDestino}
                        </span>
                        <span className="text-[10px] bg-slate-800 text-slate-300 border border-slate-600 px-2 py-0.5 rounded-md font-bold">
                          {vaga.tipoLinha === 'linha_completa' ? 'Linha 4 Passageiros' : 'Vaga Avulsa'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-300 mt-1">
                        <span>Turno: <strong className="text-white capitalize">{vaga.turno === 'manha' ? 'Manhã' : vaga.turno === 'tarde' ? 'Tarde' : 'Noite'}</strong></span>
                        <span>•</span>
                        <span>Data: <strong className="text-white">{vaga.dataViagem}</strong></span>
                        <span>•</span>
                        <span>Saída aprox.: <strong className="text-white">{vaga.horarioEstimado}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs font-black text-emerald-400 block">
                          R$ {vaga.valorPorVaga.toFixed(2).replace('.', ',')} / vaga
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                          vaga.vagasDisponiveis > 0 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}>
                          {vaga.vagasDisponiveis} de {vaga.vagasTotais} vagas livres
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          removerOfertaVaga(vaga.id);
                          setOfertasVagas(getOfertasVagas());
                          setAlertaSucesso('Oferta de vaga cancelada com sucesso.');
                          setTimeout(() => setAlertaSucesso(null), 3000);
                        }}
                        className="p-2 bg-slate-800 hover:bg-rose-500/20 hover:text-rose-300 text-slate-400 border border-slate-600 rounded-xl transition-all cursor-pointer"
                        title="Cancelar Vaga"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Passageiros que reservaram esta vaga */}
                  {vaga.passageirosReservados.length > 0 ? (
                    <div className="space-y-2 pt-1">
                      <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wide block">
                        Passageiro(s) Confirmado(s) Nesta Vaga:
                      </span>
                      {vaga.passageirosReservados.map((pass, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-slate-800/80 border border-slate-600 rounded-xl flex items-center justify-between gap-3"
                        >
                          <div>
                            <span className="text-xs font-bold text-white block">{pass.passageiroNome}</span>
                            <span className="text-[10px] text-slate-400">{pass.enderecoEmbarque}</span>
                          </div>

                          <a
                            href={`https://wa.me/55${pass.passageiroTelefone.replace(/\D/g, '')}?text=Ol%C3%A1%20${encodeURIComponent(pass.passageiroNome)}!%20Sou%20o%20motorista%20Jos%C3%A9.%20Vi%20que%20voc%C3%AA%20reservou%20sua%20vaga%20para%20${encodeURIComponent(vaga.cidadeDestino)}.%20Por%20favor%2C%20me%20envie%20sua%20localiza%C3%A7%C3%A3o%20aqui%20para%20combinarmos%20o%20embarque!`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
                          >
                            <MessageCircle className="w-3.5 h-3.5 fill-slate-950" />
                            <span>WhatsApp</span>
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-400 italic">
                      Aguardando passageiros reservarem esta vaga pelo aplicativo.
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo Aba 4: Ganhos & Extrato */}
      {activeTab === 'ganhos' && (
        <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-md space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Extrato Financeiro & Repasses</h2>
            <p className="text-xs text-slate-300">
              Acompanhamento de faturamento bruto, taxas de reserva do app (10%) e repasses líquidos diretamente a você.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-slate-700/70 border border-slate-600 rounded-2xl space-y-1">
              <span className="text-xs text-slate-300 block font-medium">Ganhos Líquidos (90%)</span>
              <span className="text-2xl font-extrabold text-emerald-400">R$ 4.819,50</span>
              <span className="text-[10px] text-emerald-300 block">Total creditado / recebido</span>
            </div>

            <div className="p-5 bg-slate-700/70 border border-slate-600 rounded-2xl space-y-1">
              <span className="text-xs text-slate-300 block font-medium">Faturamento Bruto</span>
              <span className="text-2xl font-extrabold text-white">R$ 5.355,00</span>
              <span className="text-[10px] text-slate-400 block">Total pago pelos passageiros</span>
            </div>

            <div className="p-5 bg-slate-700/70 border border-slate-600 rounded-2xl space-y-1">
              <span className="text-xs text-slate-300 block font-medium">Taxa de Reserva App (10%)</span>
              <span className="text-2xl font-extrabold text-amber-400">- R$ 535,50</span>
              <span className="text-[10px] text-amber-300 block">Retido pelo aplicativo</span>
            </div>

            <div className="p-5 bg-slate-700/70 border border-slate-600 rounded-2xl space-y-1">
              <span className="text-xs text-slate-300 block font-medium">Viagens Realizadas</span>
              <span className="text-2xl font-extrabold text-blue-400">119</span>
              <span className="text-[10px] text-blue-300 block">Taxa de Ocupação Média: 92%</span>
            </div>
          </div>

          {/* Demonstrativo das Últimas Corridas */}
          <div className="bg-slate-700/70 border border-slate-600 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-600 pb-2">
              <h3 className="text-sm font-bold text-white">Histórico Recente de Corridas & Taxas</h3>
              <span className="text-xs text-slate-400">Mês Vigente</span>
            </div>

            <div className="divide-y divide-slate-600 text-xs">
              <div className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">Água Doce do Norte ➔ Vitória</span>
                  <span className="text-slate-300 text-[11px]">Passageiro: Celso • 1 vaga • Porta a Porta</span>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-emerald-400 block">Líquido: R$ 40,50</span>
                  <span className="text-[10px] text-slate-400">Bruto: R$ 45,00 | Taxa App 10%: R$ 4,50</span>
                </div>
              </div>

              <div className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">Barra de São Francisco ➔ Vitória</span>
                  <span className="text-slate-300 text-[11px]">Passageira: Ana Cláudia • 1 vaga</span>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-emerald-400 block">Líquido: R$ 35,01</span>
                  <span className="text-[10px] text-slate-400">Bruto: R$ 38,90 | Taxa App 10%: R$ 3,89</span>
                </div>
              </div>

              <div className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">Colatina ➔ Vitória</span>
                  <span className="text-slate-300 text-[11px]">Passageiro: Marcos Vinicius • 1 vaga</span>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-emerald-400 block">Líquido: R$ 25,20</span>
                  <span className="text-[10px] text-slate-400">Bruto: R$ 28,00 | Taxa App 10%: R$ 2,80</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
