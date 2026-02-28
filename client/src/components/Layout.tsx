import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../hooks/use-auth";
import { Trophy, LogOut, ShieldAlert, User as UserIcon, Home, Swords } from "lucide-react";

export function Layout({ children }: { children: ReactNode }) {
  const { dbUser, signOut } = useAuth();
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "الرئيسية", icon: Home },
    { path: "/tournaments", label: "البطولات", icon: Trophy },
  ];

  if (dbUser?.role === "admin") {
    navItems.push({ path: "/admin", label: "لوحة التحكم", icon: ShieldAlert });
  }

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <header className="sticky top-0 z-50 glass-card border-b-0 border-white/5 rounded-none shadow-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="p-2 bg-primary/20 rounded-xl group-hover:bg-primary/30 transition-colors">
                <Swords className="w-6 h-6 text-primary" />
              </div>
              <span className="font-display font-bold text-2xl tracking-tight text-white">
                إي-فوت<span className="text-primary">تورني</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path || (item.path !== "/" && location.startsWith(item.path));
                return (
                  <Link 
                    key={item.path} 
                    href={item.path}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                      isActive 
                        ? "text-primary" 
                        : "text-muted-foreground hover:text-white"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-4">
              <Link 
                href="/admin"
                className="p-2.5 rounded-xl bg-white/5 text-muted-foreground hover:bg-primary/20 hover:text-primary transition-colors"
                title="لوحة التحكم"
              >
                <ShieldAlert className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {children}
      </main>

      <footer className="py-8 border-t border-white/5 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground text-sm">
          &copy; {new Date().getFullYear()} إي-فوت تورني. صُنع للأبطال.
        </div>
      </footer>
    </div>
  );
}
