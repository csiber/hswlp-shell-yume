"use client";

export default function LogoIcon(props: React.ComponentProps<"img">) {
  return (
    <img
      src="/favicon.svg"
      alt="HSWLP logó"
      width={32}
      height={32}
      {...props}
    />
  );
}
