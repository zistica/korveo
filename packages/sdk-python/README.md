# korveo (Python SDK)

Local-first AI agent observability. 2 lines of code.

```python
import korveo

korveo.configure(host="http://localhost:8000")

@korveo.trace
def my_agent(input: str) -> str:
    return "hello"

my_agent("test")
```

Spans are captured asynchronously. If the Korveo server is unreachable,
the agent continues working — spans are dropped silently.

## Install

```bash
pip install -e packages/sdk-python/
```

## Configuration

Configuration priority: explicit `configure(...)` > environment variable > default.

| Option | Env var | Default |
|---|---|---|
| `host` | `KORVEO_HOST` | `http://localhost:8000` |
| `api_key` | `KORVEO_API_KEY` | `None` |
| `project` | `KORVEO_PROJECT` | `default` |
| `capture_inputs` | — | `True` |
| `capture_outputs` | — | `True` |
| `max_payload_size` | — | `10240` |
| `batch_size` | — | `100` |
| `flush_interval` | — | `2.0` |
| `max_queue_size` | — | `10000` |
| `export_timeout` | — | `5.0` |
