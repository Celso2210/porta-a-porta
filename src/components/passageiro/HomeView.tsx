import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Users, 
  Briefcase,
  Car, 
  ArrowRight,
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
  AlertCircle
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
    precoEstimado: number;
    taxaReserva: number;
    valorRestanteEmbarque: number;
    precoPorKmAplicado: number;
  }) => void;
  userName?: string;
}

export const HomeView: React.FC<HomeViewProps> = ({ 
  tariffConfig = { precoKmCompartilhada: 0.60, precoKmExclusiva: 2.40 }, 
  onSolicitar, 
  userName = 'Celso' 
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

  // Validações de preenchimento real dos pontos de partida e chegada
  const temOrigem = Boolean(origemCompleta.trim());
  const temDestino = Boolean(destinoCompleto.trim());
  const rotaDefinida = temOrigem && temDestino && distanciaKm > 0;

  // 3. Quando viajar (Hoje ou Agendado / Manhã ou Tarde)
  const [modoAgendamento, setModoAgendamento] = useState<'hoje' | 'agendar'>('hoje');
  const [turnoHorario, setTurnoHorario] = useState<'manha' | 'tarde' | 'noite'>('manha');
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

  const handleContinuar = () => {
    if (!temOrigem && !temDestino) {
      setErroRota('Por favor, informe o endereço de embarque e o endereço de destino para calcular a corrida.');
      return;
    }
    if (!temOrigem) {
      setErroRota('Por favor, informe o endereço de embarque (onde o motorista irá te buscar).');
      return;
    }
    if (!temDestino) {
      setErroRota('Por favor, informe o endereço de destino (para onde você deseja ir).');
      return;
    }
    if (!rotaDefinida) {
      setErroRota('Não foi possível calcular a rota. Por favor, verifique os endereços informados.');
      return;
    }

    setErroRota(null);

    const turnoLabel = turnoHorario === 'manha' 
      ? 'Manhã (06h às 12h)' 
      : turnoHorario === 'tarde' 
      ? 'Tarde (12h às 16h)' 
      : 'Noite (16h às 20h)';

    let agendamentoTexto = '';
    if (modoAgendamento === 'hoje') {
      agendamentoTexto = `Hoje: ${turnoLabel}`;
    } else {
      const parts = dataAgendada.split('-');
      const dataFormatada = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dataAgendada;
      agendamentoTexto = `${dataFormatada}: ${turnoLabel}`;
    }

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
      precoEstimado: valorTotal,
      taxaReserva,
      valorRestanteEmbarque,
      precoPorKmAplicado: precoPorKmAtual
    });
  };

  return (
    <div className="flex flex-col justify-between min-h-[600px] h-full p-4 sm:p-5 bg-gradient-to-b from-slate-100/90 via-slate-50 to-blue-50/30 text-slate-900 rounded-3xl border border-slate-200/90 shadow-md relative overflow-hidden space-y-4">
      <div className="space-y-4">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
          <div>
            <span className="text-xs font-black tracking-widest text-blue-600 uppercase flex items-center gap-1">
              <Car className="w-3.5 h-3.5" /> PORTA A PORTA
            </span>
            <h1 className="text-base sm:text-lg font-light text-slate-900 mt-0.5">
              Olá, <span className="font-extrabold text-blue-600">{userName}</span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowDocModal(true)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
                passDocs.statusGeral === 'aprovado'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
              }`}
              title="Clique para gerenciar foto e documento de identificação"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{passDocs.statusGeral === 'aprovado' ? 'Cadastro Verificado' : 'Validar Documentos'}</span>
            </button>

            {rotaDefinida ? (
              <span className="text-[10px] font-extrabold bg-blue-100/90 text-blue-800 px-2.5 py-1 rounded-full border border-blue-200/80 shadow-2xs animate-in fade-in">
                {distanciaKm} km
              </span>
            ) : (
              <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full border border-slate-200">
                Aguardando rota
              </span>
            )}
          </div>
        </div>

        {/* 1. O QUE A PESSOA ESCOLHE PRIMEIRO: COMPARTILHADA OU EXCLUSIVA */}
        <div>
          <label className="text-[11px] uppercase tracking-wider text-slate-700 font-extrabold mb-1.5 flex items-center justify-between">
            <span>1. Escolha o Tipo de Viagem</span>
            <span className="text-[10px] font-semibold text-slate-500 lowercase">toque para selecionar</span>
          </label>

          <div className="grid grid-cols-2 gap-2">
            {/* Opção Compartilhada */}
            <button
              type="button"
              onClick={() => setModalidade('compartilhada')}
              className={`p-2.5 sm:p-3 rounded-xl text-left transition-all relative flex flex-col justify-between ${
                modalidade === 'compartilhada'
                  ? 'bg-blue-600 border-2 border-blue-600 text-white shadow-sm ring-2 ring-blue-600/20'
                  : 'bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <span className={`text-xs sm:text-sm font-black ${modalidade === 'compartilhada' ? 'text-white' : 'text-slate-900'}`}>
                    Compartilhada
                  </span>
                  {modalidade === 'compartilhada' && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0" />
                  )}
                </div>
                <div className={`text-[11px] font-black px-1.5 py-0.5 rounded inline-block mb-1 ${
                  modalidade === 'compartilhada' ? 'bg-white text-blue-700 shadow-2xs' : 'bg-blue-100/80 text-blue-800'
                }`}>
                  R$ {precoKmCompartilhada.toFixed(2).replace('.', ',')} / km
                </div>
              </div>
              <p className={`text-[9.5px] font-medium leading-tight ${modalidade === 'compartilhada' ? 'text-blue-100' : 'text-slate-500'}`}>
                Passagem individual por vaga
              </p>
            </button>

            {/* Opção Exclusiva */}
            <button
              type="button"
              onClick={() => {
                setModalidade('exclusiva');
                if (passageiros > 4) setPassageiros(4);
              }}
              className={`p-2.5 sm:p-3 rounded-xl text-left transition-all relative flex flex-col justify-between ${
                modalidade === 'exclusiva'
                  ? 'bg-blue-600 border-2 border-blue-600 text-white shadow-sm ring-2 ring-blue-600/20'
                  : 'bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <span className={`text-xs sm:text-sm font-black ${modalidade === 'exclusiva' ? 'text-white' : 'text-slate-900'}`}>
                    Exclusiva
                  </span>
                  {modalidade === 'exclusiva' && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0" />
                  )}
                </div>
                <div className={`text-[11px] font-black px-1.5 py-0.5 rounded inline-block mb-1 ${
                  modalidade === 'exclusiva' ? 'bg-white text-blue-700 shadow-2xs' : 'bg-blue-100/80 text-blue-800'
                }`}>
                  R$ {precoKmExclusiva.toFixed(2).replace('.', ',')} / km
                </div>
              </div>
              <p className={`text-[9.5px] font-medium leading-tight ${modalidade === 'exclusiva' ? 'text-blue-100' : 'text-slate-500'}`}>
                Carro fechado (até 4 pessoas)
              </p>
            </button>
          </div>
        </div>

        {/* 2. ENDEREÇOS: EMBARQUE E DESEMBARQUE */}
        <div className="bg-slate-100/90 border border-slate-200/90 p-3.5 rounded-2xl space-y-3 shadow-2xs">
          <label className="text-[11px] uppercase tracking-wider text-slate-700 font-extrabold block">
            2. Endereços de Embarque e Chegada
          </label>

          {/* Endereço de Embarque / Origem */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-extrabold text-slate-600 uppercase flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                Endereço de Embarque (Origem)
              </span>
              <button
                type="button"
                onClick={handleUsarMinhaLocalizacao}
                disabled={isLocating}
                className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 hover:bg-emerald-200/80 border border-emerald-300 px-2 py-0.5 rounded-lg flex items-center gap-1 transition-all active:scale-95 disabled:opacity-50 shadow-2xs"
                title="Detectar meu endereço atual via GPS"
              >
                {isLocating ? (
                  <Loader2 className="w-3 h-3 animate-spin text-emerald-700" />
                ) : (
                  <LocateFixed className="w-3 h-3 text-emerald-700" />
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
                placeholder="Ex: Rua São José, 142 - Centro, Água Doce do Norte - ES"
                className="w-full pl-3 pr-9 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 transition-all shadow-xs"
              />
              <button
                type="button"
                onClick={handleUsarMinhaLocalizacao}
                disabled={isLocating}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-emerald-600"
              >
                <LocateFixed className="w-3.5 h-3.5" />
              </button>

              {/* Sugestões de Embarque */}
              {focoOrigem && sugestoesOrigem.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 z-40 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden divide-y divide-slate-100 animate-in fade-in duration-150">
                  <div className="px-3 py-1.5 bg-slate-50 flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <Search className="w-3 h-3 text-blue-600" /> Sugestões de Embarque
                    </span>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {sugestoesOrigem.map((sug) => (
                      <button
                        key={sug.id}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleSelecionarSugestaoOrigem(sug)}
                        className="w-full px-3 py-2 text-left hover:bg-blue-50/80 flex items-start gap-2 transition-colors"
                      >
                        <div className="mt-0.5 p-1 bg-slate-100 rounded-md shrink-0">
                          {renderIconeSugestao(sug.iconeTipo)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-800 truncate">{sug.titulo}</p>
                          <p className="text-[10px] text-slate-500 truncate">{sug.subtitulo}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Endereço de Desembarque / Chegada */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-extrabold text-slate-600 uppercase flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
                Endereço de Chegada (Destino)
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
                placeholder="Ex: Av. Américo Buaiz, 200 - Enseada do Suá, Vitória - ES"
                className="w-full pl-3 pr-3 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 transition-all shadow-xs"
              />

              {/* Sugestões de Chegada */}
              {focoDestino && sugestoesDestino.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 z-40 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden divide-y divide-slate-100 animate-in fade-in duration-150">
                  <div className="px-3 py-1.5 bg-slate-50 flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <Search className="w-3 h-3 text-emerald-600" /> Sugestões de Destino
                    </span>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {sugestoesDestino.map((sug) => (
                      <button
                        key={sug.id}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleSelecionarSugestaoDestino(sug)}
                        className="w-full px-3 py-2 text-left hover:bg-emerald-50/80 flex items-start gap-2 transition-colors"
                      >
                        <div className="mt-0.5 p-1 bg-slate-100 rounded-md shrink-0">
                          {renderIconeSugestao(sug.iconeTipo)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-800 truncate">{sug.titulo}</p>
                          <p className="text-[10px] text-slate-500 truncate">{sug.subtitulo}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Feedback de Status da Rota */}
          {rotaDefinida ? (
            <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-bold animate-in fade-in">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Distância: {distanciaKm} km rodados</span>
              </span>
              <span className="text-[11px] text-emerald-700 font-semibold truncate ml-2">
                {cidadeOrigem || 'Origem'} ➔ {cidadeDestino || 'Destino'}
              </span>
            </div>
          ) : temOrigem && !temDestino ? (
            <div className="flex items-center gap-1.5 p-2 bg-blue-50/80 border border-blue-200/80 rounded-xl text-[11px] text-blue-900 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Origem informada. Agora informe o endereço de chegada para calcularmos o valor.</span>
            </div>
          ) : !temOrigem && temDestino ? (
            <div className="flex items-center gap-1.5 p-2 bg-blue-50/80 border border-blue-200/80 rounded-xl text-[11px] text-blue-900 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Destino informado. Agora informe o endereço de embarque onde você está.</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Digite os endereços de embarque e destino para calcular a rota e o valor da corrida.</span>
            </div>
          )}
        </div>

        {/* 3. QUANDO: HOJE OU AGENDADO / MANHÃ OU TARDE */}
        <div className="bg-slate-100/90 border border-slate-200/90 p-3.5 rounded-2xl space-y-3 shadow-2xs">
          <label className="text-[11px] uppercase tracking-wider text-slate-700 font-extrabold block">
            3. Data e Horário da Viagem
          </label>

          {/* Escolha: Hoje ou Agendado */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setModoAgendamento('hoje')}
              className={`py-2 px-3 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                modoAgendamento === 'hoje'
                  ? 'bg-slate-900 text-white shadow-sm ring-2 ring-slate-900/20'
                  : 'bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>Hoje</span>
            </button>

            <button
              type="button"
              onClick={() => setModoAgendamento('agendar')}
              className={`py-2 px-3 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                modoAgendamento === 'agendar'
                  ? 'bg-slate-900 text-white shadow-sm ring-2 ring-slate-900/20'
                  : 'bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Agendar Outra Data</span>
            </button>
          </div>

          {modoAgendamento === 'agendar' && (
            <div className="p-2.5 bg-blue-50/90 border border-blue-200/90 rounded-xl animate-in fade-in duration-150">
              <label className="text-[10px] font-extrabold text-blue-900 uppercase block mb-1">
                Data Escolhida
              </label>
              <input
                type="date"
                value={dataAgendada}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setDataAgendada(e.target.value)}
                className="w-full bg-white border-2 border-blue-200 rounded-lg px-3 py-1.5 text-xs text-blue-900 font-bold focus:outline-none focus:border-blue-600 shadow-xs"
              />
            </div>
          )}

          {/* Seleção do Turno: Manhã ou Tarde (ou Noite) */}
          <div>
            <span className="text-[10px] font-extrabold text-slate-600 uppercase block mb-1.5">
              Turno Desejado:
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTurnoHorario('manha')}
                className={`py-2.5 px-2 rounded-xl text-center border transition-all flex flex-col items-center justify-center ${
                  turnoHorario === 'manha'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-600/20'
                    : 'bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200'
                }`}
              >
                <span className="text-sm">🌅</span>
                <span className="text-xs font-black mt-0.5">Manhã</span>
                <span className={`text-[9px] font-semibold ${turnoHorario === 'manha' ? 'text-blue-100' : 'text-slate-500'}`}>
                  06:00 - 12:00
                </span>
              </button>

              <button
                type="button"
                onClick={() => setTurnoHorario('tarde')}
                className={`py-2.5 px-2 rounded-xl text-center border transition-all flex flex-col items-center justify-center ${
                  turnoHorario === 'tarde'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-600/20'
                    : 'bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200'
                }`}
              >
                <span className="text-sm">☀️</span>
                <span className="text-xs font-black mt-0.5">Tarde</span>
                <span className={`text-[9px] font-semibold ${turnoHorario === 'tarde' ? 'text-blue-100' : 'text-slate-500'}`}>
                  12:00 - 16:00
                </span>
              </button>

              <button
                type="button"
                onClick={() => setTurnoHorario('noite')}
                className={`py-2.5 px-2 rounded-xl text-center border transition-all flex flex-col items-center justify-center ${
                  turnoHorario === 'noite'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-600/20'
                    : 'bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200'
                }`}
              >
                <span className="text-sm">🌙</span>
                <span className="text-xs font-black mt-0.5">Noite</span>
                <span className={`text-[9px] font-semibold ${turnoHorario === 'noite' ? 'text-blue-100' : 'text-slate-500'}`}>
                  16:00 - 20:00
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* 4. QUANTIDADE DE PASSAGEIROS E MALAS */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Passageiros */}
          <div className="bg-slate-100/90 p-3 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              <label className="text-[10px] font-extrabold text-slate-700 uppercase block">Passageiros</label>
            </div>
            <div className="flex items-center justify-between bg-white px-2 py-1 rounded-xl border-2 border-slate-200 shadow-xs">
              <button
                type="button"
                onClick={() => setPassageiros(Math.max(1, passageiros - 1))}
                className="w-7 h-7 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-black text-slate-800 transition-all active:scale-95"
              >
                -
              </button>
              <span className="text-sm font-black text-slate-900">{passageiros}</span>
              <button
                type="button"
                onClick={() => setPassageiros(Math.min(4, passageiros + 1))}
                className="w-7 h-7 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-black text-slate-800 transition-all active:scale-95"
              >
                +
              </button>
            </div>
          </div>

          {/* Malas */}
          <div className="bg-slate-100/90 p-3 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Briefcase className="w-3.5 h-3.5 text-blue-600" />
              <label className="text-[10px] font-extrabold text-slate-700 uppercase block">Malas / Bagagem</label>
            </div>
            <div className="flex items-center justify-between bg-white px-2 py-1 rounded-xl border-2 border-slate-200 shadow-xs">
              <button
                type="button"
                onClick={() => setMalas(Math.max(0, malas - 1))}
                className="w-7 h-7 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-black text-slate-800 transition-all active:scale-95"
              >
                -
              </button>
              <span className="text-sm font-black text-blue-600">{malas}</span>
              <button
                type="button"
                onClick={() => setMalas(Math.min(8, malas + 1))}
                className="w-7 h-7 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-black text-slate-800 transition-all active:scale-95"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER COM RESUMO DO VALOR & BOTÃO CONTINUAR (PULA PARA A PRÓXIMA PÁGINA) */}
      <div className="pt-2 border-t border-slate-200/80 space-y-3">
        {rotaDefinida ? (
          <div className="bg-blue-50/90 border border-blue-200/90 rounded-2xl p-3.5 flex items-center justify-between shadow-2xs animate-in fade-in">
            <div>
              <span className="text-[10px] font-extrabold text-blue-800 uppercase block">
                Valor Total Estimado ({modalidade === 'exclusiva' ? 'Exclusivo' : 'Compartilhado'})
              </span>
              <div className="text-xl font-black text-slate-900">
                R$ {valorTotal.toFixed(2).replace('.', ',')}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100/90 border border-emerald-200 px-2.5 py-1 rounded-lg block">
                Pago no Embarque
              </span>
              <span className="text-[9px] text-slate-500 font-medium mt-0.5 block">
                {distanciaKm} km rodados
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-slate-100 border border-slate-200/90 rounded-2xl p-3.5 flex items-center justify-between shadow-2xs">
            <div>
              <span className="text-[10px] font-extrabold text-slate-500 uppercase block">
                Valor Total Estimado ({modalidade === 'exclusiva' ? 'Exclusivo' : 'Compartilhado'})
              </span>
              <div className="text-base font-black text-slate-400">
                --
              </div>
              <span className="text-[10px] text-slate-500 font-medium">
                Informe a origem e o destino para calcular o valor
              </span>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] font-bold text-slate-700 bg-white border border-slate-200 px-2 py-1 rounded-lg block shadow-2xs">
                Tarifa: R$ {precoPorKmAtual.toFixed(2).replace('.', ',')} / km
              </span>
              <span className="text-[9px] text-slate-400 font-medium mt-0.5 block">
                {modalidade === 'compartilhada' ? `${passageiros} passageiro(s)` : 'Carro exclusivo'}
              </span>
            </div>
          </div>
        )}

        {erroRota && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{erroRota}</span>
          </div>
        )}

        <button
          type="button"
          onClick={handleContinuar}
          disabled={!rotaDefinida}
          className={`w-full font-extrabold py-4 rounded-2xl transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2 ${
            rotaDefinida
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 active:scale-[0.99] cursor-pointer'
              : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed shadow-none'
          }`}
        >
          <span>{rotaDefinida ? 'Continuar' : 'Informe Origem e Destino para Continuar'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Modal de Envio e Verificação de Documentos do Passageiro */}
      <PassageiroDocumentosModal
        isOpen={showDocModal}
        onClose={() => setShowDocModal(false)}
      />
    </div>
  );
};
