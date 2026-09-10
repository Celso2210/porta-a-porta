import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  MapPin, 
  Users, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  Gauge,
  Navigation2,
  MessageSquare
} from 'lucide-react';
import { MapCanvas } from '../common/MapCanvas';
import { ChatModal } from '../common/ChatModal';
import { WhatsAppButton } from '../common/WhatsAppButton';
import { MOTORISTA_JOSE, USUARIO_CELSO } from '../../data/mockData';
import { 
  getSolicitacaoById, 
  getMinhaSolicitacaoAtiva, 
  getDriverPlan, 
  subscribeToTripStore 
} from '../../services/tripStore';
import { SolicitacaoViagem } from '../../types';

interface DuranteViagemViewProps {
  solicitacaoId?: string | null;
  onConcluirViagem: () => void;
}

export const DuranteViagemView: React.FC<DuranteViagemViewProps> = ({ 
  solicitacaoId,
  onConcluirViagem 
}) => {
  const [solicitacao, setSolicitacao] = useState<SolicitacaoViagem | undefined>(() => {
    if (solicitacaoId) return getSolicitacaoById(solicitacaoId);
    return getMinhaSolicitacaoAtiva(USUARIO_CELSO.id);
  });
  const [driverPlan, setDriverPlan] = useState(getDriverPlan());
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Ouve atualizações reais da viagem (se o motorista concluir a viagem)
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
      setDriverPlan(getDriverPlan());

      if (current && current.status === 'concluida') {
        onConcluirViagem();
      }
    };

    checkState();
    const unsub = subscribeToTripStore(checkState);
    return () => unsub();
  }, [solicitacaoId, onConcluirViagem]);

  const motoristaNome = solicitacao?.motoristaNome || MOTORISTA_JOSE.nome;
  const motoristaTelefone = solicitacao?.motoristaTelefone || MOTORISTA_JOSE.telefone;
  const motoristaAvatar = solicitacao?.motoristaAvatar || MOTORISTA_JOSE.avatar;
  const motoristaVeiculo = solicitacao?.motoristaVeiculo || MOTORISTA_JOSE.veiculo.modelo;
  const motoristaPlaca = solicitacao?.motoristaPlaca || MOTORISTA_JOSE.veiculo.placa;

  const origemNome = solicitacao?.cidadeOrigem || 'Água Doce do Norte';
  const destinoNome = solicitacao?.cidadeDestino || 'Vitória';

  return (
    <div className="flex flex-col justify-between min-h-[620px] h-full p-5 sm:p-6 bg-white text-slate-900 rounded-3xl border border-slate-200 shadow-sm space-y-3">
      {/* Top Bar Status */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping"></span>
          <span className="text-xs font-bold text-slate-900">Viagem em Andamento</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold bg-slate-50 border border-slate-200 text-blue-600 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Gauge className="w-3 h-3" />
            Em Rota Intermunicipal
          </span>
          <button
            onClick={() => alert("ALERTA DE EMERGÊNCIA DISPARADO!\nCentral de monitoramento Porta a Porta notificada com sua localização GPS.")}
            className="p-1.5 rounded-lg bg-red-50 border border-red-200 text-red-600 hover:bg-red-600 hover:text-white transition-colors"
            title="Botão SOS Emergência"
          >
            <ShieldAlert className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Map Area */}
      <div className="h-44 w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
        <MapCanvas
          origemLat={-18.4812}
          origemLng={-40.7621}
          origemNome={origemNome}
          destinoLat={-20.3155}
          destinoLng={-40.3128}
          destinoNome={destinoNome}
          driverLat={-19.4000}
          driverLng={-40.5000}
          driverNome={`${motoristaNome} (${motoristaVeiculo})`}
          paradas={driverPlan.paradasGeradas.map(p => ({
            lat: p.lat,
            lng: p.lng,
            nome: p.passageiroNome,
            tipo: p.tipo,
            ordem: p.ordem,
            concluido: p.status === 'concluido'
          }))}
          height="100%"
        />
      </div>

      {/* Info Card & Trip Stats */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-3">
            <img
              src={motoristaAvatar}
              alt={motoristaNome}
              className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
            />
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">{motoristaNome}</h3>
              <p className="text-xs text-slate-500">{motoristaVeiculo} • {motoristaPlaca}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsChatOpen(true)}
              className="p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
              title="Abrir Chat"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
            <WhatsAppButton
              phone={motoristaTelefone.replace(/\D/g, '')}
              message={`Olá ${motoristaNome}! Sou o passageiro da viagem ${origemNome} ➔ ${destinoNome}.`}
              label=""
              variant="compact"
            />
          </div>
        </div>

        {/* Informações da Rota */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-1.5">
              <Navigation2 className="w-3.5 h-3.5 text-blue-600" />
              Trajeto Intermunicipal
            </span>
            <span className="font-bold text-slate-900">{origemNome} ➔ {destinoNome}</span>
          </div>

          <div className="flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              Seu Desembarque
            </span>
            <span className="font-bold text-slate-900 truncate max-w-[200px]">
              {solicitacao?.enderecoDesembarque || destinoNome}
            </span>
          </div>
        </div>
      </div>

      {/* Finalizar Viagem Button */}
      <div className="pt-1">
        <button
          onClick={onConcluirViagem}
          className="w-full py-3.5 rounded-2xl bg-blue-600 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <span>Chegada ao Destino & Avaliar</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Modal de Chat */}
      <ChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        userRole="passageiro"
        counterpartName={motoristaNome}
        counterpartPhone={motoristaTelefone}
        counterpartAvatar={motoristaAvatar}
        viagemId={solicitacao?.id || 'VG000123'}
        routeInfo={`${origemNome} ➔ ${destinoNome}`}
      />
    </div>
  );
};
