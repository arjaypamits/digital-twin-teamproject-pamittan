/**
 * Server-side prompt injection protection.
 * Run on every user message before forwarding to the LLM.
 */

const INJECTION_PATTERNS: RegExp[] = [
  // Instruction override
  /ignore\s+(all\s+)?(previous|prior|above|your)\s+(instructions?|prompts?|rules?|directives?|guidelines?)/i,
  /disregard\s+(all\s+)?(previous|prior|above|your)\s+(instructions?|prompts?|rules?|directives?)/i,
  /forget\s+(everything|all)\s+(above|before|previous)/i,
  /override\s+(your\s+)?(previous\s+)?(instructions?|prompts?|rules?|system)/i,

  // Jailbreak keywords
  /\bdan\s+mode\b/i,
  /\bdeveloper\s+mode\b/i,
  /\bjailbreak\b/i,

  // Role override attempts
  /you\s+are\s+now\s+(no\s+longer|a\s+different|an?\s+unrestricted|a\s+new)/i,
  /act\s+as\s+(an?\s+)?(unrestricted|uncensored|unfiltered|evil|opposite)/i,
  /pretend\s+(to\s+be|you\s+are)\s+(an?\s+)?(unrestricted|uncensored|unfiltered|evil)/i,

  // Delimiter injection (fake system turns embedded in user text)
  /<\/?system>/i,
  /\[system\]/i,
  /^\s*###\s*(system|instruction|prompt)/im,
  /^\s*---\s*(system|instruction|prompt)/im,
  // Fake role headers at the start of lines
  /^\s*(system|assistant)\s*:\s/im,
];

export interface GuardResult {
  safe: boolean;
  reason?: string;
}

const MAX_MESSAGE_LENGTH = 2000;
const MAX_MESSAGES = 40;

export function checkMessage(text: string): GuardResult {
  if (typeof text !== 'string') {
    return { safe: false, reason: 'Invalid message type.' };
  }

  if (text.length > MAX_MESSAGE_LENGTH) {
    return { safe: false, reason: `Message exceeds the ${MAX_MESSAGE_LENGTH}-character limit.` };
  }

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      return { safe: false, reason: 'Message contains content that cannot be processed.' };
    }
  }

  return { safe: true };
}

export interface ClientMessage {
  role: string;
  content: string;
}

/**
 * Validates and sanitizes the messages array from the client.
 * - Strips any system-role messages (the server owns the system prompt)
 * - Enforces role allow-list (only 'user' and 'assistant')
 * - Caps history length
 * - Checks each user message for injection patterns
 * - Trims & normalises whitespace on user content
 */
export function sanitizeMessages(messages: unknown[]): { messages: ClientMessage[]; error?: string } {
  if (!Array.isArray(messages)) {
    return { messages: [], error: 'Invalid messages format.' };
  }

  if (messages.length > MAX_MESSAGES) {
    return { messages: [], error: 'Too many messages in history.' };
  }

  const sanitized: ClientMessage[] = [];

  for (const msg of messages) {
    if (
      typeof msg !== 'object' ||
      msg === null ||
      typeof (msg as Record<string, unknown>).role !== 'string' ||
      typeof (msg as Record<string, unknown>).content !== 'string'
    ) {
      return { messages: [], error: 'Malformed message object.' };
    }

    const { role, content } = msg as Record<string, string>;

    // Drop system messages — server handles the system prompt
    if (role === 'system') continue;

    // Only allow user/assistant turns
    if (role !== 'user' && role !== 'assistant') {
      return { messages: [], error: `Unexpected message role: ${role}` };
    }

    const clean = content.trim().replace(/\s+/g, ' ');

    if (role === 'user') {
      const guard = checkMessage(clean);
      if (!guard.safe) {
        return { messages: [], error: guard.reason };
      }
    }

    sanitized.push({ role, content: clean });
  }

  return { messages: sanitized };
}
