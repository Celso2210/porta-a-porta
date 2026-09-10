import React from 'react';
import { MessageCircle } from 'lucide-react';

interface WhatsAppButtonProps {
  phone?: string;
  message?: string;
  label?: string;
  variant?: 'full' | 'icon' | 'compact';
  className?: string;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  phone = '27998765432',
  message = 'Olá! Sobre a viagem Porta a Porta...',
  label = 'WhatsApp',
  variant = 'full',
  className = ''
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Limpa o número para conter apenas dígitos
    let cleanPhone = phone.replace(/\D/g, '');
    
    // Adiciona código do país 55 se não tiver
    if (!cleanPhone.startsWith('55') && cleanPhone.length <= 11) {
      cleanPhone = `55${cleanPhone}`;
    }

    const encodedMsg = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMsg}`;
    
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleClick}
        title="Conversar pelo WhatsApp"
        className={`p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-sm transition-all flex items-center justify-center active:scale-95 ${className}`}
      >
        <MessageCircle className="w-4 h-4 fill-white text-emerald-500" />
      </button>
    );
  }

  if (variant === 'compact') {
    return (
      <button
        onClick={handleClick}
        className={`py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm active:scale-95 ${className}`}
      >
        <MessageCircle className="w-4 h-4 text-emerald-600 fill-emerald-600" />
        <span>{label}</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 ${className}`}
    >
      <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
      <span>{label}</span>
    </button>
  );
};
