#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";

const RAINDROP_API_BASE = "https://api.raindrop.io/rest/v1";

class RaindropMCPServer {
  private server: Server;
  private apiToken: string;

  constructor() {
    this.apiToken = process.env.RAINDROP_API_TOKEN || "";
    
    if (!this.apiToken) {
      console.error("ERROR: RAINDROP_API_TOKEN environment variable is required");
      process.exit(1);
    }

    this.server = new Server(
      {
        name: "raindrop-mcp-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private async makeRequest(
    endpoint: string,
    method: string = "GET",
    body?: any
  ): Promise<any> {
    const url = `${RAINDROP_API_BASE}${endpoint}`;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiToken}`,
    };

    if (body && (method === "POST" || method === "PUT")) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Raindrop API error (${response.status}): ${errorText}`
      );
    }

    if (response.status === 204) {
      return { success: true };
    }

    return await response.json();
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools: Tool[] = [
        {
          name: "get_user",
          description: "Get current user information",
          inputSchema: {
            type: "object",
            properties: {},
          },
        },
        {
          name: "get_raindrop",
          description: "Get a single bookmark/raindrop by ID",
          inputSchema: {
            type: "object",
            properties: {
              id: {
                type: "number",
                description: "The raindrop ID",
              },
            },
            required: ["id"],
          },
        },
        {
          name: "create_raindrop",
          description:
            "Create a new bookmark/raindrop with optional title, tags, excerpt, and collection",
          inputSchema: {
            type: "object",
            properties: {
              link: {
                type: "string",
                description: "The URL to bookmark",
              },
              title: {
                type: "string",
                description: "Title of the bookmark (max 1000 chars)",
              },
              excerpt: {
                type: "string",
                description: "Description/excerpt (max 10000 chars)",
              },
              tags: {
                type: "array",
                items: { type: "string" },
                description: "Array of tags",
              },
              collectionId: {
                type: "number",
                description:
                  "Collection ID (-1 for Unsorted, -99 for Trash, or specific collection ID)",
              },
              pleaseParse: {
                type: "boolean",
                description:
                  "Set to true to auto-parse page metadata (title, excerpt, cover)",
              },
            },
            required: ["link"],
          },
        },
        {
          name: "update_raindrop",
          description: "Update an existing bookmark/raindrop",
          inputSchema: {
            type: "object",
            properties: {
              id: {
                type: "number",
                description: "The raindrop ID to update",
              },
              link: {
                type: "string",
                description: "Updated URL",
              },
              title: {
                type: "string",
                description: "Updated title",
              },
              excerpt: {
                type: "string",
                description: "Updated description",
              },
              tags: {
                type: "array",
                items: { type: "string" },
                description: "Updated tags array",
              },
              important: {
                type: "boolean",
                description: "Mark as favorite",
              },
              collectionId: {
                type: "number",
                description: "Move to different collection",
              },
            },
            required: ["id"],
          },
        },
        {
          name: "delete_raindrop",
          description: "Delete a bookmark/raindrop (moves to Trash)",
          inputSchema: {
            type: "object",
            properties: {
              id: {
                type: "number",
                description: "The raindrop ID to delete",
              },
            },
            required: ["id"],
          },
        },
        {
          name: "get_raindrops",
          description:
            "Get raindrops from a collection with optional search and pagination",
          inputSchema: {
            type: "object",
            properties: {
              collectionId: {
                type: "number",
                description:
                  "Collection ID (0 for all, -1 for Unsorted, -99 for Trash)",
              },
              page: {
                type: "number",
                description: "Page number (default: 0)",
              },
              perpage: {
                type: "number",
                description: "Items per page (default: 25, max: 50)",
              },
              search: {
                type: "string",
                description: "Search query",
              },
            },
            required: ["collectionId"],
          },
        },
        {
          name: "get_collections",
          description: "Get all root collections",
          inputSchema: {
            type: "object",
            properties: {},
          },
        },
        {
          name: "get_collections_nested",
          description: "Get all nested/children collections",
          inputSchema: {
            type: "object",
            properties: {},
          },
        },
        {
          name: "get_collection",
          description: "Get a single collection by ID",
          inputSchema: {
            type: "object",
            properties: {
              id: {
                type: "number",
                description: "Collection ID",
              },
            },
            required: ["id"],
          },
        },
        {
          name: "create_collection",
          description: "Create a new collection",
          inputSchema: {
            type: "object",
            properties: {
              title: {
                type: "string",
                description: "Collection title",
              },
              parentId: {
                type: "number",
                description: "Parent collection ID (omit for root collection)",
              },
              view: {
                type: "string",
                enum: ["list", "simple", "grid", "masonry"],
                description: "View style (default: list)",
              },
              public: {
                type: "boolean",
                description: "Make collection public",
              },
            },
            required: ["title"],
          },
        },
        {
          name: "update_collection",
          description: "Update an existing collection",
          inputSchema: {
            type: "object",
            properties: {
              id: {
                type: "number",
                description: "Collection ID to update",
              },
              title: {
                type: "string",
                description: "Updated title",
              },
              view: {
                type: "string",
                enum: ["list", "simple", "grid", "masonry"],
                description: "Updated view style",
              },
              public: {
                type: "boolean",
                description: "Update public status",
              },
              parentId: {
                type: "number",
                description: "Move to different parent",
              },
            },
            required: ["id"],
          },
        },
        {
          name: "delete_collection",
          description: "Delete a collection",
          inputSchema: {
            type: "object",
            properties: {
              id: {
                type: "number",
                description: "Collection ID to delete",
              },
            },
            required: ["id"],
          },
        },
        {
          name: "get_tags",
          description: "Get all tags from all collections or a specific collection",
          inputSchema: {
            type: "object",
            properties: {
              collectionId: {
                type: "number",
                description: "Optional: Collection ID to get tags from",
              },
            },
          },
        },
        {
          name: "rename_tag",
          description: "Rename or merge tags",
          inputSchema: {
            type: "object",
            properties: {
              collectionId: {
                type: "number",
                description: "Collection ID (0 for all collections)",
              },
              tags: {
                type: "array",
                items: { type: "string" },
                description: "Array of old tag names to rename",
              },
              newTag: {
                type: "string",
                description: "New tag name",
              },
            },
            required: ["collectionId", "tags", "newTag"],
          },
        },
        {
          name: "delete_tag",
          description: "Remove tag(s) from raindrops",
          inputSchema: {
            type: "object",
            properties: {
              collectionId: {
                type: "number",
                description: "Collection ID (0 for all collections)",
              },
              tags: {
                type: "array",
                items: { type: "string" },
                description: "Array of tag names to remove",
              },
            },
            required: ["collectionId", "tags"],
          },
        },
        {
          name: "search_raindrops",
          description:
            "Search raindrops across all collections with advanced query syntax",
          inputSchema: {
            type: "object",
            properties: {
              search: {
                type: "string",
                description: "Search query (supports tags, domain filters, etc.)",
              },
              page: {
                type: "number",
                description: "Page number (default: 0)",
              },
              perpage: {
                type: "number",
                description: "Items per page (default: 25, max: 50)",
              },
            },
            required: ["search"],
          },
        },
      ];

      return { tools };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name, arguments: args } = request.params;

        switch (name) {
          case "get_user": {
            const data = await this.makeRequest("/user");
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(data, null, 2),
                },
              ],
            };
          }

          case "get_raindrop": {
            const { id } = args as { id: number };
            const data = await this.makeRequest(`/raindrop/${id}`);
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(data, null, 2),
                },
              ],
            };
          }

          case "create_raindrop": {
            const {
              link,
              title,
              excerpt,
              tags,
              collectionId,
              pleaseParse,
            } = args as any;
            const body: any = { link };

            if (title) body.title = title;
            if (excerpt) body.excerpt = excerpt;
            if (tags) body.tags = tags;
            if (collectionId) body.collection = { $id: collectionId };
            if (pleaseParse) body.pleaseParse = {};

            const data = await this.makeRequest("/raindrop", "POST", body);
            return {
              content: [
                {
                  type: "text",
                  text: `✓ Bookmark created successfully!\n\n${JSON.stringify(
                    data,
                    null,
                    2
                  )}`,
                },
              ],
            };
          }

          case "update_raindrop": {
            const {
              id,
              link,
              title,
              excerpt,
              tags,
              important,
              collectionId,
            } = args as any;
            const body: any = {};

            if (link) body.link = link;
            if (title) body.title = title;
            if (excerpt) body.excerpt = excerpt;
            if (tags) body.tags = tags;
            if (important !== undefined) body.important = important;
            if (collectionId) body.collection = { $id: collectionId };

            const data = await this.makeRequest(
              `/raindrop/${id}`,
              "PUT",
              body
            );
            return {
              content: [
                {
                  type: "text",
                  text: `✓ Bookmark updated successfully!\n\n${JSON.stringify(
                    data,
                    null,
                    2
                  )}`,
                },
              ],
            };
          }

          case "delete_raindrop": {
            const { id } = args as { id: number };
            await this.makeRequest(`/raindrop/${id}`, "DELETE");
            return {
              content: [
                {
                  type: "text",
                  text: `✓ Bookmark ${id} deleted successfully (moved to Trash)`,
                },
              ],
            };
          }

          case "get_raindrops": {
            const { collectionId, page, perpage, search } = args as any;
            let endpoint = `/raindrops/${collectionId}`;
            const params = new URLSearchParams();

            if (page !== undefined) params.append("page", page.toString());
            if (perpage !== undefined)
              params.append("perpage", perpage.toString());
            if (search) params.append("search", search);

            if (params.toString()) {
              endpoint += `?${params.toString()}`;
            }

            const data = await this.makeRequest(endpoint);
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(data, null, 2),
                },
              ],
            };
          }

          case "get_collections": {
            const data = await this.makeRequest("/collections");
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(data, null, 2),
                },
              ],
            };
          }

          case "get_collections_nested": {
            const data = await this.makeRequest("/collections/childrens");
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(data, null, 2),
                },
              ],
            };
          }

          case "get_collection": {
            const { id } = args as { id: number };
            const data = await this.makeRequest(`/collection/${id}`);
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(data, null, 2),
                },
              ],
            };
          }

          case "create_collection": {
            const { title, parentId, view, public: isPublic } = args as any;
            const body: any = { title };

            if (view) body.view = view;
            if (isPublic !== undefined) body.public = isPublic;
            if (parentId) body.parent = { $id: parentId };

            const data = await this.makeRequest("/collection", "POST", body);
            return {
              content: [
                {
                  type: "text",
                  text: `✓ Collection created successfully!\n\n${JSON.stringify(
                    data,
                    null,
                    2
                  )}`,
                },
              ],
            };
          }

          case "update_collection": {
            const { id, title, view, public: isPublic, parentId } = args as any;
            const body: any = {};

            if (title) body.title = title;
            if (view) body.view = view;
            if (isPublic !== undefined) body.public = isPublic;
            if (parentId) body.parent = { $id: parentId };

            const data = await this.makeRequest(
              `/collection/${id}`,
              "PUT",
              body
            );
            return {
              content: [
                {
                  type: "text",
                  text: `✓ Collection updated successfully!\n\n${JSON.stringify(
                    data,
                    null,
                    2
                  )}`,
                },
              ],
            };
          }

          case "delete_collection": {
            const { id } = args as { id: number };
            await this.makeRequest(`/collection/${id}`, "DELETE");
            return {
              content: [
                {
                  type: "text",
                  text: `✓ Collection ${id} deleted successfully`,
                },
              ],
            };
          }

          case "get_tags": {
            const { collectionId } = args as any;
            const endpoint = collectionId
              ? `/tags/${collectionId}`
              : "/tags";
            const data = await this.makeRequest(endpoint);
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(data, null, 2),
                },
              ],
            };
          }

          case "rename_tag": {
            const { collectionId, tags, newTag } = args as any;
            const body = {
              tags,
              new: newTag,
            };
            const data = await this.makeRequest(
              `/tags/${collectionId}`,
              "PUT",
              body
            );
            return {
              content: [
                {
                  type: "text",
                  text: `✓ Tags renamed to "${newTag}" successfully!\n\n${JSON.stringify(
                    data,
                    null,
                    2
                  )}`,
                },
              ],
            };
          }

          case "delete_tag": {
            const { collectionId, tags } = args as any;
            const body = { tags };
            await this.makeRequest(
              `/tags/${collectionId}`,
              "DELETE",
              body
            );
            return {
              content: [
                {
                  type: "text",
                  text: `✓ Tags ${tags.join(", ")} deleted successfully`,
                },
              ],
            };
          }

          case "search_raindrops": {
            const { search, page, perpage } = args as any;
            let endpoint = "/raindrops/0";
            const params = new URLSearchParams();

            params.append("search", search);
            if (page !== undefined) params.append("page", page.toString());
            if (perpage !== undefined)
              params.append("perpage", perpage.toString());

            endpoint += `?${params.toString()}`;

            const data = await this.makeRequest(endpoint);
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(data, null, 2),
                },
              ],
            };
          }

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Raindrop MCP Server running on stdio");
  }
}

const server = new RaindropMCPServer();
server.start().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
