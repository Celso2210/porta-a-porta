import React, { useState, useEffect, useRef } from 'react';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn, 
  LogOut, 
  Camera, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Car, 
  User, 
  FileText, 
  ShieldCheck, 
  Sparkles, 
  X, 
  ArrowRight, 
  Smartphone, 
  CreditCard,
  Check,
  ChevronRight,
  RefreshCw,
  Clock,
  Layers,
  Phone
} from 'lucide-react';
import { 
  loginUser, 
  loginWithGoogle, 
  registerPassageiro, 
  registerMotorista, 
  logoutUser, 
  subscribeToAuthChanges, 
  updateUserProfile,
  AuthUserProfile 
} from '../../services/authService';
import { salvarDocumentosMotorista, salvarDocumentosPassageiro, getMotoristaDocs, getPassageiroDocs } from '../../services/documentService';
import { UserRole } from '../../types';

interface PortaAPortaLoginViewProps {
  onSuccess?: (profile: AuthUserProfile) => void;
  onNavigateToPassenger?: () => void;
  onNavigateToDriver?: () => void;
  initialMode?: 'login' | 'register' | 'profile';
}

export const PortaAPortaLoginView: React.FC<PortaAPortaLoginViewProps> = ({
  onSuccess,
  onNavigateToPassenger,
  onNavigateToDriver,
  initialMode = 'login'
}) => {
  const [currentUser, setCurrentUser] = useState<AuthUserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [mode, setMode] = useState<'login' | 'register' | 'profile'>(initialMode);
  const [role, setRole] = useState<UserRole>('passageiro');
  
  // Mensagens
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Campos de Login
  const [emailLogin, setEmailLogin] = useState('');
  const [senhaLogin, setSenhaLogin] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);

  // Campos de Cadastro
  const [nome, setNome] = useState('');
  const [emailCad, setEmailCad] = useState('');
  const [senhaCad, setSenhaCad] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cpf, setCpf] = useState('');

  // Fotos do Passageiro e Motorista
  const [fotoPerfil, setFotoPerfil] = useState<string>('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80');
  
  // Documentos & Fotos do Motorista
  const [cnhNumero, setCnhNumero] = useState('05489214789');
  const [cnhFoto, setCnhFoto] = useState<string>('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80');
  const [crlvNumero, setCrlvNumero] = useState('88741259632');
  const [crlvFoto, setCrlvFoto] = useState<string>('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80');
  const [fotoVeiculoFrente, setFotoVeiculoFrente] = useState<string>('https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&auto=format&fit=crop&q=80');
  const [fotoVeiculoInterior, setFotoVeiculoInterior] = useState<string>('https://images.unsplash.com/photo-1563720223185-11003d516935?w=600&auto=format&fit=crop&q=80');

  // Dados do Veículo
  const [modeloVeiculo, setModeloVeiculo] = useState('Chevrolet Onix Plus');
  const [placaVeiculo, setPlacaVeiculo] = useState('RQN-4A21');
  const [corVeiculo, setCorVeiculo] = useState('Prata Metálico');
  const [anoVeiculo, setAnoVeiculo] = useState('2024');
  const [capacidadePassageiros, setCapacidadePassageiros] = useState(4);

  // Referências para upload de arquivos
  const fileInputPerfilRef = useRef<HTMLInputElement>(null);
  const fileInputCnhRef = useRef<HTMLInputElement>(null);
  const fileInputCrlvRef = useRef<HTMLInputElement>(null);
  const fileInputCarroFrenteRef = useRef<HTMLInputElement>(null);
  const fileInputCarroInteriorRef = useRef<HTMLInputElement>(null);

  // Escuta autenticação do Firebase
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((_, profile) => {
      setCurrentUser(profile);
      setAuthLoading(false);
      if (profile) {
        setRole(profile.papel);
        setNome(profile.nome || '');
        setTelefone(profile.telefone || '');
        setCpf(profile.cpf || '');
        if (profile.fotoUrl) setFotoPerfil(profile.fotoUrl);
        if (profile.cnh) setCnhNumero(profile.cnh);
        if (profile.cnhFotoUrl) setCnhFoto(profile.cnhFotoUrl);
        if (profile.crlvNumero) setCrlvNumero(profile.crlvNumero);
        if (profile.crlvFotoUrl) setCrlvFoto(profile.crlvFotoUrl);
        if (profile.fotoVeiculoUrl) setFotoVeiculoFrente(profile.fotoVeiculoUrl);
        if (profile.fotoVeiculoInteriorUrl) setFotoVeiculoInterior(profile.fotoVeiculoInteriorUrl);
        if (profile.veiculo) {
          setModeloVeiculo(profile.veiculo.modelo || 'Chevrolet Onix Plus');
          setPlacaVeiculo(profile.veiculo.placa || 'RQN-4A21');
          setCorVeiculo(profile.veiculo.cor || 'Prata Metálico');
          setAnoVeiculo(profile.veiculo.ano || '2024');
          setCapacidadePassageiros(profile.veiculo.capacidadePassageiros || 4);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Formatador de Celular
  const handleTelefoneChange = (v: string) => {
    const nums = v.replace(/\D/g, '').slice(0, 11);
    if (nums.length <= 2) setTelefone(nums);
    else if (nums.length <= 7) setTelefone(`(${nums.slice(0, 2)}) ${nums.slice(2)}`);
    else setTelefone(`(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`);
  };

  // Formatador de CPF
  const handleCpfChange = (v: string) => {
    const nums = v.replace(/\D/g, '').slice(0, 11);
    if (nums.length <= 3) setCpf(nums);
    else if (nums.length <= 6) setCpf(`${nums.slice(0, 3)}.${nums.slice(3)}`);
    else if (nums.length <= 9) setCpf(`${nums.slice(0, 3)}.${nums.slice(3, 6)}.${nums.slice(6)}`);
    else setCpf(`${nums.slice(0, 3)}.${nums.slice(3, 6)}.${nums.slice(6, 9)}-${nums.slice(9)}`);
  };

  // Processador genérico de upload de imagem para base64
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setErrorMsg('O arquivo é muito grande. Escolha uma imagem de até 8MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setter(reader.result);
          setSuccessMsg('Foto carregada com sucesso!');
          setTimeout(() => setSuccessMsg(null), 3000);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Ação de Login E-mail e Senha
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setActionLoading(true);

    try {
      const profile = await loginUser(emailLogin, senhaLogin);
      setCurrentUser(profile);
      setSuccessMsg(`Bem-vindo(a) de volta, ${profile.nome}!`);
      if (onSuccess) onSuccess(profile);
      if (profile.papel === 'motorista' && onNavigateToDriver) {
        setTimeout(onNavigateToDriver, 1200);
      } else if (onNavigateToPassenger) {
        setTimeout(onNavigateToPassenger, 1200);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setErrorMsg('E-mail ou senha incorretos. Verifique seus dados.');
      } else if (err.code === 'auth/user-not-found') {
        setErrorMsg('Nenhum usuário cadastrado com este e-mail.');
      } else {
        setErrorMsg(err.message || 'Erro ao conectar. Tente novamente.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Ação de Login com Google
  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setActionLoading(true);

    try {
      const profile = await loginWithGoogle(role);
      setCurrentUser(profile);
      setSuccessMsg(`Autenticado com sucesso via Google! Olá, ${profile.nome}.`);
      if (onSuccess) onSuccess(profile);
      if (profile.papel === 'motorista' && onNavigateToDriver) {
        setTimeout(onNavigateToDriver, 1200);
      } else if (onNavigateToPassenger) {
        setTimeout(onNavigateToPassenger, 1200);
      }
    } catch (err: any) {
      console.error('Erro Google Auth:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMsg('A janela de login do Google foi fechada antes da conclusão.');
      } else if (err.code === 'auth/popup-blocked') {
        setErrorMsg('O navegador bloqueou a janela pop-up do Google. Permita pop-ups ou use e-mail e senha.');
      } else {
        setErrorMsg('Não foi possível conectar com o Google. Se estiver dentro de iframe restrito, utilize o login por E-mail ou Demo.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Ação de Cadastro
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setActionLoading(true);

    try {
      let profile: AuthUserProfile;
      if (role === 'motorista') {
        profile = await registerMotorista({
          nome,
          email: emailCad,
          senha: senhaCad,
          telefone,
          cpf,
          fotoUrl: fotoPerfil,
          cnh: cnhNumero,
          cnhFotoUrl: cnhFoto,
          crlvNumero: crlvNumero,
          crlvFotoUrl: crlvFoto,
          fotoVeiculoUrl: fotoVeiculoFrente,
          fotoVeiculoInteriorUrl: fotoVeiculoInterior,
          modeloVeiculo,
          placaVeiculo,
          corVeiculo,
          anoVeiculo,
          capacidadePassageiros
        });
      } else {
        profile = await registerPassageiro({
          nome,
          email: emailCad,
          senha: senhaCad,
          telefone,
          cpf,
          fotoUrl: fotoPerfil,
          cidadePadrao: 'Água Doce do Norte'
        });
      }

      setCurrentUser(profile);
      setSuccessMsg(`Conta criada com sucesso! Seja muito bem-vindo(a), ${profile.nome}.`);
      if (onSuccess) onSuccess(profile);
      if (role === 'motorista' && onNavigateToDriver) {
        setTimeout(onNavigateToDriver, 1400);
      } else if (onNavigateToPassenger) {
        setTimeout(onNavigateToPassenger, 1400);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('Este e-mail já está em uso por outra conta. Faça login.');
      } else if (err.code === 'auth/weak-password') {
        setErrorMsg('A senha deve ter no mínimo 6 caracteres.');
      } else {
        setErrorMsg(err.message || 'Erro ao realizar cadastro.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Ação de Atualizar Perfil e Fotos do Usuário Logado
  const handleSalvarEdicaoPerfil = async () => {
    if (!currentUser) return;
    setActionLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const updates: Partial<AuthUserProfile> = {
        nome,
        telefone,
        cpf,
        fotoUrl: fotoPerfil,
        cnh: cnhNumero,
        cnhFotoUrl: cnhFoto,
        crlvNumero: crlvNumero,
        crlvFotoUrl: crlvFoto,
        fotoVeiculoUrl: fotoVeiculoFrente,
        fotoVeiculoInteriorUrl: fotoVeiculoInterior,
        veiculo: {
          modelo: modeloVeiculo,
          placa: placaVeiculo,
          cor: corVeiculo,
          ano: anoVeiculo,
          capacidadePassageiros: capacidadePassageiros,
          fotoVeiculoUrl: fotoVeiculoFrente,
          crlvFotoUrl: crlvFoto
        }
      };

      const updated = await updateUserProfile(currentUser.uid, updates);
      setCurrentUser(updated);
      setSuccessMsg('Fotos e perfil atualizados e sincronizados com sucesso!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao salvar fotos e documentos.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[85vh] flex items-center justify-center p-2 sm:p-4 bg-gradient-to-b from-emerald-100/80 via-emerald-50/50 to-emerald-100/60 rounded-3xl">
      {/* Moldura de Smartphone inspirada no Mockup 01 TELA LOGIN */}
      <div className="w-full max-w-md bg-white rounded-3xl sm:rounded-[36px] shadow-2xl border border-emerald-200/80 overflow-hidden relative transition-all">
        
        {/* Barra superior de status do celular */}
        <div className="pt-3 px-6 pb-2 flex items-center justify-between text-xs font-semibold text-slate-500 select-none">
          <span>9:41</span>
          <div className="flex items-center gap-1.5 text-slate-700">
            <span className="text-[10px]">5G</span>
            <div className="w-5 h-2.5 border border-slate-700 rounded-xs p-0.5 flex items-center">
              <div className="h-full w-3 bg-emerald-600 rounded-2xs"></div>
            </div>
          </div>
        </div>

        {/* LOGO & CABEÇALHO DO PORTA A PORTA (Fiel ao mockup) */}
        <div className="pt-3 pb-5 px-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 mb-3 shadow-inner">
            {/* Ícone estilizado do Porta a Porta (porta dobrada com pin no centro) */}
            <svg 
              className="w-10 h-10 text-emerald-600" 
              viewBox="0 0 48 48" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="8" y="6" width="32" height="36" rx="6" stroke="currentColor" strokeWidth="4" />
              <path d="M24 6V42" stroke="currentColor" strokeWidth="3" strokeDasharray="3 3" />
              <circle cx="24" cy="22" r="6" fill="#10B981" />
              <circle cx="24" cy="22" r="2.5" fill="white" />
              <path d="M24 28V33" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-emerald-950 tracking-tight">
            Porta a Porta
          </h1>
          <p className="text-xs font-medium text-emerald-700/90 mt-1">
            Caronas seguras, portas abertas.
          </p>
        </div>

        {/* MENSAGENS DE SUCESSO OU ERRO */}
        {successMsg && (
          <div className="mx-6 mb-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="mx-6 mb-3 p-3 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* SE O USUÁRIO JÁ ESTIVER LOGADO -> MOSTRA CARD DE PERFIL COM ESPAÇO PARA EDITAR FOTOS */}
        {currentUser && mode !== 'login' && mode !== 'register' ? (
          <div className="px-6 pb-6 space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img 
                    src={fotoPerfil || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80'} 
                    alt={currentUser.nome} 
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500 shadow-sm"
                  />
                  <button 
                    onClick={() => fileInputPerfilRef.current?.click()}
                    title="Trocar Foto de Perfil"
                    className="absolute -bottom-1 -right-1 p-1.5 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 shadow-xs cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputPerfilRef} 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => handleFileUpload(e, setFotoPerfil)} 
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-slate-800 text-sm truncate">{currentUser.nome}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase">
                      {currentUser.papel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                  <p className="text-xs text-slate-600 font-medium">{currentUser.telefone}</p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-emerald-200/60 flex items-center justify-between text-xs">
                <span className="text-slate-600 flex items-center gap-1 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Status da Conta:
                </span>
                <span className="font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                  {currentUser.statusAprovacao === 'aprovado' ? 'Documentos Aprovados' : 'Ativo Oficial'}
                </span>
              </div>
            </div>

            {/* SEÇÃO DE EDIÇÃO DE FOTOS E DOCUMENTOS */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-emerald-600" />
                  Editar Fotos e Documentos
                </h3>
                <span className="text-[10px] text-emerald-600 font-semibold">Toque nas fotos para trocar</span>
              </div>

              {/* SE FOR MOTORISTA: FOTOS DA CNH, DO CRLV E DO CARRO */}
              {currentUser.papel === 'motorista' && (
                <div className="grid grid-cols-2 gap-2.5">
                  {/* Foto da CNH */}
                  <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:border-emerald-500 transition-colors">
                    <span className="block text-[11px] font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                      <FileText className="w-3 h-3 text-emerald-600" />
                      CNH com EAR
                    </span>
                    <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-300 bg-slate-200 group">
                      <img 
                        src={cnhFoto} 
                        alt="CNH" 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover" 
                      />
                      <button 
                        onClick={() => fileInputCnhRef.current?.click()}
                        className="absolute inset-0 bg-black/40 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold cursor-pointer"
                      >
                        <Upload className="w-4 h-4 mb-0.5" />
                        Trocar CNH
                      </button>
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputCnhRef} 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => handleFileUpload(e, setCnhFoto)} 
                    />
                    <div className="mt-1.5 text-[10px] text-slate-500 truncate">
                      Nº: <span className="font-mono font-semibold text-slate-700">{cnhNumero}</span>
                    </div>
                  </div>

                  {/* Foto do CRLV */}
                  <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:border-emerald-500 transition-colors">
                    <span className="block text-[11px] font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                      <CreditCard className="w-3 h-3 text-emerald-600" />
                      CRLV do Carro
                    </span>
                    <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-300 bg-slate-200 group">
                      <img 
                        src={crlvFoto} 
                        alt="CRLV" 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover" 
                      />
                      <button 
                        onClick={() => fileInputCrlvRef.current?.click()}
                        className="absolute inset-0 bg-black/40 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold cursor-pointer"
                      >
                        <Upload className="w-4 h-4 mb-0.5" />
                        Trocar CRLV
                      </button>
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputCrlvRef} 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => handleFileUpload(e, setCrlvFoto)} 
                    />
                    <div className="mt-1.5 text-[10px] text-slate-500 truncate">
                      Renavam: <span className="font-mono font-semibold text-slate-700">{crlvNumero}</span>
                    </div>
                  </div>

                  {/* Foto Frontal do Veículo */}
                  <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:border-emerald-500 transition-colors">
                    <span className="block text-[11px] font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                      <Car className="w-3 h-3 text-emerald-600" />
                      Foto Frente / Placa
                    </span>
                    <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-300 bg-slate-200 group">
                      <img 
                        src={fotoVeiculoFrente} 
                        alt="Veículo Frente" 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover" 
                      />
                      <button 
                        onClick={() => fileInputCarroFrenteRef.current?.click()}
                        className="absolute inset-0 bg-black/40 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold cursor-pointer"
                      >
                        <Upload className="w-4 h-4 mb-0.5" />
                        Trocar Foto
                      </button>
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputCarroFrenteRef} 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => handleFileUpload(e, setFotoVeiculoFrente)} 
                    />
                    <div className="mt-1.5 text-[10px] text-slate-500 truncate">
                      Carro: <span className="font-semibold text-slate-700">{modeloVeiculo}</span>
                    </div>
                  </div>

                  {/* Foto Interior do Veículo */}
                  <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:border-emerald-500 transition-colors">
                    <span className="block text-[11px] font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                      <Layers className="w-3 h-3 text-emerald-600" />
                      Interior / Bancos
                    </span>
                    <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-300 bg-slate-200 group">
                      <img 
                        src={fotoVeiculoInterior} 
                        alt="Veículo Interior" 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover" 
                      />
                      <button 
                        onClick={() => fileInputCarroInteriorRef.current?.click()}
                        className="absolute inset-0 bg-black/40 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold cursor-pointer"
                      >
                        <Upload className="w-4 h-4 mb-0.5" />
                        Trocar Foto
                      </button>
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputCarroInteriorRef} 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => handleFileUpload(e, setFotoVeiculoInterior)} 
                    />
                    <div className="mt-1.5 text-[10px] text-slate-500 truncate">
                      Vagas: <span className="font-semibold text-slate-700">{capacidadePassageiros} lugares</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Se for passageiro */}
              {currentUser.papel === 'passageiro' && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-emerald-600" />
                    Sua Foto de Perfil Oficial
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Esta foto será visualizada pelo motorista para confirmar seu embarque seguro na porta da sua casa.
                  </p>
                  <button 
                    onClick={() => fileInputPerfilRef.current?.click()}
                    className="w-full py-2 px-3 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 flex items-center justify-center gap-2 hover:bg-slate-100 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-emerald-600" />
                    Trocar Foto de Perfil
                  </button>
                </div>
              )}

              {/* Botão para salvar alterações das fotos e dados */}
              <button
                onClick={handleSalvarEdicaoPerfil}
                disabled={actionLoading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Salvar Alterações de Fotos e Perfil
              </button>
            </div>

            {/* AÇÕES DE NAVEGAÇÃO */}
            <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2">
              <button
                onClick={onNavigateToPassenger}
                className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                Ir para Passageiro
              </button>
              <button
                onClick={onNavigateToDriver}
                className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Car className="w-3.5 h-3.5" />
                Painel Motorista
              </button>
            </div>

            {/* BOTÃO DE LOGOUT */}
            <button
              onClick={async () => {
                await logoutUser();
                setCurrentUser(null);
                setMode('login');
              }}
              className="w-full py-2 text-rose-600 hover:text-rose-700 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sair desta conta
            </button>
          </div>
        ) : mode === 'login' ? (
          /* MODO LOGIN (DESIGN EXATO DA IMAGEM 01 TELA LOGIN.jpg) */
          <div className="px-6 pb-6 space-y-4">
            <div className="text-center pb-1">
              <h2 className="text-xl font-black text-emerald-950">
                Bem-vindo(a) de volta!
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Faça login para continuar.
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              {/* Campo E-mail */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">E-mail</label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-emerald-600 pointer-events-none">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input 
                    type="email"
                    required
                    value={emailLogin}
                    onChange={(e) => setEmailLogin(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full pl-10 pr-3.5 py-3 rounded-2xl border border-slate-300 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-white shadow-inner"
                  />
                </div>
              </div>

              {/* Campo Senha */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Senha</label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-emerald-600 pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input 
                    type={mostrarSenha ? 'text' : 'password'}
                    required
                    value={senhaLogin}
                    onChange={(e) => setSenhaLogin(e.target.value)}
                    placeholder="Sua senha"
                    className="w-full pl-10 pr-10 py-3 rounded-2xl border border-slate-300 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-white shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute right-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {mostrarSenha ? <EyeOff className="w-4 h-4 text-emerald-600" /> : <Eye className="w-4 h-4 text-slate-400" />}
                  </button>
                </div>
              </div>

              {/* Botão Entrar Verde (Fiel ao mockup) */}
              <button
                type="submit"
                disabled={actionLoading}
                id="btn-login-entrar"
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Entrar</span>
                  </>
                )}
              </button>
            </form>

            {/* Linha Divisória 'ou' */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-slate-400 font-medium">ou</span>
              </div>
            </div>

            {/* BOTÃO AUTENTICAÇÃO GOOGLE (SOLICITADO PELO USUÁRIO) */}
            <button
              type="button"
              id="btn-login-google"
              onClick={handleGoogleLogin}
              disabled={actionLoading}
              className="w-full py-3 px-4 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-300 rounded-2xl text-xs font-bold text-slate-700 flex items-center justify-center gap-3 shadow-xs transition-all cursor-pointer"
            >
              {/* Logo Google Oficial em SVG */}
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continuar com Google</span>
            </button>

            {/* Link para alternar para Criar Conta */}
            <div className="text-center pt-3">
              <p className="text-xs text-slate-500">
                Ainda não tem conta?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="font-bold text-emerald-600 hover:text-emerald-700 underline cursor-pointer"
                >
                  Criar conta
                </button>
              </p>
            </div>
          </div>
        ) : (
          /* MODO CADASTRO COM FOTOS DO MOTORISTA E VEÍCULO */
          <div className="px-6 pb-6 space-y-4 max-h-[72vh] overflow-y-auto pr-2">
            <div className="text-center pb-1">
              <h2 className="text-xl font-black text-emerald-950">
                Criar Nova Conta
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Cadastre-se para viajar ou dirigir no Porta a Porta.
              </p>
            </div>

            {/* ESCOLHA DE PAPEL: PASSAGEIRO OU MOTORISTA */}
            <div className="p-1 bg-slate-100 rounded-2xl flex items-center border border-slate-200">
              <button
                type="button"
                onClick={() => setRole('passageiro')}
                className={`flex-1 py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  role === 'passageiro'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                Passageiro
              </button>
              <button
                type="button"
                onClick={() => setRole('motorista')}
                className={`flex-1 py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  role === 'motorista'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Car className="w-3.5 h-3.5" />
                Motorista Parceiro
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              {/* SEÇÃO 1: FOTO DE PERFIL / SELFIE */}
              <div className="p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-200/80 text-center">
                <label className="block text-xs font-bold text-emerald-950 mb-2">
                  {role === 'motorista' ? 'Foto de Perfil do Motorista' : 'Sua Foto de Perfil / Selfie'}
                </label>
                <div className="flex flex-col items-center">
                  <div className="relative group">
                    <img 
                      src={fotoPerfil} 
                      alt="Preview Foto Perfil" 
                      referrerPolicy="no-referrer"
                      className="w-20 h-20 rounded-full object-cover border-3 border-emerald-500 shadow-md"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputPerfilRef.current?.click()}
                      className="absolute inset-0 rounded-full bg-black/40 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold cursor-pointer"
                    >
                      <Camera className="w-4 h-4 mb-0.5" />
                      Trocar
                    </button>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputPerfilRef} 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => handleFileUpload(e, setFotoPerfil)} 
                  />
                  <button
                    type="button"
                    onClick={() => fileInputPerfilRef.current?.click()}
                    className="mt-2 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Upload className="w-3 h-3" />
                    Enviar Foto do Celular / Computador
                  </button>
                </div>
              </div>

              {/* DADOS BÁSICOS */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome Completo</label>
                <input 
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: João da Silva"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Celular / WhatsApp</label>
                  <input 
                    type="text"
                    required
                    value={telefone}
                    onChange={(e) => handleTelefoneChange(e.target.value)}
                    placeholder="(27) 99876-5432"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">CPF</label>
                  <input 
                    type="text"
                    required
                    value={cpf}
                    onChange={(e) => handleCpfChange(e.target.value)}
                    placeholder="000.000.000-00"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">E-mail</label>
                <input 
                  type="email"
                  required
                  value={emailCad}
                  onChange={(e) => setEmailCad(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Senha</label>
                <input 
                  type="password"
                  required
                  minLength={6}
                  value={senhaCad}
                  onChange={(e) => setSenhaCad(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500 bg-white"
                />
              </div>

              {/* CAMPOS ESPECÍFICOS DO MOTORISTA: DOCUMENTOS E VEÍCULO */}
              {role === 'motorista' && (
                <div className="space-y-3.5 pt-2 border-t border-slate-200">
                  <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-300">
                    <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Documentação & Fotos do Carro
                    </span>
                    <p className="text-[11px] text-emerald-800 mt-0.5">
                      Adicione fotos nítidas dos documentos para aprovação de viagens intermunicipais.
                    </p>
                  </div>

                  {/* 1. DOCUMENTO DO MOTORISTA (CNH) */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-emerald-600" />
                        1. CNH do Motorista (com EAR)
                      </span>
                      <button
                        type="button"
                        onClick={() => fileInputCnhRef.current?.click()}
                        className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                      >
                        <Upload className="w-3 h-3" />
                        Trocar Foto
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2 items-center">
                      <div className="col-span-1 aspect-video rounded-lg border border-slate-300 overflow-hidden bg-white">
                        <img 
                          src={cnhFoto} 
                          alt="CNH" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[10px] font-semibold text-slate-500">Nº do Registro CNH</label>
                        <input 
                          type="text"
                          required
                          value={cnhNumero}
                          onChange={(e) => setCnhNumero(e.target.value)}
                          placeholder="05489214789"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-mono font-bold text-slate-800 bg-white"
                        />
                      </div>
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputCnhRef} 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => handleFileUpload(e, setCnhFoto)} 
                    />
                  </div>

                  {/* 2. DOCUMENTO DO CARRO (CRLV) */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                        <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                        2. Documento do Carro (CRLV Anual)
                      </span>
                      <button
                        type="button"
                        onClick={() => fileInputCrlvRef.current?.click()}
                        className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                      >
                        <Upload className="w-3 h-3" />
                        Trocar Foto
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2 items-center">
                      <div className="col-span-1 aspect-video rounded-lg border border-slate-300 overflow-hidden bg-white">
                        <img 
                          src={crlvFoto} 
                          alt="CRLV" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[10px] font-semibold text-slate-500">Código Renavam</label>
                        <input 
                          type="text"
                          required
                          value={crlvNumero}
                          onChange={(e) => setCrlvNumero(e.target.value)}
                          placeholder="88741259632"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-mono font-bold text-slate-800 bg-white"
                        />
                      </div>
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputCrlvRef} 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => handleFileUpload(e, setCrlvFoto)} 
                    />
                  </div>

                  {/* 3. FOTOS DO VEÍCULO (FRENTE E INTERIOR) */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <Car className="w-3.5 h-3.5 text-emerald-600" />
                      3. Fotos do Veículo
                    </span>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="block text-[10px] font-semibold text-slate-600 mb-1">Frente e Placa</span>
                        <div className="relative aspect-video rounded-lg border border-slate-300 overflow-hidden group">
                          <img 
                            src={fotoVeiculoFrente} 
                            alt="Frente do Veículo" 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover" 
                          />
                          <button
                            type="button"
                            onClick={() => fileInputCarroFrenteRef.current?.click()}
                            className="absolute inset-0 bg-black/40 text-white text-[10px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          >
                            Trocar
                          </button>
                        </div>
                        <input 
                          type="file" 
                          ref={fileInputCarroFrenteRef} 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => handleFileUpload(e, setFotoVeiculoFrente)} 
                        />
                      </div>

                      <div>
                        <span className="block text-[10px] font-semibold text-slate-600 mb-1">Interior / Bancos</span>
                        <div className="relative aspect-video rounded-lg border border-slate-300 overflow-hidden group">
                          <img 
                            src={fotoVeiculoInterior} 
                            alt="Interior do Veículo" 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover" 
                          />
                          <button
                            type="button"
                            onClick={() => fileInputCarroInteriorRef.current?.click()}
                            className="absolute inset-0 bg-black/40 text-white text-[10px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          >
                            Trocar
                          </button>
                        </div>
                        <input 
                          type="file" 
                          ref={fileInputCarroInteriorRef} 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => handleFileUpload(e, setFotoVeiculoInterior)} 
                        />
                      </div>
                    </div>

                    {/* DADOS DO VEÍCULO */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500">Modelo do Veículo</label>
                        <input 
                          type="text"
                          required
                          value={modeloVeiculo}
                          onChange={(e) => setModeloVeiculo(e.target.value)}
                          placeholder="Chevrolet Onix Plus"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-800 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500">Placa</label>
                        <input 
                          type="text"
                          required
                          value={placaVeiculo}
                          onChange={(e) => setPlacaVeiculo(e.target.value.toUpperCase())}
                          placeholder="RQN-4A21"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-mono font-bold text-slate-800 bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500">Cor</label>
                        <input 
                          type="text"
                          value={corVeiculo}
                          onChange={(e) => setCorVeiculo(e.target.value)}
                          placeholder="Prata"
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500">Ano</label>
                        <input 
                          type="text"
                          value={anoVeiculo}
                          onChange={(e) => setAnoVeiculo(e.target.value)}
                          placeholder="2024"
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500">Vagas</label>
                        <input 
                          type="number"
                          min={1}
                          max={6}
                          value={capacidadePassageiros}
                          onChange={(e) => setCapacidadePassageiros(Number(e.target.value))}
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-800 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* BOTÃO FINALIZAR CADASTRO */}
              <button
                type="submit"
                disabled={actionLoading}
                id="btn-cadastrar-usuario"
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer disabled:opacity-50 mt-2"
              >
                {actionLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Concluir Cadastro</span>
                  </>
                )}
              </button>
            </form>

            {/* Alternar de volta para Login */}
            <div className="text-center pt-2">
              <p className="text-xs text-slate-500">
                Já possui uma conta cadastrada?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-bold text-emerald-600 hover:text-emerald-700 underline cursor-pointer"
                >
                  Fazer login
                </button>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
