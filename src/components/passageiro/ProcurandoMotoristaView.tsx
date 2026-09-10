import React, { useEffect, useState } from 'react';
import { 
  Radar, 
  Car, 
  MapPin, 
  Users,
  Clock, 
  ShieldCheck, 
  Star, 
  Check, 
  X,
  Sparkles,
  Phone,
  Info,
  MessageCircle,
  ExternalLink,
  Navigation
} from 'lucide-react';
import { 
  getSolicitacoes, 
  getSolicitacaoById, 
  getMinhaSolicitacaoAtiva,
  cancelarSolicitacao, 
  passageiroConfirmarCorrida,
  subscribeToTripStore 
} from '../../services/tripStore';
import { SolicitacaoViagem } from '../../types';
import { USUARIO_CELSO, MOTORISTA_JOSE } from '../../data/mockData';

interface ProcurandoMotoristaViewProps {
  solicitacaoId?: string | null;
  requestData: {
    origem: string;
    destino: string;
    origemCompleta?: string;
    destinoCompleto?: string;
    passageiros: number;
    malas?: number;
    modalidade?: 'compartilhada' | 'exclusiva';
    agendamento: string;
    precoEstimado: number;
    ruaEmbarque: string;
    numeroEmbarque: string;
    pontoReferencia?: string;
  };
  onMatchFound: () => void;
  onCancel: () => void;
}

export const ProcurandoMotoristaView: React.FC<ProcurandoMotoristaViewProps> = ({
  solicitacaoId,
  requestData,
  onMatchFound,
  onCancel
}) => {
  const [solicitacao, setSolicitacao] = useState<SolicitacaoViagem | undefined>(() => {
    if (solicitacaoId) return getSolicitacaoById(solicitacaoId);
    return getMinhaSolicitacaoAtiva(USUARIO_CELSO.id);
  });
  const [confirmando, setConfirmando] = useState(false);

  // Ouve em tempo real as mudanças no tripStore (e Firestore)
  useEffect(() => {
    const checkState = () => {
      let current: SolicitacaoViagem | undefined;
      if (solicitacaoId) {
        current = getSolicitacaoById(solicitacaoId);
      }
      if (!current) {
        current = getMinhaSolicitacaoAtiva(USUARIO_CELSO.id);
      }
      setSolicitacao(current);
    };

    checkState();
    const unsub = subscribeToTripStore(checkState);
    return () => unsub();
  }, [solicitacaoId]);

  const handleCancelar = () => {
    if (solicitacao) {
      cancelarSolicitacao(solicitacao.id);
    }
    onCancel();
  };

  const handleConfirmarPeloPassageiro = async () => {
    if (!solicitacao) return;
    setConfirmando(true);
    await passageiroConfirmarCorrida(solicitacao.id);
    setConfirmando(false);
  };

  // Status da corrida
  const aguardandoConfirmacao = solicitacao && solicitacao.status === 'proposta_aceita_motorista';
  const viagemConfirmada = solicitacao && (
    solicitacao.status === 'confirmada' || 
    solicitacao.status === 'motorista_a_caminho' || 
    solicitacao.status === 'motorista_chegou'
  );

  // Link WhatsApp personalizado para contato direto e envio de localização
  const getWhatsAppLink = () => {
    const rawTel = solicitacao?.motoristaTelefone || MOTORISTA_JOSE.telefone;
    const cleanTel = rawTel.replace(/\D/g, '');
    const phoneFull = cleanTel.startsWith('55') ? cleanTel : `55${cleanTel}`;
    const motoristaNome = solicitacao?.motoristaNome || MOTORISTA_JOSE.nome;
    const passageiroNome = solicitacao?.passageiroNome || 'Celso';
    const origem = solicitacao?.cidadeOrigem || requestData.origem;
    const destino = solicitacao?.cidadeDestino || requestData.destino;
    const numLabel = requestData.numeroEmbarque && requestData.numeroEmbarque.trim() !== '' && requestData.numeroEmbarque.trim().toUpperCase() !== 'S/N'
      ? `, nº ${requestData.numeroEmbarque}`
      : (requestData.numeroEmbarque && requestData.numeroEmbarque.trim().toUpperCase() === 'S/N' ? ', S/N' : '');
    const endereco = solicitacao?.enderecoEmbarque || `${requestData.ruaEmbarque}${numLabel}`;

    const texto = `Olá ${motoristaNome}! Aqui é o ${passageiroNome}. Confirmei nossa corrida de ${origem} para ${destino} pelo aplicativo Porta a Porta. Meu local de embarque é: ${endereco}. Segue minha localização:`;
    return `https://wa.me/${phoneFull}?text=${encodeURIComponent(texto)}`;
  };

  const getPhoneCallLink = () => {
    const rawTel = solicitacao?.motoristaTelefone || MOTORISTA_JOSE.telefone;
    const cleanTel = rawTel.replace(/\D/g, '');
    return `tel:${cleanTel}`;
  };

  return (
    <div className="flex flex-col justify-between min-h-[620px] h-full p-5 sm:p-6 bg-white text-slate-900 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden space-y-4">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-100/50 rounded-full blur-3xl pointer-events-none"></div>

      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
            {viagemConfirmada 
              ? 'Conexão Direta via WhatsApp' 
              : aguardandoConfirmacao 
              ? 'Motorista Aceitou - Confirme!' 
              : 'Mural de Chamados Ativo'}
          </span>
          <button 
            onClick={handleCancelar}
            className="text-xs text-slate-500 hover:text-red-600 bg-slate-100 hover:bg-red-50 border border-slate-200 hover:border-red-200 px-3 py-1 rounded-lg font-medium transition-colors flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            <span>Cancelar</span>
          </button>
        </div>

        {/* ============================================================ */}
        {/* CASO 1: VIAGEM CONFIRMADA -> BOTÃO DE WHATSAPP LIBERADO!     */}
        {/* ============================================================ */}
        {viagemConfirmada ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom duration-300">
            {/* Banner de Sucesso */}
            <div className="bg-emerald-600 text-white rounded-3xl p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] bg-white text-emerald-950 font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  Viagem Confirmada!
                </span>
                <span className="text-xs text-emerald-100 font-bold">
                  Saída às {solicitacao?.horarioSaidaProposto || '08:00'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <img
                  src={solicitacao?.motoristaAvatar || MOTORISTA_JOSE.avatar}
                  alt="Motorista"
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-white text-base">
                      {solicitacao?.motoristaNome || MOTORISTA_JOSE.nome}
                    </h3>
                    <span className="text-amber-300 text-xs font-bold flex items-center gap-0.5">
                      <Star className="w-3.5 h-3.5 fill-amber-300" />
                      {solicitacao?.motoristaNota || 4.9}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-100 font-medium">
                    {solicitacao?.motoristaVeiculo || MOTORISTA_JOSE.veiculo.modelo}
                  </p>
                  {solicitacao?.motoristaPlaca && (
                    <span className="inline-block mt-0.5 text-[10px] font-extrabold bg-black/20 text-white px-2 py-0.5 rounded border border-white/20">
                      Placa: {solicitacao.motoristaPlaca}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* AVISO DO FLUXO SIMPLIFICADO: WHATSAPP RESOLVE TUDO */}
            <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl text-slate-800 space-y-3">
              <div className="flex items-start gap-2.5">
                <MessageCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wide">
                    Encontro Realizado com Sucesso!
                  </h4>
                  <p className="text-xs text-emerald-900 mt-1 leading-relaxed">
                    Toque no botão abaixo para abrir o WhatsApp com <strong>{solicitacao?.motoristaNome || 'o motorista'}</strong>. 
                    Envie sua localização em tempo real ou ponto de referência por lá e combinem a chegada diretamente.
                  </p>
                </div>
              </div>

              {/* BOTÃO PRINCIPAL WHATSAPP */}
              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5 fill-white text-emerald-600" />
                <span>Abrir WhatsApp e Enviar Localização</span>
                <ExternalLink className="w-4 h-4 opacity-80" />
              </a>

              {/* Botão Secundário: Ligar por Telefone */}
              <a
                href={getPhoneCallLink()}
                className="w-full py-3 rounded-xl bg-white border border-emerald-300 hover:bg-emerald-100/50 text-emerald-900 font-bold text-xs transition-all flex items-center justify-center gap-2"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-700" />
                <span>Ligar para {solicitacao?.motoristaTelefone || MOTORISTA_JOSE.telefone}</span>
              </a>
            </div>

            {/* Resumo da Viagem */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-700">Trajeto Combinado</span>
                <span className="font-extrabold text-blue-700">{solicitacao?.cidadeOrigem} ➔ {solicitacao?.cidadeDestino}</span>
              </div>
              <div className="flex items-start gap-2 text-slate-600 pt-1">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-800">Embarque: </span>
                  <span>
                    {solicitacao?.enderecoEmbarque || (
                      requestData.ruaEmbarque
                        ? `${requestData.ruaEmbarque}${
                            requestData.numeroEmbarque && requestData.numeroEmbarque.trim().toUpperCase() !== 'S/N'
                              ? `, nº ${requestData.numeroEmbarque}`
                              : (requestData.numeroEmbarque && requestData.numeroEmbarque.trim().toUpperCase() === 'S/N' ? ', S/N' : '')
                          }`
                        : 'A combinar'
                    )}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 text-slate-500">
                <span>Valor a pagar no embarque:</span>
                <strong className="text-emerald-700 text-sm font-black">
                  R$ {(solicitacao?.valorTotal || solicitacao?.valorRestanteEmbarque || requestData.precoEstimado || 156.00).toFixed(2).replace('.', ',')}
                </strong>
              </div>
            </div>
          </div>
        ) : aguardandoConfirmacao ? (
          /* ============================================================ */
          /* CASO 2: MOTORISTA ACEITOU -> PASSAGEIRO DEVE CONFIRMAR       */
          /* ============================================================ */
          <div className="space-y-4 animate-in slide-in-from-top duration-300">
            <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white rounded-3xl p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] bg-slate-950 text-amber-300 font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Motorista Aceitou sua Corrida!
                </span>
                <span className="text-xs text-amber-100 font-bold">
                  Aguardando sua confirmação
                </span>
              </div>

              {/* Perfil do Motorista que aceitou */}
              <div className="flex items-center gap-3">
                <img
                  src={solicitacao?.motoristaAvatar || MOTORISTA_JOSE.avatar}
                  alt="Motorista"
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-white text-base">
                      {solicitacao?.motoristaNome || MOTORISTA_JOSE.nome}
                    </h3>
                    <span className="text-slate-950 bg-amber-300 text-xs font-black px-1.5 py-0.2 rounded flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-slate-950" />
                      {solicitacao?.motoristaNota || 4.9} ⭐
                    </span>
                  </div>
                  <p className="text-xs text-amber-100 font-medium">
                    {solicitacao?.motoristaVeiculo || MOTORISTA_JOSE.veiculo.modelo}
                  </p>
                  {solicitacao?.motoristaPlaca && (
                    <span className="inline-block mt-0.5 text-[10px] font-extrabold bg-black/20 text-white px-2 py-0.5 rounded border border-white/20">
                      Placa: {solicitacao.motoristaPlaca}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-3 bg-black/20 rounded-xl text-xs space-y-1 text-amber-50">
                <p>
                  📍 O motorista <strong>{solicitacao?.motoristaNome}</strong> está pronto para te buscar em <strong>{solicitacao?.enderecoEmbarque}</strong>.
                </p>
                <p className="text-[11px] text-amber-200">
                  Ao confirmar, o WhatsApp dele será liberado para vocês combinarem a localização exata.
                </p>
              </div>

              {/* Botão de Confirmação do Passageiro */}
              <button
                onClick={handleConfirmarPeloPassageiro}
                disabled={confirmando}
                className="w-full py-4 rounded-2xl bg-slate-950 hover:bg-slate-900 text-white font-black text-sm uppercase tracking-wider shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 border border-white/20"
              >
                <Check className="w-5 h-5 text-emerald-400 stroke-[3]" />
                <span>{confirmando ? 'Confirmando...' : `Confirmar Viagem com ${solicitacao?.motoristaNome || 'Motorista'}`}</span>
              </button>
            </div>
          </div>
        ) : (
          /* ============================================================ */
          /* CASO 3: AGUARDANDO MOTORISTA ACEITAR NO MURAL               */
          /* ============================================================ */
          <div className="space-y-4">
            <div className="flex flex-col items-center text-center my-4">
              <div className="relative w-24 h-24 flex items-center justify-center mb-3">
                <div className="absolute inset-0 rounded-full border-2 border-blue-200 animate-ping"></div>
                <div className="absolute inset-2 rounded-full border border-blue-300"></div>
                <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-200">
                  <Radar className="w-8 h-8 stroke-[2.5] animate-spin" style={{ animationDuration: '4s' }} />
                </div>
              </div>

              <h2 className="text-lg font-extrabold text-slate-900">
                Aguardando um motorista aceitar...
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Seu chamado está publicado no <strong>Mural de Chamados</strong>. Quando um motorista aceitar, você confirmará aqui para liberar a conversa pelo WhatsApp.
              </p>
            </div>

            {/* Card de Resumo da Solicitação Real */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Detalhes do seu Chamado</span>
                <span className="text-xs font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  R$ {requestData.precoEstimado.toFixed(2).replace('.', ',')}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2 text-slate-700">
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900">Endereço de Embarque: </span>
                    <span className="text-slate-600">
                      {requestData.ruaEmbarque}
                      {requestData.numeroEmbarque && requestData.numeroEmbarque.trim().toUpperCase() !== 'S/N'
                        ? `, nº ${requestData.numeroEmbarque}`
                        : (requestData.numeroEmbarque && requestData.numeroEmbarque.trim().toUpperCase() === 'S/N' ? ', S/N' : '')}
                      {' - '}{requestData.origem}
                    </span>
                    {requestData.pontoReferencia && (
                      <p className="text-[11px] text-slate-400">Ref: {requestData.pontoReferencia}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-2 text-slate-700">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900">Destino: </span>
                    <span className="text-slate-600">{requestData.destinoCompleto || requestData.destino}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-slate-500 text-[11px]">
                  <span>Vagas: <strong className="text-slate-800">{requestData.passageiros} pessoa(s)</strong></span>
                  <span>Turno: <strong className="text-slate-800">{requestData.agendamento}</strong></span>
                  <span>Pagamento: <strong className="text-slate-800">No Embarque</strong></span>
                </div>
              </div>
            </div>

            {/* Dica para alternar e testar */}
            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-2.5 text-xs text-blue-900">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold text-blue-950">Como funciona o fluxo simplificado:</strong>
                <p className="mt-0.5 text-[11px] text-blue-800 leading-relaxed">
                  Alterne para o modo <strong>Motorista</strong> no topo e clique em <strong>"Aceitar Corrida de Celso"</strong>. 
                  Ao voltar para cá, você verá o botão de confirmação e, logo em seguida, o botão do WhatsApp para enviar sua localização!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Rodapé com botão de cancelamento */}
      <div>
        {!viagemConfirmada && (
          <button
            onClick={handleCancelar}
            className="w-full py-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-600 font-bold text-xs transition-all"
          >
            Desistir e Cancelar Chamado
          </button>
        )}
      </div>
    </div>
  );
};
