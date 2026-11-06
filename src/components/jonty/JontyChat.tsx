"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import styles from "./JontyChat.module.css";
import { RevealText } from "./RevealText";
import { startersFor } from "@/data/chatStarters";
import type { Thumbnail } from "@/data/tapes";

/** A page the answer points to, shown as a card with its thumbnail. */
type LinkCard = {
  href: string;
  title: string;
  subtitle: string;
  thumbnail?: Thumbnail;
};

type Turn = {
  role: "user" | "assistant";
  content: string;
  /** Still arriving from the server. */
  streaming?: boolean;
  /** Finished revealing on screen. */
  revealed?: boolean;
  /** Suggested next questions, shown under the latest answer. */
  followups?: string[];
  /** The page the visitor was on when this was answered. */
  page?: string;
  /** Pages the answer is about, shown as cards under it. */
  links?: LinkCard[];
  /** Text the visitor highlighted on the page and asked about. */
  quote?: string;
};

/** Longest highlighted passage sent along with a question. */
const MAX_QUOTE = 400;

/** What the server sees for a visitor turn: the question, with any quote it's about. */
const messageFor = (t: Turn) =>
  t.quote
    ? `About this bit of the site: "${t.quote}"\n\n${t.content}`
    : t.content;

/** Short enough to show in one line or two. */
const clip = (text: string, max = MAX_QUOTE) =>
  text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;

/** Separates the answer from the follow-ups JSON in /api/chat's response. */
const RECORD_SEPARATOR = "\u001e";

const GREETINGS = [
  "Hey, ask away.",
  "What would you like to know?",
  "Ask me anything.",
];

/** A fresh greeting, and a seed that picks which page questions to show. */
function pickIntro() {
  return {
    greeting: GREETINGS[Math.floor(Math.random() * GREETINGS.length)],
    seed: Math.floor(Math.random() * 1e6),
  };
}

/** Three of `questions`, chosen by `seed` (the same seed always picks the same three). */
function pickThree(questions: string[], seed: number) {
  const score = (q: string) => {
    let h = seed;
    for (let i = 0; i < q.length; i++) h = (h * 31 + q.charCodeAt(i)) >>> 0;
    return h;
  };
  return [...questions].sort((a, b) => score(a) - score(b)).slice(0, 3);
}

function LinkCards({
  links,
  onOpen,
}: {
  links: LinkCard[];
  onOpen: () => void;
}) {
  return (
    <ul className={styles.cards}>
      {links.map((l, k) => (
        <li key={l.href} style={{ "--i": k } as CSSProperties}>
          <Link href={l.href} className={styles.card} onClick={onOpen}>
            <span className={styles.thumb}>
              {l.thumbnail && "video" in l.thumbnail ? (
                <video
                  src={l.thumbnail.video}
                  poster={l.thumbnail.poster}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  disablePictureInPicture
                  aria-hidden
                />
              ) : l.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element -- small, already-optimised webp
                <img src={l.thumbnail.src} alt="" loading="lazy" />
              ) : null}
            </span>
            <span className={styles.cardText}>
              <span className={styles.cardTitle}>{l.title}</span>
              <span className={styles.cardSub}>{l.subtitle}</span>
            </span>
            <span className={styles.cardArrow} aria-hidden>
              →
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/**
 * Questions under the latest answer: the bot's own follow-ups, or, once the
 * visitor has moved to another page, questions about that page instead.
 */
function Suggestions({
  turn,
  pathname,
  asked,
  onAsk,
}: {
  turn: Turn;
  pathname: string;
  asked: string[];
  onAsk: (question: string) => void;
}) {
  const moved = !!turn.page && turn.page !== pathname;
  const seen = new Set(asked.map((q) => q.trim().toLowerCase()));
  const questions = moved
    ? pickThree(
        startersFor(pathname).filter((q) => !seen.has(q.toLowerCase())),
        asked.length,
      )
    : (turn.followups ?? []);
  if (!questions.length) return null;
  return (
    <>
      {moved ? <p className={styles.pageNote}>about this page</p> : null}
      {/* keyed by page, so the new questions play their entrance */}
      <ul
        key={moved ? pathname : "followups"}
        className={`${styles.starters} ${styles.followups}`}
      >
        {questions.map((q, k) => (
          <li key={q} style={{ "--i": k } as CSSProperties}>
            <button type="button" onClick={() => onAsk(q)}>
              <span aria-hidden>↳</span>
              {q}
            </button>
          </li>
        ))}
      </ul>
    </>
  );
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
    seed: 0,
  }));
  // The starter questions follow whichever page the visitor is on.
  const pageQuestions = startersFor(pathname);
  const input = useRef<HTMLTextAreaElement>(null);
  const log = useRef<HTMLDivElement>(null);
  const abort = useRef<AbortController | null>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);
  // Highlighted text on the page, and where to float the "Ask" button over it.
  const [selection, setSelection] = useState<{
    text: string;
    x: number;
    top: number;
    bottom: number;
  } | null>(null);
  // A highlighted passage waiting in the composer for a question.
  const [quote, setQuote] = useState<string | null>(null);

  // Watch for text highlighted on the page (not in the chat or a form field).
  useEffect(() => {
    let pointerDown = false;
    let timer = 0;
    const read = () => {
      const sel = window.getSelection();
      const text = sel?.toString().replace(/\s+/g, " ").trim() ?? "";
      if (!sel || sel.isCollapsed || !sel.rangeCount || text.length < 3)
        return setSelection(null);
      const node = sel.anchorNode;
      const el = node instanceof Element ? node : node?.parentElement;
      if (!el || el.closest("[data-chat], input, textarea, [contenteditable]"))
        return setSelection(null);
      const rect = sel.getRangeAt(0).getBoundingClientRect();
      if (!rect.width && !rect.height) return setSelection(null);
      setSelection({
        text: clip(text),
        x: rect.left + rect.width / 2,
        top: rect.top,
        bottom: rect.bottom,
      });
    };
    const onDown = () => (pointerDown = true);
    const onUp = () => {
      pointerDown = false;
      requestAnimationFrame(read); // the selection settles after the pointer lifts
    };
    // Keyboard selection and phone selection handles don't end with a mouseup.
    const onChange = () => {
      window.clearTimeout(timer);
      if (window.getSelection()?.isCollapsed) setSelection(null);
      else if (!pointerDown) timer = window.setTimeout(read, 250);
    };
    const onScroll = read; // keep the button pinned to the highlight
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("pointerup", onUp);
    document.addEventListener("selectionchange", onChange);
    window.addEventListener("scroll", onScroll, {
      capture: true,
      passive: true,
    });
    window.addEventListener("resize", read);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerup", onUp);
      document.removeEventListener("selectionchange", onChange);
      window.removeEventListener("scroll", onScroll, { capture: true });
      window.removeEventListener("resize", read);
    };
  }, []);

  const askAboutSelection = () => {
    if (!selection) return;
    setQuote(selection.text);
    setSelection(null);
    window.getSelection()?.removeAllRanges();
    if (!open && turns.length === 0) setIntro(pickIntro());
    setOpen(true);
    requestAnimationFrame(() => input.current?.focus());
  };

  useEffect(() => {
    if (open) input.current?.focus();
    else if (wasOpen.current) launcher.current?.focus();
    wasOpen.current = open;
  }, [open]);

  // Keep the newest words in view as they appear.
  useEffect(() => {
    const box = log.current;
    const inner = content.current;
    if (!box || !inner) return;
    const follow = () => box.scrollTo({ top: box.scrollHeight });
    follow();
    const ro = new ResizeObserver(follow);
    ro.observe(inner);
    return () => ro.disconnect();
  }, [turns.length]);

  // On wide screens the panel pushes the page aside instead of covering it.
  useEffect(() => {
    document.documentElement.toggleAttribute("data-chat-open", open);
  }, [open]);

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
    const text = question.trim() || (quote ? "Tell me more about this." : "");
    if (!text || busy) return;
    const history: Turn[] = [
      ...turns,
      { role: "user", content: text, quote: quote ?? undefined },
    ];
    setTurns([...history, { role: "assistant", content: "" }]);
    setDraft("");
    setQuote(null);
    setBusy(true);

    const write = (content: string, extra: Partial<Turn> = {}) =>
      setTurns((t) => [
        ...t.slice(0, -1),
        { role: "assistant", content, streaming: false, ...extra },
      ]);

    abort.current = new AbortController();
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map((t) => ({
            role: t.role,
            content: messageFor(t),
          })),
          page: pathname,
        }),
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
      let raw = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        raw += decoder.decode(value, { stream: true });
        write(raw.split(RECORD_SEPARATOR)[0], { streaming: true });
      }
      const [answer, extra] = raw.split(RECORD_SEPARATOR);
      let meta: Pick<Turn, "followups" | "links"> = {};
      try {
        if (extra) meta = JSON.parse(extra);
      } catch {}
      // A page gets one card per conversation: skip any already linked above.
      const linked = new Set(
        turns.flatMap((t) => t.links?.map((l) => l.href) ?? []),
      );
      meta.links = meta.links?.filter((l) => !linked.has(l.href));
      write(answer, { ...meta, page: pathname });
    } catch (error) {
      if ((error as Error).name !== "AbortError")
        write(
          "I couldn't reach the server. Check your connection and try again?",
        );
    } finally {
      setBusy(false);
    }
  }

  // Mark an answer as fully shown, which brings in its follow-ups.
  const revealed = useCallback(
    (index: number) =>
      setTurns((t) =>
        t.map((turn, i) => (i === index ? { ...turn, revealed: true } : turn)),
      ),
    [],
  );

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
    setQuote(null);
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
                {pickThree(pageQuestions, intro.seed).map((s) => (
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
            <div ref={content}>
              {turns.map((t, i) =>
                t.role === "user" ? (
                  <div key={i} className={styles.userTurn}>
                    {t.quote ? (
                      <p className={styles.userQuote}>“{t.quote}”</p>
                    ) : null}
                    <p className={styles.user}>{t.content}</p>
                  </div>
                ) : (
                  <div key={i}>
                    <p className={styles.assistant}>
                      {t.content ? (
                        <RevealText
                          text={t.content}
                          streaming={!!t.streaming}
                          onDone={() => revealed(i)}
                        />
                      ) : (
                        <span
                          className={styles.thinking}
                          role="status"
                          aria-label="Thinking"
                        >
                          <Sparkle />
                        </span>
                      )}
                    </p>
                    {t.revealed && t.links?.length ? (
                      <LinkCards
                        links={t.links}
                        onOpen={() => {
                          // Below 900px the panel covers the page, so get out of the way.
                          if (!window.matchMedia("(min-width: 900px)").matches)
                            setOpen(false);
                        }}
                      />
                    ) : null}
                    {i === turns.length - 1 && t.revealed ? (
                      <Suggestions
                        turn={t}
                        pathname={pathname}
                        asked={turns
                          .filter((u) => u.role === "user")
                          .map((u) => u.content)}
                        onAsk={(q) => void ask(q)}
                      />
                    ) : null}
                  </div>
                ),
              )}
            </div>
          )}
        </div>

        <form className={styles.composer} onSubmit={onSubmit}>
          {quote ? (
            <div className={styles.quote}>
              <span className={styles.quoteMark} aria-hidden>
                “
              </span>
              <p>{quote}</p>
              <button
                type="button"
                className={styles.quoteClear}
                onClick={() => {
                  setQuote(null);
                  input.current?.focus();
                }}
                aria-label="Remove quote"
              >
                <CloseIcon />
              </button>
            </div>
          ) : null}
          <div className={styles.row}>
            <textarea
              ref={input}
              rows={1}
              value={draft}
              maxLength={800}
              placeholder={
                quote ? "Ask about this quote…" : "Ask about Noirrit…"
              }
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              aria-label="Your question"
            />
            <button
              type="submit"
              disabled={busy || (!draft.trim() && !quote)}
              aria-label="Send"
            >
              <SendIcon />
            </button>
          </div>
        </form>
      </section>

      {selection ? (
        <button
          type="button"
          className={styles.askSelection}
          style={
            selection.top > 56
              ? {
                  left: selection.x,
                  top: selection.top - 8,
                  translate: "-50% -100%",
                }
              : {
                  left: selection.x,
                  top: selection.bottom + 8,
                  translate: "-50% 0",
                }
          }
          // keep the highlight while clicking
          onPointerDown={(e) => e.preventDefault()}
          onMouseDown={(e) => e.preventDefault()}
          onClick={askAboutSelection}
        >
          <Sparkle />
          Ask JontyLLM
        </button>
      ) : null}
    </div>
  );
}
