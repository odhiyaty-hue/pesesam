import { useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "../hooks/use-auth";
import { Layout } from "../components/Layout";
import { Swords, Loader2, AlertCircle } from "lucide-react";

export default function Auth() {
  const [_, setLocation] = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [realName, setRealName] = useState("");
  const [ingameName, setIngameName] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let avatarUrl = "";
      if (avatar) {
        const formData = new FormData();
        formData.append("image", avatar);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();
        avatarUrl = uploadData.url;
      }

      const res = await fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          realName,
          ingameName,
          avatarUrl,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Registration failed");
      }

      const data = await res.json();
      // Store user info in localStorage for this "session"
      localStorage.setItem("tournament_user", JSON.stringify(data.user));
      
      setLocation(`/tournaments/${data.participant.tournamentId}`);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto mt-12 animate-in-slide">
        <div className="glass-card p-8 rounded-3xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-4">
              <Swords className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl font-display font-bold text-white text-center">
              Tournament Registration
            </h2>
            <p className="text-muted-foreground mt-2 text-center">
              Enter your details to join the tournament.
            </p>
          </div>

          {error && (
            <div className="p-4 mb-6 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Real Name</label>
              <input 
                type="text" 
                value={realName}
                onChange={e => setRealName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                placeholder="Your Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">In-Game Name</label>
              <input 
                type="text" 
                value={ingameName}
                onChange={e => setIngameName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                placeholder="eFootball Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Personal Photo</label>
              <input 
                type="file" 
                onChange={e => setAvatar(e.target.files?.[0] || null)}
                required
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-primary transition-all"
                accept="image/*"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              Register for Tournament
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-muted-foreground border-t border-white/10 pt-6">
            Admin access required for tournament management.
          </div>
        </div>
      </div>
    </Layout>
  );
}
