"use client"

import { toast } from "sonner"
import { Alert } from "@heroui/react"
import ShinyButton from "@/components/ui/shiny-button"
import { useServerAction } from "zsa-react"
import { activateComponentAction } from "@/app/(dashboard)/dashboard/marketplace/activate.action"
import { useState } from "react"
import PostSelectModal from "@/components/modals/PostSelectModal"

export default function ActivateButton({ componentId, componentName }: { componentId: string; componentName: string }) {
  const [postModalOpen, setPostModalOpen] = useState(false)

  const { execute, isPending } = useServerAction(activateComponentAction, {
    onError: (error) => {
      toast.dismiss()
      toast.error(error.err?.message || "Nem sikerült az aktiválás")
    },
    onStart: () => {
      toast.loading("Aktiválás...")
    },
    onSuccess: () => {
      toast.dismiss()
      toast.custom(() => (
        <Alert color="success" title="Siker" description={`${componentName} aktiválva`} />
      ))
    },
  })

  const needPostId = componentId === "highlight-post" || componentId === "pin-post"

  const handleActivate = () => {
    if (needPostId) {
      setPostModalOpen(true)
      return
    }
    execute({ componentId })
  }

  const handleSelect = (postId: string) => {
    setPostModalOpen(false)
    execute({ componentId, postId })
  }

  return (
    <>
      <ShinyButton onClick={handleActivate} disabled={isPending}>
        {isPending ? "Feldolgozás..." : "Aktiválás"}
      </ShinyButton>
      {needPostId && (
        <PostSelectModal
          open={postModalOpen}
          onOpenChange={setPostModalOpen}
          onSelect={handleSelect}
        />
      )}
    </>
  )
}
