"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useWallet } from "@/hooks/useWallet";
import { PostCard, PostCardSkeleton, type Post } from "@/components/PostCard";
import { mockFetch } from "@/lib/mockData";
import { validateAmount, validateStellarAddress } from "@/lib/validate";
import { FieldError } from "@/components/forms/FieldError";
import { buildSignAndSubmit } from "@/lib/tx";
import { nativeToScVal, Address } from "@stellar/stellar-sdk";

/* ── Config ─────────────────────────────────────────────────────────────── */
const CONTRACT_ID  = process.env.NEXT_PUBLIC_CONTRACT_ID  ?? "CDUMMY";
const RPC_URL      = process.env.NEXT_PUBLIC_RPC_URL      ?? "https://soroban-testnet.stellar.org";
const NET_PASS     = process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE ?? "Test SDF Network ; September 2015";
const INDEXER_URL  = process.env.NEXT_PUBLIC_INDEXER_URL  ?? "http://localhost:3001";
const PAGE_SIZE    = 10;

/* ── Data helpers ───────────────────────────────────────────────────────── */
async function fetchPosts(url: string): Promise<{ posts: Post[]; has_more: boolean }> {
  try {
    const res = await fetch(url);
    if (res.ok) return res.json();
  } catch { /* indexer offline */ }
  const mock = mockFetch(url);
  return { posts: mock?.posts ?? [], has_more: mock?.has_more ?? false };
}

async function fetchFollowing(address: string): Promise<string[]> {
  const url = `${INDEXER_URL}/api/follows/${address}/following?limit=100`;
  try {
    const res = await fetch(url);
    if (res.ok) { const d = await res.json(); return d.following ?? []; }
  } catch { /* offline */ }
  return mockFetch(url)?.following ?? [];
}

function relativeTime(post: Post): string {
  const raw = post.created_at ?? post.timestamp;
  if (!raw) return "";
  const ms = Number(raw) < 1e12 ? Number(raw) * 1000 : Number(raw);
  const diff = (Date.now() - ms) / 1000;
  if (diff < 60)  return `${Math.floor(diff)}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

/* ── Post row ───────────────────────────────────────────────────────────── */
function PostRow({
  post,
  address,
  onTip,
}: {
  post: Post;
  address: string | null;
  onTip: (post: Post) => void;
}) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(Number(post.like_count ?? 0));
  const [busy, setBusy] = useState(false);

  const initials = (post.username ?? post.author).slice(1, 3).toUpperCase();
  const handle   = post.username ? `@${post.username}` : `${post.author.slice(0, 6)}…${post.author.slice(-4)}`;
  const time     = relativeTime(post);

  const handleLike = async () => {
    if (!address) return;
    if (busy) return;
    setBusy(true);
    const next = !liked;
    setLiked(next);
    setLikes(c => c + (next ? 1 : -1));
    try {
      await buildSignAndSubmit(
        next ? "like_post" : "unlike_post",
        [Address.fromString(address).toScVal(), nativeToScVal(Number(post.id), { type: "u32" })],
        address,
        { contractId: CONTRACT_ID, rpcUrl: RPC_URL, networkPassphrase: NET_PASS }
      );
    } catch {
      // roll back
      setLiked(!next);
      setLikes(c => c + (next ? -1 : 1));
    } finally {
      setBusy(false);
    }
  };

  return (
    <article
      className="flex gap-3 px-4 py-4 transition-colors"
      style={{ borderBottom: "1px solid var(--border)" }}
    >
      {/* Avatar */}
      <div
        className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white select-none"
        style={{ background: "var(--brand)" }}
        aria-hidden="true"
      >
        {initials}
      </div>

      <div className="min-w-0 flex-1">
        {/* Header */}
        <div className="flex items-baseline gap-2 flex-wrap mb-1">
          <span className="font-semibold text-sm" style={{ color: "var(--fg)" }}>{handle}</span>
          {time && <span className="text-xs" style={{ color: "var(--fg-subtle)" }}>{time}</span>}
        </div>

        {/* Content */}
        <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words" style={{ color: "var(--fg)" }}>
          {post.content}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-5 mt-3">
          {/* Like */}
          <button
            onClick={handleLike}
            disabled={!address || busy}
            className="flex items-center gap-1.5 text-sm transition-colors group disabled:opacity-40"
            style={{ color: liked ? "#f43f5e" : "var(--fg-subtle)" }}
            aria-label={liked ? "Unlike" : "Like"}
          >
            <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill={liked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
            <span>{likes}</span>
          </button>

          {/* Tip */}
          <button
            onClick={() => onTip(post)}
            className="flex items-center gap-1.5 text-sm transition-colors group"
            style={{ color: "var(--fg-subtle)" }}
            aria-label="Tip creator"
          >
            <svg className="w-4 h-4 transition-transform group-hover:scale-110 group-hover:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="group-hover:text-amber-400">{Number(post.tip_total ?? 0)}</span>
          </button>
        </div>
      </div>
    </article>
  );
}

/* ── Tip modal ──────────────────────────────────────────────────────────── */
function TipModal({ post, onClose, address }: { post: Post; onClose: () => void; address: string }) {
  const [token, setToken]   = useState("");
  const [amount, setAmount] = useState("");
  const [errors, setErrors] = useState<{ token?: string; amount?: string }>({});
  const [busy, setBusy]     = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    const tr = validateStellarAddress(token);
    if (!tr.valid) errs.token = tr.error;
    const ar = validateAmount(amount);
    if (!ar.valid) errs.amount = ar.error;
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setBusy(true);
    try {
      await buildSignAndSubmit(
        "tip",
        [
          Address.fromString(address).toScVal(),
          nativeToScVal(Number(post.id), { type: "u64" }),
          Address.fromString(token.trim()).toScVal(),
          nativeToScVal(BigInt(Math.floor(parseFloat(amount) * 10_000_000)), { type: "i128" }),
        ],
        address,
        { contractId: CONTRACT_ID, rpcUrl: RPC_URL, networkPassphrase: NET_PASS }
      );
      onClose();
    } catch { alert("Tip failed. Please try again."); }
    finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}>
      <div className="w-full max-w-md rounded-2xl p-6 shadow-2xl" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold" style={{ color: "var(--fg)" }}>Tip Creator</h2>
          <button onClick={onClose} className="text-lg" style={{ color: "var(--fg-muted)" }} aria-label="Close">✕</button>
        </div>
        <form onSubmit={submit} className="space-y-4" noValidate>
          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="tip-token" style={{ color: "var(--fg)" }}>
              Token Address <span className="text-red-500">*</span>
            </label>
            <input
              id="tip-token" type="text" placeholder="G…"
              value={token} onChange={e => setToken(e.target.value)}
              className="w-full rounded-xl px-3.5 py-2.5 text-sm font-mono focus:outline-none focus:ring-2"
              style={{ background: "var(--bg)", border: `1px solid ${errors.token ? "#ef4444" : "var(--border)"}`, color: "var(--fg)" }}
            />
            <FieldError id="tip-token-error" message={errors.token} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="tip-amount" style={{ color: "var(--fg)" }}>
              Amount <span className="text-red-500">*</span>
            </label>
            <input
              id="tip-amount" type="number" step="any" placeholder="0.00"
              value={amount} onChange={e => setAmount(e.target.value)}
              className="w-full rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2"
              style={{ background: "var(--bg)", border: `1px solid ${errors.amount ? "#ef4444" : "var(--border)"}`, color: "var(--fg)" }}
            />
            <FieldError id="tip-amount-error" message={errors.amount} />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-semibold" style={{ border: "1px solid var(--border)", color: "var(--fg)" }}>Cancel</button>
            <button type="submit" disabled={busy} className="px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50" style={{ background: "var(--brand)" }}>
              {busy ? "Sending…" : "Send Tip"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Empty state ────────────────────────────────────────────────────────── */
function EmptyState({ tab, onSwitch, onConnect }: { tab: "explore" | "following"; onSwitch: () => void; onConnect: () => void }) {
  if (tab === "following") {
    return (
      <div className="px-4 py-16 text-center">
        <div className="mx-auto mb-4 w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "var(--bg-muted)" }}>
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: "var(--fg-muted)" }} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
        </div>
        <p className="font-semibold mb-1" style={{ color: "var(--fg)" }}>Nobody followed yet</p>
        <p className="text-sm mb-5" style={{ color: "var(--fg-muted)" }}>Follow some creators to see their posts here.</p>
        <button onClick={onSwitch} className="text-sm font-semibold" style={{ color: "var(--brand)" }}>Browse creators →</button>
      </div>
    );
  }
  return (
    <div className="px-4 py-16 text-center">
      <p className="font-semibold mb-1" style={{ color: "var(--fg)" }}>No posts yet</p>
      <p className="text-sm" style={{ color: "var(--fg-muted)" }}>Be the first to post something.</p>
    </div>
  );
}

/* ── Main page ──────────────────────────────────────────────────────────── */
export default function FeedPage() {
  const { address, connected, connect } = useWallet();

  const [tab, setTab]           = useState<"explore" | "following">("explore");
  const [posts, setPosts]       = useState<Post[]>([]);
  const [loading, setLoading]   = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [tipping, setTipping]   = useState<Post | null>(null);
  const [newPostsToast, setNewPostsToast] = useState(false);

  // Stable cursor ref — never in dep arrays
  const cursorRef    = useRef<number | null>(null);
  const loadingRef   = useRef(false);
  const mountedRef   = useRef(true);
  const wsRef        = useRef<WebSocket | null>(null);
  const sentinelRef  = useRef<HTMLDivElement>(null);

  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);

  /* ── Fetch ────────────────────────────────────────────────────────── */
  const load = useCallback(async (
    currentTab: "explore" | "following",
    currentAddress: string | null,
    cursor: number | null,
    append: boolean
  ) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    if (!append) setLoading(true);
    else setLoadingMore(true);
    setError(null);

    try {
      let nextPosts: Post[] = [];
      let nextHasMore = false;
      const cursorQ = cursor != null ? `&cursor=${cursor}` : "";

      if (currentTab === "explore") {
        const data = await fetchPosts(`${INDEXER_URL}/api/posts?limit=${PAGE_SIZE}${cursorQ}`);
        nextPosts   = data.posts;
        nextHasMore = data.has_more;
      } else {
        if (!currentAddress) {
          nextPosts   = [];
          nextHasMore = false;
        } else {
          const following = await fetchFollowing(currentAddress);
          if (following.length === 0) {
            nextPosts   = [];
            nextHasMore = false;
          } else {
            const results = await Promise.all(
              following.map(addr =>
                fetchPosts(`${INDEXER_URL}/api/posts?author=${addr}&limit=10${cursorQ}`)
              )
            );
            const all = results.flatMap(r => r.posts).sort(
              (a, b) => Number(b.created_at ?? b.timestamp ?? 0) - Number(a.created_at ?? a.timestamp ?? 0)
            );
            nextPosts   = all.slice(0, PAGE_SIZE);
            nextHasMore = all.length > PAGE_SIZE;
          }
        }
      }

      if (!mountedRef.current) return;
      setPosts(prev => append ? [...prev, ...nextPosts] : nextPosts);
      setHasMore(nextHasMore);
      if (nextPosts.length > 0) {
        const last = nextPosts[nextPosts.length - 1];
        cursorRef.current = Number(last.created_at ?? last.timestamp ?? 0);
      }
    } catch (err) {
      if (mountedRef.current) setError(err instanceof Error ? err.message : "Failed to load feed");
    } finally {
      if (mountedRef.current) { setLoading(false); setLoadingMore(false); }
      loadingRef.current = false;
    }
  }, []); // no deps — receives everything as args

  // Load on tab change
  useEffect(() => {
    cursorRef.current = null;
    setPosts([]);
    setHasMore(false);
    setNewPostsToast(false);
    load(tab, address, null, false);
  }, [tab, address, load]);

  // Infinite scroll
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(entries => {
      if (entries[0]?.isIntersecting && hasMore && !loadingRef.current) {
        load(tab, address, cursorRef.current, true);
      }
    }, { rootMargin: "200px" });
    observer.observe(el);
    return () => observer.unobserve(el);
  }, [hasMore, tab, address, load]);

  // WebSocket — new posts toast
  useEffect(() => {
    const wsUrl = INDEXER_URL.replace(/^http/, "ws") + "/ws";
    let timer: ReturnType<typeof setTimeout>;

    const connect = () => {
      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;
        ws.onopen = () => ws.send(JSON.stringify({ action: "subscribe", types: ["PostCreated"] }));
        ws.onmessage = e => {
          try { if (JSON.parse(e.data).type === "PostCreated") setNewPostsToast(true); } catch {}
        };
        ws.onclose = () => { timer = setTimeout(connect, 5000); };
        ws.onerror = () => ws.close();
      } catch {}
    };

    connect();
    return () => {
      clearTimeout(timer);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, []);

  const refresh = () => {
    cursorRef.current = null;
    setNewPostsToast(false);
    load(tab, address, null, false);
  };

  /* ── Render ───────────────────────────────────────────────────────── */
  return (
    <div className="mx-auto max-w-2xl" style={{ minHeight: "100dvh" }}>
      {/* Sticky tab bar */}
      <div
        className="sticky top-[57px] z-20 flex"
        style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)" }}
      >
        {(["explore", "following"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-3.5 text-sm font-semibold capitalize transition-colors relative"
            style={{ color: tab === t ? "var(--fg)" : "var(--fg-muted)" }}
            aria-selected={tab === t}
          >
            {t === "explore" ? "For You" : "Following"}
            {tab === t && (
              <span
                className="absolute bottom-0 left-1/4 right-1/4 h-0.5 rounded-full"
                style={{ background: "var(--brand)" }}
              />
            )}
          </button>
        ))}
      </div>

      {/* New posts toast */}
      {newPostsToast && (
        <div className="sticky top-[105px] z-10 flex justify-center py-2">
          <button
            onClick={refresh}
            className="text-sm font-semibold px-4 py-1.5 rounded-full text-white shadow-lg"
            style={{ background: "var(--brand)" }}
          >
            ↑ New posts
          </button>
        </div>
      )}

      {/* Following — wallet gate */}
      {tab === "following" && !connected && (
        <div className="px-4 py-16 text-center">
          <p className="font-semibold mb-2" style={{ color: "var(--fg)" }}>Connect your wallet</p>
          <p className="text-sm mb-5" style={{ color: "var(--fg-muted)" }}>
            Connect to see posts from people you follow.
          </p>
          <button
            onClick={connect}
            className="px-5 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: "var(--brand)" }}
          >
            Connect wallet
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mx-4 mt-4 px-4 py-3 rounded-xl text-sm" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" }} role="alert">
          {error}
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div>
          {[1, 2, 3, 4, 5].map(i => (
            <PostCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Posts */}
      {!loading && !(tab === "following" && !connected) && (
        posts.length === 0
          ? <EmptyState tab={tab} onSwitch={() => setTab("explore")} onConnect={connect} />
          : <div>
              {posts.map(post => (
                <PostRow
                  key={post.id}
                  post={post}
                  address={address}
                  onTip={setTipping}
                />
              ))}

              {/* Infinite scroll sentinel */}
              <div ref={sentinelRef} className="py-4 flex justify-center">
                {loadingMore && (
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24" style={{ color: "var(--fg-subtle)" }} aria-label="Loading more">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
              </div>
            </div>
      )}

      {/* Tip modal */}
      {tipping && address && (
        <TipModal post={tipping} address={address} onClose={() => setTipping(null)} />
      )}
    </div>
  );
}
