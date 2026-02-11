import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

export const list = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const instances = await ctx.db
      .query("instances")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();

    return instances.map((i) => ({
      id: i._id,
      name: i.name,
      status: i.status,
      serviceUrl: i.serviceUrl,
      createdAt: i._creationTime,
    }));
  },
});

export const getStatus = query({
  args: { instanceId: v.id("instances") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const instance = await ctx.db.get(args.instanceId);
    if (!instance || instance.userId !== identity.subject) {
      throw new Error("Instance not found");
    }

    return {
      id: instance._id,
      name: instance.name,
      status: instance.status,
      serviceUrl: instance.serviceUrl,
      gatewayToken: instance.gatewayToken,
      createdAt: instance._creationTime,
    };
  },
});

export const create = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // Generate a random gateway token for this instance
    const gatewayToken = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const instanceId = await ctx.db.insert("instances", {
      userId: identity.subject,
      name: args.name,
      status: "creating",
      gatewayToken,
    });

    // Schedule Railway deployment in the background
    await ctx.scheduler.runAfter(0, internal.railway.deploy, {
      instanceId,
      name: args.name,
      userId: identity.subject,
      gatewayToken,
    });

    return instanceId;
  },
});

export const remove = mutation({
  args: { instanceId: v.id("instances") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const instance = await ctx.db.get(args.instanceId);
    if (!instance || instance.userId !== identity.subject) {
      throw new Error("Instance not found");
    }

    // Schedule Railway service deletion
    if (instance.railwayServiceId) {
      await ctx.scheduler.runAfter(0, internal.railway.destroy, {
        serviceId: instance.railwayServiceId,
      });
    }

    await ctx.db.delete(args.instanceId);
  },
});

// Internal mutation used by railway actions to update instance status
export const updateStatus = internalMutation({
  args: {
    instanceId: v.id("instances"),
    status: v.union(
      v.literal("creating"),
      v.literal("running"),
      v.literal("stopped"),
      v.literal("error")
    ),
    railwayServiceId: v.optional(v.string()),
    serviceUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updates: Record<string, any> = { status: args.status };
    if (args.railwayServiceId !== undefined) {
      updates.railwayServiceId = args.railwayServiceId;
    }
    if (args.serviceUrl !== undefined) {
      updates.serviceUrl = args.serviceUrl;
    }
    await ctx.db.patch(args.instanceId, updates);
  },
});
