# Creative Tim Agents SDK

Programmatically create and control [OpenClaw](https://openclaw.ai) AI agents from your code or AI assistant.

## Packages

| Package | Version | Description |
|---------|---------|-------------|
| [`@creative-tim/agents`](./packages/agents) | [![npm](https://img.shields.io/npm/v/@creative-tim/agents)](https://www.npmjs.com/package/@creative-tim/agents) | TypeScript SDK — create agents, chat, stream, manage skills |
| [`@creative-tim/mcp`](./packages/mcp) | [![npm](https://img.shields.io/npm/v/@creative-tim/mcp)](https://www.npmjs.com/package/@creative-tim/mcp) | MCP server — use agents from Claude Code, Cursor, Claude Desktop |

## Quick start

### TypeScript SDK

```bash
npm install @creative-tim/agents
```

```ts
import { OpenClaw } from '@creative-tim/agents'

const client = new OpenClaw({ apiKey: 'sk-ct-...' })

const agent = await client.agents.create({
  name: 'My Agent',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY!,
})

// Poll until ready (~60-80s cold, ~15-20s warm)
let status
do {
  await new Promise(r => setTimeout(r, 5000))
  status = await agent.status()
} while (status.status === 'provisioning')

const { text } = await agent.chat('Hello! What can you do?')
console.log(text)
```

### MCP Server (Claude Code / Cursor)

Add to `.mcp.json`:

```json
{
  "mcpServers": {
    "creative-tim": {
      "command": "npx",
      "args": ["-y", "@creative-tim/mcp"],
      "env": { "OPENCLAW_API_KEY": "sk-ct-..." }
    }
  }
}
```

Then ask your AI: *"Create a new OpenClaw agent and chat with it"*

## Getting an API Key

1. Go to [creative-tim.com/ui/dashboard/api-keys](https://www.creative-tim.com/ui/dashboard/api-keys)
2. Scroll to **OpenClaw Agents API Keys**
3. Click **Create API key** — copy your `sk-ct-...` key (shown once)

## Development

```bash
pnpm install
pnpm build
```

## License

Apache-2.0 — [Creative Tim](https://www.creative-tim.com)

---

**OpenClaw** is an independent open-source project and is not affiliated with or endorsed by Creative Tim. OpenClaw is licensed under the MIT License. For more information visit [openclaw.ai](https://openclaw.ai) or the [OpenClaw GitHub repository](https://github.com/openclaw/openclaw).
