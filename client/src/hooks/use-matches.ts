import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { authFetch } from "../lib/api";
import type { Match } from "@shared/schema";

export function useTournamentMatches(tournamentId: number) {
  return useQuery({
    queryKey: [api.matches.listByTournament.path, tournamentId],
    queryFn: async () => {
      const url = buildUrl(api.matches.listByTournament.path, { id: tournamentId });
      const res = await authFetch(url);
      const data = await res.json();
      return data as Match[];
    },
    enabled: !!tournamentId,
  });
}

export function useMatch(id: number) {
  return useQuery({
    queryKey: [api.matches.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.matches.get.path, { id });
      const res = await authFetch(url);
      if (res.status === 404) return null;
      const data = await res.json();
      return data as Match;
    },
    enabled: !!id,
  });
}

export function useConfirmWinner(matchId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (winnerId: string) => {
      const url = buildUrl(api.matches.confirmWinner.path, { id: matchId });
      const res = await authFetch(url, {
        method: api.matches.confirmWinner.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ winnerId }),
      });
      return await res.json();
    },
    onSuccess: (_, variables, context) => {
      queryClient.invalidateQueries({ queryKey: [api.matches.get.path, matchId] });
      // We don't have tournament ID easily here, so we invalidate all matches to be safe
      queryClient.invalidateQueries({ queryKey: [api.matches.listByTournament.path] });
    },
  });
}
