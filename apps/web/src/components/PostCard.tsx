"use client";

import { useEffect, useState } from "react";

export interface Post {
  id: string | number;
  author: string;
  username?: string;
  content: string;
  tip_total?: string | number;
  like_count?: string | number;
  timestamp?: string | number;
  created_at?: string;
  imageUrl?: string;
}

interface PostCardProps {
  post: Post;
  query?: string;
  onLike?: () => void;
  onTip?: () => void;
  isLiked?: boolean;
  isTipping?: boolean;
  tourAnchor?: boolean;
  disabled?: boolean;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightText(text: string, query = "") {
  const trimmed = query.trim();
  if (!trimmed) return text;

  const parts = text.split(new RegExp(`(${escapeRegExp(trimmed)})`, "gi"));
  return parts.map((part, index) =>
    part.toLowerCase() === trimmed.toLowerCase() ? (
      <mark
        key={`${part}-${index}`}
        className="rounded bg-yellow-300 px-1 text-black font-semibold"
      >
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export function getPostDate(post: Post): Date | null {
  const raw = post.created_at ?? post.timestamp;
  if (raw === undefined || raw === null || raw === "") return null;

  const numeric = Number(raw);
  if (Number.isFinite(numeric)) {
    return new Date(numeric < 1_000_000_000_000 ? numeric * 1000 : numeric);
  }

  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function getPostTipTotal(post: Post): number {
  const value = Number(post.tip_total ?? 0);
  return Number.isFinite(value) ? value : 0;
}

export function getPostLikeCount(post: Post): number {
  const value = Number(post.like_count ?? 0);
  return Number.isFinite(value) ? value : 0;
}

function formatDate(post: Post): string {
  const date = getPostDate(post);
  return date ? date.toLocaleDateString() : "Unknown date";
}

export function formatAuthor(author: string): string {
  return author.length > 16 ? `${author.slice(0, 6)}...${author.slice(-4)}` : author;
}

export function PostCard({
  post,
  query,
  onLike,
  onTip,
  isLiked,
  isTipping,
  tourAnchor,
  disabled = false,
}: PostCardProps) {
  const likeCount = getPostLikeCount(post);
  const [animateLikeCount, setAnimateLikeCount] = useState(false);
  const [previousLikeCount, setPreviousLikeCount] = useState(likeCount);

  useEffect(() => {
    if (likeCount === previousLikeCount) {
      return;
    }

    setAnimateLikeCount(true);
    setPreviousLikeCount(likeCount);

    const timeout = window.setTimeout(() => {
      setAnimateLikeCount(false);
    }, 220);

    return () => window.clearTimeout(timeout);
  }, [likeCount, previousLikeCount]);

  return (
    <article
      className="border-b px-4 py-4 transition-colors hover:bg-[var(--bg-subtle)] cursor-pointer"
      style={{ borderColor: "var(--border)" }}
      data-tour={tourAnchor ? "post-actions" : undefined}
    >
      {/* Author row */}
      <div className="flex items-start gap-3 mb-2">
        {/* Avatar */}
        <div
          className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white"
          style={{ background: "var(--brand)" }}
          aria-hidden="true"
        >
          {(post.username ?? post.author).slice(1, 3).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="font-semibold text-sm" style={{ color: "var(--fg)" }}>
              {post.username ? `@${post.username}` : formatAuthor(post.author)}
            </span>
            <span className="text-xs" style={{ color: "var(--fg-subtle)" }}>
              {formatDate(post)}
            </span>
          </div>
          {/* Content */}
          <p
            className="mt-1.5 whitespace-pre-wrap break-words leading-relaxed text-[15px]"
            style={{ color: "var(--fg)" }}
          >
            {highlightText(post.content, query)}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-6 pl-12">
        {/* Like */}
        <button
          onClick={onLike}
          disabled={disabled}
          className="flex items-center gap-1.5 text-sm transition-colors disabled:opacity-40 group"
          style={{ color: isLiked ? "#f43f5e" : "var(--fg-subtle)" }}
          aria-label={isLiked ? "Unlike post" : "Like post"}
        >
          <svg
            className="w-4 h-4 transition-transform group-hover:scale-110"
            fill={isLiked ? "currentColor" : "none"}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
          <span className={animateLikeCount ? "like-count-animate" : ""}>{likeCount}</span>
        </button>

        {/* Tip */}
        <button
          onClick={onTip}
          disabled={disabled || isTipping}
          className="flex items-center gap-1.5 text-sm transition-colors disabled:opacity-40 group"
          style={{ color: "var(--fg-subtle)" }}
          aria-label="Tip creator"
        >
          <svg
            className="w-4 h-4 transition-transform group-hover:scale-110 group-hover:text-amber-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="group-hover:text-amber-400">{getPostTipTotal(post)}</span>
        </button>
      </div>
    </article>
  );
}

export function PostCardSkeleton() {
  return (
    <div className="border-b px-4 py-4 animate-pulse" style={{ borderColor: "var(--border)" }}>
      <div className="flex items-start gap-3">
        <div className="skeleton w-9 h-9 rounded-full shrink-0" />
        <div className="flex-1 space-y-2.5">
          <div className="flex gap-2">
            <div className="skeleton h-3.5 w-24 rounded" />
            <div className="skeleton h-3.5 w-16 rounded" />
          </div>
          <div className="skeleton h-3.5 w-full rounded" />
          <div className="skeleton h-3.5 w-4/5 rounded" />
          <div className="skeleton h-3.5 w-1/2 rounded" />
          <div className="flex gap-6 pt-1">
            <div className="skeleton h-3.5 w-10 rounded" />
            <div className="skeleton h-3.5 w-10 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
