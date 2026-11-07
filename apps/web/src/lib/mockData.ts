/**
 * Mock data for local development — used when the indexer (localhost:3001)
 * is not running. Gives the feed, explore, and profile pages realistic content.
 */

import type { Post } from "@/components/PostCard";

const NOW = Date.now();
const mins = (n: number) => NOW - n * 60 * 1000;
const hours = (n: number) => NOW - n * 60 * 60 * 1000;
const days = (n: number) => NOW - n * 24 * 60 * 60 * 1000;

export const MOCK_POSTS: Post[] = [
  {
    id: 1,
    author: "GBMK4YEZQKXN5RPHMB6GFQZWXZ7XQZQ7YXQZQ7YXQZQ7YXQZQ7YXQ",
    username: "stellar_dev",
    content:
      "Just deployed a new Soroban contract on testnet — community pools are live! You can now stake XLM and earn yield while supporting your favourite creators. This is what SocialFi is all about. 🚀",
    like_count: 42,
    tip_total: 12.5,
    created_at: String(mins(5)),
  },
  {
    id: 2,
    author: "GCEZ6JYMYGKGBQYXQZQ7YXQZQ7YXQZQ7YXQZQ7YXQZQ7YXQZQ7YXQZ",
    username: "vela_creator",
    content:
      "Vela just hit 500 beta users! 🎉 Huge thanks to everyone who tried it out and sent feedback. We're working on the mobile app and governance module next. Follow along for updates.",
    like_count: 128,
    tip_total: 55.0,
    created_at: String(mins(22)),
  },
  {
    id: 3,
    author: "GDTZ7QZQZQ7YXQZQ7YXQZQ7YXQZQ7YXQZQ7YXQZQ7YXQZQ7YXQZQ7Y",
    username: "onchain_alice",
    content:
      "Tipped 10 XLM to three creators today through Vela. The experience is smoother than anything I've tried — no gas anxiety, instant finality on Stellar. This is how crypto UX should feel.",
    like_count: 31,
    tip_total: 10.0,
    created_at: String(hours(1)),
  },
  {
    id: 4,
    author: "GBTZ7QZQZQ7YXQZQ7YXQZQ7YXQZQ7YXQZQ7YXQZQ7YXQZQ7YXQZQ7X",
    username: "defi_bob",
    content:
      "The governance vote on pool fee structures passed with 73% approval. On-chain governance actually working in a social app is a first for me. Great work Vela team.",
    like_count: 19,
    tip_total: 3.2,
    created_at: String(hours(3)),
  },
  {
    id: 5,
    author: "GCTZ7QZQZQ7YXQZQ7YXQZQ7YXQZQ7YXQZQ7YXQZQ7YXQZQ7YXQZQ7Z",
    username: "web3_carol",
    content:
      "Mini apps on Vela are genuinely cool. Just used a creator token launchpad built as a mini app — deployed my own token in about 2 minutes. The bridge API is well documented too.",
    like_count: 67,
    tip_total: 25.75,
    created_at: String(hours(5)),
  },
  {
    id: 6,
    author: "GBMK4YEZQKXN5RPHMB6GFQZWXZ7XQZQ7YXQZQ7YXQZQ7YXQZQ7YXQ",
    username: "stellar_dev",
    content:
      "For anyone building on Soroban — the Vela SDK is open source and well typed. You can use it to read profiles, posts, and pool state in a few lines. Check it out.",
    like_count: 88,
    tip_total: 0,
    created_at: String(hours(8)),
  },
  {
    id: 7,
    author: "GDTZ7QZQZQ7YXQZQ7YXQZQ7YXQZQ7YXQZQ7YXQZQ7YXQZQ7YXQZQ7Y",
    username: "onchain_alice",
    content:
      "E2EE direct messages on a social platform backed by on-chain keys — Vela DMs are the only messages I actually feel safe sending crypto info through.",
    like_count: 54,
    tip_total: 8.0,
    created_at: String(days(1)),
  },
  {
    id: 8,
    author: "GCEZ6JYMYGKGBQYXQZQ7YXQZQ7YXQZQ7YXQZQ7YXQZQ7YXQZQ7YXQZ",
    username: "vela_creator",
    content:
      "New blog post: how we built community pools on Soroban with on-chain governance and yield distribution. Link in profile. TL;DR: Rust + Soroban = surprisingly ergonomic once you get the hang of it.",
    like_count: 102,
    tip_total: 40.0,
    created_at: String(days(2)),
  },
  {
    id: 9,
    author: "GBTZ7QZQZQ7YXQZQ7YXQZQ7YXQZQ7YXQZQ7YXQZQ7YXQZQ7YXQZQ7X",
    username: "defi_bob",
    content:
      "Followed 10 new creators on Vela today. The follow graph is on-chain which means it's portable — your social graph belongs to you, not the platform. That's the whole point.",
    like_count: 76,
    tip_total: 15.5,
    created_at: String(days(3)),
  },
  {
    id: 10,
    author: "GCTZ7QZQZQ7YXQZQ7YXQZQ7YXQZQ7YXQZQ7YXQZQ7YXQZQ7YXQZQ7Z",
    username: "web3_carol",
    content:
      "Vela analytics oracle is underrated. Creators get signed, on-chain verified analytics reports — no more guessing if your metrics are real. This alone is worth using the platform.",
    like_count: 45,
    tip_total: 18.25,
    created_at: String(days(4)),
  },
];

export const MOCK_FOLLOWING = [
  "GBMK4YEZQKXN5RPHMB6GFQZWXZ7XQZQ7YXQZQ7YXQZQ7YXQZQ7YXQ",
  "GCEZ6JYMYGKGBQYXQZQ7YXQZQ7YXQZQ7YXQZQ7YXQZQ7YXQZQ7YXQZ",
  "GDTZ7QZQZQ7YXQZQ7YXQZQ7YXQZQ7YXQZQ7YXQZQ7YXQZQ7YXQZQ7Y",
];

export const MOCK_PROFILES: Record<string, { username: string; bio: string; followers: number; following: number }> = {
  "GBMK4YEZQKXN5RPHMB6GFQZWXZ7XQZQ7YXQZQ7YXQZQ7YXQZQ7YXQ": {
    username: "stellar_dev",
    bio: "Building on Stellar/Soroban. Open source everything. Vela contributor.",
    followers: 1240,
    following: 88,
  },
  "GCEZ6JYMYGKGBQYXQZQ7YXQZQ7YXQZQ7YXQZQ7YXQZQ7YXQZQ7YXQZ": {
    username: "vela_creator",
    bio: "Core team @ Vela. SocialFi believer. Building the future of creator monetisation.",
    followers: 3800,
    following: 120,
  },
  "GDTZ7QZQZQ7YXQZQ7YXQZQ7YXQZQ7YXQZQ7YXQZQ7YXQZQ7YXQZQ7Y": {
    username: "onchain_alice",
    bio: "DeFi explorer. Tips creators daily. On-chain or nothing.",
    followers: 560,
    following: 210,
  },
  "GBTZ7QZQZQ7YXQZQ7YXQZQ7YXQZQ7YXQZQ7YXQZQ7YXQZQ7YXQZQ7X": {
    username: "defi_bob",
    bio: "Governance nerd. Yield farmer. Occasional meme poster.",
    followers: 890,
    following: 305,
  },
  "GCTZ7QZQZQ7YXQZQ7YXQZQ7YXQZQ7YXQZQ7YXQZQ7YXQZQ7YXQZQ7Z": {
    username: "web3_carol",
    bio: "Mini app developer. Creator token launcher. Vela power user.",
    followers: 1750,
    following: 430,
  },
};

/**
 * Simulates the indexer REST API responses locally.
 * Returns the same shape the real indexer returns.
 */
export function mockFetch(url: string): { posts?: Post[]; has_more?: boolean; following?: string[] } | null {
  // GET /api/posts
  if (url.includes("/api/posts")) {
    const urlObj = new URL(url, "http://localhost");
    const author = urlObj.searchParams.get("author");
    const limit = parseInt(urlObj.searchParams.get("limit") ?? "10", 10);
    const cursor = urlObj.searchParams.get("cursor");

    let filtered = author
      ? MOCK_POSTS.filter((p) => p.author === author)
      : [...MOCK_POSTS];

    if (cursor) {
      const cursorTime = Number(cursor);
      filtered = filtered.filter((p) => Number(p.created_at ?? p.timestamp ?? 0) < cursorTime);
    }

    const paginated = filtered.slice(0, limit);
    return { posts: paginated, has_more: filtered.length > limit };
  }

  // GET /api/follows/:address/following
  if (url.includes("/api/follows/") && url.includes("/following")) {
    return { following: MOCK_FOLLOWING };
  }

  // GET /api/follows/:address/followers
  if (url.includes("/api/follows/") && url.includes("/followers")) {
    return { following: [] };
  }

  return null;
}
