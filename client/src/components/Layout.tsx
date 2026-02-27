import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../hooks/use-auth";
import { Trophy, LogOut, ShieldAlert, User as UserIcon, Home, Swords } from "lucide-react";

export function Layout({ children }: { children: ReactNode }) {
  const { dbUser, signOut } = useAuth();
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/tournaments", label: "Tournaments", icon: Trophy },
  ];

  if (dbUser?.role === "admin") {
    navItems.push({ path: "/admin", label: "Admin Panel", icon: ShieldAlert });
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 glass-card border-b-0 border-white/5 rounded-none shadow-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="p-2 bg-primary/20 rounded-xl group-hover:bg-primary/30 transition-colors">
                <Swords className="w-6 h-6 text-primary" />
              </div>
              <span className="font-display font-bold text-2xl tracking-tight text-white">
                eFoot<span className="text-primary">Tourney</span>
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
              {dbUser ? (
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-sm font-medium text-white">{dbUser.email}</span>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold">
                      {dbUser.role}
                    </span>
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="p-2.5 rounded-xl bg-white/5 text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-colors"
                    title="Log Out"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <Link 
                  href="/auth"
                  className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
                >
                  <UserIcon className="w-4 h-4" />
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {children}
      </main>

      <footer className="py-8 border-t border-white/5 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground text-sm">
          &copy; {new Date().getFullYear()} eFootTourney. Built for champions.
        </div>
      </footer>
    </div>
  );
}
