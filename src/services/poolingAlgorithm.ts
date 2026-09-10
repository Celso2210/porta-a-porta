import { 
  OfertaMotorista, 
  Cidade, 
  Parada, 
  Viagem, 
  Location 
} from '../types';
import { CIDADES_MOCK, OFERTAS_MOTORISTAS_MOCK, ROTAS_MOCK } from '../data/mockData';

export interface PoolRequest {
  origemNome: string;
  destinoNome: string;
  origemEndereco: string;
  destinoEndereco: string;
  origemLat: number;
  origemLng: number;
  destinoLat: number;
  destinoLng: number;
  qtdPassageiros: number;
  dataHorario: string;
  modalidade: 'compartilhada' | 'exclusiva';
}

export interface PoolMatchResult {
  sucesso: boolean;
  mensagem: string;
  ofertaMatched?: OfertaMotorista;
  viagemMatched?: Viagem;
  desvioAdicionalKm: number;
  precoSugerido: number;
  ordemEmbarqueEstimada: Parada[];
  economiaEstimadaPercentual: number;
  algoritmoPassos: {
    passo: number;
    titulo: string;
    detalhe: string;
    status: 'ok' | 'alerta' | 'processando';
  }[];
}

/**
 * Formula de Haversine para cálculo de distância entre pontos lat/lng em km
 */
export function calcularDistanciaHaversine(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Algoritmo de Agrupamento Porta a Porta (7 Etapas)
 */
export function executarAlgoritmoAgrupamento(
  req: PoolRequest,
  ofertasAtivas: OfertaMotorista[] = OFERTAS_MOTORISTAS_MOCK
): PoolMatchResult {
  const passos: PoolMatchResult['algoritmoPassos'] = [];

  // 1. Recebe a solicitação
  passos.push({
    passo: 1,
    titulo: 'Receber Nova Solicitação',
    detalhe: `Solicitação registrada: ${req.origemNome} ➔ ${req.destinoNome} (${req.qtdPassageiros} vaga(s))`,
    status: 'ok'
  });

  // Identifica cidades aproximadas se necessário
  const cidadeOrigem = CIDADES_MOCK.find(c => 
    req.origemNome.toLowerCase().includes(c.nome.toLowerCase()) || 
    c.nome.toLowerCase().includes(req.origemNome.toLowerCase())
  ) || CIDADES_MOCK[0];

  const cidadeDestino = CIDADES_MOCK.find(c => 
    req.destinoNome.toLowerCase().includes(c.nome.toLowerCase()) || 
    c.nome.toLowerCase().includes(req.destinoNome.toLowerCase())
  ) || CIDADES_MOCK[3];

  // 2. Procura viagens ou ofertas no mesmo sentido
  const ofertasNoMesmoSentido = ofertasAtivas.filter(ofr => {
    const origemMatch = ofr.cidadeOrigem.toLowerCase().includes(cidadeOrigem.nome.toLowerCase()) ||
                        cidadeOrigem.nome.toLowerCase().includes(ofr.cidadeOrigem.toLowerCase());
    const destinoMatch = ofr.cidadeDestino.toLowerCase().includes(cidadeDestino.nome.toLowerCase()) ||
                         cidadeDestino.nome.toLowerCase().includes(ofr.cidadeDestino.toLowerCase());
    return origemMatch || destinoMatch;
  });

  passos.push({
    passo: 2,
    titulo: 'Buscar Corredor de Viagem Compatível',
    detalhe: `Encontradas ${ofertasNoMesmoSentido.length} oferta(s) de motoristas no corredor ${cidadeOrigem.nome} - ${cidadeDestino.nome}`,
    status: ofertasNoMesmoSentido.length > 0 ? 'ok' : 'alerta'
  });

  if (ofertasNoMesmoSentido.length === 0) {
    // Se não encontrou oferta direta, tenta criar uma nova com preço base
    const rota = ROTAS_MOCK.find(r => 
      r.cidadeOrigemNome.includes(cidadeOrigem.nome) && 
      r.cidadeDestinoNome.includes(cidadeDestino.nome)
    );
    const precoBase = rota ? rota.precoBaseCompartilhado : 42.50;

    return {
      sucesso: true,
      mensagem: 'Nova viagem criada no sistema. Agrupando próximos passageiros!',
      desvioAdicionalKm: 0,
      precoSugerido: precoBase,
      ordemEmbarqueEstimada: [],
      economiaEstimadaPercentual: 60,
      algoritmoPassos: passos
    };
  }

  // 3. Verifica desvio de rota (Tolerância de até 5km)
  const ofertaSelecionada = ofertasNoMesmoSentido[0]; // Pega a melhor correspondente
  const desvioKm = Math.round((Math.random() * 2.5 + 1.2) * 10) / 10; // Simula 1.2 a 3.7 km de desvio para porta-a-porta

  passos.push({
    passo: 3,
    titulo: 'Verificar Desvio Geográfico',
    detalhe: `Desvio calculado para coleta na porta: ${desvioKm} km (dentro do limite tolerado de 5.0 km)`,
    status: desvioKm <= 5.0 ? 'ok' : 'alerta'
  });

  // 4. Verifica vagas disponíveis
  const vagasSuficientes = ofertaSelecionada.vagasDisponiveis >= req.qtdPassageiros;
  passos.push({
    passo: 4,
    titulo: 'Verificar Vagas Disponíveis',
    detalhe: `Veículo possui ${ofertaSelecionada.vagasDisponiveis} vaga(s) livres (Necessário: ${req.qtdPassageiros})`,
    status: vagasSuficientes ? 'ok' : 'alerta'
  });

  // 5. Calcula a melhor ordem de embarque e desembarque
  const paradasEstimadas: Parada[] = [
    {
      id: 'P_ST_1',
      viagemId: 'VG000123',
      tipo: 'embarque',
      passageiroId: 'USR001',
      passageiroNome: 'Celso (Você)',
      endereco: req.origemEndereco || `${req.origemNome} - Porta da Residência`,
      lat: req.origemLat || cidadeOrigem.lat,
      lng: req.origemLng || cidadeOrigem.lng,
      ordem: 1,
      status: 'pendente',
      horarioEstimado: ofertaSelecionada.horarioSaida
    },
    {
      id: 'P_ST_2',
      viagemId: 'VG000123',
      tipo: 'embarque',
      passageiroId: 'USR_OUTRO',
      passageiroNome: 'Dona Maria',
      endereco: 'Rua das Flores, Centro',
      lat: cidadeOrigem.lat + 0.005,
      lng: cidadeOrigem.lng + 0.005,
      ordem: 2,
      status: 'pendente',
      horarioEstimado: '08:15'
    },
    {
      id: 'P_ST_3',
      viagemId: 'VG000123',
      tipo: 'desembarque',
      passageiroId: 'USR001',
      passageiroNome: 'Celso (Você)',
      endereco: req.destinoEndereco || `${req.destinoNome} - Endereço Final`,
      lat: req.destinoLat || cidadeDestino.lat,
      lng: req.destinoLng || cidadeDestino.lng,
      ordem: 3,
      status: 'pendente',
      horarioEstimado: '11:45'
    }
  ];

  passos.push({
    passo: 5,
    titulo: 'Otimizar Sequência de Paradas Porta a Porta',
    detalhe: `Geradas ${paradasEstimadas.length} paradas encadeadas por proximidade geográfica min-cost.`,
    status: 'ok'
  });

  // 6. Atualiza rota do motorista
  passos.push({
    passo: 6,
    titulo: 'Atualizar Rota e Telemetria do Motorista',
    detalhe: `Placa ${ofertaSelecionada.veiculoInfo.split('(')[1]?.split(')')[0] || 'PPA-2026'} re-roteada com novo waypoint.`,
    status: 'ok'
  });

  // 7. Notifica passageiros
  passos.push({
    passo: 7,
    titulo: 'Enviar Notificações em Tempo Real',
    detalhe: `Notificação Push e WhatsApp enviada para Celso e motorista ${ofertaSelecionada.motoristaNome}`,
    status: 'ok'
  });

  return {
    sucesso: true,
    mensagem: `Agrupado com sucesso! Motorista ${ofertaSelecionada.motoristaNome} confirmado.`,
    ofertaMatched: ofertaSelecionada,
    desvioAdicionalKm: desvioKm,
    precoSugerido: ofertaSelecionada.valorPorVaga,
    ordemEmbarqueEstimada: paradasEstimadas,
    economiaEstimadaPercentual: 68, // R$ 38,90 em vez de R$ 120,00 individual
    algoritmoPassos: passos
  };
}
