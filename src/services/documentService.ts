import { 
  DocumentosMotorista, 
  DocumentosPassageiro, 
  DocumentVerificationStatus 
} from '../types';
import { db } from '../lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  onSnapshot 
} from 'firebase/firestore';

// Initial state for Driver (José da Silva)
const DEFAULT_MOTORISTA_DOCS: DocumentosMotorista = {
  id: 'DOC_MOT_001',
  motoristaId: 'MOT_001',
  motoristaNome: 'José da Silva',
  fotoMotoristaUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80',
  fotoMotoristaStatus: 'aprovado',
  cnhNumero: '05489214789',
  cnhCategoria: 'B (EAR - Exerce Atividade Remunerada)',
  cnhFotoUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
  cnhStatus: 'aprovado',
  fotoVeiculoUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&auto=format&fit=crop&q=80',
  fotoVeiculoStatus: 'aprovado',
  crlvNumero: '88741259632',
  crlvExercicio: '2026',
  crlvFotoUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
  crlvStatus: 'aprovado',
  statusGeral: 'aprovado',
  dataEnvio: new Date().toISOString()
};

// Initial state for Passenger (Celso)
const DEFAULT_PASSAGEIRO_DOCS: DocumentosPassageiro = {
  id: 'DOC_PASS_001',
  passageiroId: 'USR_001',
  passageiroNome: 'Celso (Passageiro)',
  fotoPassageiroUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
  fotoPassageiroStatus: 'aprovado',
  tipoDocumento: 'cnh',
  documentoNumero: '04128963211',
  documentoFotoUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
  documentoStatus: 'aprovado',
  statusGeral: 'aprovado',
  dataEnvio: new Date().toISOString()
};

const STORAGE_KEY_DRIVER_DOCS = 'portaaporta_motorista_docs';
const STORAGE_KEY_PASSENGER_DOCS = 'portaaporta_passageiro_docs';
const STORAGE_KEY_ALL_DRIVER_DOCS = 'portaaporta_all_drivers_docs';
const STORAGE_KEY_ALL_PASSENGER_DOCS = 'portaaporta_all_passengers_docs';

// In-Memory store
let currentMotoristaDocs: DocumentosMotorista = (() => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DRIVER_DOCS);
    return raw ? JSON.parse(raw) : DEFAULT_MOTORISTA_DOCS;
  } catch {
    return DEFAULT_MOTORISTA_DOCS;
  }
})();

let currentPassageiroDocs: DocumentosPassageiro = (() => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PASSENGER_DOCS);
    return raw ? JSON.parse(raw) : DEFAULT_PASSAGEIRO_DOCS;
  } catch {
    return DEFAULT_PASSAGEIRO_DOCS;
  }
})();

let allDriversDocsList: DocumentosMotorista[] = (() => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ALL_DRIVER_DOCS);
    return raw ? JSON.parse(raw) : [DEFAULT_MOTORISTA_DOCS];
  } catch {
    return [DEFAULT_MOTORISTA_DOCS];
  }
})();

let allPassengersDocsList: DocumentosPassageiro[] = (() => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ALL_PASSENGER_DOCS);
    return raw ? JSON.parse(raw) : [DEFAULT_PASSAGEIRO_DOCS];
  } catch {
    return [DEFAULT_PASSAGEIRO_DOCS];
  }
})();

const listeners: Array<() => void> = [];

function notifyListeners() {
  listeners.forEach(fn => fn());
}

export function subscribeToDocuments(callback: () => void) {
  listeners.push(callback);
  return () => {
    const idx = listeners.indexOf(callback);
    if (idx !== -1) listeners.splice(idx, 1);
  };
}

export function getMotoristaDocs(): DocumentosMotorista {
  return { ...currentMotoristaDocs };
}

export function getPassageiroDocs(): DocumentosPassageiro {
  return { ...currentPassageiroDocs };
}

export function getAllDriversDocs(): DocumentosMotorista[] {
  return [...allDriversDocsList];
}

export function getAllPassengersDocs(): DocumentosPassageiro[] {
  return [...allPassengersDocsList];
}

export async function salvarDocumentosMotorista(docsData: Partial<DocumentosMotorista>): Promise<DocumentosMotorista> {
  const updated: DocumentosMotorista = {
    ...currentMotoristaDocs,
    ...docsData,
    dataEnvio: new Date().toISOString()
  };

  // Determine overall status
  if (
    updated.fotoMotoristaUrl && 
    updated.cnhFotoUrl && 
    updated.fotoVeiculoUrl && 
    updated.crlvFotoUrl
  ) {
    if (
      updated.fotoMotoristaStatus === 'aprovado' &&
      updated.cnhStatus === 'aprovado' &&
      updated.fotoVeiculoStatus === 'aprovado' &&
      updated.crlvStatus === 'aprovado'
    ) {
      updated.statusGeral = 'aprovado';
    } else if (
      updated.fotoMotoristaStatus === 'rejeitado' ||
      updated.cnhStatus === 'rejeitado' ||
      updated.fotoVeiculoStatus === 'rejeitado' ||
      updated.crlvStatus === 'rejeitado'
    ) {
      updated.statusGeral = 'rejeitado';
    } else {
      updated.statusGeral = 'em_analise';
    }
  } else {
    updated.statusGeral = 'pendente';
  }

  currentMotoristaDocs = updated;
  try {
    localStorage.setItem(STORAGE_KEY_DRIVER_DOCS, JSON.stringify(updated));
  } catch (err) {
    console.warn('Erro ao salvar no localStorage', err);
  }

  // Update in all drivers list
  const idx = allDriversDocsList.findIndex(d => d.motoristaId === updated.motoristaId);
  if (idx >= 0) {
    allDriversDocsList[idx] = updated;
  } else {
    allDriversDocsList.push(updated);
  }
  try {
    localStorage.setItem(STORAGE_KEY_ALL_DRIVER_DOCS, JSON.stringify(allDriversDocsList));
  } catch (e) {}

  // Sync to Firestore
  try {
    await setDoc(doc(db, 'documentos_motoristas', updated.motoristaId), updated);
  } catch (err) {
    console.warn('Firestore offline, salvo localmente:', err);
  }

  notifyListeners();
  return updated;
}

export async function salvarDocumentosPassageiro(docsData: Partial<DocumentosPassageiro>): Promise<DocumentosPassageiro> {
  const updated: DocumentosPassageiro = {
    ...currentPassageiroDocs,
    ...docsData,
    dataEnvio: new Date().toISOString()
  };

  // Determine overall status
  if (updated.fotoPassageiroUrl && updated.documentoFotoUrl) {
    if (updated.fotoPassageiroStatus === 'aprovado' && updated.documentoStatus === 'aprovado') {
      updated.statusGeral = 'aprovado';
    } else if (updated.fotoPassageiroStatus === 'rejeitado' || updated.documentoStatus === 'rejeitado') {
      updated.statusGeral = 'rejeitado';
    } else {
      updated.statusGeral = 'em_analise';
    }
  } else {
    updated.statusGeral = 'pendente';
  }

  currentPassageiroDocs = updated;
  try {
    localStorage.setItem(STORAGE_KEY_PASSENGER_DOCS, JSON.stringify(updated));
  } catch (err) {
    console.warn('Erro ao salvar no localStorage', err);
  }

  // Update in all passengers list
  const idx = allPassengersDocsList.findIndex(p => p.passageiroId === updated.passageiroId);
  if (idx >= 0) {
    allPassengersDocsList[idx] = updated;
  } else {
    allPassengersDocsList.push(updated);
  }
  try {
    localStorage.setItem(STORAGE_KEY_ALL_PASSENGER_DOCS, JSON.stringify(allPassengersDocsList));
  } catch (e) {}

  // Sync to Firestore
  try {
    await setDoc(doc(db, 'documentos_passageiros', updated.passageiroId), updated);
  } catch (err) {
    console.warn('Firestore offline, salvo localmente:', err);
  }

  notifyListeners();
  return updated;
}

// Admin Action: Update Driver Document Status
export async function atualizarStatusDocumentoMotorista(
  motoristaId: string, 
  campo: 'fotoMotorista' | 'cnh' | 'fotoVeiculo' | 'crlv' | 'todos',
  novoStatus: DocumentVerificationStatus,
  motivo?: string
): Promise<void> {
  const docItem = allDriversDocsList.find(d => d.motoristaId === motoristaId) || currentMotoristaDocs;
  if (campo === 'todos') {
    docItem.fotoMotoristaStatus = novoStatus;
    docItem.cnhStatus = novoStatus;
    docItem.fotoVeiculoStatus = novoStatus;
    docItem.crlvStatus = novoStatus;
    docItem.statusGeral = novoStatus;
  } else if (campo === 'fotoMotorista') {
    docItem.fotoMotoristaStatus = novoStatus;
  } else if (campo === 'cnh') {
    docItem.cnhStatus = novoStatus;
  } else if (campo === 'fotoVeiculo') {
    docItem.fotoVeiculoStatus = novoStatus;
  } else if (campo === 'crlv') {
    docItem.crlvStatus = novoStatus;
  }

  if (motivo) {
    docItem.observacoesAnalise = motivo;
  }

  if (docItem.fotoMotoristaStatus === 'aprovado' && docItem.cnhStatus === 'aprovado' && docItem.fotoVeiculoStatus === 'aprovado' && docItem.crlvStatus === 'aprovado') {
    docItem.statusGeral = 'aprovado';
  } else if (docItem.fotoMotoristaStatus === 'rejeitado' || docItem.cnhStatus === 'rejeitado' || docItem.fotoVeiculoStatus === 'rejeitado' || docItem.crlvStatus === 'rejeitado') {
    docItem.statusGeral = 'rejeitado';
  } else {
    docItem.statusGeral = 'em_analise';
  }

  if (currentMotoristaDocs.motoristaId === motoristaId) {
    currentMotoristaDocs = { ...docItem };
    localStorage.setItem(STORAGE_KEY_DRIVER_DOCS, JSON.stringify(currentMotoristaDocs));
  }

  localStorage.setItem(STORAGE_KEY_ALL_DRIVER_DOCS, JSON.stringify(allDriversDocsList));

  try {
    await setDoc(doc(db, 'documentos_motoristas', motoristaId), docItem);
  } catch (err) {
    console.warn('Offline Firestore update:', err);
  }

  notifyListeners();
}

// Admin Action: Update Passenger Document Status
export async function atualizarStatusDocumentoPassageiro(
  passageiroId: string,
  campo: 'fotoPassageiro' | 'documento' | 'todos',
  novoStatus: DocumentVerificationStatus,
  motivo?: string
): Promise<void> {
  const docItem = allPassengersDocsList.find(p => p.passageiroId === passageiroId) || currentPassageiroDocs;
  if (campo === 'todos') {
    docItem.fotoPassageiroStatus = novoStatus;
    docItem.documentoStatus = novoStatus;
    docItem.statusGeral = novoStatus;
  } else if (campo === 'fotoPassageiro') {
    docItem.fotoPassageiroStatus = novoStatus;
  } else if (campo === 'documento') {
    docItem.documentoStatus = novoStatus;
  }

  if (motivo) {
    docItem.observacoesAnalise = motivo;
  }

  if (docItem.fotoPassageiroStatus === 'aprovado' && docItem.documentoStatus === 'aprovado') {
    docItem.statusGeral = 'aprovado';
  } else if (docItem.fotoPassageiroStatus === 'rejeitado' || docItem.documentoStatus === 'rejeitado') {
    docItem.statusGeral = 'rejeitado';
  } else {
    docItem.statusGeral = 'em_analise';
  }

  if (currentPassageiroDocs.passageiroId === passageiroId) {
    currentPassageiroDocs = { ...docItem };
    localStorage.setItem(STORAGE_KEY_PASSENGER_DOCS, JSON.stringify(currentPassageiroDocs));
  }

  localStorage.setItem(STORAGE_KEY_ALL_PASSENGER_DOCS, JSON.stringify(allPassengersDocsList));

  try {
    await setDoc(doc(db, 'documentos_passageiros', passageiroId), docItem);
  } catch (err) {
    console.warn('Offline Firestore update:', err);
  }

  notifyListeners();
}
