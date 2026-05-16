/**
 * Helper that builds an OTel `BatchSpanProcessor` wired to the
 * Korveo exporter — the right shape to register with VoltAgent's
 * OTel pipeline.
 *
 * Usage:
 *
 *     import { korveoProcessor } from '@korveo/voltagent';
 *
 *     spanProcessors: [korveoProcessor()]
 *
 * ENV variables read:
 *   KORVEO_HOST        — exporter host (default http://localhost:8000)
 *   KORVEO_API_KEY     — optional bearer token for hosted Korveo
 *   KORVEO_PROJECT     — project tag (default "voltagent")
 *   KORVEO_SERVICE_NAME — VoltAgent serviceName (default "voltagent-app")
 */

import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import {
  KorveoExporter,
  type KorveoExporterConfig,
} from './exporter.js';

export interface KorveoConfigOptions extends KorveoExporterConfig {
  /** VoltAgent / OTel `service.name` resource attribute. Default:
   *  KORVEO_SERVICE_NAME or "voltagent-app". */
  serviceName?: string;
}

/**
 * Build a KorveoExporter wrapped in a `BatchSpanProcessor` ready
 * to be registered with VoltAgent's OTel pipeline or any OTel
 * `NodeTracerProvider`'s `spanProcessors:` array.
 */
export function korveoProcessor(
  opts: KorveoConfigOptions = {},
): BatchSpanProcessor {
  return new BatchSpanProcessor(
    new KorveoExporter({
      host: opts.host,
      apiKey: opts.apiKey,
      project: opts.project,
      timeoutMs: opts.timeoutMs,
      fetchImpl: opts.fetchImpl,
      maxPayloadSize: opts.maxPayloadSize,
    }),
  );
}

/**
 * Build a Korveo exporter directly (useful if you want a different
 * processor, e.g. SimpleSpanProcessor for tests).
 */
export function korveoExporter(
  opts: KorveoConfigOptions = {},
): KorveoExporter {
  return new KorveoExporter({
    host: opts.host,
    apiKey: opts.apiKey,
    project: opts.project,
    timeoutMs: opts.timeoutMs,
    fetchImpl: opts.fetchImpl,
    maxPayloadSize: opts.maxPayloadSize,
  });
}

/** Read the VoltAgent service name from env (or the supplied default). */
export function resolveServiceName(opts: KorveoConfigOptions = {}): string {
  const env =
    typeof process !== 'undefined' ? process.env : ({} as NodeJS.ProcessEnv);
  return opts.serviceName ?? env.KORVEO_SERVICE_NAME ?? 'voltagent-app';
}
