import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  X, 
  Check, 
  Car, 
  Clock, 
  ShieldAlert, 
  Sparkles, 
  CheckCheck,
  Volume2,
  MessageCircle,
  Phone,
  MapPin,
  Star,
  ExternalLink,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { 
  NotificacaoFCM, 
  ouvirNotificacoesUsuario, 
  marcarNotificacaoComoLida,
  solicitarPermissaoFCM
} from '../../services/notificationService';
import { getMinhaSolicitacaoAtiva, subscribeToTripStore } from '../../services/tripStore';
import { MOTORISTA_JOSE, USUARIO_CELSO } from '../../data/mockData';

interface NotificationToastProps {
  usuarioUid?: string;
  onOpenChat?: () => void;
  onAcceptProposal?: (solicitacaoId: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  usuarioUid = 'celso_passageiro',
  onOpenChat,
  onAcceptProposal
}) => {
  const [notificacoes, setNotificacoes] = useState<NotificacaoFCM[]>([]);
  const [toastAtivo, setToastAtivo] = useState<NotificacaoFCM | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [fcmStatus, setFcmStatus] = useState<'granted' | 'default' | 'denied'>('default');
  const [lastNotifiedTripStatus, setLastNotifiedTripStatus] = useState<string | null>(null);

  const tocarSomNotificacao = (isAceite: boolean) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';
      
      const now = audioCtx.currentTime;
      if (isAceite) {
        // Acorde alegre de confirmação
        osc1.frequency.setValueAtTime(523.25, now); // C5
        osc1.frequency.setValueAtTime(659.25, now + 0.12); // E5
        osc1.frequency.setValueAtTime(783.99, now + 0.24); // G5
      } else {
        osc1.frequency.setValueAtTime(587.33, now);
      }

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc1.connect(gain);
      gain.connect(audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.45);
    } catch (e) {
      // Navegador bloqueou áudio autoplay ou sem suporte
    }
  };

  // Inicializa a escuta das notificações no Firestore
  useEffect(() => {
    if ('Notification' in window) {
      setFcmStatus(Notification.permission);
    }

    const unsubscribe = ouvirNotificacoesUsuario(usuarioUid, (lista) => {
      setNotificacoes(lista);

      // Prioriza notificação de corrida aceita pelo motorista
      const novaCorridaAceita = lista.find(n => !n.lida && n.tipo === 'corrida_aceita');
      if (novaCorridaAceita) {
        setToastAtivo(novaCorridaAceita);
        tocarSomNotificacao(true);
        return;
      }

      // Outras notificações não lidas
      const novaNaoLida = lista.find(n => !n.lida && (
        n.tipo === 'aproximacao_5min' || 
        n.tipo === 'proposta_motorista' || 
        n.tipo === 'confirmacao_passageiro' || 
        n.tipo === 'embarque'
      ));

      if (novaNaoLida) {
        setToastAtivo(novaNaoLida);
        tocarSomNotificacao(novaNaoLida.tipo === 'proposta_motorista');
      }
    });

    return () => unsubscribe();
  }, [usuarioUid]);

  // Escuta adicional do tripStore para garantir notificação imediata
  useEffect(() => {
    const unsubTrip = subscribeToTripStore(() => {
      const sol = getMinhaSolicitacaoAtiva(USUARIO_CELSO.id);
      if (sol && (sol.status === 'confirmada' || sol.status === 'proposta_aceita_motorista')) {
        const key = `${sol.id}_${sol.status}`;
        if (lastNotifiedTripStatus !== key) {
          setLastNotifiedTripStatus(key);

          // Dispara o Banner Toast na hora
          setToastAtivo({
            id: `local_aceite_${Date.now()}`,
            usuarioUid: 'celso_passageiro',
            titulo: '🎉 Motorista José aceitou sua corrida!',
            mensagem: 'Motorista José aceitou sua corrida! Prepare-se para o embarque.',
            tipo: 'corrida_aceita',
            solicitacaoId: sol.id,
            motoristaNome: sol.motoristaNome || MOTORISTA_JOSE.nome,
            motoristaTelefone: sol.motoristaTelefone || MOTORISTA_JOSE.telefone,
            motoristaVeiculo: sol.motoristaVeiculo || MOTORISTA_JOSE.veiculo.modelo,
            motoristaPlaca: sol.motoristaPlaca || MOTORISTA_JOSE.veiculo.placa,
            motoristaAvatar: sol.motoristaAvatar || MOTORISTA_JOSE.avatar,
            motoristaNota: sol.motoristaNota || 4.9,
            passageiroNome: sol.passageiroNome || 'Celso',
            horarioSaida: sol.horarioSaidaProposto || sol.horarioDesejado || '08:00',
            origem: sol.cidadeOrigem,
            destino: sol.cidadeDestino,
            enderecoEmbarque: sol.enderecoEmbarque,
            lida: false
          });

          tocarSomNotificacao(true);
        }
      }
    });

    return () => unsubTrip();
  }, [lastNotifiedTripStatus]);

  const handlePermitirFCM = async () => {
    await solicitarPermissaoFCM();
    if ('Notification' in window) {
      setFcmStatus(Notification.permission);
    }
  };

  const handleFecharToast = () => {
    if (toastAtivo) {
      if (!toastAtivo.id.startsWith('local_')) {
        marcarNotificacaoComoLida(toastAtivo.id);
      }
      setToastAtivo(null);
    }
  };

  const getWhatsAppLink = (notif: NotificacaoFCM) => {
    const rawTel = notif.motoristaTelefone || MOTORISTA_JOSE.telefone;
    const cleanTel = rawTel.replace(/\D/g, '');
    const phoneFull = cleanTel.startsWith('55') ? cleanTel : `55${cleanTel}`;
    const motoristaNome = notif.motoristaNome || MOTORISTA_JOSE.nome;
    const passageiroNome = notif.passageiroNome || 'Celso';
    const origem = notif.origem || 'Água Doce do Norte';
    const destino = notif.destino || 'Vitória da Conquista';
    const horario = notif.horarioSaida || '08:00';
    const endereco = notif.enderecoEmbarque ? ` Meu local de embarque é: ${notif.enderecoEmbarque}.` : '';

    const texto = `Olá ${motoristaNome}! Sou o ${passageiroNome}. Confirmei nossa corrida de ${origem} para ${destino} pelo app Porta a Porta (saída prevista às ${horario}).${endereco} Segue minha localização:`;
    return `https://wa.me/${phoneFull}?text=${encodeURIComponent(texto)}`;
  };

  const getPhoneCallLink = (notif: NotificacaoFCM) => {
    const rawTel = notif.motoristaTelefone || MOTORISTA_JOSE.telefone;
    const cleanTel = rawTel.replace(/\D/g, '');
    return `tel:${cleanTel}`;
  };

  const notificacoesNaoLidas = notificacoes.filter(n => !n.lida);
  const isAceiteModal = toastAtivo && (toastAtivo.tipo === 'corrida_aceita' || toastAtivo.tipo === 'proposta_motorista');

  return (
    <>
      {/* Botão Flutuante do Centro de Notificações com Badge FCM */}
      <div className="fixed top-20 right-4 z-40 flex items-center gap-2">
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="relative p-2.5 bg-slate-900 text-white rounded-2xl shadow-lg border border-slate-700 hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-2"
          title="Notificações e FCM"
        >
          <Bell className="w-4 h-4 text-amber-400" />
          <span className="text-[11px] font-bold hidden sm:inline">Alertas FCM</span>
          {notificacoesNaoLidas.length > 0 && (
            <span className="w-5 h-5 bg-red-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center animate-pulse">
              {notificacoesNaoLidas.length}
            </span>
          )}
        </button>
      </div>

      {/* Modal / Banner Toast Destacado quando a Corrida for Aceita pelo Motorista */}
      {isAceiteModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-start justify-center p-4 pt-10 sm:pt-16 animate-in fade-in duration-200">
          <div className="bg-slate-900 border-2 border-emerald-500 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl shadow-emerald-500/25 text-white space-y-4 relative animate-in zoom-in-95 duration-300">
            {/* Botão Fechar no Topo */}
            <button
              onClick={handleFecharToast}
              className="absolute top-4 right-4 p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
              title="Fechar notificação"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Cabeçalho de Destaque */}
            <div className="space-y-1 pr-8">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black bg-emerald-500 text-slate-950 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                  Corrida Confirmada
                </span>
                <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Saída às {toastAtivo.horarioSaida || '08:00'}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white leading-tight mt-1">
                Motorista {toastAtivo.motoristaNome?.split(' ')[0] || 'José'} aceitou sua corrida! Prepare-se para o embarque.
              </h3>
            </div>

            {/* Card com Dados do Motorista e Veículo */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-3.5">
                <img
                  src={toastAtivo.motoristaAvatar || MOTORISTA_JOSE.avatar}
                  alt="Foto do motorista"
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-400 shadow-md shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-extrabold text-white text-base tracking-tight">
                      {toastAtivo.motoristaNome || MOTORISTA_JOSE.nome}
                    </h4>
                    <span className="text-amber-400 text-xs font-black flex items-center gap-0.5 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                      <Star className="w-3 h-3 fill-amber-400" />
                      {toastAtivo.motoristaNota || 4.9}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-300 font-bold mt-0.5">
                    {toastAtivo.motoristaVeiculo || MOTORISTA_JOSE.veiculo.modelo}
                  </p>
                  {toastAtivo.motoristaPlaca && (
                    <span className="inline-block mt-1 text-[10px] font-black bg-slate-950 text-slate-200 px-2.5 py-0.5 rounded border border-slate-700 uppercase tracking-wider">
                      Placa: {toastAtivo.motoristaPlaca}
                    </span>
                  )}
                </div>
              </div>

              {/* Rota e Local de Embarque */}
              <div className="pt-2 border-t border-slate-700/60 space-y-1.5 text-xs">
                {(toastAtivo.origem || toastAtivo.destino) && (
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">Trajeto:</span>
                    <span className="font-bold text-white">
                      {toastAtivo.origem || 'Origem'} ➔ {toastAtivo.destino || 'Destino'}
                    </span>
                  </div>
                )}
                {toastAtivo.enderecoEmbarque && (
                  <div className="flex items-start gap-1.5 text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-slate-400">Embarque:</span>
                    <span className="font-semibold text-slate-200 truncate flex-1">
                      {toastAtivo.enderecoEmbarque}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Ações: Botão Direto para Falar no WhatsApp */}
            <div className="space-y-2 pt-1">
              <a
                href={getWhatsAppLink(toastAtivo)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleFecharToast}
                className="w-full py-3.5 sm:py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle className="w-5 h-5 fill-slate-950 text-emerald-500" />
                <span>Conversar no WhatsApp e Enviar Localização</span>
                <ExternalLink className="w-4 h-4 opacity-80" />
              </a>

              <div className="flex items-center gap-2">
                <a
                  href={getPhoneCallLink(toastAtivo)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Ligar: {toastAtivo.motoristaTelefone || MOTORISTA_JOSE.telefone}</span>
                </a>

                <button
                  type="button"
                  onClick={handleFecharToast}
                  className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pop-up Toast Automático Compacto para outras notificações (5 minutos, embarque, etc.) */}
      {toastAtivo && !isAceiteModal && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md bg-slate-900 text-white rounded-3xl p-4 shadow-2xl border-2 border-emerald-500 animate-in slide-in-from-top duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0">
                <Car className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">
                    {toastAtivo.titulo}
                  </span>
                  <span className="text-[9px] bg-emerald-500 text-slate-950 font-extrabold px-1.5 py-0.2 rounded">
                    FCM PUSH
                  </span>
                </div>
                <p className="text-xs text-slate-200 mt-1 font-medium leading-snug">
                  {toastAtivo.mensagem}
                </p>
              </div>
            </div>

            <button
              onClick={handleFecharToast}
              className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
              <Clock className="w-3 h-3 text-emerald-400" />
              Notificação Firestore / FCM em tempo real
            </span>

            <div className="flex items-center gap-2">
              {onOpenChat && (
                <button
                  onClick={() => {
                    handleFecharToast();
                    onOpenChat();
                  }}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all"
                >
                  Abrir Chat
                </button>
              )}
              <button
                onClick={handleFecharToast}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition-all"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drawer do Histórico de Notificações FCM */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm h-full shadow-2xl flex flex-col border-l border-slate-200">
            
            {/* Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-bold text-sm">Notificações FCM</h3>
                  <p className="text-[10px] text-slate-400">Coleção 'notificacoes' em Tempo Real</p>
                </div>
              </div>

              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* FCM Status Banner */}
            <div className="p-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-700 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                Push Web FCM:
              </span>

              {fcmStatus === 'granted' ? (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-600" />
                  Ativo no Navegador
                </span>
              ) : (
                <button
                  onClick={handlePermitirFCM}
                  className="text-[10px] bg-blue-600 text-white font-bold px-2.5 py-1 rounded-xl shadow-sm hover:bg-blue-700 active:scale-95 transition-all"
                >
                  Ativar Permissão FCM
                </button>
              )}
            </div>

            {/* Notification List */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
              {notificacoes.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <Bell className="w-8 h-8 mx-auto opacity-30 text-slate-600" />
                  <p className="text-xs font-semibold">Nenhuma notificação registrada.</p>
                  <p className="text-[10px] text-slate-400">
                    Quando o motorista se aproximar a 5 minutos do local, os alertas aparecerão aqui.
                  </p>
                </div>
              ) : (
                notificacoes.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      item.lida 
                        ? 'bg-white border-slate-200 text-slate-700 opacity-80' 
                        : 'bg-emerald-50/90 border-emerald-200 text-slate-900 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-sm">🚗</span>
                        <h4 className="font-bold text-xs text-slate-900">{item.titulo}</h4>
                      </div>

                      {!item.lida && (
                        <button
                          onClick={() => marcarNotificacaoComoLida(item.id)}
                          className="text-[10px] text-emerald-700 hover:underline font-bold shrink-0"
                          title="Marcar como lida"
                        >
                          Lida
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 font-medium leading-relaxed mb-2">
                      {item.mensagem}
                    </p>

                    {item.tipo === 'proposta_motorista' && item.solicitacaoId && onAcceptProposal && (
                      <div className="mb-2">
                        <button
                          onClick={() => {
                            const sid = item.solicitacaoId!;
                            marcarNotificacaoComoLida(item.id);
                            setIsDrawerOpen(false);
                            onAcceptProposal(sid);
                          }}
                          className="w-full py-1.5 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Aceitar Motorista (Confirmar Vaga)</span>
                        </button>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-200/60">
                      <span className="font-mono text-slate-500">
                        Token: {item.fcmToken ? item.fcmToken.substring(0, 15) + '...' : 'FCM_MOCK'}
                      </span>
                      <span>
                        {item.minutosAteEmbarque ? `${item.minutosAteEmbarque} min de distância` : 'FCM Push'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-white border-t border-slate-200 text-center">
              <span className="text-[10px] text-slate-400">
                Coleção Firestore: <strong className="text-slate-600">notificacoes</strong>
              </span>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
