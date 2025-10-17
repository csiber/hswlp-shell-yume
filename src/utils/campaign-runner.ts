import { createId } from '@paralleldrive/cuid2';
import { and, eq, gt, inArray } from 'drizzle-orm';
import type { InferSelectModel } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';

import { sendEmail } from './email';

import type * as schema from '@/db/schema';
import {
  emailCampaignRunTable,
  emailCampaignTable,
  emailLogTable,
} from '@/db/schema';

export type Database = DrizzleD1Database<typeof schema>;

export interface CampaignExecutionContext {
  db: Database;
  env: CloudflareEnv;
  now?: Date;
}

export interface CampaignMessage {
  userId: string;
  email: string;
  subject: string;
  html: string;
  text: string;
  onSuccess?: () => Promise<void> | void;
  onFailure?: (error: unknown) => Promise<void> | void;
}

export interface CampaignHandler {
  key: string;
  name: string;
  triggerType: string;
  eligibility: string;
  throttleHours: number;
  envFlag?: keyof CloudflareEnv;
  prepare: (context: CampaignExecutionContext & { campaign: InferSelectModel<typeof emailCampaignTable> }) => Promise<CampaignMessage[]>;
}

export async function runCampaigns(
  context: CampaignExecutionContext,
  campaigns: CampaignHandler[],
) {
  const now = context.now ?? new Date();

  for (const campaign of campaigns) {
    const campaignRow = await ensureCampaignDefinition(context.db, campaign, now);

    if (!isCampaignEnabled(context.env, campaign.envFlag)) {
      continue;
    }

    const messages = await campaign.prepare({ ...context, campaign: campaignRow, now });
    if (!messages.length) {
      continue;
    }

    const throttledUsers = await collectRecentlyContactedUsers(
      context.db,
      campaignRow,
      messages,
      campaign.throttleHours,
      now,
    );

    for (const message of messages) {
      if (!message.email || throttledUsers.has(message.userId)) {
        continue;
      }

      const runId = `erun_${createId()}`;
      const sentAt = new Date();

      try {
        await sendEmail({
          to: message.email,
          subject: message.subject,
          html: message.html,
          text: message.text,
        });

        await context.db.insert(emailLogTable).values({
          id: `elog_${createId()}`,
          userId: message.userId,
          type: campaign.key,
          sentAt,
        });

        await context.db.insert(emailCampaignRunTable).values({
          id: runId,
          campaignId: campaignRow.id,
          userId: message.userId,
          runAt: sentAt,
          status: 'sent',
        });

        await message.onSuccess?.();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        await context.db.insert(emailCampaignRunTable).values({
          id: runId,
          campaignId: campaignRow.id,
          userId: message.userId,
          runAt: sentAt,
          status: 'failed',
          error: errorMessage,
        });

        await message.onFailure?.(error);
      }
    }
  }
}

async function ensureCampaignDefinition(
  db: Database,
  campaign: CampaignHandler,
  now: Date,
) {
  let existing = await db.query.emailCampaignTable.findFirst({
    where: eq(emailCampaignTable.campaignKey, campaign.key),
  });

  if (!existing) {
    await db.insert(emailCampaignTable).values({
      id: `ecmp_${createId()}`,
      campaignKey: campaign.key,
      name: campaign.name,
      triggerType: campaign.triggerType,
      eligibilityCriteria: campaign.eligibility,
      throttleHours: campaign.throttleHours,
      createdAt: now,
      updatedAt: now,
    });

    existing = await db.query.emailCampaignTable.findFirst({
      where: eq(emailCampaignTable.campaignKey, campaign.key),
    });
  } else {
    await db
      .update(emailCampaignTable)
      .set({
        name: campaign.name,
        triggerType: campaign.triggerType,
        eligibilityCriteria: campaign.eligibility,
        throttleHours: campaign.throttleHours,
        updatedAt: now,
      })
      .where(eq(emailCampaignTable.id, existing.id));

    existing = await db.query.emailCampaignTable.findFirst({
      where: eq(emailCampaignTable.campaignKey, campaign.key),
    });
  }

  if (!existing) {
    throw new Error(`A(z) ${campaign.key} kampány definíciója nem található.`);
  }

  return existing;
}

async function collectRecentlyContactedUsers(
  db: Database,
  campaign: InferSelectModel<typeof emailCampaignTable>,
  messages: CampaignMessage[],
  throttleHours: number,
  now: Date,
) {
  const throttledUsers = new Set<string>();

  if (throttleHours <= 0) {
    return throttledUsers;
  }

  const uniqueUserIds = Array.from(
    new Set(messages.map((message) => message.userId).filter(Boolean)),
  );

  if (!uniqueUserIds.length) {
    return throttledUsers;
  }

  const cutoff = new Date(now.getTime() - throttleHours * 60 * 60 * 1000);

  const rows = await db
    .select({ userId: emailCampaignRunTable.userId })
    .from(emailCampaignRunTable)
    .where(
      and(
        eq(emailCampaignRunTable.campaignId, campaign.id),
        inArray(emailCampaignRunTable.userId, uniqueUserIds),
        gt(emailCampaignRunTable.runAt, cutoff),
      ),
    )
    .all();

  for (const row of rows) {
    throttledUsers.add(row.userId);
  }

  return throttledUsers;
}

function isCampaignEnabled(env: CloudflareEnv, envFlag?: keyof CloudflareEnv) {
  if (!envFlag) {
    return true;
  }

  const rawValue = env[envFlag];

  if (typeof rawValue === 'string') {
    const normalized = rawValue.trim().toLowerCase();
    if (!normalized) {
      return true;
    }
    return ['1', 'true', 'yes', 'on', 'enable', 'enabled'].includes(normalized);
  }

  return Boolean(rawValue);
}
