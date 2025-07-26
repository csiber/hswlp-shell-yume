"use client";
import Image from 'next/image'

export default function LogoIcon({ className }: { className?: string }) {
  return (
    <Image
      src="/favicon.svg"
      alt="HSWLP logo"
      width={32}
      height={32}
      className={className}
    />
  );
}
