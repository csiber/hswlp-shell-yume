"use client"

import BoringAvatar from "boring-avatars"
import React from "react"

interface RandomAvatarProps {
  name: string
  size?: number
}

export function RandomAvatar({ name, size = 40 }: RandomAvatarProps) {
  const variants = ["marble", "beam", "pixel", "sunset", "ring", "bauhaus"] as const
  const index = React.useMemo(() => {
    let hash = 0
    const len = variants.length
    for (let i = 0; i < name.length; i++) {
      hash = (hash + name.charCodeAt(i)) % len
    }
    return hash
  }, [name, variants.length])
  const variant = variants[index]
  const colors = [
    "#92A1C6",
    "#146A7C",
    "#F0AB3D",
    "#C271B4",
    "#C20D90",
  ]

  return (
    <BoringAvatar size={size} name={name} variant={variant} colors={colors} />
  )
}
