import React from "react";

interface VerifyEmailProps {
  verifyUrl: string;
  userName?: string;
}

export default function VerifyEmail({ verifyUrl, userName }: VerifyEmailProps) {
  return (
    <html lang="en">
      <body>
        <p>Dear {userName || "user"},</p>
        <p>Please verify your email address using the link below:</p>
        <p>
          <a href={verifyUrl}>Verify email address</a>
        </p>
        <p>If you did not sign up, please ignore this message.</p>
      </body>
    </html>
  );
}
