import { useParams, Link } from "wouter";
import { useState } from "react";
import { useMatch } from "../hooks/use-matches";
import { useMatchResults, useUploadResult } from "../hooks/use-results";
import { useAuth } from "../hooks/use-auth";
import { Layout } from "../components/Layout";
import { Loader2, ArrowLeft, UploadCloud, CheckCircle, ShieldAlert, Image as ImageIcon } from "lucide-react";

export default function MatchDetails() {
  const { id } = useParams<{ id: string }>();
  const matchId = parseInt(id || "0", 10);
  
  const { dbUser } = useAuth();
  const { data: match, isLoading: loadingM } = useMatch(matchId);
  const { data: results, isLoading: loadingR } = useMatchResults(matchId);
  const uploadMutation = useUploadResult(matchId);

  const [file, setFile] = useState<File | null>(null);

  if (loadingM || loadingR) {
    return (
      <Layout>
        <div className="flex justify-center py-32"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div>
      </Layout>
    );
  }

  if (!match) return <Layout><div className="text-center py-20"><h2 className="text-2xl">Match not found</h2></div></Layout>;

  const isParticipant = dbUser && (match.player1Id === dbUser.id || match.player2Id === dbUser.id);
  const hasUploaded = results?.some(r => r.uploadedBy === dbUser?.id);

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    uploadMutation.mutate(file, {
      onSuccess: () => setFile(null)
    });
  };

  return (
    <Layout>
      <Link href={`/tournaments/${match.tournamentId}`} className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-white transition-colors mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Bracket
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-card rounded-3xl p-8 relative overflow-hidden text-center">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-b from-primary/5 to-transparent -z-10"></div>
            
            <span className={`inline-block px-4 py-1.5 mb-6 text-sm font-bold uppercase tracking-widest rounded-lg ${
              match.status === 'validated' ? 'bg-green-500/20 text-green-400' :
              match.status === 'played' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-white/10 text-white/60'
            }`}>
              {match.status} Match
            </span>

            <div className="flex items-center justify-center gap-8 md:gap-16">
              <div className={`flex flex-col items-center p-6 rounded-2xl flex-1 ${match.winnerId === match.player1Id ? 'bg-primary/20 ring-2 ring-primary' : 'bg-white/5'}`}>
                <div className="w-20 h-20 bg-slate-800 rounded-full mb-4 flex items-center justify-center border-4 border-slate-700">
                  <span className="text-2xl font-bold">{match.player1Id ? 'P1' : '?'}</span>
                </div>
                <span className="text-lg font-bold text-white">Player {match.player1Id?.substring(0,6) || "TBD"}</span>
                {match.winnerId === match.player1Id && <span className="text-primary font-bold mt-2 flex items-center gap-1"><Trophy className="w-4 h-4" /> Winner</span>}
              </div>

              <div className="text-4xl font-display font-black text-muted-foreground italic">VS</div>

              <div className={`flex flex-col items-center p-6 rounded-2xl flex-1 ${match.winnerId === match.player2Id ? 'bg-primary/20 ring-2 ring-primary' : 'bg-white/5'}`}>
                <div className="w-20 h-20 bg-slate-800 rounded-full mb-4 flex items-center justify-center border-4 border-slate-700">
                  <span className="text-2xl font-bold">{match.player2Id ? 'P2' : '?'}</span>
                </div>
                <span className="text-lg font-bold text-white">Player {match.player2Id?.substring(0,6) || "TBD"}</span>
                {match.winnerId === match.player2Id && <span className="text-primary font-bold mt-2 flex items-center gap-1"><Trophy className="w-4 h-4" /> Winner</span>}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><ImageIcon className="w-5 h-5 text-indigo-400" /> Evidence Screenshots</h3>
            {results?.length === 0 ? (
              <div className="glass-card p-12 rounded-2xl text-center border-dashed border-white/10">
                <p className="text-muted-foreground">No results uploaded yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {results?.map(res => (
                  <div key={res.id} className="glass-card rounded-xl overflow-hidden group">
                    <a href={res.screenshotUrl} target="_blank" rel="noopener noreferrer" className="block relative aspect-video bg-black/50">
                      <img src={res.screenshotUrl} alt="Match result" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    </a>
                    <div className="p-4 flex items-center gap-2 bg-card">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-muted-foreground">Uploaded by Player {res.uploadedBy.substring(0,6)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          {isParticipant && match.status !== "validated" && !hasUploaded ? (
            <div className="glass-card p-6 rounded-2xl border border-primary/30 sticky top-28">
              <h3 className="text-xl font-bold mb-2 text-white">Report Result</h3>
              <p className="text-sm text-muted-foreground mb-6">Upload a clear screenshot showing the final score of the match.</p>
              
              <form onSubmit={handleUpload} className="space-y-4">
                <label className="block w-full cursor-pointer">
                  <div className={`w-full aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-colors ${file ? 'border-primary bg-primary/10' : 'border-white/20 hover:border-primary/50 hover:bg-white/5'}`}>
                    {file ? (
                      <div className="text-center p-4">
                        <ImageIcon className="w-8 h-8 text-primary mx-auto mb-2" />
                        <span className="text-sm font-medium text-white">{file.name}</span>
                      </div>
                    ) : (
                      <div className="text-center p-4">
                        <UploadCloud className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <span className="text-sm font-medium text-muted-foreground">Click to select image</span>
                      </div>
                    )}
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} required />
                </label>

                <button 
                  type="submit"
                  disabled={!file || uploadMutation.isPending}
                  className="w-full py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {uploadMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />}
                  Upload Evidence
                </button>
              </form>
            </div>
          ) : isParticipant && hasUploaded ? (
            <div className="glass-card p-6 rounded-2xl bg-green-500/10 border border-green-500/30 sticky top-28">
              <div className="flex items-center gap-3 text-green-400 mb-2">
                <CheckCircle className="w-6 h-6" />
                <h3 className="text-xl font-bold">Result Submitted</h3>
              </div>
              <p className="text-sm text-muted-foreground">Your screenshot has been uploaded. An admin will review and confirm the result soon.</p>
            </div>
          ) : !isParticipant ? (
            <div className="glass-card p-6 rounded-2xl sticky top-28">
              <div className="flex items-center gap-3 text-muted-foreground mb-4">
                <ShieldAlert className="w-6 h-6" />
                <h3 className="text-lg font-bold text-white">Spectator View</h3>
              </div>
              <p className="text-sm">Only participants of this match can upload results.</p>
            </div>
          ) : null}
        </div>
      </div>
    </Layout>
  );
}

function Trophy({className}: {className?: string}) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20Z"></path></svg>
}
