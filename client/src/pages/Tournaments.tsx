import { Link } from "wouter";
import { Layout } from "../components/Layout";
import { useTournaments } from "../hooks/use-tournaments";
import { format } from "date-fns";
import { Trophy, Calendar, Users, ChevronRight, Loader2 } from "lucide-react";

export default function Tournaments() {
  const { data: tournaments, isLoading } = useTournaments();

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 animate-in">
        <div>
          <h1 className="text-4xl font-display font-bold text-white tracking-tight">Tournaments</h1>
          <p className="text-muted-foreground mt-2 text-lg">Find and join active eFootball competitions.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      ) : tournaments?.length === 0 ? (
        <div className="glass-card p-16 rounded-3xl text-center flex flex-col items-center">
          <Trophy className="w-16 h-16 text-muted-foreground opacity-30 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Tournaments Yet</h3>
          <p className="text-muted-foreground">Check back later for new competitions.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments?.map((tournament, idx) => (
            <Link 
              key={tournament.id}
              href={`/tournaments/${tournament.id}`}
              className="glass-card rounded-2xl overflow-hidden hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1 group"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="h-32 bg-gradient-to-br from-indigo-900 via-slate-800 to-black p-6 relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-32 h-32 bg-primary/20 blur-3xl rounded-full"></div>
                <div className="relative z-10 flex justify-between items-start">
                  <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg ${
                    tournament.status === 'open' ? 'bg-green-500/20 text-green-400' :
                    tournament.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-white/10 text-white/60'
                  }`}>
                    {tournament.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-4 line-clamp-1">{tournament.name}</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Users className="w-4 h-4 text-indigo-400" />
                    <span>Max {tournament.maxPlayers} Players</span>
                  </div>
                  {tournament.startDate && (
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 text-pink-400" />
                      <span>{format(new Date(tournament.startDate), 'MMM dd, yyyy - HH:mm')}</span>
                    </div>
                  )}
                </div>

                <div className="w-full py-3 px-4 rounded-xl bg-white/5 group-hover:bg-primary text-white font-semibold flex items-center justify-between transition-colors">
                  View Bracket
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Layout>
  );
}
