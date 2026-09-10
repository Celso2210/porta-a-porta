import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  MessageCircle, 
  Star, 
  ShieldCheck, 
  Car, 
  Clock, 
  ArrowRight, 
  XCircle, 
  MapPin, 
  Bell,
  CheckCircle2,
  ExternalLink,
  Navigation
} from 'lucide-react';
import { MOTORISTA_JOSE, USUARIO_CELSO } from '../../data/mockData';
import { 
  getSolicitacaoById, 
  getMinhaSolicitacaoAtiva, 
  subscribeToTripStore, 
  cancelarSolicitacao 
} from '../../services/tripStore';
import { SolicitacaoViagem } from '../../types';

interface MotoristaACaminhoViewProps {
  solicitacaoId?: string | null;
  onIniciarViagem: () => void;
  onCancelar: () => void;
}

export const MotoristaACaminhoView: React.FC<MotoristaACaminhoViewProps> = ({
  solicitacaoId,
  onIniciarViagem,
  onCancelar
}) => {
  const [solicitacao, setSolicitacao] = useState<SolicitacaoViagem | undefined>(() => {
    if (solicitacaoId) return getSolicitacaoById(solicitacaoId);
    return getMinhaSolicitacaoAtiva(USUARIO_CELSO.id);
  });

  // Ouve atualizações reais do motorista (chegada, início de viagem ou cancelamento)
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

      if (current) {
        if (current.status === 'em_viagem') {
          onIniciarViagem();
        } else if (current.status === 'cancelada') {
          onCancelar();
        }
      }
    };

    checkState();
    const unsub = subscribeToTripStore(checkState);
    return () => unsub();
  }, [solicitacaoId, onIniciarViagem, onCancelar]);

  const motoristaNome = solicitacao?.motoristaNome || MOTORISTA_JOSE.nome;
  const motoristaTelefone = solicitacao?.motoristaTelefone || MOTORISTA_JOSE.telefone;
  const motoristaAvatar = solicitacao?.motoristaAvatar || MOTORISTA_JOSE.avatar;
  const motoristaVeiculo = solicitacao?.motoristaVeiculo || MOTORISTA_JOSE.veiculo.modelo;
  const motoristaPlaca = solicitacao?.motoristaPlaca || MOTORISTA_JOSE.veiculo.placa;
  const motoristaNota = solicitacao?.motoristaNota || MOTORISTA_JOSE.nota;
  const motoristaChegou = solicitacao?.status === 'motorista_chegou';

  const handleCancelarViagem = () => {
    if (confirm("Tem certeza que deseja cancelar esta viagem? O motorista já foi confirmado.")) {
      if (solicitacao) {
        cancelarSolicitacao(solicitacao.id);
      }
      onCancelar();
    }
  };

  const getWhatsAppLink = () => {
    const cleanTel = motoristaTelefone.replace(/\D/g, '');
    const phoneFull = cleanTel.startsWith('55') ? cleanTel : `55${cleanTel}`;
    const texto = `Olá ${motoristaNome}! Aqui é o ${solicitacao?.passageiroNome || 'passageiro'}. Estou aguardando no endereço de embarque: ${solicitacao?.enderecoEmbarque}. Segue minha localização:`;
    return `https://wa.me/${phoneFull}?text=${encodeURIComponent(texto)}`;
  };

  return (
    <div className="flex flex-col justify-between min-h-[620px] h-full p-5 sm:p-6 bg-white text-slate-900 rounded-3xl border border-slate-200 shadow-sm space-y-4">
      {/* Top Bar Status */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${motoristaChegou ? 'bg-emerald-500 animate-bounce' : 'bg-blue-600 animate-ping'}`}></span>
          <span className="text-xs font-extrabold text-slate-900">
            {motoristaChegou ? 'Motorista Chegou à Porta!' : 'Corrida Confirmada • Conexão WhatsApp'}
          </span>
        </div>
        <span className="text-[11px] bg-slate-100 border border-slate-200 text-slate-600 px-2.5 py-1 rounded-full font-semibold max-w-[200px] truncate">
          {solicitacao?.enderecoEmbarque ? solicitacao.enderecoEmbarque.split('-')[0] : 'Embarque Porta a Porta'}
        </span>
      </div>

      {/* Alerta Destacado se o motorista tiver chegado */}
      {motoristaChegou && (
        <div className="bg-emerald-500 text-slate-950 p-4 rounded-2xl shadow-lg border border-emerald-400 flex items-center gap-3 animate-in fade-in zoom-in-95 duration-300">
          <div className="w-10 h-10 rounded-xl bg-slate-950 text-emerald-400 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5 animate-bounce" />
          </div>
          <div className="text-xs">
            <strong className="block font-black text-sm uppercase tracking-wide">
              O motorista chegou à sua porta!
            </strong>
            <p className="text-slate-900 font-medium leading-tight mt-0.5">
              O veículo está aguardando em frente ao seu endereço. Por favor, dirija-se ao embarque.
            </p>
          </div>
        </div>
      )}

      {/* Card do Motorista e Veículo */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <img
              src={motoristaAvatar}
              alt={motoristaNome}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500 shadow-md"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-base text-slate-900">{motoristaNome}</h3>
                <span className="flex items-center text-[10px] font-bold bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-0.5" />
                  {motoristaNota} ⭐
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium">{motoristaVeiculo}</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-[10px] font-black bg-white text-blue-700 px-2.5 py-0.5 rounded border border-slate-200 shadow-xs">
                  Placa: {motoristaPlaca}
                </span>
                <span className="text-[11px] text-slate-500">Porta a Porta</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 block font-bold uppercase">Status</span>
            <span className={`text-xs font-black px-2.5 py-1 rounded-full ${motoristaChegou ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-100 text-emerald-800'}`}>
              {motoristaChegou ? 'No Portão' : 'Confirmada'}
            </span>
          </div>
        </div>

        {/* Bloco de Ação WhatsApp e Contato Direto */}
        <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl text-slate-800 space-y-3">
          <div className="flex items-start gap-2.5">
            <MessageCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wide">
                Combinar Localização via WhatsApp
              </h4>
              <p className="text-xs text-emerald-900 mt-0.5 leading-relaxed">
                Tudo é resolvido diretamente no WhatsApp com {motoristaNome}. Mande sua localização em tempo real ou ponto de referência por lá.
              </p>
            </div>
          </div>

          {/* Botão Principal: WhatsApp */}
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

          {/* Botão Secundário: Ligação */}
          <a
            href={`tel:${motoristaTelefone.replace(/\D/g, '')}`}
            className="w-full py-3 rounded-xl bg-white border border-emerald-300 hover:bg-emerald-100/50 text-emerald-900 font-bold text-xs transition-all flex items-center justify-center gap-2"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-700" />
            <span>Ligar para {motoristaTelefone}</span>
          </a>
        </div>

        {/* Detalhes de Embarque */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-2 text-xs">
          <div className="flex items-start gap-2 text-slate-700">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-900">Endereço de Coleta: </span>
              <span className="text-slate-600">{solicitacao?.enderecoEmbarque}</span>
            </div>
          </div>
          <div className="flex items-start gap-2 text-slate-700">
            <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-900">Destino: </span>
              <span className="text-slate-600">{solicitacao?.enderecoDesembarque}</span>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-slate-500">
            <span>A pagar ao embarcar:</span>
            <strong className="text-emerald-700 text-sm">
              R$ {(solicitacao?.valorRestanteEmbarque || solicitacao?.valorTotal || 40.50).toFixed(2).replace('.', ',')}
            </strong>
          </div>
        </div>
      </div>

      {/* Bottom Action Controls */}
      <div className="space-y-2 pt-1">
        <button
          onClick={onIniciarViagem}
          className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-blue-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Já Embarquei • Iniciar Viagem</span>
        </button>

        <button
          onClick={handleCancelarViagem}
          className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-red-600 transition-colors text-center"
        >
          Cancelar Viagem
        </button>
      </div>
    </div>
  );
};
