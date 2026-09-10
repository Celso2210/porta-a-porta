import React, { useState } from 'react';
import { 
  FileCode2, 
  Layers, 
  GitBranch, 
  Database, 
  Cpu, 
  BookOpen, 
  CheckCircle2, 
  Copy, 
  Code2, 
  FolderTree,
  Sparkles
} from 'lucide-react';

export const ArchitectDocs: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'arquitetura' | 'pastas' | 'algoritmo' | 'schemas'>('arquitetura');
  const [copied, setCopied] = useState(false);

  const folderStructure = `porta_a_porta/
├── apps/
│   ├── passageiro/           # App do Passageiro (Splash, Home, Solicitação, Tracking, Avaliação)
│   ├── motorista/            # App do Motorista (Publicar Saída, Rota Otimizada, Paradas Porta a Porta)
│   └── admin/                # Painel de Controle e Inspeção do Banco
│
├── backend/
│   ├── services/
│   │   ├── poolingEngine.ts  # Algoritmo de Agrupamento Intermunicipal (7 Etapas)
│   │   └── routingService.ts # Cálculo Geográfico (Haversine e Matriz de Distâncias)
│   └── api/                  # Endpoints REST / WebSocket para Telemetria em Tempo Real
│
├── firebase/
│   ├── firestore.rules       # Regras de Segurança
│   └── indexes.json          # Índices de Busca por Geolocalização e Corredores
│
├── docs/                     # Documentação de Módulos e Schemas
└── assets/                   # Ícones e Elementos Visuais`;

  const schemaExample = `{
  "id": "VG000123",
  "status": "em_andamento",
  "origem": {
    "lat": -18.48,
    "lng": -40.76,
    "endereco": "Rua A, nº 142, Água Doce do Norte"
  },
  "destino": {
    "lat": -20.31,
    "lng": -40.31,
    "endereco": "Shopping Vitória, Enseada do Suá"
  },
  "motorista": {
    "id": "MOT_01",
    "nome": "José da Silva",
    "veiculo": "Chevrolet Spin (PPA-2026)"
  },
  "passageiros": [
    {
      "id": "USR001",
      "nome": "Celso",
      "embarcou": true,
      "valor": 38.90
    }
  ],
  "paradas": [
    {
      "tipo": "embarque",
      "nome": "Celso",
      "ordem": 1,
      "horario": "08:05"
    }
  ],
  "valorTotal": 155.60,
  "data": "2026-07-23T08:00:00"
}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 md:p-6 text-white">
      {/* Header Docs */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <FileCode2 className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black tracking-tight">Documentação de Arquitetura de Software</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Visão do Arquiteto • Módulos, Algoritmo de Agrupamento e Schemas de Produção
          </p>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto w-full md:w-auto">
          <button
            onClick={() => setActiveSection('arquitetura')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeSection === 'arquitetura' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            🏛️ Arquitetura
          </button>
          <button
            onClick={() => setActiveSection('pastas')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeSection === 'pastas' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            📁 Pastas
          </button>
          <button
            onClick={() => setActiveSection('algoritmo')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeSection === 'algoritmo' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            ⚡ Algoritmo (7 Passos)
          </button>
          <button
            onClick={() => setActiveSection('schemas')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeSection === 'schemas' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            🗄️ Schemas JSON
          </button>
          <button
            onClick={() => setActiveSection('financeiro' as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              (activeSection as string) === 'financeiro' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            💰 Modelo Financeiro (10% / 90%)
          </button>
        </div>
      </div>

      {/* Conteúdo Seção 1: Arquitetura */}
      {activeSection === 'arquitetura' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              <span>Visão Geral do Sistema Porta a Porta</span>
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              O <strong className="text-emerald-400">Porta a Porta</strong> foi projetado para resolver o transporte intermunicipal de passageiros entre pequenas e médias cidades (como Água Doce do Norte, Barra de São Francisco, Colatina, Vitória), otimizando ocupação de veículos e oferecendo coleta direta na residência.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                <span className="text-xs font-bold text-emerald-400 block uppercase">1. Módulo Passageiro</span>
                <p className="text-[11px] text-slate-400">
                  Fluxo sequencial: Splash ➔ Login SMS ➔ Home ➔ Solicitação Porta a Porta ➔ Radar de Agrupamento ➔ Acompanhamento do Motorista em Tempo Real ➔ Avaliação.
                </p>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                <span className="text-xs font-bold text-emerald-400 block uppercase">2. Módulo Motorista</span>
                <p className="text-[11px] text-slate-400">
                  Publicação antecipada de disponibilidade (ex: José saindo de Água Doce às 08:00 com 4 vagas) + Sequenciamento inteligente de paradas no Waze/GPS.
                </p>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                <span className="text-xs font-bold text-emerald-400 block uppercase">3. Painel do Administrador</span>
                <p className="text-[11px] text-slate-400">
                  Inspeção em tempo real das 10 coleções Firestore, métricas de km economizados por pooling e matriz tarifária intermunicipal.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo Seção 2: Estrutura de Pastas */}
      {activeSection === 'pastas' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FolderTree className="w-5 h-5 text-emerald-400" />
              <span>Estrutura de Diretórios de Produção</span>
            </h2>
            <button
              onClick={() => copyToClipboard(folderStructure)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 rounded-xl border border-slate-700 flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5 text-emerald-400" />
              <span>{copied ? 'Copiado!' : 'Copiar Árvore'}</span>
            </button>
          </div>

          <pre className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-mono text-emerald-400 overflow-x-auto">
            {folderStructure}
          </pre>
        </div>
      )}

      {/* Conteúdo Seção 3: Algoritmo */}
      {activeSection === 'algoritmo' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-400" />
            <span>Algoritmo de Agrupamento em 7 Etapas</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
              <span className="font-bold text-emerald-400">Etapa 1: Receber Solicitação</span>
              <p className="text-slate-400">Registra origem, destino, quantidade de vagas e geolocalização do passageiro.</p>
            </div>

            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
              <span className="font-bold text-emerald-400">Etapa 2: Buscar Viagens Abertas</span>
              <p className="text-slate-400">Filtra ofertas ativas de motoristas no mesmo corredor geográfico intermunicipal.</p>
            </div>

            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
              <span className="font-bold text-emerald-400">Etapa 3: Calcular Desvio (Haversine)</span>
              <p className="text-slate-400">Garante que o desvio total para apanhar o passageiro na porta não exceda 5 km.</p>
            </div>

            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
              <span className="font-bold text-emerald-400">Etapa 4: Verificar Vagas</span>
              <p className="text-slate-400">Valida se o veículo possui assentos suficientes (ex: Spin com até 6 passageiros).</p>
            </div>

            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
              <span className="font-bold text-emerald-400">Etapa 5: Otimizar Ordem de Embarque</span>
              <p className="text-slate-400">Ordena as paradas por menor custo de deslocamento encadeado (Nearest Neighbor TSP).</p>
            </div>

            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
              <span className="font-bold text-emerald-400">Etapa 6: Atualizar Telemetria</span>
              <p className="text-slate-400">Sincroniza o GPS do motorista e recarrega os waypoints no Waze/Google Maps.</p>
            </div>

            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-1 col-span-1 md:col-span-2">
              <span className="font-bold text-emerald-400">Etapa 7: Notificar Passageiros</span>
              <p className="text-slate-400">Dispara alertas em tempo real informando horario de chegada e placa do veículo.</p>
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo Seção 4: Schemas JSON */}
      {activeSection === 'schemas' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-400" />
              <span>Documento de Viagem em Produção</span>
            </h2>
            <button
              onClick={() => copyToClipboard(schemaExample)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 rounded-xl border border-slate-700 flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5 text-emerald-400" />
              <span>{copied ? 'Copiado!' : 'Copiar JSON'}</span>
            </button>
          </div>

          <pre className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-mono text-emerald-400 overflow-x-auto">
            {schemaExample}
          </pre>
        </div>
      )}

      {/* Conteúdo Seção 5: Modelo Financeiro */}
      {(activeSection as string) === 'financeiro' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-white">Modelo Financeiro & Divisão de Receitas</h2>
              <p className="text-xs text-slate-400">Regra de negócio para taxa de reserva de 10% e repasse líquido de 90% aos motoristas.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-emerald-950/40 border-2 border-emerald-500/50 rounded-2xl space-y-2">
              <span className="text-xs font-black text-emerald-300 uppercase tracking-wider block">
                1. Taxa de Reserva (10%) • Ganho do Aplicativo
              </span>
              <p className="text-xs text-slate-300">
                Paga pelo <strong>Passageiro</strong> no momento da solicitação/reserva para assegurar a vaga no veículo.
              </p>
              <ul className="text-[11px] text-slate-400 space-y-1 list-disc list-inside">
                <li>Gera receita operacional imediata para a plataforma.</li>
                <li>Reduz cancelamentos de última hora (no-show).</li>
                <li>Processada via PIX Instantâneo ou Cartão de Crédito.</li>
              </ul>
            </div>

            <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
              <span className="text-xs font-black text-white uppercase tracking-wider block">
                2. Repasse ao Motorista (90% Líquido)
              </span>
              <p className="text-xs text-slate-300">
                O motorista visualiza no painel o <strong>Valor a Receber com o desconto da taxa de reserva já efetuado</strong>.
              </p>
              <ul className="text-[11px] text-slate-400 space-y-1 list-disc list-inside">
                <li>O valor restante (90%) é recebido diretamente pelo motorista no momento do embarque.</li>
                <li>Transparência total no painel do motorista (Bruto - Taxa 10% = Líquido).</li>
                <li>Zero inadimplência de comissões pós-viagem para a plataforma.</li>
              </ul>
            </div>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs space-y-2">
            <h4 className="font-bold text-white text-sm">Exemplo Prático: Água Doce do Norte ➔ Vitória (R$ 45,00)</h4>
            <div className="grid grid-cols-3 gap-2 text-center pt-2">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-bold">Valor Total</span>
                <span className="text-base font-extrabold text-white">R$ 45,00</span>
              </div>
              <div className="p-3 bg-emerald-950/60 rounded-xl border border-emerald-500/40">
                <span className="text-[10px] text-emerald-300 block font-bold">Taxa App (10%)</span>
                <span className="text-base font-extrabold text-emerald-400">R$ 4,50 (Paga no App)</span>
              </div>
              <div className="p-3 bg-blue-950/60 rounded-xl border border-blue-500/40">
                <span className="text-[10px] text-blue-300 block font-bold">Motorista Recebe (90%)</span>
                <span className="text-base font-extrabold text-blue-300">R$ 40,50 (No Embarque)</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl text-xs space-y-2">
            <h4 className="font-bold text-emerald-300 text-sm">Configuração de Pagamento no Painel Admin</h4>
            <p className="text-slate-300 leading-relaxed">
              O Administrador pode cadastrar no painel de controle a <strong>Chave Pix</strong> (com geração de QR Code dinâmico e BR Code Copia e Cola com CRC16) e o <strong>Link de Checkout de Cartão do Mercado Pago</strong>. As alterações são sincronizadas e refletidas em tempo real para os passageiros.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
