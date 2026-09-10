import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  MessageSquare, 
  User, 
  CheckCheck, 
  Sparkles, 
  Phone,
  Clock,
  Car
} from 'lucide-react';
import { WhatsAppButton } from './WhatsAppButton';
import { db } from '../../lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';

export interface ChatMessage {
  id: string;
  senderRole: 'passageiro' | 'motorista';
  senderName: string;
  text: string;
  timestamp: string;
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: 'passageiro' | 'motorista';
  counterpartName: string;
  counterpartPhone?: string;
  counterpartAvatar?: string;
  viagemId?: string;
  routeInfo?: string;
}

export const ChatModal: React.FC<ChatModalProps> = ({
  isOpen,
  onClose,
  userRole,
  counterpartName,
  counterpartPhone = '27998765432',
  counterpartAvatar,
  viagemId = 'VG000123',
  routeInfo = 'Água Doce do Norte ➔ Vitória'
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      senderRole: userRole === 'passageiro' ? 'motorista' : 'passageiro',
      senderName: counterpartName,
      text: userRole === 'passageiro' 
        ? 'Olá! Estou a caminho do seu endereço de embarque porta a porta.' 
        : 'Olá motorista, já estou com as malas no portão de casa!',
      timestamp: new Date(Date.now() - 3 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll para a última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Firestore Real-Time Listener (onSnapshot)
  useEffect(() => {
    if (!isOpen || !viagemId) return;

    try {
      const messagesRef = collection(db, 'viagens', viagemId, 'mensagens');
      const q = query(messagesRef, orderBy('createdAt', 'asc'));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const loadedMsgs: ChatMessage[] = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              senderRole: data.senderRole || 'passageiro',
              senderName: data.senderName || 'Usuário',
              text: data.text || '',
              timestamp: data.createdAt 
                ? new Date(data.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
          });
          setMessages(loadedMsgs);
        }
      }, (err) => {
        console.warn("Firestore listener offline, usando fallback de mensagens locais.", err);
      });

      return () => unsubscribe();
    } catch (e) {
      console.warn("Sem Firestore configurado para chat.", e);
    }
  }, [isOpen, viagemId]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const myName = userRole === 'passageiro' ? 'Celso' : 'José (Motorista)';
    const newMsg: ChatMessage = {
      id: `local_${Date.now()}`,
      senderRole: userRole,
      senderName: myName,
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Atualização otimista imediata no estado local
    setMessages(prev => [...prev, newMsg]);
    setInputText('');

    // Gravação no Firestore (em tempo real para outros dispositivos)
    try {
      const messagesRef = collection(db, 'viagens', viagemId, 'mensagens');
      await addDoc(messagesRef, {
        senderRole: userRole,
        senderName: myName,
        text: textToSend,
        createdAt: serverTimestamp()
      });
    } catch (e) {
      console.warn("Mensagem salva localmente (Firestore offline).");
    }

    // Resposta Simulada Automática para demonstração fluida caso o usuário interaja sozinho
    setTimeout(() => {
      const respRole = userRole === 'passageiro' ? 'motorista' : 'passageiro';
      const respName = counterpartName;
      let respText = 'Perfeito! Recebido com sucesso.';

      if (textToSend.toLowerCase().includes('porta') || textToSend.toLowerCase().includes('casa')) {
        respText = userRole === 'passageiro' 
          ? 'Ótimo! Já estou dobrando a esquina na Spin Prata.' 
          : 'Já estou na porta aguardando!';
      } else if (textToSend.toLowerCase().includes('minuto') || textToSend.toLowerCase().includes('tempo')) {
        respText = 'Certo, estou monitorando a rota via GPS.';
      } else if (textToSend.toLowerCase().includes('mala') || textToSend.toLowerCase().includes('bagagem')) {
        respText = 'O porta-malas já está liberado para acomodar suas malas.';
      }

      const autoReplyMsg: ChatMessage = {
        id: `auto_${Date.now()}`,
        senderRole: respRole,
        senderName: respName,
        text: respText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => {
        // Evita duplicar se já houver mais de 10 msgs
        if (prev.some(m => m.text === respText)) return prev;
        return [...prev, autoReplyMsg];
      });
    }, 1800);
  };

  if (!isOpen) return null;

  // Sugestões de mensagens rápidas baseadas no papel
  const quickSuggestions = userRole === 'passageiro' ? [
    "Estou no portão de casa!",
    "Chego em 2 minutos",
    "Estou com 1 mala grande",
    "Qual a cor do carro?"
  ] : [
    "Estou dobrando a rua do seu embarque!",
    "Cheguei na sua porta",
    "Pode acomodar as bagagens no porta-malas",
    "Trânsito leve no percurso"
  ];

  const whatsappMessage = userRole === 'passageiro'
    ? `Olá ${counterpartName}, sou o passageiro Celso da viagem ${routeInfo}. Mensagem sobre o embarque porta a porta:`
    : `Olá ${counterpartName}, sou o motorista José da viagem ${routeInfo}. Estou no seu local de embarque.`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md h-[90vh] sm:h-[580px] rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header do Chat */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              {counterpartAvatar ? (
                <img 
                  src={counterpartAvatar} 
                  alt={counterpartName} 
                  className="w-10 h-10 rounded-full object-cover border-2 border-blue-500" 
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white border-2 border-blue-400">
                  {counterpartName.substring(0, 2).toUpperCase()}
                </div>
              )}
              <span className="w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full absolute bottom-0 right-0"></span>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm text-white">{counterpartName}</h3>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.2 rounded border border-emerald-500/30">
                  Online
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <Car className="w-3 h-3 text-blue-400" />
                <span>{routeInfo}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* WhatsApp Direct Integration Button */}
            <WhatsAppButton 
              phone={counterpartPhone}
              message={whatsappMessage}
              label="WhatsApp"
              variant="compact"
              className="!py-1.5 !px-2.5"
            />

            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Informação de Conexão Direta */}
        <div className="bg-blue-50/80 border-b border-blue-100 px-4 py-2 flex items-center justify-between text-[11px] text-blue-800">
          <span className="font-semibold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Chat em Tempo Real Porta a Porta
          </span>
          <span className="text-[10px] text-blue-600 font-bold bg-blue-100 px-2 py-0.5 rounded-md">
            Sincronizado
          </span>
        </div>

        {/* Corpo das Mensagens */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
          {messages.map((msg) => {
            const isMe = msg.senderRole === userRole;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <span className="text-[10px] text-slate-400 mb-0.5 font-medium px-1">
                  {msg.senderName} • {msg.timestamp}
                </span>
                <div
                  className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs font-medium shadow-sm leading-relaxed ${
                    isMe
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-white text-slate-900 border border-slate-200 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {quickSuggestions.map((sug, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(sug)}
              className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 text-[11px] font-semibold rounded-full whitespace-nowrap transition-all shrink-0 active:scale-95"
            >
              💬 {sug}
            </button>
          ))}
        </div>

        {/* Input Footer */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputText);
          }}
          className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Digite sua mensagem sobre o embarque..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-2xl shadow-sm transition-all active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
