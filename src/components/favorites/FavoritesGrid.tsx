"use client"
import React from 'react'

export default function FavoritesGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="favorites-grid grid gap-5 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
      {children}
    </div>
  )
}
