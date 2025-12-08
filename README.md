# Raindrop.io MCP Server

[![smithery badge](https://smithery.ai/badge/@NOVA-3951/raindrop)](https://smithery.ai/server/@NOVA-3951/raindrop)

A Model Context Protocol (MCP) server that provides AI agents with full read/write access to Raindrop.io bookmarks, collections, and tags.

## Features

This MCP server exposes comprehensive Raindrop.io functionality to AI assistants:

### 📑 Raindrops (Bookmarks)
- **get_raindrop** - Get a single bookmark by ID
- **create_raindrop** - Create new bookmarks with URL, title, tags, and collection
- **update_raindrop** - Update existing bookmarks
- **delete_raindrop** - Delete bookmarks (moves to Trash)
- **get_raindrops** - List bookmarks from a collection with search and pagination
- **search_raindrops** - Search across all bookmarks

### 📁 Collections
- **get_collections** - Get all root collections
- **get_collections_nested** - Get nested/children collections
- **get_collection** - Get a single collection by ID
- **create_collection** - Create new collections with custom view styles
- **update_collection** - Update collection properties
- **delete_collection** - Delete collections

### 🏷️ Tags
- **get_tags** - Get all tags or tags from a specific collection
- **rename_tag** - Rename or merge tags
- **delete_tag** - Remove tags from bookmarks

### 👤 User
- **get_user** - Get current user information

## Installation & Usage

### Prerequisites

1. Get your Raindrop.io API token:
   - Go to https://app.raindrop.io/settings/integrations
   - Create a new app/integration
   - Copy the "Test token" (for personal use) or set up OAuth

### Option 1: Use with Smithery (Hosted)

The easiest way to use this MCP server is through [Smithery](https://smithery.ai/):

1. Visit the Smithery registry and find this server
2. Click "Install" and provide your Raindrop.io API token
3. The server will be automatically configured and hosted
4. Use it with Claude Desktop, Cursor, or any MCP-compatible client

### Option 2: Local Installation

#### Install from npm (once published)

```bash
npm install -g raindrop-mcp-server
```

#### Or build from source

```bash
# Clone the repository
git clone <repository-url>
cd raindrop-mcp-server

# Install dependencies
npm install

# Build the project
npm run build
```

### Configuration

#### With Claude Desktop

Add to your `claude_desktop_config.json`:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "raindrop": {
      "command": "node",
      "args": ["/path/to/raindrop-mcp-server/build/index.js"],
      "env": {
        "RAINDROP_API_TOKEN": "your-api-token-here"
      }
    }
  }
}
```

#### With Other MCP Clients

Use the standard MCP STDIO transport with the environment variable:

```bash
RAINDROP_API_TOKEN="your-token" node build/index.js
```

## Usage Examples

Once configured, you can ask your AI assistant things like:

- "Show me all my bookmarks tagged with 'design'"
- "Create a new bookmark for https://example.com with the tag 'resources'"
- "List all my collections"
- "Create a new collection called 'AI Tools'"
- "Move bookmark ID 12345 to my 'Work' collection"
- "Search for all bookmarks about TypeScript"
- "Rename the tag 'js' to 'javascript' across all collections"

## Development

### Build

```bash
npm run build
```

### Watch mode (for development)

```bash
npm run watch
```

### Test with MCP Inspector

```bash
npm run inspector
```

This opens an interactive testing interface where you can call tools and see responses.

## API Reference

### System Collections

Raindrop.io has special system collection IDs:

- `0` - All bookmarks
- `-1` - Unsorted collection
- `-99` - Trash

### Rate Limiting

The Raindrop.io API allows:
- **120 requests per minute** per authenticated user
- Rate limit headers are included in responses

### Response Format

All tools return JSON responses from the Raindrop.io API. Successful mutations include success confirmations with the updated data.

## Security

- Never commit your API token to version control
- Use environment variables or secure secret management
- When using Smithery, tokens are handled securely and not stored long-term

## License

MIT

## Resources

- [Raindrop.io API Documentation](https://developer.raindrop.io)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [Smithery](https://smithery.ai)