import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Camera, 
  Car, 
  FileText, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Check, 
  X, 
  Save, 
  Eye, 
  Sparkles,
  Info,
  BadgeCheck,
  RotateCcw
} from 'lucide-react';
import { DocumentosMotorista, DocumentVerificationStatus } from '../../types';
import { 
  getMotoristaDocs, 
  salvarDocumentosMotorista, 
  subscribeToDocuments 
} from '../../services/documentService';

export const MotoristaDocumentosTab: React.FC = () => {
  const [docs, setDocs] = useState<DocumentosMotorista>(getMotoristaDocs());
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Form local state
  const [fotoMotoristaUrl, setFotoMotoristaUrl] = useState(docs.fotoMotoristaUrl || '');
  const [cnhNumero, setCnhNumero] = useState(docs.cnhNumero || '');
  const [cnhCategoria, setCnhCategoria] = useState(docs.cnhCategoria || 'B (EAR)');
  const [cnhFotoUrl, setCnhFotoUrl] = useState(docs.cnhFotoUrl || '');
  const [fotoVeiculoUrl, setFotoVeiculoUrl] = useState(docs.fotoVeiculoUrl || '');
  const [crlvNumero, setCrlvNumero] = useState(docs.crlvNumero || '');
  const [crlvExercicio, setCrlvExercicio] = useState(docs.crlvExercicio || '2026');
  const [crlvFotoUrl, setCrlvFotoUrl] = useState(docs.crlvFotoUrl || '');

  // Preview modal
  const [imageModalUrl, setImageModalUrl] = useState<string | null>(null);
  const [imageModalTitle, setImageModalTitle] = useState<string>('');

  useEffect(() => {
    const unsub = subscribeToDocuments(() => {
      const current = getMotoristaDocs();
      setDocs(current);
      setFotoMotoristaUrl(current.fotoMotoristaUrl || '');
      setCnhNumero(current.cnhNumero || '');
      setCnhCategoria(current.cnhCategoria || 'B (EAR)');
      setCnhFotoUrl(current.cnhFotoUrl || '');
      setFotoVeiculoUrl(current.fotoVeiculoUrl || '');
      setCrlvNumero(current.crlvNumero || '');
      setCrlvExercicio(current.crlvExercicio || '2026');
      setCrlvFotoUrl(current.crlvFotoUrl || '');
    });
    return () => unsub();
  }, []);

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    try {
      await salvarDocumentosMotorista({
        fotoMotoristaUrl,
        cnhNumero,
        cnhCategoria,
        cnhFotoUrl,
        fotoVeiculoUrl,
        crlvNumero,
        crlvExercicio,
        crlvFotoUrl,
        fotoMotoristaStatus: docs.fotoMotoristaStatus === 'aprovado' && fotoMotoristaUrl === docs.fotoMotoristaUrl ? 'aprovado' : (fotoMotoristaUrl ? 'em_analise' : 'pendente'),
        cnhStatus: docs.cnhStatus === 'aprovado' && cnhFotoUrl === docs.cnhFotoUrl ? 'aprovado' : (cnhFotoUrl ? 'em_analise' : 'pendente'),
        fotoVeiculoStatus: docs.fotoVeiculoStatus === 'aprovado' && fotoVeiculoUrl === docs.fotoVeiculoUrl ? 'aprovado' : (fotoVeiculoUrl ? 'em_analise' : 'pendente'),
        crlvStatus: docs.crlvStatus === 'aprovado' && crlvFotoUrl === docs.crlvFotoUrl ? 'aprovado' : (crlvFotoUrl ? 'em_analise' : 'pendente')
      });

      setFeedback('✅ Documentação do motorista enviada e sincronizada com sucesso!');
      setTimeout(() => setFeedback(null), 5000);
    } catch (err) {
      console.error(err);
      setFeedback('Erro ao salvar documentos.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderStatusBadge = (status: DocumentVerificationStatus) => {
    switch (status) {
      case 'aprovado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Aprovado
          </span>
        );
      case 'em_analise':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Em Análise
          </span>
        );
      case 'rejeitado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <X className="w-3.5 h-3.5 text-rose-600" />
            Rejeitado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
            <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
            Pendente
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Documentos */}
      <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/20 text-blue-400 rounded-2xl border border-blue-500/40 shadow-sm">
              <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">Documentos e Fotos do Motorista & Veículo</h2>
                {renderStatusBadge(docs.statusGeral)}
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Envio obrigatório para validação de segurança: Foto do Motorista, CNH, Foto do Veículo e CRLV.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/40 px-3.5 py-2 rounded-2xl">
            <BadgeCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block">Status Operacional</span>
              <span className="text-xs font-black text-emerald-200">Apto para Transporte Intermunicipal</span>
            </div>
          </div>
        </div>

        {feedback && (
          <div className="mt-4 p-3.5 bg-emerald-500/20 border-2 border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        <form onSubmit={handleSalvar} className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* CARD 1: FOTO DO MOTORISTA */}
            <div className="bg-slate-700/60 border border-slate-600 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-600">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-blue-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">1. Foto do Motorista</h3>
                </div>
                {renderStatusBadge(docs.fotoMotoristaStatus)}
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed">
                Envie uma foto frontal nítida do seu rosto, sem óculos escuros ou boné. Esta foto é exibida aos passageiros.
              </p>

              <div className="flex items-center gap-4">
                {fotoMotoristaUrl ? (
                  <div className="relative group">
                    <img 
                      src={fotoMotoristaUrl} 
                      alt="Foto do Motorista" 
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-blue-400 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageModalUrl(fotoMotoristaUrl);
                        setImageModalTitle('Foto de Perfil do Motorista');
                      }}
                      className="absolute inset-0 bg-black/40 text-white rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-slate-800 border-2 border-dashed border-slate-600 flex flex-col items-center justify-center text-blue-400">
                    <Camera className="w-6 h-6" />
                    <span className="text-[9px] font-bold mt-1 text-slate-400">Sem foto</span>
                  </div>
                )}

                <div className="space-y-2 flex-1">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 border border-slate-600 hover:bg-slate-700 rounded-xl text-xs font-bold text-white shadow-sm transition-all">
                    <Upload className="w-3.5 h-3.5 text-blue-400" />
                    <span>{fotoMotoristaUrl ? 'Trocar Foto' : 'Enviar Foto do Rosto'}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handleFileUpload(e, setFotoMotoristaUrl)} 
                      className="hidden" 
                    />
                  </label>
                  <p className="text-[10px] text-slate-400">Formatos aceitos: JPG, PNG (máx 5MB)</p>
                </div>
              </div>
            </div>

            {/* CARD 2: DOCUMENTO PESSOAL / CNH */}
            <div className="bg-slate-700/60 border border-slate-600 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-600">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">2. CNH (Habilitação)</h3>
                </div>
                {renderStatusBadge(docs.cnhStatus)}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-200 mb-1">Número do Registro CNH</label>
                  <input
                    type="text"
                    value={cnhNumero}
                    onChange={(e) => setCnhNumero(e.target.value)}
                    placeholder="12345678900"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-blue-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-200 mb-1">Categoria CNH</label>
                  <select
                    value={cnhCategoria}
                    onChange={(e) => setCnhCategoria(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-blue-400"
                  >
                    <option value="B (EAR)" className="bg-slate-800 text-white">B (Com EAR - Atividade Remunerada)</option>
                    <option value="C (EAR)" className="bg-slate-800 text-white">C (Com EAR)</option>
                    <option value="D (EAR)" className="bg-slate-800 text-white">D (Com EAR - Van/Microônibus)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-1">
                {cnhFotoUrl ? (
                  <div className="relative group">
                    <img 
                      src={cnhFotoUrl} 
                      alt="Foto CNH" 
                      className="w-20 h-16 rounded-xl object-cover border-2 border-blue-400 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageModalUrl(cnhFotoUrl);
                        setImageModalTitle('Documento CNH do Motorista');
                      }}
                      className="absolute inset-0 bg-black/40 text-white rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-16 rounded-xl bg-slate-800 border-2 border-dashed border-slate-600 flex flex-col items-center justify-center text-blue-400">
                    <FileText className="w-5 h-5" />
                    <span className="text-[9px] font-bold mt-0.5 text-slate-400">Sem CNH</span>
                  </div>
                )}

                <div className="space-y-1.5 flex-1">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 border border-slate-600 hover:bg-slate-700 rounded-xl text-xs font-bold text-white shadow-sm transition-all">
                    <Upload className="w-3.5 h-3.5 text-blue-400" />
                    <span>{cnhFotoUrl ? 'Trocar Foto CNH' : 'Enviar Foto da CNH Aberta'}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handleFileUpload(e, setCnhFotoUrl)} 
                      className="hidden" 
                    />
                  </label>
                  <p className="text-[10px] text-slate-400">Foto nítida frente e verso da CNH</p>
                </div>
              </div>
            </div>

            {/* CARD 3: FOTO DO CARRO */}
            <div className="bg-slate-700/60 border border-slate-600 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-600">
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-blue-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">3. Foto do Veículo</h3>
                </div>
                {renderStatusBadge(docs.fotoVeiculoStatus)}
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed">
                Envie uma foto externa do seu carro, com placa e lataria visíveis em local iluminado.
              </p>

              <div className="flex items-center gap-4">
                {fotoVeiculoUrl ? (
                  <div className="relative group">
                    <img 
                      src={fotoVeiculoUrl} 
                      alt="Foto do Veículo" 
                      className="w-24 h-16 rounded-xl object-cover border-2 border-blue-400 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageModalUrl(fotoVeiculoUrl);
                        setImageModalTitle('Foto do Veículo');
                      }}
                      className="absolute inset-0 bg-black/40 text-white rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-16 rounded-xl bg-slate-800 border-2 border-dashed border-slate-600 flex flex-col items-center justify-center text-blue-400">
                    <Car className="w-6 h-6" />
                    <span className="text-[9px] font-bold mt-1 text-slate-400">Sem foto</span>
                  </div>
                )}

                <div className="space-y-2 flex-1">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 border border-slate-600 hover:bg-slate-700 rounded-xl text-xs font-bold text-white shadow-sm transition-all">
                    <Upload className="w-3.5 h-3.5 text-blue-400" />
                    <span>{fotoVeiculoUrl ? 'Trocar Foto do Veículo' : 'Enviar Foto do Veículo'}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handleFileUpload(e, setFotoVeiculoUrl)} 
                      className="hidden" 
                    />
                  </label>
                  <p className="text-[10px] text-slate-400">Veículo limpo e placa legível</p>
                </div>
              </div>
            </div>

            {/* CARD 4: DOCUMENTO DO CARRO (CRLV) */}
            <div className="bg-slate-700/60 border border-slate-600 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-600">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">4. Documento do Carro (CRLV)</h3>
                </div>
                {renderStatusBadge(docs.crlvStatus)}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-200 mb-1">Número do Renavam / CRLV</label>
                  <input
                    type="text"
                    value={crlvNumero}
                    onChange={(e) => setCrlvNumero(e.target.value)}
                    placeholder="88741259632"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-blue-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-200 mb-1">Exercício / Ano Licenciamento</label>
                  <input
                    type="text"
                    value={crlvExercicio}
                    onChange={(e) => setCrlvExercicio(e.target.value)}
                    placeholder="2026"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-blue-400"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-1">
                {crlvFotoUrl ? (
                  <div className="relative group">
                    <img 
                      src={crlvFotoUrl} 
                      alt="Foto CRLV" 
                      className="w-20 h-16 rounded-xl object-cover border-2 border-blue-400 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageModalUrl(crlvFotoUrl);
                        setImageModalTitle('Documento do Veículo (CRLV)');
                      }}
                      className="absolute inset-0 bg-black/40 text-white rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-16 rounded-xl bg-slate-800 border-2 border-dashed border-slate-600 flex flex-col items-center justify-center text-blue-400">
                    <FileText className="w-5 h-5" />
                    <span className="text-[9px] font-bold mt-0.5 text-slate-400">Sem CRLV</span>
                  </div>
                )}

                <div className="space-y-1.5 flex-1">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 border border-slate-600 hover:bg-slate-700 rounded-xl text-xs font-bold text-white shadow-sm transition-all">
                    <Upload className="w-3.5 h-3.5 text-blue-400" />
                    <span>{crlvFotoUrl ? 'Trocar Foto CRLV' : 'Enviar Foto do CRLV'}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handleFileUpload(e, setCrlvFotoUrl)} 
                      className="hidden" 
                    />
                  </label>
                  <p className="text-[10px] text-slate-400">Comprovante de licenciamento atualizado</p>
                </div>
              </div>
            </div>

          </div>

          {/* Botão de Salvar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-700">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Todos os documentos são protegidos por criptografia e armazenados no banco de dados.</span>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-900/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSaving ? (
                <span>Salvando Documentos...</span>
              ) : (
                <>
                  <Save className="w-4 h-4 stroke-[2.5]" />
                  <span>Salvar e Enviar Documentação</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Modal de Zoom da Imagem */}
      {imageModalUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-5 max-w-xl w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <h3 className="font-bold text-white text-sm">{imageModalTitle}</h3>
              <button 
                onClick={() => setImageModalUrl(null)}
                className="p-1.5 rounded-xl hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex justify-center bg-slate-900 rounded-2xl p-2 overflow-hidden max-h-[60vh]">
              <img src={imageModalUrl} alt="Visualização" className="max-h-[55vh] object-contain rounded-xl" />
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setImageModalUrl(null)}
                className="px-5 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs rounded-xl"
              >
                Fechar Visualização
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
