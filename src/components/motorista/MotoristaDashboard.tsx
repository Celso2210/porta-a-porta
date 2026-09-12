import React, { useState, useEffect, useMemo } from 'react';
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
  UserCheck
} from 'lucide-react';
import { OFERTAS_MOTORISTAS_MOCK, MOTORISTA_JOSE, VIAGEM_EXEMPLO_MOCK, CIDADES_MOCK } from '../../data/mockData';
import { OfertaMotorista, SolicitacaoViagem, Parada, OfertaVaga, TurnoViagem } from '../../types';
import { MapCanvas } from '../common/MapCanvas';
import { ChatModal } from '../common/ChatModal';
import { WhatsAppButton } from '../common/WhatsAppButton';
import { MotoristaDocumentosTab } from './MotoristaDocumentosTab';
import { MotoristaReservasTab } from './MotoristaReservasTab';
import { MotoristaBuscarTab } from './MotoristaBuscarTab';
import { detectarTurno, getTurnoLabel, formatarTurnoEVagas, TURNOS_SISTEMA } from '../../services/turnoService';
import { atendeFiltroData, classificarDataViagem, getDataHojeIso, getDataAmanhaIso } from '../../services/dataViagemService';
import { calcularDistanciaEntreLocais, calcularTarifaPortaAPorta } from '../../services/routeCalculator';
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
  const [activeTab, setActiveTab] = useState<'reservas' | 'buscar' | 'publicar' | null>(null);
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
  const [origemFiltro, setOrigemFiltro] = useState<string>('');
  const [destinoFiltro, setDestinoFiltro] = useState<string>('');
  const [vagasDesejadasFiltro, setVagasDesejadasFiltro] = useState<number>(driverPlan.vagasDesejadas || 4);
  const [filtroMalas, setFiltroMalas] = useState<'1' | '2' | '3+'>('2');
  const [turnoHorario, setTurnoHorario] = useState<'todos' | 'manha' | 'tarde' | 'noite'>('todos');
  const [dataFiltro, setDataFiltro] = useState<string>('todas');
  const [ofertarAoBuscar, setOfertarAoBuscar] = useState<boolean>(false);
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'aguardando_motorista' | 'proposta_aceita_motorista' | 'confirmada'>('todos');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [filtrosBuscaAplicados, setFiltrosBuscaAplicados] = useState<{
    origem: string;
    destino: string;
    turno: 'todos' | 'manha' | 'tarde' | 'noite';
    dataFiltro: string;
  } | null>(null);
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
  const [opcaoDataPub, setOpcaoDataPub] = useState<'hoje' | 'amanha' | 'escolher'>('hoje');
  const [dataEscolhidaPub, setDataEscolhidaPub] = useState<string>(getDataAmanhaIso());
  const [horarioSaidaPub, setHorarioSaidaPub] = useState('07:30');
  const [vagasPub, setVagasPub] = useState(4);

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
    if (turno === 'manha') return '07:00';
    if (turno === 'tarde') return '11:00';
    return '15:00';
  };

  const handleLancarCorrida = (customOrigem?: string, customDestino?: string) => {
    const origem = customOrigem || (origemFiltro === 'Todas' ? 'Água Doce do Norte' : origemFiltro);
    const destino = customDestino || (destinoFiltro === 'Todas' ? 'Vitória' : destinoFiltro);
    const horario = getHorarioPadraoTurno(turnoHorario === 'todos' ? 'manha' : turnoHorario);
    const labelTurnoAtual = turnoHorario === 'todos' ? 'Manhã (06h às 08h)' : getTurnoLabel(turnoHorario);

    // Verifica se já existe oferta idêntica ativa do motorista
    const jaExiste = ofertasVagas.find(
      o => o.motoristaId === MOTORISTA_JOSE.id && 
           o.status === 'ativa' && 
           o.cidadeOrigem.toLowerCase() === origem.toLowerCase() &&
           o.cidadeDestino.toLowerCase() === destino.toLowerCase() &&
           o.turno === (turnoHorario === 'todos' ? 'manha' : turnoHorario)
    );

    if (jaExiste) {
      setAlertaSucesso(`ℹ️ Você já possui esta corrida ativa de ${origem} ➔ ${destino} no turno ${labelTurnoAtual}. Suas vagas continuam ofertadas.`);
      setTimeout(() => setAlertaSucesso(null), 5000);
      return;
    }

    const distReal = calcularDistanciaEntreLocais(origem, destino).distanciaKm || 120;
    const resTarifa = calcularTarifaPortaAPorta(distReal, 'compartilhada', 1);
    const valorOficial = resTarifa.valorPorPassageiro || 40.00;

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
      turno: turnoHorario === 'todos' ? 'manha' : turnoHorario,
      data: dataFiltro === 'amanha' ? 'Amanhã' : dataFiltro === 'todas' ? 'Hoje' : dataFiltro,
      dataViagem: dataFiltro === 'amanha' ? 'Amanhã' : dataFiltro === 'todas' ? 'Hoje' : dataFiltro,
      horarioEstimado: horario,
      vagasTotais: vagasDesejadasFiltro,
      vagasDisponiveis: vagasDesejadasFiltro,
      valorPorVaga: valorOficial,
      observacoes: `Corrida lançada por ${MOTORISTA_JOSE.nome}. Saída de ${origem} para ${destino} (${labelTurnoAtual}). Capacidade para até ${vagasDesejadasFiltro} passageiros e ${filtroMalas === '3+' ? '3+ malas' : `${filtroMalas} mala(s)`}. Embarque porta a porta.`,
      tipoLinha: vagasDesejadasFiltro >= 4 ? 'linha_completa' : 'viagem_avulsa'
    });

    setOfertasVagas(getOfertasVagas());
    setDriverSearchPlan(origem, destino, horario, vagasDesejadasFiltro);

    setAlertaSucesso(`🚀 Corrida Lançada com Sucesso! Sua saída de ${origem} para ${destino} (${labelTurnoAtual}) com ${vagasDesejadasFiltro} vagas já está ofertada no sistema para os passageiros reservarem.`);
    setTimeout(() => setAlertaSucesso(null), 6000);
  };

  const handleExecutarBusca = (
    customOrigem?: string, 
    customDestino?: string, 
    customTurno?: 'todos' | 'manha' | 'tarde' | 'noite',
    customData?: string
  ) => {
    setIsSearching(true);
    const origemTxt = customOrigem !== undefined ? customOrigem : (origemFiltro || 'Todas');
    const destinoTxt = customDestino !== undefined ? customDestino : (destinoFiltro || 'Todas');
    const turnoTxt = customTurno !== undefined ? customTurno : (turnoHorario || 'todos');
    const dataTxt = customData !== undefined ? customData : (dataFiltro || 'todas');

    if (customData !== undefined) {
      setDataFiltro(customData);
    }

    setFiltrosBuscaAplicados({
      origem: origemTxt,
      destino: destinoTxt,
      turno: turnoTxt,
      dataFiltro: dataTxt
    });
    setHasSearched(true);

    const horarioEstimado = getHorarioPadraoTurno(turnoTxt === 'todos' ? 'manha' : turnoTxt);
    setDriverSearchPlan(origemTxt, destinoTxt, horarioEstimado, vagasDesejadasFiltro);

    if (ofertarAoBuscar) {
      handleLancarCorrida(origemTxt === 'Todas' ? 'Água Doce do Norte' : origemTxt, destinoTxt === 'Todas' ? 'Vitória' : destinoTxt);
    }

    setTimeout(() => {
      setIsSearching(false);
      const turnoTxtLabel = turnoTxt === 'todos' ? 'Todos os Horários' : getTurnoLabel(turnoTxt);
      const malasTxt = filtroMalas === '3+' ? '3+ malas' : `${filtroMalas} mala(s)`;
      const dataLabel = dataTxt === 'todas' ? 'Todas as datas' : dataTxt === 'hoje' ? 'Hoje' : dataTxt === 'amanha' ? 'Amanhã' : dataTxt;
      const msg = `🔍 Busca realizada: ${origemTxt === 'Todas' ? 'Qualquer Origem' : origemTxt} ➔ ${destinoTxt === 'Todas' ? 'Qualquer Destino' : destinoTxt} | Data: ${dataLabel} | ${turnoTxtLabel}`;
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
      const infoHorario = sol.horarioDesejado ? `⏰ Horário: ${sol.horarioDesejado}` : '';
      setAlertaSucesso(`⭐ Viagem Exclusiva de ${sol.passageiroNome} aceita! ${infoHorario} • Valor: R$ ${sol.valorTotal.toFixed(2).replace('.', ',')}.`);
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
    modalidade: 'compartilhada' | 'exclusiva' = 'compartilhada',
    dataSimulada?: string
  ) => {
    const taxa = Math.round(valorTotal * 0.10 * 100) / 100;
    const liquido = Math.round(valorTotal * 0.90 * 100) / 100;
    const horarioDesejado = '08:00';
    const qtdMalasSim = filtroMalas === '1' ? 1 : filtroMalas === '2' ? 2 : 3;
    const distReal = calcularDistanciaEntreLocais(origem, destino).distanciaKm || 120;
    const dataDefinida = dataSimulada || (dataFiltro === 'todas' ? 'Hoje' : dataFiltro === 'amanha' ? 'Amanhã' : dataFiltro);

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
      horarioDesejado: horarioDesejado,
      dataViagem: dataDefinida
    });
    setHasSearched(true);
    setFiltrosBuscaAplicados(prev => prev || {
      origem: origem || 'Todas',
      destino: destino || 'Todas',
      turno: 'todos',
      dataFiltro: dataFiltro || 'todas'
    });
    setAlertaSucesso(`✅ Passageiro ${sol.passageiroNome} adicionado para ${dataDefinida} (${modalidade === 'exclusiva' ? '⭐ Exclusiva' : '👥 Compartilhada'}): ${sol.cidadeOrigem} ➔ ${sol.cidadeDestino} (R$ ${valorTotal.toFixed(2)})`);
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
    dataViagem?: string;
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
        modalidade: s.modalidade || 'compartilhada',
        dataViagem: s.dataViagem || 'Hoje'
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
        modalidade: sol?.modalidade || 'compartilhada',
        dataViagem: sol?.dataViagem || 'Hoje'
      });
    }
  });

  const passageirosReservados = Array.from(listaReservadosMap.values());

  // 2. Passageiros Disponíveis na Rota (Lista Tipo E-mail)
  // REGRA DO USUÁRIO: Não pré-preencher com 14 corridas! Só buscar a partir do momento que o motorista clicar em buscar com o filtro!
  const passageirosDisponiveis = useMemo(() => {
    if (!hasSearched || !filtrosBuscaAplicados) {
      return [];
    }

    return solicitacoes.filter(s => {
      if (s.status !== 'aguardando_motorista') return false;
      if (listaReservadosMap.has(s.id)) return false;

      // Filtro por Origem
      if (filtrosBuscaAplicados.origem && filtrosBuscaAplicados.origem !== 'Todas') {
        const matchOrigem = s.cidadeOrigem.toLowerCase().includes(filtrosBuscaAplicados.origem.toLowerCase()) || 
                            filtrosBuscaAplicados.origem.toLowerCase().includes(s.cidadeOrigem.toLowerCase());
        if (!matchOrigem) return false;
      }

      // Filtro por Destino
      if (filtrosBuscaAplicados.destino && filtrosBuscaAplicados.destino !== 'Todas') {
        const matchDestino = s.cidadeDestino.toLowerCase().includes(filtrosBuscaAplicados.destino.toLowerCase()) || 
                             filtrosBuscaAplicados.destino.toLowerCase().includes(s.cidadeDestino.toLowerCase());
        if (!matchDestino) return false;
      }

      // Filtro Turno Padronizado
      if (filtrosBuscaAplicados.turno && filtrosBuscaAplicados.turno !== 'todos') {
        const isExclusivaImediata = s.modalidade === 'exclusiva' && (s.horarioDesejado || '').toLowerCase().includes('imediata');
        const turnoPassageiro = detectarTurno(s.horarioDesejado);
        if (!isExclusivaImediata && turnoPassageiro !== filtrosBuscaAplicados.turno) return false;
      }

      // Filtro de Data da Viagem (Hoje, Amanhã, Depois de amanhã, Todas ou Específica)
      if (filtrosBuscaAplicados.dataFiltro && filtrosBuscaAplicados.dataFiltro !== 'todas') {
        const atende = atendeFiltroData(s.dataViagem, s.horarioDesejado, filtrosBuscaAplicados.dataFiltro);
        if (!atende) return false;
      }

      return true;
    });
  }, [hasSearched, filtrosBuscaAplicados, solicitacoes, listaReservadosMap]);

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
      <div className="bg-slate-800 border border-slate-700 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-4 overflow-hidden">
        <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto">
          <img
            src={MOTORISTA_JOSE.avatar}
            alt={MOTORISTA_JOSE.nome}
            className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl object-cover border-2 border-emerald-500 shadow-sm shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-xl font-bold text-white truncate">{MOTORISTA_JOSE.nome}</h1>
              <span className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10.5px] sm:text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Award className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400 shrink-0" />
                <span>Ouro • {MOTORISTA_JOSE.nota} ⭐</span>
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5 truncate">
              Veículo: <strong className="text-white">{MOTORISTA_JOSE.veiculo.modelo}</strong> ({MOTORISTA_JOSE.veiculo.placa}) • {MOTORISTA_JOSE.veiculo.cor}
            </p>
          </div>
        </div>

        {/* Tab Buttons com Alto Contraste: Reservas, Buscar e Lançar Corrida */}
        <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border-2 border-slate-700 w-full md:w-auto overflow-x-auto max-w-full shadow-inner">
          {/* Botão 1: Reservas */}
          <button
            id="tab-motorista-reservas"
            onClick={() => setActiveTab(activeTab === 'reservas' ? null : 'reservas')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'reservas'
                ? 'bg-emerald-500 text-slate-950 font-black border-2 border-emerald-300 shadow-md ring-2 ring-emerald-400/40'
                : 'bg-slate-700/90 text-white font-bold border-2 border-slate-500 hover:bg-slate-600 hover:border-slate-400 shadow-xs'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Reservas</span>
            {passageirosReservados.length > 0 && (
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                activeTab === 'reservas'
                  ? 'bg-slate-950 text-emerald-300 border border-emerald-900/60'
                  : 'bg-emerald-500 text-slate-950 font-black'
              }`}>
                {passageirosReservados.length}
              </span>
            )}
          </button>

          {/* Botão 2: Buscar */}
          <button
            id="tab-motorista-buscar"
            onClick={() => setActiveTab(activeTab === 'buscar' ? null : 'buscar')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'buscar'
                ? 'bg-emerald-500 text-slate-950 font-black border-2 border-emerald-300 shadow-md ring-2 ring-emerald-400/40'
                : 'bg-slate-700/90 text-white font-bold border-2 border-slate-500 hover:bg-slate-600 hover:border-slate-400 shadow-xs'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Buscar</span>
            {passageirosDisponiveis.length > 0 && (
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                activeTab === 'buscar'
                  ? 'bg-slate-950 text-emerald-300 border border-emerald-900/60'
                  : 'bg-emerald-500 text-slate-950 font-black'
              }`}>
                {passageirosDisponiveis.length}
              </span>
            )}
          </button>

          {/* Botão 3: Lançar Corrida (lado a lado com Buscar) */}
          <button
            id="tab-motorista-publicar"
            onClick={() => setActiveTab(activeTab === 'publicar' ? null : 'publicar')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'publicar'
                ? 'bg-emerald-500 text-slate-950 font-black border-2 border-emerald-300 shadow-md ring-2 ring-emerald-400/40'
                : 'bg-slate-700/90 text-white font-bold border-2 border-slate-500 hover:bg-slate-600 hover:border-slate-400 shadow-xs'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Lançar Corrida</span>
            {(ofertasVagas || []).filter(v => v.motoristaId === MOTORISTA_JOSE.id && v.status === 'ativa').length > 0 && (
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                activeTab === 'publicar'
                  ? 'bg-slate-950 text-emerald-300 border border-emerald-900/60'
                  : 'bg-emerald-500 text-slate-950 font-black'
              }`}>
                {(ofertasVagas || []).filter(v => v.motoristaId === MOTORISTA_JOSE.id && v.status === 'ativa').length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ABA: MINHAS RESERVAS */}
      {activeTab === 'reservas' && (
        <MotoristaReservasTab
          passageirosReservados={passageirosReservados}
          vagasDesejadasFiltro={vagasDesejadasFiltro}
          onDesfazerAceite={handleDesfazerAceite}
          onSimularCelso={handleSimularReservaCelso}
          onIrParaBuscar={() => setActiveTab('buscar')}
        />
      )}

      {/* ABA: PESQUISAR E BUSCAR PASSAGEIROS */}
      {activeTab === 'buscar' && (
        <MotoristaBuscarTab
          origemFiltro={origemFiltro}
          setOrigemFiltro={setOrigemFiltro}
          destinoFiltro={destinoFiltro}
          setDestinoFiltro={setDestinoFiltro}
          turnoHorario={turnoHorario}
          setTurnoHorario={setTurnoHorario}
          dataFiltro={dataFiltro}
          setDataFiltro={setDataFiltro}
          isSearching={isSearching}
          onSearch={handleExecutarBusca}
          hasSearched={hasSearched}
          filtrosAplicados={filtrosBuscaAplicados}
          passageirosDisponiveis={passageirosDisponiveis}
          onAceitarPassageiro={handleAceitarPassageiro}
          onSimularPassageiro={handleCriarChamadoSimulado}
          passageirosReservados={passageirosReservados}
          onIrParaReservas={() => setActiveTab('reservas')}
        />
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

      {/* Conteúdo Aba: Publicar Saída Programada / Vagas (Lançar Corrida) */}
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
                data: (() => {
                  if (opcaoDataPub === 'amanha') return 'Amanhã';
                  if (opcaoDataPub === 'escolher') {
                    if (dataEscolhidaPub) {
                      const p = dataEscolhidaPub.split('-');
                      return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : dataEscolhidaPub;
                    }
                  }
                  return 'Hoje';
                })(),
                dataViagem: (() => {
                  if (opcaoDataPub === 'amanha') return 'Amanhã';
                  if (opcaoDataPub === 'escolher') {
                    if (dataEscolhidaPub) {
                      const p = dataEscolhidaPub.split('-');
                      return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : dataEscolhidaPub;
                    }
                  }
                  return 'Hoje';
                })(),
                horarioEstimado: horarioSaidaPub,
                vagasTotais: vagasPub,
                vagasDisponiveis: vagasPub,
                valorPorVaga: 0,
                observacoes: '',
                tipoLinha: tipoLinhaPub
              });
              const dataDesc = opcaoDataPub === 'amanha' ? 'Amanhã' : opcaoDataPub === 'escolher' ? dataEscolhidaPub.split('-').reverse().join('/') : 'Hoje';
              setOfertasVagas(getOfertasVagas());
              setAlertaSucesso(`✅ Vaga publicada com sucesso! ${vagasPub} vaga(s) ofertadas para ${dataDesc} (${turnoPub === 'manha' ? 'Manhã' : turnoPub === 'tarde' ? 'Tarde' : 'Noite'}). Os passageiros já podem reservar.`);
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
                      setHorarioSaidaPub('07:00');
                    }}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                      turnoPub === 'manha'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-slate-700/60 border-slate-600 text-slate-300 hover:text-white'
                    }`}
                  >
                    <span>🌅 Manhã</span>
                    <span className="text-[10px] text-slate-400 font-normal">06h às 08h</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTurnoPub('tarde');
                      setHorarioSaidaPub('11:00');
                    }}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                      turnoPub === 'tarde'
                        ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                        : 'bg-slate-700/60 border-slate-600 text-slate-300 hover:text-white'
                    }`}
                  >
                    <span>☀️ Tarde</span>
                    <span className="text-[10px] text-slate-400 font-normal">10h às 14h</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTurnoPub('noite');
                      setHorarioSaidaPub('15:00');
                    }}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                      turnoPub === 'noite'
                        ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                        : 'bg-slate-700/60 border-slate-600 text-slate-300 hover:text-white'
                    }`}
                  >
                    <span>🌤️ Noite / Fim de Tarde</span>
                    <span className="text-[10px] text-slate-400 font-normal">14h às 18h</span>
                  </button>
                </div>
              </div>

              {/* DATA DA VIAGEM */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Data da Viagem</span>
                  </label>
                  {opcaoDataPub === 'escolher' && dataEscolhidaPub && (
                    <span className="text-[11px] text-emerald-300 font-bold bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                      Dia: {dataEscolhidaPub.split('-').reverse().join('/')}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    id="btn-motorista-data-hoje"
                    onClick={() => setOpcaoDataPub('hoje')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center cursor-pointer border ${
                      opcaoDataPub === 'hoje'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-xs ring-1 ring-emerald-500/30'
                        : 'bg-slate-700/60 border-slate-600 text-slate-300 hover:border-slate-500 hover:text-white'
                    }`}
                  >
                    <span>Hoje</span>
                    <span className="text-[10px] opacity-75 font-normal">
                      {new Date().getDate().toString().padStart(2, '0')}/{(new Date().getMonth() + 1).toString().padStart(2, '0')}
                    </span>
                  </button>

                  <button
                    type="button"
                    id="btn-motorista-data-amanha"
                    onClick={() => setOpcaoDataPub('amanha')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center cursor-pointer border ${
                      opcaoDataPub === 'amanha'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-xs ring-1 ring-emerald-500/30'
                        : 'bg-slate-700/60 border-slate-600 text-slate-300 hover:border-slate-500 hover:text-white'
                    }`}
                  >
                    <span>Amanhã</span>
                    <span className="text-[10px] opacity-75 font-normal">
                      {(() => {
                        const d = new Date();
                        d.setDate(d.getDate() + 1);
                        return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
                      })()}
                    </span>
                  </button>

                  <button
                    type="button"
                    id="btn-motorista-data-escolher"
                    onClick={() => setOpcaoDataPub('escolher')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center cursor-pointer border ${
                      opcaoDataPub === 'escolher'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-xs ring-1 ring-emerald-500/30'
                        : 'bg-slate-700/60 border-slate-600 text-slate-300 hover:border-slate-500 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-emerald-400" />
                      Escolher o dia
                    </span>
                    <span className="text-[10px] opacity-75 font-normal">
                      {opcaoDataPub === 'escolher' && dataEscolhidaPub ? dataEscolhidaPub.split('-').reverse().slice(0, 2).join('/') : 'Calendário'}
                    </span>
                  </button>
                </div>

                {opcaoDataPub === 'escolher' && (
                  <div className="p-3 bg-slate-900/70 border border-emerald-500/40 rounded-xl space-y-1.5 animate-fadeIn">
                    <label className="block text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      Selecione a data no calendário:
                    </label>
                    <input
                      type="date"
                      min={getDataHojeIso()}
                      value={dataEscolhidaPub}
                      onChange={(e) => setDataEscolhidaPub(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white text-xs font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer"
                      required={opcaoDataPub === 'escolher'}
                    />
                  </div>
                )}
              </div>

              {/* HORÁRIO APROXIMADO E VAGAS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Horário Aprox. de Saída</span>
                  </label>
                  <input
                    type="text"
                    value={horarioSaidaPub}
                    onChange={(e) => setHorarioSaidaPub(e.target.value)}
                    placeholder="Ex: 07:30"
                    className="w-full px-3 py-2.5 bg-slate-700/70 border border-slate-600 rounded-xl text-white text-xs font-semibold focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Vagas Oferecidas</span>
                  </label>
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
                {(ofertasVagas || []).filter(v => v.motoristaId === MOTORISTA_JOSE.id).length} Vaga(s) Ofertada(s)
              </span>
            </div>

            <div className="space-y-3">
              {(ofertasVagas || []).filter(v => v.motoristaId === MOTORISTA_JOSE.id).map((vaga) => (
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
                        <span className={`text-xs font-bold px-3 py-1 rounded-full inline-block ${
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
                  {Array.isArray(vaga.passageirosReservados) && vaga.passageirosReservados.length > 0 ? (
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
                            href={`https://wa.me/55${(pass.passageiroTelefone || '').replace(/\D/g, '')}?text=Ol%C3%A1%20${encodeURIComponent(pass.passageiroNome)}!%20Sou%20o%20motorista%20Jos%C3%A9.%20Vi%20que%20voc%C3%AA%20reservou%20sua%20vaga%20para%20${encodeURIComponent(vaga.cidadeDestino)}.%20Por%20favor%2C%20me%20envie%20sua%20localiza%C3%A7%C3%A3o%20aqui%20para%20combinarmos%20o%20embarque!`}
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
    </div>
  );
};
