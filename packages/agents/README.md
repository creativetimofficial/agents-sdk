# @creative-tim/agents

Official SDK for [Creative Tim OpenClaw](https://www.creative-tim.com) — programmatically create and control AI agents from your code.

```ts
import { OpenClaw } from '@creative-tim/agents'

const client = new OpenClaw({ apiKey: 'sk-ct-...' })

const agent = await client.agents.create({
  name: 'My Agent',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY!,
})

const { text } = await agent.chat('Hello! What can you do?')
console.log(text)
```

## Installation

```bash
npm install @creative-tim/agents
# or
pnpm add @creative-tim/agents
# or
bun add @creative-tim/agents
```

## Getting an API Key

1. Go to [creative-tim.com/ui/dashboard/api-keys](https://www.creative-tim.com/ui/dashboard/api-keys)
2. Scroll to **OpenClaw Agents API Keys**
3. Click **Create API key** — copy your `sk-ct-...` key (shown once)

## Usage

### Initialize

```ts
import { OpenClaw } from '@creative-tim/agents'

const client = new OpenClaw({
  apiKey: process.env.OPENCLAW_API_KEY!, // sk-ct-...
})
```

### Create an agent

`agents.create()` provisions a new persistent agent. Call it **once per user or use-case**, store the returned `agent.id`, and reconnect to the same agent on every subsequent request using `agents.get()`.

```ts
const agent = await client.agents.create({
  name: 'Research Bot',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY!,
  model: 'claude-sonnet-4-6', // optional, default: claude-sonnet-4-6
})

// Persist the ID — you will need it to reconnect later
await db.save({ agentId: agent.id })
```

> **Cold start:** A new agent takes ~60–80 seconds to provision. If a pre-warmed container is available (automatically spun up when you created your API key) it takes ~15–20 seconds instead. Poll `agent.status()` until `status === 'active'` before chatting.

### Wait for an agent to be ready

After `create()`, poll until `status === 'active'` before sending messages:

```ts
let status
do {
  await new Promise(r => setTimeout(r, 5000))
  status = await agent.status()
} while (status.status === 'provisioning')

if (status.status === 'error') throw new Error('Agent provisioning failed')
// agent is now active — safe to chat
```

### Reconnect to an existing agent

`agents.get()` returns a handle to an already-running agent **without any API call**. Use this on every page load instead of calling `create()` again.

```ts
// Retrieve the stored ID from your database
const agentId = await db.get(userId).agentId

// Instant — no provisioning, no cold start
const agent = client.agents.get(agentId)
const { text } = await agent.chat('Hello!')
```

| Scenario | Time |
|----------|------|
| `create()` with pre-warmed instance | ~15–20 s |
| `create()` cold (no pre-warm available) | ~60–80 s |
| `get(id).chat()` on a running agent | ~1–2 s (LLM only) |

### Chat

```ts
const { text, sessionKey } = await agent.chat('Summarise this paper: ...')

// Continue the same conversation thread
const followUp = await agent.chat('Can you expand on point 3?', { sessionId: sessionKey })
```

### Stream responses

```ts
for await (const chunk of agent.stream('Write me a poem about the ocean')) {
  process.stdout.write(chunk)
}
```

### List agents

```ts
const agents = await client.agents.list()
// [{ id, name, status, createdAt, ... }]
```

### Get an existing agent by ID

```ts
const agent = client.agents.get('sdk-ab3k7')
const status = await agent.status()
```

### Skills

Skills let you extend an agent with custom capabilities defined in markdown.

```ts
// Install a skill
await agent.skills.install('web-search', `
# Web Search Skill
You can search the web using the provided search API.
When asked to find something online, call this skill.
`)

// List installed skills
const skills = await agent.skills.list()

// Remove a skill
await agent.skills.remove('web-search')
```

### Delete an agent

```ts
await agent.delete()
```

## API Reference

### `new OpenClaw(config)`

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `apiKey` | `string` | Yes | Your `sk-ct-...` API key |
| `baseUrl` | `string` | No | Override API base URL (defaults to `https://www.creative-tim.com/ui`) |

### `client.agents`

| Method | Returns | Description |
|--------|---------|-------------|
| `create(options)` | `Promise<AgentHandle>` | Create a new agent |
| `list()` | `Promise<Agent[]>` | List all your agents |
| `get(agentId)` | `AgentHandle` | Get a handle to an existing agent |

### `AgentHandle`

| Method | Returns | Description |
|--------|---------|-------------|
| `status()` | `Promise<Agent>` | Get current agent status |
| `chat(message, options?)` | `Promise<ChatResponse>` | Send a message, get a response |
| `stream(message, options?)` | `AsyncGenerator<string>` | Stream response chunks |
| `skills.list()` | `Promise<Skill[]>` | List installed skills |
| `skills.install(name, content)` | `Promise<void>` | Install a skill |
| `skills.remove(name)` | `Promise<void>` | Remove a skill |
| `delete()` | `Promise<void>` | Permanently delete the agent |

### `CreateAgentOptions`

```ts
interface CreateAgentOptions {
  name: string
  anthropicApiKey: string
  model?: string // default: claude-sonnet-4-6
}
```

### `ChatResponse`

```ts
interface ChatResponse {
  text: string       // the agent's reply
  sessionKey: string // pass as sessionId to continue the thread
  raw: unknown       // full gateway response
}
```

## TypeScript

The package ships with full TypeScript declarations. All types are exported from the root:

```ts
import type { Agent, AgentHandle, CreateAgentOptions, ChatResponse, Skill } from '@creative-tim/agents'
```

## License

Apache-2.0 — [Creative Tim](https://www.creative-tim.com)

---

**OpenClaw** is an independent open-source project and is not affiliated with or endorsed by Creative Tim. OpenClaw is licensed under the MIT License. For more information visit [openclaw.ai](https://openclaw.ai) or the [OpenClaw GitHub repository](https://github.com/openclaw/openclaw).
