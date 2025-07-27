"use client"
import React from 'react'

export default function FavoritesGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="favorites-grid grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
      {children}
    </div>
  )
}
