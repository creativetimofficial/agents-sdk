# @creative-tim/mcp

MCP (Model Context Protocol) server for [Creative Tim OpenClaw](https://www.creative-tim.com). Lets Claude Code, Cursor, Lovable, and any other MCP-compatible AI tool spawn and control AI agents programmatically.

## What it does

Adds 9 tools to your AI assistant:

| Tool | Description |
|------|-------------|
| `create_agent` | Spin up a new OpenClaw AI agent |
| `list_agents` | List all your agents and their status |
| `get_agent` | Check an agent's current status and lifecycle state |
| `chat` | Send a message and get a reply |
| `install_skill` | Add a capability to an agent |
| `list_skills` | See what skills an agent has |
| `remove_skill` | Remove a skill from an agent |
| `restart_agent` | Restart an agent that's in error state — no data loss |
| `delete_agent` | Permanently delete an agent |

## Getting an API Key

1. Go to [creative-tim.com/ui/dashboard/api-keys](https://www.creative-tim.com/ui/dashboard/api-keys)
2. Scroll to **OpenClaw Agents API Keys**
3. Click **Create API key** — copy your `sk-ct-...` key (shown once)

## Setup

### Claude Code

Add to your project's `.mcp.json`:

```json
{
  "mcpServers": {
    "creative-tim": {
      "command": "npx",
      "args": ["-y", "@creative-tim/mcp"],
      "env": {
        "OPENCLAW_API_KEY": "sk-ct-..."
      }
    }
  }
}
```

Or add globally via `~/.claude/mcp.json` to use across all projects.

### Cursor

Add to `~/.cursor/mcp.json` (or your project's `.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "creative-tim": {
      "command": "npx",
      "args": ["-y", "@creative-tim/mcp"],
      "env": {
        "OPENCLAW_API_KEY": "sk-ct-..."
      }
    }
  }
}
```

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "creative-tim": {
      "command": "npx",
      "args": ["-y", "@creative-tim/mcp"],
      "env": {
        "OPENCLAW_API_KEY": "sk-ct-..."
      }
    }
  }
}
```

**Config file location:**
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

## Environment Variables

| Variable | Description |
|----------|-------------|
| `OPENCLAW_API_KEY` | Your `sk-ct-...` API key (required) |
| `CREATIVE_TIM_API_KEY` | Alias for `OPENCLAW_API_KEY` |

## Agent lifecycle

Agents move through the following states. Use `get_agent` to check status:

| Status | Meaning |
|--------|---------|
| `provisioning` | Agent is starting up (~60–80s on first create) |
| `active` | Ready to chat |
| `error` | Transient error — use `restart_agent` to recover |

## Example prompts

Once installed, you can ask your AI assistant:

- *"Create a new OpenClaw agent called Research Bot using my Anthropic key sk-ant-..."*
- *"List all my OpenClaw agents"*
- *"Wait for agent sdk-ab3k7 to be active, then chat with it and ask it to summarise this document"*
- *"Install a web-search skill on my agent"*
- *"My agent sdk-ab3k7 is in error state — restart it"*
- *"Delete agent sdk-ab3k7 when you're done"*

## Run directly

```bash
OPENCLAW_API_KEY=sk-ct-... npx @creative-tim/mcp
```

Or install globally:

```bash
npm install -g @creative-tim/mcp
OPENCLAW_API_KEY=sk-ct-... ct-mcp
```

## How it works

The MCP server wraps the [`@creative-tim/agents`](https://www.npmjs.com/package/@creative-tim/agents) SDK and exposes its methods as MCP tools over stdio. Your AI assistant calls these tools to manage the full agent lifecycle without leaving the conversation.

Agent provisioning takes ~60–80 seconds on first creation. If a pre-warmed instance is available it takes ~15–20 seconds instead.

## License

Apache-2.0 — [Creative Tim](https://www.creative-tim.com)

---

**OpenClaw** is an independent open-source project and is not affiliated with or endorsed by Creative Tim. OpenClaw is licensed under the MIT License. For more information visit [openclaw.ai](https://openclaw.ai) or the [OpenClaw GitHub repository](https://github.com/openclaw/openclaw).
