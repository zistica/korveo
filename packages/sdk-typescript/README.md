# @korveo/sdk

TypeScript SDK for [Korveo](https://github.com/zistica/korveo) — the local-first AI agent observability stack.

```typescript
import { trace, span, session } from '@korveo/sdk';

const myAgent = trace(async (q: string) => {
  // your agent code
  return result;
}, { name: 'my_agent' });
```

## Install

```bash
npm install @korveo/sdk
```

## Framework integrations

For Mastra users:

```bash
npm install @korveo/mastra
```

See the [`@korveo/mastra` package](../integrations/mastra/) for usage. Drop-in replacement for `@mastra/langfuse` if you want local-first observability without sending data to a hosted SaaS.

For Anthropic Claude users (extended thinking visualization):

```typescript
import Anthropic from '@anthropic-ai/sdk';
import { instrumentAnthropic } from '@korveo/sdk/integrations/anthropic';

const client = new Anthropic();
instrumentAnthropic(client);
```

## License

Apache-2.0.
