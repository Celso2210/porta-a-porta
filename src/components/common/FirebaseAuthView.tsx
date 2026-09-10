import React, { useState, useEffect } from 'react';
import { 
  User, 
  Car, 
  ShieldCheck, 
  Lock, 
  Mail, 
  Phone, 
  FileText, 
  LogOut, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Database,
  UserCheck,
  CreditCard,
  Camera,
  Upload,
  X
} from 'lucide-react';
import { 
  registerPassageiro, 
  registerMotorista, 
  loginUser, 
  logoutUser, 
  subscribeToAuthChanges, 
  AuthUserProfile 
} from '../../services/authService';
import { UserRole } from '../../types';

interface FirebaseAuthViewProps {
  onAuthSuccess?: (profile: AuthUserProfile) => void;
}

export const FirebaseAuthView: React.FC<FirebaseAuthViewProps> = ({ onAuthSuccess }) => {
  const [currentUser, setCurrentUser] = useState<AuthUserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<UserRole>('passageiro');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cpf, setCpf] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [cidadePadrao, setCidadePadrao] = useState('Água Doce do Norte');
  const [cnh, setCnh] = useState('');
  const [modeloVeiculo, setModeloVeiculo] = useState('');
  const [placaVeiculo, setPlacaVeiculo] = useState('');
  const [corVeiculo, setCorVeiculo] = useState('');
  const [capacidade, setCapacidade] = useState(4);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((firebaseUser, profile) => {
      setCurrentUser(profile);
      setLoading(false);
      if (profile && onAuthSuccess) {
        onAuthSuccess(profile);
      }
    });
    return () => unsubscribe();
  }, [onAuthSuccess]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setActionLoading(true);

    try {
      const profile = await loginUser(email, senha);
      setSuccessMessage(`Login efetuado com sucesso! Bem-vindo, ${profile.nome}.`);
      if (onAuthSuccess) onAuthSuccess(profile);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError('E-mail ou senha incorretos.');
      } else if (err.code === 'auth/user-not-found') {
        setError('Usuário não encontrado com este e-mail.');
      } else {
        setError(err.message || 'Erro ao realizar login no Firebase Auth.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setActionLoading(true);

    try {
      let profile: AuthUserProfile;
      if (role === 'passageiro') {
        profile = await registerPassageiro({
          nome,
          email,
          senha,
          telefone,
          cpf,
          fotoUrl: fotoUrl || fotoPreview || '',
          cidadePadrao
        });
      } else {
        profile = await registerMotorista({
          nome,
          email,
          senha,
          telefone,
          cpf,
          fotoUrl: fotoUrl || fotoPreview || '',
          cnh,
          modeloVeiculo,
          placaVeiculo,
          corVeiculo,
          capacidadePassageiros: capacidade
        });
      }
      setSuccessMessage(`Cadastro de ${role.toUpperCase()} realizado com sucesso e salvo no Firestore!`);
      if (onAuthSuccess) onAuthSuccess(profile);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Este e-mail já está em uso.');
      } else if (err.code === 'auth/weak-password') {
        setError('A senha deve ter pelo menos 6 caracteres.');
      } else {
        setError(err.message || 'Erro ao cadastrar usuário no Firebase Auth.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleQuickDemoFill = (demoRole: UserRole) => {
    setRole(demoRole);
    setMode('register');
    if (demoRole === 'passageiro') {
      setNome('Ana Maria Souza');
      setEmail(`ana.passageira.${Math.floor(Math.random() * 1000)}@portaaporta.com`);
      setSenha('senha123');
      setTelefone('(27) 99887-1122');
      setCidadePadrao('Água Doce do Norte');
    } else {
      setNome('José Carlos da Silva');
      setEmail(`jose.motorista.${Math.floor(Math.random() * 1000)}@portaaporta.com`);
      setSenha('senha123');
      setTelefone('(27) 99776-3344');
      setCnh('12345678900');
      setModeloVeiculo('Chevrolet Spin 1.8');
      setPlacaVeiculo('PPA-2026');
      setCorVeiculo('Prata');
      setCapacidade(6);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-slate-200 text-slate-600">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
        <p className="text-sm font-semibold">Carregando autenticação Firebase...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full uppercase">
              Módulo de Autenticação Firebase
            </span>
            <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded border border-slate-200">
              Firebase Auth + Firestore
            </span>
          </div>
          <h2 className="text-2xl font-light text-slate-900 mt-1">
            Acesso & Cadastro no <strong className="font-extrabold text-blue-600">Porta a Porta</strong>
          </h2>
        </div>

        {/* Quick Demo Fill Buttons */}
        {!currentUser && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleQuickDemoFill('passageiro')}
              className="text-xs font-semibold px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 transition-colors flex items-center gap-1"
            >
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span>Demo Passageiro</span>
            </button>
            <button
              onClick={() => handleQuickDemoFill('motorista')}
              className="text-xs font-semibold px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 transition-colors flex items-center gap-1"
            >
              <Car className="w-3.5 h-3.5 text-blue-600" />
              <span>Demo Motorista</span>
            </button>
          </div>
        )}
      </div>

      {/* Logged User Status Card */}
      {currentUser ? (
        <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-lg shadow-sm">
                {currentUser.papel === 'motorista' ? <Car className="w-6 h-6" /> : <User className="w-6 h-6" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-base">{currentUser.nome}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white uppercase">
                    {currentUser.papel}
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium">{currentUser.email} • {currentUser.telefone}</p>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">UID: {currentUser.uid}</p>
              </div>
            </div>

            <button
              onClick={() => logoutUser()}
              className="text-xs font-bold text-red-600 hover:text-red-700 bg-white border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair</span>
            </button>
          </div>

          {/* Details from Firestore */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-blue-200/60 text-xs">
            {currentUser.papel === 'passageiro' ? (
              <div className="bg-white p-3 rounded-xl border border-blue-100 space-y-1">
                <span className="font-bold text-slate-700 block">Dados da Coleção 'usuarios':</span>
                <p><strong className="text-slate-600">Cidade Padrão:</strong> {currentUser.cidadePadrao}</p>
                <p><strong className="text-slate-600">Cadastrado em:</strong> {new Date(currentUser.criadoEm).toLocaleDateString()}</p>
              </div>
            ) : (
              <>
                <div className="bg-white p-3 rounded-xl border border-blue-100 space-y-1">
                  <span className="font-bold text-slate-700 block">Dados da Coleção 'usuarios':</span>
                  <p><strong className="text-slate-600">Papel:</strong> Motorista Parceiro</p>
                  <p><strong className="text-slate-600">Cadastrado em:</strong> {new Date(currentUser.criadoEm).toLocaleDateString()}</p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-blue-100 space-y-1">
                  <span className="font-bold text-slate-700 block">Dados da Coleção 'motoristas':</span>
                  <p><strong className="text-slate-600">CNH:</strong> {currentUser.cnh || 'Pendente'}</p>
                  <p><strong className="text-slate-600">Veículo:</strong> {currentUser.veiculo?.modelo} ({currentUser.veiculo?.placa})</p>
                  <p><strong className="text-slate-600">Capacidade:</strong> {currentUser.veiculo?.capacidadePassageiros} passageiros</p>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        /* Login / Register Forms */
        <div className="space-y-6">
          {/* Mode Switcher */}
          <div className="flex items-center justify-between bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-1 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => { setMode('login'); setError(null); }}
                className={`flex-1 sm:flex-none px-6 py-2 rounded-xl text-xs font-bold transition-all ${
                  mode === 'login'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Entrar (Login)
              </button>
              <button
                type="button"
                onClick={() => { setMode('register'); setError(null); }}
                className={`flex-1 sm:flex-none px-6 py-2 rounded-xl text-xs font-bold transition-all ${
                  mode === 'register'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Criar Nova Conta
              </button>
            </div>

            {/* Role Selection */}
            {mode === 'register' && (
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setRole('passageiro')}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    role === 'passageiro'
                      ? 'bg-blue-50 text-blue-600 border border-blue-200 font-bold'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Passageiro</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('motorista')}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    role === 'motorista'
                      ? 'bg-blue-50 text-blue-600 border border-blue-200 font-bold'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Car className="w-3.5 h-3.5" />
                  <span>Motorista</span>
                </button>
              </div>
            )}
          </div>

          {/* Messages */}
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-4">
            {mode === 'register' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nome Completo *</label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        placeholder="Ex: Carlos Eduardo"
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Telefone / WhatsApp *</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type="tel"
                        value={telefone}
                        onChange={(e) => setTelefone(e.target.value)}
                        placeholder="(27) 99999-8888"
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">CPF *</label>
                    <div className="relative">
                      <CreditCard className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={cpf}
                        onChange={(e) => setCpf(e.target.value)}
                        placeholder="123.456.789-00"
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-mono"
                        required
                      />
                    </div>
                  </div>

                  {/* Foto do Perfil (Opcional) */}
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {fotoPreview ? (
                        <img src={fotoPreview} alt="Preview" className="w-10 h-10 rounded-xl object-cover border border-blue-400" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                          <User className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Foto de Perfil</span>
                        <span className="text-[10px] text-slate-400">Opcional</span>
                      </div>
                    </div>

                    <label className="cursor-pointer text-xs font-bold bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 px-3 py-1.5 rounded-lg shadow-sm">
                      Upload
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setFotoPreview(reader.result as string);
                              setFotoUrl(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">E-mail</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@exemplo.com"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Senha (mínimo 6 caracteres)</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Additional Fields for Passenger Registration */}
            {mode === 'register' && role === 'passageiro' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Cidade Base / Origem Frequente</label>
                <input
                  type="text"
                  value={cidadePadrao}
                  onChange={(e) => setCidadePadrao(e.target.value)}
                  placeholder="Água Doce do Norte"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
                />
              </div>
            )}

            {/* Additional Fields for Driver Registration */}
            {mode === 'register' && role === 'motorista' && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                  <Car className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-slate-800">Dados do Veículo e CNH (Coleção 'motoristas')</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Número da CNH</label>
                    <input
                      type="text"
                      value={cnh}
                      onChange={(e) => setCnh(e.target.value)}
                      placeholder="12345678900"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Modelo do Veículo</label>
                    <input
                      type="text"
                      value={modeloVeiculo}
                      onChange={(e) => setModeloVeiculo(e.target.value)}
                      placeholder="Ex: Chevrolet Spin 1.8"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Placa do Veículo</label>
                    <input
                      type="text"
                      value={placaVeiculo}
                      onChange={(e) => setPlacaVeiculo(e.target.value)}
                      placeholder="PPA-2026"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Cor do Veículo</label>
                    <input
                      type="text"
                      value={corVeiculo}
                      onChange={(e) => setCorVeiculo(e.target.value)}
                      placeholder="Prata"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
                      required
                    />
                  </div>

                  <div className="col-span-1 sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Capacidade de Passageiros</label>
                    <select
                      value={capacidade}
                      onChange={(e) => setCapacidade(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
                    >
                      <option value={4}>4 Vagas de Passageiros</option>
                      <option value={6}>6 Vagas de Passageiros (Veículo Maior)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={actionLoading}
              className="w-full py-3.5 rounded-2xl bg-blue-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-blue-700 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200 disabled:opacity-50"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processando...</span>
                </>
              ) : mode === 'login' ? (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>Entrar com Firebase Auth</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Cadastrar {role === 'passageiro' ? 'Passageiro' : 'Motorista'}</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Firestore Schema Documentation Box */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-600 space-y-3">
        <div className="flex items-center gap-2 font-bold text-slate-800">
          <Database className="w-4 h-4 text-blue-600" />
          <span>Estrutura das Coleções do Banco Firestore ('usuarios' & 'motoristas')</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1 font-mono text-[11px]">
            <span className="font-sans font-bold text-blue-600 block text-xs">Coleção: usuarios</span>
            <p><strong className="text-slate-800">uid:</strong> string (ID Auth)</p>
            <p><strong className="text-slate-800">nome:</strong> string</p>
            <p><strong className="text-slate-800">email:</strong> string</p>
            <p><strong className="text-slate-800">telefone:</strong> string</p>
            <p><strong className="text-slate-800">papel:</strong> 'passageiro' | 'motorista'</p>
            <p><strong className="text-slate-800">cidadePadrao:</strong> string</p>
            <p><strong className="text-slate-800">criadoEm:</strong> string (ISO-8601)</p>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1 font-mono text-[11px]">
            <span className="font-sans font-bold text-blue-600 block text-xs">Coleção: motoristas</span>
            <p><strong className="text-slate-800">uid:</strong> string (ID Auth)</p>
            <p><strong className="text-slate-800">nome / email / telefone:</strong> string</p>
            <p><strong className="text-slate-800">cnh:</strong> string</p>
            <p><strong className="text-slate-800">statusAprovacao:</strong> 'aprovado' | 'pendente'</p>
            <p><strong className="text-slate-800">veiculo:</strong> &#123; modelo, placa, cor, capacidadePassageiros &#125;</p>
            <p><strong className="text-slate-800">criadoEm:</strong> string (ISO-8601)</p>
          </div>
        </div>
      </div>
    </div>
  );
};
