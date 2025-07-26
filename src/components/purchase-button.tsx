"use client";

import { toast } from "sonner";
import { Alert } from "@heroui/react";
import ShinyButton from "@/components/ui/shiny-button";
import { useServerAction } from "zsa-react";
import { purchaseAction } from "@/app/(dashboard)/dashboard/marketplace/purchase.action";
import type { PURCHASABLE_ITEM_TYPE } from "@/db/schema";
import { useRouter } from "next/navigation";

interface PurchaseButtonProps {
  itemId: string;
  itemType: keyof typeof PURCHASABLE_ITEM_TYPE;
  itemName: string;
}

export default function PurchaseButton({
  itemId,
  itemType,
  itemName,
}: PurchaseButtonProps) {
  const router = useRouter();

  const { execute: handlePurchase, isPending } = useServerAction(
    purchaseAction,
    {
      onError: (error) => {
        toast.dismiss();
        toast.error(error.err?.message || "Purchase failed");
      },
      onStart: () => {
        toast.loading("Processing purchase...");
      },
      onSuccess: () => {
        toast.dismiss();
        toast.custom(() => (
          <Alert
            color="success"
            title="Purchase successful"
            description={`${itemName} added`}
          />
        ));
      },
    }
  );

  return (
    <ShinyButton
      onClick={() => {
        handlePurchase({ itemId, itemType }).then(() => {
          router.refresh();
        });
      }}
      disabled={isPending}
    >
      {isPending ? "Processing..." : "Purchase"}
    </ShinyButton>
  );
}
