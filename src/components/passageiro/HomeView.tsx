import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Users, 
  User,
  Briefcase,
  Car, 
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  LocateFixed,
  Loader2,
  Building2,
  Bus,
  Plane,
  Hospital,
  Search,
  Sparkles,
  Calendar,
  ShieldCheck,
  AlertCircle,
  Clock,
  Crown,
  ChevronRight
} from 'lucide-react';
import { CIDADES_MOCK } from '../../data/mockData';
import { TariffConfig } from '../../types';
import { 
  calcularDistanciaEntreLocais, 
  calcularRotaRealGoogleMaps, 
  calcularTarifaPortaAPorta 
} from '../../services/routeCalculator';
import { buscarSugestoesEndereco, SugestaoEndereco } from '../../services/addressSuggestions';
import { PassageiroDocumentosModal } from './PassageiroDocumentosModal';
import { TimePickerModal } from '../common/TimePickerModal';
import { getPassageiroDocs, subscribeToDocuments } from '../../services/documentService';

interface HomeViewProps {
  tariffConfig?: TariffConfig;
  onSolicitar: (details: {
    origem: string;
    destino: string;
    origemCompleta: string;
    destinoCompleto: string;
    passageiros: number;
    malas: number;
    modalidade: 'compartilhada' | 'exclusiva';
    distanciaKm: number;
    agendamento: string;
    dataViagem?: string;
    precoEstimado: number;
    taxaReserva: number;
    valorRestanteEmbarque: number;
    precoPorKmAplicado: number;
  }) => void;
  userName?: string;
  onOpenLogin?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ 
  tariffConfig = { precoKmCompartilhada: 0.60, precoKmExclusiva: 2.40 }, 
  onSolicitar, 
  userName = 'Celso',
  onOpenLogin
}) => {
  // 1. Tipo de Viagem (Compartilhada ou Exclusiva) - Escolhido primeiro
  const [modalidade, setModalidade] = useState<'compartilhada' | 'exclusiva'>('compartilhada');

  // 2. Endereços de Partida e Chegada (Inicialmente vazios sem cálculo fictício)
  const [origemCompleta, setOrigemCompleta] = useState('');
  const [destinoCompleto, setDestinoCompleto] = useState('');
  const [cidadeOrigem, setCidadeOrigem] = useState('');
  const [cidadeDestino, setCidadeDestino] = useState('');
  const [distanciaKm, setDistanciaKm] = useState<number>(0);
  const [erroRota, setErroRota] = useState<string | null>(null);

  // Etapa atual do fluxo inicial (1: Tipo de viagem e endereços | 2: Data, horário e passageiros)
  const [etapaAtual, setEtapaAtual] = useState<1 | 2>(1);

  // Validações de preenchimento real dos pontos de partida e chegada
  const temOrigem = Boolean(origemCompleta.trim());
  const temDestino = Boolean(destinoCompleto.trim());
  const rotaDefinida = temOrigem && temDestino && distanciaKm > 0;

  // 3. Quando viajar (Hoje, Amanhã ou Outra Data / Manhã, Tarde ou Noite)
  const [modoAgendamento, setModoAgendamento] = useState<'hoje' | 'amanha' | 'agendar'>('hoje');
  const [turnoHorario, setTurnoHorario] = useState<'manha' | 'tarde' | 'noite'>('manha');
  // Horário livre escolhido pelo passageiro na viagem exclusiva (sem horário pré-definido)
  const [horarioExclusivo, setHorarioExclusivo] = useState<string>('');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [dataAgendada, setDataAgendada] = useState(() => {
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    return amanha.toISOString().split('T')[0];
  });

  // 4. Passageiros e Bagagem
  const [passageiros, setPassageiros] = useState<number>(1);
  const [malas, setMalas] = useState<number>(1);
  const [showDocModal, setShowDocModal] = useState(false);
  const [passDocs, setPassDocs] = useState(getPassageiroDocs());

  useEffect(() => {
    const unsub = subscribeToDocuments(() => {
      setPassDocs(getPassageiroDocs());
    });
    return () => unsub();
  }, []);

  // Estados de apoio para Autocomplete e GPS
  const [isLocating, setIsLocating] = useState(false);
  const [focoOrigem, setFocoOrigem] = useState(false);
  const [focoDestino, setFocoDestino] = useState(false);

  const sugestoesOrigem = focoOrigem ? buscarSugestoesEndereco(origemCompleta, 'embarque', cidadeOrigem) : [];
  const sugestoesDestino = focoDestino ? buscarSugestoesEndereco(destinoCompleto, 'desembarque', cidadeDestino) : [];

  const handleSelecionarSugestaoOrigem = (sug: SugestaoEndereco) => {
    setOrigemCompleta(sug.enderecoCompleto);
    setCidadeOrigem(sug.cidade);
    setFocoOrigem(false);
    const res = calcularDistanciaEntreLocais(sug.enderecoCompleto, destinoCompleto);
    setDistanciaKm(res.distanciaKm);
    if (res.cidadeDestinoDetectada) setCidadeDestino(res.cidadeDestinoDetectada);
  };

  const handleSelecionarSugestaoDestino = (sug: SugestaoEndereco) => {
    setDestinoCompleto(sug.enderecoCompleto);
    setCidadeDestino(sug.cidade);
    setFocoDestino(false);
    const res = calcularDistanciaEntreLocais(origemCompleta, sug.enderecoCompleto);
    setDistanciaKm(res.distanciaKm);
    if (res.cidadeOrigemDetectada) setCidadeOrigem(res.cidadeOrigemDetectada);
  };

  const renderIconeSugestao = (tipo: SugestaoEndereco['iconeTipo']) => {
    switch (tipo) {
      case 'rodoviaria': return <Bus className="w-4 h-4 text-amber-600" />;
      case 'aeroporto': return <Plane className="w-4 h-4 text-blue-600" />;
      case 'hospital': return <Hospital className="w-4 h-4 text-rose-600" />;
      case 'centro': return <Building2 className="w-4 h-4 text-purple-600" />;
      default: return <MapPin className="w-4 h-4 text-blue-500" />;
    }
  };

  // Usar Geolocalização (GPS)
  const handleUsarMinhaLocalizacao = () => {
    if (!('geolocation' in navigator)) {
      alert('Geolocalização não é suportada por este navegador.');
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          if (response.ok) {
            const data = await response.json();
            if (data && data.address) {
              const road = data.address.road || data.address.street || data.address.pedestrian || 'Rua Principal';
              const houseNumber = data.address.house_number ? `, nº ${data.address.house_number}` : '';
              const suburb = data.address.suburb || data.address.neighbourhood || 'Centro';
              const city = data.address.city || data.address.town || data.address.village || data.address.municipality || 'Água Doce do Norte';
              const state = data.address.state_code || 'ES';

              const enderecoDetectado = `${road}${houseNumber} - ${suburb}, ${city} - ${state.toUpperCase()}`;
              setOrigemCompleta(enderecoDetectado);
              setCidadeOrigem(city);

              const res = calcularDistanciaEntreLocais(enderecoDetectado, destinoCompleto);
              setDistanciaKm(res.distanciaKm);
              setIsLocating(false);
              return;
            }
          }
        } catch (error) {
          console.warn('Erro na geocodificação reversa:', error);
        }

        let cidadeMaisProxima = CIDADES_MOCK[0];
        let menorDistancia = Infinity;

        CIDADES_MOCK.forEach(c => {
          const d = Math.hypot(c.lat - latitude, c.lng - longitude);
          if (d < menorDistancia) {
            menorDistancia = d;
            cidadeMaisProxima = c;
          }
        });

        const enderecoFallback = `Rua Central, nº 150 - Centro, ${cidadeMaisProxima.nome} - ${cidadeMaisProxima.uf}`;
        setOrigemCompleta(enderecoFallback);
        setCidadeOrigem(cidadeMaisProxima.nome);

        const res = calcularDistanciaEntreLocais(enderecoFallback, destinoCompleto);
        setDistanciaKm(res.distanciaKm);
        setIsLocating(false);
      },
      (error) => {
        console.warn('Erro GPS:', error);
        const fallbackEnd = 'Rua Principal, nº 100 - Centro, Água Doce do Norte - ES';
        setOrigemCompleta(fallbackEnd);
        setCidadeOrigem('Água Doce do Norte');
        setIsLocating(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Recalcular distância com Google Maps Routes API (com fallback de alta precisão para todo o Brasil)
  useEffect(() => {
    if (!origemCompleta.trim() || !destinoCompleto.trim()) {
      setDistanciaKm(0);
      return;
    }

    // 1. Estimativa instantânea imediata sem travar o formulário
    const resSync = calcularDistanciaEntreLocais(origemCompleta, destinoCompleto);
    setDistanciaKm(resSync.distanciaKm);
    if (resSync.cidadeOrigemDetectada) setCidadeOrigem(resSync.cidadeOrigemDetectada);
    if (resSync.cidadeDestinoDetectada) setCidadeDestino(resSync.cidadeDestinoDetectada);
    if (resSync.distanciaKm > 0) {
      setErroRota(null);
    }

    // 2. Consulta a quilometragem real de rota rodoviária no Google Maps Routes API
    let ativo = true;
    const timer = setTimeout(async () => {
      try {
        const rotaReal = await calcularRotaRealGoogleMaps(origemCompleta, destinoCompleto);
        if (ativo && rotaReal && rotaReal.distanciaKm > 0) {
          setDistanciaKm(rotaReal.distanciaKm);
          setErroRota(null);
        }
      } catch (e) {
        console.warn('Erro ao atualizar rota com Google Maps:', e);
      }
    }, 350);

    return () => {
      ativo = false;
      clearTimeout(timer);
    };
  }, [origemCompleta, destinoCompleto]);

  // Tarifas atrativas para o motorista com precificação por faixas de distância em todo o Brasil
  const resultadoTarifa = calcularTarifaPortaAPorta(distanciaKm, modalidade, passageiros, tariffConfig);
  const precoKmCompartilhada = tariffConfig.precoKmCompartilhada ?? 0.60;
  const precoKmExclusiva = tariffConfig.precoKmExclusiva ?? 2.40;
  const precoPorKmAtual = rotaDefinida
    ? resultadoTarifa.tarifaEfetivaPorKm
    : (modalidade === 'compartilhada' ? precoKmCompartilhada : precoKmExclusiva);

  const valorTotal = rotaDefinida ? resultadoTarifa.valorTotal : 0;
  const taxaReserva = rotaDefinida ? resultadoTarifa.taxaReserva : 0;
  const valorRestanteEmbarque = rotaDefinida ? resultadoTarifa.valorRestanteEmbarque : 0;

  // Função que busca a rota e abre a segunda página (Etapa 2)
  const handleBuscar = () => {
    if (!temOrigem && !temDestino) {
      setErroRota('Por favor, informe o endereço de embarque e o endereço de destino.');
      return;
    }
    if (!temOrigem) {
      setErroRota('Por favor, informe o endereço de embarque onde você está.');
      return;
    }
    if (!temDestino) {
      setErroRota('Por favor, informe o endereço de destino para onde deseja ir.');
      return;
    }

    if (!rotaDefinida) {
      const res = calcularDistanciaEntreLocais(origemCompleta, destinoCompleto);
      if (res.distanciaKm > 0) {
        setDistanciaKm(res.distanciaKm);
        if (res.cidadeOrigemDetectada) setCidadeOrigem(res.cidadeOrigemDetectada);
        if (res.cidadeDestinoDetectada) setCidadeDestino(res.cidadeDestinoDetectada);
      } else {
        setErroRota('Não conseguimos calcular a rota. Verifique os endereços informados.');
        return;
      }
    }

    setErroRota(null);
    setEtapaAtual(2);
  };

  const handleContinuar = () => {
    if (!temOrigem || !temDestino || !rotaDefinida) {
      setErroRota('Verifique os endereços informados na primeira etapa.');
      setEtapaAtual(1);
      return;
    }

    setErroRota(null);

    let agendamentoTexto = '';
    if (modalidade === 'exclusiva') {
      const horaFormatada = horarioExclusivo ? `às ${horarioExclusivo}` : '';
      if (modoAgendamento === 'hoje') {
        agendamentoTexto = horaFormatada ? `Hoje ${horaFormatada}` : 'Hoje (Horário a combinar)';
      } else if (modoAgendamento === 'amanha') {
        agendamentoTexto = horaFormatada ? `Amanhã ${horaFormatada}` : 'Amanhã (Horário a combinar)';
      } else {
        const parts = (dataAgendada || '').split('-');
        const dataFormatada = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : (dataAgendada || '');
        agendamentoTexto = horaFormatada ? `${dataFormatada} ${horaFormatada}` : dataFormatada;
      }
    } else {
      const turnoLabel = turnoHorario === 'manha' 
        ? 'Manhã (06h às 08h)' 
        : turnoHorario === 'tarde' 
        ? 'Tarde (10h às 14h)' 
        : 'Tarde (14h às 18h)';

      if (modoAgendamento === 'hoje') {
        agendamentoTexto = turnoLabel;
      } else if (modoAgendamento === 'amanha') {
        agendamentoTexto = `Amanhã • ${turnoLabel}`;
      } else {
        const parts = (dataAgendada || '').split('-');
        const dataFormatada = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : (dataAgendada || '');
        agendamentoTexto = `${dataFormatada} • ${turnoLabel}`;
      }
    }

    const dataViagemFinal = modoAgendamento === 'hoje' ? 'Hoje' : modoAgendamento === 'amanha' ? 'Amanhã' : dataAgendada;

    onSolicitar({
      origem: cidadeOrigem || 'Origem',
      destino: cidadeDestino || 'Destino',
      origemCompleta: origemCompleta.trim(),
      destinoCompleto: destinoCompleto.trim(),
      passageiros,
      malas,
      modalidade,
      distanciaKm,
      agendamento: agendamentoTexto,
      dataViagem: dataViagemFinal,
      precoEstimado: valorTotal,
      taxaReserva,
      valorRestanteEmbarque,
      precoPorKmAplicado: precoPorKmAtual
    });
  };

  return (
    <div className="flex flex-col justify-between h-auto p-3 sm:p-4 bg-gradient-to-b from-slate-100/90 via-slate-50 to-blue-50/30 text-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm relative overflow-hidden space-y-2.5">
      {/* Top Header Compacto */}
      <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/80">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-black tracking-widest text-blue-600 uppercase flex items-center gap-1">
            <Car className="w-3.5 h-3.5" /> PORTA A PORTA
          </span>
          <span className="text-xs text-slate-400 font-light">•</span>
          <h1 className="text-xs sm:text-sm font-light text-slate-900">
            Olá, <span className="font-black text-blue-600">{userName}</span>
          </h1>
        </div>

        <div className="flex items-center gap-1.5">
          {onOpenLogin && (
            <button
              type="button"
              id="btn-home-abrir-login"
              onClick={onOpenLogin}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 transition-all cursor-pointer"
              title="Abrir Tela de Login e Editar Fotos"
            >
              <User className="w-3 h-3 text-emerald-600 shrink-0" />
              <span>Login / Fotos</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowDocModal(true)}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all ${
              passDocs.statusGeral === 'aprovado'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-amber-50 text-amber-800 border-amber-300'
            }`}
            title="Verificar documentos"
          >
            <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
            <span>{passDocs.statusGeral === 'aprovado' ? 'Verificado' : 'Validar Doc'}</span>
          </button>

          {rotaDefinida && (
            <span className="text-[10px] font-extrabold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200 shadow-2xs">
              {distanciaKm} km
            </span>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* ETAPA 1: TIPO DE VIAGEM + ENDEREÇOS + BOTÃO BUSCAR NA BARRA */}
      {/* ========================================================= */}
      {etapaAtual === 1 && (
        <div className="space-y-2.5 animate-in fade-in duration-150">
          {/* Escolha o Tipo de Viagem */}
          <div>
            <label className="text-[10px] uppercase tracking-wider text-slate-600 font-extrabold mb-1 flex items-center justify-between">
              <span>Escolha o Tipo de Viagem</span>
              <span className="text-[9.5px] font-normal text-slate-400">toque para selecionar</span>
            </label>

            <div className="grid grid-cols-2 gap-2">
              {/* Opção Compartilhada */}
              <button
                type="button"
                id="btn-modalidade-compartilhada"
                onClick={() => setModalidade('compartilhada')}
                className={`p-2 sm:p-2.5 rounded-xl text-left transition-all relative flex flex-col justify-center cursor-pointer border ${
                  modalidade === 'compartilhada'
                    ? 'bg-blue-600 border-blue-600 text-white shadow-xs ring-2 ring-blue-500/20'
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span className={`text-xs sm:text-sm font-black tracking-tight ${
                    modalidade === 'compartilhada' ? 'text-white' : 'text-slate-900'
                  }`}>
                    Compartilhada
                  </span>
                  {modalidade === 'compartilhada' && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0" />
                  )}
                </div>
                <div>
                  <span className={`text-[10px] sm:text-[11px] font-black px-1.5 py-0.5 rounded-md inline-block ${
                    modalidade === 'compartilhada' 
                      ? 'bg-white text-blue-700 shadow-2xs' 
                      : 'bg-blue-50 text-blue-700 border border-blue-200/80'
                  }`}>
                    0,60 km
                  </span>
                </div>
              </button>

              {/* Opção Exclusiva */}
              <button
                type="button"
                id="btn-modalidade-exclusiva"
                onClick={() => {
                  setModalidade('exclusiva');
                  if (passageiros > 4) setPassageiros(4);
                }}
                className={`p-2 sm:p-2.5 rounded-xl text-left transition-all relative flex flex-col justify-center cursor-pointer border ${
                  modalidade === 'exclusiva'
                    ? 'bg-blue-600 border-blue-600 text-white shadow-xs ring-2 ring-blue-500/20'
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span className={`text-xs sm:text-sm font-black tracking-tight ${
                    modalidade === 'exclusiva' ? 'text-white' : 'text-slate-900'
                  }`}>
                    Exclusiva
                  </span>
                  {modalidade === 'exclusiva' && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0" />
                  )}
                </div>
                <div>
                  <span className={`text-[10px] sm:text-[11px] font-black px-1.5 py-0.5 rounded-md inline-block ${
                    modalidade === 'exclusiva' 
                      ? 'bg-white text-blue-700 shadow-2xs' 
                      : 'bg-amber-50 text-amber-800 border border-amber-200/80'
                  }`}>
                    2,4 km
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Endereços: Embarque, Destino e Botão Buscar na Barra */}
          <div className="bg-slate-100/90 border border-slate-200/90 p-2.5 sm:p-3 rounded-2xl space-y-2 shadow-2xs">
            <label className="text-[10px] uppercase tracking-wider text-slate-600 font-extrabold block">
              Endereços de Embarque e Destino
            </label>

            {/* Endereço de Embarque / Origem */}
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[9.5px] font-extrabold text-slate-600 uppercase flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                  Embarque (Origem)
                </span>
                <button
                  type="button"
                  onClick={handleUsarMinhaLocalizacao}
                  disabled={isLocating}
                  className="text-[9.5px] font-extrabold text-emerald-800 bg-emerald-100 hover:bg-emerald-200/80 border border-emerald-300 px-1.5 py-0.5 rounded-md flex items-center gap-1 transition-all active:scale-95 disabled:opacity-50"
                  title="Detectar meu endereço atual via GPS"
                >
                  {isLocating ? (
                    <Loader2 className="w-2.5 h-2.5 animate-spin text-emerald-700" />
                  ) : (
                    <LocateFixed className="w-2.5 h-2.5 text-emerald-700" />
                  )}
                  <span>{isLocating ? 'Buscando...' : 'Usar GPS'}</span>
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={origemCompleta}
                  onFocus={() => setFocoOrigem(true)}
                  onBlur={() => setTimeout(() => setFocoOrigem(false), 200)}
                  onChange={(e) => {
                    const val = e.target.value;
                    setOrigemCompleta(val);
                    setFocoOrigem(true);
                    const res = calcularDistanciaEntreLocais(val, destinoCompleto);
                    setDistanciaKm(res.distanciaKm);
                    if (res.cidadeOrigemDetectada) setCidadeOrigem(res.cidadeOrigemDetectada);
                  }}
                  placeholder="Ex: Rua São José, 142 - Centro, Água Doce do Norte"
                  className="w-full pl-2.5 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 transition-all shadow-xs"
                />

                {/* Sugestões de Embarque */}
                {focoOrigem && sugestoesOrigem.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-40 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden divide-y divide-slate-100 animate-in fade-in duration-100">
                    <div className="max-h-40 overflow-y-auto">
                      {sugestoesOrigem.map((sug) => (
                        <button
                          key={sug.id}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleSelecionarSugestaoOrigem(sug)}
                          className="w-full px-2.5 py-1.5 text-left hover:bg-blue-50/80 flex items-start gap-2 transition-colors"
                        >
                          <div className="mt-0.5 p-0.5 bg-slate-100 rounded shrink-0">
                            {renderIconeSugestao(sug.iconeTipo)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-800 truncate">{sug.titulo}</p>
                            <p className="text-[9.5px] text-slate-500 truncate">{sug.subtitulo}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Endereço de Destino */}
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[9.5px] font-extrabold text-slate-600 uppercase flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-600"></div>
                  Destino (Chegada)
                </span>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={destinoCompleto}
                  onFocus={() => setFocoDestino(true)}
                  onBlur={() => setTimeout(() => setFocoDestino(false), 200)}
                  onChange={(e) => {
                    const val = e.target.value;
                    setDestinoCompleto(val);
                    setFocoDestino(true);
                    const res = calcularDistanciaEntreLocais(origemCompleta, val);
                    setDistanciaKm(res.distanciaKm);
                    if (res.cidadeDestinoDetectada) setCidadeDestino(res.cidadeDestinoDetectada);
                  }}
                  placeholder="Ex: Av. Américo Buaiz, 200 - Enseada do Suá, Vitória"
                  className="w-full pl-2.5 pr-2.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 transition-all shadow-xs"
                />

                {/* Sugestões de Destino */}
                {focoDestino && sugestoesDestino.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-40 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden divide-y divide-slate-100 animate-in fade-in duration-100">
                    <div className="max-h-40 overflow-y-auto">
                      {sugestoesDestino.map((sug) => (
                        <button
                          key={sug.id}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleSelecionarSugestaoDestino(sug)}
                          className="w-full px-2.5 py-1.5 text-left hover:bg-emerald-50/80 flex items-start gap-2 transition-colors"
                        >
                          <div className="mt-0.5 p-0.5 bg-slate-100 rounded shrink-0">
                            {renderIconeSugestao(sug.iconeTipo)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-800 truncate">{sug.titulo}</p>
                            <p className="text-[9.5px] text-slate-500 truncate">{sug.subtitulo}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Status da Rota Compacto (se calculada) */}
            {rotaDefinida && (
              <div className="flex items-center justify-between p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 font-bold">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{distanciaKm} km rodados</span>
                </span>
                <span className="text-[10.5px] text-emerald-700 font-semibold truncate ml-1">
                  {cidadeOrigem || 'Origem'} ➔ {cidadeDestino || 'Destino'}
                </span>
              </div>
            )}

            {/* BOTÃO BUSCAR NA BARRA DE ENDEREÇO (Abre a Segunda Página) */}
            <button
              type="button"
              id="btn-buscar-corrida"
              onClick={handleBuscar}
              className="w-full mt-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-md shadow-blue-200 transition-all active:scale-[0.99] cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Buscar</span>
            </button>
          </div>

          {/* Erro de validação se houver */}
          {erroRota && (
            <div className="p-2 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[11px] font-bold flex items-center gap-1.5 animate-in fade-in">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>{erroRota}</span>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* ETAPA 2: HORÁRIO, PASSAGEIROS, MALAS E O VALOR DA CORRIDA */}
      {/* ========================================================= */}
      {etapaAtual === 2 && (
        <div className="space-y-2.5 animate-in fade-in duration-150">
          {/* Card Resumo da Viagem com botão para Voltar/Alterar */}
          <div className="bg-blue-50/90 border border-blue-200 rounded-xl p-2 sm:p-2.5 flex items-center justify-between shadow-2xs">
            <div className="min-w-0 pr-2">
              <div className="flex items-center gap-1 mb-0.5">
                <span className="text-[9.5px] font-black uppercase tracking-wider bg-blue-600 text-white px-1.5 py-0.2 rounded">
                  {modalidade === 'exclusiva' ? 'Exclusiva (2,4 km)' : 'Compartilhada (0,60 km)'}
                </span>
                <span className="text-[10px] font-extrabold text-blue-800">
                  {distanciaKm} km
                </span>
              </div>
              <p className="text-xs font-bold text-slate-800 truncate">
                {cidadeOrigem || 'Origem'} ➔ {cidadeDestino || 'Destino'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setEtapaAtual(1)}
              className="text-[10.5px] font-extrabold text-blue-700 bg-white hover:bg-blue-50 border border-blue-200 px-2 py-1 rounded-lg shadow-2xs shrink-0 cursor-pointer"
            >
              Alterar
            </button>
          </div>

          {/* Data e Horário da Viagem (Exclusiva ou Compartilhada) */}
          {modalidade === 'exclusiva' ? (
            <div className="bg-slate-100/90 border border-slate-200/90 p-2.5 rounded-xl space-y-2.5 shadow-2xs">
              <label className="text-[10px] uppercase tracking-wider text-slate-600 font-extrabold block">
                Data e Horário de Saída (Viagem Exclusiva)
              </label>

              {/* Escolha da Data: Hoje, Amanhã ou Outra Data */}
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  id="btn-exclusiva-hoje"
                  onClick={() => setModoAgendamento('hoje')}
                  className={`py-1.5 px-2 text-xs font-extrabold rounded-lg transition-all flex items-center justify-center cursor-pointer ${
                    modoAgendamento === 'hoje'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>Hoje</span>
                </button>

                <button
                  type="button"
                  id="btn-exclusiva-amanha"
                  onClick={() => setModoAgendamento('amanha')}
                  className={`py-1.5 px-2 text-xs font-extrabold rounded-lg transition-all flex items-center justify-center cursor-pointer ${
                    modoAgendamento === 'amanha'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>Amanhã</span>
                </button>

                <button
                  type="button"
                  id="btn-exclusiva-agendar"
                  onClick={() => setModoAgendamento('agendar')}
                  className={`py-1.5 px-2 text-xs font-extrabold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    modoAgendamento === 'agendar'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Calendar className="w-3 h-3" />
                  <span>Outra Data</span>
                </button>
              </div>

              {modoAgendamento === 'agendar' && (
                <input
                  type="date"
                  id="input-data-exclusiva"
                  value={dataAgendada}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setDataAgendada(e.target.value)}
                  className="w-full bg-white border border-blue-200 rounded-lg px-2.5 py-1.5 text-xs text-blue-900 font-bold focus:outline-none focus:border-blue-600"
                />
              )}

              {/* Horário de Saída livre para o passageiro escolher com clique intuitivo */}
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>Horário de Saída</span>
                  </label>
                  {horarioExclusivo && (
                    <button
                      type="button"
                      onClick={() => setHorarioExclusivo('')}
                      className="text-[10.5px] text-slate-400 hover:text-red-500 font-bold transition-colors cursor-pointer"
                    >
                      Limpar
                    </button>
                  )}
                </div>

                {/* Botão intuitivo: clica e abre o seletor visual com horas e minutos */}
                <button
                  type="button"
                  id="btn-abrir-seletor-horario"
                  onClick={() => setShowTimePicker(true)}
                  className={`w-full p-3 rounded-xl border-2 transition-all flex items-center justify-between cursor-pointer group text-left ${
                    horarioExclusivo
                      ? 'bg-blue-50/70 border-blue-300 hover:border-blue-500 hover:bg-blue-50'
                      : 'bg-slate-50 hover:bg-slate-100/90 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                      horarioExclusivo
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-200 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-600'
                    }`}>
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-500">
                        Hora pretendida de saída:
                      </div>
                      {horarioExclusivo ? (
                        <div className="text-base font-black text-blue-950 flex items-center gap-2">
                          <span>{horarioExclusivo}</span>
                          <span className="text-[10px] font-extrabold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-md border border-blue-200">
                            Selecionado
                          </span>
                        </div>
                      ) : (
                        <div className="text-xs font-black text-blue-600 flex items-center gap-1">
                          <span>Toque para escolher o horário</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-extrabold text-slate-500 group-hover:text-blue-700">
                    <span>{horarioExclusivo ? 'Alterar' : 'Escolher'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </button>
              </div>
            </div>
          ) : (
            /* COMPARTILHADA: TURNOS PRÉ-DEFINIDOS (06h-08h, 10h-14h, 14h-18h) */
            <div className="bg-slate-100/90 border border-slate-200/90 p-2.5 rounded-xl space-y-2 shadow-2xs">
              <label className="text-[10px] uppercase tracking-wider text-slate-600 font-extrabold block">
                Data e Turno da Viagem Compartilhada
              </label>

              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  id="btn-compartilhada-hoje"
                  onClick={() => setModoAgendamento('hoje')}
                  className={`py-1.5 px-2 text-xs font-extrabold rounded-lg transition-all flex items-center justify-center cursor-pointer ${
                    modoAgendamento === 'hoje'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>Hoje</span>
                </button>

                <button
                  type="button"
                  id="btn-compartilhada-amanha"
                  onClick={() => setModoAgendamento('amanha')}
                  className={`py-1.5 px-2 text-xs font-extrabold rounded-lg transition-all flex items-center justify-center cursor-pointer ${
                    modoAgendamento === 'amanha'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>Amanhã</span>
                </button>

                <button
                  type="button"
                  id="btn-compartilhada-agendar"
                  onClick={() => setModoAgendamento('agendar')}
                  className={`py-1.5 px-2 text-xs font-extrabold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    modoAgendamento === 'agendar'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Calendar className="w-3 h-3" />
                  <span>Outra Data</span>
                </button>
              </div>

              {modoAgendamento === 'agendar' && (
                <input
                  type="date"
                  value={dataAgendada}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setDataAgendada(e.target.value)}
                  className="w-full bg-white border border-blue-200 rounded-lg px-2.5 py-1 text-xs text-blue-900 font-bold focus:outline-none focus:border-blue-600"
                />
              )}

              {/* Turnos: Manhã (06h - 08h), Tarde (10h - 14h), Tarde (14h - 18h) */}
              <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                <button
                  type="button"
                  onClick={() => setTurnoHorario('manha')}
                  className={`py-1.5 px-1 rounded-lg text-center border transition-all flex flex-col items-center justify-center cursor-pointer ${
                    turnoHorario === 'manha'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs ring-1 ring-blue-600/30'
                      : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                  }`}
                >
                  <span className="text-xs">🌅</span>
                  <span className="text-[11px] font-black leading-tight">Manhã</span>
                  <span className={`text-[8.5px] ${turnoHorario === 'manha' ? 'text-blue-100' : 'text-slate-500'}`}>
                    06h - 08h
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setTurnoHorario('tarde')}
                  className={`py-1.5 px-1 rounded-lg text-center border transition-all flex flex-col items-center justify-center cursor-pointer ${
                    turnoHorario === 'tarde'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs ring-1 ring-blue-600/30'
                      : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                  }`}
                >
                  <span className="text-xs">☀️</span>
                  <span className="text-[11px] font-black leading-tight">Tarde</span>
                  <span className={`text-[8.5px] ${turnoHorario === 'tarde' ? 'text-blue-100' : 'text-slate-500'}`}>
                    10h - 14h
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setTurnoHorario('noite')}
                  className={`py-1.5 px-1 rounded-lg text-center border transition-all flex flex-col items-center justify-center cursor-pointer ${
                    turnoHorario === 'noite'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs ring-1 ring-blue-600/30'
                      : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                  }`}
                >
                  <span className="text-xs">🌤️</span>
                  <span className="text-[11px] font-black leading-tight">Tarde</span>
                  <span className={`text-[8.5px] ${turnoHorario === 'noite' ? 'text-blue-100' : 'text-slate-500'}`}>
                    14h - 18h
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* 4. Passageiros e Malas (apenas "Malas") */}
          <div className="grid grid-cols-2 gap-2">
            {/* Passageiros */}
            <div className="bg-slate-100/90 p-2 rounded-xl border border-slate-200/90 shadow-2xs">
              <div className="flex items-center gap-1 mb-1">
                <Users className="w-3 h-3 text-blue-600" />
                <label className="text-[9.5px] font-extrabold text-slate-700 uppercase block">Passageiros</label>
              </div>
              <div className="flex items-center justify-between bg-white px-2 py-0.5 rounded-lg border border-slate-200 shadow-xs">
                <button
                  type="button"
                  onClick={() => setPassageiros(Math.max(1, passageiros - 1))}
                  className="w-6 h-6 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded text-xs font-black text-slate-800 transition-all active:scale-95 cursor-pointer"
                >
                  -
                </button>
                <span className="text-xs font-black text-slate-900">{passageiros}</span>
                <button
                  type="button"
                  onClick={() => setPassageiros(Math.min(modalidade === 'exclusiva' ? 4 : 4, passageiros + 1))}
                  className="w-6 h-6 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded text-xs font-black text-slate-800 transition-all active:scale-95 cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Malas (Apenas Malas conforme solicitado) */}
            <div className="bg-slate-100/90 p-2 rounded-xl border border-slate-200/90 shadow-2xs">
              <div className="flex items-center gap-1 mb-1">
                <Briefcase className="w-3 h-3 text-blue-600" />
                <label className="text-[9.5px] font-extrabold text-slate-700 uppercase block">Malas</label>
              </div>
              <div className="flex items-center justify-between bg-white px-2 py-0.5 rounded-lg border border-slate-200 shadow-xs">
                <button
                  type="button"
                  onClick={() => setMalas(Math.max(0, malas - 1))}
                  className="w-6 h-6 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded text-xs font-black text-slate-800 transition-all active:scale-95 cursor-pointer"
                >
                  -
                </button>
                <span className="text-xs font-black text-blue-600">{malas}</span>
                <button
                  type="button"
                  onClick={() => setMalas(Math.min(8, malas + 1))}
                  className="w-6 h-6 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded text-xs font-black text-slate-800 transition-all active:scale-95 cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* VALOR DA CORRIDA (Aparece em destaque aqui na Etapa 2) */}
          <div className="bg-blue-50/90 border-2 border-blue-200 rounded-xl p-2.5 flex items-center justify-between shadow-2xs">
            <div>
              <span className="text-[9.5px] font-extrabold text-blue-800 uppercase block">
                Valor da Corrida ({modalidade === 'exclusiva' ? 'Exclusiva' : 'Compartilhada'})
              </span>
              <div className="text-lg sm:text-xl font-black text-slate-900 leading-none mt-0.5">
                R$ {valorTotal.toFixed(2).replace('.', ',')}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[9.5px] font-extrabold text-emerald-800 bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 rounded-md inline-block">
                Pago no Embarque
              </span>
              <span className="text-[9px] text-slate-500 font-medium block mt-0.5">
                Tarifa: R$ {precoPorKmAtual.toFixed(2).replace('.', ',')} / km
              </span>
            </div>
          </div>

          {/* Ações da Etapa 2: Voltar e Continuar */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setEtapaAtual(1)}
              className="py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar</span>
            </button>

            <button
              type="button"
              id="btn-confirmar-e-solicitar"
              onClick={handleContinuar}
              className="flex-1 font-extrabold py-2.5 rounded-xl transition-all uppercase tracking-wider text-xs flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200 active:scale-[0.99] cursor-pointer"
            >
              <Car className="w-4 h-4" />
              <span>Chamar Motorista</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal de Envio e Verificação de Documentos do Passageiro */}
      <PassageiroDocumentosModal
        isOpen={showDocModal}
        onClose={() => setShowDocModal(false)}
      />

      {/* Modal Intuitivo de Escolha de Horário */}
      <TimePickerModal
        isOpen={showTimePicker}
        onClose={() => setShowTimePicker(false)}
        initialValue={horarioExclusivo}
        onSelectTime={(timeStr) => setHorarioExclusivo(timeStr)}
        title="Escolha o Horário de Saída"
      />
    </div>
  );
};
