import React from 'react';
import { 
  Car, 
  Users, 
  ShieldCheck, 
  FileCode2, 
  Compass, 
  Sparkles,
  PhoneCall,
  Bell
} from 'lucide-react';

interface HeaderNavProps {
  activeModule: 'passageiro' | 'motorista' | 'auth' | 'admin' | 'docs';
  setActiveModule: (module: 'passageiro' | 'motorista' | 'auth' | 'admin' | 'docs') => void;
  passageiroStep?: string;
  resetPassageiroFlow?: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  activeModule,
  setActiveModule,
  passageiroStep,
  resetPassageiroFlow
}) => {
  const isMotorista = activeModule === 'motorista';

  return (
    <header className={`sticky top-0 z-50 backdrop-blur-xl border-b px-4 py-3 shadow-sm transition-colors duration-200 ${
      isMotorista 
        ? 'bg-slate-900/90 border-slate-800 text-white' 
        : 'bg-white/90 border-slate-200 text-slate-900'
    }`}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Logo & Brand */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div 
            onClick={() => {
              setActiveModule('passageiro');
              if (resetPassageiroFlow) resetPassageiroFlow();
            }}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black shadow-md shadow-blue-200 group-hover:scale-105 transition-transform">
              <Compass className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-wider text-blue-500 uppercase">
                  PORTA A PORTA
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  isMotorista
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Oficial ES
                </span>
              </div>
              <p className={`text-[11px] font-medium ${isMotorista ? 'text-slate-400' : 'text-slate-500'}`}>
                Transporte Intermunicipal Inteligente
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <button className={`p-2 rounded-lg relative border ${
              isMotorista 
                ? 'bg-slate-800 text-slate-300 border-slate-700' 
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}>
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-600"></span>
            </button>
          </div>
        </div>

        {/* Module Switcher Buttons */}
        <div className={`flex items-center gap-1 p-1 rounded-xl border w-full md:w-auto overflow-x-auto ${
          isMotorista 
            ? 'bg-slate-800 border-slate-700' 
            : 'bg-slate-100 border-slate-200'
        }`}>
          <button
            onClick={() => setActiveModule('passageiro')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeModule === 'passageiro'
                ? 'bg-blue-600 text-white shadow-sm font-bold'
                : isMotorista
                ? 'text-slate-300 hover:text-white hover:bg-slate-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Passageiro</span>
          </button>

          <button
            onClick={() => setActiveModule('motorista')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeModule === 'motorista'
                ? 'bg-blue-600 text-white shadow-sm font-bold'
                : isMotorista
                ? 'text-slate-300 hover:text-white hover:bg-slate-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>Motorista</span>
          </button>

          <button
            onClick={() => setActiveModule('auth')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeModule === 'auth'
                ? 'bg-blue-600 text-white shadow-sm font-bold'
                : isMotorista
                ? 'text-slate-300 hover:text-white hover:bg-slate-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Autenticação Firebase</span>
          </button>

          <button
            onClick={() => setActiveModule('admin')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeModule === 'admin'
                ? 'bg-blue-600 text-white shadow-sm font-bold'
                : isMotorista
                ? 'text-slate-300 hover:text-white hover:bg-slate-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin & Banco</span>
          </button>

          <button
            onClick={() => setActiveModule('docs')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeModule === 'docs'
                ? 'bg-blue-600 text-white shadow-sm font-bold'
                : isMotorista
                ? 'text-slate-300 hover:text-white hover:bg-slate-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>Arquitetura & Docs</span>
          </button>
        </div>

        {/* Action / Help */}
        <div className="hidden md:flex items-center gap-3">
          <div className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border ${
            isMotorista
              ? 'text-slate-300 bg-slate-800 border-slate-700'
              : 'text-slate-600 bg-slate-100 border-slate-200'
          }`}>
            <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            <span className="font-medium">Algoritmo de Agrupamento Ativo</span>
          </div>
          <button 
            onClick={() => alert("Central de Suporte Porta a Porta: 0800 999 8888 ou Whatsapp (27) 99876-5432")}
            className={`p-2 rounded-lg transition-colors border ${
              isMotorista
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
            title="Suporte SOS / Central"
          >
            <PhoneCall className="w-4 h-4 text-blue-400" />
          </button>
        </div>
      </div>
    </header>
  );
};
