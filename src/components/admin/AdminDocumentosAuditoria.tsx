import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Eye, 
  Clock, 
  User, 
  Car, 
  FileText, 
  Camera, 
  Check, 
  X, 
  BadgeCheck,
  AlertTriangle,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { 
  DocumentosMotorista, 
  DocumentosPassageiro, 
  DocumentVerificationStatus 
} from '../../types';
import { 
  getAllDriversDocs, 
  getAllPassengersDocs, 
  atualizarStatusDocumentoMotorista, 
  atualizarStatusDocumentoPassageiro, 
  subscribeToDocuments 
} from '../../services/documentService';

export const AdminDocumentosAuditoria: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'motoristas' | 'passageiros'>('motoristas');
  const [motoristasDocs, setMotoristasDocs] = useState<DocumentosMotorista[]>(getAllDriversDocs());
  const [passageirosDocs, setPassageirosDocs] = useState<DocumentosPassageiro[]>(getAllPassengersDocs());
  
  // Modal de visualização de foto em alta definição
  const [fotoModal, setFotoModal] = useState<{ url: string; titulo: string } | null>(null);

  // Modal de rejeição com motivo
  const [rejeicaoModal, setRejeicaoModal] = useState<{
    tipo: 'motorista' | 'passageiro';
    id: string;
    campo: any;
    nome: string;
  } | null>(null);
  const [motivoRejeicao, setMotivoRejeicao] = useState('');
  const [feedbackAcao, setFeedbackAcao] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeToDocuments(() => {
      setMotoristasDocs(getAllDriversDocs());
      setPassageirosDocs(getAllPassengersDocs());
    });
    return () => unsub();
  }, []);

  const handleAprovarTodosMotorista = async (motoristaId: string, nome: string) => {
    await atualizarStatusDocumentoMotorista(motoristaId, 'todos', 'aprovado');
    setFeedbackAcao(`Todos os documentos de ${nome} foram APROVADOS.`);
    setTimeout(() => setFeedbackAcao(null), 4000);
  };

  const handleAprovarItemMotorista = async (
    motoristaId: string, 
    campo: 'fotoMotorista' | 'cnh' | 'fotoVeiculo' | 'crlv',
    campoNome: string
  ) => {
    await atualizarStatusDocumentoMotorista(motoristaId, campo, 'aprovado');
    setFeedbackAcao(`${campoNome} aprovado com sucesso.`);
    setTimeout(() => setFeedbackAcao(null), 3000);
  };

  const handleAprovarTodosPassageiro = async (passageiroId: string, nome: string) => {
    await atualizarStatusDocumentoPassageiro(passageiroId, 'todos', 'aprovado');
    setFeedbackAcao(`Todos os documentos de ${nome} foram APROVADOS.`);
    setTimeout(() => setFeedbackAcao(null), 4000);
  };

  const handleAprovarItemPassageiro = async (
    passageiroId: string, 
    campo: 'fotoPassageiro' | 'documento',
    campoNome: string
  ) => {
    await atualizarStatusDocumentoPassageiro(passageiroId, campo, 'aprovado');
    setFeedbackAcao(`${campoNome} aprovado com sucesso.`);
    setTimeout(() => setFeedbackAcao(null), 3000);
  };

  const handleConfirmarRejeicao = async () => {
    if (!rejeicaoModal) return;
    const motivo = motivoRejeicao.trim() || 'Documentação não atende aos requisitos de nitidez ou validade.';

    if (rejeicaoModal.tipo === 'motorista') {
      await atualizarStatusDocumentoMotorista(rejeicaoModal.id, rejeicaoModal.campo, 'rejeitado', motivo);
    } else {
      await atualizarStatusDocumentoPassageiro(rejeicaoModal.id, rejeicaoModal.campo, 'rejeitado', motivo);
    }

    setFeedbackAcao(`Documento rejeitado. Motivo registrado: "${motivo}"`);
    setRejeicaoModal(null);
    setMotivoRejeicao('');
    setTimeout(() => setFeedbackAcao(null), 5000);
  };

  const renderStatusBadge = (status: DocumentVerificationStatus) => {
    switch (status) {
      case 'aprovado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Aprovado</span>
          </span>
        );
      case 'rejeitado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300">
            <XCircle className="w-3 h-3 text-rose-600" />
            <span>Rejeitado</span>
          </span>
        );
      case 'em_analise':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 border border-blue-300">
            <Clock className="w-3 h-3 text-blue-600" />
            <span>Em Análise</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300">
            <AlertCircle className="w-3 h-3 text-amber-600" />
            <span>Pendente</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-6">
      {/* Header da Auditoria */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Auditoria & Verificação de Documentos</h2>
              <p className="text-xs text-slate-500">
                Aprovação de CNH com EAR, CRLV do Veículo e Documento Oficial dos Passageiros
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher: Motoristas vs Passageiros */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200 self-stretch sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('motoristas')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'motoristas'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>Motoristas ({motoristasDocs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('passageiros')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'passageiros'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Passageiros ({passageirosDocs.length})</span>
          </button>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedbackAcao && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackAcao}</span>
        </div>
      )}

      {/* TAB MOTORISTAS */}
      {activeTab === 'motoristas' && (
        <div className="space-y-6">
          {motoristasDocs.map((mot) => (
            <div 
              key={mot.id} 
              className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-5 space-y-5 hover:border-slate-300 transition-colors"
            >
              {/* Topo do Card do Motorista */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <img 
                    src={mot.fotoMotoristaUrl || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80'} 
                    alt={mot.motoristaNome}
                    className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-sm"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-slate-900">{mot.motoristaNome}</h3>
                      {renderStatusBadge(mot.statusGeral)}
                    </div>
                    <p className="text-xs text-slate-500">
                      ID: <span className="font-mono">{mot.motoristaId}</span> • CNH: <span className="font-mono font-bold text-slate-700">{mot.cnhNumero || 'Não informado'}</span> ({mot.cnhCategoria || 'B - EAR'})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => handleAprovarTodosMotorista(mot.motoristaId, mot.motoristaNome)}
                    className="flex-1 sm:flex-initial px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Aprovar Todos</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRejeicaoModal({
                      tipo: 'motorista',
                      id: mot.motoristaId,
                      campo: 'todos',
                      nome: mot.motoristaNome
                    })}
                    className="flex-1 sm:flex-initial px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Rejeitar</span>
                  </button>
                </div>
              </div>

              {/* Justificativa de análise se houver */}
              {mot.observacoesAnalise && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Observação da Auditoria:</span> {mot.observacoesAnalise}
                  </div>
                </div>
              )}

              {/* Grid dos 4 Documentos Obrigatórios */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* 1. Foto do Motorista */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                        <Camera className="w-3.5 h-3.5 text-blue-600" />
                        Foto Perfil
                      </span>
                      {renderStatusBadge(mot.fotoMotoristaStatus)}
                    </div>
                    {mot.fotoMotoristaUrl ? (
                      <div className="relative group rounded-lg overflow-hidden border border-slate-200 h-28 bg-slate-100">
                        <img 
                          src={mot.fotoMotoristaUrl} 
                          alt="Foto Motorista" 
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setFotoModal({ url: mot.fotoMotoristaUrl, titulo: `Foto de Perfil - ${mot.motoristaNome}` })}
                          className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1 text-xs font-bold"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Ver Foto</span>
                        </button>
                      </div>
                    ) : (
                      <div className="h-28 rounded-lg bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-xs">
                        Não enviada
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleAprovarItemMotorista(mot.motoristaId, 'fotoMotorista', 'Foto de Perfil')}
                      className="flex-1 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[11px] font-bold border border-emerald-200"
                    >
                      Aprovar
                    </button>
                    <button
                      type="button"
                      onClick={() => setRejeicaoModal({
                        tipo: 'motorista',
                        id: mot.motoristaId,
                        campo: 'fotoMotorista',
                        nome: `${mot.motoristaNome} (Foto Perfil)`
                      })}
                      className="flex-1 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[11px] font-bold border border-rose-200"
                    >
                      Rejeitar
                    </button>
                  </div>
                </div>

                {/* 2. CNH com EAR */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                        CNH c/ EAR
                      </span>
                      {renderStatusBadge(mot.cnhStatus)}
                    </div>
                    <div className="text-[11px] text-slate-600 mb-1">
                      Nº: <strong className="font-mono text-slate-900">{mot.cnhNumero || 'S/N'}</strong>
                    </div>
                    {mot.cnhFotoUrl ? (
                      <div className="relative group rounded-lg overflow-hidden border border-slate-200 h-24 bg-slate-100">
                        <img 
                          src={mot.cnhFotoUrl} 
                          alt="CNH" 
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setFotoModal({ url: mot.cnhFotoUrl, titulo: `CNH - ${mot.motoristaNome} (Nº ${mot.cnhNumero})` })}
                          className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1 text-xs font-bold"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Ver CNH</span>
                        </button>
                      </div>
                    ) : (
                      <div className="h-24 rounded-lg bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-xs">
                        Não enviada
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleAprovarItemMotorista(mot.motoristaId, 'cnh', 'CNH com EAR')}
                      className="flex-1 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[11px] font-bold border border-emerald-200"
                    >
                      Aprovar
                    </button>
                    <button
                      type="button"
                      onClick={() => setRejeicaoModal({
                        tipo: 'motorista',
                        id: mot.motoristaId,
                        campo: 'cnh',
                        nome: `${mot.motoristaNome} (CNH)`
                      })}
                      className="flex-1 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[11px] font-bold border border-rose-200"
                    >
                      Rejeitar
                    </button>
                  </div>
                </div>

                {/* 3. Foto do Veículo */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                        <Car className="w-3.5 h-3.5 text-blue-600" />
                        Foto Veículo
                      </span>
                      {renderStatusBadge(mot.fotoVeiculoStatus)}
                    </div>
                    {mot.fotoVeiculoUrl ? (
                      <div className="relative group rounded-lg overflow-hidden border border-slate-200 h-28 bg-slate-100">
                        <img 
                          src={mot.fotoVeiculoUrl} 
                          alt="Veículo" 
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setFotoModal({ url: mot.fotoVeiculoUrl, titulo: `Veículo Cadastrado - ${mot.motoristaNome}` })}
                          className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1 text-xs font-bold"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Ver Veículo</span>
                        </button>
                      </div>
                    ) : (
                      <div className="h-28 rounded-lg bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-xs">
                        Não enviada
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleAprovarItemMotorista(mot.motoristaId, 'fotoVeiculo', 'Foto do Veículo')}
                      className="flex-1 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[11px] font-bold border border-emerald-200"
                    >
                      Aprovar
                    </button>
                    <button
                      type="button"
                      onClick={() => setRejeicaoModal({
                        tipo: 'motorista',
                        id: mot.motoristaId,
                        campo: 'fotoVeiculo',
                        nome: `${mot.motoristaNome} (Foto do Veículo)`
                      })}
                      className="flex-1 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[11px] font-bold border border-rose-200"
                    >
                      Rejeitar
                    </button>
                  </div>
                </div>

                {/* 4. CRLV do Veículo */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                        CRLV Vigente
                      </span>
                      {renderStatusBadge(mot.crlvStatus)}
                    </div>
                    <div className="text-[11px] text-slate-600 mb-1">
                      Exercício: <strong className="text-slate-900">{mot.crlvExercicio || '2026'}</strong>
                    </div>
                    {mot.crlvFotoUrl ? (
                      <div className="relative group rounded-lg overflow-hidden border border-slate-200 h-24 bg-slate-100">
                        <img 
                          src={mot.crlvFotoUrl} 
                          alt="CRLV" 
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setFotoModal({ url: mot.crlvFotoUrl, titulo: `CRLV Digital - ${mot.motoristaNome} (Exercício ${mot.crlvExercicio})` })}
                          className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1 text-xs font-bold"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Ver CRLV</span>
                        </button>
                      </div>
                    ) : (
                      <div className="h-24 rounded-lg bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-xs">
                        Não enviada
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleAprovarItemMotorista(mot.motoristaId, 'crlv', 'CRLV')}
                      className="flex-1 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[11px] font-bold border border-emerald-200"
                    >
                      Aprovar
                    </button>
                    <button
                      type="button"
                      onClick={() => setRejeicaoModal({
                        tipo: 'motorista',
                        id: mot.motoristaId,
                        campo: 'crlv',
                        nome: `${mot.motoristaNome} (CRLV)`
                      })}
                      className="flex-1 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[11px] font-bold border border-rose-200"
                    >
                      Rejeitar
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB PASSAGEIROS */}
      {activeTab === 'passageiros' && (
        <div className="space-y-6">
          {passageirosDocs.map((pass) => (
            <div 
              key={pass.id} 
              className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-5 space-y-5 hover:border-slate-300 transition-colors"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <img 
                    src={pass.fotoPassageiroUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80'} 
                    alt={pass.passageiroNome}
                    className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-sm"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-slate-900">{pass.passageiroNome}</h3>
                      {renderStatusBadge(pass.statusGeral)}
                    </div>
                    <p className="text-xs text-slate-500">
                      ID: <span className="font-mono">{pass.passageiroId}</span> • Tipo: <span className="font-bold uppercase text-slate-700">{pass.tipoDocumento}</span> (Nº {pass.documentoNumero || 'Não informado'})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => handleAprovarTodosPassageiro(pass.passageiroId, pass.passageiroNome)}
                    className="flex-1 sm:flex-initial px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Aprovar Todos</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRejeicaoModal({
                      tipo: 'passageiro',
                      id: pass.passageiroId,
                      campo: 'todos',
                      nome: pass.passageiroNome
                    })}
                    className="flex-1 sm:flex-initial px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Rejeitar</span>
                  </button>
                </div>
              </div>

              {pass.observacoesAnalise && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Observação da Auditoria:</span> {pass.observacoesAnalise}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* 1. Foto do Passageiro */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                        <Camera className="w-3.5 h-3.5 text-blue-600" />
                        Foto de Identificação (Rosto)
                      </span>
                      {renderStatusBadge(pass.fotoPassageiroStatus)}
                    </div>
                    {pass.fotoPassageiroUrl ? (
                      <div className="relative group rounded-lg overflow-hidden border border-slate-200 h-36 bg-slate-100">
                        <img 
                          src={pass.fotoPassageiroUrl} 
                          alt="Foto Passageiro" 
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setFotoModal({ url: pass.fotoPassageiroUrl, titulo: `Foto do Passageiro - ${pass.passageiroNome}` })}
                          className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1 text-xs font-bold"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Ver Foto Ampliada</span>
                        </button>
                      </div>
                    ) : (
                      <div className="h-36 rounded-lg bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-xs">
                        Não enviada
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleAprovarItemPassageiro(pass.passageiroId, 'fotoPassageiro', 'Foto do Rosto')}
                      className="flex-1 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-200"
                    >
                      Aprovar
                    </button>
                    <button
                      type="button"
                      onClick={() => setRejeicaoModal({
                        tipo: 'passageiro',
                        id: pass.passageiroId,
                        campo: 'fotoPassageiro',
                        nome: `${pass.passageiroNome} (Foto)`
                      })}
                      className="flex-1 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold border border-rose-200"
                    >
                      Rejeitar
                    </button>
                  </div>
                </div>

                {/* 2. Documento com Foto (RG / CNH / CPF) */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                        Documento Oficial ({pass.tipoDocumento.toUpperCase()})
                      </span>
                      {renderStatusBadge(pass.documentoStatus)}
                    </div>
                    <div className="text-xs text-slate-600 mb-1">
                      Nº Registro: <strong className="font-mono text-slate-900">{pass.documentoNumero || 'Não informado'}</strong>
                    </div>
                    {pass.documentoFotoUrl ? (
                      <div className="relative group rounded-lg overflow-hidden border border-slate-200 h-36 bg-slate-100">
                        <img 
                          src={pass.documentoFotoUrl} 
                          alt="Documento" 
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setFotoModal({ url: pass.documentoFotoUrl, titulo: `Documento (${pass.tipoDocumento.toUpperCase()}) - ${pass.passageiroNome}` })}
                          className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1 text-xs font-bold"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Ver Documento</span>
                        </button>
                      </div>
                    ) : (
                      <div className="h-36 rounded-lg bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-xs">
                        Não enviada
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleAprovarItemPassageiro(pass.passageiroId, 'documento', 'Documento Oficial')}
                      className="flex-1 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-200"
                    >
                      Aprovar
                    </button>
                    <button
                      type="button"
                      onClick={() => setRejeicaoModal({
                        tipo: 'passageiro',
                        id: pass.passageiroId,
                        campo: 'documento',
                        nome: `${pass.passageiroNome} (Documento)`
                      })}
                      className="flex-1 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold border border-rose-200"
                    >
                      Rejeitar
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DE ZOOM DE FOTO EM ALTA RESOLUÇÃO */}
      {fotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <span className="text-xs font-bold truncate pr-2">{fotoModal.titulo}</span>
              <button
                type="button"
                onClick={() => setFotoModal(null)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 bg-slate-950 flex items-center justify-center max-h-[70vh] overflow-auto">
              <img 
                src={fotoModal.url} 
                alt="Documento Ampliado" 
                className="max-h-[65vh] w-auto object-contain rounded-lg shadow-md"
              />
            </div>
            <div className="p-3 bg-slate-50 border-t border-slate-200 text-center">
              <button
                type="button"
                onClick={() => setFotoModal(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
              >
                Fechar Visualização
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE REGISTRO DE REJEIÇÃO */}
      {rejeicaoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center gap-2 text-rose-600 pb-2 border-b border-slate-100">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-sm font-black text-slate-900">Rejeitar Documentação</h3>
            </div>

            <p className="text-xs text-slate-600">
              Você está rejeitando a documentação de <strong>{rejeicaoModal.nome}</strong>. Insira a justificativa que será exibida para o usuário:
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Motivo da Reprovação
              </label>
              <textarea
                rows={3}
                value={motivoRejeicao}
                onChange={(e) => setMotivoRejeicao(e.target.value)}
                placeholder="Ex: Foto da CNH ilegível; CNH sem a observação EAR; Comprovante cortado; Documento vencido..."
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-rose-500"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setRejeicaoModal(null);
                  setMotivoRejeicao('');
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleConfirmarRejeicao}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold"
              >
                Confirmar Reprovação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
