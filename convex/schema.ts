import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  instances: defineTable({
    userId: v.string(),
    name: v.string(),
    status: v.union(
      v.literal("creating"),
      v.literal("running"),
      v.literal("stopped"),
      v.literal("error")
    ),
    railwayServiceId: v.optional(v.string()),
    serviceUrl: v.optional(v.string()),
    gatewayToken: v.optional(v.string()),
  }).index("by_userId", ["userId"]),

  apps: defineTable({
    userId: v.string(),
    name: v.string(),
    type: v.literal("todo"),
  }).index("by_userId", ["userId"]),

  todoItems: defineTable({
    appId: v.id("apps"),
    userId: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("backlog"),
      v.literal("in_progress"),
      v.literal("done")
    ),
    order: v.number(),
  }).index("by_appId", ["appId"]),
});
