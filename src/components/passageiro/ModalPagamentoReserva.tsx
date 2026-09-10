import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  Lock, 
  X, 
  ArrowRight, 
  CheckCircle2,
  FileCheck,
  Smartphone,
  Info
} from 'lucide-react';
import { PaymentConfig } from '../../types';
import { getPaymentConfig, subscribePaymentConfig } from '../../services/paymentConfig';

interface ModalPagamentoReservaProps {
  valorTotal: number;
  taxaReserva: number;
  valorRestante: number;
  origem: string;
  destino: string;
  onPagamentoConcluido: (metodo: 'PIX Instantâneo' | 'Cartão') => void;
  onClose: () => void;
}

export const ModalPagamentoReserva: React.FC<ModalPagamentoReservaProps> = ({
  valorTotal,
  taxaReserva,
  valorRestante,
  origem,
  destino,
  onPagamentoConcluido,
  onClose
}) => {
  const [config, setConfig] = useState<PaymentConfig>(getPaymentConfig());
  const [metodo, setMetodo] = useState<'pix' | 'cartao'>('pix');
  const [copiadoChave, setCopiadoChave] = useState(false);
  const [statusConfirmando, setStatusConfirmando] = useState(false);
  const [codigoComprovante, setCodigoComprovante] = useState('');

  useEffect(() => {
    const unsub = subscribePaymentConfig((newConfig) => {
      setConfig(newConfig);
    });
    return () => unsub();
  }, []);

  const handleCopiarChave = () => {
    navigator.clipboard.writeText(config.chavePix);
    setCopiadoChave(true);
    setTimeout(() => setCopiadoChave(false), 3000);
  };

  const handleConfirmar = () => {
    setStatusConfirmando(true);
    setTimeout(() => {
      onPagamentoConcluido(metodo === 'pix' ? 'PIX Instantâneo' : 'Cartão');
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Cabeçalho */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-md">
                  Taxa de Reserva (10%)
                </span>
                <span className="text-xs text-slate-400">Garantia de Vaga</span>
              </div>
              <h2 className="text-base font-bold text-white mt-0.5">Pagamento da Reserva</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Resumo da Viagem & Valores */}
        <div className="p-4 bg-slate-50 border-b border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span className="font-semibold">Itinerário:</span>
            <span className="font-extrabold text-slate-800 truncate max-w-[240px]">
              {origem} ➔ {destino}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[9px] text-slate-500 block uppercase font-bold">Total da Viagem</span>
              <span className="text-sm font-black text-slate-900">R$ {valorTotal.toFixed(2).replace('.', ',')}</span>
            </div>

            <div className="bg-emerald-50 p-2.5 rounded-xl border-2 border-emerald-500 shadow-2xs">
              <span className="text-[9px] text-emerald-800 block uppercase font-black">Pagar Agora (10%)</span>
              <span className="text-base font-black text-emerald-600">R$ {taxaReserva.toFixed(2).replace('.', ',')}</span>
            </div>

            <div className="bg-blue-50 p-2.5 rounded-xl border border-blue-200 shadow-2xs">
              <span className="text-[9px] text-blue-800 block uppercase font-bold">No Embarque (90%)</span>
              <span className="text-sm font-black text-blue-600">R$ {valorRestante.toFixed(2).replace('.', ',')}</span>
            </div>
          </div>
        </div>

        {/* Seletor de Método de Pagamento: PIX Instantâneo ou Cartão */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMetodo('pix')}
              className={`p-3 rounded-2xl border-2 font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                metodo === 'pix'
                  ? 'border-emerald-500 bg-emerald-50/70 text-emerald-900 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <span>PIX Instantâneo</span>
            </button>

            <button
              type="button"
              onClick={() => setMetodo('cartao')}
              className={`p-3 rounded-2xl border-2 font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                metodo === 'cartao'
                  ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-600/20 shadow-xs'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span>Cartão</span>
            </button>
          </div>

          {/* FLUXO PIX INSTANTÂNEO */}
          {metodo === 'pix' && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2.5 border border-slate-800 shadow-sm">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Titular da Conta:</span>
                  <span className="font-bold text-slate-100">{config.nomeTitularPix || 'Porta a Porta Transportes'}</span>
                </div>
                {config.cidadePix && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Cidade:</span>
                    <span className="font-bold text-slate-200">{config.cidadePix}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-xs border-t border-slate-800 pt-2">
                  <span className="text-emerald-400 font-extrabold uppercase text-[10px]">Valor da Taxa (10%):</span>
                  <span className="text-lg font-black text-emerald-400">R$ {taxaReserva.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>

              {/* Chave Pix e Botão Copiar */}
              <div className="bg-slate-50 border-2 border-emerald-500/40 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-600">
                    Chave Pix ({config.tipoChavePix?.toUpperCase() || 'TELEFONE'})
                  </label>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    Pix Instantâneo
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={config.chavePix}
                    className="w-full text-sm font-mono font-black bg-white border border-slate-300 rounded-xl px-3.5 py-3 text-slate-900 focus:outline-none shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={handleCopiarChave}
                    className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shrink-0 transition-all shadow-md shadow-emerald-600/20 active:scale-95"
                    title="Copiar Chave Pix"
                  >
                    {copiadoChave ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiadoChave ? 'Chave Copiada!' : 'Copiar Chave Pix'}</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-500 leading-tight">
                  Abra o aplicativo do seu banco, escolha <strong>Pix</strong> ➔ <strong>Transferir</strong> e cole a chave acima no valor exato de <strong>R$ {taxaReserva.toFixed(2).replace('.', ',')}</strong>.
                </p>
              </div>

              {/* Campo opcional de comprovante */}
              <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-1.5">
                <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500">
                  Código de Autenticação / Comprovante Pix (Opcional)
                </label>
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={codigoComprovante}
                    onChange={(e) => setCodigoComprovante(e.target.value)}
                    placeholder="Ex: E12345678... ou Nome de quem pagou"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* FLUXO CARTÃO */}
          {metodo === 'cartao' && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <div className="p-4 bg-gradient-to-br from-blue-950 to-slate-900 text-white rounded-2xl space-y-3 border border-blue-800/80 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-blue-500 text-white px-2 py-0.5 rounded-md">
                    Cartão de Crédito / Débito
                  </span>
                  <span className="text-base font-black text-emerald-400">
                    R$ {taxaReserva.toFixed(2).replace('.', ',')}
                  </span>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed">
                  Clique no botão abaixo para abrir o ambiente seguro de pagamento da taxa de reserva de <strong>R$ {taxaReserva.toFixed(2).replace('.', ',')}</strong>.
                </p>

                <a
                  href={config.linkCartaoMercadoPago || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 bg-blue-500 hover:bg-blue-600 text-white font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md active:scale-[0.99]"
                >
                  <span>Abrir Link para Pagar no Cartão</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-medium">Link de Pagamento:</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(config.linkCartaoMercadoPago);
                      alert('Link de pagamento copiado com sucesso!');
                    }}
                    className="text-[11px] text-blue-600 hover:underline font-bold flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    Copiar Link
                  </button>
                </div>
                <div className="p-2 bg-white rounded-xl border border-slate-200 text-[11px] font-mono text-slate-600 truncate">
                  {config.linkCartaoMercadoPago || 'https://link.mercadopago.com.br/portaaporta'}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-[11px] text-blue-900 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p>
                  Assim que concluir o pagamento no link do cartão, clique no botão verde abaixo para chamar os motoristas disponíveis.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé / Ação de Confirmação */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col gap-2">
          <button
            type="button"
            disabled={statusConfirmando}
            onClick={handleConfirmar}
            className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
          >
            {statusConfirmando ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Confirmando Pagamento da Reserva...
              </span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                <span>Confirmar Pagamento e Chamar Motoristas</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="text-[10px] text-center text-slate-400">
            🔒 Taxa de Reserva 100% Assegurada • 90% Restante (R$ {valorRestante.toFixed(2).replace('.', ',')}) pago diretamente no embarque.
          </p>
        </div>

      </div>
    </div>
  );
};
