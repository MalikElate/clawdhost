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
});
