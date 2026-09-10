import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  User, 
  CreditCard, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Camera, 
  Save, 
  BadgeCheck, 
  Eye, 
  FileText,
  Clock
} from 'lucide-react';
import { DocumentosPassageiro, DocumentVerificationStatus } from '../../types';
import { 
  getPassageiroDocs, 
  salvarDocumentosPassageiro, 
  subscribeToDocuments 
} from '../../services/documentService';

interface PassageiroDocumentosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const PassageiroDocumentosModal: React.FC<PassageiroDocumentosModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [docs, setDocs] = useState<DocumentosPassageiro>(getPassageiroDocs());
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Form state
  const [fotoPassageiroUrl, setFotoPassageiroUrl] = useState(docs.fotoPassageiroUrl || '');
  const [tipoDocumento, setTipoDocumento] = useState<'rg' | 'cnh' | 'cpf'>(docs.tipoDocumento || 'cnh');
  const [documentoNumero, setDocumentoNumero] = useState(docs.documentoNumero || '');
  const [documentoFotoUrl, setDocumentoFotoUrl] = useState(docs.documentoFotoUrl || '');

  // Preview modal
  const [imageModalUrl, setImageModalUrl] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeToDocuments(() => {
      const current = getPassageiroDocs();
      setDocs(current);
      setFotoPassageiroUrl(current.fotoPassageiroUrl || '');
      setTipoDocumento(current.tipoDocumento || 'cnh');
      setDocumentoNumero(current.documentoNumero || '');
      setDocumentoFotoUrl(current.documentoFotoUrl || '');
    });
    return () => unsub();
  }, []);

  if (!isOpen) return null;

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
      await salvarDocumentosPassageiro({
        fotoPassageiroUrl,
        tipoDocumento,
        documentoNumero,
        documentoFotoUrl,
        fotoPassageiroStatus: docs.fotoPassageiroStatus === 'aprovado' && fotoPassageiroUrl === docs.fotoPassageiroUrl ? 'aprovado' : (fotoPassageiroUrl ? 'em_analise' : 'pendente'),
        documentoStatus: docs.documentoStatus === 'aprovado' && documentoFotoUrl === docs.documentoFotoUrl ? 'aprovado' : (documentoFotoUrl ? 'em_analise' : 'pendente')
      });

      setFeedback('✅ Documentos do passageiro salvos com sucesso!');
      if (onSuccess) onSuccess();
      setTimeout(() => {
        setFeedback(null);
        onClose();
      }, 1500);
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
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Aprovado
          </span>
        );
      case 'em_analise':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3 h-3 text-amber-600" />
            Em Análise
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
            <AlertCircle className="w-3 h-3 text-slate-500" />
            Pendente
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl p-6 max-w-xl w-full space-y-5 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 my-8">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
              <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">Verificação de Identidade do Passageiro</h2>
                {renderStatusBadge(docs.statusGeral)}
              </div>
              <p className="text-xs text-slate-500">
                Envie sua foto e documento oficial para viagens seguras porta a porta.
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {feedback && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        <form onSubmit={handleSalvar} className="space-y-4">
          {/* FOTO DO PASSAGEIRO */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-blue-600" />
                1. Foto do Passageiro (Selfie / Rosto Frontal)
              </span>
              {renderStatusBadge(docs.fotoPassageiroStatus)}
            </div>

            <div className="flex items-center gap-4">
              {fotoPassageiroUrl ? (
                <div className="relative group">
                  <img 
                    src={fotoPassageiroUrl} 
                    alt="Foto Passageiro" 
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-500 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setImageModalUrl(fotoPassageiroUrl)}
                    className="absolute inset-0 bg-black/40 text-white rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-blue-100 border-2 border-dashed border-blue-300 flex items-center justify-center text-blue-600">
                  <User className="w-6 h-6" />
                </div>
              )}

              <div className="space-y-1.5 flex-1">
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 shadow-sm transition-all">
                  <Upload className="w-3.5 h-3.5 text-blue-600" />
                  <span>{fotoPassageiroUrl ? 'Trocar Foto' : 'Enviar Foto do Rosto'}</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handleFileUpload(e, setFotoPassageiroUrl)} 
                    className="hidden" 
                  />
                </label>
                <p className="text-[10px] text-slate-400">Foto clara com rosto bem visível</p>
              </div>
            </div>
          </div>

          {/* DOCUMENTO OFICIAL COM FOTO */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-blue-600" />
                2. Documento Oficial com Foto (RG / CNH / CPF)
              </span>
              {renderStatusBadge(docs.documentoStatus)}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Tipo de Documento</label>
                <select
                  value={tipoDocumento}
                  onChange={(e) => setTipoDocumento(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                >
                  <option value="cnh">CNH (Habilitação)</option>
                  <option value="rg">RG (Identidade)</option>
                  <option value="cpf">CPF com Foto</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Número do Documento</label>
                <input
                  type="text"
                  value={documentoNumero}
                  onChange={(e) => setDocumentoNumero(e.target.value)}
                  placeholder="000.000.000-00 ou RG"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-4 pt-1">
              {documentoFotoUrl ? (
                <div className="relative group">
                  <img 
                    src={documentoFotoUrl} 
                    alt="Foto Documento" 
                    className="w-16 h-12 rounded-xl object-cover border-2 border-blue-500 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setImageModalUrl(documentoFotoUrl)}
                    className="absolute inset-0 bg-black/40 text-white rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="w-16 h-12 rounded-xl bg-blue-100 border-2 border-dashed border-blue-300 flex items-center justify-center text-blue-600">
                  <FileText className="w-5 h-5" />
                </div>
              )}

              <div className="space-y-1 flex-1">
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 shadow-sm transition-all">
                  <Upload className="w-3.5 h-3.5 text-blue-600" />
                  <span>{documentoFotoUrl ? 'Trocar Foto Documento' : 'Enviar Foto do Documento'}</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handleFileUpload(e, setDocumentoFotoUrl)} 
                    className="hidden" 
                  />
                </label>
                <p className="text-[10px] text-slate-400">Foto nítida e legível do documento</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-200 transition-all flex items-center gap-1.5"
            >
              {isSaving ? (
                <span>Salvando...</span>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Salvar Documentos</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Modal Zoom */}
      {imageModalUrl && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-4 max-w-md w-full space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-slate-800">Visualização de Documento</h4>
              <button onClick={() => setImageModalUrl(null)} className="p-1 text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>
            <img src={imageModalUrl} alt="Visualização" className="w-full h-auto rounded-xl object-contain max-h-[60vh]" />
          </div>
        </div>
      )}
    </div>
  );
};
