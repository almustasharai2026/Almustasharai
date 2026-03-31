'use client';

import React from 'react';

interface SovereignButtonProps {
  text: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export default function SovereignButton({ 
  text, 
  onClick, 
  type = "button", 
  disabled = false,
  className = "",
  icon
}: SovereignButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full py-5 rounded-[1.8rem] 
        bg-gradient-to-r from-primary via-amber-600 to-primary
        text-primary-foreground font-black text-xl
        shadow-2xl shadow-primary/20 
        hover:scale-[1.02] active:scale-[0.98] transition-all duration-300
        disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed
        flex items-center justify-center gap-4
        relative overflow-hidden group
        ${className}
      `}
    >
      <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
      <span className="relative z-10 flex items-center gap-4">
        {text}
        {icon && <span className="shrink-0">{icon}</span>}
      </span>
    </button>
  );
}