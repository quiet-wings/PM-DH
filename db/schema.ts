import { pgTable, serial, text, timestamp, integer } from 'drizzle-orm/pg-core'

export const releasedBurdens = pgTable('released_burdens', {
  id: serial('id').primaryKey(),
  category: text('category').notNull().default('일반'),
  encouragement: text('encouragement').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})

export const globalCounters = pgTable('global_counters', {
  id: text('id').primaryKey(),
  count: integer('count').notNull().default(0),
  updatedAt: timestamp('updated_at').defaultNow(),
})
