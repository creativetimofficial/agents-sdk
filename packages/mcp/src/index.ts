import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import { OpenClaw, AgentHandle } from '@creative-tim/agents'

const apiKey = process.env.OPENCLAW_API_KEY ?? process.env.CREATIVE_TIM_API_KEY
if (!apiKey) {
  console.error('Error: OPENCLAW_API_KEY environment variable is required')
  process.exit(1)
}

const client = new OpenClaw({ apiKey })

// Cache open agent handles so we don't recreate them on every call
const agentCache = new Map<string, AgentHandle>()
function getAgent(id: string): AgentHandle {
  if (!agentCache.has(id)) agentCache.set(id, client.agents.get(id))
  return agentCache.get(id)!
}

const server = new McpServer({
  name: 'creative-tim-openclaw',
  version: '0.1.0',
})

// ── Tools ────────────────────────────────────────────────────────────────────

server.tool(
  'create_agent',
  'Create a new OpenClaw AI agent. Returns the agent ID. The agent will be ready to chat within ~60-80 seconds if no warm instance is available.',
  {
    name:            z.string().describe('Human-readable name for the agent'),
    anthropicApiKey: z.string().describe('Your Anthropic API key for this agent'),
    model:           z.string().optional().describe('Claude model to use (default: claude-sonnet-4-6)'),
  },
  async ({ name, anthropicApiKey, model }) => {
    const agent = await client.agents.create({ name, anthropicApiKey, model })
    const status = await agent.status()
    agentCache.set(status.id, agent)
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          agentId: status.id,
          name: status.name,
          status: status.status,
          warm: status.warm,
          message: status.status === 'active'
            ? 'Agent is ready to use.'
            : 'Agent is provisioning. Call get_agent to check when ready.',
        }, null, 2),
      }],
    }
  }
)

server.tool(
  'list_agents',
  'List all OpenClaw agents for your API key.',
  {},
  async () => {
    const agents = await client.agents.list()
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(agents, null, 2),
      }],
    }
  }
)

server.tool(
  'get_agent',
  'Get the current status of a specific agent.',
  {
    agentId: z.string().describe('The agent ID returned by create_agent'),
  },
  async ({ agentId }) => {
    const status = await getAgent(agentId).status()
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(status, null, 2),
      }],
    }
  }
)

server.tool(
  'chat',
  'Send a message to an OpenClaw agent and get a response.',
  {
    agentId:   z.string().describe('The agent ID'),
    message:   z.string().describe('The message to send'),
    sessionId: z.string().optional().describe('Session ID to continue a conversation thread'),
  },
  async ({ agentId, message, sessionId }) => {
    const response = await getAgent(agentId).chat(message, { sessionId })
    return {
      content: [{
        type: 'text',
        text: response.text,
      }],
    }
  }
)

server.tool(
  'install_skill',
  'Install a skill (tool/capability) into an OpenClaw agent.',
  {
    agentId:      z.string().describe('The agent ID'),
    skillName:    z.string().describe('Name for the skill, e.g. "web-search"'),
    skillContent: z.string().describe('The SKILL.md content defining what the skill does'),
  },
  async ({ agentId, skillName, skillContent }) => {
    await getAgent(agentId).skills.install(skillName, skillContent)
    return {
      content: [{
        type: 'text',
        text: `Skill "${skillName}" installed successfully on agent ${agentId}.`,
      }],
    }
  }
)

server.tool(
  'list_skills',
  'List all skills installed on an agent.',
  {
    agentId: z.string().describe('The agent ID'),
  },
  async ({ agentId }) => {
    const skills = await getAgent(agentId).skills.list()
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(skills, null, 2),
      }],
    }
  }
)

server.tool(
  'remove_skill',
  'Remove an installed skill from an agent.',
  {
    agentId:   z.string().describe('The agent ID'),
    skillName: z.string().describe('The skill name to remove'),
  },
  async ({ agentId, skillName }) => {
    await getAgent(agentId).skills.remove(skillName)
    return {
      content: [{
        type: 'text',
        text: `Skill "${skillName}" removed from agent ${agentId}.`,
      }],
    }
  }
)

server.tool(
  'restart_agent',
  'Restart an OpenClaw agent. Restarts the agent process without touching any data — skills, conversation history, and configuration are all preserved. Use this to recover from an error state or after a transient failure. The agent will be briefly unavailable (~10–30s) while it restarts.',
  {
    agentId: z.string().describe('The agent ID to restart'),
  },
  async ({ agentId }) => {
    await getAgent(agentId).restart()
    agentCache.delete(agentId) // clear cached handle so next call re-fetches fresh status
    return {
      content: [{
        type: 'text',
        text: `Agent ${agentId} is restarting. It will be active again in ~10–30 seconds. Use get_agent to check when status returns to "active".`,
      }],
    }
  }
)

server.tool(
  'delete_agent',
  'Permanently delete an OpenClaw agent and its container.',
  {
    agentId: z.string().describe('The agent ID to delete'),
  },
  async ({ agentId }) => {
    await getAgent(agentId).delete()
    agentCache.delete(agentId)
    return {
      content: [{
        type: 'text',
        text: `Agent ${agentId} deleted successfully.`,
      }],
    }
  }
)

// ── Start ────────────────────────────────────────────────────────────────────

const transport = new StdioServerTransport()
await server.connect(transport)
