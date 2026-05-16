import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { korveoConfig } from '../src/config.js';
import { KorveoExporter } from '../src/exporter.js';

describe('korveoConfig()', () => {
  let originalEnv: Record<string, string | undefined>;
  beforeEach(() => {
    originalEnv = {
      KORVEO_HOST: process.env.KORVEO_HOST,
      KORVEO_API_KEY: process.env.KORVEO_API_KEY,
      KORVEO_SERVICE_NAME: process.env.KORVEO_SERVICE_NAME,
    };
  });
  afterEach(() => {
    for (const [k, v] of Object.entries(originalEnv)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  });

  test('returns Mastra-shaped config with defaults', () => {
    const cfg = korveoConfig();
    expect(cfg.configs.korveo).toBeDefined();
    expect(cfg.configs.korveo.serviceName).toBe('mastra-app');
    expect(cfg.configs.korveo.exporters).toHaveLength(1);
    expect(cfg.configs.korveo.exporters[0]).toBeInstanceOf(KorveoExporter);
  });

  test('serviceName from env var KORVEO_SERVICE_NAME', () => {
    process.env.KORVEO_SERVICE_NAME = 'my-prod-app';
    const cfg = korveoConfig();
    expect(cfg.configs.korveo.serviceName).toBe('my-prod-app');
  });

  test('configName option lets users name the block', () => {
    const cfg = korveoConfig({ configName: 'local-tracing' });
    expect(cfg.configs['local-tracing']).toBeDefined();
    expect(cfg.configs.korveo).toBeUndefined();
  });

  test('explicit serviceName overrides env', () => {
    process.env.KORVEO_SERVICE_NAME = 'env-name';
    const cfg = korveoConfig({ serviceName: 'explicit-name' });
    expect(cfg.configs.korveo.serviceName).toBe('explicit-name');
  });

  test('exporter is wired with the supplied options', async () => {
    const captured: { url?: string; headers?: Record<string, string> } = {};
    const fakeFetch: typeof fetch = async (url, init) => {
      captured.url = String(url);
      captured.headers = init?.headers as Record<string, string>;
      return new Response('{}');
    };
    const cfg = korveoConfig({
      host: 'http://my-korveo:8000',
      apiKey: 'k',
      project: 'demo',
      fetchImpl: fakeFetch,
    });
    const exporter = cfg.configs.korveo.exporters[0];
    // Trigger an export to assert the exporter actually carries the config
    await new Promise((r) =>
      exporter.export(
        [
          {
            name: 's',
            kind: 1,
            spanContext: () => ({
              traceId: 't',
              spanId: 'a',
              traceFlags: 0,
              isRemote: false,
            }),
            parentSpanId: undefined,
            startTime: [0, 0],
            endTime: [0, 1_000_000],
            status: { code: 0 },
            attributes: {},
            links: [],
            events: [],
            duration: [0, 1_000_000],
            ended: true,
            resource: { attributes: {}, merge: () => undefined } as never,
            instrumentationLibrary: { name: 't', version: '0' },
            droppedAttributesCount: 0,
            droppedEventsCount: 0,
            droppedLinksCount: 0,
          },
        ],
        r as (v: unknown) => void,
      ),
    );
    expect(captured.url).toBe('http://my-korveo:8000/v1/spans');
    expect(captured.headers!['Authorization']).toBe('Bearer k');
    expect(captured.headers!['X-Korveo-Project']).toBe('demo');
  });
});

describe('tryAttach() — pure attachment logic (no env, no module state)', () => {
  test('attaches when provider exposes addSpanProcessor directly', async () => {
    const { tryAttach } = await import('../src/auto.js');
    let added: unknown = null;
    const provider = {
      getTracer: () => ({}) as never,
      addSpanProcessor: (p: unknown) => {
        added = p;
      },
    };
    expect(tryAttach(provider as never)).toBe(true);
    expect(added).not.toBeNull();
  });

  test('walks getDelegate() chain to find a compatible provider', async () => {
    const { tryAttach } = await import('../src/auto.js');
    let added: unknown = null;
    const delegate = {
      getTracer: () => ({}) as never,
      addSpanProcessor: (p: unknown) => {
        added = p;
      },
    };
    const proxy = {
      getTracer: () => ({}) as never,
      getDelegate: () => delegate,
    };
    expect(tryAttach(proxy as never)).toBe(true);
    expect(added).not.toBeNull();
  });

  test('returns false when no addSpanProcessor reachable (modern OTel)', async () => {
    const { tryAttach } = await import('../src/auto.js');
    const modernProxy = { getTracer: () => ({}) as never };
    expect(tryAttach(modernProxy as never)).toBe(false);
  });

  test('returns false when proxy chain is too deep without a target', async () => {
    const { tryAttach } = await import('../src/auto.js');
    let p: unknown = { getTracer: () => ({}) };
    for (let i = 0; i < 10; i++) {
      const inner = p;
      p = {
        getTracer: () => ({}) as never,
        getDelegate: () => inner,
      };
    }
    expect(tryAttach(p as never)).toBe(false);
  });
});

describe('installKorveoTracing() — env gate', () => {
  let originalEnv: string | undefined;
  beforeEach(() => {
    originalEnv = process.env.KORVEO_TRACING;
  });
  afterEach(() => {
    if (originalEnv === undefined) delete process.env.KORVEO_TRACING;
    else process.env.KORVEO_TRACING = originalEnv;
  });

  test('returns false when KORVEO_TRACING is unset', async () => {
    delete process.env.KORVEO_TRACING;
    const { installKorveoTracing } = await import('../src/auto.js');
    expect(installKorveoTracing()).toBe(false);
  });

  test('returns false when KORVEO_TRACING is enabled but the global provider is a default no-op proxy (no addSpanProcessor in the chain)', async () => {
    // No fresh module import — the default OTel global provider is a
    // proxy whose delegate (if any) doesn't expose addSpanProcessor.
    process.env.KORVEO_TRACING = 'true';
    const { installKorveoTracing } = await import('../src/auto.js');
    expect(installKorveoTracing()).toBe(false);
  });
});
