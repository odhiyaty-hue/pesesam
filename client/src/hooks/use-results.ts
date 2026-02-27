import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { authFetch } from "../lib/api";
import type { Result } from "@shared/schema";

export function useMatchResults(matchId: number) {
  return useQuery({
    queryKey: [api.results.listByMatch.path, matchId],
    queryFn: async () => {
      const url = buildUrl(api.results.listByMatch.path, { id: matchId });
      const res = await authFetch(url);
      const data = await res.json();
      return data as Result[];
    },
    enabled: !!matchId,
  });
}

export function useUploadResult(matchId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      // 1. Upload file to backend proxy
      const formData = new FormData();
      formData.append("image", file);
      
      const uploadRes = await authFetch(api.upload.path, {
        method: api.upload.method,
        body: formData,
      });
      
      const { url } = await uploadRes.json();
      
      // 2. Submit result to match
      const submitUrl = buildUrl(api.results.upload.path, { id: matchId });
      const res = await authFetch(submitUrl, {
        method: api.results.upload.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ screenshotUrl: url }),
      });
      
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.results.listByMatch.path, matchId] });
    },
  });
}

export function useDeleteResult() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.results.delete.path, { id });
      await authFetch(url, { method: api.results.delete.method });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.results.listByMatch.path] });
    },
  });
}
