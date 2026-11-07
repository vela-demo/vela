import { Pool } from "pg";

export interface CreatorStats {
  creatorAddress: string;
  totalTips: bigint;
  postCount: bigint;
  /** Net follower change in the window. Can be negative if more unfollows than follows occurred. */
  followerDelta: bigint;
  uniqueTippers: number;
}

export class CreatorStatsValidationError extends Error {
  constructor(
    message: string,
    public readonly field: string,
    public readonly value: unknown
  ) {
    super(message);
    this.name = "CreatorStatsValidationError";
  }
}

function validateCreatorStats(stats: CreatorStats): void {
  if (typeof stats.creatorAddress !== "string" || stats.creatorAddress.length === 0) {
    throw new CreatorStatsValidationError(
      `creatorAddress must be a non-empty string, got ${typeof stats.creatorAddress}`,
      "creatorAddress",
      stats.creatorAddress
    );
  }

  if (typeof stats.totalTips !== "bigint" || stats.totalTips < 0n) {
    throw new CreatorStatsValidationError(
      `totalTips must be a non-negative bigint, got ${stats.totalTips}`,
      "totalTips",
      stats.totalTips
    );
  }

  if (typeof stats.postCount !== "bigint" || stats.postCount < 0n) {
    throw new CreatorStatsValidationError(
      `postCount must be a non-negative bigint, got ${stats.postCount}`,
      "postCount",
      stats.postCount
    );
  }

  // followerDelta is intentionally signed — net unfollows produce a negative value.
  if (typeof stats.followerDelta !== "bigint") {
    throw new CreatorStatsValidationError(
      `followerDelta must be a bigint, got ${typeof stats.followerDelta}`,
      "followerDelta",
      stats.followerDelta
    );
  }

  if (!Number.isInteger(stats.uniqueTippers) || stats.uniqueTippers < 0) {
    throw new CreatorStatsValidationError(
      `uniqueTippers must be a non-negative integer, got ${stats.uniqueTippers}`,
      "uniqueTippers",
      stats.uniqueTippers
    );
  }
}

/**
 * Queries the indexer database for per-creator analytics in the given ledger window.
 *
 * follower_delta is computed as follows gained in the window (new rows in the `follows`
 * table whose `created_at` ledger falls within the range) minus the follower count
 * at window start (from `follow_counts`) minus the follower count at window end.
 * Because the indexer schema records unfollows as a DELETE on the `follows` table
 * (migration 003) rather than a separate table, we approximate the delta as:
 *
 *   new follows in window  -  (follow_count_before_window - current follow_count)
 *
 * This reduces to: new_follows - lost_follows, where lost_follows = prior_count - current_count
 * for any creator who had followers before the window. For creators with no prior followers
 * it is simply the count of new follows.
 */
export async function fetchCreatorStats(
  db: Pool,
  windowStart: bigint,
  windowEnd: bigint
): Promise<CreatorStats[]> {
  const result = await db.query<{
    creator: string;
    total_tips: string;
    post_count: string;
    new_follows: string;
    unique_tippers: string;
  }>(
    `
    SELECT
      p.author                              AS creator,
      COALESCE(SUM(t.amount), 0)            AS total_tips,
      COUNT(DISTINCT p.id)                  AS post_count,
      COUNT(DISTINCT f.follower)            AS new_follows,
      COUNT(DISTINCT t.tipper)              AS unique_tippers
    FROM posts p
    LEFT JOIN tips t
      ON  t.post_id = p.id
      AND t.ledger_sequence BETWEEN $1 AND $2
    LEFT JOIN follows f
      ON  f.followee = p.author
      AND f.created_at BETWEEN $1 AND $2
    WHERE p.ledger_sequence BETWEEN $1 AND $2
    GROUP BY p.author
    `,
    [windowStart.toString(), windowEnd.toString()]
  );

  // Build a second query to get the current total followers vs followers before the window,
  // so we can derive lost followers = (count before window) - (count now) + new_follows.
  // We use follow_counts for the current total and a subquery for the prior total.
  const followDeltaResult = await db.query<{
    followee: string;
    current_followers: string;
    prior_followers: string;
  }>(
    `
    SELECT
      fc.user_address                                           AS followee,
      fc.followers_count                                        AS current_followers,
      (SELECT COUNT(*) FROM follows f2
        WHERE f2.followee = fc.user_address
          AND f2.created_at < $1)                              AS prior_followers
    FROM follow_counts fc
    WHERE fc.user_address = ANY($3::text[])
    `,
    [
      windowStart.toString(),
      windowEnd.toString(),
      result.rows.map((r) => r.creator),
    ]
  );

  const deltaByCreator = new Map<string, bigint>();
  for (const row of followDeltaResult.rows) {
    const current = BigInt(row.current_followers);
    const prior = BigInt(row.prior_followers);
    // net = current - prior; this accounts for both new follows and lost follows
    deltaByCreator.set(row.followee, current - prior);
  }

  return result.rows.map((row) => {
    // Fall back to new_follows count if follow_counts doesn't have an entry yet
    const followerDelta = deltaByCreator.get(row.creator) ?? BigInt(row.new_follows);

    const stats: CreatorStats = {
      creatorAddress: row.creator,
      totalTips: BigInt(row.total_tips),
      postCount: BigInt(row.post_count),
      followerDelta,
      uniqueTippers: parseInt(row.unique_tippers, 10),
    };
    validateCreatorStats(stats);
    return stats;
  });
}
