'use server'

import { createServerAction, ZSAError } from 'zsa'
import { z } from 'zod'
import { requireVerifiedEmail } from '@/utils/auth'
import { withRateLimit, RATE_LIMITS } from '@/utils/with-rate-limit'
import { activateMarketplaceComponent } from '@/server/marketplace'
import { COMPONENTS } from './components-catalog'

const activationSchema = z.object({
  componentId: z.string(),
  postId: z.string().optional(),
  selectedAvatarStyle: z.string().optional(),
})

export const activateComponentAction = createServerAction()
  .input(activationSchema)
  .handler(async ({ input }) => {
    return withRateLimit(async () => {
      const session = await requireVerifiedEmail()
      if (!session?.user?.id) {
        throw new ZSAError('NOT_AUTHORIZED', 'Be kell jelentkezned')
      }

      const component = COMPONENTS.find(c => c.id === input.componentId)
      if (!component) {
        throw new ZSAError('NOT_FOUND', 'Ismeretlen komponens')
      }

      await activateMarketplaceComponent(input.componentId, session.user.id, input)

      return { success: true }
    }, RATE_LIMITS.PURCHASE)
  })
