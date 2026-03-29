
import Link from "next/link";
import { Scale } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t bg-card py-12">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-primary text-lg">
            <Scale className="h-5 w-5 text-accent" />
            <span>المستشار</span>
          </Link>
          <p className="text-sm text-muted-foreground leading-relaxed">
            استشارات قانونية احترافية في متناول يدك. نصيحة خبيرة وآمنة وخاصة عندما تحتاج إليها.
          </p>
        </div>
        
        <div>
          <h4 className="font-semibold mb-4 text-primary">المنصة</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/consultants" className="hover:text-accent">المستشارون</Link></li>
            <li><Link href="/match" className="hover:text-accent">المطابقة الذكية</Link></li>
            <li><Link href="/booking" className="hover:text-accent">الحجز</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4 text-primary">الشركة</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/about" className="hover:text-accent">من نحن</Link></li>
            <li><Link href="/privacy" className="hover:text-accent">سياسة الخصوصية</Link></li>
            <li><Link href="/terms" className="hover:text-accent">الشروط والأحكام</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4 text-primary">اتصل بنا</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>support@almustasharai.com</li>
            <li>+966 (123) 456-789</li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-8 pt-8 border-t text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} المستشار للخدمات القانونية. جميع الحقوق محفوظة.
      </div>
    </footer>
  );
}
