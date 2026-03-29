
import Link from "next/link";
import { Scale, Mail, Phone, MapPin, Sparkles, AlertTriangle, Github, Twitter, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-white/5 bg-slate-950/80 backdrop-blur-3xl py-20 mt-32 relative overflow-hidden" dir="rtl">
      {/* Visual background elements */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[150px] rounded-full -z-10" />
      <div className="absolute top-0 left-0 w-[300px] h-[300px] bg-indigo-500/5 blur-[100px] rounded-full -z-10" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
          <div className="space-y-8">
            <Link href="/" className="flex items-center gap-4 group">
              <div className="bg-primary p-3 rounded-2xl group-hover:rotate-[360deg] transition-transform duration-1000 shadow-2xl shadow-primary/40">
                <Scale className="h-8 w-8 text-white" />
              </div>
              <span className="font-black text-3xl text-white tracking-tighter">
                 المستشار <span className="text-primary">AI</span>
              </span>
            </Link>
            <p className="text-lg text-white/50 leading-relaxed font-medium">
              نحن نقود ثورة العدالة الرقمية باستخدام أرقى تقنيات الذكاء الاصطناعي الفائق. استشارات آمنة، سيادية، وبدقة لا تضاهى.
            </p>
            <div className="flex gap-4">
              <SocialIcon icon={<Twitter className="h-5 w-5" />} />
              <SocialIcon icon={<Linkedin className="h-5 w-5" />} />
              <SocialIcon icon={<Github className="h-5 w-5" />} />
            </div>
          </div>
          
          <div>
            <h4 className="text-xl font-black mb-10 text-white border-r-4 border-primary pr-5">الأنظمة الكونية</h4>
            <ul className="space-y-5 text-lg font-bold text-white/40">
              <li><Link href="/consultants" className="hover:text-primary transition-all flex items-center gap-2">نخبة المستشارين <Sparkles className="h-4 w-4 text-primary opacity-0 hover:opacity-100" /></Link></li>
              <li><Link href="/match" className="hover:text-primary transition-all">خوارزمية المطابقة</Link></li>
              <li><Link href="/templates" className="hover:text-primary transition-all">المكتبة الذكية الـ ٢٥٠+</Link></li>
              <li><Link href="/bot" className="hover:text-primary transition-all">مركز العمليات (البوت)</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xl font-black mb-10 text-white border-r-4 border-primary pr-5">الكيان القانوني</h4>
            <ul className="space-y-5 text-lg font-bold text-white/40">
              <li><Link href="/about" className="hover:text-primary transition-all">رؤيتنا الاستراتيجية</Link></li>
              <li><Link href="/pricing" className="hover:text-primary transition-all">باقات العضوية</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition-all">بروتوكول الخصوصية</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-all">ميثاق الاستخدام</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xl font-black mb-10 text-white border-r-4 border-primary pr-5">قنوات الاتصال</h4>
            <ul className="space-y-8 text-lg font-bold text-white/40">
              <li className="flex items-center gap-4 justify-end group transition-all">
                <span className="group-hover:text-white text-sm md:text-lg">Infoalmustasharai@gmali.com</span>
                <div className="h-10 w-10 glass rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-all">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
              </li>
              <li className="flex items-center gap-4 justify-end group transition-all">
                <span className="group-hover:text-white text-sm md:text-lg" dir="ltr">+20 01130031531</span>
                <div className="h-10 w-10 glass rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-all">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
              </li>
              <li className="flex items-center gap-4 justify-end group transition-all">
                <span className="group-hover:text-white text-sm md:text-lg">مركز الابتكار، القاهرة، مصر</span>
                <div className="h-10 w-10 glass rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-all">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Supreme Legal Disclaimer Section */}
        <div className="p-10 glass rounded-[3.5rem] border-red-500/20 bg-red-500/5 mb-16 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-[60px]" />
          <div className="flex items-center gap-4 mb-6 text-red-500">
            <div className="h-12 w-12 rounded-2xl bg-red-500/10 flex items-center justify-center shadow-lg">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h5 className="text-2xl font-black">إخلاء مسؤولية قانوني استراتيجي</h5>
          </div>
          <p className="text-sm text-white/50 leading-loose font-medium text-right">
            تعتمد منصة "المستشار AI" على محركات ذكاء اصطناعي فائق لتوفير تحليلات قانونية أولية ومعلومات استرشادية عامة. 
            المعلومات والبيانات والردود الصادرة لا تشكل بأي حال من الأحوال علاقة "محامي وعميل" ولا تعتبر نصيحة قانونية مهنية نهائية أو فتوى قضائية. 
            القوانين والتشريعات كائنات ديناميكية تتغير باستمرار، لذا يجب عدم اتخاذ أي قرار مصيري أو إجراء قانوني رسمي بناءً على مخرجات المنصة دون الرجوع لمحامي مرخص ومؤهل في اختصاصك المكاني. 
            المنصة وملاكها ومطوروها غير مسؤولين عن أي تبعات قانونية أو مالية ناتجة عن استخدام هذه التقنيات.
          </p>
        </div>

        <div className="pt-10 border-t border-white/5 text-center">
          <p className="text-sm font-black text-white/20 uppercase tracking-[0.4em]">
            © {new Date().getFullYear()} المستشار AI | نظام العدالة الكوني الموحد | كافة الحقوق محفوظة
          </p>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ icon }: { icon: React.ReactNode }) {
  return (
    <div className="h-12 w-12 rounded-2xl glass flex items-center justify-center text-white/40 hover:bg-primary hover:text-white hover:scale-110 hover:shadow-2xl hover:shadow-primary/40 transition-all cursor-pointer">
      {icon}
    </div>
  );
}
