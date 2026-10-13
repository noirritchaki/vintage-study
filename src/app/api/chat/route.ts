import Anthropic from '@anthropic-ai/sdk';
import { buildKnowledge } from '@/data/jontyKnowledge';

// JontyLLM: answers questions about Noirrit, in Noirrit's voice, from the knowledge
// file. Streams plain text back to the chat panel.

const MODEL = 'claude-opus-5-5';
const MAX_TURNS = 16; // messages kept from the conversation
const MAX_CHARS = 800; // per visitor message

const SYSTEM = `You are JontyLLM, a small chatbot on Noirrit Chaki's portfolio site. You answer visitors' questions about Noirrit in the first person, as Noirrit ("I", "my"), friendly and casual.

Rules:
- Only state facts that are in the knowledge below. If something isn't covered, say you're not sure and suggest reaching out to Noirrit directly. Never invent jobs, dates, numbers, clients or opinions.
- Keep answers short: usually two to four sentences. Plain text only, no markdown headings or tables. A short list is fine when it genuinely helps.
- Never use em dashes. Use commas, full stops or brackets instead.
- Stay on topics about Noirrit: the work, design thinking, life outside work and this site. Politely steer anything else back.
- Don't share anything about Plum beyond what the knowledge says; it's a real company with real customers.
- If someone asks how you work, you can say you're an AI that answers from notes Noirrit wrote.

<knowledge>
${buildKnowledge()}
</knowledge>`;

// Best-effort per-IP limit. Serverless instances don't share memory, so this
// only slows down abuse; set a monthly spend limit in the Claude Console too.
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 8;
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

type Incoming = { messages?: { role?: string; content?: string }[]; page?: string };

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: 'not_configured' }, { status: 503 });
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  if (limited(ip)) return Response.json({ error: 'rate_limited' }, { status: 429 });

  let body: Incoming;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'bad_request' }, { status: 400 });
  }

  // Keep only well-formed turns, newest last, starting on a user turn.
  const messages: Anthropic.Beta.BetaMessageParam[] = (body.messages ?? [])
    .filter(
      (m): m is { role: 'user' | 'assistant'; content: string } =>
        (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim() !== '',
    )
    .slice(-MAX_TURNS)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));
  while (messages.length && messages[0].role !== 'user') messages.shift();
  if (!messages.length || messages[messages.length - 1].role !== 'user') {
    return Response.json({ error: 'bad_request' }, { status: 400 });
  }

  const page = typeof body.page === 'string' ? body.page.slice(0, 80) : '/';
  const client = new Anthropic();

  const stream = client.beta.messages.stream({
    model: MODEL,
    max_tokens: 4000,
    // Chat doesn't need deep reasoning; low effort keeps answers quick and cheap.
    output_config: { effort: 'low' },
    // If a safety classifier declines, retry on Anthropic's recommended fallback model.
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    system: [
      // The big, unchanging part is cached, so each question only pays for what's new.
      { type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } },
      { type: 'text', text: `The visitor is currently on this page of the site: ${page}` },
    ],
    messages,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        const final = await stream.finalMessage();
        if (final.stop_reason === 'refusal') {
          controller.enqueue(encoder.encode("\n\nHmm, I can't help with that one. Ask me about my work instead?"));
        }
      } catch (error) {
        const message =
          error instanceof Anthropic.RateLimitError
            ? "I'm getting a lot of questions right now. Try again in a minute?"
            : error instanceof Anthropic.AuthenticationError
              ? "I'm not set up properly yet. Check back soon!"
              : 'Something went wrong on my end. Try again?';
        if (error instanceof Anthropic.APIError) console.error('JontyLLM API error', error.status, error.message);
        else console.error('JontyLLM error', error);
        controller.enqueue(encoder.encode(message));
      } finally {
        controller.close();
      }
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}
