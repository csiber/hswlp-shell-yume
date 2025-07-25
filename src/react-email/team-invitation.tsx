import React from "react";

interface TeamInvitationProps {
  invitationUrl: string;
  teamName: string;
}

export default function TeamInvitation({ invitationUrl, teamName }: TeamInvitationProps) {
  return (
    <html lang="en">
      <body>
        <p>You have been invited to the {teamName} team.</p>
        <p>Click the link below to join:</p>
        <p>
          <a href={invitationUrl}>Join the team</a>
        </p>
      </body>
    </html>
  );
}
