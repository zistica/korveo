/**
 * @korveo/openclaw — local-first observability for OpenClaw agents.
 *
 * OpenClaw emits OTel telemetry through `@openclaw/diagnostics-otel`.
 * This package provides the Korveo side of that pipe — an OTel
 * `SpanExporter` plus a `BatchSpanProcessor` helper that's drop-in
 * for any OpenClaw / OTel configuration.
 *
 * Public API:
 *   - KorveoExporter: OTel-compatible span exporter that ships to
 *     a running Korveo instance (default http://localhost:8000).
 *   - korveoProcessor(): helper that wraps the exporter in a
 *     BatchSpanProcessor — the right shape for OpenClaw's
 *     diagnostics-otel config.
 *   - korveoExporter(): builds the bare exporter (e.g. for tests
 *     that want a SimpleSpanProcessor instead).
 *   - installKorveoTracing(): attaches a KorveoExporter to the
 *     active OTel tracer provider when KORVEO_TRACING=true. Most
 *     users will use the `import "@korveo/openclaw/auto"` form.
 */

export {
  KorveoExporter,
  otelSpanToKorveo,
  registerModelPrice,
} from './exporter.js';
export type { KorveoExporterConfig } from './exporter.js';

export {
  korveoProcessor,
  korveoExporter,
  resolveServiceName,
} from './config.js';
export type { KorveoConfigOptions } from './config.js';

export { installKorveoTracing, tryAttach } from './auto.js';
