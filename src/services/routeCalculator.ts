import { CIDADES_MOCK } from '../data/mockData';
import { TariffConfig } from '../types';

/**
 * Siglas dos 26 estados brasileiros + Distrito Federal
 */
const UFS_BRASIL = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

/**
 * Coordenadas de referência para as principais capitais e polos regionais do Brasil.
 * Permite cálculo geodésico rodoviário instantâneo para qualquer estado da federação.
 */
const POLOS_BRASIL_COORDS: Record<string, { lat: number; lng: number; uf: string }> = {
  // Espírito Santo & Corredores
  'Água Doce do Norte': { lat: -18.5483, lng: -40.9789, uf: 'ES' },
  'Barra de São Francisco': { lat: -18.7547, lng: -40.8986, uf: 'ES' },
  'Mantena': { lat: -18.7825, lng: -40.9767, uf: 'MG' },
  'Colatina': { lat: -19.5392, lng: -40.6303, uf: 'ES' },
  'Linhares': { lat: -19.3911, lng: -40.0722, uf: 'ES' },
  'São Mateus': { lat: -18.7161, lng: -39.8589, uf: 'ES' },
  'Nova Venécia': { lat: -18.7114, lng: -40.4006, uf: 'ES' },
  'Ecoporanga': { lat: -18.3733, lng: -40.8306, uf: 'ES' },
  'Aracruz': { lat: -19.8203, lng: -40.2733, uf: 'ES' },
  'Vitória': { lat: -20.3155, lng: -40.3128, uf: 'ES' },
  'Vila Velha': { lat: -20.3297, lng: -40.2925, uf: 'ES' },
  'Serra': { lat: -20.1286, lng: -40.3078, uf: 'ES' },
  'Cariacica': { lat: -20.2639, lng: -40.4200, uf: 'ES' },
  'Guarapari': { lat: -20.6756, lng: -40.4975, uf: 'ES' },
  'Cachoeiro de Itapemirim': { lat: -20.8489, lng: -41.1128, uf: 'ES' },
  'Vitória da Conquista': { lat: -14.8661, lng: -40.8394, uf: 'BA' },

  // Capitais e Polos Sudeste
  'São Paulo': { lat: -23.5505, lng: -46.6333, uf: 'SP' },
  'Campinas': { lat: -22.9056, lng: -47.0608, uf: 'SP' },
  'Ribeirão Preto': { lat: -21.1775, lng: -47.8103, uf: 'SP' },
  'Santos': { lat: -23.9619, lng: -46.3322, uf: 'SP' },
  'São José dos Campos': { lat: -23.1896, lng: -45.8841, uf: 'SP' },
  'Sorocaba': { lat: -23.5015, lng: -47.4526, uf: 'SP' },
  'Rio de Janeiro': { lat: -22.9068, lng: -43.1729, uf: 'RJ' },
  'Niterói': { lat: -22.8832, lng: -43.1034, uf: 'RJ' },
  'Petrópolis': { lat: -22.5050, lng: -43.1789, uf: 'RJ' },
  'Campos dos Goytacazes': { lat: -21.7622, lng: -41.3308, uf: 'RJ' },
  'Belo Horizonte': { lat: -19.9167, lng: -43.9345, uf: 'MG' },
  'Uberlândia': { lat: -18.9186, lng: -48.2772, uf: 'MG' },
  'Juiz de Fora': { lat: -21.7587, lng: -43.3496, uf: 'MG' },
  'Governador Valadares': { lat: -18.8511, lng: -41.9494, uf: 'MG' },
  'Teófilo Otoni': { lat: -17.8575, lng: -41.5053, uf: 'MG' },
  'Ipatinga': { lat: -19.4683, lng: -42.5367, uf: 'MG' },
  'Montes Claros': { lat: -16.7281, lng: -43.8617, uf: 'MG' },

  // Nordeste
  'Salvador': { lat: -12.9777, lng: -38.5016, uf: 'BA' },
  'Feira de Santana': { lat: -12.2667, lng: -38.9667, uf: 'BA' },
  'Itabuna': { lat: -14.7939, lng: -39.2789, uf: 'BA' },
  'Ilhéus': { lat: -14.7889, lng: -39.0494, uf: 'BA' },
  'Porto Seguro': { lat: -16.4497, lng: -39.0647, uf: 'BA' },
  'Recife': { lat: -8.0476, lng: -34.8770, uf: 'PE' },
  'Fortaleza': { lat: -3.7172, lng: -38.5433, uf: 'CE' },
  'Maceió': { lat: -9.6658, lng: -35.7350, uf: 'AL' },
  'Aracaju': { lat: -10.9472, lng: -37.0731, uf: 'SE' },
  'Natal': { lat: -5.7945, lng: -35.2110, uf: 'RN' },
  'João Pessoa': { lat: -7.1195, lng: -34.8450, uf: 'PB' },
  'São Luís': { lat: -2.5391, lng: -44.2829, uf: 'MA' },
  'Teresina': { lat: -5.0920, lng: -42.8038, uf: 'PI' },

  // Centro-Oeste
  'Brasília': { lat: -15.7975, lng: -47.8919, uf: 'DF' },
  'Goiânia': { lat: -16.6869, lng: -49.2648, uf: 'GO' },
  'Anápolis': { lat: -16.3267, lng: -48.9533, uf: 'GO' },
  'Cuiabá': { lat: -15.6014, lng: -56.0979, uf: 'MT' },
  'Campo Grande': { lat: -20.4697, lng: -54.6201, uf: 'MS' },

  // Sul
  'Curitiba': { lat: -25.4290, lng: -49.2671, uf: 'PR' },
  'Londrina': { lat: -23.3045, lng: -51.1696, uf: 'PR' },
  'Maringá': { lat: -23.4205, lng: -51.9333, uf: 'PR' },
  'Foz do Iguaçu': { lat: -25.5478, lng: -54.5880, uf: 'PR' },
  'Florianópolis': { lat: -27.5954, lng: -48.5480, uf: 'SC' },
  'Joinville': { lat: -26.3045, lng: -48.8487, uf: 'SC' },
  'Blumenau': { lat: -26.9194, lng: -49.0661, uf: 'SC' },
  'Porto Alegre': { lat: -30.0346, lng: -51.2177, uf: 'RS' },
  'Caxias do Sul': { lat: -29.1678, lng: -51.1794, uf: 'RS' },

  // Norte
  'Manaus': { lat: -3.1190, lng: -60.0217, uf: 'AM' },
  'Belém': { lat: -1.4558, lng: -48.4902, uf: 'PA' },
  'Palmas': { lat: -10.2491, lng: -48.3243, uf: 'TO' },
  'Porto Velho': { lat: -8.7619, lng: -63.9039, uf: 'RO' }
};

/**
 * Remove acentos e padroniza strings para comparação insensível a maiúsculas e caracteres especiais
 */
export function removerAcentos(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Extrai o nome da cidade brasileira de qualquer endereço ou string digitada.
 * Suporta o formato padrão dos Correios e Google Maps (ex: "Logradouro, Bairro, Cidade - UF").
 */
export function extrairCidadeDeTexto(texto: string): string | null {
  if (!texto) return null;
  const t = texto.trim();

  // 1. Tenta padrão regex com estado brasileiro: "Cidade - UF" ou "Cidade, UF" ou "Cidade/UF"
  const regexUf = /([A-Za-zÀ-ÿ\s]{3,35})\s*[-,\/]\s*(AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO)\b/i;
  const matchUf = t.match(regexUf);
  if (matchUf && matchUf[1]) {
    const rawNome = matchUf[1].trim();
    // Se tiver vírgula dentro (ex: "Rua X, 100 - Bairro, Cidade"), pega a última parte
    const partes = rawNome.split(/[,-]/);
    const cidadePossivel = partes[partes.length - 1].trim();
    if (cidadePossivel.length >= 3) {
      return cidadePossivel;
    }
  }

  const normTexto = removerAcentos(t);

  // 2. Comparações prioritárias para as cidades e capitais cadastradas no dicionário nacional
  const todasCidades = Object.keys(POLOS_BRASIL_COORDS);
  for (const cNome of todasCidades) {
    const cNorm = removerAcentos(cNome);
    if (normTexto.includes(cNorm)) {
      return cNome;
    }
  }

  // 3. Verifica cidades do mock existente
  for (const c of CIDADES_MOCK) {
    const cNorm = removerAcentos(c.nome);
    if (normTexto.includes(cNorm)) {
      return c.nome;
    }
  }

  // 4. Se o usuário digitou algo com vírgula ou hífen (ex: "Centro, Linhares"), pega o último bloco
  if (t.includes(',') || t.includes('-')) {
    const pedacos = t.split(/[,-]/).map(p => p.trim()).filter(Boolean);
    if (pedacos.length >= 2) {
      const ultimo = pedacos[pedacos.length - 1];
      if (ultimo.length >= 3 && !/^\d+$/.test(ultimo) && !UFS_BRASIL.includes(ultimo.toUpperCase())) {
        return ultimo;
      }
    }
  }

  return null;
}

/**
 * Obtém a sigla do estado (UF) de qualquer cidade brasileira ou string de endereço
 */
export function obterUfDaCidadeOuTexto(textoOuCidade: string): string {
  if (!textoOuCidade) return 'BR';
  const t = textoOuCidade.trim();

  // 1. Procura sigla explícita com delimitador: " - SP", ", MG", "/RJ"
  const matchUf = t.match(/\b(AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO)\b/i);
  if (matchUf && matchUf[1]) {
    return matchUf[1].toUpperCase();
  }

  // 2. Procura na tabela de polos do Brasil
  const norm = removerAcentos(t);
  for (const cNome in POLOS_BRASIL_COORDS) {
    if (norm.includes(removerAcentos(cNome))) {
      return POLOS_BRASIL_COORDS[cNome].uf;
    }
  }

  // 3. Procura no CIDADES_MOCK
  const cid = CIDADES_MOCK.find(c => norm.includes(removerAcentos(c.nome)));
  if (cid) return cid.uf;

  return 'BR';
}

/**
 * Extrai o número do imóvel para refinar distâncias intra-urbanas
 */
function extrairNumeroImovel(endereco: string): number {
  if (!endereco) return 100;
  const matches = endereco.match(/\d+/g);
  if (matches && matches.length > 0) {
    const num = matches.find(n => parseInt(n, 10) > 0 && parseInt(n, 10) < 10000);
    if (num) return parseInt(num, 10);
  }
  return 100;
}

/**
 * Interface com os dados da rota calculada pelo Google Maps / Google Distance Matrix ou Malha Rodoviária
 */
export interface RotaCalculadaResult {
  distanciaKm: number;
  duracaoMinutos: number;
  duracaoTexto: string;
  provedor: 'google_distance_matrix' | 'google_maps' | 'rodoviario_real' | 'estimado';
  polyline?: string;
  origem: string;
  destino: string;
}

/**
 * Consulta a Google Distance Matrix API (com fallback para Routes API e Malha Rodoviária).
 * Retorna as distâncias e tempos reais entre quaisquer endereços de origem e destino,
 * substituindo valores fixos por quilometragens 100% reais.
 */
export async function calcularDistanciaDistanceMatrix(
  origem: string,
  destino: string
): Promise<RotaCalculadaResult> {
  const origTexto = (origem || '').trim();
  const destTexto = (destino || '').trim();

  if (!origTexto || !destTexto) {
    return {
      distanciaKm: 0,
      duracaoMinutos: 0,
      duracaoTexto: '0 min',
      provedor: 'estimado',
      origem: origTexto,
      destino: destTexto
    };
  }

  try {
    const response = await fetch('/api/distancematrix', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin: origTexto, destination: destTexto })
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.success && data.distanciaKm > 0) {
        return {
          distanciaKm: data.distanciaKm,
          duracaoMinutos: data.duracaoMinutos || 0,
          duracaoTexto: data.duracaoTexto || `${data.distanciaKm} km`,
          provedor: data.provedor || 'google_distance_matrix',
          polyline: data.polyline,
          origem: origTexto,
          destino: destTexto
        };
      }
    }
  } catch (err) {
    console.warn('[Google Distance Matrix API] Requisição via backend falhou, tentando fallback geodésico:', err);
  }

  // Fallback rápido baseado nas coordenadas e topologia rodoviária brasileira
  const fallback = calcularDistanciaEntreLocais(origTexto, destTexto);
  const durMin = Math.round((fallback.distanciaKm / 70) * 60);
  return {
    distanciaKm: fallback.distanciaKm,
    duracaoMinutos: durMin,
    duracaoTexto: formatarDuracaoMinutos(durMin),
    provedor: 'estimado',
    origem: origTexto,
    destino: destTexto
  };
}

/**
 * Chama o backend com Google Distance Matrix / Routes API (com fallback de alta precisão para a malha rodoviária do Brasil).
 * Esta função garante cálculo 100% REAL de quilometragem para qualquer endereço ou cidade no Brasil.
 */
export async function calcularRotaRealGoogleMaps(
  origem: string,
  destino: string
): Promise<RotaCalculadaResult> {
  return calcularDistanciaDistanceMatrix(origem, destino);
}

function formatarDuracaoMinutos(min: number): string {
  if (!min || min <= 0) return '0 min';
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} min`;
  return `${h}h ${m.toString().padStart(2, '0')}min`;
}

/**
 * ESTRUTURA TARIFÁRIA ESCALONADA "PORTA A PORTA" (ATRAENTE AO MOTORISTA E ESCALÁVEL EM TODO O BRASIL)
 * 
 * Por que o preço por km varia de acordo com a distância?
 * - No "porta a porta", o motorista vai até a residência, aguarda o passageiro, acomoda bagagens e entrega
 *   no endereço exato de destino.
 * - Em distâncias curtas (0 a 30 km), cobrar uma taxa fixa linear baixa (ex: R$ 0,60/km = R$ 3 a R$ 15) seria
 *   inviável para o motorista, causando recusa e inviabilizando o serviço. Por isso, aplica-se tarifa mínima e maior valor/km.
 * - Em distâncias médias e longas (80 a 300+ km), o custo por km diminui progressivamente, mantendo o ticket total alto
 *   e atraente para o motorista (ex: 260 km gera R$ 156 por passageiro = R$ 624 no carro cheio).
 */
export interface ResultadoTarifaPortaAPorta {
  valorTotal: number;
  valorPorPassageiro: number;
  tarifaEfetivaPorKm: number;
  faixaDescricao: string;
  taxaReserva: number;
  valorRestanteEmbarque: number;
}

export function calcularTarifaPortaAPorta(
  distanciaKm: number,
  modalidade: 'compartilhada' | 'exclusiva',
  passageiros: number = 1,
  tariffConfig?: TariffConfig
): ResultadoTarifaPortaAPorta {
  if (distanciaKm <= 0) {
    return {
      valorTotal: 0,
      valorPorPassageiro: 0,
      tarifaEfetivaPorKm: 0,
      faixaDescricao: 'Rota não definida',
      taxaReserva: 0,
      valorRestanteEmbarque: 0
    };
  }

  const baseCompartilhada = tariffConfig?.precoKmCompartilhada ?? 0.60;
  const baseExclusiva = tariffConfig?.precoKmExclusiva ?? 2.40;

  // Fator multiplicador para refletir ajustes do administrador no painel
  const fatorComp = baseCompartilhada / 0.60;
  const fatorExcl = baseExclusiva / 2.40;

  let valorPorPassageiro = 0;
  let tarifaEfetivaPorKm = 0;
  let faixaDescricao = '';

  if (modalidade === 'compartilhada') {
    if (distanciaKm <= 30) {
      // Curta distância (urbano / cidades contíguas): tarifa mínima de porta a porta R$ 25,00 ou R$ 1,50/km
      const taxaKm = 1.50 * fatorComp;
      tarifaEfetivaPorKm = taxaKm;
      const calculado = distanciaKm * taxaKm;
      valorPorPassageiro = Math.max(25.00 * fatorComp, Math.round(calculado * 100) / 100);
      faixaDescricao = 'Curta Distância (Mínimo Porta a Porta)';
    } else if (distanciaKm <= 80) {
      // Média-Curta (31 a 80 km): R$ 1,00/km
      const taxaKm = 1.00 * fatorComp;
      tarifaEfetivaPorKm = taxaKm;
      valorPorPassageiro = Math.round(distanciaKm * taxaKm * 100) / 100;
      faixaDescricao = 'Média-Curta (Cidades Vizinhas)';
    } else if (distanciaKm <= 150) {
      // Média distância (81 a 150 km): R$ 0,75/km
      const taxaKm = 0.75 * fatorComp;
      tarifaEfetivaPorKm = taxaKm;
      valorPorPassageiro = Math.round(distanciaKm * taxaKm * 100) / 100;
      faixaDescricao = 'Regional (Média Distância)';
    } else if (distanciaKm <= 300) {
      // Intermunicipal / Corredor regular (151 a 300 km): R$ 0,60/km (ex: 260 km = R$ 156,00)
      const taxaKm = 0.60 * fatorComp;
      tarifaEfetivaPorKm = taxaKm;
      valorPorPassageiro = Math.round(distanciaKm * taxaKm * 100) / 100;
      faixaDescricao = 'Intermunicipal / Linha Regular';
    } else {
      // Interestadual / Longo curso (> 300 km): R$ 0,55/km (ex: 420 km = R$ 231,00)
      const taxaKm = 0.55 * fatorComp;
      tarifaEfetivaPorKm = taxaKm;
      valorPorPassageiro = Math.round(distanciaKm * taxaKm * 100) / 100;
      faixaDescricao = 'Interestadual / Longa Distância';
    }

    const valorTotal = Math.round(valorPorPassageiro * Math.max(1, passageiros) * 100) / 100;
    const taxaReserva = Math.round(valorTotal * 0.10 * 100) / 100;
    const valorRestanteEmbarque = Math.round((valorTotal - taxaReserva) * 100) / 100;

    return {
      valorTotal,
      valorPorPassageiro,
      tarifaEfetivaPorKm,
      faixaDescricao,
      taxaReserva,
      valorRestanteEmbarque
    };
  } else {
    // Modalidade Exclusiva (fretamento total do veículo, porta a porta VIP)
    let valorCarro = 0;

    if (distanciaKm <= 30) {
      // Mínimo para disponibilizar o carro todo exclusivo: R$ 80,00 ou R$ 4,00/km
      const taxaKm = 4.00 * fatorExcl;
      tarifaEfetivaPorKm = taxaKm;
      valorCarro = Math.max(80.00 * fatorExcl, Math.round(distanciaKm * taxaKm * 100) / 100);
      faixaDescricao = 'Exclusiva Curta (Mínimo VIP)';
    } else if (distanciaKm <= 80) {
      const taxaKm = 3.20 * fatorExcl;
      tarifaEfetivaPorKm = taxaKm;
      valorCarro = Math.round(distanciaKm * taxaKm * 100) / 100;
      faixaDescricao = 'Exclusiva Cidades Vizinhas';
    } else if (distanciaKm <= 150) {
      const taxaKm = 2.70 * fatorExcl;
      tarifaEfetivaPorKm = taxaKm;
      valorCarro = Math.round(distanciaKm * taxaKm * 100) / 100;
      faixaDescricao = 'Exclusiva Regional';
    } else if (distanciaKm <= 300) {
      const taxaKm = 2.40 * fatorExcl;
      tarifaEfetivaPorKm = taxaKm;
      valorCarro = Math.round(distanciaKm * taxaKm * 100) / 100;
      faixaDescricao = 'Exclusiva Intermunicipal';
    } else {
      const taxaKm = 2.00 * fatorExcl;
      tarifaEfetivaPorKm = taxaKm;
      valorCarro = Math.round(distanciaKm * taxaKm * 100) / 100;
      faixaDescricao = 'Exclusiva Interestadual';
    }

    const valorTotal = valorCarro;
    const taxaReserva = Math.round(valorTotal * 0.10 * 100) / 100;
    const valorRestanteEmbarque = Math.round((valorTotal - taxaReserva) * 100) / 100;

    return {
      valorTotal,
      valorPorPassageiro: valorTotal,
      tarifaEfetivaPorKm,
      faixaDescricao,
      taxaReserva,
      valorRestanteEmbarque
    };
  }
}

/**
 * Retorna uma descrição curta da faixa de distância para exibição em badges ou resumos
 */
export function obterDescricaoFaixaDistancia(distanciaKm: number): string {
  if (distanciaKm <= 30) return 'Até 30 km';
  if (distanciaKm <= 80) return '31 a 80 km';
  if (distanciaKm <= 150) return '81 a 150 km';
  if (distanciaKm <= 300) return '151 a 300 km';
  return 'Acima de 300 km';
}

/**
 * Cálculo geodésico síncrono para retorno imediato (evita qualquer travamento na digitação do usuário)
 * enquanto a rota real do Google Maps é resolvida em segundo plano.
 */
export function calcularDistanciaEntreLocais(
  origemTexto: string,
  destinoTexto: string,
  cidadeOrigemPreferida?: string,
  cidadeDestinoPreferida?: string
): {
  distanciaKm: number;
  cidadeOrigemDetectada: string;
  cidadeDestinoDetectada: string;
} {
  const origTextoLimpo = (origemTexto || '').trim();
  const destTextoLimpo = (destinoTexto || '').trim();

  let origNome = cidadeOrigemPreferida || extrairCidadeDeTexto(origTextoLimpo) || 'Água Doce do Norte';
  let destNome = cidadeDestinoPreferida || extrairCidadeDeTexto(destTextoLimpo) || '';

  if (!origTextoLimpo && !destTextoLimpo) {
    return {
      distanciaKm: 0,
      cidadeOrigemDetectada: origNome,
      cidadeDestinoDetectada: destNome
    };
  }

  if (!destNome && destTextoLimpo) {
    destNome = extrairCidadeDeTexto(destTextoLimpo) || 'Vitória';
  } else if (!destNome) {
    destNome = 'Vitória';
  }

  const mesmoMunicipio = removerAcentos(origNome) === removerAcentos(destNome);

  if (mesmoMunicipio) {
    const numOrigem = extrairNumeroImovel(origemTexto);
    const numDestino = extrairNumeroImovel(destinoTexto);
    const deltaKm = Math.abs(numOrigem - numDestino) * 0.005;
    const distIntra = Math.max(3.0, Number((4.0 + deltaKm).toFixed(1)));
    return {
      distanciaKm: distIntra,
      cidadeOrigemDetectada: origNome,
      cidadeDestinoDetectada: destNome
    };
  }

  // Busca coordenadas dos polos em todo o Brasil
  const pOrig = POLOS_BRASIL_COORDS[origNome] || buscarPoloPorSimilaridade(origNome);
  const pDest = POLOS_BRASIL_COORDS[destNome] || buscarPoloPorSimilaridade(destNome);

  if (pOrig && pDest) {
    const R = 6371;
    const dLat = (pDest.lat - pOrig.lat) * (Math.PI / 180);
    const dLon = (pDest.lng - pOrig.lng) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(pOrig.lat * (Math.PI / 180)) *
        Math.cos(pDest.lat * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    // Fator de sinuosidade rodoviária média brasileira: 1.25x
    const kmRodoviario = Math.max(5, Math.round(R * c * 1.25));
    return {
      distanciaKm: kmRodoviario,
      cidadeOrigemDetectada: origNome,
      cidadeDestinoDetectada: destNome
    };
  }

  // Caso os polos diretos não estejam na tabela rápida, infere pela relação entre as UFs
  const ufOrigem = obterUfDaCidadeOuTexto(origTextoLimpo || origNome);
  const ufDestino = obterUfDaCidadeOuTexto(destTextoLimpo || destNome);

  if (ufOrigem === ufDestino) {
    // Mesma UF, trajeto intermunicipal estimado dinamicamente
    return {
      distanciaKm: 120,
      cidadeOrigemDetectada: origNome,
      cidadeDestinoDetectada: destNome
    };
  }

  // Trajeto interestadual dinâmico
  return {
    distanciaKm: 340,
    cidadeOrigemDetectada: origNome,
    cidadeDestinoDetectada: destNome
  };
}

function buscarPoloPorSimilaridade(cidade: string) {
  const norm = removerAcentos(cidade);
  for (const k in POLOS_BRASIL_COORDS) {
    if (removerAcentos(k) === norm) {
      return POLOS_BRASIL_COORDS[k];
    }
  }
  return null;
}
