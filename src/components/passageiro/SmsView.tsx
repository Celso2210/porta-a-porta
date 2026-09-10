import React, { useState, useEffect } from 'react';
import { ShieldCheck, ArrowRight, RefreshCw, KeyRound } from 'lucide-react';

interface SmsViewProps {
  phone: string;
  onVerify: () => void;
  onBack: () => void;
}

export const SmsView: React.FC<SmsViewProps> = ({ phone, onVerify, onBack }) => {
  const [code, setCode] = useState(['4', '8', '2', '0']);
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    onVerify();
  };

  return (
    <div className="flex flex-col justify-between min-h-[600px] h-full p-6 bg-white text-slate-900 rounded-3xl border border-slate-200 shadow-sm">
      <div>
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={onBack}
            className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl transition-colors"
          >
            ← Voltar
          </button>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
            Passo 2 de 2
          </span>
        </div>

        <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mb-4">
          <KeyRound className="w-6 h-6" />
        </div>

        <h2 className="text-2xl font-light text-slate-900 mb-1">Digite o código SMS</h2>
        <p className="text-slate-500 text-xs mb-8">
          Enviamos um código de 4 dígitos para o número <strong className="text-blue-600 font-semibold">{phone}</strong>.
        </p>

        <form onSubmit={handleVerify} className="space-y-8">
          <div className="flex justify-between gap-3 max-w-xs mx-auto">
            {code.map((digit, idx) => (
              <input
                key={idx}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => {
                  const newCode = [...code];
                  newCode[idx] = e.target.value;
                  setCode(newCode);
                }}
                className="w-14 h-16 bg-slate-50 border-2 border-blue-200 rounded-2xl text-center text-2xl font-bold text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none transition-all shadow-sm"
              />
            ))}
          </div>

          <div className="text-center">
            {timer > 0 ? (
              <p className="text-xs text-slate-500">
                Reenviar código em <strong className="text-blue-600">{timer}s</strong>
              </p>
            ) : (
              <button 
                type="button"
                onClick={() => setTimer(30)}
                className="text-xs text-blue-600 font-semibold hover:underline flex items-center justify-center gap-1 mx-auto"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reenviar código SMS agora</span>
              </button>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-blue-600 text-white font-bold text-sm uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            <span>Confirmar e Acessar Home</span>
          </button>
        </form>
      </div>

      <div className="mt-8 text-center text-xs text-slate-400">
        Ambiente Seguro • Porta a Porta Auth Protocol
      </div>
    </div>
  );
};
