"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import PurchaseButton from "@/components/purchase-button"
import type { PURCHASABLE_ITEM_TYPE } from "@/db/schema"
import { Badge } from "@/components/ui/badge"
import { COMPONENTS } from "@/app/(dashboard)/dashboard/marketplace/components-catalog"

interface MarketplaceCardProps {
  id: string
  name: string
  description: string
  credits: number
  containerClass?: string
  isPurchased: boolean
}

const ITEM_TYPE = 'COMPONENT' as const satisfies keyof typeof PURCHASABLE_ITEM_TYPE;

export function MarketplaceCard({ id, name, description, credits, containerClass, isPurchased }: MarketplaceCardProps) {
  const component = COMPONENTS.find(c => c.id === id);
  if (!component) return null;

  return (
    <Card className="relative">
      {credits > 0 && (
        <Badge className="absolute top-2 right-2 bg-yellow-400 text-black shadow-md">
          {credits} pont
        </Badge>
      )}
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{name}</CardTitle>
          {isPurchased && (
            <Badge variant="secondary">Megvásárolva</Badge>
          )}
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center bg-muted/50 p-6">
        <div className={containerClass}>
          {component.preview()}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between mt-4">
        <div className="text-md lg:text-2xl font-bold">{credits} kredit</div>
        {!isPurchased && (
          <PurchaseButton
            itemId={id}
            itemType={ITEM_TYPE}
            itemName={name}
          />
        )}
      </CardFooter>
    </Card>
  )
}
