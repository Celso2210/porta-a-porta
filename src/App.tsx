/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { HeaderNav } from './components/common/HeaderNav';
import { SplashView } from './components/passageiro/SplashView';
import { LoginView } from './components/passageiro/LoginView';
import { SmsView } from './components/passageiro/SmsView';
import { HomeView } from './components/passageiro/HomeView';
import { SolicitarViagemView } from './components/passageiro/SolicitarViagemView';
import { ProcurandoMotoristaView } from './components/passageiro/ProcurandoMotoristaView';
import { MotoristaACaminhoView } from './components/passageiro/MotoristaACaminhoView';
import { DuranteViagemView } from './components/passageiro/DuranteViagemView';
import { AvaliacaoView } from './components/passageiro/AvaliacaoView';

import { MotoristaDashboard } from './components/motorista/MotoristaDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ArchitectDocs } from './components/docs/ArchitectDocs';
import { FirebaseAuthView } from './components/common/FirebaseAuthView';
import { NotificationToast } from './components/common/NotificationToast';
import { PassageiroDocumentosModal } from './components/passageiro/PassageiroDocumentosModal';
import { TariffConfig } from './types';
import { 
  adicionarNovaSolicitacao, 
  reservarVagaMotorista,
  getSolicitacaoById, 
  getMinhaSolicitacaoAtiva, 
  subscribeToTripStore 
} from './services/tripStore';
import { calcularDistanciaEntreLocais } from './services/routeCalculator';
import { USUARIO_CELSO } from './data/mockData';

export type PassageiroStep = 
  | 'splash' 
  | 'login' 
  | 'sms' 
  | 'home' 
  | 'solicitar' 
  | 'procurando' 
  | 'motorista_caminho' 
  | 'durante_viagem' 
  | 'avaliacao';

export default function App() {
  const [activeModule, setActiveModule] = useState<'passageiro' | 'motorista' | 'auth' | 'admin' | 'docs'>('passageiro');
  const [passageiroStep, setPassageiroStep] = useState<PassageiroStep>('home');
  const [showDocModal, setShowDocModal] = useState(false);
  const [activeSolicitacaoId, setActiveSolicitacaoId] = useState<string | null>(null);

  // Configuração global de tarifas por KM
  const [tariffConfig, setTariffConfig] = useState<TariffConfig>({
    precoKmCompartilhada: 0.60,
    precoKmExclusiva: 2.40
  });

  // Dados da Viagem Atual
  const [tripData, setTripData] = useState({
    origem: '',
    destino: '',
    origemCompleta: '',
    destinoCompleto: '',
    passageiros: 1,
    malas: 1,
    modalidade: 'compartilhada' as 'compartilhada' | 'exclusiva',
    distanciaKm: 0,
    agendamento: 'Hoje',
    precoEstimado: 0,
    taxaReserva: 0,
    valorRestanteEmbarque: 0,
    precoPorKmAplicado: 0.60,
    phoneUser: '(27) 99876-5432',
    ruaEmbarque: '',
    numeroEmbarque: '',
    pontoReferencia: '',
    metodoPagamentoTaxa: 'PIX Instantâneo'
  });

  // Escuta em tempo real o ciclo de vida real da corrida acionado pelo motorista
  useEffect(() => {
    const unsub = subscribeToTripStore(() => {
      const sol = activeSolicitacaoId 
        ? getSolicitacaoById(activeSolicitacaoId) 
        : getMinhaSolicitacaoAtiva(USUARIO_CELSO.id);

      if (sol) {
        if (!activeSolicitacaoId) {
          setActiveSolicitacaoId(sol.id);
        }

        // Quando o motorista aceita de verdade
        if ((sol.status === 'motorista_a_caminho' || sol.status === 'motorista_chegou') && passageiroStep === 'procurando') {
          setPassageiroStep('motorista_caminho');
        } 
        // Quando o motorista inicia a viagem após embarcar o passageiro
        else if (sol.status === 'em_viagem' && (passageiroStep === 'motorista_caminho' || passageiroStep === 'procurando')) {
          setPassageiroStep('durante_viagem');
        } 
        // Quando o motorista finaliza a viagem no destino
        else if (sol.status === 'concluida' && passageiroStep === 'durante_viagem') {
          setPassageiroStep('avaliacao');
        } 
        // Se a solicitação foi cancelada
        else if (sol.status === 'cancelada' && (passageiroStep === 'procurando' || passageiroStep === 'motorista_caminho')) {
          setPassageiroStep('home');
          setActiveSolicitacaoId(null);
        }
      }
    });
    return () => unsub();
  }, [activeSolicitacaoId, passageiroStep]);

  const resetPassageiroFlow = () => {
    setPassageiroStep('home');
    setActiveSolicitacaoId(null);
  };

  const renderPassageiroContent = () => {
    switch (passageiroStep) {
      case 'splash':
        return <SplashView onContinue={() => setPassageiroStep('login')} />;

      case 'login':
        return (
          <LoginView 
            onSendSms={(phone) => {
              setTripData({ ...tripData, phoneUser: phone });
              setPassageiroStep('sms');
            }} 
            onDemoLogin={() => setPassageiroStep('home')}
          />
        );

      case 'sms':
        return (
          <SmsView 
            phone={tripData.phoneUser} 
            onVerify={() => setPassageiroStep('home')} 
            onBack={() => setPassageiroStep('login')}
          />
        );

      case 'home':
        return (
          <HomeView 
            userName="Celso"
            tariffConfig={tariffConfig}
            onSolicitar={(details) => {
              setTripData({
                ...tripData,
                origem: details.origem,
                destino: details.destino,
                origemCompleta: details.origemCompleta,
                destinoCompleto: details.destinoCompleto,
                passageiros: details.passageiros,
                malas: details.malas,
                modalidade: details.modalidade,
                distanciaKm: details.distanciaKm,
                agendamento: details.agendamento,
                precoEstimado: details.precoEstimado,
                taxaReserva: details.taxaReserva,
                valorRestanteEmbarque: details.valorRestanteEmbarque,
                precoPorKmAplicado: details.precoPorKmAplicado
              });
              setPassageiroStep('solicitar');
            }}
          />
        );

      case 'solicitar':
        return (
          <SolicitarViagemView 
            initialData={tripData}
            onConfirmar={async (detalhes) => {
              const updatedData = {
                ...tripData,
                ruaEmbarque: detalhes.ruaEmbarque,
                numeroEmbarque: detalhes.numeroEmbarque,
                pontoReferencia: detalhes.pontoReferencia,
                malas: detalhes.qtdMalaGrande,
                metodoPagamentoTaxa: detalhes.metodoPagamentoTaxa
              };
              setTripData(updatedData);

              const numFormatado = detalhes.numeroEmbarque && detalhes.numeroEmbarque.trim() !== '' && detalhes.numeroEmbarque.trim().toUpperCase() !== 'S/N'
                ? `, nº ${detalhes.numeroEmbarque}`
                : (detalhes.numeroEmbarque && detalhes.numeroEmbarque.trim().toUpperCase() === 'S/N' ? ', S/N' : '');
              const enderecoCompleto = `${detalhes.ruaEmbarque}${numFormatado} - ${updatedData.origem}${detalhes.pontoReferencia ? ` (${detalhes.pontoReferencia})` : ''}`;

              const distCalculada = updatedData.distanciaKm || calcularDistanciaEntreLocais(updatedData.origem, updatedData.destino).distanciaKm || 120;

              // Se o passageiro escolheu reservar diretamente uma vaga ofertada por um motorista
              if (detalhes.vagaEscolhidaId) {
                const resultadoReserva = await reservarVagaMotorista(
                  detalhes.vagaEscolhidaId,
                  {
                    id: USUARIO_CELSO.id,
                    nome: 'Celso (Passageiro)',
                    telefone: updatedData.phoneUser || '(27) 99876-5432',
                    avatar: USUARIO_CELSO.avatar,
                    enderecoEmbarque: enderecoCompleto,
                    enderecoDesembarque: updatedData.destino,
                    vagas: detalhes.qtdPassageiros || 1,
                    malas: detalhes.qtdMalaGrande || 1,
                    valorTotal: updatedData.precoEstimado || 45.00,
                    distanciaKm: distCalculada
                  }
                );

                if (resultadoReserva) {
                  setActiveSolicitacaoId(resultadoReserva.solicitacao.id);
                  setPassageiroStep('procurando');
                  return;
                }
              }

              const valorTotal = updatedData.precoEstimado || 45.00;
              const taxaReserva = updatedData.taxaReserva || (Math.round(valorTotal * 0.10 * 100) / 100);
              const valorRestante = updatedData.valorRestanteEmbarque || (Math.round((valorTotal - taxaReserva) * 100) / 100);

              // Caso contrário, registra a solicitação no Mural de Chamados para que os motoristas disponíveis possam aceitar
              const novaSol = adicionarNovaSolicitacao({
                passageiroId: USUARIO_CELSO.id,
                passageiroNome: 'Celso (Passageiro)',
                passageiroTelefone: updatedData.phoneUser || '(27) 99876-5432',
                passageiroAvatar: USUARIO_CELSO.avatar,
                cidadeOrigem: updatedData.origem,
                cidadeDestino: updatedData.destino,
                enderecoEmbarque: enderecoCompleto,
                enderecoDesembarque: updatedData.destinoCompleto || `${updatedData.destino}`,
                qtdPassageiros: updatedData.passageiros || 1,
                qtdMalas: detalhes.qtdMalaGrande || 1,
                modalidade: updatedData.modalidade || 'compartilhada',
                distanciaKm: distCalculada,
                valorTotal: valorTotal,
                taxaReserva: taxaReserva,
                valorLiquidoMotorista: valorRestante,
                valorRestanteEmbarque: valorTotal,
                taxaReservaPaga: true,
                metodoPagamentoTaxa: detalhes.metodoPagamentoTaxa || 'Pagamento no Embarque',
                horarioDesejado: updatedData.agendamento || 'Hoje'
              });

              setActiveSolicitacaoId(novaSol.id);
              setPassageiroStep('procurando');
            }}
            onBack={() => setPassageiroStep('home')}
          />
        );

      case 'procurando':
        return (
          <ProcurandoMotoristaView 
            solicitacaoId={activeSolicitacaoId}
            requestData={tripData}
            onMatchFound={() => setPassageiroStep('motorista_caminho')}
            onCancel={() => {
              setActiveSolicitacaoId(null);
              setPassageiroStep('home');
            }}
          />
        );

      case 'motorista_caminho':
        return (
          <MotoristaACaminhoView 
            solicitacaoId={activeSolicitacaoId}
            onIniciarViagem={() => setPassageiroStep('durante_viagem')}
            onCancelar={() => {
              setActiveSolicitacaoId(null);
              setPassageiroStep('home');
            }}
          />
        );

      case 'durante_viagem':
        return (
          <DuranteViagemView 
            solicitacaoId={activeSolicitacaoId}
            onConcluirViagem={() => setPassageiroStep('avaliacao')}
          />
        );

      case 'avaliacao':
        return (
          <AvaliacaoView 
            onFinalizar={() => {
              setActiveSolicitacaoId(null);
              setPassageiroStep('home');
            }}
          />
        );

      default:
        return (
          <HomeView 
            tariffConfig={tariffConfig}
            onSolicitar={() => setPassageiroStep('solicitar')} 
          />
        );
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans selection:bg-blue-600 selection:text-white transition-colors duration-200 ${
      activeModule === 'motorista' ? 'bg-slate-900 text-slate-100' : 'bg-slate-100 text-slate-900'
    }`}>
      {/* Top Header */}
      <HeaderNav 
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        passageiroStep={passageiroStep}
        resetPassageiroFlow={resetPassageiroFlow}
      />

      {/* Main Workspace */}
      <main className="flex-1 py-6 px-4">
        {activeModule === 'passageiro' && (
          <div className="max-w-xl mx-auto space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-6 transition-all">
              {renderPassageiroContent()}
            </div>
          </div>
        )}

        {activeModule === 'motorista' && <MotoristaDashboard />}

        {activeModule === 'auth' && <FirebaseAuthView />}

        {activeModule === 'admin' && (
          <AdminDashboard 
            tariffConfig={tariffConfig}
            onUpdateTariffConfig={(newConfig) => setTariffConfig(newConfig)}
          />
        )}

        {activeModule === 'docs' && <ArchitectDocs />}
      </main>

      {/* Modal de Documentos do Passageiro */}
      <PassageiroDocumentosModal
        isOpen={showDocModal}
        onClose={() => setShowDocModal(false)}
      />

      {/* Global FCM Notification Listener & Toast */}
      <NotificationToast usuarioUid="celso_passageiro" />

      {/* Global Footer */}
      <footer className={`border-t py-4 px-4 text-center text-xs transition-colors duration-200 ${
        activeModule === 'motorista' 
          ? 'border-slate-800 py-4 px-4 text-center text-xs text-slate-400 bg-slate-900/90' 
          : 'border-slate-200 py-4 px-4 text-center text-xs text-slate-500 bg-white/60'
      }`}>
        <p>Porta a Porta • Transporte Compartilhado Intermunicipal Oficial (Água Doce • Barra de São Francisco • Vitória)</p>
      </footer>
    </div>
  );
}
