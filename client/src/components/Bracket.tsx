import { useMemo } from "react";
import { Link } from "wouter";
import type { Match } from "@shared/schema";
import { Trophy, ChevronRight, AlertCircle } from "lucide-react";

interface BracketProps {
  matches: Match[];
}

export function Bracket({ matches }: BracketProps) {
  // Group matches by round
  const rounds = useMemo(() => {
    const grouped: Record<number, Match[]> = {};
    let maxRound = 0;
    
    matches.forEach(match => {
      if (!grouped[match.round]) {
        grouped[match.round] = [];
      }
      grouped[match.round].push(match);
      if (match.round > maxRound) maxRound = match.round;
    });

    // Ensure they are sorted by ID or logically so they align
    Object.keys(grouped).forEach(round => {
      grouped[parseInt(round)].sort((a, b) => a.id - b.id);
    });

    return Array.from({ length: maxRound }, (_, i) => grouped[i + 1] || []);
  }, [matches]);

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-white/10 border-dashed rounded-2xl bg-white/5">
        <AlertCircle className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
        <h3 className="text-xl font-bold text-white mb-2">المواجهات لم يتم توليدها بعد</h3>
        <p className="text-muted-foreground">جدول مواجهات البطولة لم يتم إنشاؤه بعد.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bracket-scroll pb-8 pt-4">
      <div className="flex items-start gap-12 min-w-max px-4">
        {rounds.map((roundMatches, roundIdx) => (
          <div key={`round-${roundIdx}`} className="flex flex-col justify-around gap-8 min-h-full">
            <h4 className="text-center font-bold text-primary mb-4 uppercase tracking-widest text-xs">
              {roundIdx === rounds.length - 1 ? "النهائي" : `الجولة ${roundIdx + 1}`}
            </h4>
            
            {roundMatches.map((match, matchIdx) => (
              <div 
                key={match.id} 
                className="relative flex items-center"
              >
                <Link 
                  href={`/matches/${match.id}`}
                  className="w-64 glass-card p-4 rounded-xl hover:border-primary/50 hover:shadow-primary/20 transition-all duration-300 group"
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      مباراة {match.id}
                    </span>
                    <span className={`text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-wider ${
                      match.status === 'validated' ? 'bg-green-500/20 text-green-400' :
                      match.status === 'played' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-white/10 text-white/60'
                    }`}>
                      {match.status === 'validated' ? 'مؤكدة' : 
                       match.status === 'played' ? 'ملعوبة' : 
                       match.status === 'pending' ? 'معلقة' : match.status}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <PlayerRow 
                      playerId={match.player1Id} 
                      isWinner={match.winnerId === match.player1Id && match.winnerId !== null} 
                    />
                    <div className="h-px w-full bg-white/10 my-1"></div>
                    <PlayerRow 
                      playerId={match.player2Id} 
                      isWinner={match.winnerId === match.player2Id && match.winnerId !== null} 
                    />
                  </div>

                  <div className="mt-4 flex items-center justify-center text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
                    عرض التفاصيل <ChevronRight className="w-3 h-3 mr-1 rotate-180" />
                  </div>
                </Link>

                {/* Connection lines would be complex without absolute positioning based on nodes, 
                    using simplified column layout for elegance & responsiveness */}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function PlayerRow({ playerId, isWinner }: { playerId: string | null, isWinner: boolean }) {
  return (
    <div className={`flex items-center justify-between p-2 rounded-lg ${isWinner ? 'bg-primary/10' : ''}`}>
      <span className={`font-medium truncate ${isWinner ? 'text-white' : playerId ? 'text-white/80' : 'text-white/30 italic'}`}>
        {playerId ? `لاعب ${playerId.substring(0, 6)}...` : 'قريباً'}
      </span>
      {isWinner && <Trophy className="w-4 h-4 text-primary" />}
    </div>
  );
}
