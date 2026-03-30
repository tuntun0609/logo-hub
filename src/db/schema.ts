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

export const authors = sqliteTable('authors', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  avatar: text('avatar'),
  bio: text('bio'),
  specialty: text('specialty'),
  websiteUrl: text('website_url'),
  featuredWorks: text('featured_works'),
  visible: integer('visible', { mode: 'boolean' }).notNull().default(true),
  featured: integer('featured', { mode: 'boolean' }).notNull().default(false),
  order: integer('order'),
  createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
})

export type Author = typeof authors.$inferSelect
export type NewAuthor = typeof authors.$inferInsert
export type SiteCategory = typeof siteCategories.$inferSelect
export type NewSiteCategory = typeof siteCategories.$inferInsert
export type CuratedSite = typeof curatedSites.$inferSelect
export type NewCuratedSite = typeof curatedSites.$inferInsert
