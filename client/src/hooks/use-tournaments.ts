import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { authFetch } from "../lib/api";
import type { Tournament, Participant, Match } from "@shared/schema";

export function useTournaments() {
  return useQuery({
    queryKey: [api.tournaments.list.path],
    queryFn: async () => {
      const res = await authFetch(api.tournaments.list.path);
      const data = await res.json();
      return data as Tournament[];
    },
  });
}

export function useTournament(id: number) {
  return useQuery({
    queryKey: [api.tournaments.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.tournaments.get.path, { id });
      const res = await authFetch(url);
      if (res.status === 404) return null;
      const data = await res.json();
      return data as Tournament;
    },
    enabled: !!id,
  });
}

export function useCreateTournament() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Tournament, "id">) => {
      const res = await authFetch(api.tournaments.create.path, {
        method: api.tournaments.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.tournaments.list.path] });
    },
  });
}

export function useJoinTournament(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const url = buildUrl(api.tournaments.join.path, { id });
      const res = await authFetch(url, { method: api.tournaments.join.method });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.tournaments.get.path, id] });
    },
  });
}

export function useGenerateBracket(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const url = buildUrl(api.tournaments.generateBracket.path, { id });
      const res = await authFetch(url, { method: api.tournaments.generateBracket.method });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.tournaments.get.path, id] });
      queryClient.invalidateQueries({ queryKey: [api.matches.listByTournament.path, id] });
    },
  });
}
