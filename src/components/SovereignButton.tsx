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

/**
 * الزر السيادي الموحد.
 * يتميز بتدرج لوني ذكي وتأثيرات حركية تضمن تجربة مستخدم فائقة.
 */
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
        w-full py-4 rounded-2xl 
        bg-gradient-to-r from-accent to-emerald-600 
        text-white font-black text-lg
        shadow-lg shadow-accent/20 
        active:scale-[0.98] transition-all duration-200
        disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed
        flex items-center justify-center gap-3
        ${className}
      `}
    >
      {text}
      {icon && <span className="shrink-0">{icon}</span>}
    </button>
  );
}
