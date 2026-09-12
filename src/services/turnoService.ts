import { TurnoViagem } from '../types';

export interface TurnoInfo {
  id: TurnoViagem;
  nome: string;
  horarioFaixa: string;
  labelCompleto: string;
  horarioPadrao: string;
  horaInicio: number;
  horaFim: number;
  emoji: string;
}

export const TURNOS_SISTEMA: Record<TurnoViagem, TurnoInfo> = {
  manha: {
    id: 'manha',
    nome: 'Manhã',
    horarioFaixa: '06h às 08h',
    labelCompleto: 'Manhã (06h às 08h)',
    horarioPadrao: '07:00',
    horaInicio: 6,
    horaFim: 8,
    emoji: '🌅'
  },
  tarde: {
    id: 'tarde',
    nome: 'Tarde',
    horarioFaixa: '10h às 14h',
    labelCompleto: 'Tarde (10h às 14h)',
    horarioPadrao: '11:00',
    horaInicio: 10,
    horaFim: 14,
    emoji: '☀️'
  },
  noite: {
    id: 'noite',
    nome: 'Tarde',
    horarioFaixa: '14h às 18h',
    labelCompleto: 'Tarde (14h às 18h)',
    horarioPadrao: '15:00',
    horaInicio: 14,
    horaFim: 18,
    emoji: '🌤️'
  }
};

/**
 * Detecta o turno com base em qualquer string de horário ou agendamento
 */
export function detectarTurno(textoHorario?: string): TurnoViagem {
  if (!textoHorario) return 'manha';
  const str = textoHorario.toLowerCase();

  // Se for saída imediata, pega o horário atual do sistema
  if (str.includes('imediata') || str.includes('agora')) {
    const horaAtual = new Date().getHours();
    if (horaAtual >= 14 && horaAtual <= 23) return 'noite';
    if (horaAtual >= 10 && horaAtual < 14) return 'tarde';
    return 'manha';
  }

  if (str.includes('14h') || str.includes('15:') || str.includes('16:') || str.includes('17:') || str.includes('18:') || str.includes('noite') || str.includes('18h')) {
    return 'noite';
  }

  if (str.includes('10h') || str.includes('11:') || str.includes('12:') || str.includes('13:') || str.includes('14:') || str.includes('12h') || str.includes('meio-dia')) {
    return 'tarde';
  }

  // Tenta extrair hora numérica isolada (ex: '08:00', '10:30', '11:30', '14:00')
  const matchHora = str.match(/(\d{1,2}):(\d{2})/);
  if (matchHora) {
    const hora = parseInt(matchHora[1], 10);
    if (hora >= 14 && hora <= 23) return 'noite';
    if (hora >= 10 && hora < 14) return 'tarde';
    return 'manha';
  }

  if (str.includes('tarde')) {
    return 'tarde';
  }

  return 'manha';
}

/**
 * Retorna o rótulo de turno padronizado do sistema:
 * - 'Manhã (06h às 08h)'
 * - 'Tarde (10h às 14h)'
 * - 'Tarde (14h às 18h)'
 */
export function getTurnoLabel(turnoOuHorario?: string): string {
  const turno = detectarTurno(turnoOuHorario);
  return TURNOS_SISTEMA[turno].labelCompleto;
}

/**
 * Padronização de exibição de passageiro:
 * - Viagem Exclusiva:
 *   - "Saída às 10:00 • Viagem Exclusiva"
 *   - "15/09 às 11:30 • Viagem Exclusiva"
 * - Viagem Compartilhada:
 *   - "Manhã (06h às 08h) • 1 vaga(s)"
 *   - "Tarde (10h às 14h) • 2 vaga(s)"
 *   - "Tarde (14h às 18h) • 1 vaga(s)"
 */
export function formatarTurnoEVagas(
  horarioOuTurno?: string,
  vagas: number = 1,
  isExclusivo: boolean = false
): string {
  const str = (horarioOuTurno || '').trim();
  const lower = str.toLowerCase();

  // 1. Viagem Exclusiva (Horário definido pelo passageiro)
  if (isExclusivo || lower.includes('exclusiv')) {
    if (lower.includes('saída às') || lower.includes('às ') || str.match(/\d{1,2}:\d{2}/)) {
      const limpo = str
        .replace(/•\s*Viagem Exclusiva/gi, '')
        .replace(/•\s*Carro Fechado/gi, '')
        .replace(/•\s*Carro Fretado/gi, '')
        .trim();
      return `${limpo} • Viagem Exclusiva`;
    }

    return 'Viagem Exclusiva';
  }

  // 2. Viagem Compartilhada (Turnos pré-definidos)
  const labelTurno = getTurnoLabel(horarioOuTurno);
  const vagasFormatadas = `${vagas || 1} vaga(s)`;

  return `${labelTurno} • ${vagasFormatadas}`;
}
