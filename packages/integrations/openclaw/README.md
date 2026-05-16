# @korveo/openclaw

> Debug your [OpenClaw](https://github.com/openclaw/openclaw) agent locally. No account. No cloud. No telemetry leaving your laptop.

`@korveo/openclaw` is the Korveo side of OpenClaw's OTel telemetry pipeline. OpenClaw ships diagnostics through `@openclaw/diagnostics-otel`; this package provides a drop-in `SpanExporter` that converts those spans to Korveo's wire format and ships them to a local Korveo instance — visible at `http://localhost:3000`.

## Quick Start

Works out of the box on any OpenClaw release that ships [`diagnostics-otel`](https://docs.openclaw.ai/gateway/opentelemetry) — no npm install, no agent code changes. Korveo exposes an OTLP/HTTP endpoint that OpenClaw's built-in plugin can write to directly.

```bash
# Step 1 — start Korveo
docker run -p 3000:3000 -p 8000:8000 zistica/korveo

# Step 2 — enable diagnostics + point OpenClaw at Korveo
openclaw config set diagnostics.enabled true
openclaw config set diagnostics.otel.enabled true
openclaw config set diagnostics.otel.traces true
openclaw config set diagnostics.otel.endpoint "http://localhost:8000/v1/otlp"
openclaw gateway restart

# Step 3 — open http://localhost:3000
# every OpenClaw run appears automatically
```

`diagnostics-otel` auto-appends `/v1/traces` to the configured base when the URL doesn't already include it (see the [OpenClaw OpenTelemetry export docs](https://docs.openclaw.ai/gateway/opentelemetry)) — the POST lands at Korveo's OTLP route `http://localhost:8000/v1/otlp/v1/traces`. If you'd rather be explicit:

```bash
openclaw config set diagnostics.otel.endpoint "http://localhost:8000/v1/otlp/v1/traces"
```

**What ends up in the dashboard**:
- Model calls — provider / model / input + output token counts / duration; cost computed from Korveo's pricing tables
- `openclaw.exec` spans for tool / process invocations
- Full span tree for an agent run, parent-child correctly nested
- Policy violations auto-detected by Korveo's policy engine on every ingested span

When you'd want the **in-process exporter** below instead of the OTLP path: client-side cost calculation, custom span subtypes (e.g. extended-thinking), or your OpenClaw build predates `diagnostics-otel`.

## Install

```bash
npm install @korveo/openclaw
```

You also need a running Korveo instance:

```bash
docker run -p 3000:3000 -p 8000:8000 zistica/korveo
```

## Usage — wired into OpenClaw's diagnostics

Build the processor and pass it to `@openclaw/diagnostics-otel`'s `spanProcessors:` array (or to any OTel `NodeTracerProvider` config you're already using):

```typescript
import { korveoProcessor } from '@korveo/openclaw';

// In your OpenClaw / OTel config:
const tracerProvider = new NodeTracerProvider({
  resource,
  spanProcessors: [
    korveoProcessor({ serviceName: 'my-openclaw-bot' }),
    // …other processors
  ],
});
```

That's it. Run your OpenClaw agent, open `http://localhost:3000`, every LLM call, tool call, and channel session shows up live.

The helper reads `KORVEO_HOST`, `KORVEO_API_KEY`, and `KORVEO_SERVICE_NAME` from the environment, so common deployments need no constructor args:

```bash
export KORVEO_HOST=http://localhost:8000
```

## Usage — bare exporter

If you want full control over the OTel pipeline (e.g. `SimpleSpanProcessor` for tests), use the bare exporter:

```typescript
import { KorveoExporter } from '@korveo/openclaw';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';

const exporter = new KorveoExporter({
  host: 'http://localhost:8000',
  project: 'my-bot',
});
const processor = new SimpleSpanProcessor(exporter);
```

## Usage — side-effect import (legacy OTel only)

For setups running an older OTel SDK whose `TracerProvider` still exposes a public `addSpanProcessor`:

```bash
export KORVEO_TRACING=true
```

```typescript
import '@korveo/openclaw/auto';
```

This path is best-effort — modern OTel (and OpenClaw's diagnostics-otel) requires processors to be supplied at construction time, in which case the import silently no-ops and you should fall back to `korveoProcessor()` above.

## What you get in the dashboard

- **Channel sessions** — every WhatsApp / Telegram / Discord / Slack / iMessage / etc. conversation as a session you can browse via the dashboard's `/sessions` view
- **LLM spans** — model, tokens, cost per call, with provider classification (OpenAI, Anthropic, Google, etc.) via standard OTel GenAI semantic conventions
- **Tool spans** — every external call (web search, GitHub, email, …) with input args and result, plus duration and error capture
- **Errors** — exception messages captured from OTel events, surfaced on the failing span in the timeline
- **Claude extended thinking** — if your OpenClaw agent uses Claude with thinking enabled, reasoning blocks render as first-class child spans

## Configuration

| Option | Env var | Default | Description |
|---|---|---|---|
| `host` | `KORVEO_HOST` | `http://localhost:8000` | Korveo API base URL |
| `apiKey` | `KORVEO_API_KEY` | _none_ | Optional bearer token for hosted Korveo |
| `project` | — | `openclaw` | Project tag (sent as `X-Korveo-Project`) |
| `timeoutMs` | — | `5000` | Per-export network timeout |
| `serviceName` | `KORVEO_SERVICE_NAME` | `openclaw-app` | OTel `service.name` resource attribute |

## Why local instead of Langfuse / Braintrust / Arize?

OpenClaw's whole pitch is "your agent on your devices, no cloud." Sending its telemetry to a SaaS observability backend defeats the point. Korveo is the local-first alternative:

- **Air-gapped or sensitive data** — Korveo runs entirely on your laptop or your VPC.
- **Zero account / zero billing** — clone the repo, `docker run`, done.
- **Apache 2.0** — fork it.

## Resilience

Per [Korveo's Rule 7](https://github.com/zistica/korveo/blob/main/docs/Development_Rules.md), the agent **never fails because of Korveo**. If the API is unreachable, returns 5xx, or the network hangs, the export reports success to the OTel pipeline and your agent keeps running. Spans drop silently.

## License

Apache-2.0.
