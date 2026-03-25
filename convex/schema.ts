import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  curated_sites: defineTable({
    name: v.string(),
    description: v.string(),
    href: v.string(),
    category: v.string(),
    notes: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    visible: v.boolean(),
    order: v.optional(v.number()),
  })
    .index('by_visible', ['visible'])
    .index('by_category', ['category'])
    .searchIndex('search_name', {
      searchField: 'name',
      filterFields: ['visible', 'category'],
    }),
  brand_logos: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    logoUrl: v.string(),
    logoSvgUrl: v.optional(v.string()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    website: v.optional(v.string()),
    brandColor: v.optional(v.string()),
    visible: v.boolean(),
    order: v.optional(v.number()),
  })
    .index('by_visible', ['visible'])
    .index('by_category', ['category'])
    .searchIndex('search_name', {
      searchField: 'name',
      filterFields: ['visible', 'category'],
    }),
})
