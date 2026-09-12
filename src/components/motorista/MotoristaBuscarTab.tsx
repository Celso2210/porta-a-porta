import React from 'react';
import { 
  Users, 
  Clock, 
  MapPin, 
  Search, 
  Loader2, 
  Crown, 
  CheckCircle2, 
  ArrowRight,
  UserCheck,
  AlertCircle,
  Calendar,
  Sparkles
} from 'lucide-react';
import { SolicitacaoViagem } from '../../types';
import { CIDADES_MOCK } from '../../data/mockData';
import { PassageiroReservadoItem } from './MotoristaReservasTab';
import { formatarTurnoEVagas } from '../../services/turnoService';
import { 
  getBotoesRapidosData, 
  classificarDataViagem, 
  InfoDataViagem 
} from '../../services/dataViagemService';

interface MotoristaBuscarTabProps {
  origemFiltro: string;
  setOrigemFiltro: (cidade: string) => void;
  destinoFiltro: string;
  setDestinoFiltro: (cidade: string) => void;
  turnoHorario: 'todos' | 'manha' | 'tarde' | 'noite';
  setTurnoHorario: (turno: 'todos' | 'manha' | 'tarde' | 'noite') => void;
  dataFiltro: string;
  setDataFiltro: (data: string) => void;
  isSearching: boolean;
  onSearch: (
    customOrigem?: string, 
    customDestino?: string, 
    customTurno?: 'todos' | 'manha' | 'tarde' | 'noite',
    customData?: string
  ) => void;
  hasSearched?: boolean;
  filtrosAplicados?: { 
    origem: string; 
    destino: string; 
    turno: string;
    dataFiltro?: string;
  } | null;
  passageirosDisponiveis: SolicitacaoViagem[];
  onAceitarPassageiro: (sol: SolicitacaoViagem) => void;
  onSimularPassageiro: (
    nome?: string, 
    telefone?: string, 
    origem?: string, 
    destino?: string, 
    valor?: number, 
    modalidade?: 'compartilhada' | 'exclusiva',
    dataSimulada?: string
  ) => void;
  passageirosReservados?: PassageiroReservadoItem[];
  onIrParaReservas?: () => void;
}

export const MotoristaBuscarTab: React.FC<MotoristaBuscarTabProps> = ({
  origemFiltro,
  setOrigemFiltro,
  destinoFiltro,
  setDestinoFiltro,
  turnoHorario,
  setTurnoHorario,
  dataFiltro = 'todas',
  setDataFiltro,
  isSearching,
  onSearch,
  hasSearched = false,
  filtrosAplicados,
  passageirosDisponiveis = [],
  onAceitarPassageiro,
  onSimularPassageiro,
  passageirosReservados = [],
  onIrParaReservas
}) => {
  const listaDisponiveis = Array.isArray(passageirosDisponiveis) ? passageirosDisponiveis : [];
  const listaReservados = Array.isArray(passageirosReservados) ? passageirosReservados : [];
  const temViagemExclusiva = listaReservados.some(p => p.modalidade === 'exclusiva');

  // Opções rápidas de 1 toque para datas (Hoje, Amanhã, Depois de amanhã)
  const botoesRapidos = getBotoesRapidosData();

  // Helper para rótulo legível da data aplicada no resumo
  const getRotuloDataAtiva = () => {
    const dataAtiva = filtrosAplicados?.dataFiltro || dataFiltro;
    if (!dataAtiva || dataAtiva === 'todas') return 'Todas as Datas';
    if (dataAtiva === 'hoje') {
      const b = botoesRapidos.find(x => x.id === 'hoje');
      return `Hoje (${b?.dataCurta || ''})`;
    }
    if (dataAtiva === 'amanha') {
      const b = botoesRapidos.find(x => x.id === 'amanha');
      return `Amanhã (${b?.dataCurta || ''})`;
    }
    // Formato ISO YYYY-MM-DD
    if (dataAtiva.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [ano, mes, dia] = dataAtiva.split('-');
      return `${dia}/${mes}/${ano}`;
    }
    return dataAtiva;
  };

  return (
    <div className="space-y-6">
      {/* Aviso se já tiver viagem exclusiva */}
      {temViagemExclusiva && (
        <div className="bg-amber-500/15 border-2 border-amber-500/40 rounded-2xl p-4 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 font-black">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-amber-300 text-sm block">
                Aviso: Seu veículo já possui uma Viagem Exclusiva (Carro Fechado)
              </span>
              <p className="text-xs text-amber-200/80">
                Para aceitar outros passageiros, finalize ou altere a reserva exclusiva na aba Reservas.
              </p>
            </div>
          </div>
          {onIrParaReservas && (
            <button
              type="button"
              onClick={onIrParaReservas}
              className="py-2 px-3.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Ver Minhas Reservas</span>
            </button>
          )}
        </div>
      )}

      {/* =========================================================================
          PAINEL DE BUSCA DE PASSAGEIROS NA ROTA (COM FILTRO DE DATAS)
          ========================================================================= */}
      <div className="bg-slate-800 border border-slate-700 rounded-3xl p-5 sm:p-6 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700 pb-3">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <Search className="w-5 h-5 text-emerald-400" />
              <span>Pesquisar Passageiros na Rota</span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Selecione as cidades, a <strong>data</strong> (Hoje, Amanhã ou Todas as datas) e o horário para localizar passageiros.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setOrigemFiltro('Todas');
                setDestinoFiltro('Todas');
                setTurnoHorario('todos');
                setDataFiltro('todas');
                onSearch('Todas', 'Todas', 'todos', 'todas');
              }}
              className="text-xs text-white font-bold px-3.5 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 transition-all cursor-pointer border-2 border-slate-500 shadow-xs"
            >
              Ver Todas as Rotas e Datas
            </button>
            {onIrParaReservas && (
              <button
                type="button"
                onClick={onIrParaReservas}
                className="text-xs text-emerald-300 hover:text-white font-bold px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 transition-all cursor-pointer border-2 border-emerald-500/60 shadow-xs flex items-center gap-1.5"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Ver Reservas ({listaReservados.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Linha 1: Origem, Destino e Horário */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Origem */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              <span>Origem</span>
            </label>
            <select
              value={origemFiltro}
              onChange={(e) => setOrigemFiltro(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-700 border-2 border-slate-500 rounded-xl text-white text-xs font-bold focus:outline-none focus:border-emerald-400 cursor-pointer shadow-inner"
            >
              <option value="" className="bg-slate-800 text-slate-300">Selecione a Origem...</option>
              <option value="Todas" className="bg-slate-800 text-white">Todas as Cidades de Origem</option>
              {CIDADES_MOCK.map((c) => (
                <option key={c.id} value={c.nome} className="bg-slate-800 text-white">{c.nome} - {c.uf}</option>
              ))}
            </select>
          </div>

          {/* Destino */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Destino</span>
            </label>
            <select
              value={destinoFiltro}
              onChange={(e) => setDestinoFiltro(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-700 border-2 border-slate-500 rounded-xl text-white text-xs font-bold focus:outline-none focus:border-emerald-400 cursor-pointer shadow-inner"
            >
              <option value="" className="bg-slate-800 text-slate-300">Selecione o Destino...</option>
              <option value="Todas" className="bg-slate-800 text-white">Todos os Destinos</option>
              {CIDADES_MOCK.map((c) => (
                <option key={c.id} value={c.nome} className="bg-slate-800 text-white">{c.nome} - {c.uf}</option>
              ))}
            </select>
          </div>

          {/* Turno */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Horário / Turno</span>
            </label>
            <select
              value={turnoHorario}
              onChange={(e) => setTurnoHorario(e.target.value as any)}
              className="w-full px-3 py-2.5 bg-slate-700 border-2 border-slate-500 rounded-xl text-white text-xs font-bold focus:outline-none focus:border-emerald-400 cursor-pointer shadow-inner"
            >
              <option value="todos" className="bg-slate-800 text-white">Todos os Horários</option>
              <option value="manha" className="bg-slate-800 text-white">Manhã (06h às 08h)</option>
              <option value="tarde" className="bg-slate-800 text-white">Tarde (10h às 14h)</option>
              <option value="noite" className="bg-slate-800 text-white">Tarde (14h às 18h)</option>
            </select>
          </div>
        </div>

        {/* Linha 2: SELETOR DE DATAS RÁPIDAS (Hoje, Amanhã, Todas as Datas, Calendário) */}
        <div className="space-y-2 pt-2 border-t border-slate-700/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>Data da Corrida</span>
              <span className="text-[11px] font-medium text-emerald-300">
                • Escolha o dia da viagem para planejar suas vagas antecipadas
              </span>
            </label>

            {/* Calendário para data específica */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400">Outra data:</span>
              <input
                type="date"
                id="input-data-filtro-especifica"
                value={dataFiltro.match(/^\d{4}-\d{2}-\d{2}$/) ? dataFiltro : ''}
                onChange={(e) => {
                  if (e.target.value) {
                    setDataFiltro(e.target.value);
                    if (hasSearched) {
                      onSearch(undefined, undefined, undefined, e.target.value);
                    }
                  }
                }}
                className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 border border-slate-500 rounded-xl text-white text-xs font-bold cursor-pointer focus:outline-none focus:border-emerald-400 transition-all shadow-inner"
                title="Escolha uma data específica no calendário"
              />
            </div>
          </div>

          {/* Botões Rápidos de 1 Toque: Hoje, Amanhã e Todas as Datas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {botoesRapidos.map((b) => {
              const isSelected = dataFiltro === b.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    setDataFiltro(b.id);
                    if (hasSearched) {
                      onSearch(undefined, undefined, undefined, b.id);
                    }
                  }}
                  className={`py-2 px-3 rounded-xl text-left border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-emerald-500/25 border-emerald-400 text-white shadow-xs ring-2 ring-emerald-400/20'
                      : 'bg-slate-700/80 hover:bg-slate-700 border-slate-600 text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 w-full">
                    <span className={`text-xs font-black ${isSelected ? 'text-emerald-300' : 'text-white'}`}>
                      {b.label}
                    </span>
                    <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-md ${
                      isSelected ? 'bg-emerald-400 text-slate-950' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {b.dataCurta}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                    {b.diaSemana}
                  </span>
                </button>
              );
            })}

            {/* Botão Todas as Datas */}
            <button
              type="button"
              onClick={() => {
                setDataFiltro('todas');
                if (hasSearched) {
                  onSearch(undefined, undefined, undefined, 'todas');
                }
              }}
              className={`py-2 px-3 rounded-xl text-left border-2 transition-all cursor-pointer flex flex-col justify-between ${
                dataFiltro === 'todas'
                  ? 'bg-blue-500/25 border-blue-400 text-white shadow-xs ring-2 ring-blue-400/20'
                  : 'bg-slate-700/80 hover:bg-slate-700 border-slate-600 text-slate-300 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between gap-1 w-full">
                <span className={`text-xs font-black ${dataFiltro === 'todas' ? 'text-blue-300' : 'text-white'}`}>
                  Todas as Datas
                </span>
                <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-md ${
                  dataFiltro === 'todas' ? 'bg-blue-400 text-slate-950' : 'bg-slate-800 text-slate-300'
                }`}>
                  Geral
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                Hoje, amanhã e todas
              </span>
            </button>
          </div>
        </div>

        {/* Botão de Busca & Indicador de Status */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-700">
          <span className="text-xs text-slate-300">
            {hasSearched ? (
              <>
                Filtrado: <strong className="text-white">
                  {(filtrosAplicados?.origem && filtrosAplicados.origem !== 'Todas') ? filtrosAplicados.origem : 'Qualquer Origem'} ➔ {(filtrosAplicados?.destino && filtrosAplicados.destino !== 'Todas') ? filtrosAplicados.destino : 'Qualquer Destino'}
                </strong>
                <span className="mx-1 text-slate-500">•</span>
                Data: <strong className="text-emerald-300">{getRotuloDataAtiva()}</strong>
                <span className="mx-1 text-slate-500">•</span>
                Turno: <strong className="text-amber-300">{filtrosAplicados?.turno === 'todos' ? 'Todos os Turnos' : filtrosAplicados?.turno}</strong>
              </>
            ) : (
              <>
                Defina o trajeto e a data acima e clique em <strong className="text-emerald-300">Pesquisar Passageiros</strong> para ver quem está agendado.
              </>
            )}
          </span>

          <button
            type="button"
            onClick={() => onSearch()}
            disabled={isSearching}
            className="w-full sm:w-auto py-2.5 px-6 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md border-2 border-emerald-300 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>Buscando Corridas...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                <span>Pesquisar Passageiros</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* =========================================================================
          RESULTADOS: PASSAGEIROS DISPONÍVEIS NA ROTA COM TAGS DE DATA CLARAS
          ========================================================================= */}
      <div className="bg-slate-800 border border-slate-700 rounded-3xl overflow-hidden shadow-md">
        <div className="p-4 sm:px-6 bg-slate-800/90 border-b border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <h3 className="font-black text-white text-sm sm:text-base">
              Passageiros Disponíveis na Rota
            </h3>
            {hasSearched ? (
              <span className={`font-extrabold text-xs px-2.5 py-0.5 rounded-full border ${
                listaDisponiveis.length > 0 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                  : 'bg-slate-700 text-slate-300 border-slate-600'
              }`}>
                {listaDisponiveis.length} {listaDisponiveis.length === 1 ? 'encontrado' : 'encontrados'}
              </span>
            ) : (
              <span className="bg-slate-700/80 text-slate-300 font-bold text-xs px-2.5 py-0.5 rounded-full border border-slate-600">
                Aguardando busca
              </span>
            )}
          </div>

          {/* Atalhos para simulação rápida de passageiros */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => onSimularPassageiro('Celso', '(27) 99876-5432', origemFiltro || undefined, destinoFiltro || undefined, 50.00, 'compartilhada', 'Hoje')}
              className="text-xs bg-slate-700 hover:bg-slate-600 text-emerald-300 border-2 border-emerald-400/60 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
              title="Adicionar uma passageiro para Hoje"
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>+ Celso (Hoje)</span>
            </button>

            <button
              type="button"
              onClick={() => onSimularPassageiro('Mariana Costa', '(27) 99777-1122', origemFiltro || undefined, destinoFiltro || undefined, 45.00, 'compartilhada', 'Amanhã')}
              className="text-xs bg-slate-700 hover:bg-slate-600 text-blue-300 border-2 border-blue-400/60 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
              title="Adicionar uma passageira com viagem para Amanhã"
            >
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span>+ Mariana (Amanhã)</span>
            </button>
          </div>
        </div>

        {/* Lista de Passageiros */}
        {!hasSearched ? (
          <div className="p-8 sm:p-12 text-center space-y-4 bg-slate-700/20">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-sm">
              <Search className="w-7 h-7 stroke-[2.5]" />
            </div>
            <div className="max-w-md mx-auto space-y-1.5">
              <h4 className="text-white font-black text-base sm:text-lg">
                Preencha os filtros e clique em Pesquisar
              </h4>
              <p className="text-xs sm:text-sm text-slate-300">
                Selecione as cidades e a <strong>data desejada (Hoje, Amanhã ou Todas as datas)</strong> para carregar as reservas.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onSearch()}
              className="py-2.5 px-6 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md border-2 border-emerald-300 inline-flex items-center gap-2 cursor-pointer transition-all"
            >
              <Search className="w-4 h-4 text-slate-950 stroke-[2.5]" />
              <span>Pesquisar Passageiros Agora</span>
            </button>
          </div>
        ) : listaDisponiveis.length > 0 ? (
          <div className="p-3 sm:p-4 space-y-2.5">
            {listaDisponiveis.map((sol) => {
              const isExclusiva = sol.modalidade === 'exclusiva';
              const infoData = classificarDataViagem(sol.dataViagem, sol.horarioDesejado);

              return (
                <div
                  key={sol.id}
                  id={`item-passageiro-disponivel-${sol.id}`}
                  className={`p-3 sm:py-3 sm:px-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 overflow-hidden w-full ${
                    isExclusiva 
                      ? 'bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/40 shadow-xs' 
                      : 'bg-slate-700/70 hover:bg-slate-700 border-slate-600 shadow-xs'
                  }`}
                >
                  {/* Informações do Passageiro */}
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                    {/* Avatar compacto */}
                    <div className={`w-9 h-9 rounded-xl font-bold flex items-center justify-center shrink-0 text-xs border ${
                      isExclusiva 
                        ? 'bg-amber-500 text-slate-950 border-amber-400/50 shadow-xs' 
                        : 'bg-slate-800 text-slate-200 border-slate-600'
                    }`}>
                      {sol.passageiroNome.charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 flex-wrap">
                      <span className="font-bold text-white text-sm">
                        {sol.passageiroNome}
                      </span>

                      {/* Tag de Data em Destaque Visível */}
                      <span className={`text-[10.5px] font-black px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1 shrink-0 ${infoData.corBadge.bg} ${infoData.corBadge.text} ${infoData.corBadge.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${infoData.corBadge.dot}`}></span>
                        <Calendar className="w-3 h-3 shrink-0" />
                        <span>{infoData.labelCompleto}</span>
                      </span>

                      {/* Tag de Modalidade */}
                      {isExclusiva ? (
                        <span className="text-[10.5px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full inline-flex items-center gap-1 shrink-0">
                          <Crown className="w-3 h-3 text-amber-400 shrink-0" />
                          <span>Viagem Exclusiva</span>
                        </span>
                      ) : (
                        <span className="text-[10.5px] font-medium bg-blue-500/20 text-blue-300 border border-blue-500/40 px-2 py-0.5 rounded-full inline-flex items-center gap-1 shrink-0">
                          <Users className="w-3 h-3 text-blue-400 shrink-0" />
                          <span>Compartilhada ({sol.qtdPassageiros} vaga{sol.qtdPassageiros > 1 ? 's' : ''})</span>
                        </span>
                      )}

                      {/* Horário Padronizado */}
                      <span className={`text-[10.5px] px-2 py-0.5 rounded-md inline-flex items-center shrink-0 ${
                        isExclusiva 
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                          : 'bg-slate-800 text-slate-300 border border-slate-600 font-medium'
                      }`}>
                        <Clock className="w-3 h-3 mr-1 text-slate-400" />
                        {formatarTurnoEVagas(sol.horarioDesejado, sol.qtdPassageiros, isExclusiva)}
                      </span>

                      {/* Trajeto */}
                      <div className="flex items-center gap-1 text-xs text-slate-300 font-medium flex-wrap">
                        <span className="text-white font-semibold">{sol.cidadeOrigem}</span>
                        <span className="text-emerald-400 font-bold shrink-0">➔</span>
                        <span className="text-white font-semibold">{sol.cidadeDestino}</span>
                      </div>

                      {/* Detalhe de Embarque */}
                      {sol.enderecoEmbarque && (
                        <span className="text-[11px] text-slate-400 truncate max-w-[220px] hidden xl:inline">
                          • {sol.enderecoEmbarque}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Lado Direito: Valor + Botão de Aceite */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-600/80 w-full md:w-auto shrink-0">
                    <div className="flex items-center justify-between sm:flex-col sm:items-end gap-1">
                      <span className="text-[10px] text-slate-400 font-medium leading-none">
                        {isExclusiva ? 'Total Fechado' : 'Passagem'}
                      </span>
                      <span className={`text-base sm:text-lg font-black ${isExclusiva ? 'text-amber-400' : 'text-emerald-400'}`}>
                        R$ {sol.valorTotal.toFixed(2).replace('.', ',')}
                      </span>
                    </div>

                    <button
                      type="button"
                      id={`btn-aceitar-passageiro-${sol.id}`}
                      onClick={() => onAceitarPassageiro(sol)}
                      className={`w-full sm:w-auto py-2 px-4 rounded-xl font-black text-xs transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer ${
                        isExclusiva
                          ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 border-2 border-amber-300'
                          : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 border-2 border-emerald-300'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isExclusiva ? 'Aceitar Exclusiva' : 'Aceitar Vaga'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center space-y-3 bg-slate-700/40">
            <Users className="w-10 h-10 text-slate-500 mx-auto" />
            <h4 className="text-white font-bold text-sm">Nenhum passageiro encontrado com estes filtros</h4>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              Não há passageiros agendados para a data ({getRotuloDataAtiva()}) ou rota selecionada no momento.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setOrigemFiltro('Todas');
                  setDestinoFiltro('Todas');
                  setTurnoHorario('todos');
                  setDataFiltro('todas');
                  onSearch('Todas', 'Todas', 'todos', 'todas');
                }}
                className="py-2.5 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs transition-all cursor-pointer border-2 border-slate-500 shadow-xs"
              >
                Ver Todas as Cidades e Datas
              </button>
              <button
                type="button"
                onClick={() => onSimularPassageiro('Celso', '(27) 99876-5432', origemFiltro || undefined, destinoFiltro || undefined, 50.00, 'compartilhada', dataFiltro === 'todas' ? 'Hoje' : dataFiltro)}
                className="py-2.5 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-emerald-300 font-bold text-xs border-2 border-emerald-400/60 transition-all cursor-pointer shadow-xs"
              >
                + Adicionar Passageiro nesta Data
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
