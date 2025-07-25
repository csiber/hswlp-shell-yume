import React from "react";

interface ResetPasswordProps {
  resetUrl: string;
  userName?: string;
}

export default function ResetPassword({ resetUrl, userName }: ResetPasswordProps) {
  return (
    <html lang="en">
      <body>
        <p>Dear {userName || "user"},</p>
        <p>You can set a new password using the link below:</p>
        <p>
          <a href={resetUrl}>Reset password</a>
        </p>
          <p>If you didn&apos;t request this, please ignore this message.</p>
      </body>
    </html>
  );
}
