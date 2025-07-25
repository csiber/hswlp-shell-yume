import React from "react";

interface CreditsLowWarningProps {
  userName?: string;
}

export default function CreditsLowWarning({ userName }: CreditsLowWarningProps) {
  return (
    <html lang="en">
      <body>
        <p>Dear {userName || "user"},</p>
        <p>You currently have 0 credits. New images, badges and features have appeared since then...</p>
        <p>
          <a href="https://yumekai.com/credits">Top up now → yumekai.com/credits</a>
        </p>
      </body>
    </html>
  );
}
