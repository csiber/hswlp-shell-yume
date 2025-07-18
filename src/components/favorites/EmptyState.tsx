"use client"
import React from 'react'

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  subtitle?: string
}

export default function EmptyState({ icon, title, subtitle }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-2">
      <div className="text-muted-foreground">{icon}</div>
      <h3 className="text-lg font-semibold">{title}</h3>
      {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
    </div>
  )
}
