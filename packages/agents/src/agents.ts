import type {
  Agent,
  CreateAgentOptions,
  ChatOptions,
  ChatResponse,
  StreamOptions,
  Skill,
} from './types'

export class AgentHandle {
  get id(): string { return this.agentId }

  constructor(
    private readonly agentId: string,
    private readonly apiKey: string,
    private readonly baseUrl: string
  ) {}

  private get headers() {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    }
  }

  private url(path: string) {
    return `${this.baseUrl}/api/sdk/v1/agents/${this.agentId}${path}`
  }

  async status(): Promise<Agent> {
    const res = await fetch(this.url(''), { headers: this.headers })
    if (!res.ok) throw new Error(`Failed to get agent status: ${res.status}`)
    return res.json() as Promise<Agent>
  }

  async chat(message: string, options: ChatOptions = {}): Promise<ChatResponse> {
    const res = await fetch(this.url('/chat'), {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ message, sessionId: options.sessionId, stream: false }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}) as Record<string, string>)
      throw new Error((err as Record<string, string>).error || `Chat failed: ${res.status}`)
    }
    return res.json() as Promise<ChatResponse>
  }

  async *stream(message: string, options: StreamOptions = {}): AsyncGenerator<string> {
    const res = await fetch(this.url('/chat'), {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ message, sessionId: options.sessionId, stream: true }),
    })
    if (!res.ok) throw new Error(`Stream failed: ${res.status}`)
    if (!res.body) throw new Error('No response body for streaming')

    const reader = res.body.getReader()
    const decoder = new TextDecoder()

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        for (const line of chunk.split('\n')) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.slice(6)) as { choices?: Array<{ delta?: { content?: string } }> }
              const text = data.choices?.[0]?.delta?.content
              if (text) yield text
            } catch { /* skip malformed lines */ }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  }

  readonly skills = {
    list: async (): Promise<Skill[]> => {
      const res = await fetch(this.url('/skills'), { headers: this.headers })
      if (!res.ok) throw new Error(`Failed to list skills: ${res.status}`)
      const data = await res.json() as { skills?: Skill[] }
      return data.skills ?? (data as unknown as Skill[])
    },

    install: async (skillName: string, skillContent: string): Promise<void> => {
      const res = await fetch(this.url('/skills'), {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ skillName, skillContent }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}) as Record<string, string>)
        throw new Error((err as Record<string, string>).error || `Failed to install skill: ${res.status}`)
      }
    },

    remove: async (skillName: string): Promise<void> => {
      const res = await fetch(this.url('/skills'), {
        method: 'DELETE',
        headers: this.headers,
        body: JSON.stringify({ skillName }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}) as Record<string, string>)
        throw new Error((err as Record<string, string>).error || `Failed to remove skill: ${res.status}`)
      }
    },
  }

  async delete(): Promise<void> {
    const res = await fetch(this.url(''), { method: 'DELETE', headers: this.headers })
    if (!res.ok) throw new Error(`Failed to delete agent: ${res.status}`)
  }
}

export class AgentsResource {
  constructor(
    private readonly apiKey: string,
    private readonly baseUrl: string
  ) {}

  private get headers() {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    }
  }

  async create(options: CreateAgentOptions): Promise<AgentHandle> {
    const res = await fetch(`${this.baseUrl}/api/sdk/v1/agents`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(options),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}) as Record<string, string>)
      throw new Error((err as Record<string, string>).error || `Failed to create agent: ${res.status}`)
    }
    const data = await res.json() as { id: string }
    return new AgentHandle(data.id, this.apiKey, this.baseUrl)
  }

  async list(): Promise<Agent[]> {
    const res = await fetch(`${this.baseUrl}/api/sdk/v1/agents`, { headers: this.headers })
    if (!res.ok) throw new Error(`Failed to list agents: ${res.status}`)
    const data = await res.json() as { agents: Agent[] }
    return data.agents
  }

  get(agentId: string): AgentHandle {
    return new AgentHandle(agentId, this.apiKey, this.baseUrl)
  }
}
