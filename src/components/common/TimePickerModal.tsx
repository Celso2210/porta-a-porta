import React, { useState } from 'react';
import { Clock, X, Check, ChevronRight } from 'lucide-react';

interface TimePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialValue?: string; // Formato "HH:MM" ou ""
  onSelectTime: (timeStr: string) => void;
  title?: string;
}

export const TimePickerModal: React.FC<TimePickerModalProps> = ({
  isOpen,
  onClose,
  initialValue = '',
  onSelectTime,
  title = 'Escolha o Horário de Saída'
}) => {
  // Inicializa hora e minuto a partir de initialValue ou padrão 10:00
  const parseInitial = () => {
    if (initialValue && initialValue.includes(':')) {
      const [h, m] = initialValue.split(':');
      return {
        hour: h.padStart(2, '0'),
        minute: m.padStart(2, '0')
      };
    }
    // Se vazio, sugere a hora seguinte arredondada
    const now = new Date();
    const nextHour = (now.getHours() + 1) % 24;
    return {
      hour: String(nextHour).padStart(2, '0'),
      minute: '00'
    };
  };

  const [selectedHour, setSelectedHour] = useState<string>(() => parseInitial().hour);
  const [selectedMinute, setSelectedMinute] = useState<string>(() => parseInitial().minute);
  const [tab, setTab] = useState<'hora' | 'minuto'>('hora');

  if (!isOpen) return null;

  // Lista de Horas (00 a 23)
  const horasComuns = [
    { label: 'Manhã', horas: ['06', '07', '08', '09', '10', '11'] },
    { label: 'Tarde', horas: ['12', '13', '14', '15', '16', '17'] },
    { label: 'Noite', horas: ['18', '19', '20', '21', '22', '23'] },
    { label: 'Madrugada', horas: ['00', '01', '02', '03', '04', '05'] }
  ];

  // Minutos de 5 em 5 minutos
  const minutosDisponiveis = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

  // Horários Rápidos Mais Populares
  const horariosRapidos = ['07:00', '08:00', '09:30', '10:00', '11:00', '13:00', '14:30', '16:00', '18:00'];

  const handleConfirm = () => {
    const formatted = `${selectedHour}:${selectedMinute}`;
    onSelectTime(formatted);
    onClose();
  };

  const handleSelectRapido = (rapido: string) => {
    const [h, m] = rapido.split(':');
    setSelectedHour(h);
    setSelectedMinute(m);
    onSelectTime(rapido);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">{title}</h3>
              <p className="text-[11px] text-slate-300">Selecione tocando nos números</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Visor do Horário Selecionado */}
        <div className="bg-slate-50 px-4 py-3.5 border-b border-slate-200 flex flex-col items-center justify-center gap-2">
          <div className="flex items-center gap-2">
            {/* Seletor de Hora */}
            <button
              type="button"
              onClick={() => setTab('hora')}
              className={`px-4 py-2 rounded-xl text-3xl font-black transition-all cursor-pointer ${
                tab === 'hora'
                  ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400/50 scale-105'
                  : 'bg-white text-slate-800 border border-slate-300 hover:bg-slate-100'
              }`}
            >
              {selectedHour}
            </button>

            <span className="text-3xl font-black text-slate-400">:</span>

            {/* Seletor de Minuto */}
            <button
              type="button"
              onClick={() => setTab('minuto')}
              className={`px-4 py-2 rounded-xl text-3xl font-black transition-all cursor-pointer ${
                tab === 'minuto'
                  ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400/50 scale-105'
                  : 'bg-white text-slate-800 border border-slate-300 hover:bg-slate-100'
              }`}
            >
              {selectedMinute}
            </button>
          </div>

          {/* Abas Alternadoras */}
          <div className="flex items-center gap-1 bg-slate-200 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setTab('hora')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                tab === 'hora' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1. Escolher Hora ({selectedHour}h)
            </button>
            <button
              type="button"
              onClick={() => setTab('minuto')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                tab === 'minuto' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              2. Escolher Minutos ({selectedMinute}m)
            </button>
          </div>
        </div>

        {/* Corpo com botões de clique */}
        <div className="p-3.5 overflow-y-auto space-y-3 flex-1">
          {tab === 'hora' ? (
            <div className="space-y-2.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Toque na hora desejada:
              </span>

              {horasComuns.map((grupo) => (
                <div key={grupo.label} className="space-y-1">
                  <div className="text-[10.5px] font-extrabold text-slate-400 uppercase">
                    {grupo.label}
                  </div>
                  <div className="grid grid-cols-6 gap-1.5">
                    {grupo.horas.map((h) => {
                      const isSelected = selectedHour === h;
                      return (
                        <button
                          key={h}
                          type="button"
                          onClick={() => {
                            setSelectedHour(h);
                            // Avança automaticamente para o minuto para agilidade
                            setTab('minuto');
                          }}
                          className={`py-2 rounded-xl text-sm font-black transition-all cursor-pointer flex flex-col items-center justify-center ${
                            isSelected
                              ? 'bg-blue-600 text-white shadow-xs scale-105'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95'
                          }`}
                        >
                          <span>{h}</span>
                          <span className="text-[8.5px] font-medium opacity-70">h</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Toque nos minutos:
                </span>
                <span className="text-[11px] font-bold text-blue-600">
                  Hora: {selectedHour}h
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {minutosDisponiveis.map((m) => {
                  const isSelected = selectedMinute === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setSelectedMinute(m);
                      }}
                      className={`py-2.5 rounded-xl text-sm font-black transition-all cursor-pointer flex flex-col items-center justify-center ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-xs scale-105'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95'
                      }`}
                    >
                      <span>:{m}</span>
                      <span className="text-[9px] font-medium opacity-70">min</span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setTab('hora')}
                  className="w-full text-xs font-bold text-slate-600 hover:text-slate-900 py-1.5 text-center flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>Voltar para trocar a hora</span>
                </button>
              </div>
            </div>
          )}

          {/* Horários Prontos em 1 Toque */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Horários frequentes (1 clique):
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {horariosRapidos.map((hr) => (
                <button
                  key={hr}
                  type="button"
                  onClick={() => handleSelectRapido(hr)}
                  className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200 shrink-0 transition-colors cursor-pointer"
                >
                  {hr}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Rodapé com Ação */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98"
          >
            <Check className="w-4 h-4" />
            <span>Confirmar {selectedHour}:{selectedMinute}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
