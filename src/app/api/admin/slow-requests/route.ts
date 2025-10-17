import { NextRequest } from "next/server";
import { requireAdmin } from "@/utils/auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { jsonResponse } from "@/utils/api";

interface SlowRequestSummary {
  totalCount: number;
  averageDurationMs: number;
  p50: number | null;
  p95: number | null;
  p99: number | null;
}

interface SlowRequestDailyStat {
  date: string;
  averageDurationMs: number;
  count: number;
  maxDurationMs: number;
}

interface SlowRequestEndpointStat {
  url: string;
  count: number;
  averageDurationMs: number;
  maxDurationMs: number;
  lastSeenAt: string | null;
}

interface SlowRequestItem {
  id: string;
  url: string;
  durationMs: number;
  userId: string | null;
  sessionHash: string | null;
  createdAt: string;
  userNickname: string | null;
  userEmail: string | null;
}

interface SlowRequestResponse {
  summary: SlowRequestSummary;
  daily: SlowRequestDailyStat[];
  endpoints: SlowRequestEndpointStat[];
  requests: {
    items: SlowRequestItem[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      pageCount: number;
    };
  };
}

function toSqlDateString(date: Date) {
  const pad = (value: number) => value.toString().padStart(2, "0");
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
}

function parseDate(value: string | null, options: { endOfDay?: boolean } = {}) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  if (options.endOfDay) {
    const end = new Date(parsed);
    end.setUTCHours(23, 59, 59, 999);
    return end;
  }

  const start = new Date(parsed);
  start.setUTCHours(0, 0, 0, 0);
  return start;
}

function percentile(values: number[], percentileRank: number) {
  if (!values.length) {
    return null;
  }

  const sorted = [...values].sort((a, b) => a - b);
  if (sorted.length === 1) {
    return sorted[0];
  }

  const index = Math.floor((sorted.length - 1) * percentileRank);
  return sorted[index] ?? null;
}

export async function GET(request: NextRequest) {
  await requireAdmin();
  const { env } = getCloudflareContext();

  const { searchParams } = new URL(request.url);
  const startParam = searchParams.get("start");
  const endParam = searchParams.get("end");
  const urlFilter = searchParams.get("url")?.trim();
  const userFilter = searchParams.get("user")?.trim();

  const pageParam = Number.parseInt(searchParams.get("page") ?? "1", 10);
  const pageSizeParam = Number.parseInt(searchParams.get("pageSize") ?? "20", 10);

  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
  const pageSize = Math.min(Math.max(Number.isFinite(pageSizeParam) ? pageSizeParam : 20, 10), 100);
  const offset = (page - 1) * pageSize;

  const startDate = parseDate(startParam);
  const endDate = parseDate(endParam, { endOfDay: true });

  const conditions: string[] = [];
  const bindings: (string | number)[] = [];

  if (startDate) {
    conditions.push("datetime(slog.created_at) >= datetime(?)");
    bindings.push(toSqlDateString(startDate));
  }

  if (endDate) {
    conditions.push("datetime(slog.created_at) <= datetime(?)");
    bindings.push(toSqlDateString(endDate));
  }

  if (urlFilter) {
    conditions.push("slog.url LIKE ?");
    bindings.push(`%${urlFilter}%`);
  }

  if (userFilter) {
    conditions.push("slog.user_id = ?");
    bindings.push(userFilter);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const totalRow = await env.DB.prepare(
    `SELECT COUNT(*) AS total FROM slow_request_logs AS slog ${whereClause}`
  )
    .bind(...bindings)
    .first<{ total: number }>();

  const totalCount = Number(totalRow?.total ?? 0);

  const averageRow = await env.DB.prepare(
    `SELECT AVG(slog.duration_ms) AS avgDuration FROM slow_request_logs AS slog ${whereClause}`
  )
    .bind(...bindings)
    .first<{ avgDuration: number | null }>();

  const durationRows = await env.DB.prepare(
    `SELECT slog.duration_ms AS durationMs FROM slow_request_logs AS slog ${whereClause}`
  )
    .bind(...bindings)
    .all<{ durationMs: number }>();

  const durations = (durationRows.results ?? [])
    .map((row) => Number(row.durationMs))
    .filter((value) => Number.isFinite(value));

  const summary: SlowRequestSummary = {
    totalCount,
    averageDurationMs: Number.isFinite(averageRow?.avgDuration ?? NaN)
      ? Math.round(Number(averageRow?.avgDuration ?? 0))
      : 0,
    p50: percentile(durations, 0.5),
    p95: percentile(durations, 0.95),
    p99: percentile(durations, 0.99),
  };

  const dailyRows = await env.DB.prepare(
    `SELECT strftime('%Y-%m-%d', slog.created_at) AS day,
            AVG(slog.duration_ms) AS avgDuration,
            COUNT(*) AS count,
            MAX(slog.duration_ms) AS maxDuration
       FROM slow_request_logs AS slog
       ${whereClause}
      GROUP BY day
      ORDER BY day`
  )
    .bind(...bindings)
    .all<{
      day: string;
      avgDuration: number;
      count: number;
      maxDuration: number;
    }>();

  const daily: SlowRequestDailyStat[] = (dailyRows.results ?? []).map((row) => ({
    date: row.day,
    averageDurationMs: Math.round(Number(row.avgDuration ?? 0)),
    count: Number(row.count ?? 0),
    maxDurationMs: Number(row.maxDuration ?? 0),
  }));

  const endpointRows = await env.DB.prepare(
    `SELECT slog.url AS url,
            COUNT(*) AS count,
            AVG(slog.duration_ms) AS avgDuration,
            MAX(slog.duration_ms) AS maxDuration,
            MAX(slog.created_at) AS lastSeen
       FROM slow_request_logs AS slog
       ${whereClause}
      GROUP BY slog.url
      ORDER BY count DESC
      LIMIT 50`
  )
    .bind(...bindings)
    .all<{
      url: string;
      count: number;
      avgDuration: number;
      maxDuration: number;
      lastSeen: string | null;
    }>();

  const endpoints: SlowRequestEndpointStat[] = (endpointRows.results ?? []).map((row) => ({
    url: row.url,
    count: Number(row.count ?? 0),
    averageDurationMs: Math.round(Number(row.avgDuration ?? 0)),
    maxDurationMs: Number(row.maxDuration ?? 0),
    lastSeenAt: row.lastSeen ?? null,
  }));

  const requestRows = await env.DB.prepare(
    `SELECT slog.id AS id,
            slog.url AS url,
            slog.duration_ms AS durationMs,
            slog.user_id AS userId,
            slog.session_hash AS sessionHash,
            slog.created_at AS createdAt,
            u.nickname AS userNickname,
            u.email AS userEmail
       FROM slow_request_logs AS slog
  LEFT JOIN user AS u ON u.id = slog.user_id
       ${whereClause}
      ORDER BY datetime(slog.created_at) DESC
      LIMIT ? OFFSET ?`
  )
    .bind(...bindings, pageSize, offset)
    .all<SlowRequestItem>();

  const items: SlowRequestItem[] = (requestRows.results ?? []).map((row) => ({
    id: row.id,
    url: row.url,
    durationMs: Number(row.durationMs ?? 0),
    userId: row.userId ?? null,
    sessionHash: row.sessionHash ?? null,
    createdAt: row.createdAt,
    userNickname: row.userNickname ?? null,
    userEmail: row.userEmail ?? null,
  }));

  const response: SlowRequestResponse = {
    summary,
    daily,
    endpoints,
    requests: {
      items,
      pagination: {
        page,
        pageSize,
        total: totalCount,
        pageCount: totalCount > 0 ? Math.ceil(totalCount / pageSize) : 0,
      },
    },
  };

  return jsonResponse(response);
}
