import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// ── Apps CRUD ──────────────────────────────────────────

export const list = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const apps = await ctx.db
      .query("apps")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();

    return apps.map((a) => ({
      id: a._id,
      name: a.name,
      type: a.type,
      createdAt: a._creationTime,
    }));
  },
});

export const get = query({
  args: { appId: v.id("apps") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const app = await ctx.db.get(args.appId);
    if (!app || app.userId !== identity.subject) return null;

    return {
      id: app._id,
      name: app.name,
      type: app.type,
      createdAt: app._creationTime,
    };
  },
});

export const create = mutation({
  args: { name: v.string(), type: v.literal("todo") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    return await ctx.db.insert("apps", {
      userId: identity.subject,
      name: args.name,
      type: args.type,
    });
  },
});

export const remove = mutation({
  args: { appId: v.id("apps") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const app = await ctx.db.get(args.appId);
    if (!app || app.userId !== identity.subject) {
      throw new Error("App not found");
    }

    // Delete all todo items for this app
    const items = await ctx.db
      .query("todoItems")
      .withIndex("by_appId", (q) => q.eq("appId", args.appId))
      .collect();

    for (const item of items) {
      await ctx.db.delete(item._id);
    }

    await ctx.db.delete(args.appId);
  },
});

// ── Todo Items CRUD ────────────────────────────────────

export const listItems = query({
  args: { appId: v.id("apps") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const app = await ctx.db.get(args.appId);
    if (!app || app.userId !== identity.subject) return [];

    const items = await ctx.db
      .query("todoItems")
      .withIndex("by_appId", (q) => q.eq("appId", args.appId))
      .collect();

    return items.map((item) => ({
      id: item._id,
      title: item.title,
      description: item.description,
      status: item.status,
      order: item.order,
      createdAt: item._creationTime,
    }));
  },
});

export const createItem = mutation({
  args: {
    appId: v.id("apps"),
    title: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const app = await ctx.db.get(args.appId);
    if (!app || app.userId !== identity.subject) {
      throw new Error("App not found");
    }

    const existingItems = await ctx.db
      .query("todoItems")
      .withIndex("by_appId", (q) => q.eq("appId", args.appId))
      .collect();

    const backlogItems = existingItems.filter((i) => i.status === "backlog");
    const maxOrder = backlogItems.reduce((max, i) => Math.max(max, i.order), 0);

    return await ctx.db.insert("todoItems", {
      appId: args.appId,
      userId: identity.subject,
      title: args.title,
      description: args.description,
      status: "backlog",
      order: maxOrder + 1,
    });
  },
});

export const updateItem = mutation({
  args: {
    itemId: v.id("todoItems"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("backlog"),
        v.literal("in_progress"),
        v.literal("done")
      )
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const item = await ctx.db.get(args.itemId);
    if (!item || item.userId !== identity.subject) {
      throw new Error("Item not found");
    }

    const updates: Record<string, any> = {};
    if (args.title !== undefined) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.status !== undefined) {
      updates.status = args.status;
      // When moving to a new column, place at end
      const columnItems = await ctx.db
        .query("todoItems")
        .withIndex("by_appId", (q) => q.eq("appId", item.appId))
        .collect();
      const targetColumnItems = columnItems.filter(
        (i) => i.status === args.status && i._id !== args.itemId
      );
      const maxOrder = targetColumnItems.reduce(
        (max, i) => Math.max(max, i.order),
        0
      );
      updates.order = maxOrder + 1;
    }

    await ctx.db.patch(args.itemId, updates);
  },
});

export const deleteItem = mutation({
  args: { itemId: v.id("todoItems") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const item = await ctx.db.get(args.itemId);
    if (!item || item.userId !== identity.subject) {
      throw new Error("Item not found");
    }

    await ctx.db.delete(args.itemId);
  },
});
