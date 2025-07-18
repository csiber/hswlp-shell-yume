"use client"

import { toast } from "sonner"
import { Alert } from "@heroui/react"
import ShinyButton from "@/components/ui/shiny-button"
import { useServerAction } from "zsa-react"
import { activateComponentAction } from "@/app/(dashboard)/dashboard/marketplace/activate.action"

export default function ActivateButton({ componentId, componentName }: { componentId: string; componentName: string }) {
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

  return (
    <ShinyButton onClick={() => execute({ componentId })} disabled={isPending}>
      {isPending ? "Feldolgozás..." : "Aktiválás"}
    </ShinyButton>
  )
}
