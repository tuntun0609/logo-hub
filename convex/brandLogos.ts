import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('brand_logos').order('desc').collect()
  },
})

export const listVisible = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('brand_logos')
      .withIndex('by_visible', (q) => q.eq('visible', true))
      .order('desc')
      .collect()
  },
})

export const get = query({
  args: { id: v.id('brand_logos') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

export const create = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('brand_logos', args)
  },
})

export const update = mutation({
  args: {
    id: v.id('brand_logos'),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    logoSvgUrl: v.optional(v.string()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    website: v.optional(v.string()),
    brandColor: v.optional(v.string()),
    visible: v.optional(v.boolean()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args
    const existing = await ctx.db.get(id)
    if (!existing) {
      throw new Error('Brand logo not found')
    }
    // Only update defined fields
    const updates: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        updates[key] = value
      }
    }
    await ctx.db.patch(id, updates)
  },
})

export const remove = mutation({
  args: { id: v.id('brand_logos') },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id)
    if (!existing) {
      throw new Error('Brand logo not found')
    }
    await ctx.db.delete(args.id)
  },
})

export const seed = mutation({
  args: {
    logos: v.array(
      v.object({
        name: v.string(),
        logoSvgUrl: v.string(),
        visible: v.boolean(),
        order: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const results: string[] = []
    for (const logo of args.logos) {
      const id = await ctx.db.insert('brand_logos', {
        name: logo.name,
        logoUrl: logo.logoSvgUrl,
        logoSvgUrl: logo.logoSvgUrl,
        visible: logo.visible,
        order: logo.order,
      })
      results.push(id)
    }
    return results
  },
})

export const toggleVisibility = mutation({
  args: { id: v.id('brand_logos') },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id)
    if (!existing) {
      throw new Error('Brand logo not found')
    }
    await ctx.db.patch(args.id, { visible: !existing.visible })
  },
})
