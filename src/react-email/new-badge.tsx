import React from "react";

interface NewBadgeProps {
  badgeName: string;
  badgeDescription: string;
  badgeIcon: string;
}

export default function NewBadge({ badgeName, badgeDescription, badgeIcon }: NewBadgeProps) {
  return (
    <html lang="hu">
      <body>
        <p>Megszerezted a(z) {badgeName} rangot! Ez azt jelenti, hogy...</p>
        <p>
          {badgeIcon} {badgeDescription}
        </p>
        <p>
          <a href="https://yumekai.com/profile">Nézd meg profilod → yumekai.com/profile</a>
        </p>
      </body>
    </html>
  );
}
