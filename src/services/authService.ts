import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc 
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserRole } from '../types';

export interface RegisterPassageiroInput {
  nome: string;
  email: string;
  senha: string;
  telefone: string;
  cpf?: string;
  fotoUrl?: string;
  cidadePadrao?: string;
}

export interface RegisterMotoristaInput {
  nome: string;
  email: string;
  senha: string;
  telefone: string;
  cpf?: string;
  fotoUrl?: string;
  cnh: string;
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
  statusAprovacao?: string;
  veiculo?: {
    modelo: string;
    placa: string;
    cor: string;
    ano?: string;
    capacidadePassageiros: number;
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
    statusAprovacao: 'aprovado',
    veiculo: {
      modelo: input.modeloVeiculo,
      placa: input.placaVeiculo,
      cor: input.corVeiculo,
      ano: input.anoVeiculo || '2022',
      capacidadePassageiros: input.capacidadePassageiros || 4
    },
    criadoEm
  };

  // Salva perfil geral na coleção 'usuarios'
  await setDoc(doc(db, 'usuarios', user.uid), usuarioProfile);

  // Salva dados específicos de motorista na coleção 'motoristas'
  await setDoc(doc(db, 'motoristas', user.uid), motoristaData);

  return {
    ...usuarioProfile,
    cnh: input.cnh,
    statusAprovacao: 'aprovado',
    veiculo: motoristaData.veiculo
  };
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
