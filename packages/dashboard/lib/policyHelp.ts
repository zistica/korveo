/**
 * Plain-English help for every shipped policy — so a non-technical
 * operator can decide what to turn on WITHOUT reading the DSL or the
 * OWASP spec. `what` = what it stops, in one sentence a normal person
 * gets. `when` = the deciding question ("turn this on if…").
 *
 * Keyed by exact policy name. Unknown / future policies fall back to
 * the policy's own description + a generic prompt — never blank.
 */
export type PolicyHelp = { what: string; when: string };

const HELP: Record<string, PolicyHelp> = {
  owasp_llm06_destructive_shell_irreversible: {
    what: 'Stops your AI from running commands that destroy data — deleting files, wiping disks, dropping databases. Things you can’t undo.',
    when: 'Turn on if your agent can run shell/terminal commands. Almost everyone with a tool-using agent should.',
  },
  owasp_llm06_sensitive_file_read: {
    what: 'Stops your AI from reading secret files — passwords, API keys, SSH keys, cloud credentials, .env files.',
    when: 'Turn on if your agent can read files or run shell tools. Stops a tricked agent from stealing your secrets.',
  },
  owasp_llm01_prompt_injection_basic: {
    what: 'Catches common tricks where someone hides instructions to make your AI misbehave (e.g. invisible text, fake image links).',
    when: 'Turn on for almost any agent that takes user input — this is the #1 attack on AI agents.',
  },
  owasp_llm01_prompt_injection_ml: {
    what: 'Smarter version of the above — uses an ML model to spot jailbreak/injection attempts in the user’s message.',
    when: 'Turn on if you have the ML detector installed and want stronger protection than the basic rule. Pairs well with the basic one.',
  },
  owasp_llm01_indirect_prompt_injection: {
    what: 'Catches attacks hidden inside data your agent fetches — a poisoned web page or document that tries to hijack the agent.',
    when: 'Turn on if your agent reads web pages, documents, tickets, or any external content (RAG / browsing agents).',
  },
  owasp_harmful_content_ml: {
    what: 'Blocks the AI from producing unsafe content (violence, self-harm, weapons, etc.) judged by a safety model.',
    when: 'Turn on for user-facing assistants where harmful replies are a real risk. Needs the ML detector.',
  },
  owasp_llm02_secret_disclosure: {
    what: 'Stops the AI from leaking secrets in its reply — API keys, credit-card numbers, access tokens.',
    when: 'Turn on if your AI ever touches credentials, payments, or internal systems. Protects you from accidental key leaks.',
  },
  owasp_llm02_pii_disclosure: {
    what: 'Flags when the AI’s reply contains personal data — SSNs, credit cards, emails.',
    when: 'Turn on if your AI handles customer or personal data (support bots, anything with user records).',
  },
  owasp_llm07_system_prompt_leak: {
    what: 'Catches when the AI is tricked into revealing its own hidden instructions (your system prompt / business logic).',
    when: 'Turn on if your prompt contains anything you don’t want users to see — pricing rules, internal policy, IP.',
  },
  owasp_llm04_poisoning_attempt: {
    what: 'Flags messages that look like attempts to extract your training data or poison the model’s behavior.',
    when: 'Turn on if you fine-tune on user input or run a model where data-extraction probing is a concern.',
  },
  owasp_llm05_unexpected_html_in_output: {
    what: 'Flags tool results that smuggle in HTML/links — a common way to sneak malicious content downstream.',
    when: 'Turn on if your agent’s tool outputs get rendered somewhere (a UI, an email, another system).',
  },
  owasp_llm09_unverified_claim: {
    what: 'Flags replies where the AI hedges (“I can’t verify this”) but then states it confidently anyway — i.e. likely made-up.',
    when: 'Turn on for assistants where confidently-wrong answers cause real harm (legal, medical, financial).',
  },
  owasp_llm10_session_token_budget: {
    what: 'Cuts off a conversation that has burned through its token budget — stops runaway loops and cost blow-ups.',
    when: 'Turn on if you worry about a stuck agent racking up a huge API bill. A cost safety-net.',
  },
};

export function policyHelp(name: string, description?: string | null): PolicyHelp {
  const hit = HELP[name];
  if (hit) return hit;
  return {
    what: (description || 'Custom rule — see its condition for exactly what it matches.').trim(),
    when: 'Enable in shadow first, watch /decisions, then enforce if it’s catching the right things.',
  };
}
