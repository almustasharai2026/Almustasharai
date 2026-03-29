
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ShieldCheck, 
  Calendar, 
  BrainCircuit, 
} from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function Home() {
  const heroImg = PlaceHolderImages.find(img => img.id === "hero-bg");

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-1000">
            <h1 className="text-4xl lg:text-6xl font-headline font-bold leading-tight">
              استشارات قانونية خبيرة، <br />
              <span className="text-accent">وقتما احتجت إليها.</span>
            </h1>
            <p className="text-lg opacity-90 max-w-lg leading-relaxed">
              تواصل مع نخبة من المستشارين القانونيين المتخصصين عبر منصتنا الآمنة. احجز استشارتك، وأدر احتياجاتك القانونية، واحصل على رؤى مدعومة بالذكاء الاصطناعي.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/consultants">
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 px-8">
                  تصفح المستشارين
                </Button>
              </Link>
              <Link href="/match">
                <Button size="lg" variant="outline" className="border-accent text-accent hover:bg-accent/10 px-8">
                  المطابقة الذكية
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative hidden lg:block">
            <div className="absolute -inset-4 bg-accent/20 rounded-3xl blur-3xl" />
            <div className="relative bg-card p-2 rounded-2xl shadow-2xl">
              <Image 
                src={heroImg?.imageUrl || ""} 
                alt="Legal consultations" 
                width={800} 
                height={500}
                className="rounded-xl object-cover"
                data-ai-hint="legal office"
              />
            </div>
          </div>
        </div>
        <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-accent/10 to-transparent" />
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl font-headline font-bold text-primary">لماذا تختار "المستشار"؟</h2>
            <p className="text-muted-foreground">الجسر الرقمي بينك وبين الخبرة القانونية التي تحتاجها.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<ShieldCheck className="h-8 w-8 text-accent" />}
              title="آمن وخاص"
              description="بياناتك واستشاراتك محمية بأعلى مستويات التشفير لضمان خصوصيتك."
            />
            <FeatureCard 
              icon={<Calendar className="h-8 w-8 text-accent" />}
              title="سهولة الحجز"
              description="جدول مواعيدك بما يتناسب مع وقتك بضغطات زر بسيطة."
            />
            <FeatureCard 
              icon={<BrainCircuit className="h-8 w-8 text-accent" />}
              title="مطابقة ذكية"
              description="دع ذكاءنا الاصطناعي يجد لك المتخصص الأمثل لحالتك القانونية."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="bg-primary rounded-3xl p-8 md:p-16 text-primary-foreground flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-xl">
              <h2 className="text-3xl font-headline font-bold">هل أنت مستعد لحل قضاياك القانونية؟</h2>
              <p className="opacity-80">انضم إلى آلاف المستخدمين الذين وجدوا النصيحة الخبيرة عبر منصتنا.</p>
            </div>
            <Link href="/auth/signup">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold px-10">
                ابدأ رحلتك الآن
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="pt-8 pb-8 flex flex-col items-center text-center space-y-4">
        <div className="p-3 bg-accent/10 rounded-2xl mb-2">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-primary">{title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
