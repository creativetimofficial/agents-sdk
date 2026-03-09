import { AgentsResource } from './agents'
import type { OpenClawConfig } from './types'

export class OpenClaw {
  readonly agents: AgentsResource
  private readonly baseUrl: string

  constructor(config: OpenClawConfig) {
    if (!config.apiKey) throw new Error('OpenClaw: apiKey is required')
    if (!config.apiKey.startsWith('sk-ct-')) {
      throw new Error('OpenClaw: invalid apiKey format — expected sk-ct-...')
    }
    this.baseUrl = (config.baseUrl ?? 'https://www.creative-tim.com/ui').replace(/\/$/, '')
    this.agents = new AgentsResource(config.apiKey, this.baseUrl)
  }
}

export type {
  OpenClawConfig,
  Agent,
  CreateAgentOptions,
  ChatOptions,
  ChatResponse,
  StreamOptions,
  Skill,
  ApiKey,
  CreatedApiKey,
} from './types'

export { AgentHandle, AgentsResource } from './agents'
