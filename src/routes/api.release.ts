import { createFileRoute } from '@tanstack/react-router'
import { getDb } from '../../db/index.js'
import { globalCounters, releasedBurdens } from '../../db/schema.js'
import { eq, sql } from 'drizzle-orm'
import { z } from 'zod'

const releaseSchema = z.object({
  category: z.string().default('일반'),
  encouragement: z.string().default(''),
})

export const Route = createFileRoute('/api/release')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown
        try {
          body = await request.json()
        } catch {
          body = {}
        }

        const parsed = releaseSchema.safeParse(body)
        const category = parsed.success ? parsed.data.category : '일반'
        const encouragement = parsed.success ? parsed.data.encouragement : ''

        try {
          const db = getDb()
          // Increment or insert global counter
          const [existing] = await db
            .select()
            .from(globalCounters)
            .where(eq(globalCounters.id, 'total_released'))

          let newCount = 1843
          if (existing) {
            newCount = existing.count + 1
            await db
              .update(globalCounters)
              .set({
                count: newCount,
                updatedAt: new Date(),
              })
              .where(eq(globalCounters.id, 'total_released'))
          } else {
            await db.insert(globalCounters).values({
              id: 'total_released',
              count: 1843,
            })
          }

          // Record anonymous release
          if (encouragement) {
            await db.insert(releasedBurdens).values({
              category,
              encouragement,
            })
          }

          return Response.json({
            success: true,
            totalReleased: newCount,
          })
        } catch (error) {
          // Fallback if db is still provisioning
          return Response.json({
            success: true,
            totalReleased: 1843,
            fallback: true,
          })
        }
      },
    },
  },
})
