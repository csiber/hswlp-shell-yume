import "server-only";
import { getDB } from "@/db";
import { highlightedPostsTable, marketplaceActivationsTable, userTable } from "@/db/schema";
import { createId } from "@paralleldrive/cuid2";
import { eq, and, sql } from "drizzle-orm";
import { consumeCredits } from "@/utils/credits";
import { updateAllSessionsOfUser } from "@/utils/kv-session";
import { COMPONENTS } from "@/app/(dashboard)/dashboard/marketplace/components-catalog";

export async function updateUserField(userId: string, field: keyof typeof userTable._.columns, value: unknown) {
  const db = getDB();
  await db.update(userTable).set({ [field]: value } as Record<string, unknown>).where(eq(userTable.id, userId));
  await updateAllSessionsOfUser(userId);
}

export async function activateHighlightPost(userId: string, postId: string) {
  const db = getDB();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await db.insert(highlightedPostsTable).values({
    id: `hlp_${createId()}`,
    postId,
    userId,
    expiresAt: expires,
  });
}

export async function applyDailySurpriseReward(userId: string): Promise<string> {
  const rewards = ["points", "bonus_frame", "badge_unlocked"] as const;
  const choice = rewards[Math.floor(Math.random() * rewards.length)];
  const db = getDB();

  if (choice === "points") {
    await db.update(userTable)
      .set({ points: sql`${userTable.points} + 10` })
      .where(eq(userTable.id, userId));
  } else if (choice === "bonus_frame") {
    await updateUserField(userId, "bonusFrame", 1);
  } else if (choice === "badge_unlocked") {
    await updateUserField(userId, "badgeUnlocked", 1);
  }

  return choice;
}

interface ActivationOptions {
  postId?: string;
  selectedAvatarStyle?: string;
}

export async function activateMarketplaceComponent(componentId: string, userId: string, options: ActivationOptions = {}) {
  const db = getDB();

  const existing = await db.query.marketplaceActivationsTable.findFirst({
    where: and(eq(marketplaceActivationsTable.userId, userId), eq(marketplaceActivationsTable.componentId, componentId)),
  });
  if (existing) {
    throw new Error("Component already active");
  }

  const metadata: Record<string, unknown> = {};

  switch (componentId) {
    case "highlight-post":
      if (!options.postId) throw new Error("postId required");
      await activateHighlightPost(userId, options.postId);
      metadata.postId = options.postId;
      break;
    case "profile-frame":
      await updateUserField(userId, "profileFrameEnabled", 1);
      break;
    case "custom-avatar":
      await updateUserField(userId, "customAvatarUnlocked", 1);
      if (options.selectedAvatarStyle) {
        await updateUserField(userId, "selectedAvatarStyle", options.selectedAvatarStyle);
        metadata.selected = options.selectedAvatarStyle;
      }
      break;
    case "pin-post":
      if (!options.postId) throw new Error("postId required");
      await updateUserField(userId, "pinnedPostId", options.postId);
      metadata.postId = options.postId;
      break;
    case "emoji-reactions":
      await updateUserField(userId, "emojiReactionsEnabled", 1);
      break;
    case "daily-surprise":
      const reward = await applyDailySurpriseReward(userId);
      metadata.reward = reward;
      break;
    default:
      throw new Error("Unknown component");
  }

  await db.insert(marketplaceActivationsTable).values({
    id: `mact_${createId()}`,
    userId,
    componentId,
    metadata: Object.keys(metadata).length ? JSON.stringify(metadata) : undefined,
  });

  await consumeCredits({ userId, amount: getComponentCredits(componentId), description: `Activate ${componentId}` });
}

export function getComponentCredits(componentId: string): number {
  const component = COMPONENTS.find(c => c.id === componentId);
  return component?.credits ?? 0;
}

export async function getUserActiveComponents(userId: string) {
  const db = getDB();
  const acts = await db.query.marketplaceActivationsTable.findMany({
    where: eq(marketplaceActivationsTable.userId, userId),
    columns: { componentId: true },
  });
  return new Set(acts.map(a => a.componentId));
}
