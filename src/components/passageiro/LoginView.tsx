import React, { useState } from 'react';
import { 
  Phone, 
  ArrowRight, 
  ShieldCheck, 
  UserCheck, 
  User, 
  CreditCard, 
  Camera, 
  CheckCircle2, 
  Sparkles,
  Upload,
  X
} from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { salvarDocumentosPassageiro } from '../../services/documentService';

interface LoginViewProps {
  onSendSms: (phone: string) => void;
  onDemoLogin: () => void;
  onRegisterSuccess?: (userData: { nome: string; telefone: string; cpf: string; fotoUrl?: string }) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ 
  onSendSms, 
  onDemoLogin,
  onRegisterSuccess 
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'cadastrar'>('login');
  
  // Login State
  const [phone, setPhone] = useState('(27) 99876-5432');

  // Cadastro State
  const [nome, setNome] = useState('');
  const [celularCadastro, setCelularCadastro] = useState('');
  const [cpf, setCpf] = useState('');
  const [fotoUrl, setFotoUrl] = useState<string>('');
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [tipoDocumento, setTipoDocumento] = useState<'cnh' | 'rg' | 'cpf'>('cnh');
  const [documentoFotoUrl, setDocumentoFotoUrl] = useState<string>('');
  const [docFotoPreview, setDocFotoPreview] = useState<string | null>(null);
  
  const [registeredSuccess, setRegisteredSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Formata o CPF enquanto digita (000.000.000-00)
  const formatCpf = (value: string) => {
    const nums = value.replace(/\D/g, '').slice(0, 11);
    if (nums.length <= 3) return nums;
    if (nums.length <= 6) return `${nums.slice(0, 3)}.${nums.slice(3)}`;
    if (nums.length <= 9) return `${nums.slice(0, 3)}.${nums.slice(3, 6)}.${nums.slice(6)}`;
    return `${nums.slice(0, 3)}.${nums.slice(3, 6)}.${nums.slice(6, 9)}-${nums.slice(9)}`;
  };

  // Formata Celular enquanto digita ((00) 00000-0000)
  const formatPhone = (value: string) => {
    const nums = value.replace(/\D/g, '').slice(0, 11);
    if (nums.length <= 2) return nums;
    if (nums.length <= 7) return `(${nums.slice(0, 2)}) ${nums.slice(2)}`;
    return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`;
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length >= 10) {
      onSendSms(phone);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setFotoPreview(base64);
        setFotoUrl(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setDocFotoPreview(base64);
        setDocumentoFotoUrl(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCadastroSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !celularCadastro.trim() || !cpf.trim()) {
      alert("Por favor, preencha todos os campos obrigatórios (Nome, Celular e CPF).");
      return;
    }

    setIsSubmitting(true);

    const newUser = {
      nome: nome.trim(),
      telefone: celularCadastro.trim(),
      cpf: cpf.trim(),
      fotoUrl: fotoUrl || fotoPreview || '',
      papel: 'passageiro',
      documentoTipo: tipoDocumento,
      documentoFotoUrl: documentoFotoUrl || docFotoPreview || '',
      statusDocumentacao: (fotoUrl || fotoPreview) && (documentoFotoUrl || docFotoPreview) ? 'aprovado' : 'pendente',
      criadoEm: serverTimestamp()
    };

    // Atualiza o repositório de documentos do passageiro
    await salvarDocumentosPassageiro({
      passageiroId: 'celso_passageiro',
      passageiroNome: newUser.nome,
      fotoPassageiroUrl: newUser.fotoUrl,
      fotoPassageiroStatus: newUser.fotoUrl ? 'aprovado' : 'pendente',
      tipoDocumento: tipoDocumento,
      documentoNumero: newUser.cpf,
      documentoFotoUrl: newUser.documentoFotoUrl,
      documentoStatus: newUser.documentoFotoUrl ? 'aprovado' : 'pendente',
      statusGeral: ((fotoUrl || fotoPreview) && (documentoFotoUrl || docFotoPreview)) ? 'aprovado' : 'pendente'
    });

    try {
      // Salva no Firestore na coleção 'usuarios'
      await addDoc(collection(db, 'usuarios'), newUser);
    } catch (err) {
      console.warn("Usuário salvo localmente (Firestore offline/não provisionado).", err);
    }

    setIsSubmitting(false);
    setRegisteredSuccess(true);

    if (onRegisterSuccess) {
      onRegisterSuccess({
        nome: newUser.nome,
        telefone: newUser.telefone,
        cpf: newUser.cpf,
        fotoUrl: newUser.fotoUrl
      });
    }

    setTimeout(() => {
      onDemoLogin();
    }, 1800);
  };

  return (
    <div className="flex flex-col justify-between min-h-[620px] h-full p-6 bg-white text-slate-900 rounded-3xl border border-slate-200 shadow-sm overflow-y-auto">
      <div>
        {/* Navigation Tabs Header */}
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => setActiveTab('login')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'login'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => setActiveTab('cadastrar')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'cadastrar'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cadastrar
            </button>
          </div>

          <button 
            onClick={onDemoLogin}
            className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-xl transition-colors font-semibold"
          >
            <UserCheck className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Entrar como</span> Celso
          </button>
        </div>

        {/* TAB 1: LOGIN POR CELULAR */}
        {activeTab === 'login' && (
          <div className="animate-in fade-in duration-200">
            <h2 className="text-2xl font-light text-slate-900 mb-1">Qual seu número de celular?</h2>
            <p className="text-slate-500 text-xs mb-6">
              Enviaremos um código de verificação via SMS ou WhatsApp para validar seu acesso com segurança.
            </p>

            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">Número de Celular (DDD + Número)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-5 h-5 text-blue-600" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(27) 99999-9999"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-semibold text-base focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    required
                  />
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-500 leading-relaxed">
                  Ao continuar, você concorda com os Termos de Serviço do <strong className="text-slate-800">Porta a Porta</strong> e a política de privacidade de rotas compartilhadas.
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-blue-600 text-white font-bold text-sm uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <span>Receber Código SMS</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: CADASTRAR NOVO USUÁRIO */}
        {activeTab === 'cadastrar' && (
          <div className="animate-in fade-in duration-200 space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-1 flex items-center gap-2">
                <span>Criar Nova Conta</span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </h2>
              <p className="text-slate-500 text-xs">
                Cadastre-se para solicitar viagens porta a porta entre cidades do ES.
              </p>
            </div>

            {registeredSuccess ? (
              <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-6 text-center space-y-3 animate-in zoom-in duration-200">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="text-base font-extrabold text-emerald-900">Cadastro Realizado com Sucesso!</h3>
                <p className="text-xs text-emerald-700">
                  Seus dados foram registrados com segurança. Redirecionando para o painel principal...
                </p>
              </div>
            ) : (
              <form onSubmit={handleCadastroSubmit} className="space-y-4">
                
                {/* Field: Nome Completo (Obrigatório) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nome Completo <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-3.5 text-blue-600" />
                    <input
                      type="text"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Ex: Carlos Eduardo da Silva"
                      className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Field: Celular (Obrigatório) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Celular / WhatsApp <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-blue-600" />
                    <input
                      type="tel"
                      value={celularCadastro}
                      onChange={(e) => setCelularCadastro(formatPhone(e.target.value))}
                      placeholder="(27) 99876-5432"
                      className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Field: CPF (Obrigatório) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    CPF <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 absolute left-3.5 top-3.5 text-blue-600" />
                    <input
                      type="text"
                      value={cpf}
                      onChange={(e) => setCpf(formatCpf(e.target.value))}
                      placeholder="123.456.789-00"
                      className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-mono"
                      required
                    />
                  </div>
                </div>

                {/* Field: Foto no Perfil */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-blue-600" />
                      Foto do Rosto (Selfie)
                    </label>
                    {fotoPreview && (
                      <button
                        type="button"
                        onClick={() => { setFotoPreview(null); setFotoUrl(''); }}
                        className="text-[10px] text-red-600 hover:underline flex items-center gap-0.5 font-bold"
                      >
                        <X className="w-3 h-3" /> Remover
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    {fotoPreview ? (
                      <img 
                        src={fotoPreview} 
                        alt="Preview Foto" 
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-blue-500 shadow-sm shrink-0" 
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-blue-100 border-2 border-dashed border-blue-300 flex items-center justify-center text-blue-600 shrink-0">
                        <User className="w-7 h-7" />
                      </div>
                    )}

                    <div className="flex-1 space-y-1.5">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 shadow-sm transition-all">
                        <Upload className="w-3.5 h-3.5 text-blue-600" />
                        <span>{fotoPreview ? 'Trocar Foto' : 'Escolher Foto'}</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handlePhotoUpload}
                          className="hidden" 
                        />
                      </label>
                      <p className="text-[10px] text-slate-400">
                        Foto nítida para segurança dos motoristas.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Field: Documento com Foto (RG / CNH / CPF) */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-blue-600" />
                      Documento Oficial com Foto (RG/CNH)
                    </label>
                    {docFotoPreview && (
                      <button
                        type="button"
                        onClick={() => { setDocFotoPreview(null); setDocumentoFotoUrl(''); }}
                        className="text-[10px] text-red-600 hover:underline flex items-center gap-0.5 font-bold"
                      >
                        <X className="w-3 h-3" /> Remover
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Tipo</label>
                      <select
                        value={tipoDocumento}
                        onChange={(e) => setTipoDocumento(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                      >
                        <option value="cnh">CNH (Habilitação)</option>
                        <option value="rg">RG (Identidade)</option>
                        <option value="cpf">CPF com Foto</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2 pt-3">
                      {docFotoPreview ? (
                        <img 
                          src={docFotoPreview} 
                          alt="Preview Documento" 
                          className="w-10 h-8 rounded-lg object-cover border border-blue-500 shadow-sm shrink-0" 
                        />
                      ) : null}

                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 shadow-sm transition-all flex-1">
                        <Upload className="w-3.5 h-3.5 text-blue-600" />
                        <span>{docFotoPreview ? 'Trocar' : 'Enviar Foto'}</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleDocPhotoUpload}
                          className="hidden" 
                        />
                      </label>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Foto do documento para verificação e validação do cadastro.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-2xl bg-blue-600 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <span>{isSubmitting ? 'Cadastrando...' : 'Criar Minha Conta'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 text-center">
        <p className="text-xs text-slate-400">
          Atendendo Água Doce do Norte, Barra de São Francisco e Vitória
        </p>
      </div>
    </div>
  );
};
