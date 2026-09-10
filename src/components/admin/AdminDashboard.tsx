import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Activity, 
  MapPin, 
  Car, 
  Users, 
  DollarSign, 
  Search, 
  Download, 
  ShieldCheck, 
  Route, 
  CheckCircle2,
  FileJson,
  Layers,
  Sliders,
  Save,
  Sparkles,
  QrCode,
  CreditCard,
  ExternalLink,
  Copy,
  Check,
  Building2,
  Wallet,
  Smartphone
} from 'lucide-react';
import { 
  CIDADES_MOCK, 
  ROTAS_MOCK, 
  VIAGEM_EXEMPLO_MOCK, 
  USUARIO_CELSO, 
  MOTORISTA_JOSE, 
  OFERTAS_MOTORISTAS_MOCK,
  METRICAS_SISTEMA 
} from '../../data/mockData';
import { TariffConfig, PaymentConfig } from '../../types';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { getPaymentConfig, savePaymentConfig, subscribePaymentConfig, gerarPayloadPixCopiaECola } from '../../services/paymentConfig';
import { getAllDriversDocs, getAllPassengersDocs, subscribeToDocuments } from '../../services/documentService';
import { AdminDocumentosAuditoria } from './AdminDocumentosAuditoria';
import QRCode from 'qrcode';

interface AdminDashboardProps {
  tariffConfig?: TariffConfig;
  onUpdateTariffConfig?: (newConfig: TariffConfig) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  tariffConfig = { precoKmCompartilhada: 0.60, precoKmExclusiva: 2.40 },
  onUpdateTariffConfig
}) => {
  const [selectedCollection, setSelectedCollection] = useState<string>('tarifas_config');
  const [searchTerm, setSearchTerm] = useState('');
  const [adminSection, setAdminSection] = useState<'tarifas_pagamento' | 'auditoria_documentos' | 'banco_firestore'>('tarifas_pagamento');

  // Documents state for audit
  const [allDrivers, setAllDrivers] = useState(getAllDriversDocs());
  const [allPassengers, setAllPassengers] = useState(getAllPassengersDocs());

  useEffect(() => {
    const unsubDocs = subscribeToDocuments(() => {
      setAllDrivers(getAllDriversDocs());
      setAllPassengers(getAllPassengersDocs());
    });
    return () => unsubDocs();
  }, []);

  // Local state for tariff inputs
  const [precoKmCompartilhada, setPrecoKmCompartilhada] = useState<number>(tariffConfig.precoKmCompartilhada);
  const [precoKmExclusiva, setPrecoKmExclusiva] = useState<number>(tariffConfig.precoKmExclusiva);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Local state for Payment & Pix & Mercado Pago configurations
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>(getPaymentConfig());
  const [savePaymentSuccess, setSavePaymentSuccess] = useState<boolean>(false);
  const [isSavingPayment, setIsSavingPayment] = useState<boolean>(false);
  const [previewQrCodeUrl, setPreviewQrCodeUrl] = useState<string>('');
  const [previewPixPayload, setPreviewPixPayload] = useState<string>('');
  const [copiadoPreview, setCopiadoPreview] = useState<boolean>(false);

  useEffect(() => {
    const unsub = subscribePaymentConfig((cfg) => {
      setPaymentConfig(cfg);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (paymentConfig.chavePix) {
      const payload = gerarPayloadPixCopiaECola(
        paymentConfig.chavePix,
        paymentConfig.nomeTitularPix || 'Porta a Porta',
        paymentConfig.cidadePix || 'Vitoria',
        4.50,
        'ADMINTESTE'
      );
      setPreviewPixPayload(payload);

      QRCode.toDataURL(payload, {
        width: 140,
        margin: 1,
        color: { dark: '#0f172a', light: '#ffffff' }
      })
      .then(url => setPreviewQrCodeUrl(url))
      .catch(err => console.error(err));
    }
  }, [paymentConfig.chavePix, paymentConfig.nomeTitularPix, paymentConfig.cidadePix]);

  const collectionsList = [
    { id: 'tarifas_config', label: 'tarifas_config', count: 1, color: 'text-blue-400' },
    { id: 'pagamentos_config', label: 'pagamentos_config (Pix/Cartão)', count: 1, color: 'text-emerald-400' },
    { id: 'documentos_motoristas', label: 'documentos_motoristas (CNH/CRLV)', count: allDrivers.length, color: 'text-teal-400' },
    { id: 'documentos_passageiros', label: 'documentos_passageiros (RG/CPF)', count: allPassengers.length, color: 'text-purple-400' },
    { id: 'usuarios', label: 'usuarios', count: 124, color: 'text-blue-400' },
    { id: 'motoristas', label: 'motoristas', count: 32, color: 'text-emerald-400' },
    { id: 'veiculos', label: 'veiculos', count: 35, color: 'text-teal-400' },
    { id: 'viagens', label: 'viagens', count: 1248, color: 'text-amber-400' },
    { id: 'paradas', label: 'paradas', count: 3890, color: 'text-indigo-400' },
    { id: 'pagamentos', label: 'pagamentos', count: 1248, color: 'text-green-400' },
    { id: 'avaliacoes', label: 'avaliacoes', count: 890, color: 'text-yellow-400' },
    { id: 'cidades', label: 'cidades', count: CIDADES_MOCK.length, color: 'text-cyan-400' },
    { id: 'rotas', label: 'rotas', count: ROTAS_MOCK.length, color: 'text-rose-400' }
  ];

  const handleSaveTariffs = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    const newConfig: TariffConfig = {
      precoKmCompartilhada: Number(precoKmCompartilhada),
      precoKmExclusiva: Number(precoKmExclusiva)
    };

    if (onUpdateTariffConfig) {
      onUpdateTariffConfig(newConfig);
    }

    try {
      await setDoc(doc(db, 'configuracoes', 'tarifas'), newConfig);
    } catch (err) {
      console.warn('Servidor offline ou sem Firestore configurado, apenas estado local atualizado.', err);
    } finally {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    }
  };

  const handleSavePaymentConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPayment(true);
    setSavePaymentSuccess(false);

    try {
      await savePaymentConfig(paymentConfig);
      setSavePaymentSuccess(true);
      setTimeout(() => setSavePaymentSuccess(false), 4000);
    } catch (err) {
      console.error('Erro ao salvar payment config:', err);
    } finally {
      setIsSavingPayment(false);
    }
  };

  const getCollectionData = () => {
    switch (selectedCollection) {
      case 'tarifas_config':
        return [{
          id: 'TARIFAS_VIGENTES',
          precoKmCompartilhada,
          precoKmExclusiva,
          unidade: 'R$ por km rodado',
          atualizadoEm: new Date().toISOString()
        }];
      case 'pagamentos_config':
        return [{
          id: 'CONFIG_PAGAMENTOS_TAXA_RESERVA',
          ...paymentConfig,
          taxaPercentual: '10%',
          atualizadoEm: new Date().toISOString()
        }];
      case 'documentos_motoristas':
        return allDrivers;
      case 'documentos_passageiros':
        return allPassengers;
      case 'usuarios':
        return [USUARIO_CELSO];
      case 'motoristas':
        return [MOTORISTA_JOSE];
      case 'veiculos':
        return [MOTORISTA_JOSE.veiculo];
      case 'viagens':
        return [VIAGEM_EXEMPLO_MOCK];
      case 'paradas':
        return VIAGEM_EXEMPLO_MOCK.paradas;
      case 'cidades':
        return CIDADES_MOCK;
      case 'rotas':
        return ROTAS_MOCK;
      case 'avaliacoes':
        return [
          {
            id: 'AVL_001',
            viagemId: 'VG000123',
            de: 'Celso',
            para: 'José da Silva',
            nota: 5,
            comentario: 'Excelente viagem porta a porta!',
            data: '2026-07-23'
          }
        ];
      case 'pagamentos':
        return [
          {
            id: 'PAG_001',
            viagemId: 'VG000123',
            valorTotal: 45.00,
            taxaReservaApp: 4.50,
            repassMotorista: 40.50,
            metodoTaxa: 'PIX Instantâneo',
            chavePixUtilizada: paymentConfig.chavePix,
            status: 'APROVADO',
            data: '2026-07-23T08:02:10'
          }
        ];
      default:
        return [VIAGEM_EXEMPLO_MOCK];
    }
  };

  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(getCollectionData(), null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `colecao_${selectedCollection}_porta_a_porta.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6">
      {/* Header Admin */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-600">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Painel do Administrador</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gestão de Preços por KM Rodado • Auditoria de Documentos • Inspeção de Coleções em Tempo Real
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportJSON}
            className="py-2 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-200 transition-colors"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>Exportar JSON da Coleção</span>
          </button>
        </div>
      </div>

      {/* Seletor de Seções Administrativas */}
      <div className="flex items-center gap-2 bg-slate-200/70 p-1.5 rounded-2xl overflow-x-auto">
        <button
          type="button"
          onClick={() => setAdminSection('tarifas_pagamento')}
          className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
            adminSection === 'tarifas_pagamento'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Tarifas por KM & Pagamentos</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminSection('auditoria_documentos')}
          className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
            adminSection === 'auditoria_documentos'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>Auditoria de Documentos</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800">
            {allDrivers.length + allPassengers.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setAdminSection('banco_firestore')}
          className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
            adminSection === 'banco_firestore'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Métricas & Banco Firestore</span>
        </button>
      </div>

      {/* SEÇÃO 1: TARIFAS & PAGAMENTOS */}
      {adminSection === 'tarifas_pagamento' && (
        <div className="space-y-6">
          {/* SEÇÃO DE CONFIGURAÇÃO DE TARIFAS POR KM RODADO */}
      <div className="bg-white border border-blue-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Configuração do Preço por KM Rodado</h2>
              <p className="text-xs text-slate-500">Defina as tarifas para Viagem Compartilhada e Viagem Exclusiva</p>
            </div>
          </div>
          <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100 uppercase">
            Sistema Tarifário Global
          </span>
        </div>

        <form onSubmit={handleSaveTariffs} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card Preço Compartilhada */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-600" />
                Viagem Compartilhada (Pool)
              </span>
              <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">
                Por Vaga / KM
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Preço por KM Rodado (R$/km)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">R$</span>
                <input
                  type="number"
                  step="0.05"
                  min="0.10"
                  max="10.00"
                  value={precoKmCompartilhada}
                  onChange={(e) => setPrecoKmCompartilhada(Number(e.target.value))}
                  className="w-full pl-10 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-extrabold text-slate-900 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="text-[11px] text-slate-500 bg-white p-2.5 rounded-xl border border-slate-200/80">
              <strong className="text-slate-700 block">Exemplo de Cálculo (260 km):</strong>
              260 km × R$ {precoKmCompartilhada.toFixed(2)} = <strong className="text-blue-600">R$ {(260 * precoKmCompartilhada).toFixed(2)}</strong> por vaga.
            </div>
          </div>

          {/* Card Preço Exclusiva */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Car className="w-4 h-4 text-blue-600" />
                Viagem Exclusiva (Fechada)
              </span>
              <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">
                Fixo por KM (Veículo Inteiro)
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Preço por KM Rodado (R$/km)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">R$</span>
                <input
                  type="number"
                  step="0.10"
                  min="0.50"
                  max="20.00"
                  value={precoKmExclusiva}
                  onChange={(e) => setPrecoKmExclusiva(Number(e.target.value))}
                  className="w-full pl-10 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-extrabold text-slate-900 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="text-[11px] text-slate-500 bg-white p-2.5 rounded-xl border border-slate-200/80">
              <strong className="text-slate-700 block">Exemplo de Cálculo (260 km):</strong>
              260 km × R$ {precoKmExclusiva.toFixed(2)} = <strong className="text-blue-600">R$ {(260 * precoKmExclusiva).toFixed(2)}</strong> (carro completo para até 6 pass.).
            </div>
          </div>

          {/* Submit Action */}
          <div className="md:col-span-2 flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Ao salvar, todos os cálculos da tela do passageiro serão atualizados em tempo real.</span>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Novas Tarifas por KM</span>
            </button>
          </div>
        </form>

        {saveSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Tarifas por KM atualizadas com sucesso e aplicadas ao simulador e Firestore!</span>
          </div>
        )}
      </div>

      {/* SEÇÃO DE CONFIGURAÇÃO DE PAGAMENTO: CHAVE PIX & LINK DE CARTÃO (MERCADO PAGO) */}
      <div className="bg-white border-2 border-emerald-500/30 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500 text-slate-950 shadow-sm">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900">Configuração de Pagamento da Taxa de Reserva (10%)</h2>
                <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full uppercase">
                  Pix & Cartão
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Cadastre sua Chave Pix e o Link de Cartão do Mercado Pago para receber a taxa de 10% paga pelos passageiros.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Recebimento Seguro da Plataforma</span>
          </div>
        </div>

        <form onSubmit={handleSavePaymentConfig} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* BLOCO 1: CHAVE PIX */}
            <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-700 flex items-center justify-center font-bold">
                    1
                  </span>
                  Chave Pix da Plataforma
                </span>
                <span className="text-[10px] bg-emerald-600 text-white font-black px-2 py-0.5 rounded uppercase">
                  Recebimento Imediato
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tipo de Chave
                  </label>
                  <select
                    value={paymentConfig.tipoChavePix}
                    onChange={(e) => setPaymentConfig({ ...paymentConfig, tipoChavePix: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="telefone">Telefone (DDD + Número)</option>
                    <option value="cnpj">CNPJ</option>
                    <option value="cpf">CPF</option>
                    <option value="email">E-mail</option>
                    <option value="aleatoria">Chave Aleatória (EVP)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Chave Pix para Recebimento
                  </label>
                  <input
                    type="text"
                    value={paymentConfig.chavePix}
                    onChange={(e) => setPaymentConfig({ ...paymentConfig, chavePix: e.target.value })}
                    placeholder="Ex: 27999887766 ou 45.123.789/0001-90"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nome do Titular / Razão Social
                  </label>
                  <input
                    type="text"
                    value={paymentConfig.nomeTitularPix}
                    onChange={(e) => setPaymentConfig({ ...paymentConfig, nomeTitularPix: e.target.value })}
                    placeholder="Ex: Porta a Porta Transportes LTDA"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Cidade do Titular
                  </label>
                  <input
                    type="text"
                    value={paymentConfig.cidadePix}
                    onChange={(e) => setPaymentConfig({ ...paymentConfig, cidadePix: e.target.value })}
                    placeholder="Ex: VITORIA"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Descrição da Cobrança Pix (Identificador)
                </label>
                <input
                  type="text"
                  value={paymentConfig.descricaoPix || ''}
                  onChange={(e) => setPaymentConfig({ ...paymentConfig, descricaoPix: e.target.value })}
                  placeholder="Ex: Taxa de Reserva 10% Porta a Porta"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Preview Rápido da Chave Pix */}
              <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center font-bold">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">Chave Pix Pronta para Uso</span>
                    <span className="text-[11px] font-mono text-slate-500 truncate max-w-[200px] block">
                      {paymentConfig.chavePix || 'Sem chave configurada'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(paymentConfig.chavePix);
                    setCopiadoPreview(true);
                    setTimeout(() => setCopiadoPreview(false), 3000);
                  }}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold flex items-center gap-1 border border-emerald-200 transition-colors"
                >
                  {copiadoPreview ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiadoPreview ? 'Chave Copiada!' : 'Copiar Chave'}</span>
                </button>
              </div>
            </div>

            {/* BLOCO 2: CARTÃO DE CRÉDITO (LINK MERCADO PAGO / GATEWAY) */}
            <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-700 flex items-center justify-center font-bold">
                    2
                  </span>
                  Link de Cartão (Mercado Pago / Outras Plataformas)
                </span>
                <span className="text-[10px] bg-blue-600 text-white font-black px-2 py-0.5 rounded uppercase">
                  Checkout Externo
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nome da Plataforma de Pagamento
                </label>
                <input
                  type="text"
                  value={paymentConfig.nomePlataformaCartao}
                  onChange={(e) => setPaymentConfig({ ...paymentConfig, nomePlataformaCartao: e.target.value })}
                  placeholder="Ex: Mercado Pago (Cartão de Crédito / Débito)"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Link de Pagamento / URL do Mercado Pago
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={paymentConfig.linkCartaoMercadoPago}
                    onChange={(e) => setPaymentConfig({ ...paymentConfig, linkCartaoMercadoPago: e.target.value })}
                    placeholder="Ex: https://link.mercadopago.com.br/portaaporta ou https://mpago.la/..."
                    className="w-full pl-3 pr-24 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                    required
                  />
                  <a
                    href={paymentConfig.linkCartaoMercadoPago}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute right-1.5 top-1.5 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[11px] font-bold flex items-center gap-1 border border-blue-200 transition-colors"
                  >
                    <span>Testar</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Cole o link do botão de pagamento criado no Mercado Pago, InfinitePay, PagSeguro ou Stripe.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Instruções para o Passageiro no Cartão
                </label>
                <textarea
                  rows={2}
                  value={paymentConfig.instrucoesPagamento || ''}
                  onChange={(e) => setPaymentConfig({ ...paymentConfig, instrucoesPagamento: e.target.value })}
                  placeholder="Ex: Você será redirecionado para o ambiente seguro do Mercado Pago para pagar a taxa de 10%."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Box explicativo do funcionamento */}
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 space-y-1">
                <span className="font-bold flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                  Como o Passageiro Paga:
                </span>
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  Na tela de confirmação, o passageiro clica na opção <strong>Cartão</strong> e abre este link em 1 clique para realizar o pagamento com segurança na sua conta do Mercado Pago.
                </p>
              </div>
            </div>

          </div>

          {/* Ações de Salvar e Feedback */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-100">
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Ao salvar, a Chave Pix e o Link do Mercado Pago entram em vigor imediatamente para todos os passageiros.
              </span>
            </div>

            <button
              type="submit"
              disabled={isSavingPayment}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
            >
              {isSavingPayment ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Salvando Configurações...
                </span>
              ) : (
                <>
                  <Save className="w-4 h-4 stroke-[2.5]" />
                  <span>Salvar Chave Pix & Link de Cartão</span>
                </>
              )}
            </button>
          </div>

          {savePaymentSuccess && (
            <div className="p-3.5 bg-emerald-50 border-2 border-emerald-300 rounded-2xl text-emerald-900 text-xs font-bold flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span>Configurações de Pagamento atualizadas com sucesso!</span>
                <span className="block text-[11px] font-normal text-emerald-800">
                  A Chave Pix <strong>{paymentConfig.chavePix}</strong> e o Link do <strong>{paymentConfig.nomePlataformaCartao}</strong> já estão ativos na tela do passageiro.
                </span>
              </div>
            </div>
          )}
        </form>
      </div>
        </div>
      )}

      {/* SEÇÃO 2: AUDITORIA DE DOCUMENTOS */}
      {adminSection === 'auditoria_documentos' && (
        <AdminDocumentosAuditoria />
      )}

      {/* SEÇÃO 3: MÉTRICAS & BANCO FIRESTORE */}
      {adminSection === 'banco_firestore' && (
        <div className="space-y-6">
          {/* Financial KPIs & Platform Revenue (10% Reservation Fee) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-emerald-950 text-white border-2 border-emerald-500 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-emerald-300 font-bold uppercase tracking-wider">Ganho do App (10% Reserva)</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-black text-emerald-400">R$ 14.285,00</span>
          <span className="text-[10px] text-emerald-300 font-medium block mt-1">100% Taxa de Reserva retida</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-medium">Faturamento Bruto</span>
            <DollarSign className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900">R$ 142.850,00</span>
          <span className="text-[10px] text-slate-500 block mt-1">Volume total transacionado</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-medium">Repasse aos Motoristas (90%)</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <span className="text-2xl font-extrabold text-blue-600">R$ 128.565,00</span>
          <span className="text-[10px] text-slate-500 block mt-1">Pago diretamente no embarque</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-medium">Taxa Ocupação Média</span>
            <Users className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-2xl font-extrabold text-amber-600">{(METRICAS_SISTEMA.taxaOcupacaoMedia * 100).toFixed(0)}%</span>
          <span className="text-[10px] text-slate-500 block mt-1">Média de 3.8 pess/carro</span>
        </div>
      </div>

      {/* Sustainability & Logistics KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-medium">Km Economizados (Pool)</span>
            <Route className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900">{METRICAS_SISTEMA.kmEconomizadosPool.toLocaleString()} km</span>
          <span className="text-[10px] text-emerald-600 font-bold block mt-1">Redução de viagens vazias</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-medium">CO₂ Evitado</span>
            <Activity className="w-4 h-4 text-teal-600" />
          </div>
          <span className="text-2xl font-extrabold text-teal-600">{METRICAS_SISTEMA.co2EvitadoKg.toLocaleString()} kg</span>
          <span className="text-[10px] text-slate-500 block mt-1">Sustentabilidade regional</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-medium">Tempo Médio Espera</span>
            <Activity className="w-4 h-4 text-indigo-600" />
          </div>
          <span className="text-2xl font-extrabold text-indigo-600">{METRICAS_SISTEMA.tempoMedioEsperaMin} min</span>
          <span className="text-[10px] text-slate-500 block mt-1">Algoritmo em tempo real</span>
        </div>
      </div>

      {/* Database Explorer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Collections Drawer Sidebar */}
        <div className="space-y-2 bg-white border border-slate-200 rounded-3xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
            <Database className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">Coleções Firestore</h3>
          </div>

          <div className="space-y-1">
            {collectionsList.map((col) => (
              <button
                key={col.id}
                onClick={() => setSelectedCollection(col.id)}
                className={`w-full p-2.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-all ${
                  selectedCollection === col.id
                    ? 'bg-blue-600 text-white font-bold shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5" />
                  <span>{col.label}</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  selectedCollection === col.id ? 'bg-white/20 text-white font-bold' : 'bg-slate-100 text-slate-500'
                }`}>
                  {col.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* JSON Inspector View */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block">
                Inspetor de Coleção
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                Coleção: <code className="text-blue-600 font-mono">/db/{selectedCollection}</code>
              </h2>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Filtrar atributos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* JSON Tree Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 overflow-x-auto max-h-[450px]">
            <pre className="text-xs font-mono text-emerald-400 leading-relaxed">
              {JSON.stringify(getCollectionData(), null, 2)}
            </pre>
          </div>
        </div>
      </div>
        </div>
      )}
    </div>
  );
};
