import React from "react";

interface VerifyEmailProps {
  verifyUrl: string;
  userName?: string;
}

export default function VerifyEmail({ verifyUrl, userName }: VerifyEmailProps) {
  return (
    <html lang="hu">
      <body>
        <p>Kedves {userName || "felhasználó"}!</p>
        <p>Kérjük, erősítsd meg az e-mail címed az alábbi hivatkozással:</p>
        <p>
          <a href={verifyUrl}>E-mail cím megerősítése</a>
        </p>
        <p>Ha nem te regisztráltál, kérjük, hagyd figyelmen kívül ezt a levelet.</p>
      </body>
    </html>
  );
}
