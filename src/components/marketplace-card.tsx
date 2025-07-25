"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import ActivateButton from "@/components/activate-button"
import { Badge } from "@/components/ui/badge"
import { COMPONENTS } from "@/app/(dashboard)/dashboard/marketplace/components-catalog"

interface MarketplaceCardProps {
  id: string
  name: string
  description: string
  credits: number
  containerClass?: string
  isActive: boolean
}

export function MarketplaceCard({ id, name, description, credits, containerClass, isActive }: MarketplaceCardProps) {
  const component = COMPONENTS.find(c => c.id === id);
  if (!component) return null;

  return (
    <Card className="relative">
      {credits > 0 && (
        <Badge className="absolute top-2 right-2 bg-yellow-400 text-black shadow-md">
          {credits} credits
        </Badge>
      )}
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{name}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center bg-muted/50 p-6">
        <div className={containerClass}>
          {component.preview()}
        </div>
      </CardContent>
      <CardFooter className="mt-4 flex justify-end gap-2">
        {isActive ? (
          <Badge variant="secondary">Already active</Badge>
        ) : (
          <ActivateButton componentId={id} componentName={name} />
        )}
      </CardFooter>
    </Card>
  )
}
