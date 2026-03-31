
'use client';

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface FloatingCardProps {
  title: string;
  delay: number;
  icon?: React.ReactNode;
}

/**
 * مكون البطاقة العائمة السيادية.
 * يستخدم تأثيرات حركية لتعزيز الحيوية البصرية للمنصة.
 * يتضمن حماية من أخطاء الترطيب (Hydration Mismatch) عند استخدام القيم العشوائية.
 */
export default function FloatingCard({ title, delay, icon }: FloatingCardProps) {
  const [position, setPosition] = useState({ left: "10%", top: "10%" });
  const [mounted, setSetMounted] = useState(false);

  useEffect(() => {
    // توليد مواقع عشوائية سيادية بعد اكتمال الترطيب
    setPosition({
      left: `${Math.floor(Math.random() * 60 + 5)}%`,
      top: `${Math.floor(Math.random() * 50 + 10)}%`,
    });
    setSetMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0, scale: 0.8 }}
      animate={{ 
        y: [0, -15, 0], 
        opacity: 1,
        scale: 1,
        rotate: [0, 1, -1, 0]
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        delay,
        ease: "easeInOut"
      }}
      className="absolute bg-white/90 dark:bg-slate-800/90 backdrop-blur-md px-5 py-3 rounded-[1.5rem] shadow-xl border border-white/20 text-[11px] font-black text-primary flex items-center gap-3 z-10 whitespace-nowrap"
      style={{
        left: position.left,
        top: position.top,
      }}
    >
      {icon && <div className="h-5 w-5 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0">{icon}</div>}
      <span className="tracking-tight">{title}</span>
    </motion.div>
  );
}
