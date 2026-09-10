import { PaymentConfig } from '../types';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const DEFAULT_PAYMENT_CONFIG: PaymentConfig = {
  chavePix: '27999887766',
  tipoChavePix: 'telefone',
  nomeTitularPix: 'Porta a Porta Transportes LTDA',
  cidadePix: 'VITORIA',
  descricaoPix: 'Taxa Reserva Porta a Porta',
  linkCartaoMercadoPago: 'https://link.mercadopago.com.br/portaaporta',
  nomePlataformaCartao: 'Mercado Pago (Cartão de Crédito / Débito)',
  instrucoesPagamento: 'Pague os 10% de taxa de reserva para travar seu assento. Os 90% restantes são pagos no embarque.',
  ativoPix: true,
  ativoCartao: true
};

const STORAGE_KEY = 'portaaporta_payment_config_v1';

let currentPaymentConfig: PaymentConfig = (() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_PAYMENT_CONFIG, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.warn('Erro ao carregar payment config do localStorage:', e);
  }
  return DEFAULT_PAYMENT_CONFIG;
})();

const listeners: Array<(config: PaymentConfig) => void> = [];

export function getPaymentConfig(): PaymentConfig {
  return { ...currentPaymentConfig };
}

export function subscribePaymentConfig(listener: (config: PaymentConfig) => void): () => void {
  listeners.push(listener);
  listener(getPaymentConfig());
  return () => {
    const index = listeners.indexOf(listener);
    if (index > -1) listeners.splice(index, 1);
  };
}

export async function savePaymentConfig(newConfig: PaymentConfig): Promise<void> {
  currentPaymentConfig = { ...newConfig };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentPaymentConfig));
  } catch (e) {
    console.warn('Erro ao salvar payment config no localStorage:', e);
  }

  listeners.forEach(l => l(currentPaymentConfig));

  try {
    const docRef = doc(db, 'configuracoes', 'pagamentos');
    await setDoc(docRef, currentPaymentConfig, { merge: true });
  } catch (err) {
    console.warn('Não foi possível salvar payment config no Firestore (modo offline/local):', err);
  }
}

// Inicializa escuta em tempo real do Firestore se disponível
export function initPaymentConfigSync() {
  try {
    const docRef = doc(db, 'configuracoes', 'pagamentos');
    onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as Partial<PaymentConfig>;
        currentPaymentConfig = { ...DEFAULT_PAYMENT_CONFIG, ...data };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(currentPaymentConfig));
        } catch (_) {}
        listeners.forEach(l => l(currentPaymentConfig));
      }
    }, (err) => {
      console.warn('Aviso sincronizacao Firestore payment config:', err);
    });
  } catch (e) {
    console.warn('Erro ao iniciar sync Firestore payment config:', e);
  }
}

// Inicia sync
initPaymentConfigSync();

/**
 * Utilitário para gerar o Payload Pix padrão Banco Central (BR Code / EMV QRCPS-MPM)
 * com cálculo de CRC16 CCITT.
 */
export function gerarPayloadPixCopiaECola(
  chavePix: string,
  nomeRecebedor: string,
  cidadeRecebedor: string,
  valor: number,
  txId: string = 'PORTAPORTA'
): string {
  const sanitize = (str: string, maxLen: number) => {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .trim()
      .substring(0, maxLen);
  };

  const cleanChave = chavePix.trim();
  const cleanNome = sanitize(nomeRecebedor || 'Porta a Porta', 25).toUpperCase();
  const cleanCidade = sanitize(cidadeRecebedor || 'Vitoria', 15).toUpperCase();
  const cleanTxId = sanitize(txId || 'PORTAPORTA', 25).toUpperCase();
  const formattedValor = valor > 0 ? valor.toFixed(2) : '';

  const formatTLV = (id: string, value: string) => {
    const len = value.length.toString().padStart(2, '0');
    return `${id}${len}${value}`;
  };

  // GUI + Chave Pix
  const gui = formatTLV('00', 'br.gov.bcb.pix');
  const key = formatTLV('01', cleanChave);
  const merchantAccountInfo = formatTLV('26', `${gui}${key}`);

  let payload = '';
  payload += formatTLV('00', '01'); // Payload Format Indicator
  payload += merchantAccountInfo;   // Merchant Account Information
  payload += formatTLV('52', '0000'); // Merchant Category Code
  payload += formatTLV('53', '986');  // Transaction Currency (986 = BRL)
  
  if (formattedValor) {
    payload += formatTLV('54', formattedValor); // Transaction Amount
  }

  payload += formatTLV('58', 'BR');   // Country Code
  payload += formatTLV('59', cleanNome); // Merchant Name
  payload += formatTLV('60', cleanCidade); // Merchant City
  
  const additionalDataField = formatTLV('05', cleanTxId);
  payload += formatTLV('62', additionalDataField); // Additional Data Field Template (TxID)

  payload += '6304'; // CRC16 Header

  // Calcula CRC16 (polinômio 0x1021, valor inicial 0xFFFF)
  const crc = calcularCRC16(payload);
  return `${payload}${crc}`;
}

function calcularCRC16(payload: string): string {
  let crc = 0xFFFF;
  const polynomial = 0x1021;

  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ polynomial) & 0xFFFF;
      } else {
        crc = (crc << 1) & 0xFFFF;
      }
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, '0');
}
