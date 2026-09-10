import { 
  Cidade, 
  RotaIntermunicipal, 
  Usuario, 
  Motorista, 
  OfertaMotorista, 
  Viagem, 
  SystemMetrics 
} from '../types';

export const CIDADES_MOCK: Cidade[] = [
  {
    id: 'CID_01',
    nome: 'Água Doce do Norte',
    uf: 'ES',
    lat: -18.5471,
    lng: -40.9856,
    regiao: 'Noroeste Capixaba',
    eHubRegional: false
  },
  {
    id: 'CID_02',
    nome: 'Barra de São Francisco',
    uf: 'ES',
    lat: -18.7548,
    lng: -40.8911,
    regiao: 'Noroeste Capixaba',
    eHubRegional: true
  },
  {
    id: 'CID_03',
    nome: 'Colatina',
    uf: 'ES',
    lat: -19.5398,
    lng: -40.6302,
    regiao: 'Central Capixaba',
    eHubRegional: true
  },
  {
    id: 'CID_04',
    nome: 'Vitória',
    uf: 'ES',
    lat: -20.3155,
    lng: -40.3128,
    regiao: 'Metropolitana',
    eHubRegional: true
  },
  {
    id: 'CID_05',
    nome: 'Vila Velha',
    uf: 'ES',
    lat: -20.3297,
    lng: -40.2925,
    regiao: 'Metropolitana',
    eHubRegional: true
  },
  {
    id: 'CID_06',
    nome: 'Linhares',
    uf: 'ES',
    lat: -19.3911,
    lng: -40.0722,
    regiao: 'Norte Capixaba',
    eHubRegional: true
  },
  {
    id: 'CID_07',
    nome: 'São Mateus',
    uf: 'ES',
    lat: -18.7161,
    lng: -39.8589,
    regiao: 'Norte Capixaba',
    eHubRegional: true
  },
  {
    id: 'CID_08',
    nome: 'Mantena',
    uf: 'MG',
    lat: -18.7811,
    lng: -40.9815,
    regiao: 'Leste de Minas',
    eHubRegional: false
  },
  {
    id: 'CID_09',
    nome: 'Ecoporanga',
    uf: 'ES',
    lat: -18.3734,
    lng: -40.8306,
    regiao: 'Noroeste Capixaba',
    eHubRegional: false
  },
  {
    id: 'CID_10',
    nome: 'Nova Venécia',
    uf: 'ES',
    lat: -18.7108,
    lng: -40.4003,
    regiao: 'Noroeste Capixaba',
    eHubRegional: true
  },
  {
    id: 'CID_11',
    nome: 'Serra',
    uf: 'ES',
    lat: -20.1286,
    lng: -40.3078,
    regiao: 'Metropolitana',
    eHubRegional: true
  },
  {
    id: 'CID_12',
    nome: 'Cariacica',
    uf: 'ES',
    lat: -20.2638,
    lng: -40.4201,
    regiao: 'Metropolitana',
    eHubRegional: true
  },
  {
    id: 'CID_13',
    nome: 'Guarapari',
    uf: 'ES',
    lat: -20.6728,
    lng: -40.4981,
    regiao: 'Metropolitana',
    eHubRegional: false
  },
  {
    id: 'CID_14',
    nome: 'Aracruz',
    uf: 'ES',
    lat: -19.8203,
    lng: -40.2733,
    regiao: 'Litoral Norte',
    eHubRegional: false
  },
  {
    id: 'CID_15',
    nome: 'Cachoeiro de Itapemirim',
    uf: 'ES',
    lat: -20.8489,
    lng: -41.1128,
    regiao: 'Sul Capixaba',
    eHubRegional: true
  },
  {
    id: 'CID_16',
    nome: 'Vitória da Conquista',
    uf: 'BA',
    lat: -14.8661,
    lng: -40.8394,
    regiao: 'Sudoeste Baiano',
    eHubRegional: true
  }
];

export const ROTAS_MOCK: RotaIntermunicipal[] = [
  {
    id: 'ROT_01',
    origemCidadeId: 'CID_01',
    destinoCidadeId: 'CID_04',
    cidadeOrigemNome: 'Água Doce do Norte',
    cidadeDestinoNome: 'Vitória',
    distanciaBaseKm: 260,
    tempoMedioMinutos: 240,
    precoBaseCompartilhado: 45.00
  },
  {
    id: 'ROT_02',
    origemCidadeId: 'CID_01',
    destinoCidadeId: 'CID_02',
    cidadeOrigemNome: 'Água Doce do Norte',
    cidadeDestinoNome: 'Barra de São Francisco',
    distanciaBaseKm: 32,
    tempoMedioMinutos: 35,
    precoBaseCompartilhado: 15.00
  },
  {
    id: 'ROT_03',
    origemCidadeId: 'CID_02',
    destinoCidadeId: 'CID_04',
    cidadeOrigemNome: 'Barra de São Francisco',
    cidadeDestinoNome: 'Vitória',
    distanciaBaseKm: 230,
    tempoMedioMinutos: 210,
    precoBaseCompartilhado: 38.90
  },
  {
    id: 'ROT_04',
    origemCidadeId: 'CID_02',
    destinoCidadeId: 'CID_03',
    cidadeOrigemNome: 'Barra de São Francisco',
    cidadeDestinoNome: 'Colatina',
    distanciaBaseKm: 110,
    tempoMedioMinutos: 110,
    precoBaseCompartilhado: 25.00
  },
  {
    id: 'ROT_05',
    origemCidadeId: 'CID_03',
    destinoCidadeId: 'CID_04',
    cidadeOrigemNome: 'Colatina',
    cidadeDestinoNome: 'Vitória',
    distanciaBaseKm: 130,
    tempoMedioMinutos: 120,
    precoBaseCompartilhado: 28.00
  }
];

export const USUARIO_CELSO: Usuario = {
  id: 'USR001',
  nome: 'Celso',
  telefone: '(27) 99876-5432',
  email: 'celso.passageiro@portaorta.com.br',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  role: 'passageiro',
  avaliacaoMedia: 4.95,
  totalViagens: 38,
  criadoEm: '2025-02-10'
};

export const MOTORISTA_JOSE: Motorista = {
  id: 'MOT_01',
  usuarioId: 'USR_MOT_01',
  nome: 'José da Silva',
  telefone: '(27) 99911-2233',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  cnh: '01234567890',
  nota: 4.9,
  totalViagens: 342,
  ativo: true,
  disponibilidadeAtual: 'Saída de Água Doce às 08:00 para Vitória (4 vagas disponíveis)',
  veiculo: {
    id: 'VEI_01',
    motoristaId: 'MOT_01',
    modelo: 'Spin Premier 1.8 7 Lugares',
    marca: 'Chevrolet',
    cor: 'Prata',
    placa: 'PPA-2026',
    ano: 2024,
    vagasMaximas: 6,
    temArCondicionado: true,
    portaMalasGrande: true
  }
};

export const MOTORISTA_CARLOS: Motorista = {
  id: 'MOT_02',
  usuarioId: 'USR_MOT_02',
  nome: 'Carlos Eduardo',
  telefone: '(27) 99822-4455',
  avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  cnh: '98765432100',
  nota: 4.85,
  totalViagens: 215,
  ativo: true,
  disponibilidadeAtual: 'Saída de Barra de São Francisco às 10:30 para Vitória',
  veiculo: {
    id: 'VEI_02',
    motoristaId: 'MOT_02',
    modelo: 'Doblo Essence 1.8',
    marca: 'Fiat',
    cor: 'Branco',
    placa: 'PPP-8899',
    ano: 2023,
    vagasMaximas: 6,
    temArCondicionado: true,
    portaMalasGrande: true
  }
};

export const OFERTAS_MOTORISTAS_MOCK: OfertaMotorista[] = [
  {
    id: 'OFR_001',
    motoristaId: MOTORISTA_JOSE.id,
    motoristaNome: MOTORISTA_JOSE.nome,
    motoristaAvatar: MOTORISTA_JOSE.avatar,
    motoristaNota: MOTORISTA_JOSE.nota,
    veiculoInfo: 'Chevrolet Spin Prata (PPA-2026) • Ar & Bagageiro',
    cidadeOrigem: 'Água Doce do Norte',
    cidadeDestino: 'Vitória',
    dataSaida: '2026-07-24',
    horarioSaida: '08:00',
    vagasDisponiveis: 4,
    vagasTotais: 6,
    valorPorVaga: 40.00,
    observacoes: 'Faço embarque direto na porta da sua casa. Parada para café na Rodoviária de Colatina.',
    passageirosConfirmados: [
      {
        id: 'USR_099',
        nome: 'Dona Maria',
        vagas: 1,
        bairroEmbarque: 'Centro (Água Doce)'
      },
      {
        id: 'USR_098',
        nome: 'Sr. Antonio',
        vagas: 1,
        bairroEmbarque: 'Vila Nova'
      }
    ]
  },
  {
    id: 'OFR_002',
    motoristaId: MOTORISTA_CARLOS.id,
    motoristaNome: MOTORISTA_CARLOS.nome,
    motoristaAvatar: MOTORISTA_CARLOS.avatar,
    motoristaNota: MOTORISTA_CARLOS.nota,
    veiculoInfo: 'Fiat Doblo Branco (PPP-8899) • Ar Gelando',
    cidadeOrigem: 'Barra de São Francisco',
    cidadeDestino: 'Vitória',
    dataSaida: '2026-07-24',
    horarioSaida: '10:30',
    vagasDisponiveis: 3,
    vagasTotais: 6,
    valorPorVaga: 38.90,
    observacoes: 'Passo no Hospital Santa Rita e Aeroporto de Vitória em seguida.',
    passageirosConfirmados: [
      {
        id: 'USR_097',
        nome: 'Lucia',
        vagas: 2,
        bairroEmbarque: 'Bairro Carabina'
      }
    ]
  }
];

export const VIAGEM_EXEMPLO_MOCK: Viagem = {
  id: 'VG000123',
  codigo: 'VG-00123',
  status: 'em_andamento',
  origem: {
    lat: -18.4812,
    lng: -40.7621,
    endereco: 'Rua A, nº 142, Centro',
    bairro: 'Centro',
    cidade: 'Água Doce do Norte',
    estado: 'ES',
    pontoReferencia: 'Próximo à Praça Central'
  },
  destino: {
    lat: -20.3155,
    lng: -40.3128,
    endereco: 'Av. Américo Buaiz, 200, Enseada do Suá',
    bairro: 'Enseada do Suá',
    cidade: 'Vitória',
    estado: 'ES',
    pontoReferencia: 'Shopping Vitória / Curva da Jurema'
  },
  motorista: MOTORISTA_JOSE,
  passageiros: [
    {
      id: 'USR001',
      nome: 'Celso',
      telefone: '(27) 99876-5432',
      avatar: USUARIO_CELSO.avatar,
      embarcou: true,
      qtdVagas: 1,
      valorPago: 38.90,
      enderecoEmbarque: 'Rua A, nº 142 - Água Doce',
      enderecoDesembarque: 'Shopping Vitória'
    },
    {
      id: 'USR002',
      nome: 'Ana Cláudia',
      telefone: '(27) 99777-1122',
      embarcou: true,
      qtdVagas: 1,
      valorPago: 38.90,
      enderecoEmbarque: 'Av. Jones dos Santos Neves - Barra de São Francisco',
      enderecoDesembarque: 'Hospital Santa Rita - Vitória'
    },
    {
      id: 'USR003',
      nome: 'Marcos Vinicius',
      telefone: '(27) 99666-3344',
      embarcou: false,
      qtdVagas: 1,
      valorPago: 38.90,
      enderecoEmbarque: 'Posto de Molla - Colatina',
      enderecoDesembarque: 'Aeroporto de Vitória'
    }
  ],
  paradas: [
    {
      id: 'PAR_01',
      viagemId: 'VG000123',
      tipo: 'embarque',
      passageiroId: 'USR001',
      passageiroNome: 'Celso',
      endereco: 'Rua A, nº 142, Água Doce do Norte',
      lat: -18.4812,
      lng: -40.7621,
      ordem: 1,
      status: 'concluido',
      horarioEstimado: '08:05'
    },
    {
      id: 'PAR_02',
      viagemId: 'VG000123',
      tipo: 'embarque',
      passageiroId: 'USR002',
      passageiroNome: 'Ana Cláudia',
      endereco: 'Av. Jones dos Santos Neves, Barra de São Francisco',
      lat: -18.7548,
      lng: -40.8911,
      ordem: 2,
      status: 'concluido',
      horarioEstimado: '08:45'
    },
    {
      id: 'PAR_03',
      viagemId: 'VG000123',
      tipo: 'embarque',
      passageiroId: 'USR003',
      passageiroNome: 'Marcos Vinicius',
      endereco: 'Posto De Molla, Colatina',
      lat: -19.5398,
      lng: -40.6302,
      ordem: 3,
      status: 'pendente',
      horarioEstimado: '10:15'
    },
    {
      id: 'PAR_04',
      viagemId: 'VG000123',
      tipo: 'desembarque',
      passageiroId: 'USR002',
      passageiroNome: 'Ana Cláudia',
      endereco: 'Hospital Santa Rita, Vitória',
      lat: -20.3100,
      lng: -40.3200,
      ordem: 4,
      status: 'pendente',
      horarioEstimado: '12:00'
    },
    {
      id: 'PAR_05',
      viagemId: 'VG000123',
      tipo: 'desembarque',
      passageiroId: 'USR001',
      passageiroNome: 'Celso',
      endereco: 'Shopping Vitória, Enseada do Suá',
      lat: -20.3155,
      lng: -40.3128,
      ordem: 5,
      status: 'pendente',
      horarioEstimado: '12:15'
    }
  ],
  valorTotal: 155.60,
  valorPorPassageiro: 38.90,
  data: '2026-07-23',
  horarioSaida: '08:00',
  vagasOcupadas: 3,
  vagasTotais: 6,
  tipoModalidade: 'compartilhada',
  distanciaKm: 265,
  duracaoMinutos: 250,
  desvioMaximoKm: 4.2
};

export const METRICAS_SISTEMA: SystemMetrics = {
  totalViagens: 1248,
  viagensAtivas: 14,
  kmEconomizadosPool: 48920,
  co2EvitadoKg: 7820,
  taxaOcupacaoMedia: 0.82,
  tempoMedioEsperaMin: 12
};
