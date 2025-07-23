import React from "react";

interface ResetPasswordProps {
  resetUrl: string;
  userName?: string;
}

export default function ResetPassword({ resetUrl, userName }: ResetPasswordProps) {
  return (
    <html lang="hu">
      <body>
        <p>Kedves {userName || "felhasználó"}!</p>
        <p>Az alábbi hivatkozással beállíthatsz egy új jelszót:</p>
        <p>
          <a href={resetUrl}>Jelszó visszaállítása</a>
        </p>
        <p>Ha nem te kezdeményezted, hagyd figyelmen kívül ezt a levelet.</p>
      </body>
    </html>
  );
}
