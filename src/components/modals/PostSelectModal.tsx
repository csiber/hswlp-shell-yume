"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";

interface Post {
  id: string;
  content: string;
  created_at: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (postId: string) => void;
}

export default function PostSelectModal({ open, onOpenChange, onSelect }: Props) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/user/posts", { credentials: "include" });
        if (res.ok) {
          const data = (await res.json()) as { posts: Post[] };
          setPosts(data.posts);
        } else {
          setPosts([]);
        }
      } catch {
        setPosts([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Kérlek válaszd ki melyik posztot szeretnéd kiemelni
          </DialogTitle>
        </DialogHeader>
        {loading ? (
          <p>Betöltés...</p>
        ) : posts.length === 0 ? (
          <p>Még nincs feltöltött posztod a kiemeléshez.</p>
        ) : (
          <div className="grid max-h-[60vh] grid-cols-1 gap-3 overflow-y-auto">
            {posts.map((post) => (
              <Card
                key={post.id}
                className="cursor-pointer hover:bg-muted"
                onClick={() => onSelect(post.id)}
              >
                <CardContent className="p-3 text-sm">{post.content}</CardContent>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
