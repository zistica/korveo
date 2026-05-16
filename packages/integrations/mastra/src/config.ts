/**
 * Helper to build the Mastra observability config block. Saves users
 * from manually typing the nested `observability.configs.korveo.*`
 * shape — and reads sensible defaults from environment variables.
 *
 * Usage:
 *
 *     import { Mastra } from "@mastra/core";
 *     import { korveoConfig } from "@korveo/mastra";
 *
 *     export const mastra = new Mastra({
 *       agents: { myAgent },
 *       observability: korveoConfig(),  // reads KORVEO_HOST etc.
 *     });
 *
 * ENV variables read:
 *   KORVEO_HOST        — exporter host (default http://localhost:8000)
 *   KORVEO_API_KEY     — optional bearer token for hosted Korveo
 *   KORVEO_PROJECT     — project tag (default "mastra")
 *   KORVEO_SERVICE_NAME — Mastra serviceName (default "mastra-app")
 */

import {
  KorveoExporter,
  type KorveoExporterConfig,
} from './exporter.js';

export interface KorveoConfigOptions extends KorveoExporterConfig {
  /** Mastra `serviceName`. Default: KORVEO_SERVICE_NAME or "mastra-app". */
  serviceName?: string;
  /** Config block name. Default: "korveo". Mastra allows multiple
   *  observability configs side-by-side. */
  configName?: string;
}

/**
 * Build the full Mastra `observability` block with the KorveoExporter
 * pre-wired. Returned shape matches Mastra v1.x:
 *
 *   { configs: { korveo: { serviceName, exporters: [...] } } }
 */
export function korveoConfig(opts: KorveoConfigOptions = {}): {
  configs: Record<
    string,
    { serviceName: string; exporters: KorveoExporter[] }
  >;
} {
  const env = typeof process !== 'undefined' ? process.env : ({} as NodeJS.ProcessEnv);
  const serviceName =
    opts.serviceName ?? env.KORVEO_SERVICE_NAME ?? 'mastra-app';
  const configName = opts.configName ?? 'korveo';

  const exporter = new KorveoExporter({
    host: opts.host,
    apiKey: opts.apiKey,
    project: opts.project,
    timeoutMs: opts.timeoutMs,
    fetchImpl: opts.fetchImpl,
    maxPayloadSize: opts.maxPayloadSize,
  });

  return {
    configs: {
      [configName]: {
        serviceName,
        exporters: [exporter],
      },
    },
  };
}
