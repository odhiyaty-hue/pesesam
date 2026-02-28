import { Link } from "wouter";
import { Layout } from "../components/Layout";
import { Trophy, ChevronRight, Shield, Zap, Users } from "lucide-react";

export default function Home() {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center text-center py-20 px-4 animate-in-slide">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-8 border border-primary/20">
          <Zap className="w-4 h-4" />
          المنصة الأفضل لبطولات eFootball
        </div>
        
        <h1 className="text-5xl md:text-7xl font-display font-extrabold tracking-tight mb-6">
          مرحباً بكم في بطولة عصام لـ eFootball <br className="hidden md:block" />
          <span className="text-gradient">هل أنت مستعد؟</span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-12">
          انضم إلى بطولات eFootball التنافسية، وتابع تقدمك في المواجهات، وارفع نتائج مبارياتك بأمان. قمة المنافسة والعدالة.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link 
            href="/register"
            className="px-8 py-4 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
          >
            <Trophy className="w-5 h-5" />
            سجل الآن
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
        <FeatureCard 
          icon={<Shield className="w-8 h-8 text-primary" />}
          title="نظام مكافحة الغش"
          desc="يضمن التحقق من لقطات الشاشة دقة نتائج كل مباراة ويتم التحقق منها من قبل المسؤولين."
          delay="delay-100"
        />
        <FeatureCard 
          icon={<Zap className="w-8 h-8 text-pink-400" />}
          title="توليد المواجهات تلقائياً"
          desc="عندما تكتمل البطولة، يقوم النظام تلقائياً بتوزيع اللاعبين وبناء جدول المواجهات."
          delay="delay-200"
        />
        <FeatureCard 
          icon={<Users className="w-8 h-8 text-indigo-400" />}
          title="مجتمع تنافسي"
          desc="واجه أفضل اللاعبين وتسلق المراتب في بطولات منظمة."
          delay="delay-300"
        />
      </div>
    </Layout>
  );
}

function FeatureCard({ icon, title, desc, delay }: { icon: React.ReactNode, title: string, desc: string, delay: string }) {
  return (
    <div className={`glass-card p-8 rounded-2xl animate-in-slide ${delay} hover:-translate-y-2 transition-transform duration-300`}>
      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}
