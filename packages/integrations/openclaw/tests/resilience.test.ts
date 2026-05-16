/**
 * Resilience tests — Korveo Rule 7: the agent must NEVER fail
 * because Korveo is unreachable, slow, or returns an error.
 */
import { describe, expect, test } from 'vitest';
import { ExportResultCode } from '@opentelemetry/core';
import { SpanKind, SpanStatusCode } from '@opentelemetry/api';
import type { ReadableSpan } from '@opentelemetry/sdk-trace-base';
import { KorveoExporter } from '../src/exporter.js';

function makeSpan(): ReadableSpan {
  return {
    name: 's',
    kind: SpanKind.INTERNAL,
    spanContext: () => ({
      traceId: 't',
      spanId: 'a',
      traceFlags: 0,
      isRemote: false,
    }),
    parentSpanId: undefined,
    startTime: [0, 0],
    endTime: [0, 1_000_000],
    status: { code: SpanStatusCode.UNSET },
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
  };
}

async function exportOnce(exporter: KorveoExporter): Promise<ExportResultCode> {
  return new Promise((resolve) => {
    exporter.export([makeSpan()], (r) => resolve(r.code));
  });
}

describe('resilience — agent never fails because of Korveo', () => {
  test('Korveo unreachable (DNS failure) → SUCCESS', async () => {
    const fakeFetch: typeof fetch = async () => {
      throw new TypeError('fetch failed: ENOTFOUND korveo.local');
    };
    const exporter = new KorveoExporter({
      host: 'http://korveo.local',
      fetchImpl: fakeFetch,
    });
    expect(await exportOnce(exporter)).toBe(ExportResultCode.SUCCESS);
  });

  test('Korveo returns 500 → SUCCESS', async () => {
    const fakeFetch: typeof fetch = async () =>
      new Response('internal error', { status: 500 });
    const exporter = new KorveoExporter({
      host: 'http://x',
      fetchImpl: fakeFetch,
    });
    expect(await exportOnce(exporter)).toBe(ExportResultCode.SUCCESS);
  });

  test('Korveo returns 401 → SUCCESS', async () => {
    const fakeFetch: typeof fetch = async () =>
      new Response('unauthorized', { status: 401 });
    const exporter = new KorveoExporter({
      host: 'http://x',
      apiKey: 'wrong-key',
      fetchImpl: fakeFetch,
    });
    expect(await exportOnce(exporter)).toBe(ExportResultCode.SUCCESS);
  });

  test('Korveo hangs past timeout → SUCCESS within timeout window', async () => {
    const fakeFetch: typeof fetch = (_url, init) =>
      new Promise((_resolve, reject) => {
        const sig = init?.signal as AbortSignal | undefined;
        sig?.addEventListener('abort', () =>
          reject(new Error('AbortError')),
        );
      });
    const exporter = new KorveoExporter({
      host: 'http://hang',
      timeoutMs: 50,
      fetchImpl: fakeFetch,
    });
    const start = Date.now();
    const result = await exportOnce(exporter);
    expect(result).toBe(ExportResultCode.SUCCESS);
    expect(Date.now() - start).toBeLessThan(2000);
  });

  test('response.text() throws after fetch — still SUCCESS', async () => {
    const fakeFetch: typeof fetch = async () =>
      ({
        ok: true,
        status: 200,
        text: () => {
          throw new Error('body parse failed');
        },
      }) as unknown as Response;
    const exporter = new KorveoExporter({
      host: 'http://x',
      fetchImpl: fakeFetch,
    });
    expect(await exportOnce(exporter)).toBe(ExportResultCode.SUCCESS);
  });

  test('export of huge batch (1000 spans) does not crash', async () => {
    const fakeFetch: typeof fetch = async () => new Response('{}');
    const exporter = new KorveoExporter({
      host: 'http://x',
      fetchImpl: fakeFetch,
    });
    const spans = Array.from({ length: 1000 }, makeSpan);
    const result = await new Promise<ExportResultCode>((resolve) => {
      exporter.export(spans, (r) => resolve(r.code));
    });
    expect(result).toBe(ExportResultCode.SUCCESS);
  });

  test('shutdown() called twice is idempotent', async () => {
    const exporter = new KorveoExporter({ host: 'http://x' });
    await exporter.shutdown();
    await exporter.shutdown();
    // No exception
    expect(await exportOnce(exporter)).toBe(ExportResultCode.SUCCESS);
  });

  test('forceFlush() resolves without error when nothing buffered', async () => {
    const exporter = new KorveoExporter({ host: 'http://x' });
    await expect(exporter.forceFlush()).resolves.toBeUndefined();
  });
});
