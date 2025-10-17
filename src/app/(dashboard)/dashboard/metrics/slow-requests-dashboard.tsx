"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { ColumnDef } from "@tanstack/react-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";

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
  summary: {
    totalCount: number;
    averageDurationMs: number;
    p50: number | null;
    p95: number | null;
    p99: number | null;
  };
  daily: {
    date: string;
    averageDurationMs: number;
    count: number;
    maxDurationMs: number;
  }[];
  endpoints: {
    url: string;
    count: number;
    averageDurationMs: number;
    maxDurationMs: number;
    lastSeenAt: string | null;
  }[];
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

const numberFormatter = new Intl.NumberFormat("hu-HU");
const durationFormatter = (value: number | null | undefined) => {
  if (value == null || Number.isNaN(value)) {
    return "-";
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(2)} s`;
  }
  return `${Math.round(value)} ms`;
};

const dateTimeFormatter = new Intl.DateTimeFormat("hu-HU", {
  dateStyle: "short",
  timeStyle: "medium",
});

const parseDateTime = (value: string | null | undefined) => {
  if (!value) {
    return null;
  }

  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const withTimezone = /([+-]\d\d:?\d\d|Z)$/.test(normalized)
    ? normalized
    : `${normalized}Z`;

  const parsed = new Date(withTimezone);
  if (Number.isNaN(parsed.getTime())) {
    const fallback = new Date(value);
    return Number.isNaN(fallback.getTime()) ? null : fallback;
  }

  return parsed;
};

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) {
      throw new Error("Nem sikerült betölteni a statisztikákat");
    }
    return res.json() as Promise<SlowRequestResponse>;
  });

const toDateInput = (date: Date) => date.toISOString().slice(0, 10);

const defaultEnd = new Date();
const defaultStart = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000);

export default function SlowRequestsDashboard() {
  const [filters, setFilters] = useState({
    start: toDateInput(defaultStart),
    end: toDateInput(defaultEnd),
    url: "",
    user: "",
  });

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.start) {
      params.set("start", filters.start);
    }
    if (filters.end) {
      params.set("end", filters.end);
    }
    if (filters.url) {
      params.set("url", filters.url);
    }
    if (filters.user) {
      params.set("user", filters.user);
    }
    params.set("page", `${pageIndex + 1}`);
    params.set("pageSize", `${pageSize}`);
    return `/api/admin/slow-requests?${params.toString()}`;
  }, [filters, pageIndex, pageSize]);

  const { data, error, isLoading } = useSWR<SlowRequestResponse>(query, fetcher, {
    keepPreviousData: true,
  });

  const columns = useMemo<ColumnDef<SlowRequestItem>[]>(
    () => [
      {
        accessorKey: "createdAt",
        header: "Időpont",
        cell: ({ row }) => {
          const date = parseDateTime(row.original.createdAt);
          return date ? dateTimeFormatter.format(date) : "-";
        },
      },
      {
        accessorKey: "url",
        header: "Végpont",
        cell: ({ row }) => (
          <a
            href={row.original.url}
            target="_blank"
            rel="noreferrer"
            className="text-primary underline break-all"
          >
            {row.original.url}
          </a>
        ),
      },
      {
        accessorKey: "durationMs",
        header: "Időtartam",
        cell: ({ row }) => durationFormatter(row.original.durationMs),
      },
      {
        accessorKey: "userId",
        header: "Felhasználó",
        cell: ({ row }) => {
          const { userNickname, userEmail, userId } = row.original;
          return userNickname || userEmail || userId || "Ismeretlen";
        },
      },
      {
        accessorKey: "sessionHash",
        header: "Munkamenet",
        cell: ({ row }) => row.original.sessionHash?.slice(0, 10) ?? "-",
      },
    ],
    []
  );

  const chartData = useMemo(
    () =>
      (data?.daily ?? []).map((item) => ({
        date: item.date,
        avgMs: item.averageDurationMs,
        count: item.count,
      })),
    [data?.daily]
  );

  const resetFilters = () => {
    setFilters({
      start: toDateInput(defaultStart),
      end: toDateInput(defaultEnd),
      url: "",
      user: "",
    });
    setPageIndex(0);
  };

  const summary = data?.summary;

  return (
    <div className="space-y-6 px-4 pb-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Lassú kérések metrikák</h1>
          <p className="text-muted-foreground">
            Az alábbi áttekintés segít azonosítani a problémás végpontokat és felhasználói mintákat.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Szűrők</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="start">Kezdő dátum</Label>
              <Input
                id="start"
                type="date"
                value={filters.start}
                onChange={(event) => {
                  setFilters((prev) => ({ ...prev, start: event.target.value }));
                  setPageIndex(0);
                }}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="end">Záró dátum</Label>
              <Input
                id="end"
                type="date"
                value={filters.end}
                onChange={(event) => {
                  setFilters((prev) => ({ ...prev, end: event.target.value }));
                  setPageIndex(0);
                }}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="url">URL szűrő</Label>
              <Input
                id="url"
                placeholder="Részleges egyezés engedélyezett"
                value={filters.url}
                onChange={(event) => {
                  setFilters((prev) => ({ ...prev, url: event.target.value }));
                  setPageIndex(0);
                }}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="user">Felhasználó azonosító</Label>
              <Input
                id="user"
                placeholder="Felhasználó ID vagy email"
                value={filters.user}
                onChange={(event) => {
                  setFilters((prev) => ({ ...prev, user: event.target.value }));
                  setPageIndex(0);
                }}
              />
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              A szűrők automatikusan alkalmazásra kerülnek módosítás után.
            </p>
            <Button variant="outline" onClick={resetFilters}>
              Szűrők visszaállítása
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle>Hiba történt</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">
              Nem sikerült betölteni a lassú kérések adatait. Próbáld meg később újra.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Card>
          <CardHeader>
            <CardTitle>Összes lassú kérés</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              {summary ? numberFormatter.format(summary.totalCount) : isLoading ? "…" : "0"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Átlagos idő</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              {summary ? durationFormatter(summary.averageDurationMs) : isLoading ? "…" : "-"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>p50</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              {summary ? durationFormatter(summary.p50) : isLoading ? "…" : "-"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>p95</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              {summary ? durationFormatter(summary.p95) : isLoading ? "…" : "-"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>p99</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              {summary ? durationFormatter(summary.p99) : isLoading ? "…" : "-"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Napi átlagok</CardTitle>
        </CardHeader>
        <CardContent className="h-[320px]">
          {isLoading && !data ? (
            <p>Betöltés…</p>
          ) : chartData.length === 0 ? (
            <p className="text-muted-foreground">Nincs adat a megadott szűrőkre.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                <XAxis dataKey="date" tickLine={false} />
                <YAxis tickFormatter={(value) => durationFormatter(value as number)} tickLine={false} width={120} />
                <Tooltip
                  formatter={(value: number) => [durationFormatter(value), "Átlag idő"]}
                  labelFormatter={(label) => `Dátum: ${label}`}
                />
                <Line type="monotone" dataKey="avgMs" stroke="#2563eb" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Végpont statisztikák</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading && !data ? (
            <p>Betöltés…</p>
          ) : (data?.endpoints?.length ?? 0) === 0 ? (
            <p className="text-muted-foreground">Nem található végpont a feltételeknek megfelelően.</p>
          ) : (
            <div className="space-y-3">
              {data?.endpoints?.map((endpoint) => {
                const lastSeenDate = parseDateTime(endpoint.lastSeenAt);

                return (
                  <div key={endpoint.url} className="rounded-md border p-3">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-medium break-all">{endpoint.url}</p>
                        <p className="text-sm text-muted-foreground">
                          Utolsó előfordulás: {lastSeenDate ? dateTimeFormatter.format(lastSeenDate) : "ismeretlen"}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <span>Darabszám: {numberFormatter.format(endpoint.count)}</span>
                        <span>Átlag: {durationFormatter(endpoint.averageDurationMs)}</span>
                        <span>Maximum: {durationFormatter(endpoint.maxDurationMs)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Kérések részletei</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading && !data ? (
            <p>Betöltés…</p>
          ) : (
            <DataTable
              columns={columns}
              data={data?.requests.items ?? []}
              pageCount={data?.requests.pagination.pageCount ?? 0}
              pageIndex={pageIndex}
              pageSize={pageSize}
              onPageChange={(nextPage) => setPageIndex(Math.max(0, nextPage))}
              onPageSizeChange={(nextSize) => setPageSize(nextSize)}
              totalCount={data?.requests.pagination.total ?? 0}
              itemNameSingular="kérés"
              itemNamePlural="kérések"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
