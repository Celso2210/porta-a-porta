/**
 * Serviço e utilitários para padronização e busca por data de viagem
 * Suporta: Hoje, Amanhã, Depois de amanhã, Todas e Datas Específicas
 */

export type CategoriaDataViagem = 'todas' | 'hoje' | 'amanha' | 'depois_de_amanha' | 'futura';

export interface InfoDataViagem {
  categoria: 'hoje' | 'amanha' | 'depois_de_amanha' | 'futura';
  label: string;             // "Hoje", "Amanhã", "Depois de amanhã", ou "15/09"
  labelCompleto: string;     // "Hoje • Sex, 11/09"
  diaSemana: string;         // "Sexta", "Sábado", "Domingo"...
  dataIso: string;           // "2026-09-11"
  dataFormatada: string;     // "11/09/2026"
  corBadge: {
    bg: string;
    text: string;
    border: string;
    dot: string;
  };
}

const DIAS_SEMANA_ABREV = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const DIAS_SEMANA_NOMES = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

/**
 * Retorna uma data em formato ISO (YYYY-MM-DD) sem problemas de fuso
 */
export function formatarParaIso(data: Date): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

/**
 * Retorna a data de Hoje (YYYY-MM-DD)
 */
export function getDataHojeIso(): string {
  return formatarParaIso(new Date());
}

/**
 * Retorna a data de Amanhã (YYYY-MM-DD)
 */
export function getDataAmanhaIso(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return formatarParaIso(d);
}

/**
 * Retorna a data de Depois de Amanhã (YYYY-MM-DD)
 */
export function getDataDepoisAmanhaIso(): string {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  return formatarParaIso(d);
}

/**
 * Retorna os dados dos 3 botões rápidos para a interface
 */
export function getBotoesRapidosData(): {
  id: 'hoje' | 'amanha';
  label: string;
  diaSemana: string;
  dataCurta: string;
  dataIso: string;
}[] {
  const hoje = new Date();
  const amanha = new Date(hoje);
  amanha.setDate(amanha.getDate() + 1);

  return [
    {
      id: 'hoje',
      label: 'Hoje',
      diaSemana: DIAS_SEMANA_NOMES[hoje.getDay()],
      dataCurta: `${String(hoje.getDate()).padStart(2, '0')}/${String(hoje.getMonth() + 1).padStart(2, '0')}`,
      dataIso: formatarParaIso(hoje)
    },
    {
      id: 'amanha',
      label: 'Amanhã',
      diaSemana: DIAS_SEMANA_NOMES[amanha.getDay()],
      dataCurta: `${String(amanha.getDate()).padStart(2, '0')}/${String(amanha.getMonth() + 1).padStart(2, '0')}`,
      dataIso: formatarParaIso(amanha)
    }
  ];
}

/**
 * Analisa qualquer campo de data ou horário do passageiro e devolve classificação visual e lógica precisa
 */
export function classificarDataViagem(dataViagem?: string, horarioDesejado?: string): InfoDataViagem {
  const rawData = (dataViagem || '').trim();
  const rawHorario = (horarioDesejado || '').trim();
  const combinado = `${rawData} ${rawHorario}`.toLowerCase();

  const hoje = new Date();
  const hojeIso = formatarParaIso(hoje);
  
  const amanha = new Date(hoje);
  amanha.setDate(amanha.getDate() + 1);
  const amanhaIso = formatarParaIso(amanha);

  const depois = new Date(hoje);
  depois.setDate(depois.getDate() + 2);
  const depoisIso = formatarParaIso(depois);

  // 1. Verificação explícita por palavras-chave
  if (combinado.includes('depois de amanh') || combinado.includes('depois de amanha')) {
    return {
      categoria: 'depois_de_amanha',
      label: 'Depois de amanhã',
      labelCompleto: `Depois de amanhã • ${DIAS_SEMANA_ABREV[depois.getDay()]}, ${String(depois.getDate()).padStart(2, '0')}/${String(depois.getMonth() + 1).padStart(2, '0')}`,
      diaSemana: DIAS_SEMANA_NOMES[depois.getDay()],
      dataIso: depoisIso,
      dataFormatada: `${String(depois.getDate()).padStart(2, '0')}/${String(depois.getMonth() + 1).padStart(2, '0')}/${depois.getFullYear()}`,
      corBadge: {
        bg: 'bg-purple-500/20',
        text: 'text-purple-300',
        border: 'border-purple-500/40',
        dot: 'bg-purple-400'
      }
    };
  }

  if (combinado.includes('amanhã') || combinado.includes('amanha')) {
    return {
      categoria: 'amanha',
      label: 'Amanhã',
      labelCompleto: `Amanhã • ${DIAS_SEMANA_ABREV[amanha.getDay()]}, ${String(amanha.getDate()).padStart(2, '0')}/${String(amanha.getMonth() + 1).padStart(2, '0')}`,
      diaSemana: DIAS_SEMANA_NOMES[amanha.getDay()],
      dataIso: amanhaIso,
      dataFormatada: `${String(amanha.getDate()).padStart(2, '0')}/${String(amanha.getMonth() + 1).padStart(2, '0')}/${amanha.getFullYear()}`,
      corBadge: {
        bg: 'bg-blue-500/20',
        text: 'text-blue-300',
        border: 'border-blue-500/40',
        dot: 'bg-blue-400'
      }
    };
  }

  // 2. Verificação se tem data em formato ISO (YYYY-MM-DD)
  const isoMatch = (rawData + ' ' + rawHorario).match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  if (isoMatch) {
    const isoStr = isoMatch[0];
    if (isoStr === hojeIso) {
      return {
        categoria: 'hoje',
        label: 'Hoje',
        labelCompleto: `Hoje • ${DIAS_SEMANA_ABREV[hoje.getDay()]}, ${String(hoje.getDate()).padStart(2, '0')}/${String(hoje.getMonth() + 1).padStart(2, '0')}`,
        diaSemana: DIAS_SEMANA_NOMES[hoje.getDay()],
        dataIso: hojeIso,
        dataFormatada: `${String(hoje.getDate()).padStart(2, '0')}/${String(hoje.getMonth() + 1).padStart(2, '0')}/${hoje.getFullYear()}`,
        corBadge: {
          bg: 'bg-emerald-500/20',
          text: 'text-emerald-300',
          border: 'border-emerald-500/40',
          dot: 'bg-emerald-400'
        }
      };
    }
    if (isoStr === amanhaIso) {
      return {
        categoria: 'amanha',
        label: 'Amanhã',
        labelCompleto: `Amanhã • ${DIAS_SEMANA_ABREV[amanha.getDay()]}, ${String(amanha.getDate()).padStart(2, '0')}/${String(amanha.getMonth() + 1).padStart(2, '0')}`,
        diaSemana: DIAS_SEMANA_NOMES[amanha.getDay()],
        dataIso: amanhaIso,
        dataFormatada: `${String(amanha.getDate()).padStart(2, '0')}/${String(amanha.getMonth() + 1).padStart(2, '0')}/${amanha.getFullYear()}`,
        corBadge: {
          bg: 'bg-blue-500/20',
          text: 'text-blue-300',
          border: 'border-blue-500/40',
          dot: 'bg-blue-400'
        }
      };
    }
    if (isoStr === depoisIso) {
      return {
        categoria: 'depois_de_amanha',
        label: 'Depois de amanhã',
        labelCompleto: `Depois de amanhã • ${DIAS_SEMANA_ABREV[depois.getDay()]}, ${String(depois.getDate()).padStart(2, '0')}/${String(depois.getMonth() + 1).padStart(2, '0')}`,
        diaSemana: DIAS_SEMANA_NOMES[depois.getDay()],
        dataIso: depoisIso,
        dataFormatada: `${String(depois.getDate()).padStart(2, '0')}/${String(depois.getMonth() + 1).padStart(2, '0')}/${depois.getFullYear()}`,
        corBadge: {
          bg: 'bg-purple-500/20',
          text: 'text-purple-300',
          border: 'border-purple-500/40',
          dot: 'bg-purple-400'
        }
      };
    }

    // Data futura qualquer
    const [y, m, d] = isoStr.split('-').map(Number);
    const parsedDate = new Date(y, m - 1, d);
    const diaSemana = !isNaN(parsedDate.getTime()) ? DIAS_SEMANA_NOMES[parsedDate.getDay()] : 'Data agendada';
    const diaAbrev = !isNaN(parsedDate.getTime()) ? DIAS_SEMANA_ABREV[parsedDate.getDay()] : '';
    const labelCurta = `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}`;

    return {
      categoria: 'futura',
      label: labelCurta,
      labelCompleto: `${diaAbrev ? `${diaAbrev}, ` : ''}${labelCurta}/${y}`,
      diaSemana,
      dataIso: isoStr,
      dataFormatada: `${labelCurta}/${y}`,
      corBadge: {
        bg: 'bg-amber-500/20',
        text: 'text-amber-300',
        border: 'border-amber-500/40',
        dot: 'bg-amber-400'
      }
    };
  }

  // 3. Verificação de data em formato brasileiro (DD/MM/YYYY ou DD/MM)
  const brMatch = (rawData + ' ' + rawHorario).match(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?\b/);
  if (brMatch) {
    const d = parseInt(brMatch[1], 10);
    const m = parseInt(brMatch[2], 10);
    const y = brMatch[3] ? parseInt(brMatch[3], 10) : hoje.getFullYear();
    const isoStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

    if (isoStr === hojeIso) {
      return {
        categoria: 'hoje',
        label: 'Hoje',
        labelCompleto: `Hoje • ${DIAS_SEMANA_ABREV[hoje.getDay()]}, ${String(hoje.getDate()).padStart(2, '0')}/${String(hoje.getMonth() + 1).padStart(2, '0')}`,
        diaSemana: DIAS_SEMANA_NOMES[hoje.getDay()],
        dataIso: hojeIso,
        dataFormatada: `${String(hoje.getDate()).padStart(2, '0')}/${String(hoje.getMonth() + 1).padStart(2, '0')}/${hoje.getFullYear()}`,
        corBadge: {
          bg: 'bg-emerald-500/20',
          text: 'text-emerald-300',
          border: 'border-emerald-500/40',
          dot: 'bg-emerald-400'
        }
      };
    }
    if (isoStr === amanhaIso) {
      return {
        categoria: 'amanha',
        label: 'Amanhã',
        labelCompleto: `Amanhã • ${DIAS_SEMANA_ABREV[amanha.getDay()]}, ${String(amanha.getDate()).padStart(2, '0')}/${String(amanha.getMonth() + 1).padStart(2, '0')}`,
        diaSemana: DIAS_SEMANA_NOMES[amanha.getDay()],
        dataIso: amanhaIso,
        dataFormatada: `${String(amanha.getDate()).padStart(2, '0')}/${String(amanha.getMonth() + 1).padStart(2, '0')}/${amanha.getFullYear()}`,
        corBadge: {
          bg: 'bg-blue-500/20',
          text: 'text-blue-300',
          border: 'border-blue-500/40',
          dot: 'bg-blue-400'
        }
      };
    }
    if (isoStr === depoisIso) {
      return {
        categoria: 'depois_de_amanha',
        label: 'Depois de amanhã',
        labelCompleto: `Depois de amanhã • ${DIAS_SEMANA_ABREV[depois.getDay()]}, ${String(depois.getDate()).padStart(2, '0')}/${String(depois.getMonth() + 1).padStart(2, '0')}`,
        diaSemana: DIAS_SEMANA_NOMES[depois.getDay()],
        dataIso: depoisIso,
        dataFormatada: `${String(depois.getDate()).padStart(2, '0')}/${String(depois.getMonth() + 1).padStart(2, '0')}/${depois.getFullYear()}`,
        corBadge: {
          bg: 'bg-purple-500/20',
          text: 'text-purple-300',
          border: 'border-purple-500/40',
          dot: 'bg-purple-400'
        }
      };
    }

    const parsedDate = new Date(y, m - 1, d);
    const diaSemana = !isNaN(parsedDate.getTime()) ? DIAS_SEMANA_NOMES[parsedDate.getDay()] : 'Data agendada';
    const diaAbrev = !isNaN(parsedDate.getTime()) ? DIAS_SEMANA_ABREV[parsedDate.getDay()] : '';
    const labelCurta = `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}`;

    return {
      categoria: 'futura',
      label: labelCurta,
      labelCompleto: `${diaAbrev ? `${diaAbrev}, ` : ''}${labelCurta}/${y}`,
      diaSemana,
      dataIso: isoStr,
      dataFormatada: `${labelCurta}/${y}`,
      corBadge: {
        bg: 'bg-amber-500/20',
        text: 'text-amber-300',
        border: 'border-amber-500/40',
        dot: 'bg-amber-400'
      }
    };
  }

  // Padrão: Hoje
  return {
    categoria: 'hoje',
    label: 'Hoje',
    labelCompleto: `Hoje • ${DIAS_SEMANA_ABREV[hoje.getDay()]}, ${String(hoje.getDate()).padStart(2, '0')}/${String(hoje.getMonth() + 1).padStart(2, '0')}`,
    diaSemana: DIAS_SEMANA_NOMES[hoje.getDay()],
    dataIso: hojeIso,
    dataFormatada: `${String(hoje.getDate()).padStart(2, '0')}/${String(hoje.getMonth() + 1).padStart(2, '0')}/${hoje.getFullYear()}`,
    corBadge: {
      bg: 'bg-emerald-500/20',
      text: 'text-emerald-300',
      border: 'border-emerald-500/40',
      dot: 'bg-emerald-400'
    }
  };
}

/**
 * Valida se a viagem atende ao filtro de data selecionado pelo motorista
 */
export function atendeFiltroData(
  dataViagem?: string,
  horarioDesejado?: string,
  filtroData?: string // 'todas' | 'hoje' | 'amanha' | 'depois_de_amanha' | 'YYYY-MM-DD'
): boolean {
  if (!filtroData || filtroData === 'todas') {
    return true;
  }

  const info = classificarDataViagem(dataViagem, horarioDesejado);

  if (filtroData === 'hoje') {
    return info.categoria === 'hoje';
  }

  if (filtroData === 'amanha') {
    return info.categoria === 'amanha';
  }

  if (filtroData === 'depois_de_amanha') {
    return info.categoria === 'depois_de_amanha';
  }

  // Se for uma data específica em formato YYYY-MM-DD
  if (filtroData.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return info.dataIso === filtroData;
  }

  return true;
}
