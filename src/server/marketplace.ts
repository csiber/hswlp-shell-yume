import "server-only";
import { getDB } from "@/db";
import { highlightCollectionsTable, highlightedPostsTable, marketplaceActivationsTable, userTable } from "@/db/schema";
import { createId } from "@paralleldrive/cuid2";
import { eq, and, sql } from "drizzle-orm";
import { consumeCredits } from "@/utils/credits";
import { updateAllSessionsOfUser } from "@/utils/kv-session";
import { COMPONENTS } from "@/app/(dashboard)/dashboard/marketplace/components-catalog";

export async function updateUserField(
  userId: string,
  field: keyof typeof userTable._.columns,
  value: unknown
) {
  const db = await getDB();
  await db
    .update(userTable)
    .set({ [field]: value } as Record<string, unknown>)
    .where(eq(userTable.id, userId));
  await updateAllSessionsOfUser(userId);
}

const DEFAULT_HIGHLIGHT_COLLECTION_ID = "hlc_marketplace_default";
const DEFAULT_HIGHLIGHT_COLLECTION_SLUG = "marketplace-featured";

async function ensureDefaultHighlightCollection() {
  const db = await getDB();

  const existing = await db.query.highlightCollectionsTable.findFirst({
    where: eq(highlightCollectionsTable.slug, DEFAULT_HIGHLIGHT_COLLECTION_SLUG),
  });

  if (existing) {
    return existing;
  }

  const now = new Date();
  const fallback = {
    id: DEFAULT_HIGHLIGHT_COLLECTION_ID,
    slug: DEFAULT_HIGHLIGHT_COLLECTION_SLUG,
    title: "Marketplace kiemelések",
    description: "Automatikus marketplace kiemelések gyűjtése.",
    isActive: 1 as const,
    isDefault: 1 as const,
    displayOrder: 0,
    activeFrom: now,
    activeTo: null,
  };

  await db.insert(highlightCollectionsTable).values(fallback);

  return fallback;
}

export async function activateHighlightPost(userId: string, postId: string) {
  const db = await getDB();
  const collection = await ensureDefaultHighlightCollection();
  const now = new Date();
  const expires = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  await db.insert(highlightedPostsTable).values({
    id: `hlp_${createId()}`,
    postId,
    userId,
    collectionId: collection.id,
    expiresAt: expires,
    displayFrom: now,
    displayTo: expires,
    description: "Marketplace aktiválásból származó kiemelés",
  });
}

export async function applyDailySurpriseReward(userId: string): Promise<string> {
  const rewards = ["points", "bonusFrame", "badgeUnlocked"] as const;
  const choice = rewards[Math.floor(Math.random() * rewards.length)];
  const db = await getDB();

  if (choice === "points") {
    await db
      .update(userTable)
      .set({ points: sql`${userTable.points} + 10` })
      .where(eq(userTable.id, userId));
  } else if (choice === "bonusFrame") {
    await updateUserField(userId, "profileFrameEnabled", 1);
  } else if (choice === "badgeUnlocked") {
    await updateUserField(userId, "badgeUnlocked", 1);
  }

  return choice;
}

interface ActivationOptions {
  postId?: string;
  selectedAvatarStyle?: string;
}

export async function activateMarketplaceComponent(
  componentId: string,
  userId: string,
  options: ActivationOptions = {}
) {
  const db = await getDB();

  const component = COMPONENTS.find(c => c.id === componentId);

  const existing = await db.query.marketplaceActivationsTable.findFirst({
    where: and(eq(marketplaceActivationsTable.user_id, userId), eq(marketplaceActivationsTable.component_id, componentId)),
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
    case "storage-upgrade":
      if (component?.props && typeof component.props.addMb === 'number') {
        await db
          .update(userTable)
          .set({ uploadLimitMb: sql`${userTable.uploadLimitMb} + ${component.props.addMb}` })
          .where(eq(userTable.id, userId));
        await updateAllSessionsOfUser(userId);
      }
      break;
    default:
      throw new Error("Unknown component");
  }

  await db.insert(marketplaceActivationsTable).values({
    id: `mact_${createId()}`,
    user_id: userId,
    component_id: componentId,
    metadata: Object.keys(metadata).length ? JSON.stringify(metadata) : undefined,
  });

  await consumeCredits({
    userId,
    amount: getComponentCredits(componentId),
    description: `Activated: ${component?.name || "unknown component"}`,
  });
}

export function getComponentCredits(componentId: string): number {
  const component = COMPONENTS.find((c) => c.id === componentId);
  return component?.credits ?? 0;
}

export async function getUserActiveComponents(userId: string) {
  const db = await getDB();
  const acts = await db
    .select({ componentId: marketplaceActivationsTable.component_id })
    .from(marketplaceActivationsTable)
    .where(eq(marketplaceActivationsTable.user_id, userId));

  return new Set(acts.map((a) => a.componentId));
}
