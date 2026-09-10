import { CIDADES_MOCK } from '../data/mockData';
import { extrairCidadeDeTexto, obterUfDaCidadeOuTexto } from './routeCalculator';

export interface SugestaoEndereco {
  id: string;
  titulo: string;
  subtitulo: string;
  enderecoCompleto: string;
  cidade: string;
  iconeTipo: 'rua' | 'rodoviaria' | 'hospital' | 'aeroporto' | 'centro' | 'ponto';
}

const LOCAIS_POPULARES: SugestaoEndereco[] = [
  // Serra
  {
    id: 'serra-01',
    titulo: 'Serra Dourada II',
    subtitulo: 'Bairro Serra Dourada II, Serra - ES',
    enderecoCompleto: 'Avenida Principal, nº 100 - Serra Dourada II, Serra - ES',
    cidade: 'Serra',
    iconeTipo: 'rua'
  },
  {
    id: 'serra-02',
    titulo: 'Serra Dourada I',
    subtitulo: 'Bairro Serra Dourada I, Serra - ES',
    enderecoCompleto: 'Rua das Palmeiras, nº 250 - Serra Dourada I, Serra - ES',
    cidade: 'Serra',
    iconeTipo: 'rua'
  },
  {
    id: 'serra-03',
    titulo: 'Serra Dourada III',
    subtitulo: 'Bairro Serra Dourada III, Serra - ES',
    enderecoCompleto: 'Avenida Central, nº 500 - Serra Dourada III, Serra - ES',
    cidade: 'Serra',
    iconeTipo: 'rua'
  },
  {
    id: 'serra-04',
    titulo: 'Parque Residencial Laranjeiras',
    subtitulo: 'Av. Segunda Avenida, Laranjeiras, Serra - ES',
    enderecoCompleto: 'Segunda Avenida, nº 400 - Laranjeiras, Serra - ES',
    cidade: 'Serra',
    iconeTipo: 'centro'
  },
  {
    id: 'serra-05',
    titulo: 'Hospital Estadual Dr. Jayme dos Santos Neves',
    subtitulo: 'Av. Paulo Pereira Gomes, Morada de Laranjeiras, Serra - ES',
    enderecoCompleto: 'Hospital Dr. Jayme, Av. Paulo Pereira Gomes, nº 100 - Morada de Laranjeiras, Serra - ES',
    cidade: 'Serra',
    iconeTipo: 'hospital'
  },
  {
    id: 'serra-06',
    titulo: 'Terminal de Carapina / Eurico Salles',
    subtitulo: 'BR-101, Carapina, Serra - ES',
    enderecoCompleto: 'Terminal de Carapina, BR-101, Km 2,5 - Carapina, Serra - ES',
    cidade: 'Serra',
    iconeTipo: 'rodoviaria'
  },
  {
    id: 'serra-07',
    titulo: 'Shopping Mestre Álvaro',
    subtitulo: 'Av. Atylano Ivo, Eurico Salles, Serra - ES',
    enderecoCompleto: 'Shopping Mestre Álvaro, Av. Atylano Ivo - Serra - ES',
    cidade: 'Serra',
    iconeTipo: 'centro'
  },
  {
    id: 'serra-08',
    titulo: 'Praia de Jacaraípe',
    subtitulo: 'Av. Abido Saadi, Jacaraípe, Serra - ES',
    enderecoCompleto: 'Avenida Abido Saadi, nº 1200 - Jacaraípe, Serra - ES',
    cidade: 'Serra',
    iconeTipo: 'ponto'
  },

  // Água Doce do Norte
  {
    id: 'adn-01',
    titulo: 'Praça Central / Centro',
    subtitulo: 'Centro, Água Doce do Norte - ES',
    enderecoCompleto: 'Praça Central, nº 100 - Centro, Água Doce do Norte - ES',
    cidade: 'Água Doce do Norte',
    iconeTipo: 'centro'
  },
  {
    id: 'adn-02',
    titulo: 'Rua Sebastião Rabelo',
    subtitulo: 'Bairro Vila Nova, Água Doce do Norte - ES',
    enderecoCompleto: 'Rua Sebastião Rabelo, nº 250 - Bairro Vila Nova, Água Doce do Norte - ES',
    cidade: 'Água Doce do Norte',
    iconeTipo: 'rua'
  },
  {
    id: 'adn-03',
    titulo: 'Posto de Saúde Central',
    subtitulo: 'Rua Principal - Centro, Água Doce do Norte - ES',
    enderecoCompleto: 'Posto de Saúde Central, Rua Principal, nº 50 - Centro, Água Doce do Norte - ES',
    cidade: 'Água Doce do Norte',
    iconeTipo: 'hospital'
  },

  // Vitória
  {
    id: 'vix-01',
    titulo: 'Terminal Rodoviário de Vitória',
    subtitulo: 'Ilha do Príncipe, Vitória - ES',
    enderecoCompleto: 'Terminal Rodoviário de Vitória, Av. Alexandre Buaiz, nº 350 - Ilha do Príncipe, Vitória - ES',
    cidade: 'Vitória',
    iconeTipo: 'rodoviaria'
  },
  {
    id: 'vix-02',
    titulo: 'Aeroporto Eurico de Aguiar Salles',
    subtitulo: 'Av. Roza Helena Schorling Albuquerque, Goiabeiras, Vitória - ES',
    enderecoCompleto: 'Aeroporto de Vitória, Av. Roza Helena Schorling Albuquerque, nº 10 - Goiabeiras, Vitória - ES',
    cidade: 'Vitória',
    iconeTipo: 'aeroporto'
  },
  {
    id: 'vix-03',
    titulo: 'Jardim Camburi / Av. Dante Michelini',
    subtitulo: 'Jardim Camburi, Vitória - ES',
    enderecoCompleto: 'Avenida Dante Michelini, nº 2500 - Jardim Camburi, Vitória - ES',
    cidade: 'Vitória',
    iconeTipo: 'rua'
  },
  {
    id: 'vix-04',
    titulo: 'Hospital Santa Rita de Cássia',
    subtitulo: 'Avenida Marechal Campos, Maruípe, Vitória - ES',
    enderecoCompleto: 'Hospital Santa Rita, Av. Marechal Campos, nº 1579 - Maruípe, Vitória - ES',
    cidade: 'Vitória',
    iconeTipo: 'hospital'
  },
  {
    id: 'vix-05',
    titulo: 'Shopping Vitória / Enseada do Suá',
    subtitulo: 'Av. Américo Buaiz, Enseada do Suá, Vitória - ES',
    enderecoCompleto: 'Shopping Vitória, Av. Américo Buaiz, nº 200 - Enseada do Suá, Vitória - ES',
    cidade: 'Vitória',
    iconeTipo: 'centro'
  },

  // Vila Velha
  {
    id: 'vv-01',
    titulo: 'Praia da Costa / Av. Gil Veloso',
    subtitulo: 'Praia da Costa, Vila Velha - ES',
    enderecoCompleto: 'Avenida Antônio Gil Veloso, nº 1800 - Praia da Costa, Vila Velha - ES',
    cidade: 'Vila Velha',
    iconeTipo: 'rua'
  },
  {
    id: 'vv-02',
    titulo: 'Itapoã / Coqueiral de Itaparica',
    subtitulo: 'Itapoã, Vila Velha - ES',
    enderecoCompleto: 'Avenida Jair de Andrade, nº 500 - Itapoã, Vila Velha - ES',
    cidade: 'Vila Velha',
    iconeTipo: 'rua'
  },
  {
    id: 'vv-03',
    titulo: 'Shopping Vila Velha',
    subtitulo: 'Av. Luciano das Neves, Divino Espírito Santo, Vila Velha - ES',
    enderecoCompleto: 'Shopping Vila Velha, Av. Luciano das Neves, nº 2418 - Vila Velha - ES',
    cidade: 'Vila Velha',
    iconeTipo: 'centro'
  },

  // Barra de São Francisco
  {
    id: 'bsf-01',
    titulo: 'Hospital Dr. Alceu Melgaço Filho',
    subtitulo: 'Bairro Campo Novo, Barra de São Francisco - ES',
    enderecoCompleto: 'Hospital Dr. Alceu Melgaço Filho, Rua Des. Danton Bastos, nº 300 - Campo Novo, Barra de São Francisco - ES',
    cidade: 'Barra de São Francisco',
    iconeTipo: 'hospital'
  },
  {
    id: 'bsf-02',
    titulo: 'Centro / Praça Arlindo Pinto da Silva',
    subtitulo: 'Centro, Barra de São Francisco - ES',
    enderecoCompleto: 'Praça Arlindo Pinto da Silva, nº 100 - Centro, Barra de São Francisco - ES',
    cidade: 'Barra de São Francisco',
    iconeTipo: 'centro'
  },

  // Colatina
  {
    id: 'col-01',
    titulo: 'Centro de Colatina / Av. Getúlio Vargas',
    subtitulo: 'Centro, Colatina - ES',
    enderecoCompleto: 'Avenida Getúlio Vargas, nº 500 - Centro, Colatina - ES',
    cidade: 'Colatina',
    iconeTipo: 'rua'
  },

  // Linhares
  {
    id: 'lin-01',
    titulo: 'Centro de Linhares / Av. Governador Lindenberg',
    subtitulo: 'Centro, Linhares - ES',
    enderecoCompleto: 'Avenida Governador Lindenberg, nº 700 - Centro, Linhares - ES',
    cidade: 'Linhares',
    iconeTipo: 'rua'
  },

  // São Mateus
  {
    id: 'stm-01',
    titulo: 'Praia de Guriri',
    subtitulo: 'Guriri, São Mateus - ES',
    enderecoCompleto: 'Avenida Oceano Atlântico, nº 200 - Guriri, São Mateus - ES',
    cidade: 'São Mateus',
    iconeTipo: 'ponto'
  }
];

function removerAcentos(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Retorna uma lista de projeções e sugestões inteligentes de endereços enquanto o usuário digita
 */
export function buscarSugestoesEndereco(
  texto: string,
  tipo: 'embarque' | 'desembarque',
  cidadeAtualContexto?: string
): SugestaoEndereco[] {
  if (!texto || texto.trim().length < 2) {
    // Pouco texto: mostra os principais hubs e destinos relevantes
    if (tipo === 'embarque') {
      const cidadeBase = cidadeAtualContexto || 'Água Doce do Norte';
      return LOCAIS_POPULARES.filter(l => l.cidade === cidadeBase || ['Água Doce do Norte', 'Barra de São Francisco'].includes(l.cidade)).slice(0, 4);
    } else {
      const cidadeBase = cidadeAtualContexto || 'Vitória';
      return LOCAIS_POPULARES.filter(l => ['Serra', 'Vitória', 'Vila Velha', cidadeBase].includes(l.cidade)).slice(0, 4);
    }
  }

  const queryNorm = removerAcentos(texto);

  // 1. Procura correspondências exatas em LOCAIS_POPULARES
  const correspondentesDirectos = LOCAIS_POPULARES.filter(item => {
    const t = removerAcentos(item.titulo);
    const s = removerAcentos(item.subtitulo);
    const e = removerAcentos(item.enderecoCompleto);
    const c = removerAcentos(item.cidade);
    return t.includes(queryNorm) || s.includes(queryNorm) || e.includes(queryNorm) || c.includes(queryNorm);
  });

  // Se temos 3 ou mais correspondências exatas em locais populares cadastrados, retorna
  if (correspondentesDirectos.length >= 3) {
    return correspondentesDirectos.slice(0, 5);
  }

  // 2. Inteligência de Detecção da Cidade pelo Texto Digitado
  const cidadeDetectada = extrairCidadeDeTexto(texto);

  // 3. Projeções de Endereço Dinâmicas
  const dinamicos: SugestaoEndereco[] = [];

  if (cidadeDetectada) {
    // Identificou a cidade brasileira no texto: busca o UF real correspondente em todo o Brasil
    const cidadeObj = CIDADES_MOCK.find(c => c.nome.toLowerCase() === cidadeDetectada.toLowerCase());
    const uf = cidadeObj ? cidadeObj.uf : obterUfDaCidadeOuTexto(`${cidadeDetectada} ${texto}`);

    dinamicos.push({
      id: `proj-det-1-${Date.now()}`,
      titulo: texto.trim(),
      subtitulo: `Endereço em ${cidadeDetectada} - ${uf}`,
      enderecoCompleto: `${texto.trim()}, ${cidadeDetectada} - ${uf}`,
      cidade: cidadeDetectada,
      iconeTipo: 'rua'
    });
  } else {
    // Se não detectou a cidade no texto, projeta na cidade que já está selecionada no contexto do usuário
    const cidadePadrao = cidadeAtualContexto || (tipo === 'embarque' ? 'Água Doce do Norte' : 'Vitória');
    const cidadeObj = CIDADES_MOCK.find(c => c.nome.toLowerCase() === cidadePadrao.toLowerCase());
    const uf = cidadeObj ? cidadeObj.uf : obterUfDaCidadeOuTexto(cidadePadrao);

    dinamicos.push({
      id: `proj-padrao-1-${Date.now()}`,
      titulo: texto.trim(),
      subtitulo: `Endereço em ${cidadePadrao} - ${uf}`,
      enderecoCompleto: `${texto.trim()}, ${cidadePadrao} - ${uf}`,
      cidade: cidadePadrao,
      iconeTipo: 'rua'
    });

    // Se for desembarque e o destino for na Região Metropolitana, adiciona opções vizinhas na Grande Vitória
    if (tipo === 'desembarque' && ['Vitória', 'Vila Velha', 'Serra', 'Cariacica'].includes(cidadePadrao)) {
      const vizinhos = ['Serra', 'Vitória', 'Vila Velha'].filter(c => c !== cidadePadrao);
      vizinhos.forEach((vizi, idx) => {
        dinamicos.push({
          id: `proj-vizi-${idx}-${Date.now()}`,
          titulo: texto.trim(),
          subtitulo: `Endereço em ${vizi} - ES`,
          enderecoCompleto: `${texto.trim()}, ${vizi} - ES`,
          cidade: vizi,
          iconeTipo: 'rua'
        });
      });
    }
  }

  // Unifica correspondências diretas e dinâmicas sem duplicatas
  const combinados = [...correspondentesDirectos, ...dinamicos];
  const mapaUnicos = new Map<string, SugestaoEndereco>();
  combinados.forEach(item => {
    if (!mapaUnicos.has(item.enderecoCompleto)) {
      mapaUnicos.set(item.enderecoCompleto, item);
    }
  });

  return Array.from(mapaUnicos.values()).slice(0, 5);
}
