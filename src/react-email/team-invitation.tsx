import React from "react";

interface TeamInvitationProps {
  invitationUrl: string;
  teamName: string;
}

export default function TeamInvitation({ invitationUrl, teamName }: TeamInvitationProps) {
  return (
    <html lang="hu">
      <body>
        <p>Meghívást kaptál a(z) {teamName} csapatba.</p>
        <p>A csatlakozáshoz kattints az alábbi linkre:</p>
        <p>
          <a href={invitationUrl}>Csatlakozás a csapathoz</a>
        </p>
      </body>
    </html>
  );
}
