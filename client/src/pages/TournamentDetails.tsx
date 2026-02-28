import { useParams, Link } from "wouter";
import { useTournament, useJoinTournament } from "../hooks/use-tournaments";
import { useTournamentMatches } from "../hooks/use-matches";
import { useAuth } from "../hooks/use-auth";
import { Layout } from "../components/Layout";
import { Bracket } from "../components/Bracket";
import { format } from "date-fns";
import { Trophy, Calendar, Users, Loader2, ArrowLeft, LogIn } from "lucide-react";

export default function TournamentDetails() {
  const { id } = useParams<{ id: string }>();
  const tournamentId = parseInt(id || "0", 10);
  
  const { dbUser } = useAuth();
  const { data: tournament, isLoading: loadingT } = useTournament(tournamentId);
  const { data: matches, isLoading: loadingM } = useTournamentMatches(tournamentId);
  
  const joinMutation = useJoinTournament(tournamentId);

  if (loadingT || loadingM) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!tournament) {
    return (
      <Layout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold">البطولة غير موجودة</h2>
          <Link href="/tournaments" className="text-primary mt-4 inline-block hover:underline">
            العودة للبطولات
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Link href="/tournaments" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-white transition-colors mb-6">
        <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
        العودة للبطولات
      </Link>

      <div className="glass-card p-8 md:p-10 rounded-3xl mb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -z-10 translate-x-1/3 -translate-y-1/3"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 z-10 relative">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg ${
                tournament.status === 'open' ? 'bg-green-500/20 text-green-400' :
                tournament.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-white/10 text-white/60'
              }`}>
                {tournament.status === 'open' ? 'مفتوح' : 
                 tournament.status === 'in_progress' ? 'قيد التنفيذ' : 
                 tournament.status === 'completed' ? 'مكتمل' : tournament.status}
              </span>
              {tournament.startDate && (
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(tournament.startDate), 'MMM dd, yyyy')}
                </span>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-2">{tournament.name}</h1>
            <p className="text-muted-foreground flex items-center gap-2 mt-4">
              <Users className="w-5 h-5 text-indigo-400" />
              الحد الأقصى {tournament.maxPlayers} لاعبين
            </p>
          </div>

          <div className="flex flex-col items-end gap-3">
            {tournament.status === "open" && dbUser && (
              <button
                onClick={() => joinMutation.mutate()}
                disabled={joinMutation.isPending}
                className="px-8 py-4 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/25 hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {joinMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5 rotate-180" />}
                انضم للبطولة
              </button>
            )}
            {!dbUser && tournament.status === "open" && (
              <Link href="/auth" className="px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all">
                سجل الدخول للانضمام
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-3">
        <Trophy className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-display font-bold">جدول المواجهات</h2>
      </div>

      <div className="glass-card rounded-3xl p-6 min-h-[500px]">
        <Bracket matches={matches || []} />
      </div>
    </Layout>
  );
}
