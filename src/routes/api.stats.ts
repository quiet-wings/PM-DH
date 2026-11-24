import { createFileRoute } from '@tanstack/react-router'
import { getDb } from '../../db/index.js'
import { globalCounters, releasedBurdens } from '../../db/schema.js'
import { eq, sql } from 'drizzle-orm'

export const Route = createFileRoute('/api/stats')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const db = getDb()
          // Fetch global counter
          const [counter] = await db
            .select()
            .from(globalCounters)
            .where(eq(globalCounters.id, 'total_released'))

          const baseCount = 1842 // Base community count for warm feeling of solidarity
          const currentCount = counter ? counter.count : baseCount

          return Response.json({
            success: true,
            totalReleased: currentCount,
          })
        } catch (error) {
          // Graceful fallback if database is provisioning
          return Response.json({
            success: true,
            totalReleased: 1842,
            fallback: true,
          })
        }
      },
    },
  },
})
