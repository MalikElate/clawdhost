"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

const RAILWAY_API_URL = "https://backboard.railway.com/graphql/v2";
const MOLTBOT_IMAGE = "ghcr.io/malikelate/moltbot-image:latest";

interface GraphQLResponse<T = any> {
  data?: T;
  errors?: Array<{ message: string }>;
}

async function railwayQuery<T = any>(
  query: string,
  variables: Record<string, any> = {}
): Promise<T> {
  const token = process.env.RAILWAY_API_TOKEN;
  if (!token) throw new Error("RAILWAY_API_TOKEN not configured");

  const res = await fetch(RAILWAY_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  const json: GraphQLResponse<T> = await res.json();

  if (json.errors && json.errors.length > 0) {
    throw new Error(`Railway API error: ${json.errors[0].message}`);
  }

  if (!json.data) {
    throw new Error("Railway API returned no data");
  }

  return json.data;
}

export const deploy = internalAction({
  args: {
    instanceId: v.id("instances"),
    name: v.string(),
    userId: v.string(),
    gatewayToken: v.string(),
  },
  handler: async (ctx, args) => {
    const projectId = process.env.RAILWAY_PROJECT_ID;
    if (!projectId) throw new Error("RAILWAY_PROJECT_ID not configured");

    try {
      // 1. Create the service with Docker image source
      const createData = await railwayQuery<{
        serviceCreate: { id: string };
      }>(
        `mutation($input: ServiceCreateInput!) {
          serviceCreate(input: $input) {
            id
          }
        }`,
        {
          input: {
            projectId,
            name: `moltbot-${args.instanceId.toString().slice(0, 8)}`,
            source: {
              image: MOLTBOT_IMAGE,
            },
          },
        }
      );

      const serviceId = createData.serviceCreate.id;

      // Store the service ID immediately
      await ctx.runMutation(internal.instances.updateStatus, {
        instanceId: args.instanceId,
        status: "creating",
        railwayServiceId: serviceId,
      });

      // 2. Get the default environment
      const envData = await railwayQuery<{
        environments: { edges: Array<{ node: { id: string } }> };
      }>(
        `query($projectId: String!) {
          environments(projectId: $projectId) {
            edges {
              node {
                id
              }
            }
          }
        }`,
        { projectId }
      );

      const environmentId = envData.environments.edges[0]?.node.id;
      if (!environmentId) throw new Error("No environment found in Railway project");

      // 3. Set environment variables
      await railwayQuery(
        `mutation($input: VariableCollectionUpsertInput!) {
          variableCollectionUpsert(input: $input)
        }`,
        {
          input: {
            projectId,
            serviceId,
            environmentId,
            variables: {
              PORT: "18789",
              INSTANCE_ID: args.instanceId,
              USER_ID: args.userId,
              CLAWDBOT_GATEWAY_TOKEN: args.gatewayToken,
              OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY ?? "",
            },
          },
        }
      );

      // 4. Generate a public domain for the service
      await railwayQuery(
        `mutation($input: ServiceDomainCreateInput!) {
          serviceDomainCreate(input: $input) {
            id
            domain
          }
        }`,
        {
          input: {
            serviceId,
            environmentId,
          },
        }
      );

      // 5. Poll for deployment completion
      const maxAttempts = 60; // 5 minutes at 5s intervals
      for (let i = 0; i < maxAttempts; i++) {
        await new Promise((resolve) => setTimeout(resolve, 5000));

        const deployData = await railwayQuery<{
          deployments: { edges: Array<{ node: { status: string } }> };
        }>(
          `query($input: DeploymentListInput!) {
            deployments(input: $input) {
              edges {
                node {
                  status
                }
              }
            }
          }`,
          { input: { serviceId } }
        );

        const status = deployData.deployments.edges[0]?.node.status;

        if (status === "SUCCESS") {
          // Get the public URL
          const domainData = await railwayQuery<{
            domains: { serviceDomains: Array<{ domain: string }> };
          }>(
            `query($projectId: String!, $environmentId: String!, $serviceId: String!) {
              domains(projectId: $projectId, environmentId: $environmentId, serviceId: $serviceId) {
                serviceDomains {
                  domain
                }
              }
            }`,
            { projectId, environmentId, serviceId }
          );

          const domain = domainData.domains.serviceDomains[0]?.domain;
          const serviceUrl = domain ? `https://${domain}` : undefined;

          await ctx.runMutation(internal.instances.updateStatus, {
            instanceId: args.instanceId,
            status: "running",
            serviceUrl,
          });
          return;
        }

        if (status === "FAILED" || status === "CRASHED") {
          await ctx.runMutation(internal.instances.updateStatus, {
            instanceId: args.instanceId,
            status: "error",
          });
          return;
        }
      }

      // Timed out
      await ctx.runMutation(internal.instances.updateStatus, {
        instanceId: args.instanceId,
        status: "error",
      });
    } catch (error: any) {
      console.error("Railway deploy failed:", error);
      await ctx.runMutation(internal.instances.updateStatus, {
        instanceId: args.instanceId,
        status: "error",
      });
    }
  },
});

export const destroy = internalAction({
  args: { serviceId: v.string() },
  handler: async (_ctx, args) => {
    try {
      await railwayQuery(
        `mutation($id: String!) {
          serviceDelete(id: $id)
        }`,
        { id: args.serviceId }
      );
    } catch (error: any) {
      console.error("Railway destroy failed:", error);
    }
  },
});
