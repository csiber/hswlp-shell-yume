"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";

interface Upload {
  id: string
  title: string
  created_at: string
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (postId: string) => void;
}

export default function PostSelectModal({ open, onOpenChange, onSelect }: Props) {
  const [posts, setPosts] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/my-uploads");
        if (res.ok) {
          const data = (await res.json()) as { uploads: Upload[] }
          setPosts(data.uploads)
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
          <DialogTitle>Please select which post you want to feature</DialogTitle>
        </DialogHeader>
        {loading ? (
          <p>Loading...</p>
        ) : posts.length === 0 ? (
          <p>You have no uploads.</p>
        ) : (
          <div className="grid max-h-[60vh] grid-cols-1 gap-3 overflow-y-auto">
            {posts.map((post) => (
              <Card
                key={post.id}
                className="cursor-pointer hover:bg-muted"
                onClick={() => onSelect(post.id)}
              >
                <CardContent className="p-3 text-sm">
                  <div className="font-medium">{post.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(post.created_at).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
