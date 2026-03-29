import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const siteCategories = sqliteTable('site_categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  order: integer('order'),
  createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
})

export const curatedSites = sqliteTable('curated_sites', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description').notNull(),
  href: text('href').notNull(),
  category: text('category').notNull().default(''),
  notes: text('notes'),
  tags: text('tags'), // JSON-encoded string[]
  visible: integer('visible', { mode: 'boolean' }).notNull().default(true),
  order: integer('order'),
  createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
})

export type SiteCategory = typeof siteCategories.$inferSelect
export type NewSiteCategory = typeof siteCategories.$inferInsert
export type CuratedSite = typeof curatedSites.$inferSelect
export type NewCuratedSite = typeof curatedSites.$inferInsert
