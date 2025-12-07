# Overview

This is a Model Context Protocol (MCP) server that enables AI agents to interact with the Raindrop.io bookmarking service. The server exposes comprehensive bookmark management functionality including CRUD operations for bookmarks (raindrops), collections, tags, and user information retrieval. Built with TypeScript and the MCP SDK, it acts as a bridge between AI assistants and the Raindrop.io REST API.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Application Type
Command-line server application following the Model Context Protocol specification. Runs as a standalone process that communicates via stdio transport.

## Core Technologies
- **Runtime**: Node.js (v18+)
- **Language**: TypeScript with ES2022 target and Node16 module resolution
- **Protocol**: Model Context Protocol (MCP) SDK v1.0.4+
- **Build System**: TypeScript compiler with output to `build/` directory

## Authentication Architecture
API token-based authentication using environment variables:
- Requires `RAINDROP_API_TOKEN` environment variable at startup
- Token passed as Bearer authorization header to all Raindrop.io API requests
- Application exits immediately if token is not provided

## Communication Protocol
- **Transport**: StdioServerTransport for MCP communication
- **Server Type**: MCP Server with tools capability
- **Request Handlers**: Implements `ListToolsRequestSchema` and `CallToolRequestSchema`
- AI agents communicate with the server through stdio, and the server makes HTTP requests to Raindrop.io API

## API Integration Pattern
Centralized request handler (`makeRequest` method) that:
- Constructs full URLs using `RAINDROP_API_BASE` constant
- Handles HTTP methods (GET, POST, PUT, DELETE)
- Manages authorization headers automatically
- Processes JSON request/response bodies
- Implements error handling with status code checking
- Returns parsed JSON or success objects

## Tool Architecture
Server exposes multiple tools organized by functional domain:
- **Raindrops**: Bookmark CRUD operations (get, create, update, delete, search, list)
- **Collections**: Folder/collection management (get, create, update, delete, nested retrieval)
- **Tags**: Tag operations (get, rename, delete)
- **User**: User information retrieval

Each tool is registered with the MCP SDK and includes schema definitions for parameters and validation.

## Error Handling
- Environment validation at startup (exits on missing token)
- HTTP error responses from Raindrop.io API are caught and re-thrown with status codes
- 204 No Content responses handled specially with success objects

## Distribution
- Published as npm package with executable binary
- Main entry point: `build/index.js` (marked executable via chmod in build script)
- Includes only build artifacts in npm package (`files: ["build"]`)

# External Dependencies

## Third-Party APIs
- **Raindrop.io REST API v1** (`https://api.raindrop.io/rest/v1`)
  - Full read/write access to bookmarks, collections, tags, and user data
  - Requires API token from Raindrop.io settings/integrations
  - Authentication via Bearer token

## NPM Dependencies
- **@modelcontextprotocol/sdk** (^1.0.4): Core MCP protocol implementation
  - Provides Server, StdioServerTransport, and schema types
  - Required for all MCP server functionality

## Development Dependencies
- **TypeScript** (^5.7.2): Type system and compiler
- **@types/node** (^22.10.2): Node.js type definitions

## Hosting/Deployment Options
- Self-hosted: Run directly with Node.js using stdio transport
- Smithery: Managed hosting platform for MCP servers (mentioned in README)