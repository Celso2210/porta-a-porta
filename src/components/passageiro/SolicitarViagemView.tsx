import React, { useState, useMemo } from 'react';
import { 
  Briefcase, 
  ArrowRight,
  Car,
  CheckCircle2,
  Wallet,
  Sparkles,
  Users,
  Star,
  Clock,
  Send
} from 'lucide-react';
import { buscarVagasMotoristaDisponiveis, getOfertasVagas } from '../../services/tripStore';
import { OfertaVaga, TurnoViagem } from '../../types';
import { detectarTurno } from '../../services/turnoService';

interface SolicitarViagemViewProps {
  initialData: {
    origem: string;
    destino: string;
    origemCompleta?: string;
    destinoCompleto?: string;
    passageiros: number;
    malas?: number;
    modalidade?: 'compartilhada' | 'exclusiva';
    distanciaKm?: number;
    agendamento: string;
    precoEstimado: number;
    taxaReserva?: number;
    valorRestanteEmbarque?: number;
    precoPorKmAplicado?: number;
  };
  onConfirmar: (detalhesPorta: {
    ruaEmbarque: string;
    numeroEmbarque: string;
    pontoReferencia: string;
    qtdMalaGrande: number;
    metodoPagamentoTaxa: string;
    vagaEscolhidaId?: string;
  }) => void;
  onBack: () => void;
}

export const SolicitarViagemView: React.FC<SolicitarViagemViewProps> = ({
  initialData,
  onConfirmar,
  onBack
}) => {
  const [ruaEmbarque, setRuaEmbarque] = useState(() => {
    if (initialData.origemCompleta) {
      const parteRua = initialData.origemCompleta.split(',')[0]?.trim();
      return parteRua || '';
    }
    return '';
  });

  const [numeroEmbarque, setNumeroEmbarque] = useState(() => {
    if (initialData.origemCompleta) {
      const match = initialData.origemCompleta.match(/nº?\s*(\d+)/i) || initialData.origemCompleta.match(/,\s*(\d+)/);
      return match ? match[1] : '';
    }
    return '';
  });

  const [pontoReferencia, setPontoReferencia] = useState('');
  const [qtdMalaGrande, setQtdMalaGrande] = useState(initialData.malas ?? 1);
  const [formaPagamento] = useState('Direto com o Motorista no Embarque');

  // Detecta o turno selecionado
  const turnoDetectado: TurnoViagem = useMemo(() => {
    return detectarTurno(initialData.agendamento);
  }, [initialData.agendamento]);

  // Busca se algum motorista já publicou vagas para esta rota e turno
  const vagasEncontradas = useMemo(() => {
    const vagas = buscarVagasMotoristaDisponiveis(
      initialData.origem,
      initialData.destino,
      turnoDetectado,
      initialData.passageiros
    );
    // Se não encontrou por turno estrito, busca na rota
    if (vagas.length === 0) {
      return getOfertasVagas().filter(v => 
        v.status === 'ativa' && 
        v.vagasDisponiveis >= initialData.passageiros &&
        (v.cidadeOrigem.toLowerCase().includes(initialData.origem.toLowerCase()) || 
         initialData.origem.toLowerCase().includes(v.cidadeOrigem.toLowerCase()))
      );
    }
    return vagas;
  }, [initialData.origem, initialData.destino, turnoDetectado, initialData.passageiros]);

  const [vagaSelecionadaId, setVagaSelecionadaId] = useState<string | null>(() => {
    return vagasEncontradas.length > 0 ? vagasEncontradas[0].id : null;
  });

  const modalidade = initialData.modalidade || 'compartilhada';
  const distanciaKm = initialData.distanciaKm || 0;
  const valorTotal = initialData.precoEstimado;

  // Ao clicar em 'Selecionar motorista', já efetua a reserva e abre a janela do WhatsApp/localização diretamente
  const handleSelecionarMotoristaDirecto = (vagaId: string) => {
    setVagaSelecionadaId(vagaId);
    const ruaFinal = ruaEmbarque.trim() || (initialData.origemCompleta ? initialData.origemCompleta.split(',')[0].trim() : 'Rua Principal');
    const numFinal = numeroEmbarque.trim() || 'S/N';

    onConfirmar({
      ruaEmbarque: ruaFinal,
      numeroEmbarque: numFinal,
      pontoReferencia: pontoReferencia.trim(),
      qtdMalaGrande,
      metodoPagamentoTaxa: formaPagamento,
      vagaEscolhidaId: vagaId
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ruaFinal = ruaEmbarque.trim() || (initialData.origemCompleta ? initialData.origemCompleta.split(',')[0].trim() : 'Rua Principal');
    const numFinal = numeroEmbarque.trim() || 'S/N';

    onConfirmar({
      ruaEmbarque: ruaFinal,
      numeroEmbarque: numFinal,
      pontoReferencia: pontoReferencia.trim(),
      qtdMalaGrande,
      metodoPagamentoTaxa: formaPagamento,
      vagaEscolhidaId: vagaSelecionadaId || undefined
    });
  };

  return (
    <div className="flex flex-col justify-between min-h-[600px] h-full p-4 sm:p-5 bg-gradient-to-b from-slate-100/90 via-slate-50 to-blue-50/30 text-slate-900 rounded-3xl border border-slate-200/90 shadow-md">
      <div className="space-y-4">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
          <button 
            type="button"
            onClick={onBack}
            className="text-xs font-extrabold text-slate-700 hover:text-slate-900 flex items-center gap-1 bg-white border-2 border-slate-200 px-3 py-1.5 rounded-xl transition-all active:scale-95 shadow-2xs"
          >
            ← Voltar
          </button>
          <span className="text-xs font-extrabold text-blue-800 bg-blue-100/80 border border-blue-200/80 px-3 py-1 rounded-full shadow-2xs">
            Confirmar Embarque
          </span>
        </div>

        <div>
          <h2 className="text-lg font-light text-slate-900">Detalhes do Ponto de Embarque</h2>
          <p className="text-slate-500 text-xs font-medium mt-0.5">
            Confirme os detalhes da sua porta para o motorista te buscar.
          </p>
        </div>

        {/* Resumo da Rota Selecionada */}
        <div className="bg-slate-100/80 border border-slate-200/90 rounded-2xl p-3.5 space-y-2 shadow-2xs">
          <div className="flex items-start gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0 mt-1 shadow-xs"></div>
            <div>
              <span className="text-[10px] text-slate-500 font-extrabold uppercase block">Embarque (Origem)</span>
              <p className="text-xs font-bold text-slate-800">
                {initialData.origemCompleta || `${initialData.origem}`}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 pt-2 border-t border-slate-200/80">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0 mt-1 shadow-xs"></div>
            <div>
              <span className="text-[10px] text-slate-500 font-extrabold uppercase block">Desembarque (Destino)</span>
              <p className="text-xs font-bold text-slate-800">
                {initialData.destinoCompleto || `${initialData.destino}`}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 text-[11px]">
            <span className="font-extrabold text-slate-700 flex items-center gap-1.5 flex-wrap">
              <Car className="w-3.5 h-3.5 text-blue-600" />
              {modalidade === 'exclusiva' ? (
                <span className="bg-amber-100 text-amber-900 border border-amber-300 font-extrabold px-2 py-0.5 rounded-md text-[11px]">
                  Horário: <strong className="text-amber-950 font-black">{initialData.agendamento || 'A definir'}</strong> • Viagem Exclusiva
                </span>
              ) : (
                <>Turno: <strong className="text-slate-900">{turnoDetectado === 'manha' ? 'Manhã (06h às 08h)' : turnoDetectado === 'tarde' ? 'Tarde (10h às 14h)' : 'Tarde (14h às 18h)'}</strong></>
              )}
            </span>
            <span className="font-black text-blue-600">
              {distanciaKm} km rodados
            </span>
          </div>
        </div>

        {/* DISPONIBILIDADE DE VAGAS DE MOTORISTAS (Conforme solicitado) */}
        {vagasEncontradas.length > 0 ? (
          <div className="bg-emerald-50/90 border-2 border-emerald-300 rounded-2xl p-3.5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-emerald-950 flex items-center gap-1.5 uppercase tracking-wide">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Motoristas Disponíveis para o Destino
              </span>
              <span className="text-[10px] bg-emerald-200/80 text-emerald-900 font-black px-2 py-0.5 rounded-full">
                {vagasEncontradas.length} motorista(s)
              </span>
            </div>
            <p className="text-[11px] text-emerald-800 leading-tight">
              Encontramos motoristas com vagas livres para o seu trajeto. Escolha o motorista desejado e clique em <strong>Selecionar motorista</strong> para abrir o WhatsApp e enviar a localização:
            </p>

            <div className="space-y-2.5">
              {vagasEncontradas.map((vaga) => {
                const isSelected = vagaSelecionadaId === vaga.id;
                return (
                  <div
                    key={vaga.id}
                    onClick={() => setVagaSelecionadaId(vaga.id)}
                    className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-white border-emerald-600 shadow-md ring-2 ring-emerald-500/20'
                        : 'bg-white/90 border-emerald-200 hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={vaga.motoristaAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                        alt={vaga.motoristaNome}
                        className="w-11 h-11 rounded-xl object-cover border-2 border-emerald-500 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-xs text-slate-900">{vaga.motoristaNome}</span>
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 flex items-center">
                            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400 mr-0.5" />
                            {vaga.motoristaNota || 4.9}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-600 font-medium mt-0.5">
                          {vaga.veiculoModelo} • Placa {vaga.veiculoPlaca}
                        </p>
                        <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">
                          {vaga.vagasDisponiveis} vaga(s) livres • Turno {vaga.turno === 'manha' ? 'Manhã' : vaga.turno === 'tarde' ? 'Tarde' : 'Noite'}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        id={`btn-selecionar-motorista-${vaga.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelecionarMotoristaDirecto(vaga.id);
                        }}
                        className={`px-3.5 py-2.5 rounded-xl text-xs font-black transition-all shadow-xs flex items-center gap-1.5 whitespace-nowrap active:scale-95 cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 ring-2 ring-emerald-400'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        <span>Selecionar motorista</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setVagaSelecionadaId(null)}
              className={`text-[11px] font-bold text-slate-600 hover:text-slate-900 block text-center underline pt-1 ${
                vagaSelecionadaId === null ? 'font-black text-blue-700' : ''
              }`}
            >
              Ou preferir publicar no Mural para qualquer outro motorista
            </button>
          </div>
        ) : (
          <div className="bg-blue-50/80 border border-blue-200/90 rounded-2xl p-3.5 space-y-1.5 shadow-2xs">
            <div className="flex items-center gap-2 text-blue-900 font-extrabold text-xs">
              <Clock className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Nenhum motorista com vaga imediata encontrado</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Sua corrida será publicada no <strong>Mural de Chamados</strong>. Assim que um motorista disponível aceitar seu pedido, você receberá a confirmação para abrir o WhatsApp e combinar os detalhes.
            </p>
          </div>
        )}

        <form id="form-solicitar-viagem" onSubmit={handleSubmit} className="space-y-3.5">
          {/* Campos de Endereço */}
          <div className="bg-slate-100/80 border border-slate-200/90 p-3.5 rounded-2xl space-y-3 shadow-2xs">
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="block text-[11px] font-extrabold text-slate-700 mb-1">Rua / Logradouro</label>
                <input
                  type="text"
                  value={ruaEmbarque}
                  onChange={(e) => setRuaEmbarque(e.target.value)}
                  placeholder="Rua São José"
                  className="w-full px-3 py-2 bg-white border-2 border-slate-200 rounded-xl text-slate-900 text-xs font-bold focus:outline-none focus:border-blue-600 shadow-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                  Número <span className="text-slate-400 font-normal">(opcional)</span>
                </label>
                <input
                  type="text"
                  value={numeroEmbarque}
                  onChange={(e) => setNumeroEmbarque(e.target.value)}
                  placeholder="Ex: 142 ou S/N"
                  className="w-full px-3 py-2 bg-white border-2 border-slate-200 rounded-xl text-slate-900 text-xs font-bold focus:outline-none focus:border-blue-600 shadow-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 mb-1">Ponto de Referência</label>
              <input
                type="text"
                value={pontoReferencia}
                onChange={(e) => setPontoReferencia(e.target.value)}
                placeholder="Ex: Próximo à padaria / portão branco"
                className="w-full px-3 py-2 bg-white border-2 border-slate-200 rounded-xl text-slate-900 text-xs font-bold focus:outline-none focus:border-blue-600 shadow-xs"
              />
            </div>
          </div>

          {/* Opção de Malas */}
          <div className="bg-slate-100/80 border border-slate-200/90 p-3 rounded-2xl flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center border border-blue-200/80 shadow-2xs">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-extrabold text-slate-900 block">Malas / Bagagens</span>
                <span className="text-[10px] text-slate-500 font-medium">Quantidade no porta-malas</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white border-2 border-slate-200 px-2.5 py-1 rounded-xl shadow-xs">
              <button
                type="button"
                onClick={() => setQtdMalaGrande(Math.max(0, qtdMalaGrande - 1))}
                className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs transition-colors active:scale-95"
              >
                -
              </button>
              <span className="text-xs font-black text-blue-600">{qtdMalaGrande}</span>
              <button
                type="button"
                onClick={() => setQtdMalaGrande(qtdMalaGrande + 1)}
                className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs transition-colors active:scale-95"
              >
                +
              </button>
            </div>
          </div>

          {/* Forma de Pagamento Simplificada (Direto no Embarque) */}
          <div className="bg-blue-50/80 border border-blue-200/80 rounded-2xl p-3.5 flex items-center gap-3 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-blue-800 uppercase block">
                Pagamento da Viagem
              </span>
              <p className="text-xs font-bold text-slate-800">
                Pague diretamente ao motorista no embarque (Dinheiro, PIX ou Cartão).
              </p>
            </div>
          </div>
        </form>
      </div>

      {/* Footer com Valor Total e Botão de Ação */}
      <div className="pt-2 border-t border-slate-200/80 space-y-3">
        <div className="bg-slate-100/90 border border-slate-200/90 rounded-2xl p-3.5 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[10px] font-extrabold text-slate-500 uppercase block">
              Valor Total da Viagem
            </span>
            <div className="text-xl font-black text-slate-900">
              R$ {valorTotal.toFixed(2).replace('.', ',')}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100/90 border border-emerald-200 px-2.5 py-1 rounded-lg block">
              {initialData.passageiros} {initialData.passageiros === 1 ? 'passageiro' : 'passageiros'}
            </span>
            <span className="text-[9px] text-slate-500 font-medium mt-0.5 block">
              {initialData.agendamento}
            </span>
          </div>
        </div>

        <button
          type="submit"
          form="form-solicitar-viagem"
          className={`w-full font-extrabold py-4 rounded-2xl shadow-lg transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2 active:scale-[0.99] ${
            vagaSelecionadaId
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
          }`}
        >
          {vagaSelecionadaId ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Selecionar Motorista e Abrir WhatsApp</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Publicar Corrida no Mural de Motoristas</span>
            </>
          )}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
