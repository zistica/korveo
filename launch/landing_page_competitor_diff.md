# Landing page — competitor positioning copy

Markdown intended for the comparison section of `korveo.dev` (or whichever landing page hosts the public site). Lift verbatim or paraphrase per brand voice. The positioning is **honest** — every claim here is verifiable in the repo or the docs.

---

## The one-line difference

> **Korveo is a local-first AI agent firewall. It runs on your laptop, sees every tool call and proxy turn, and blocks the bad ones in real time. Your data, your policies, your machine.**

## Compared to the ten you're probably evaluating

| Tool | Category | What you give up to use Korveo instead |
|---|---|---|
| **Lakera Guard** | SaaS firewall | Korveo is on-prem only — your prompts never leave the box. Korveo is also Apache 2.0; Lakera is proprietary. **Tradeoff:** Lakera has a more mature ML detector pipeline; Korveo uses the same OSS detectors (Prompt Guard 2, Llama Guard 4) Meta ships, plus your own per-deployment classifier (§6.8). |
| **Cisco AI Defense / Palo Alto AI Runtime** | Enterprise SaaS | Same sovereignty + license tradeoff as Lakera. Korveo doesn't currently ship the same level of network-layer integration (you'd wire it via OpenClaw or LangChain hooks, not at L7). For agent-level enforcement Korveo matches; for network IDS-style coverage these are stronger. |
| **NVIDIA NeMo Guardrails** | OSS library | Korveo is a deployable system — Docker, dashboard, observability, approvals — not just a Python library. NeMo asks you to wire rails into your own code; Korveo runs as a separate process at `:8000` and any framework can talk to it. **Tradeoff:** if you want pure-Python in-process rules, NeMo is simpler. |
| **Guardrails AI** | OSS library | Same delta as NeMo — Korveo is a service + dashboard, Guardrails is a library. Korveo's policy DSL also has lifecycle / mode / priority / on_timeout fields they don't expose. |
| **Langfuse / Helicone / Arize Phoenix** | Observability | Observability tells you what happened. Korveo tells you what happened **and stops it from happening**. Most teams need both — these tools and Korveo coexist (you can run Phoenix and Korveo on the same agent). |
| **LangChain `BaseCallbackHandler`** | Framework hook | LangChain lets you write your own enforcement logic; Korveo gives you the engine + DSL + dashboard + 11 starter packs + a compounding rule loop. Korveo's LangChain integration uses exactly the same hook surface — drop-in. |
| **Promptfoo** | Eval / red-team | Promptfoo runs offline tests. Korveo enforces in production. They're complementary — use Promptfoo to validate your Korveo policies before promoting them to enforce. |
| **OpenAI Moderation / Anthropic safety** | Provider-side | Provider moderation is a per-message yes/no. Korveo is per-tool-call, per-lifecycle, with a learned per-deployment classifier and a real audit trail. They're not substitutes. |

## What Korveo actually has that none of the above does

1. **Compounding-rule loop** — observe → mine → suggest → forecast → promote. One trace becomes a permanent rule with FP forecast. (Spec §11.)
2. **Per-deployment learned classifier** — your operators' labels train a small ONNX model unique to your traffic. The longer it runs the better it gets at *your* attack surface. (§6.8 / §11.6.)
3. **Five lifecycle hooks** — `before_proxy_call`, `after_proxy_call`, `before_tool_call`, `after_tool_call`, `post_ingest`. Most competitors run at one or two of these.
4. **Reply takeover** — when Korveo blocks, the *user* sees Korveo's canned message, not the LLM's reply. The LLM is bypassed. (Slice 4 §9.1, OpenClaw `before_dispatch`.)
5. **Decision↔violation bridge** — every firewall block lands in the dashboard's existing observability surfaces. One audit trail, not two.

## What Korveo doesn't try to be

We're explicit about scope so you don't pick the wrong tool:

- **Not a full DLP / CASB** — there's no email scanning, no S3 monitoring, no AD integration. Korveo gates the agent; if your data leaves through other channels, you need a CASB.
- **Not a managed SaaS (yet)** — Phase 2 will add a hosted tier for teams. Today, you run it. If you want SaaS pricing/SLAs, we're not the right call yet.
- **Not a foundation-model safety layer** — provider moderation still matters. Korveo sits *in front of* and *around* the model; it doesn't replace OpenAI/Anthropic safety.

## When Korveo is the right call

- You run AI agents on customer data and the data can't leave your VPC.
- You're in a regulated industry (healthcare, finance, legal, defense) and need on-prem.
- Your security team wants real-time enforcement, not weekly evals.
- You want OSS so you can audit the firewall yourself and contribute back.
- You're a Japanese / EU company under data-sovereignty rules (APPI, AI Act, Schrems II).

## When Korveo is *not* the right call

- You don't actually run agents — you're just calling chat completions. Use provider moderation + your own input validation. You don't need a firewall yet.
- You need a SOC 2 Type II vendor today. We'll have one — not yet.
- Your security team requires a commercial vendor with 24/7 SLA. Phase 2 cloud will offer this.
