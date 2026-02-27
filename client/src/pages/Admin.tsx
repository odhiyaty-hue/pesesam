import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../hooks/use-auth";
import { useTournaments, useCreateTournament, useGenerateBracket } from "../hooks/use-tournaments";
import { useTournamentMatches, useConfirmWinner } from "../hooks/use-matches";
import { Layout } from "../components/Layout";
import { ShieldAlert, Plus, ShieldCheck, Loader2, PlayCircle, Users } from "lucide-react";

export default function Admin() {
  const { dbUser } = useAuth();
  const [_, setLocation] = useLocation();
  const { data: tournaments, isLoading } = useTournaments();
  const createMutation = useCreateTournament();

  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(8);

  // Simple protection check
  if (dbUser && dbUser.role !== "admin") {
    setLocation("/");
    return null;
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ name, maxPlayers, status: "open", startDate: new Date() }, {
      onSuccess: () => {
        setIsCreating(false);
        setName("");
      }
    });
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-display font-bold text-white flex items-center gap-3">
            <ShieldAlert className="w-10 h-10 text-primary" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">Manage tournaments, brackets, and validate results.</p>
        </div>
        <button 
          onClick={() => setIsCreating(!isCreating)}
          className="px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/25 transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {isCreating ? "Cancel" : "New Tournament"}
        </button>
      </div>

      {isCreating && (
        <div className="glass-card p-6 md:p-8 rounded-2xl mb-10 border border-primary/30 animate-in-slide">
          <h3 className="text-xl font-bold text-white mb-6">Create Tournament</h3>
          <form onSubmit={handleCreate} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-white mb-2">Tournament Name</label>
              <input 
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                placeholder="e.g. Summer Championship 2024"
              />
            </div>
            <div className="w-full md:w-48">
              <label className="block text-sm font-medium text-white mb-2">Max Players</label>
              <select 
                value={maxPlayers}
                onChange={e => setMaxPlayers(parseInt(e.target.value))}
                className="w-full px-4 py-3 rounded-xl bg-card border border-white/10 text-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
              >
                <option value={4}>4 Players</option>
                <option value={8}>8 Players</option>
                <option value={16}>16 Players</option>
                <option value={32}>32 Players</option>
              </select>
            </div>
            <button 
              type="submit"
              disabled={createMutation.isPending}
              className="w-full md:w-auto px-8 py-3 h-[50px] rounded-xl bg-primary hover:bg-primary/90 text-white font-bold transition-all disabled:opacity-50"
            >
              {createMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Create"}
            </button>
          </form>
        </div>
      )}

      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white mb-4">Manage Tournaments</h2>
        {isLoading ? (
          <div className="py-20 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
        ) : tournaments?.map(t => (
          <AdminTournamentCard key={t.id} tournament={t} />
        ))}
      </div>
    </Layout>
  );
}

function AdminTournamentCard({ tournament }: { tournament: any }) {
  const generateMutation = useGenerateBracket(tournament.id);
  const { data: matches } = useTournamentMatches(tournament.id);
  
  const pendingValidation = matches?.filter(m => m.status === "played" || (m.status === "pending" && m.player1Id && m.player2Id));

  return (
    <div className="glass-card rounded-2xl overflow-hidden border border-white/5">
      <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/[0.02]">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md ${
              tournament.status === 'open' ? 'bg-green-500/20 text-green-400' :
              tournament.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-white/10 text-white/60'
            }`}>
              {tournament.status.replace('_', ' ')}
            </span>
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Users className="w-4 h-4" /> Max {tournament.maxPlayers}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-white">{tournament.name}</h3>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          {tournament.status === "open" && (
            <button
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              className="flex-1 md:flex-none px-6 py-2.5 rounded-xl border border-primary/50 text-primary font-semibold hover:bg-primary/10 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {generateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
              Generate Bracket
            </button>
          )}
          <Link 
            href={`/tournaments/${tournament.id}`}
            className="flex-1 md:flex-none px-6 py-2.5 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-colors text-center"
          >
            View
          </Link>
        </div>
      </div>

      {pendingValidation && pendingValidation.length > 0 && (
        <div className="p-6 border-t border-white/5 bg-black/20">
          <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-yellow-400" /> Action Required: Pending Matches
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingValidation.map(match => (
              <AdminMatchCard key={match.id} match={match} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AdminMatchCard({ match }: { match: any }) {
  const confirmMutation = useConfirmWinner(match.id);

  return (
    <div className="bg-card border border-white/10 rounded-xl p-4 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs text-muted-foreground font-bold">Match #{match.id} - Round {match.round}</span>
          <Link href={`/matches/${match.id}`} className="text-xs text-primary hover:underline">View Evidence</Link>
        </div>
        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-white/80">P1: {match.player1Id?.substring(0,6)}</span>
            <button 
              onClick={() => confirmMutation.mutate(match.player1Id)}
              disabled={confirmMutation.isPending}
              className="px-3 py-1 text-xs font-bold rounded bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors disabled:opacity-50"
            >
              Set Winner
            </button>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-white/80">P2: {match.player2Id?.substring(0,6)}</span>
            <button 
              onClick={() => confirmMutation.mutate(match.player2Id)}
              disabled={confirmMutation.isPending}
              className="px-3 py-1 text-xs font-bold rounded bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors disabled:opacity-50"
            >
              Set Winner
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
