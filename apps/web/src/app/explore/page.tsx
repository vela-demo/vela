"use client";

import { useState } from "react";
import SearchBar from "@/components/SearchBar";
import { MOCK_POSTS, MOCK_PROFILES } from "@/lib/mockData";
import type { Post } from "@/components/PostCard";

const INDEXER_URL = process.env.NEXT_PUBLIC_INDEXER_URL ?? "http://localhost:3001";

interface SearchResult {
  posts: Post[];
  profiles: { address: string; username: string; bio: string; followers: number; following: number }[];
}

async function searchIndexer(query: string): Promise<SearchResult> {
  try {
    const res = await fetch(
      `${INDEXER_URL}/api/search?q=${encodeURIComponent(query)}`
    );
    if (res.ok) return res.json();
  } catch { /* indexer offline */ }

  // Fallback: filter mock data locally
  const q = query.toLowerCase();
  const posts = MOCK_POSTS.filter(
    p =>
      p.content.toLowerCase().includes(q) ||
      (p.username ?? "").toLowerCase().includes(q)
  );
  const profiles = Object.entries(MOCK_PROFILES)
    .filter(([addr, p]) => p.username.toLowerCase().includes(q) || p.bio.toLowerCase().includes(q))
    .map(([address, p]) => ({ address, ...p }));
  return { posts, profiles };
}

export default function ExplorePage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (q: string) => {
    if (!q.trim()) return;
    setQuery(q);
    setLoading(true);
    setSearched(true);
    try {
      const data = await searchIndexer(q);
      setResults(data);
    } catch {
      setResults({ posts: [], profiles: [] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl" style={{ minHeight: "100dvh" }}>
      {/* Header */}
      <div
        className="sticky top-[57px] z-20 px-4 py-3"
        style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)" }}
      >
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search posts, people…"
          className="w-full"
        />
      </div>

      {/* Initial state */}
      {!searched && !loading && (
        <div className="px-4 py-16 text-center">
          <div className="mx-auto mb-4 w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "var(--bg-muted)" }}>
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: "var(--fg-muted)" }} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 0z" />
            </svg>
          </div>
          <p className="font-semibold mb-1" style={{ color: "var(--fg)" }}>Search Vela</p>
          <p className="text-sm" style={{ color: "var(--fg-muted)" }}>Find posts and people across the network.</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="px-4 py-16 text-center">
          <svg className="animate-spin w-6 h-6 mx-auto mb-3" fill="none" viewBox="0 0 24 24" style={{ color: "var(--fg-subtle)" }} aria-label="Searching">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-sm" style={{ color: "var(--fg-muted)" }}>Searching…</p>
        </div>
      )}

      {/* Results */}
      {!loading && results && (
        <div>
          {/* Profiles */}
          {results.profiles.length > 0 && (
            <section className="mb-2">
              <h2 className="px-4 py-2 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--fg-muted)" }}>
                People
              </h2>
              {results.profiles.map(p => (
                <a
                  key={p.address}
                  href={`/profile/${p.address}`}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--bg-subtle)]"
                  style={{ borderBottom: "1px solid var(--border)" }}
                >
                  <div
                    className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: "var(--brand)" }}
                    aria-hidden="true"
                  >
                    {p.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm" style={{ color: "var(--fg)" }}>@{p.username}</p>
                    <p className="text-xs truncate" style={{ color: "var(--fg-muted)" }}>{p.bio}</p>
                  </div>
                  <span className="text-xs shrink-0" style={{ color: "var(--fg-subtle)" }}>
                    {p.followers.toLocaleString()} followers
                  </span>
                </a>
              ))}
            </section>
          )}

          {/* Posts */}
          {results.posts.length > 0 && (
            <section>
              <h2 className="px-4 py-2 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--fg-muted)" }}>
                Posts
              </h2>
              {results.posts.map(post => (
                <article
                  key={post.id}
                  className="flex gap-3 px-4 py-4"
                  style={{ borderBottom: "1px solid var(--border)" }}
                >
                  <div
                    className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: "var(--brand)" }}
                    aria-hidden="true"
                  >
                    {(post.username ?? post.author).slice(1, 3).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-semibold text-sm" style={{ color: "var(--fg)" }}>
                        {post.username ? `@${post.username}` : `${post.author.slice(0, 6)}…${post.author.slice(-4)}`}
                      </span>
                    </div>
                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words" style={{ color: "var(--fg)" }}>
                      {post.content}
                    </p>
                  </div>
                </article>
              ))}
            </section>
          )}

          {/* No results */}
          {results.profiles.length === 0 && results.posts.length === 0 && (
            <div className="px-4 py-16 text-center">
              <p className="font-semibold mb-1" style={{ color: "var(--fg)" }}>No results found</p>
              <p className="text-sm" style={{ color: "var(--fg-muted)" }}>
                Try a different search term.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
