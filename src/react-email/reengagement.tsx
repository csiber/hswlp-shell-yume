import React from "react";

interface ReengagementEmailProps {
  userName: string;
  ctaUrl: string;
}

export default function ReengagementEmail({ userName, ctaUrl }: ReengagementEmailProps) {
  return (
    <html lang="hu">
      <body>
        <p>Szia {userName}! 7 napja nem jártál nálunk. Ezalatt sok minden történt!</p>
        <p>🎴 Új képek kerültek fel a galériába – köztük egy csomó NSFW is.</p>
        <p>
          <a href={ctaUrl}>Nézd meg most → yumekai.com/explore</a>
        </p>
        <p>Ne szeretnél több ilyen levelet? Állítsd be az értesítéseidet itt.</p>
      </body>
    </html>
  );
}
