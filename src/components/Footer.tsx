import Link from "next/link";
import { Scale, Mail, Phone, MapPin, Sparkles, AlertTriangle } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-white/5 bg-black/40 backdrop-blur-3xl py-16 mt-20 relative overflow-hidden" dir="rtl">
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-accent/5 blur-[100px] rounded-full" />
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="bg-accent p-2 rounded-xl group-hover:rotate-[360deg] transition-transform duration-1000">
                <Scale className="h-6 w-6 text-white" />
              </div>
              <span className="font-black text-2xl text-white tracking-tighter">
                 المستشار <span className="text-accent">AI</span>
              </span>
            </Link>
            <p className="text-lg text-white/60 leading-relaxed font-medium">
              نحن نعيد تعريف العدالة باستخدام الذكاء الاصطناعي الفائق. استشارات قانونية آمنة، فورية، وبدقة كونية.
            </p>
            <div className="flex gap-4">
              <div className="h-10 w-10 rounded-xl glass flex items-center justify-center hover:bg-accent hover:text-white transition-all cursor-pointer">
                 <Sparkles className="h-5 w-5" />
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-xl font-black mb-8 text-white border-r-4 border-accent pr-4">خريطة المنصة</h4>
            <ul className="space-y-4 text-lg font-bold text-white/50">
              <li><Link href="/consultants" className="hover:text-accent transition-colors">نخبة المستشارين</Link></li>
              <li><Link href="/match" className="hover:text-accent transition-colors">خوارزمية المطابقة</Link></li>
              <li><Link href="/templates" className="hover:text-accent transition-colors">النماذج الذكية</Link></li>
              <li><Link href="/bot" className="hover:text-accent transition-colors">مركز العمليات</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xl font-black mb-8 text-white border-r-4 border-accent pr-4">المركز القانوني</h4>
            <ul className="space-y-4 text-lg font-bold text-white/50">
              <li><Link href="/about" className="hover:text-accent transition-colors">رؤيتنا المستقبلية</Link></li>
              <li><Link href="/privacy" className="hover:text-accent transition-colors">ميثاق الخصوصية</Link></li>
              <li><Link href="/terms" className="hover:text-accent transition-colors">بروتوكول الاستخدام</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xl font-black mb-8 text-white border-r-4 border-accent pr-4">اتصال مباشر</h4>
            <ul className="space-y-6 text-lg font-bold text-white/50">
              <li className="flex items-center gap-3 justify-end group text-xs md:text-lg">
                <span className="group-hover:text-white transition-colors">Infoalmustasharai@gmali.com</span>
                <Mail className="h-5 w-5 text-accent" />
              </li>
              <li className="flex items-center gap-3 justify-end group text-xs md:text-lg">
                <span className="group-hover:text-white transition-colors" dir="ltr">+20 01130031531</span>
                <Phone className="h-5 w-5 text-accent" />
              </li>
              <li className="flex items-center gap-3 justify-end group text-xs md:text-lg">
                <span className="group-hover:text-white transition-colors">مركز الابتكار الرقمي، القاهرة</span>
                <MapPin className="h-5 w-5 text-accent" />
              </li>
            </ul>
          </div>
        </div>

        {/* Legal Disclaimer Section */}
        <div className="p-8 glass rounded-[2rem] border-red-500/10 bg-red-500/5 mb-12">
          <div className="flex items-center gap-3 mb-4 text-red-500">
            <AlertTriangle className="h-6 w-6" />
            <h5 className="text-xl font-black">إخلاء مسؤولية قانوني هام</h5>
          </div>
          <p className="text-sm text-white/60 leading-relaxed font-medium">
            تعتمد منصة "المستشار AI" على تقنيات الذكاء الاصطناعي لتوفير استشارات قانونية أولية ومعلومات عامة. 
            المعلومات المقدمة عبر الموقع أو البوت لا تشكل علاقة "محامي وعميل" ولا تعتبر نصيحة قانونية مهنية نهائية. 
            نحن نبذل قصارى جهدنا لضمان دقة المعلومات، ولكن القوانين تتغير وتختلف باختلاف الوقائع. 
            يجب عدم اتخاذ أي إجراء قانوني بناءً على المعلومات الواردة هنا دون استشارة محامي مرخص ومؤهل في ولايتك القضائية. 
            المنصة وملاكها ومطوروها غير مسؤولين عن أي خسائر أو تبعات ناتجة عن استخدام هذه المعلومات.
          </p>
        </div>

        <div className="pt-8 border-t border-white/5 text-center">
          <p className="text-sm font-black text-white/30 uppercase tracking-[0.3em]">
            © {new Date().getFullYear()} المستشار AI | نظام العدالة الكوني الموحد
          </p>
        </div>
      </div>
    </footer>
  );
}
