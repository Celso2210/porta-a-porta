export type UserRole = 'passageiro' | 'motorista' | 'admin';

export type TripStatus = 
  | 'aguardando' 
  | 'buscando_motorista' 
  | 'confirmada' 
  | 'a_caminho' 
  | 'em_andamento' 
  | 'concluida' 
  | 'cancelada';

export type StopType = 'embarque' | 'desembarque';
export type StopStatus = 'pendente' | 'concluido' | 'ausente';

export interface Location {
  lat: number;
  lng: number;
  endereco: string;
  bairro?: string;
  cidade: string;
  estado: string;
  pontoReferencia?: string;
}

export type DocumentVerificationStatus = 'pendente' | 'em_analise' | 'aprovado' | 'rejeitado';

export interface DocumentosMotorista {
  id?: string;
  motoristaId: string;
  motoristaNome: string;
  // 1. Foto do Motorista
  fotoMotoristaUrl: string;
  fotoMotoristaStatus: DocumentVerificationStatus;
  // 2. Documentos Pessoais / CNH
  cnhNumero: string;
  cnhCategoria?: string;
  cnhFotoUrl: string;
  cnhStatus: DocumentVerificationStatus;
  // 3. Foto do Carro
  fotoVeiculoUrl: string;
  fotoVeiculoStatus: DocumentVerificationStatus;
  // 4. Documento do Carro (CRLV)
  crlvNumero: string;
  crlvExercicio?: string;
  crlvFotoUrl: string;
  crlvStatus: DocumentVerificationStatus;
  statusGeral: DocumentVerificationStatus;
  dataEnvio: string;
  observacoesAnalise?: string;
}

export interface DocumentosPassageiro {
  id?: string;
  passageiroId: string;
  passageiroNome: string;
  // 1. Foto do Passageiro
  fotoPassageiroUrl: string;
  fotoPassageiroStatus: DocumentVerificationStatus;
  // 2. Documento do Passageiro (RG / CNH / CPF)
  tipoDocumento: 'rg' | 'cnh' | 'cpf';
  documentoNumero: string;
  documentoFotoUrl: string;
  documentoStatus: DocumentVerificationStatus;
  statusGeral: DocumentVerificationStatus;
  dataEnvio: string;
  observacoesAnalise?: string;
}

export interface Usuario {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  avatar: string;
  role: UserRole;
  cpf?: string;
  avaliacaoMedia: number;
  totalViagens: number;
  documentos?: DocumentosPassageiro;
  statusDocumentacao?: DocumentVerificationStatus;
  criadoEm: string;
}

export interface Veiculo {
  id: string;
  motoristaId: string;
  modelo: string;
  marca: string;
  cor: string;
  placa: string;
  ano: number;
  vagasMaximas: number;
  temArCondicionado: boolean;
  portaMalasGrande: boolean;
  fotoVeiculoUrl?: string;
  crlvFotoUrl?: string;
}

export interface Motorista {
  id: string;
  usuarioId: string;
  nome: string;
  telefone: string;
  avatar: string;
  cnh: string;
  veiculo: Veiculo;
  nota: number;
  totalViagens: number;
  ativo: boolean;
  disponibilidadeAtual?: string;
  documentos?: DocumentosMotorista;
  statusAprovacao?: DocumentVerificationStatus;
}

export interface PassageiroEmbarque {
  id: string;
  nome: string;
  telefone: string;
  avatar?: string;
  embarcou: boolean;
  qtdVagas: number;
  valorPago: number;
  enderecoEmbarque: string;
  enderecoDesembarque: string;
}

export interface Parada {
  id: string;
  viagemId: string;
  tipo: StopType;
  passageiroId: string;
  passageiroNome: string;
  endereco: string;
  lat: number;
  lng: number;
  ordem: number;
  status: StopStatus;
  horarioEstimado: string;
}

export interface Viagem {
  id: string;
  codigo: string;
  status: TripStatus;
  origem: Location;
  destino: Location;
  motorista: Motorista | null;
  passageiros: PassageiroEmbarque[];
  paradas: Parada[];
  valorTotal: number;
  valorPorPassageiro: number;
  data: string;
  horarioSaida: string;
  vagasOcupadas: number;
  vagasTotais: number;
  tipoModalidade: 'compartilhada' | 'exclusiva';
  distanciaKm: number;
  duracaoMinutos: number;
  desvioMaximoKm: number;
  observacoes?: string;
}

export type TurnoViagem = 'manha' | 'tarde' | 'noite';

export interface OfertaVaga {
  id: string;
  motoristaId: string;
  motoristaNome: string;
  motoristaTelefone: string;
  motoristaAvatar?: string;
  motoristaNota?: number;
  veiculoModelo: string;
  veiculoPlaca: string;
  cidadeOrigem: string;
  cidadeDestino: string;
  data: string;
  dataViagem?: string;
  horarioEstimado?: string;
  tipoLinha?: 'linha_completa' | 'viagem_avulsa';
  turno: TurnoViagem;
  vagasTotais: number;
  vagasDisponiveis: number;
  valorPorVaga: number;
  observacoes?: string;
  status: 'ativa' | 'lotada' | 'concluida' | 'cancelada';
  criadoEm: string;
  passageirosReservados?: {
    solicitacaoId?: string;
    passageiroId: string;
    passageiroNome: string;
    passageiroTelefone: string;
    enderecoEmbarque?: string;
    vagas: number;
    horarioConfirmado?: string;
  }[];
}

export interface OfertaMotorista {
  id: string;
  motoristaId: string;
  motoristaNome: string;
  motoristaAvatar: string;
  motoristaNota: number;
  veiculoInfo: string;
  cidadeOrigem: string;
  cidadeDestino: string;
  dataSaida: string;
  horarioSaida: string;
  vagasDisponiveis: number;
  vagasTotais: number;
  valorPorVaga: number;
  observacoes: string;
  passageirosConfirmados: {
    id: string;
    nome: string;
    vagas: number;
    bairroEmbarque: string;
  }[];
}

export interface Avaliacao {
  id: string;
  viagemId: string;
  deUsuarioId: string;
  deUsuarioNome: string;
  paraUsuarioId: string;
  nota: number;
  comentario: string;
  tags: string[];
  data: string;
}

export interface Cidade {
  id: string;
  nome: string;
  uf: string;
  lat: number;
  lng: number;
  regiao: string;
  eHubRegional: boolean;
}

export interface RotaIntermunicipal {
  id: string;
  origemCidadeId: string;
  destinoCidadeId: string;
  cidadeOrigemNome: string;
  cidadeDestinoNome: string;
  distanciaBaseKm: number;
  tempoMedioMinutos: number;
  precoBaseCompartilhado: number;
}

export interface SystemMetrics {
  totalViagens: number;
  viagensAtivas: number;
  kmEconomizadosPool: number;
  co2EvitadoKg: number;
  taxaOcupacaoMedia: number;
  tempoMedioEsperaMin: number;
}

export interface SolicitacaoViagem {
  id: string;
  passageiroId: string;
  passageiroNome: string;
  passageiroTelefone: string;
  passageiroAvatar?: string;
  cidadeOrigem: string;
  cidadeDestino: string;
  enderecoEmbarque: string;
  enderecoDesembarque: string;
  qtdPassageiros: number;
  qtdMalas: number;
  modalidade: 'compartilhada' | 'exclusiva';
  distanciaKm: number;
  valorTotal: number;
  taxaReserva: number;           // 10% taxa de reserva paga no ato (ganho do aplicativo)
  valorLiquidoMotorista: number; // 90% valor a receber pelo motorista
  valorRestanteEmbarque: number; // 90% a ser pago no embarque/desembarque
  taxaReservaPaga: boolean;
  metodoPagamentoTaxa?: string;
  dataViagem?: string;
  horarioDesejado: string;
  turno?: TurnoViagem;
  status: 
    | 'aguardando_motorista' 
    | 'proposta_enviada' 
    | 'proposta_aceita_motorista'
    | 'confirmada' 
    | 'motorista_a_caminho' 
    | 'motorista_chegou' 
    | 'em_viagem' 
    | 'concluida' 
    | 'cancelada' 
    | 'recusada';
  motoristaId?: string;
  motoristaNome?: string;
  motoristaTelefone?: string;
  motoristaAvatar?: string;
  motoristaVeiculo?: string;
  motoristaPlaca?: string;
  motoristaNota?: number;
  motoristaIdProposto?: string;
  motoristaNomeProposto?: string;
  motoristaAvatarProposto?: string;
  motoristaVeiculoProposto?: string;
  motoristaNotaProposta?: number;
  horarioSaidaProposto?: string;
  vagasRestantesNoCarro?: number;
  criadoEm: string;
}

export interface TariffConfig {
  precoKmCompartilhada: number;
  precoKmExclusiva: number;
  percentualTaxaReserva?: number; // Padrão 10%
}

export interface PaymentConfig {
  chavePix: string;
  tipoChavePix: 'cnpj' | 'telefone' | 'email' | 'aleatoria' | 'cpf';
  nomeTitularPix: string;
  cidadePix: string;
  descricaoPix?: string;
  linkCartaoMercadoPago: string;
  nomePlataformaCartao: string;
  instrucoesPagamento?: string;
  ativoPix: boolean;
  ativoCartao: boolean;
}

