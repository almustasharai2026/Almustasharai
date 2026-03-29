
"use client";

import Link from "next/link";
import { Scale, Mail, Phone, MapPin, Sparkles, AlertTriangle, Github, Twitter, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-white/5 bg-slate-950/80 backdrop-blur-3xl py-24 mt-40 relative overflow-hidden" dir="rtl">
      {/* Visual background elements */}
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[180px] rounded-full -z-10" />
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-indigo-500/5 blur-[120px] rounded-full -z-10" />

      <div className="container mx-auto px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-20 mb-24">
          <div className="space-y-10">
            <Link href="/" className="flex items-center gap-5 group">
              <div className="bg-primary p-4 rounded-3xl group-hover:rotate-[360deg] transition-transform duration-1000 shadow-[0_0_30px_rgba(37,99,235,0.4)]">
                <Scale className="h-10 w-10 text-white" />
              </div>
              <span className="font-black text-4xl text-white tracking-tighter">
                 المستشار <span className="text-primary">AI</span>
              </span>
            </Link>
            <p className="text-xl text-white/40 leading-relaxed font-medium">
              نقود ثورة العدالة الرقمية باستخدام الذكاء الاصطناعي الفائق. استشارات آمنة، سيادية، وبدقة لا تضاهى.
            </p>
            <div className="flex gap-5">
              <SocialIcon icon={<Twitter className="h-6 w-6" />} />
              <SocialIcon icon={<Linkedin className="h-6 w-6" />} />
              <SocialIcon icon={<Github className="h-6 w-6" />} />
            </div>
          </div>
          
          <div>
            <h4 className="text-2xl font-black mb-12 text-white border-r-4 border-primary pr-6">الأنظمة الرقمية</h4>
            <ul className="space-y-6 text-xl font-black text-white/30">
              <li><Link href="/consultants" className="hover:text-primary transition-all flex items-center gap-3">المستشارون <Sparkles className="h-5 w-5 text-primary opacity-0 hover:opacity-100" /></Link></li>
              <li><Link href="/match" className="hover:text-primary transition-all">المطابقة الذكية</Link></li>
              <li><Link href="/templates" className="hover:text-primary transition-all">مكتبة النماذج (٢٥٠+)</Link></li>
              <li><Link href="/bot" className="hover:text-primary transition-all">مركز القيادة (البوت)</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-2xl font-black mb-12 text-white border-r-4 border-primary pr-6">الكيان القانوني</h4>
            <ul className="space-y-6 text-xl font-black text-white/30">
              <li><Link href="/about" className="hover:text-primary transition-all">رؤيتنا الاستراتيجية</Link></li>
              <li><Link href="/pricing" className="hover:text-primary transition-all">باقات الوقت</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition-all">بروتوكول الخصوصية</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-all">ميثاق الاستخدام</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-2xl font-black mb-12 text-white border-r-4 border-primary pr-6">قنوات السيادة</h4>
            <ul className="space-y-10 text-lg md:text-xl font-black text-white/30">
              <li className="flex items-center gap-5 justify-end group transition-all">
                <span className="group-hover:text-white transition-colors">Infoalmustasharai@gmali.com</span>
                <div className="h-12 w-12 glass rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-all">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
              </li>
              <li className="flex items-center gap-5 justify-end group transition-all">
                <span className="group-hover:text-white transition-colors" dir="ltr">+20 01130031531</span>
                <div className="h-12 w-12 glass rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-all">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
              </li>
              <li className="flex items-center gap-5 justify-end group transition-all">
                <span className="group-hover:text-white transition-colors">مركز الابتكار الرقمي، القاهرة</span>
                <div className="h-12 w-12 glass rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-all">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Supreme Legal Disclaimer Section */}
        <div className="p-12 glass rounded-[4rem] border-red-500/20 bg-red-500/5 mb-20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/5 blur-[80px]" />
          <div className="flex items-center gap-5 mb-8 text-red-500">
            <div className="h-14 w-14 rounded-[1.8rem] bg-red-500/10 flex items-center justify-center shadow-2xl">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <h5 className="text-3xl font-black uppercase tracking-tighter">إخلاء مسؤولية قانوني سيادي</h5>
          </div>
          <p className="text-lg text-white/40 leading-loose font-medium text-right">
            تعتمد منصة "المستشار AI" على محركات ذكاء اصطناعي فائق لتوفير تحليلات قانونية أولية ومعلومات استرشادية عامة. 
            المعلومات الصادرة لا تشكل بأي حال من الأحوال علاقة "محامي وعميل" ولا تعتبر نصيحة قانونية مهنية نهائية. 
            القوانين والتشريعات تتغير باستمرار، لذا يجب مراجعة محامي مرخص قبل اتخاذ أي قرار مصيري بناءً على مخرجات المنصة. 
            المنصة وملاكها غير مسؤولين عن أي تبعات قانونية أو مالية ناتجة عن استخدام هذه التقنيات.
          </p>
        </div>

        <div className="pt-12 border-t border-white/5 text-center">
          <p className="text-sm font-black text-white/10 uppercase tracking-[0.5em]">
            © {new Date().getFullYear()} المستشار AI | نظام العدالة الكوني الموحد | كافة الحقوق محفوظة لسيادة المالك
          </p>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ icon }: { icon: React.ReactNode }) {
  return (
    <div className="h-14 w-14 rounded-2xl glass flex items-center justify-center text-white/20 hover:bg-primary hover:text-white hover:scale-110 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all cursor-pointer border border-white/5">
      {icon}
    </div>
  );
}
