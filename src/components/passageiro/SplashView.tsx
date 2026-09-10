import React, { useEffect } from 'react';
import { Compass, ArrowRight } from 'lucide-react';

interface SplashViewProps {
  onContinue: () => void;
}

export const SplashView: React.FC<SplashViewProps> = ({ onContinue }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onContinue();
    }, 2800);
    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <div className="flex flex-col items-center justify-between min-h-[600px] h-full p-6 bg-white text-slate-900 rounded-3xl relative overflow-hidden border border-slate-200 shadow-sm">
      {/* Background glow ambient */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-blue-100 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full flex justify-end z-10">
        <button 
          onClick={onContinue}
          className="text-xs text-slate-500 hover:text-blue-600 font-medium transition-colors px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200"
        >
          Pular ➔
        </button>
      </div>

      <div className="flex flex-col items-center text-center my-auto z-10">
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-3xl bg-blue-600 flex items-center justify-center shadow-xl shadow-blue-200 animate-pulse">
            <Compass className="w-12 h-12 text-white stroke-[2.5]" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-white border border-blue-200 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
            ES & MG
          </div>
        </div>

        <h1 className="text-3xl font-light tracking-wide text-slate-900 mb-2">
          PORTA A PORTA
        </h1>
        <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
          Caronas e transporte intermunicipal compartilhado direto na sua porta com conforto e economia.
        </p>

        <div className="mt-8 flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
          <span className="text-xs font-semibold text-blue-600">Algoritmo de Agrupamento Conectado</span>
        </div>
      </div>

      <div className="w-full space-y-4 z-10">
        <button
          onClick={onContinue}
          className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-200 uppercase tracking-widest transition-all flex items-center justify-center gap-2"
        >
          <span>Iniciar Aplicativo</span>
          <ArrowRight className="w-5 h-5 stroke-[2.5]" />
        </button>

        <div className="flex justify-center items-center gap-3 text-xs text-slate-400 font-medium">
          <span>Água Doce</span> • <span>Barra de São Francisco</span> • <span>Vitória</span>
        </div>
      </div>
    </div>
  );
};
