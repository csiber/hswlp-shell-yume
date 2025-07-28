"use client";
import Image from 'next/image'

export default function LogoIcon({ className }: { className?: string }) {
  return (
    <Image
      src="/favicon.svg"
      alt="HSWLP logo"
      width={48}
      height={48}
      className={className ? `${className} max-h-12` : 'max-h-12'}
    />
  );
}
