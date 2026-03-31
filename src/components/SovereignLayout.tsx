'use client';

import React from 'react';
import SovereignSidebar from './SovereignSidebar';
import { motion } from 'framer-motion';

interface SovereignLayoutProps {
  children: React.ReactNode;
  activeId: string;
}

/**
 * الهيكل السيادي الموحد (Sovereign Layout king2026).
 * يوفر إطاراً هندسياً ثابتاً يضم القائمة الجانبية ومساحة المحتوى.
 */
export default function SovereignLayout({ children, activeId }: SovereignLayoutProps) {
  return (
    <div className="flex bg-[#02020a] min-h-screen font-sans relative overflow-hidden" dir="rtl">
      {/* القائمة الجانبية السيادية الثابتة */}
      <SovereignSidebar activeId={activeId} />
      
      {/* محتوى الصفحة المتغير مع مراعاة عرض القائمة الجانبية */}
      <main className="flex-1 lg:pr-72 transition-all duration-500 ease-in-out relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full h-full min-h-screen"
        >
          {children}
        </motion.div>
      </main>

      {/* Ambiance Glows */}
      <div className="fixed top-[-10%] left-[-5%] w-[600px] h-[600px] bg-primary/5 blur-[150px] rounded-full pointer-events-none -z-10" />
      <div className="fixed bottom-[-10%] right-[30%] w-[400px] h-[400px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none -z-10" />
    </div>
  );
}
