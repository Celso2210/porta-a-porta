import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc,
  updateDoc 
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserRole } from '../types';
import { salvarDocumentosMotorista, salvarDocumentosPassageiro } from './documentService';

export interface RegisterPassageiroInput {
  nome: string;
  email: string;
  senha: string;
  telefone: string;
  cpf?: string;
  fotoUrl?: string;
  cidadePadrao?: string;
  documentoNumero?: string;
  documentoFotoUrl?: string;
}

export interface RegisterMotoristaInput {
  nome: string;
  email: string;
  senha: string;
  telefone: string;
  cpf?: string;
  fotoUrl?: string;
  cnh: string;
  cnhFotoUrl?: string;
  crlvNumero?: string;
  crlvFotoUrl?: string;
  fotoVeiculoUrl?: string;
  fotoVeiculoInteriorUrl?: string;
  modeloVeiculo: string;
  placaVeiculo: string;
  corVeiculo: string;
  anoVeiculo?: string;
  capacidadePassageiros: number;
}

export interface AuthUserProfile {
  uid: string;
  nome: string;
  email: string;
  telefone: string;
  cpf?: string;
  fotoUrl?: string;
  papel: UserRole;
  cidadePadrao?: string;
  cnh?: string;
  cnhFotoUrl?: string;
  crlvNumero?: string;
  crlvFotoUrl?: string;
  fotoVeiculoUrl?: string;
  fotoVeiculoInteriorUrl?: string;
  statusAprovacao?: string;
  veiculo?: {
    modelo: string;
    placa: string;
    cor: string;
    ano?: string;
    capacidadePassageiros: number;
    fotoVeiculoUrl?: string;
    crlvFotoUrl?: string;
  };
  criadoEm: string;
}

/**
 * Cadastra um novo usuário com papel de Passageiro no Firebase Auth e salva no Firestore ('usuarios').
 */
export async function registerPassageiro(input: RegisterPassageiroInput): Promise<AuthUserProfile> {
  const userCredential = await createUserWithEmailAndPassword(auth, input.email, input.senha);
  const user = userCredential.user;

  const profileData: AuthUserProfile = {
    uid: user.uid,
    nome: input.nome,
    email: input.email,
    telefone: input.telefone,
    cpf: input.cpf || '',
    fotoUrl: input.fotoUrl || '',
    papel: 'passageiro',
    cidadePadrao: input.cidadePadrao || 'Água Doce do Norte',
    criadoEm: new Date().toISOString()
  };

  // Salvar na coleção 'usuarios'
  await setDoc(doc(db, 'usuarios', user.uid), profileData);

  // Sincroniza também documentos do passageiro se fornecidos
  if (input.fotoUrl || input.documentoFotoUrl) {
    await salvarDocumentosPassageiro({
      passageiroId: user.uid,
      passageiroNome: input.nome,
      fotoPassageiroUrl: input.fotoUrl || '',
      documentoNumero: input.documentoNumero || '',
      documentoFotoUrl: input.documentoFotoUrl || ''
    });
  }

  return profileData;
}

/**
 * Cadastra um novo usuário com papel de Motorista no Firebase Auth e salva em 'usuarios' e 'motoristas'.
 */
export async function registerMotorista(input: RegisterMotoristaInput): Promise<AuthUserProfile> {
  const userCredential = await createUserWithEmailAndPassword(auth, input.email, input.senha);
  const user = userCredential.user;

  const criadoEm = new Date().toISOString();

  const usuarioProfile: AuthUserProfile = {
    uid: user.uid,
    nome: input.nome,
    email: input.email,
    telefone: input.telefone,
    cpf: input.cpf || '',
    fotoUrl: input.fotoUrl || '',
    papel: 'motorista',
    cnh: input.cnh,
    cnhFotoUrl: input.cnhFotoUrl || '',
    crlvNumero: input.crlvNumero || '',
    crlvFotoUrl: input.crlvFotoUrl || '',
    fotoVeiculoUrl: input.fotoVeiculoUrl || '',
    fotoVeiculoInteriorUrl: input.fotoVeiculoInteriorUrl || '',
    statusAprovacao: 'aprovado',
    veiculo: {
      modelo: input.modeloVeiculo,
      placa: input.placaVeiculo,
      cor: input.corVeiculo,
      ano: input.anoVeiculo || '2022',
      capacidadePassageiros: input.capacidadePassageiros || 4,
      fotoVeiculoUrl: input.fotoVeiculoUrl || '',
      crlvFotoUrl: input.crlvFotoUrl || ''
    },
    criadoEm
  };

  const motoristaData = {
    uid: user.uid,
    nome: input.nome,
    email: input.email,
    telefone: input.telefone,
    cpf: input.cpf || '',
    fotoUrl: input.fotoUrl || '',
    cnh: input.cnh,
    cnhFotoUrl: input.cnhFotoUrl || '',
    crlvNumero: input.crlvNumero || '',
    crlvFotoUrl: input.crlvFotoUrl || '',
    fotoVeiculoUrl: input.fotoVeiculoUrl || '',
    fotoVeiculoInteriorUrl: input.fotoVeiculoInteriorUrl || '',
    statusAprovacao: 'aprovado',
    veiculo: usuarioProfile.veiculo,
    criadoEm
  };

  // Salva perfil geral na coleção 'usuarios'
  await setDoc(doc(db, 'usuarios', user.uid), usuarioProfile);

  // Salva dados específicos de motorista na coleção 'motoristas'
  await setDoc(doc(db, 'motoristas', user.uid), motoristaData);

  // Salva e sincroniza documentos completos do motorista para auditoria e exibição imediata
  await salvarDocumentosMotorista({
    motoristaId: user.uid,
    motoristaNome: input.nome,
    fotoMotoristaUrl: input.fotoUrl || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80',
    cnhNumero: input.cnh,
    cnhCategoria: 'B (EAR - Exerce Atividade Remunerada)',
    cnhFotoUrl: input.cnhFotoUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
    fotoVeiculoUrl: input.fotoVeiculoUrl || 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&auto=format&fit=crop&q=80',
    crlvNumero: input.crlvNumero || '88741259632',
    crlvExercicio: input.anoVeiculo || '2026',
    crlvFotoUrl: input.crlvFotoUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80'
  });

  return usuarioProfile;
}

/**
 * Realiza autenticação com a conta Google via Firebase Auth popup
 */
export async function loginWithGoogle(papelDesejado: UserRole = 'passageiro'): Promise<AuthUserProfile> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const userCredential = await signInWithPopup(auth, provider);
  const user = userCredential.user;

  let profile = await getUserProfile(user.uid);
  if (!profile) {
    const criadoEm = new Date().toISOString();
    profile = {
      uid: user.uid,
      nome: user.displayName || 'Usuário Google',
      email: user.email || '',
      telefone: user.phoneNumber || '(27) 99876-5432',
      cpf: '',
      fotoUrl: user.photoURL || '',
      papel: papelDesejado,
      cidadePadrao: 'Água Doce do Norte',
      criadoEm
    };

    if (papelDesejado === 'motorista') {
      profile.cnh = '';
      profile.statusAprovacao = 'aprovado';
      profile.veiculo = {
        modelo: 'Chevrolet Onix Plus',
        placa: 'RQN-4A21',
        cor: 'Prata Metálico',
        ano: '2024',
        capacidadePassageiros: 4
      };

      await setDoc(doc(db, 'motoristas', user.uid), {
        uid: user.uid,
        nome: profile.nome,
        email: profile.email,
        telefone: profile.telefone,
        cpf: '',
        fotoUrl: profile.fotoUrl,
        cnh: '05489214789',
        statusAprovacao: 'aprovado',
        veiculo: profile.veiculo,
        criadoEm
      });
    }

    await setDoc(doc(db, 'usuarios', user.uid), profile);
  }

  return profile;
}

/**
 * Atualiza campos do perfil e fotos no Firestore
 */
export async function updateUserProfile(uid: string, updates: Partial<AuthUserProfile>): Promise<AuthUserProfile> {
  const userDocRef = doc(db, 'usuarios', uid);
  await updateDoc(userDocRef, {
    ...updates,
    atualizadoEm: new Date().toISOString()
  });

  if (updates.papel === 'motorista' || updates.cnh || updates.veiculo) {
    const motRef = doc(db, 'motoristas', uid);
    const motUpdates: any = {};
    if (updates.nome) motUpdates.nome = updates.nome;
    if (updates.telefone) motUpdates.telefone = updates.telefone;
    if (updates.fotoUrl) motUpdates.fotoUrl = updates.fotoUrl;
    if (updates.cnh) motUpdates.cnh = updates.cnh;
    if (updates.veiculo) motUpdates.veiculo = updates.veiculo;
    await setDoc(motRef, motUpdates, { merge: true });

    // Sincroniza também com o documentService
    await salvarDocumentosMotorista({
      motoristaId: uid,
      motoristaNome: updates.nome,
      fotoMotoristaUrl: updates.fotoUrl,
      cnhNumero: updates.cnh,
      cnhFotoUrl: updates.cnhFotoUrl,
      crlvNumero: updates.crlvNumero,
      crlvFotoUrl: updates.crlvFotoUrl,
      fotoVeiculoUrl: updates.fotoVeiculoUrl
    });
  }

  const updated = await getUserProfile(uid);
  if (!updated) throw new Error('Não foi possível recarregar o perfil');
  return updated;
}

/**
 * Realiza o login do usuário (Passageiro ou Motorista) via Firebase Auth e carrega os dados do Firestore.
 */
export async function loginUser(email: string, senha: string): Promise<AuthUserProfile> {
  const userCredential = await signInWithEmailAndPassword(auth, email, senha);
  const user = userCredential.user;

  const profile = await getUserProfile(user.uid);
  if (!profile) {
    throw new Error('Perfil do usuário não encontrado no Firestore.');
  }

  return profile;
}

/**
 * Busca o perfil completo do usuário no Firestore (verificando 'usuarios' e 'motoristas').
 */
export async function getUserProfile(uid: string): Promise<AuthUserProfile | null> {
  const userDocRef = doc(db, 'usuarios', uid);
  const userSnap = await getDoc(userDocRef);

  if (!userSnap.exists()) {
    return null;
  }

  const userData = userSnap.data() as AuthUserProfile;

  // Se for motorista, busca dados complementares do veículo e CNH na coleção 'motoristas'
  if (userData.papel === 'motorista') {
    const motoristaSnap = await getDoc(doc(db, 'motoristas', uid));
    if (motoristaSnap.exists()) {
      const motoristaData = motoristaSnap.data();
      return {
        ...userData,
        cnh: motoristaData.cnh,
        statusAprovacao: motoristaData.statusAprovacao,
        veiculo: motoristaData.veiculo
      };
    }
  }

  return userData;
}

/**
 * Desconecta o usuário do Firebase Auth.
 */
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

/**
 * Listener de mudança de estado de autenticação do Firebase.
 */
export function subscribeToAuthChanges(
  callback: (user: FirebaseUser | null, profile: AuthUserProfile | null) => void
) {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      try {
        const profile = await getUserProfile(firebaseUser.uid);
        callback(firebaseUser, profile);
      } catch (err) {
        console.error('Erro ao buscar perfil do usuário:', err);
        callback(firebaseUser, null);
      }
    } else {
      callback(null, null);
    }
  });
}
