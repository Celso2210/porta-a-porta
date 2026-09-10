import React from 'react';
import { 
  Car, 
  MapPin, 
  Users, 
  Clock, 
  CheckCircle2, 
  UserCheck, 
  MessageCircle, 
  Phone, 
  Trash2, 
  Sparkles, 
  Search, 
  Loader2,
  Crown,
  Lock,
  AlertTriangle
} from 'lucide-react';
import { SolicitacaoViagem } from '../../types';
import { CIDADES_MOCK } from '../../data/mockData';

export interface PassageiroReservadoItem {
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
}

interface MotoristaReservasTabProps {
  passageirosReservados: PassageiroReservadoItem[];
  vagasDesejadasFiltro: number;
  origemFiltro: string;
  setOrigemFiltro: (cidade: string) => void;
  destinoFiltro: string;
  setDestinoFiltro: (cidade: string) => void;
  turnoHorario: 'todos' | 'manha' | 'tarde' | 'noite';
  setTurnoHorario: (turno: 'todos' | 'manha' | 'tarde' | 'noite') => void;
  isSearching: boolean;
  onSearch: () => void;
  passageirosDisponiveis: SolicitacaoViagem[];
  onAceitarPassageiro: (sol: SolicitacaoViagem) => void;
  onDesfazerAceite: (solicitacaoId: string, nome: string) => void;
  onSimularCelso: () => void;
  onSimularPassageiro: (
    nome?: string, 
    telefone?: string, 
    origem?: string, 
    destino?: string, 
    valor?: number, 
    modalidade?: 'compartilhada' | 'exclusiva'
  ) => void;
}

export const MotoristaReservasTab: React.FC<MotoristaReservasTabProps> = ({
  passageirosReservados,
  vagasDesejadasFiltro,
  origemFiltro,
  setOrigemFiltro,
  destinoFiltro,
  setDestinoFiltro,
  turnoHorario,
  setTurnoHorario,
  isSearching,
  onSearch,
  passageirosDisponiveis,
  onAceitarPassageiro,
  onDesfazerAceite,
  onSimularCelso,
  onSimularPassageiro
}) => {
  // Verifica se o motorista já tem uma viagem exclusiva ativa
  const viagemExclusivaAtiva = passageirosReservados.find(p => p.modalidade === 'exclusiva');
  const temViagemExclusiva = !!viagemExclusivaAtiva;
  const temPassageirosCompartilhados = passageirosReservados.some(p => p.modalidade !== 'exclusiva');

  return (
    <div className="space-y-6">
      {/* =========================================================================
          BANNER DE VIAGEM EXCLUSIVA ATIVA (CARRO FECHADO)
          ========================================================================= */}
      {temViagemExclusiva && (
        <div className="bg-amber-500/15 border-2 border-amber-500/40 rounded-3xl p-5 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-md shadow-amber-500/20">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-amber-300 font-black text-base sm:text-lg">
                  ⭐ Viagem Exclusiva Ativa (Carro Fechado)
                </h3>
                <span className="text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Carro 100% Exclusivo
                </span>
              </div>
              <p className="text-xs sm:text-sm text-amber-200/90 mt-1 font-medium max-w-2xl">
                Seu veículo está reservado exclusivamente para <strong className="text-white">{viagemExclusivaAtiva?.nome}</strong> ({viagemExclusivaAtiva?.origem} ➔ {viagemExclusivaAtiva?.destino}). Como esta viagem é exclusiva, você não pode pegar mais nenhum outro passageiro.
              </p>
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-2 bg-slate-800 px-4 py-2.5 rounded-2xl border border-amber-500/40 text-xs font-bold text-amber-300 shadow-sm">
            <Lock className="w-4 h-4 text-amber-400" />
            <span>Novas Vagas Bloqueadas</span>
          </div>
        </div>
      )}

      {/* =========================================================================
          SEÇÃO 1: PASSAGEIROS RESERVADOS (A MINHA RESERVA / ACEITOS)
          ========================================================================= */}
      <div className="bg-slate-800 border border-slate-700 rounded-3xl p-5 sm:p-6 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                Passageiros Reservados ({passageirosReservados.length})
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Passageiros que reservaram corrida com você ou que você aceitou.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs bg-slate-700/80 border border-slate-600 px-3 py-1.5 rounded-xl text-slate-200 font-bold">
              {temViagemExclusiva 
                ? `⭐ Carro Fechado (${vagasDesejadasFiltro} vagas ocupadas exclusivamente)`
                : `${passageirosReservados.length} de ${vagasDesejadasFiltro} vagas ocupadas`
              }
            </span>
          </div>
        </div>

        {/* Lista dos Passageiros Reservados: Linhas finas e bem separadas */}
        {passageirosReservados.length > 0 ? (
          <div className="space-y-2.5">
            {passageirosReservados.map((item) => {
              const isItemExclusivo = item.modalidade === 'exclusiva';
              const telefoneLimpo = item.telefone.replace(/\D/g, '');
              const textoWhatsApp = encodeURIComponent(
                `Olá ${item.nome}! Sou o motorista José do Porta a Porta. Sua corrida ${isItemExclusivo ? 'exclusiva ' : ''}de ${item.origem} para ${item.destino} está reservada e confirmada. Me envie sua localização para combinarmos o embarque!`
              );

              return (
                <div
                  key={item.id}
                  className={`p-3 sm:py-2.5 sm:px-4 rounded-xl border transition-all shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                    isItemExclusivo 
                      ? 'bg-amber-500/15 hover:bg-amber-500/20 border-amber-500/40' 
                      : 'bg-slate-700/70 hover:bg-slate-700 border-slate-600'
                  }`}
                >
                  {/* Dados do Passageiro Reservado em Linha Fina */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`w-8 h-8 rounded-lg font-bold flex items-center justify-center shrink-0 text-xs shadow-xs ${
                      isItemExclusivo 
                        ? 'bg-amber-500 text-slate-950 shadow-amber-500/20' 
                        : 'bg-emerald-500 text-slate-950 shadow-emerald-500/20'
                    }`}>
                      {item.nome.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2.5 flex-wrap">
                      <span className="font-bold text-white text-sm whitespace-nowrap">
                        {item.nome}
                      </span>

                      {isItemExclusivo ? (
                        <span className="text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full whitespace-nowrap flex items-center gap-1">
                          <Crown className="w-3 h-3 text-amber-400" />
                          Viagem Exclusiva, Carro Fechado
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium bg-blue-500/20 text-blue-300 border border-blue-500/40 px-2 py-0.5 rounded-full whitespace-nowrap flex items-center gap-1">
                          <Users className="w-3 h-3 text-blue-400" />
                          Compartilhada
                        </span>
                      )}

                      <span className="text-[11px] text-slate-300 font-medium bg-slate-800 border border-slate-600 px-2 py-0.5 rounded-md whitespace-nowrap">
                        {item.horario} • {isItemExclusivo ? 'Carro Inteiro' : `${item.vagas} vaga(s)`}
                      </span>

                      <div className="flex items-center gap-1 text-xs text-slate-300 font-medium whitespace-nowrap">
                        <span className="text-white font-semibold">{item.origem}</span>
                        <span className="text-emerald-400 font-bold">➔</span>
                        <span className="text-white font-semibold">{item.destino}</span>
                      </div>

                      {item.enderecoEmbarque && (
                        <span className="text-[11px] text-slate-400 truncate max-w-[200px] hidden xl:inline">
                          • {item.enderecoEmbarque}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Valor e Ações de Contato Direto */}
                  <div className="flex items-center justify-between md:justify-end gap-2.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-600/80">
                    <div className="text-left md:text-right mr-1">
                      <span className="text-[10px] text-slate-400 block font-medium leading-none">
                        {isItemExclusivo ? 'Total Fechado' : 'Passagem'}
                      </span>
                      <span className={`text-sm sm:text-base font-black ${isItemExclusivo ? 'text-amber-400' : 'text-emerald-400'}`}>
                        R$ {item.valor.toFixed(2).replace('.', ',')}
                      </span>
                    </div>

                    {/* Botão WhatsApp */}
                    <a
                      href={`https://wa.me/55${telefoneLimpo}?text=${textoWhatsApp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer whitespace-nowrap"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-slate-950" />
                      <span>WhatsApp</span>
                    </a>

                    {/* Botão Ligar */}
                    <a
                      href={`tel:${telefoneLimpo}`}
                      className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1 transition-all border border-slate-600 active:scale-95 whitespace-nowrap"
                    >
                      <Phone className="w-3.5 h-3.5 text-slate-300" />
                      <span>Ligar</span>
                    </a>

                    {/* Botão Liberar Vaga */}
                    <button
                      type="button"
                      onClick={() => onDesfazerAceite(item.solicitacaoId, item.nome)}
                      title="Liberar vaga e retornar passageiro para a lista de disponíveis"
                      className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 font-bold text-xs transition-all border border-slate-600 hover:border-rose-500/40 active:scale-95 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center space-y-3 bg-slate-700/40 rounded-2xl border border-slate-600">
            <Car className="w-10 h-10 text-slate-500 mx-auto" />
            <h4 className="text-white font-bold text-sm">Nenhum passageiro reservado no momento</h4>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              Pesquise passageiros na sua rota abaixo e clique em <strong>Aceitar Passageiro</strong> para preencher seu carro.
            </p>
            <button
              type="button"
              onClick={onSimularCelso}
              className="mt-2 py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs border border-emerald-500/40 transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>+ Adicionar Reserva de Celso (Vitória da Conquista)</span>
            </button>
          </div>
        )}
      </div>

      {/* =========================================================================
          SEÇÃO 2: PESQUISAR PASSAGEIROS NA ROTA
          ========================================================================= */}
      <div className="bg-slate-800 border border-slate-700 rounded-3xl p-5 sm:p-6 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-slate-700 pb-3">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <Search className="w-5 h-5 text-emerald-400" />
              <span>Pesquisar Passageiros na Rota</span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Informe as cidades e o horário para localizar passageiros aguardando viagem.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setOrigemFiltro('Todas');
              setDestinoFiltro('Todas');
              setTurnoHorario('todos');
            }}
            className="text-xs text-slate-300 hover:text-white font-bold px-3 py-1.5 rounded-lg bg-slate-700/80 hover:bg-slate-700 transition-colors cursor-pointer border border-slate-600"
          >
            Ver Todas as Cidades
          </button>
        </div>

        {/* Campos de Busca Padronizados */}
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
              className="w-full px-3 py-2.5 bg-slate-700/70 border border-slate-600 rounded-xl text-white text-xs font-bold focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
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
              className="w-full px-3 py-2.5 bg-slate-700/70 border border-slate-600 rounded-xl text-white text-xs font-bold focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
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
              className="w-full px-3 py-2.5 bg-slate-700/70 border border-slate-600 rounded-xl text-white text-xs font-bold focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="todos" className="bg-slate-800 text-white">Todos os Horários</option>
              <option value="manha" className="bg-slate-800 text-white">Manhã (06h às 12h)</option>
              <option value="tarde" className="bg-slate-800 text-white">Tarde (12h às 18h)</option>
              <option value="noite" className="bg-slate-800 text-white">Noite (18h às 23h)</option>
            </select>
          </div>
        </div>

        {/* Botão de Busca */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <span className="text-xs text-slate-300">
            Mostrando passageiros para: <strong className="text-white">{origemFiltro} ➔ {destinoFiltro}</strong>
          </span>

          <button
            type="button"
            onClick={onSearch}
            disabled={isSearching}
            className="py-2.5 px-6 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>Pesquisando...</span>
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
          SEÇÃO 3: LISTA DE PASSAGEIROS DISPONÍVEIS (TIPO E-MAIL, PADRONIZADA)
          ========================================================================= */}
      <div className="bg-slate-800 border border-slate-700 rounded-3xl overflow-hidden shadow-md">
        {/* Header da Lista Estilo Inbox de E-mail */}
        <div className="p-4 sm:px-6 bg-slate-900/60 border-b border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <Users className="w-4 h-4 text-emerald-400" />
            <h3 className="font-black text-white text-sm sm:text-base">
              Passageiros Disponíveis na Rota
            </h3>
            <span className="bg-emerald-500/20 text-emerald-300 font-extrabold text-xs px-2.5 py-0.5 rounded-full border border-emerald-500/40">
              {passageirosDisponiveis.length} aguardando
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => onSimularPassageiro('Passageiro Compartilhado', '(27) 99888-1122', undefined, undefined, 45.00, 'compartilhada')}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-blue-300 border border-blue-500/40 px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span>+ Simular Compartilhada</span>
            </button>

            <button
              type="button"
              onClick={() => onSimularPassageiro('Passageiro Exclusivo', '(27) 99777-9900', undefined, undefined, 180.00, 'exclusiva')}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>+ Simular Exclusiva</span>
            </button>
          </div>
        </div>

        {/* Linhas Estilo Caixa de E-mail: Linhas finas e com separação clara */}
        {passageirosDisponiveis.length > 0 ? (
          <div className="p-3 sm:p-4 space-y-2.5">
            {passageirosDisponiveis.map((sol) => {
              const isExclusiva = sol.modalidade === 'exclusiva';

              return (
                <div
                  key={sol.id}
                  id={`item-passageiro-disponivel-${sol.id}`}
                  className={`p-3 sm:py-2.5 sm:px-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                    isExclusiva 
                      ? 'bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/40 shadow-xs' 
                      : 'bg-slate-700/70 hover:bg-slate-700 border-slate-600 shadow-xs'
                  }`}
                >
                  {/* Informações em Linha Fina (Tipo E-mail) */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Avatar compacto */}
                    <div className={`w-8 h-8 rounded-lg font-bold flex items-center justify-center shrink-0 text-xs border ${
                      isExclusiva 
                        ? 'bg-amber-500 text-slate-950 border-amber-400/50 shadow-xs' 
                        : 'bg-slate-800 text-slate-200 border-slate-600'
                    }`}>
                      {sol.passageiroNome.charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2.5 flex-wrap">
                      <span className="font-bold text-white text-sm whitespace-nowrap">
                        {sol.passageiroNome}
                      </span>

                      {/* Tag Fina de Modalidade */}
                      {isExclusiva ? (
                        <span className="text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full inline-flex items-center gap-1 whitespace-nowrap">
                          <Crown className="w-3 h-3 text-amber-400" />
                          Viagem Exclusiva, Carro Fechado
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium bg-blue-500/20 text-blue-300 border border-blue-500/40 px-2 py-0.5 rounded-full inline-flex items-center gap-1 whitespace-nowrap">
                          <Users className="w-3 h-3 text-blue-400" />
                          Compartilhada ({sol.qtdPassageiros} vaga{sol.qtdPassageiros > 1 ? 's' : ''})
                        </span>
                      )}

                      {/* Horário */}
                      <span className="text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-600 px-2 py-0.5 rounded-md whitespace-nowrap">
                        {sol.horarioDesejado || '08:00'}
                      </span>

                      {/* Trajeto */}
                      <div className="flex items-center gap-1 text-xs text-slate-300 font-medium whitespace-nowrap">
                        <span className="text-white font-semibold">{sol.cidadeOrigem}</span>
                        <span className="text-emerald-400 font-bold">➔</span>
                        <span className="text-white font-semibold">{sol.cidadeDestino}</span>
                      </div>

                      {/* Detalhe enxuto */}
                      {sol.enderecoEmbarque && (
                        <span className="text-[11px] text-slate-400 truncate max-w-[220px] hidden xl:inline">
                          • {sol.enderecoEmbarque}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Lado Direito: Valor + Botão de Aceite */}
                  <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-600/80">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] text-slate-400 block font-medium leading-none">
                        {isExclusiva ? 'Total Fechado' : 'Passagem'}
                      </span>
                      <span className={`text-sm sm:text-base font-black ${isExclusiva ? 'text-amber-400' : 'text-emerald-400'}`}>
                        R$ {sol.valorTotal.toFixed(2).replace('.', ',')}
                      </span>
                    </div>

                    {isExclusiva ? (
                      <button
                        type="button"
                        id={`btn-aceitar-exclusiva-${sol.id}`}
                        onClick={() => onAceitarPassageiro(sol)}
                        className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 active:scale-95 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer whitespace-nowrap"
                      >
                        <Crown className="w-3.5 h-3.5 text-slate-950" />
                        <span>Aceitar Passageiro Viagem Exclusiva</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        id={`btn-aceitar-compartilhada-${sol.id}`}
                        onClick={() => onAceitarPassageiro(sol)}
                        className="py-2 px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer whitespace-nowrap"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />
                        <span>Aceitar Passageiro</span>
                      </button>
                    )}
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
              Não há passageiros aguardando para a rota selecionada no momento.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setOrigemFiltro('Todas');
                  setDestinoFiltro('Todas');
                  setTurnoHorario('todos');
                }}
                className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors cursor-pointer border border-slate-600"
              >
                Ver Todas as Cidades
              </button>
              <button
                type="button"
                onClick={() => onSimularPassageiro('Celso', '(27) 99876-5432', undefined, undefined, 50.00, 'compartilhada')}
                className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs border border-emerald-500/40 transition-colors cursor-pointer"
              >
                + Adicionar Celso na Rota
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
