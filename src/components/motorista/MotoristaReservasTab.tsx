import React from 'react';
import { 
  Car, 
  Users, 
  UserCheck, 
  MessageCircle, 
  Phone, 
  Trash2, 
  Sparkles, 
  Search, 
  Crown, 
  Lock,
  ArrowRight,
  Calendar
} from 'lucide-react';
import { formatarTurnoEVagas } from '../../services/turnoService';
import { classificarDataViagem } from '../../services/dataViagemService';

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
  dataViagem?: string;
}

interface MotoristaReservasTabProps {
  passageirosReservados: PassageiroReservadoItem[];
  vagasDesejadasFiltro: number;
  onDesfazerAceite: (solicitacaoId: string, nome: string) => void;
  onSimularCelso: () => void;
  onIrParaBuscar?: () => void;
}

export const MotoristaReservasTab: React.FC<MotoristaReservasTabProps> = ({
  passageirosReservados = [],
  vagasDesejadasFiltro = 4,
  onDesfazerAceite,
  onSimularCelso,
  onIrParaBuscar
}) => {
  const listaReservados = Array.isArray(passageirosReservados) ? passageirosReservados : [];
  // Verifica se o motorista já tem uma viagem exclusiva ativa
  const viagemExclusivaAtiva = listaReservados.find(p => p.modalidade === 'exclusiva');
  const temViagemExclusiva = !!viagemExclusivaAtiva;
  const vagasOcupadas = temViagemExclusiva ? vagasDesejadasFiltro : listaReservados.length;
  const vagasLivres = Math.max(0, vagasDesejadasFiltro - vagasOcupadas);

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
          SEÇÃO PRINCIPAL: MINHAS RESERVAS
          ========================================================================= */}
      <div className="bg-slate-800 border border-slate-700 rounded-3xl p-5 sm:p-6 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                Minhas Reservas ({listaReservados.length})
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Passageiros que reservaram corrida com você ou que você aceitou.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs bg-slate-700/80 border border-slate-600 px-3 py-1.5 rounded-xl text-slate-200 font-bold">
              {temViagemExclusiva 
                ? `⭐ Carro Fechado (${vagasDesejadasFiltro} vagas ocupadas exclusivamente)`
                : `${listaReservados.length} de ${vagasDesejadasFiltro} vagas ocupadas (${vagasLivres} livre${vagasLivres === 1 ? '' : 's'})`
              }
            </span>

            {onIrParaBuscar && !temViagemExclusiva && (
              <button
                type="button"
                onClick={onIrParaBuscar}
                className="py-2 px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-md border-2 border-emerald-300 flex items-center gap-1.5 cursor-pointer"
              >
                <Search className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Buscar Passageiros</span>
              </button>
            )}
          </div>
        </div>

        {/* Lista dos Passageiros Reservados */}
        {listaReservados.length > 0 ? (
          <div className="space-y-2.5">
            {listaReservados.map((item) => {
              const isItemExclusivo = item.modalidade === 'exclusiva';
              const infoData = classificarDataViagem(item.dataViagem, item.horario);
              const telefoneLimpo = (item.telefone || '').replace(/\D/g, '');
              const textoWhatsApp = encodeURIComponent(
                `Olá ${item.nome}! Sou o motorista José do Porta a Porta. Sua corrida ${isItemExclusivo ? 'exclusiva ' : ''}de ${item.origem} para ${item.destino} está reservada e confirmada. Me envie sua localização para combinarmos o embarque!`
              );

              return (
                <div
                  key={item.id}
                  className={`p-3 sm:py-2.5 sm:px-4 rounded-2xl border transition-all shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 overflow-hidden w-full ${
                    isItemExclusivo 
                      ? 'bg-amber-500/15 hover:bg-amber-500/20 border-amber-500/40' 
                      : 'bg-slate-700/70 hover:bg-slate-700 border-slate-600'
                  }`}
                >
                  {/* Dados do Passageiro Reservado em Linha Fina */}
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                    <div className={`w-8 h-8 rounded-lg font-bold flex items-center justify-center shrink-0 text-xs shadow-xs ${
                      isItemExclusivo 
                        ? 'bg-amber-500 text-slate-950 shadow-amber-500/20' 
                        : 'bg-emerald-500 text-slate-950 shadow-emerald-500/20'
                    }`}>
                      {item.nome.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 flex-wrap">
                      <span className="font-bold text-white text-sm">
                        {item.nome || 'Passageiro'}
                      </span>

                      {/* Tag de Data */}
                      <span className={`text-[10.5px] font-black px-2 py-0.5 rounded-full border inline-flex items-center gap-1 shrink-0 ${infoData.corBadge.bg} ${infoData.corBadge.text} ${infoData.corBadge.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${infoData.corBadge.dot}`}></span>
                        <Calendar className="w-3 h-3 shrink-0" />
                        <span>{infoData.labelCompleto}</span>
                      </span>

                      {isItemExclusivo ? (
                        <span className="text-[10.5px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <Crown className="w-3 h-3 text-amber-400 shrink-0" />
                          <span>Exclusiva (Carro Fechado)</span>
                        </span>
                      ) : (
                        <span className="text-[10.5px] font-medium bg-blue-500/20 text-blue-300 border border-blue-500/40 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <Users className="w-3 h-3 text-blue-400 shrink-0" />
                          <span>Compartilhada</span>
                        </span>
                      )}

                      <span className="text-[10.5px] text-slate-300 font-medium bg-slate-800 border border-slate-600 px-2 py-0.5 rounded-md inline-flex items-center">
                        {formatarTurnoEVagas(item.horario, item.vagas, isItemExclusivo)}
                      </span>

                      <div className="flex items-center gap-1 text-xs text-slate-300 font-medium flex-wrap">
                        <span className="text-white font-semibold">{item.origem}</span>
                        <span className="text-emerald-400 font-bold shrink-0">➔</span>
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
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-600/80 w-full md:w-auto shrink-0">
                    <div className="flex items-center justify-between sm:flex-col sm:items-end gap-1">
                      <span className="text-[10px] text-slate-400 font-medium leading-none">
                        {isItemExclusivo ? 'Total Fechado' : 'Passagem'}
                      </span>
                      <span className={`text-sm sm:text-base font-black ${isItemExclusivo ? 'text-amber-400' : 'text-emerald-400'}`}>
                        R$ {item.valor.toFixed(2).replace('.', ',')}
                      </span>
                    </div>

                    {/* Botões WhatsApp, Ligar e Liberar */}
                    <div className="grid grid-cols-5 gap-1.5 w-full sm:w-auto sm:flex sm:items-center">
                      <a
                        href={`https://wa.me/55${telefoneLimpo}?text=${textoWhatsApp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="col-span-2 py-2 px-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md border-2 border-emerald-300 active:scale-95 cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5 fill-slate-950 shrink-0" />
                        <span>WhatsApp</span>
                      </a>

                      <a
                        href={`tel:${telefoneLimpo}`}
                        className="col-span-2 py-2 px-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs flex items-center justify-center gap-1 transition-all border-2 border-slate-500 active:scale-95 shadow-xs"
                      >
                        <Phone className="w-3.5 h-3.5 text-slate-200 shrink-0" />
                        <span>Ligar</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => onDesfazerAceite(item.solicitacaoId, item.nome)}
                        title="Liberar vaga"
                        className="col-span-1 py-2 rounded-xl bg-slate-700 hover:bg-rose-600 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center transition-all border-2 border-slate-500 hover:border-rose-400 active:scale-95 cursor-pointer shadow-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
              Você ainda não possui passageiros reservados. Acesse o menu <strong>Buscar</strong> para encontrar passageiros na sua rota e aceitar viagens.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
              {onIrParaBuscar && (
                <button
                  type="button"
                  onClick={onIrParaBuscar}
                  className="py-3 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm transition-all shadow-md border-2 border-emerald-300 inline-flex items-center gap-2 cursor-pointer"
                >
                  <Search className="w-4 h-4 stroke-[2.5]" />
                  <span>Ir para a Tela de Busca</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={onSimularCelso}
                className="py-3 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-emerald-300 font-bold text-xs border-2 border-emerald-400/60 transition-all inline-flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>+ Adicionar Reserva de Celso (Vitória da Conquista)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

