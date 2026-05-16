/**
 * @korveo/mastra — local-first observability + Agent Firewall for
 * Mastra agents.
 *
 * Public API:
 *   - KorveoExporter: OTel-compatible span exporter that ships to
 *     a running Korveo instance (default http://localhost:8000).
 *   - korveoConfig(): helper that returns the full Mastra
 *     `observability` config block, pre-wired with a KorveoExporter.
 *   - installKorveoTracing(): attaches a KorveoExporter to the
 *     active OTel tracer provider when KORVEO_TRACING=true. Most
 *     users will use the `import "@korveo/mastra/auto"` form.
 *   - wrapToolWithFirewall(): higher-order wrapper that adds
 *     synchronous /v1/policy/decide enforcement to any Mastra
 *     tool. Mirrors the OpenClaw plugin v0.4.0 firewall behavior
 *     — block / rewrite / require_approval / allow.
 *   - KorveoFirewallClient: low-level decide + waitForApproval
 *     client for operators building their own integration.
 */

export {
  KorveoExporter,
  otelSpanToKorveo,
  registerModelPrice,
} from './exporter.js';
export type { KorveoExporterConfig } from './exporter.js';

export { korveoConfig } from './config.js';
export type { KorveoConfigOptions } from './config.js';

export { installKorveoTracing, tryAttach } from './auto.js';

// ----- Agent Firewall (Slice 3 PR J) -----
export {
  KorveoFirewallClient,
  buildAdminRules,
  translateDecision,
} from './firewall.js';
export type {
  FirewallConfig,
  DecideRequestBody,
  DecideResponseBody,
  DecisionVerb,
  DecideLifecycle,
  AdminSenderRules,
  FirewallToolResult,
} from './firewall.js';

export {
  wrapToolWithFirewall,
  FirewallBlockedError,
} from './wrap.js';
export type {
  MastraToolLike,
  ToolExecutionContext,
  WrapOptions,
} from './wrap.js';
