"use client";
import useSWR from "swr";
import Image from "next/image";

interface Creator {
  id: string;
  nickname: string;
  avatar?: string | null;
  points: number;
}

export default function TopCreatorsCard() {
  const fetcher = (url: string): Promise<{ creators: Creator[] }> =>
    fetch(url).then((r) => r.json());
  const { data } = useSWR("/api/top/creators?days=7", fetcher);
  if (!data) return null;
  return (
    <div className="p-4 border rounded-md">
      <h3 className="font-bold mb-2">Top alkotók</h3>
      <ol className="space-y-2">
        {data.creators.map((c, i) => (
          <li key={c.id} className="flex items-center gap-2">
            <span className="w-5 text-right">{i + 1}.</span>
            {c.avatar ? (
              <Image
                src={c.avatar}
                alt={c.nickname}
                width={24}
                height={24}
                className="rounded-full"
              />
            ) : (
              <span className="w-6 h-6 inline-flex items-center justify-center rounded-full bg-muted text-xs">
                {c.nickname.slice(0, 2).toUpperCase()}
              </span>
            )}
            <span className="flex-1">{c.nickname}</span>
            <span className="font-medium">{c.points}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
