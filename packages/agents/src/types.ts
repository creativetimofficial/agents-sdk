export interface OpenClawConfig {
  apiKey: string
  baseUrl?: string // defaults to https://www.creative-tim.com/ui
}

export interface Agent {
  id: string
  name: string
  status: 'provisioning' | 'active' | 'error'
  lifecycleState: string
  model?: string
  warm?: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateAgentOptions {
  name: string
  anthropicApiKey: string
  model?: string // default: claude-sonnet-4-6
}

export interface ChatOptions {
  sessionId?: string
  stream?: false
}

export interface StreamOptions {
  sessionId?: string
}

export interface ChatResponse {
  text: string
  sessionKey: string
  raw: unknown
}

export interface Skill {
  name: string
  description?: string
  [key: string]: unknown
}

export interface ApiKey {
  id: string
  name: string
  prefix: string
  createdAt: string
  lastUsedAt?: string
  revokedAt?: string
}

export interface CreatedApiKey extends ApiKey {
  secret: string // returned once only
}
