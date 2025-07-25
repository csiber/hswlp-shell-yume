import React from "react";

interface CreditsLowWarningProps {
  userName?: string;
}

export default function CreditsLowWarning({ userName }: CreditsLowWarningProps) {
  return (
    <html lang="hu">
      <body>
        <p>Kedves {userName || "felhasználó"}!</p>
        <p>Jelenleg 0 pontod van. Azóta új képek, badge-ek, funkciók jelentek meg...</p>
        <p>
          <a href="https://yumekai.com/credits">Tölts fel pontot most → yumekai.com/credits</a>
        </p>
      </body>
    </html>
  );
}
