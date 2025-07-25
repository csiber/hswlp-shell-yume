import React from "react";

interface NewBadgeProps {
  badgeName: string;
  badgeDescription: string;
  badgeIcon: string;
}

export default function NewBadge({ badgeName, badgeDescription, badgeIcon }: NewBadgeProps) {
  return (
    <html lang="en">
      <body>
        <p>You earned the {badgeName} badge! This means...</p>
        <p>
          {badgeIcon} {badgeDescription}
        </p>
        <p>
          <a href="https://yumekai.com/profile">View your profile → yumekai.com/profile</a>
        </p>
      </body>
    </html>
  );
}
