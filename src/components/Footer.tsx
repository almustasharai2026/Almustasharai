"use client";

import Link from "next/link";
import { Gavel, Mail, Phone, MapPin, Sparkles, AlertTriangle, Github, Twitter, Linkedin, ShieldCheck, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-white/5 bg-slate-950/80 backdrop-blur-3xl py-24 mt-40 relative overflow-hidden" dir="rtl">
      {/* Cosmic Ambiance */}
      <div className="absolute bottom-[-20%] right-[-10%] w-[1000px] h-[1000px] bg-primary/5 blur-[250px] rounded-full -z-10" />
      <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-indigo-500/5 blur-[180px] rounded-full -z-10" />

      <div className="container mx-auto px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-24 mb-32">
          
          <div className="space-y-12">
            <Link href="/" className="flex items-center gap-5 group">
              <div className="relative">
                <div className="bg-primary p-4 rounded-3xl group-hover:rotate-[360deg] transition-transform duration-1000 shadow-[0_0_40px_rgba(37,99,235,0.5)] flex items-center justify-center">
                  <Gavel className="h-10 w-10 text-white" />
                </div>
                <div className="absolute inset-0 bg-primary blur-[20px] opacity-20" />
              </div>
              <span className="font-black text-4xl text-white tracking-tighter">
                 المستشار <span className="text-primary">AI</span>
              </span>
            </Link>
            <p className="text-xl text-white/30 leading-relaxed font-bold max-w-sm">
              ثورة في عالم المحاماة الرقمية. نجمع بين الخبرة القانونية الرصينة وقوة الذكاء الاصطناعي السيادي لخدمة عدالة المستقبل.
            </p>
            <div className="flex gap-6">
              <SocialIcon icon={<Twitter className="h-6 w-6" />} />
              <SocialIcon icon={<Linkedin className="h-6 w-6" />} />
              <SocialIcon icon={<Github className="h-6 w-6" />} />
            </div>
          </div>
          
          <div>
            <h4 className="text-2xl font-black mb-12 text-white border-r-4 border-primary pr-6">البوابات الذكية</h4>
            <ul className="space-y-6 text-xl font-black text-white/20">
              <li><Link href="/bot" className="hover:text-primary transition-all flex items-center gap-3">مركز قيادة البوت <Sparkles className="h-5 w-5 text-primary animate-pulse" /></Link></li>
              <li><Link href="/consultants" className="hover:text-primary transition-all">استشارة الخبراء المباشرة</Link></li>
              <li><Link href="/templates" className="hover:text-primary transition-all">مكتبة العقود والطلبات</Link></li>
              <li><Link href="/pricing" className="hover:text-primary transition-all">باقات الرصيد السيادي</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-2xl font-black mb-12 text-white border-r-4 border-primary pr-6">الكيان والسيادة</h4>
            <ul className="space-y-6 text-xl font-black text-white/20">
              <li><Link href="/about" className="hover:text-primary transition-all">عن كوكب المستشار</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition-all">بروتوكول خصوصية البيانات</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-all">اتفاقية استخدام النظام</Link></li>
              <li><Link href="/compliance" className="hover:text-primary transition-all">الامتثال القانوني</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-2xl font-black mb-12 text-white border-r-4 border-primary pr-6">قنوات الاتصال</h4>
            <ul className="space-y-10 text-lg md:text-xl font-black text-white/20">
              <li className="flex items-center gap-5 justify-end group cursor-pointer">
                <span className="group-hover:text-white transition-colors">Infoalmustasharai@gmail.com</span>
                <div className="h-12 w-12 glass rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-primary/20 border border-white/5 transition-all">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
              </li>
              <li className="flex items-center gap-5 justify-end group cursor-pointer">
                <span className="group-hover:text-white transition-colors" dir="ltr">+20 01130031531</span>
                <div className="h-12 w-12 glass rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-primary/20 border border-white/5 transition-all">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
              </li>
              <li className="flex items-center gap-5 justify-end group cursor-pointer">
                <span className="group-hover:text-white transition-colors">مركز الابتكار، القاهرة، مصر</span>
                <div className="h-12 w-12 glass rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-primary/20 border border-white/5 transition-all">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Professional Sovereign Disclaimer */}
        <div className="p-12 glass rounded-[4rem] border-red-500/20 bg-red-500/5 mb-24 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 blur-[100px] -z-10" />
          <div className="flex items-center gap-6 mb-8 text-red-500">
            <div className="h-16 w-16 rounded-[2rem] bg-red-500/10 flex items-center justify-center shadow-2xl border border-red-500/20 animate-pulse">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <h5 className="text-3xl font-black uppercase tracking-tighter">ميثاق إخلاء المسؤولية السيادية</h5>
          </div>
          <p className="text-lg text-white/40 leading-loose font-bold text-right">
            تعمل منصة "المستشار AI" كمحرك تحليل قانوني ذكي يوفر معلومات استرشادية أولية بناءً على خوارزميات متقدمة. 
            المخرجات الصادرة لا تعد نصيحة قانونية مهنية نهائية ولا تنشئ علاقة "محامي وعميل". 
            نحن نحث كافة المستخدمين على مراجعة محامي مرخص ومعتمد قبل اتخاذ أي إجراء قانوني أو مالي مصيري. 
            المنصة وملاكها غير مسؤولين عن أي قرارات ناتجة عن استخدام هذه التقنيات الاسترشادية.
          </p>
        </div>

        <div className="pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.5em]">
            © {new Date().getFullYear()} ALMUSTASHARAI AI | GLOBAL LEGAL PROTOCOL | ALL RIGHTS RESERVED
          </p>
          <div className="flex items-center gap-3 text-white/20 text-xs font-bold">
             صنع بكل <Heart className="h-4 w-4 text-red-500/50 fill-current" /> لخدمة العدالة العربية
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ icon }: { icon: React.ReactNode }) {
  return (
    <div className="h-14 w-14 rounded-2xl glass flex items-center justify-center text-white/20 hover:bg-primary hover:text-white hover:scale-110 hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] transition-all cursor-pointer border border-white/5">
      {icon}
    </div>
  );
}
