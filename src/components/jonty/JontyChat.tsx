"use client";

import { usePathname } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import styles from "./JontyChat.module.css";

type Turn = { role: "user" | "assistant"; content: string };

const GREETINGS = [
  "Hey, ask away.",
  "What would you like to know?",
  "Ask me anything.",
];

const STARTERS = [
  "What are you working on at Plum?",
  "Tell me about Killing the DUR",
  "What do you do for fun?",
  "How do you approach design?",
  "Where have you worked before?",
  "Can I get in touch?",
];

/** A fresh greeting and three starter questions each time the chat opens. */
function pickIntro() {
  const shuffled = [...STARTERS].sort(() => Math.random() - 0.5);
  return {
    greeting: GREETINGS[Math.floor(Math.random() * GREETINGS.length)],
    starters: shuffled.slice(0, 3),
  };
}

function ResetIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  );
}

const NOT_READY =
  "JontyLLM is still getting set up. Check back soon! In the meantime, my About page has the basics.";

/** The three-sparkle AI icon (public/sparkles.svg), inlined so it takes the text colour. */
function Sparkle() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M13.75 7.75C13.75 7.33579 13.4142 7 13 7C12.5858 7 12.25 7.33579 12.25 7.75C12.25 10.1758 11.7141 11.7513 10.7327 12.7327C9.75127 13.7141 8.17581 14.25 5.75 14.25C5.33579 14.25 5 14.5858 5 15C5 15.4142 5.33579 15.75 5.75 15.75C8.17581 15.75 9.75127 16.2859 10.7327 17.2673C11.7141 18.2487 12.25 19.8242 12.25 22.25C12.25 22.6642 12.5858 23 13 23C13.4142 23 13.75 22.6642 13.75 22.25C13.75 19.8242 14.2859 18.2487 15.2673 17.2673C16.2487 16.2859 17.8242 15.75 20.25 15.75C20.6642 15.75 21 15.4142 21 15C21 14.5858 20.6642 14.25 20.25 14.25C17.8242 14.25 16.2487 13.7141 15.2673 12.7327C14.2859 11.7513 13.75 10.1758 13.75 7.75Z"
      />
      <path
        fill="currentColor"
        d="M6 5.5C6 5.22386 5.77614 5 5.5 5C5.22386 5 5 5.22386 5 5.5C5 6.48063 4.78279 7.0726 4.4277 7.4277C4.0726 7.78279 3.48063 8 2.5 8C2.22386 8 2 8.22386 2 8.5C2 8.77614 2.22386 9 2.5 9C3.48063 9 4.0726 9.21721 4.4277 9.5723C4.78279 9.9274 5 10.5194 5 11.5C5 11.7761 5.22386 12 5.5 12C5.77614 12 6 11.7761 6 11.5C6 10.5194 6.21721 9.9274 6.5723 9.5723C6.9274 9.21721 7.51937 9 8.5 9C8.77614 9 9 8.77614 9 8.5C9 8.22386 8.77614 8 8.5 8C7.51937 8 6.9274 7.78279 6.5723 7.4277C6.21721 7.0726 6 6.48063 6 5.5Z"
      />
      <path
        fill="currentColor"
        d="M11 1.5C11 1.22386 10.7761 1 10.5 1C10.2239 1 10 1.22386 10 1.5C10 2.13341 9.85918 2.47538 9.66728 2.66728C9.47538 2.85918 9.13341 3 8.5 3C8.22386 3 8 3.22386 8 3.5C8 3.77614 8.22386 4 8.5 4C9.13341 4 9.47538 4.14082 9.66728 4.33272C9.85918 4.52462 10 4.86659 10 5.5C10 5.77614 10.2239 6 10.5 6C10.7761 6 11 5.77614 11 5.5C11 4.86659 11.1408 4.52462 11.3327 4.33272C11.5246 4.14082 11.8666 4 12.5 4C12.7761 4 13 3.77614 13 3.5C13 3.22386 12.7761 3 12.5 3C11.8666 3 11.5246 2.85918 11.3327 2.66728C11.1408 2.47538 11 2.13341 11 1.5Z"
      />
    </svg>
  );
}

/**
 * "Ask me anything" chat about Noirrit, on every page: a small button next to
 * the nav opens a panel from the right. Answers stream from /api/chat.
 */
export function JontyChat() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [intro, setIntro] = useState(() => ({
    greeting: GREETINGS[0],
    starters: STARTERS.slice(0, 3),
  }));
  const input = useRef<HTMLTextAreaElement>(null);
  const log = useRef<HTMLDivElement>(null);
  const abort = useRef<AbortController | null>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (open) input.current?.focus();
    else if (wasOpen.current) launcher.current?.focus();
    wasOpen.current = open;
  }, [open]);

  useEffect(() => {
    log.current?.scrollTo({ top: log.current.scrollHeight });
  }, [turns]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => () => abort.current?.abort(), []);

  async function ask(question: string) {
    const text = question.trim();
    if (!text || busy) return;
    const history: Turn[] = [...turns, { role: "user", content: text }];
    setTurns([...history, { role: "assistant", content: "" }]);
    setDraft("");
    setBusy(true);

    const write = (content: string) =>
      setTurns((t) => [...t.slice(0, -1), { role: "assistant", content }]);

    abort.current = new AbortController();
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, page: pathname }),
        signal: abort.current.signal,
      });
      if (res.status === 503) return write(NOT_READY);
      if (res.status === 429)
        return write(
          "You're asking faster than I can think! Give me a few seconds.",
        );
      if (!res.ok || !res.body)
        return write("Something went wrong on my end. Try again?");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let answer = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        answer += decoder.decode(value, { stream: true });
        write(answer);
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError")
        write(
          "I couldn't reach the server. Check your connection and try again?",
        );
    } finally {
      setBusy(false);
    }
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void ask(draft);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void ask(draft);
    }
  };

  const reset = () => {
    abort.current?.abort();
    setTurns([]);
    setDraft("");
    setBusy(false);
    setIntro(pickIntro());
    input.current?.focus();
  };

  return (
    <div data-chat>
      <button
        ref={launcher}
        type="button"
        className={styles.launcher}
        aria-label="Open JontyLLM chat"
        data-open={open || undefined}
        aria-expanded={open}
        aria-controls="jonty-panel"
        onClick={() => {
          if (!open && turns.length === 0) setIntro(pickIntro());
          setOpen((o) => !o);
        }}
      >
        <span className={styles.launcherLabel}>
          <span>JontyLLM</span>
        </span>
        <Sparkle />
      </button>

      <section
        id="jonty-panel"
        className={styles.panel}
        data-open={open || undefined}
        role="dialog"
        aria-label="JontyLLM chat"
        aria-hidden={!open}
        inert={!open}
      >
        <header className={styles.header}>
          <span className={styles.title}>JontyLLM</span>
          <span className={styles.actions}>
            <button
              type="button"
              className={styles.icon}
              onClick={reset}
              aria-label="Reset chat"
              title="Start over"
            >
              <ResetIcon />
            </button>
            <button
              type="button"
              className={styles.icon}
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              <CloseIcon />
            </button>
          </span>
        </header>

        <div ref={log} className={styles.log} aria-live="polite">
          {turns.length === 0 ? (
            <div className={styles.intro}>
              <h3 className={styles.greeting}>{intro.greeting}</h3>
              <ul className={styles.starters}>
                {intro.starters.map((s) => (
                  <li key={s}>
                    <button type="button" onClick={() => void ask(s)}>
                      <span aria-hidden>↳</span>
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            turns.map((t, i) => (
              <p
                key={i}
                className={t.role === "user" ? styles.user : styles.assistant}
              >
                {t.content || (
                  <span className={styles.typing} aria-label="Thinking" />
                )}
              </p>
            ))
          )}
        </div>

        <form className={styles.composer} onSubmit={onSubmit}>
          <textarea
            ref={input}
            rows={1}
            value={draft}
            maxLength={800}
            placeholder="Ask about Noirrit…"
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            aria-label="Your question"
          />
          <button
            type="submit"
            disabled={busy || !draft.trim()}
            aria-label="Send"
          >
            <SendIcon />
          </button>
        </form>
      </section>
    </div>
  );
}
