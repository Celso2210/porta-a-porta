import { db } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  serverTimestamp,
  getDocs
} from 'firebase/firestore';

export interface NotificacaoFCM {
  id: string;
  usuarioUid: string;
  fcmToken?: string;
  titulo: string;
  mensagem: string;
  tipo: 'aproximacao_5min' | 'proposta_motorista' | 'confirmacao_passageiro' | 'embarque' | 'chat' | 'geral' | 'corrida_aceita';
  viagemId?: string;
  solicitacaoId?: string;
  motoristaNome?: string;
  motoristaTelefone?: string;
  motoristaVeiculo?: string;
  motoristaPlaca?: string;
  motoristaAvatar?: string;
  motoristaNota?: number;
  passageiroNome?: string;
  horarioSaida?: string;
  origem?: string;
  destino?: string;
  enderecoEmbarque?: string;
  minutosAteEmbarque?: number;
  lida: boolean;
  criadoEm?: any;
}

// Simulador de Token FCM Web
const MOCK_FCM_TOKEN = "fcm_token_web_portaaporta_" + Math.random().toString(36).substring(2, 10);

/**
 * Solicita permissão para Notificações Web Push (FCM API)
 */
export async function solicitarPermissaoFCM(): Promise<string | null> {
  if (!('Notification' in window)) {
    console.warn("Este navegador não suporta Notificações Web.");
    return MOCK_FCM_TOKEN;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log("Permissão de notificações FCM concedida!");
      return MOCK_FCM_TOKEN;
    }
  } catch (error) {
    console.error("Erro ao solicitar permissão FCM:", error);
  }
  return MOCK_FCM_TOKEN;
}

/**
 * Envia uma notificação de proposta quando o motorista clica em "Aceitar Passageiro"
 */
export async function enviarNotificacaoPropostaMotorista(
  usuarioUid: string,
  motoristaNome: string,
  horarioSaida: string,
  rota: string,
  solicitacaoId: string
) {
  const fcmToken = await solicitarPermissaoFCM();

  const novaNotificacao: Omit<NotificacaoFCM, 'id'> = {
    usuarioUid: usuarioUid || 'celso_passageiro',
    fcmToken: fcmToken || MOCK_FCM_TOKEN,
    titulo: '🎉 Motorista aceitou sua viagem!',
    mensagem: `O motorista ${motoristaNome} aceitou sua solicitação para ${rota}. Saída prevista para ${horarioSaida}. Confirme seu embarque!`,
    tipo: 'proposta_motorista',
    solicitacaoId,
    motoristaNome,
    horarioSaida,
    lida: false,
    criadoEm: serverTimestamp()
  };

  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(novaNotificacao.titulo, {
        body: novaNotificacao.mensagem,
        icon: '/favicon.ico',
        tag: `proposta_${solicitacaoId}`
      });
    } catch (e) {
      console.warn("Falha ao disparar Web Notification nativa:", e);
    }
  }

  try {
    const notifRef = collection(db, 'notificacoes');
    const docRef = await addDoc(notifRef, novaNotificacao);
    return docRef.id;
  } catch (error) {
    console.error("Erro ao salvar notificação de proposta no Firestore:", error);
    return null;
  }
}

/**
 * Envia notificação destacada ao passageiro quando o motorista aceita a corrida.
 * Exibe modal toast com foto do motorista, dados do carro e botão direto de WhatsApp.
 */
export async function enviarNotificacaoCorridaAceita(dados: {
  usuarioUid: string;
  motoristaNome: string;
  motoristaTelefone: string;
  motoristaVeiculo: string;
  motoristaPlaca?: string;
  motoristaAvatar?: string;
  motoristaNota?: number;
  passageiroNome: string;
  horarioSaida: string;
  origem: string;
  destino: string;
  enderecoEmbarque?: string;
  solicitacaoId: string;
}) {
  const fcmToken = await solicitarPermissaoFCM();

  const novaNotificacao: Omit<NotificacaoFCM, 'id'> = {
    usuarioUid: dados.usuarioUid || 'celso_passageiro',
    fcmToken: fcmToken || MOCK_FCM_TOKEN,
    titulo: `🚗 Motorista ${dados.motoristaNome} aceitou sua corrida!`,
    mensagem: `Motorista ${dados.motoristaNome} aceitou sua corrida! Prepare-se para o embarque.`,
    tipo: 'corrida_aceita',
    solicitacaoId: dados.solicitacaoId,
    motoristaNome: dados.motoristaNome,
    motoristaTelefone: dados.motoristaTelefone,
    motoristaVeiculo: dados.motoristaVeiculo,
    motoristaPlaca: dados.motoristaPlaca,
    motoristaAvatar: dados.motoristaAvatar,
    motoristaNota: dados.motoristaNota || 4.9,
    passageiroNome: dados.passageiroNome,
    horarioSaida: dados.horarioSaida,
    origem: dados.origem,
    destino: dados.destino,
    enderecoEmbarque: dados.enderecoEmbarque,
    lida: false,
    criadoEm: serverTimestamp()
  };

  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(`🚗 ${dados.motoristaNome} aceitou sua corrida!`, {
        body: `Veículo: ${dados.motoristaVeiculo} • Placa: ${dados.motoristaPlaca || 'Identificada'}. Toque para abrir o WhatsApp.`,
        icon: dados.motoristaAvatar || '/favicon.ico',
        tag: `aceite_${dados.solicitacaoId}`
      });
    } catch (e) {
      console.warn("Falha ao disparar Web Notification nativa:", e);
    }
  }

  try {
    const notifRef = collection(db, 'notificacoes');
    const docRef = await addDoc(notifRef, novaNotificacao);
    return docRef.id;
  } catch (error) {
    console.error("Erro ao salvar notificação de aceite no Firestore:", error);
    return null;
  }
}

/**
 * Envia uma notificação ao motorista quando o passageiro confirma a viagem
 */
export async function enviarNotificacaoConfirmacaoPassageiro(
  motoristaUid: string,
  passageiroNome: string,
  horarioSaida: string,
  rota: string,
  solicitacaoId: string
) {
  const fcmToken = await solicitarPermissaoFCM();

  const novaNotificacao: Omit<NotificacaoFCM, 'id'> = {
    usuarioUid: motoristaUid || 'MOT_01',
    fcmToken: fcmToken || MOCK_FCM_TOKEN,
    titulo: '✅ Passageiro Confirmado!',
    mensagem: `${passageiroNome} confirmou o embarque para as ${horarioSaida} na rota ${rota}. Waypoint adicionado ao seu GPS!`,
    tipo: 'confirmacao_passageiro',
    solicitacaoId,
    passageiroNome,
    horarioSaida,
    lida: false,
    criadoEm: serverTimestamp()
  };

  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(novaNotificacao.titulo, {
        body: novaNotificacao.mensagem,
        icon: '/favicon.ico',
        tag: `confirmacao_${solicitacaoId}`
      });
    } catch (e) {
      console.warn("Falha ao disparar Web Notification nativa:", e);
    }
  }

  try {
    const notifRef = collection(db, 'notificacoes');
    const docRef = await addDoc(notifRef, novaNotificacao);
    return docRef.id;
  } catch (error) {
    console.error("Erro ao salvar notificação de confirmação no Firestore:", error);
    return null;
  }
}

/**
 * Envia uma notificação quando o motorista chega ao local de embarque
 */
export async function enviarNotificacaoMotoristaChegou(
  usuarioUid: string,
  motoristaNome: string,
  endereco: string,
  solicitacaoId?: string
) {
  const fcmToken = await solicitarPermissaoFCM();

  const novaNotificacao = {
    usuarioUid: usuarioUid || 'celso_passageiro',
    fcmToken: fcmToken || MOCK_FCM_TOKEN,
    titulo: '📍 Motorista Chegou ao seu Endereço!',
    mensagem: `O motorista ${motoristaNome} acabou de chegar em ${endereco}. Por favor, dirija-se ao veículo.`,
    tipo: 'embarque' as const,
    solicitacaoId,
    motoristaNome,
    lida: false,
    criadoEm: serverTimestamp()
  };

  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(novaNotificacao.titulo, {
        body: novaNotificacao.mensagem,
        icon: '/favicon.ico',
        tag: `chegou_${solicitacaoId || 'trip'}`
      });
    } catch (e) {
      console.warn("Falha ao disparar Web Notification nativa:", e);
    }
  }

  try {
    const notifRef = collection(db, 'notificacoes');
    const docRef = await addDoc(notifRef, novaNotificacao);
    return docRef.id;
  } catch (error) {
    console.error("Erro ao salvar notificação de chegada:", error);
    return null;
  }
}

/**
 * Envia uma notificação de aproximação de 5 minutos ao Firestore (coleção 'notificacoes')
 * e dispara alerta Web Push via FCM.
 */
export async function enviarNotificacao5Minutos(
  usuarioUid: string, 
  motoristaNome: string,
  viagemId: string = 'VG000123'
) {
  const fcmToken = await solicitarPermissaoFCM();

  const novaNotificacao = {
    usuarioUid: usuarioUid || 'celso_passageiro',
    fcmToken: fcmToken || MOCK_FCM_TOKEN,
    titulo: '🚗 Motorista a 5 minutos!',
    mensagem: `O motorista ${motoristaNome} está a aproximadamente 5 minutos do seu ponto de embarque porta a porta. Esteja pronto(a)!`,
    tipo: 'aproximacao_5min' as const,
    viagemId,
    motoristaNome,
    minutosAteEmbarque: 5,
    lida: false,
    criadoEm: serverTimestamp()
  };

  // Dispara Notificação Nativa do Navegador se permitido
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(novaNotificacao.titulo, {
        body: novaNotificacao.mensagem,
        icon: '/favicon.ico',
        tag: `5min_${viagemId}`
      });
    } catch (e) {
      console.warn("Falha ao disparar Web Notification nativa:", e);
    }
  }

  // Grava na coleção 'notificacoes' no Firestore
  try {
    const notifRef = collection(db, 'notificacoes');
    const docRef = await addDoc(notifRef, novaNotificacao);
    console.log("Notificação de 5 minutos salva na coleção 'notificacoes' com ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Erro ao salvar notificação no Firestore:", error);
    return null;
  }
}

/**
 * Ouve em tempo real as notificações do usuário na coleção 'notificacoes'
 */
export function ouvirNotificacoesUsuario(
  usuarioUid: string,
  onUpdate: (notificacoes: NotificacaoFCM[]) => void
) {
  try {
    const notifRef = collection(db, 'notificacoes');
    const q = query(
      notifRef, 
      where('usuarioUid', '==', usuarioUid || 'celso_passageiro'),
      orderBy('criadoEm', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: NotificacaoFCM[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          usuarioUid: data.usuarioUid,
          fcmToken: data.fcmToken,
          titulo: data.titulo,
          mensagem: data.mensagem,
          tipo: data.tipo,
          viagemId: data.viagemId,
          motoristaNome: data.motoristaNome,
          minutosAteEmbarque: data.minutosAteEmbarque,
          lida: data.lida ?? false,
          criadoEm: data.criadoEm
        };
      });
      onUpdate(items);
    }, (error) => {
      console.warn("Aviso ao ouvir Firestore 'notificacoes':", error);
    });

    return unsubscribe;
  } catch (error) {
    console.error("Erro ao configurar listener de notificações:", error);
    return () => {};
  }
}

/**
 * Marcar notificação como lida no Firestore
 */
export async function marcarNotificacaoComoLida(notificacaoId: string) {
  try {
    const docRef = doc(db, 'notificacoes', notificacaoId);
    await updateDoc(docRef, { lida: true });
  } catch (error) {
    console.error("Erro ao marcar notificação como lida:", error);
  }
}
