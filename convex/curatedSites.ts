import { paginationOptsValidator } from 'convex/server'
import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('curated_sites')
      .order('desc')
      .paginate(args.paginationOpts)
  },
})

export const listVisible = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('curated_sites')
      .withIndex('by_visible', (q) => q.eq('visible', true))
      .order('asc')
      .collect()
  },
})

export const get = query({
  args: { id: v.id('curated_sites') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    href: v.string(),
    category: v.string(),
    notes: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    visible: v.boolean(),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('curated_sites', args)
  },
})

export const update = mutation({
  args: {
    id: v.id('curated_sites'),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    href: v.optional(v.string()),
    category: v.optional(v.string()),
    notes: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    visible: v.optional(v.boolean()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args
    const existing = await ctx.db.get(id)
    if (!existing) {
      throw new Error('Curated site not found')
    }
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
  args: { id: v.id('curated_sites') },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id)
    if (!existing) {
      throw new Error('Curated site not found')
    }
    await ctx.db.delete(args.id)
  },
})

export const toggleVisibility = mutation({
  args: { id: v.id('curated_sites') },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id)
    if (!existing) {
      throw new Error('Curated site not found')
    }
    await ctx.db.patch(args.id, { visible: !existing.visible })
  },
})

export const seed = mutation({
  args: {
    sites: v.array(
      v.object({
        name: v.string(),
        description: v.string(),
        href: v.string(),
        category: v.string(),
        notes: v.optional(v.string()),
        tags: v.optional(v.array(v.string())),
      })
    ),
  },
  handler: async (ctx, args) => {
    const results: string[] = []
    for (const site of args.sites) {
      const id = await ctx.db.insert('curated_sites', {
        ...site,
        visible: true,
      })
      results.push(id)
    }
    return results
  },
})
