"use client"

import { Facebook, Twitter, Copy } from "lucide-react";
import { SiReddit } from "@icons-pack/react-simple-icons";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ShareButtonsProps {
  title: string;
  url: string;
  className?: string;
  referrerId?: string;
}

export default function ShareButtons({ title, url, className, referrerId }: ShareButtonsProps) {
  const shareUrl = referrerId ? `${url}?ref=${referrerId}` : url;
  const encodedText = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(shareUrl);

  function copyLink() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast.success("Link copied to clipboard");
    });
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {referrerId && (
        <p className="text-sm text-center">💌 Send it to a friend:<br/>If they sign up you get 20 points!</p>
      )}
      <Button size="icon" variant="secondary" asChild>
        <a
          href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Twitter className="h-4 w-4" />
        </a>
      </Button>
      <Button size="icon" variant="secondary" asChild>
        <a
          href={`https://www.reddit.com/submit?title=${encodedText}&url=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <SiReddit className="h-4 w-4" />
        </a>
      </Button>
      <Button size="icon" variant="secondary" asChild>
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Facebook className="h-4 w-4" />
        </a>
      </Button>
      <Button size="icon" variant="secondary" onClick={copyLink}>
        <Copy className="h-4 w-4" />
      </Button>
    </div>
  );
}
