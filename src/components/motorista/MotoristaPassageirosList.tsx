import React from 'react';
import { 
  Users, 
  CheckCircle2, 
  PlusCircle, 
  Clock, 
  MapPin, 
  Check, 
  MessageCircle, 
  Phone, 
  Trash2, 
  Sparkles,
  Crown,
  Lock,
  AlertTriangle
} from 'lucide-react';
import { SolicitacaoViagem } from '../../types';
import { formatarTurnoEVagas, getTurnoLabel } from '../../services/turnoService';

interface MotoristaPassageirosListProps {
  muralView: 'disponiveis' | 'aceitos';
  setMuralView: (view: 'disponiveis' | 'aceitos') => void;
  origemFiltro: string;
  destinoFiltro: string;
  turnoHorario: 'manha' | 'tarde' | 'noite';
  vagasDesejadasFiltro: number;
  passageirosDisponiveis: SolicitacaoViagem[];
  passageirosAceitos: SolicitacaoViagem[];
  onAceitarPassageiro: (sol: SolicitacaoViagem) => void;
  onDesfazerAceite: (solId: string, nome: string) => void;
  onCriarChamadoSimulado: (
    nome?: string, 
    telefone?: string, 
    origem?: string, 
    destino?: string, 
    valor?: number,
    modalidade?: 'compartilhada' | 'exclusiva'
  ) => void;
  onResetFiltros: () => void;
}

export const MotoristaPassageirosList: React.FC<MotoristaPassageirosListProps> = ({
  muralView,
  setMuralView,
  origemFiltro,
  destinoFiltro,
  turnoHorario,
  passageirosDisponiveis,
  passageirosAceitos,
  onAceitarPassageiro,
  onDesfazerAceite,
  onCriarChamadoSimulado,
  onResetFiltros
}) => {
  const viagemExclusivaAceita = passageirosAceitos.find(s => s.modalidade === 'exclusiva');
  const temViagemExclusiva = !!viagemExclusivaAceita;
  const temPassageirosCompartilhados = passageirosAceitos.some(s => s.modalidade !== 'exclusiva');

  return (
    <div className="space-y-4">
      {/* Barra de Seleção Estilo Caixa de Entrada de E-mail */}
      <div className="bg-slate-800 border border-slate-700 p-2 sm:p-2.5 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2">
          {/* Aba 1: Passageiros Disponíveis para Aceitar (Azul Cobalto) */}
          <button
            type="button"
            id="tab-mural-disponiveis"
            onClick={() => setMuralView('disponiveis')}
            className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              muralView === 'disponiveis'
                ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Users className="w-4 h-4 text-blue-200" />
            <span>Passageiros no Radar</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
              muralView === 'disponiveis'
                ? 'bg-blue-900 text-white'
                : 'bg-slate-700 text-slate-300'
            }`}>
              {passageirosDisponiveis.length}
            </span>
          </button>

          {/* Aba 2: Passageiros Aceitos (Verde Esmeralda) */}
          <button
            type="button"
            id="tab-mural-aceitos"
            onClick={() => setMuralView('aceitos')}
            className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              muralView === 'aceitos'
                ? 'bg-emerald-500 text-slate-950 shadow-sm ring-2 ring-emerald-400/50'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-700 group-hover:text-slate-950" />
            <span>Passageiros que Aceitei</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
              muralView === 'aceitos'
                ? 'bg-slate-900 text-emerald-300'
                : passageirosAceitos.length > 0
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-slate-700 text-slate-400'
            }`}>
              {passageirosAceitos.length}
            </span>
          </button>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-2">
          {(origemFiltro !== 'Todas' || destinoFiltro !== 'Todas') && (
            <span className="text-[11px] text-emerald-300 font-bold bg-emerald-500/15 border border-emerald-500/40 px-2.5 py-1 rounded-lg truncate max-w-[200px]">
              {origemFiltro} ➔ {destinoFiltro}
            </span>
          )}

          <button
            type="button"
            id="btn-adicionar-celso-teste"
            onClick={() => onCriarChamadoSimulado('Celso', '(27) 99876-5432', origemFiltro === 'Todas' ? 'Água Doce do Norte' : origemFiltro, 'Vitória da Conquista', 50.00)}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 hover:text-emerald-300 text-xs font-bold rounded-xl border border-slate-600 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            title="Gera uma solicitação para Celso com destino a Vitória da Conquista"
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>+ Celso (Vitória da Conquista)</span>
          </button>
        </div>
      </div>

      {/* Visualização 1: Lista Simples de Passageiros Disponíveis para Aceitar */}
      {muralView === 'disponiveis' && (
        <div className="space-y-2">
          {passageirosDisponiveis.length === 0 ? (
            <div className="p-8 bg-slate-800 border border-slate-700 rounded-3xl text-center space-y-4 shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">Nenhum passageiro aguardando nesta rota no momento</h4>
                <p className="text-xs text-slate-300 max-w-md mx-auto mt-1">
                  Não encontramos solicitações de {origemFiltro} para {destinoFiltro} no turno {getTurnoLabel(turnoHorario)}. Experimente selecionar "Todas as Cidades" ou adicionar Celso para testar.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={onResetFiltros}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs rounded-xl border border-slate-600 transition-all cursor-pointer"
                >
                  Ver Todas as Cidades
                </button>
                <button
                  type="button"
                  onClick={() => onCriarChamadoSimulado('Celso', '(27) 99876-5432', 'Água Doce do Norte', 'Vitória da Conquista', 50.00)}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Adicionar Celso (Vitória da Conquista)</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {passageirosDisponiveis.map((sol) => {
                const isExclusiva = sol.modalidade === 'exclusiva';

                return (
                  <div
                    key={sol.id}
                    id={`item-passageiro-disponivel-${sol.id}`}
                    className={`p-3 sm:py-2.5 sm:px-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 overflow-hidden w-full ${
                      isExclusiva 
                        ? 'bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/40 shadow-xs' 
                        : 'bg-slate-800 hover:bg-slate-700/80 border-slate-700 shadow-xs'
                    }`}
                  >
                    {/* Informações em Linha Fina (Tipo E-mail) */}
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                      <div className={`w-8 h-8 rounded-lg font-bold flex items-center justify-center shrink-0 text-xs border ${
                        isExclusiva 
                          ? 'bg-amber-500 text-slate-950 border-amber-400/50 shadow-xs' 
                          : 'bg-slate-700 text-slate-200 border-slate-600'
                      }`}>
                        {sol.passageiroNome.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 flex-wrap">
                        <span className="font-bold text-white text-sm">{sol.passageiroNome}</span>
                        
                        {/* Tag Exclusiva ou Compartilhada */}
                        {isExclusiva ? (
                          <span className="text-[10.5px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            <Crown className="w-3 h-3 text-amber-400 shrink-0" />
                            <span>Viagem Exclusiva</span>
                          </span>
                        ) : (
                          <span className="text-[10.5px] font-medium bg-blue-500/20 text-blue-300 border border-blue-500/40 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            <Users className="w-3 h-3 text-blue-400 shrink-0" />
                            <span>Compartilhada ({sol.qtdPassageiros} vaga{sol.qtdPassageiros > 1 ? 's' : ''})</span>
                          </span>
                        )}

                        <span className="text-[10.5px] bg-slate-700 text-slate-300 border border-slate-600 font-medium px-2 py-0.5 rounded-md inline-flex items-center">
                          {formatarTurnoEVagas(sol.horarioDesejado, sol.qtdPassageiros, sol.modalidade === 'exclusiva')}
                        </span>

                        <div className="flex items-center gap-1 text-xs text-slate-300 font-medium flex-wrap">
                          <span className="text-white font-semibold">{sol.cidadeOrigem}</span>
                          <span className="text-emerald-400 font-bold shrink-0">➔</span>
                          <span className="text-white font-semibold">{sol.cidadeDestino}</span>
                        </div>

                        {sol.enderecoEmbarque && (
                          <span className="text-[11px] text-slate-400 truncate max-w-[220px] hidden xl:inline">
                            • {sol.enderecoEmbarque}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Valor da Passagem & Botão Aceitar Passageiro */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-700 w-full md:w-auto shrink-0">
                      <div className="flex items-center justify-between sm:flex-col sm:items-end gap-1">
                        <span className="text-[10px] text-slate-400 font-medium leading-none">
                          {isExclusiva ? 'Total Fechado' : 'Passagem'}
                        </span>
                        <span className={`text-base sm:text-lg font-black ${isExclusiva ? 'text-amber-400' : 'text-emerald-400'}`}>
                          R$ {sol.valorTotal.toFixed(2).replace('.', ',')}
                        </span>
                      </div>

                      {/* Botão de Aceite do Passageiro */}
                      {isExclusiva ? (
                        <button
                          type="button"
                          id={`btn-aceitar-passageiro-${sol.id}`}
                          onClick={() => onAceitarPassageiro(sol)}
                          className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Crown className="w-4 h-4 shrink-0" />
                          <span>Aceitar Viagem Exclusiva</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          id={`btn-aceitar-passageiro-${sol.id}`}
                          onClick={() => onAceitarPassageiro(sol)}
                          className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Check className="w-4 h-4 stroke-[3] shrink-0" />
                          <span>Aceitar Passageiro</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Visualização 2: Lista Simples de Passageiros Aceitos ("A Lista Dele") */}
      {muralView === 'aceitos' && (
        <div className="space-y-2">
          {passageirosAceitos.length === 0 ? (
            <div className="p-8 bg-slate-800 border border-slate-700 rounded-3xl text-center space-y-3 shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-slate-700 text-slate-400 flex items-center justify-center mx-auto border border-slate-600">
                <CheckCircle2 className="w-6 h-6 text-slate-400" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">Sua lista de passageiros aceitos está vazia</h4>
                <p className="text-xs text-slate-300 max-w-md mx-auto mt-1">
                  Você ainda não aceitou nenhum passageiro. Acesse a aba "Passageiros Disponíveis" e clique em "Aceitar Passageiro" para adicioná-los à sua lista.
                </p>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => setMuralView('disponiveis')}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Ver Passageiros Disponíveis
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-800 border border-slate-700 rounded-3xl overflow-hidden shadow-md divide-y divide-slate-700">
              {passageirosAceitos.map((sol) => {
                const isItemExclusivo = sol.modalidade === 'exclusiva';

                return (
                  <div
                    key={sol.id}
                    id={`item-passageiro-aceito-${sol.id}`}
                    className={`p-4 sm:px-5 sm:py-4 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                      isItemExclusivo 
                        ? 'bg-amber-500/15 hover:bg-amber-500/25 border-l-4 border-amber-500' 
                        : 'bg-slate-800 hover:bg-slate-700/80'
                    }`}
                  >
                    {/* Dados Simples: Nome, Destino, Horário, Endereço de Embarque */}
                    <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-base shrink-0 shadow-xs ${
                        isItemExclusivo 
                          ? 'bg-amber-500 text-slate-950 shadow-amber-500/20' 
                          : 'bg-emerald-500 text-slate-950 shadow-emerald-500/20'
                      }`}>
                        {sol.passageiroNome.charAt(0)}
                      </div>
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-white text-base tracking-tight">{sol.passageiroNome}</span>
                          
                          {isItemExclusivo ? (
                            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-wider">
                              <Crown className="w-3 h-3 text-amber-400" />
                              ⭐ Viagem Exclusiva (Carro Fechado)
                            </span>
                          ) : (
                            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              Aceito • Compartilhada
                            </span>
                          )}

                          <span className="text-[11px] bg-slate-700 text-slate-300 font-bold px-2 py-0.5 rounded-md border border-slate-600 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-emerald-400" />
                            {formatarTurnoEVagas(sol.horarioDesejado, sol.qtdPassageiros, sol.modalidade === 'exclusiva')}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="text-slate-400">{sol.cidadeOrigem}</span>
                          <span className="text-emerald-400 font-bold">➔</span>
                          <span className="font-bold text-white bg-slate-700 px-2.5 py-0.5 rounded-md border border-slate-600 text-xs">
                            {sol.cidadeDestino}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-300 flex items-center gap-2 flex-wrap">
                          <span className="text-slate-400">Embarque porta a porta:</span>
                          <span className="text-slate-200 font-semibold truncate max-w-[320px]">{sol.enderecoEmbarque}</span>
                        </div>
                      </div>
                    </div>

                  {/* Valor e Ações Rápidas: WhatsApp, Ligar e Cancelar Aceite */}
                  <div className="flex items-center justify-between md:justify-end gap-3 border-t md:border-t-0 border-slate-700 pt-2.5 md:pt-0 shrink-0">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Valor da Passagem</span>
                      <span className="text-base sm:text-lg font-black text-emerald-400">
                        R$ {sol.valorTotal.toFixed(2).replace('.', ',')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Entrar em contato via WhatsApp */}
                      <a
                        id={`btn-whatsapp-${sol.id}`}
                        href={`https://wa.me/55${sol.passageiroTelefone.replace(/\D/g, '')}?text=Ol%C3%A1%20${encodeURIComponent(sol.passageiroNome)}!%20Sou%20o%20motorista%20Jos%C3%A9%20do%20Porta%20a%20Porta.%20Aceitei%20sua%20viagem%20de%20${encodeURIComponent(sol.cidadeOrigem)}%20para%20${encodeURIComponent(sol.cidadeDestino)}%20%C3%A0s%20${encodeURIComponent(sol.horarioDesejado || '08:00')}.%20Por%20favor%2C%20me%20envie%20sua%20localiza%C3%A7%C3%A3o%20para%20combinarmos%20o%20embarque!`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
                        title="Entrar em contato pelo WhatsApp para combinar horário e localização"
                      >
                        <MessageCircle className="w-3.5 h-3.5 fill-slate-950" />
                        <span>WhatsApp</span>
                      </a>

                      {/* Ligar */}
                      <a
                        id={`btn-ligar-${sol.id}`}
                        href={`tel:${sol.passageiroTelefone.replace(/\D/g, '')}`}
                        className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600 text-xs font-bold rounded-xl transition-all flex items-center justify-center cursor-pointer"
                        title="Ligar para o passageiro"
                      >
                        <Phone className="w-3.5 h-3.5 text-slate-300" />
                      </a>

                      {/* Desfazer aceite / Devolver para disponíveis */}
                      <button
                        type="button"
                        id={`btn-cancelar-aceite-${sol.id}`}
                        onClick={() => onDesfazerAceite(sol.id, sol.passageiroNome)}
                        className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 border border-transparent hover:border-rose-500/40 rounded-xl transition-all cursor-pointer"
                        title="Desfazer aceite (devolver passageiro para a lista de disponíveis)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
