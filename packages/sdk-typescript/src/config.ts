export interface KorveoConfig {
  host?: string;
  apiKey?: string | null;
  project?: string;
  captureInputs?: boolean;
  captureOutputs?: boolean;
  maxPayloadSize?: number;
  batchSize?: number;
  flushIntervalMs?: number;
  maxQueueSize?: number;
  exportTimeoutMs?: number;
}

export type ResolvedConfig = Required<KorveoConfig>;

function envOr(name: string, fallback: string): string {
  const v = process.env[name];
  return v && v.length > 0 ? v : fallback;
}

function envOrNull(name: string): string | null {
  const v = process.env[name];
  return v && v.length > 0 ? v : null;
}

export function defaultConfig(): ResolvedConfig {
  return {
    host: envOr('KORVEO_HOST', 'http://localhost:8000'),
    apiKey: envOrNull('KORVEO_API_KEY'),
    project: envOr('KORVEO_PROJECT', 'default'),
    captureInputs: true,
    captureOutputs: true,
    maxPayloadSize: 10_240,
    batchSize: 100,
    flushIntervalMs: 2_000,
    maxQueueSize: 10_000,
    exportTimeoutMs: 5_000,
  };
}

export function resolveConfig(opts: KorveoConfig = {}): ResolvedConfig {
  const base = defaultConfig();
  // Drop undefined values so callers can pass partial overrides without
  // accidentally erasing env-based defaults.
  const filtered: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(opts)) {
    if (v !== undefined) filtered[k] = v;
  }
  return { ...base, ...filtered } as ResolvedConfig;
}
