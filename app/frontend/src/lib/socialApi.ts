import { SERVER_URL } from "@/config/config";
import type { LeaderboardResponse, RankingResponse } from "@/types/social";

export async function fetchLeaderboard(): Promise<LeaderboardResponse> {
  const res = await fetch(`${SERVER_URL}/api/social/leaderboard`);
  if (!res.ok) throw new Error("Failed to fetch leaderboard");
  return res.json();
}

export async function fetchSeedAccounts(): Promise<LeaderboardResponse> {
  const res = await fetch(`${SERVER_URL}/api/social/seed-accounts`);
  if (!res.ok) throw new Error("Failed to fetch seed accounts");
  return res.json();
}

export async function manageSeedAccount(
  handle: string,
  action: "add" | "remove"
) {
  await fetch(`${SERVER_URL}/api/social/seed-accounts/manage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profile_handle: handle, action }),
  });
}

export async function fetchRanking(handle: string): Promise<RankingResponse> {
  const res = await fetch(`${SERVER_URL}/api/social/rank/${handle}`);
  if (!res.ok) throw new Error("Failed to fetch ranking");
  return res.json();
}

export async function calculateRanking(
  handle: string
): Promise<RankingResponse> {
  const res = await fetch(`${SERVER_URL}/api/social/rank`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ handle, force_refresh: true }),
  });
  if (!res.ok) throw new Error("Failed to calculate ranking");
  return res.json();
}
