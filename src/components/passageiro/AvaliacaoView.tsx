import React, { useState } from 'react';
import { Star, CheckCircle2, Heart, Award, ArrowRight, Share2 } from 'lucide-react';
import { MOTORISTA_JOSE } from '../../data/mockData';

interface AvaliacaoViewProps {
  onFinalizar: () => void;
}

export const AvaliacaoView: React.FC<AvaliacaoViewProps> = ({ onFinalizar }) => {
  const [nota, setNota] = useState(5);
  const [comentario, setComentario] = useState('Viagem excelente! O motorista José foi muito pontual e buscou exatamente na minha porta.');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Pontualidade', 'Carro Limpo', 'Direção Segura']);

  const tagsDisponiveis = [
    'Pontualidade',
    'Carro Limpo',
    'Ar Condicionado Bom',
    'Boa Conversa',
    'Direção Segura',
    'Cuidado com Bagagem'
  ];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleEnviar = (e: React.FormEvent) => {
    e.preventDefault();
    onFinalizar();
  };

  return (
    <div className="flex flex-col justify-between min-h-[620px] h-full p-6 bg-white text-slate-900 rounded-3xl border border-slate-200 shadow-sm">
      <div>
        <div className="text-center my-2">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-light text-slate-900">Você chegou ao seu destino!</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Água Doce do Norte ➔ Vitória (Shopping Vitória)
          </p>
        </div>

        {/* Resumo Financeiro */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 my-4 flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block font-bold uppercase">Valor Pago em Vaga Pool</span>
            <span className="text-lg font-extrabold text-blue-600">R$ 38,90</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block font-bold uppercase">Economia estimada</span>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
              -68% vs Carro Individual
            </span>
          </div>
        </div>

        {/* Card Motorista & Estrelas */}
        <form onSubmit={handleEnviar} className="space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
            <img
              src={MOTORISTA_JOSE.avatar}
              alt={MOTORISTA_JOSE.nome}
              className="w-16 h-16 rounded-full object-cover border-2 border-blue-600 mx-auto mb-2 shadow-sm"
            />
            <h3 className="font-bold text-sm text-slate-900">Como foi sua viagem com {MOTORISTA_JOSE.nome}?</h3>
            <p className="text-[11px] text-slate-500 mb-3">{MOTORISTA_JOSE.veiculo.modelo}</p>

            {/* Estrelas */}
            <div className="flex justify-center gap-2 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setNota(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star 
                    className={`w-7 h-7 ${
                      star <= nota 
                        ? 'fill-amber-400 text-amber-400' 
                        : 'text-slate-200'
                    }`} 
                  />
                </button>
              ))}
            </div>

            {/* Tags de elogios */}
            <div className="flex flex-wrap justify-center gap-1.5 pt-2 border-t border-slate-200">
              {tagsDisponiveis.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-all ${
                      isSelected
                        ? 'bg-blue-50 border-blue-200 text-blue-600'
                        : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {isSelected && '✓ '} {tag}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Deixe um comentário para o motorista (Opcional)
            </label>
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              rows={2}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-blue-600 text-white font-bold text-sm uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <span>Enviar Avaliação & Concluir</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      <div className="pt-2 text-center text-[10px] text-slate-400">
        Obrigado por usar o Porta a Porta • Espírito Santo
      </div>
    </div>
  );
};
