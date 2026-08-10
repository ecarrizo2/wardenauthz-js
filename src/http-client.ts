export interface RetryConfig {
  maxRetries: number
  baseDelayMs: number
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 1000,
}

export interface RequestOptions {
  signal?: AbortSignal
  retry?: Partial<RetryConfig> | false
}

const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504])

function isRetryable(status: number): boolean {
  return RETRYABLE_STATUSES.has(status)
}

export class WardenAuthApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body: unknown
  ) {
    super(message)
    this.name = 'WardenAuthApiError'
  }
}

export class WardenAuthRetryError extends WardenAuthApiError {
  constructor(
    message: string,
    status: number,
    body: unknown,
    public readonly attempts: number
  ) {
    super(message, status, body)
    this.name = 'WardenAuthRetryError'
  }
}

/**
 * Best-effort connection keep-alive tuning for Node runtimes.
 *
 * Node's global `fetch` (undici) already pools connections, but the default
 * keep-alive timeout is short. When undici is resolvable we install a tuned
 * global dispatcher with a longer keep-alive and a larger connection pool so
 * high-throughput server usage reuses warm TLS connections instead of paying a
 * handshake per call. This is a silent no-op in browsers / edge runtimes (or
 * when undici is not installed), where the platform handles keep-alive itself.
 */
let dispatcherTuned = false
async function tuneNodeKeepAlive(): Promise<void> {
  if (dispatcherTuned) return
  dispatcherTuned = true

  const isNode = typeof process !== 'undefined' && process.versions != null && process.versions.node != null
  if (!isNode) return

  try {
    const moduleName = 'undici'
    const undici = (await import(moduleName)) as {
      Agent: new (opts: Record<string, unknown>) => unknown
      setGlobalDispatcher: (dispatcher: unknown) => void
    }
    undici.setGlobalDispatcher(
      new undici.Agent({
        keepAliveTimeout: 60_000,
        keepAliveMaxTimeout: 600_000,
        connections: 128,
      })
    )
  } catch {
    // undici not resolvable (browser/edge or not installed) — built-in fetch
    // keep-alive still applies, so this is a safe no-op.
    return
  }
}

void tuneNodeKeepAlive()

export class HttpClient {
  private readonly retryConfig: RetryConfig

  constructor(
    private readonly baseUrl: string,
    private readonly apiKey: string
  ) {
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG }
  }

  private headers(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const text = await response.text()
    const body = text ? JSON.parse(text) : undefined

    if (!response.ok) {
      throw new WardenAuthApiError(
        `WardenAuth API error ${response.status}: ${response.statusText}`,
        response.status,
        body
      )
    }

    return body as T
  }

  private resolveRetryConfig(opts?: RequestOptions): RetryConfig | false {
    if (opts?.retry === false) {
      return false
    }

    if (opts?.retry) {
      return { ...this.retryConfig, ...opts.retry }
    }

    return { ...this.retryConfig }
  }

  private async withRetry<T>(fn: () => Promise<T>, opts?: RequestOptions): Promise<T> {
    const retry = this.resolveRetryConfig(opts)

    if (!retry) {
      return fn()
    }

    let lastError: Error | undefined

    for (let attempt = 0; attempt <= retry.maxRetries; attempt++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error as Error

        if (error instanceof WardenAuthApiError && isRetryable(error.status)) {
          if (attempt < retry.maxRetries) {
            const delay = retry.baseDelayMs * Math.pow(2, attempt)
            await new Promise((resolve) => setTimeout(resolve, delay))
            continue
          }

          throw new WardenAuthRetryError(error.message, error.status, error.body, attempt + 1)
        }

        throw error
      }
    }

    throw lastError
  }

  async get<T = unknown>(path: string, opts?: RequestOptions): Promise<T> {
    return this.withRetry(async () => {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method: 'GET',
        headers: this.headers(),
        signal: opts?.signal,
      })

      return this.handleResponse<T>(response)
    }, opts)
  }

  async post<T = unknown>(path: string, body: unknown, opts?: RequestOptions): Promise<T> {
    return this.withRetry(async () => {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify(body),
        signal: opts?.signal,
      })

      return this.handleResponse<T>(response)
    }, opts)
  }

  async patch<T = unknown>(path: string, body: unknown, opts?: RequestOptions): Promise<T> {
    return this.withRetry(async () => {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method: 'PATCH',
        headers: this.headers(),
        body: JSON.stringify(body),
        signal: opts?.signal,
      })

      return this.handleResponse<T>(response)
    }, opts)
  }

  async put<T = unknown>(path: string, body: unknown, opts?: RequestOptions): Promise<T> {
    return this.withRetry(async () => {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method: 'PUT',
        headers: this.headers(),
        body: JSON.stringify(body),
        signal: opts?.signal,
      })

      return this.handleResponse<T>(response)
    }, opts)
  }

  async delete<T = void>(path: string, body?: unknown, opts?: RequestOptions): Promise<T> {
    return this.withRetry(async () => {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method: 'DELETE',
        headers: this.headers(),
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
        signal: opts?.signal,
      })

      return this.handleResponse<T>(response)
    }, opts)
  }

  async getRawText(path: string, opts?: RequestOptions): Promise<string> {
    return this.withRetry(async () => {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method: 'GET',
        headers: this.headers(),
        signal: opts?.signal,
      })

      if (!response.ok) {
        const text = await response.text()
        throw new WardenAuthApiError(
          `WardenAuth API error ${response.status}: ${response.statusText}`,
          response.status,
          text
        )
      }

      return response.text()
    }, opts)
  }
}
