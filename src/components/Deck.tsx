"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { dragState, releaseState, useDeck, viewState } from "@/lib/store";
import { hrefFor, tapeAt, tapes } from "@/data/tapes";
import { profile } from "@/data/profile";
import { TypedText } from "./TypedText";
import { IntroLoader } from "./IntroLoader";
import { useShelfWheel } from "@/hooks/useShelfInput";
import { unlockAudio } from "@/lib/sfx";
import { HELD_Z, PLAYER_BOX, PLAYER_Y, ROW_Y, TAPE_HALF } from "./scene/layout";
import styles from "./Deck.module.css";

const Stage = dynamic(() => import("./scene/Stage"), { ssr: false });

/** Shown in the empty shelf spot after a tape is dropped. */
const DROP_MESSAGES = [
  "oops!",
  "let's try that again",
  "did you do that on purpose?",
  ":o",
];

function pickDropMessage(previous: string) {
  const options = DROP_MESSAGES.filter((m) => m !== previous);
  return options[Math.floor(Math.random() * options.length)];
}

/** The logo loader plays once per visit, not on every return from a case study. */
let introPlayed = false;

const DECIDE_PX = 8;
const SWIPE_PX = 40;

export function Deck({ labelFont }: { labelFont: string }) {
  const router = useRouter();
  const index = useDeck((s) => s.index);
  const phase = useDeck((s) => s.phase);
  const overPlayer = useDeck((s) => s.overPlayer);
  const tape = tapeAt(index);
  const [leaving, setLeaving] = useState(false);
  const [dropMessage, setDropMessage] = useState(DROP_MESSAGES[0]);
  const rootRef = useRef<HTMLDivElement>(null);
  const heroLogo = useRef<HTMLImageElement>(null);
  const [sceneReady, setSceneReady] = useState(false);
  const [introDone, setIntroDone] = useState(introPlayed);
  const finishIntro = useCallback(() => {
    introPlayed = true;
    setIntroDone(true);
  }, []);

  useShelfWheel();

  useEffect(() => {
    if (process.env.NODE_ENV === "development")
      (window as unknown as { __deck: unknown }).__deck = useDeck;
  }, []);

  // Coming back from a tape's page: /?tape=<slug> centres that tape.
  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get("tape");
    const i = tapes.findIndex((t) => t.slug === slug);
    const deck = useDeck.getState();
    if (i >= 0) deck.setIndex(i);
    deck.setPhase("idle");
    deck.setDrag(0, false);
    if (slug) window.history.replaceState(null, "", "/");
  }, []);

  // Once the tape is in and "playing", fade out and go to its page.
  useEffect(() => {
    if (phase !== "playing") return;
    const href = hrefFor(tapeAt(useDeck.getState().index));
    const t1 = setTimeout(() => setLeaving(true), 650);
    const t2 = setTimeout(() => router.push(href), 1150);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [phase, router]);

  // Pointer: a swipe on empty space moves the shelf. Grabbing the centre tape
  // picks it up — it follows the hand anywhere on screen. Let go over the
  // player to insert it; anywhere else and it's thrown and falls.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let start: { x: number; y: number; id: number; grabbed: boolean } | null =
      null;
    let mode: "none" | "swipe" | "drag" | "undecided" = "none";
    let last = { x: 0, y: 0, t: 0 };

    // Pointer px → scene units at the depth the held tape travels at.
    const unitsPerPx = () =>
      viewState.unitsPerPx *
      ((viewState.distance - HELD_Z) / viewState.distance);

    const down = (e: PointerEvent) => {
      unlockAudio();
      // Links and buttons in the overlay keep their own clicks.
      if (e.target instanceof Element && e.target.closest("a, button")) return;
      if (useDeck.getState().phase !== "idle") return;
      start = {
        x: e.clientX,
        y: e.clientY,
        id: e.pointerId,
        grabbed: dragState.grabbed,
      };
      dragState.grabbed = false;
      Object.assign(dragState, { x: 0, y: 0, vx: 0, vy: 0 });
      last = { x: e.clientX, y: e.clientY, t: e.timeStamp };
      mode = "undecided";
      root.setPointerCapture(e.pointerId);
    };

    const move = (e: PointerEvent) => {
      if (!start || e.pointerId !== start.id) return;
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      if (mode === "undecided" && Math.hypot(dx, dy) > DECIDE_PX) {
        if (start.grabbed) {
          mode = "drag";
          useDeck.getState().setPhase("dragging");
          router.prefetch(hrefFor(tapeAt(useDeck.getState().index)));
          document.body.style.cursor = "grabbing";
        } else {
          mode = Math.abs(dx) > Math.abs(dy) ? "swipe" : "none";
        }
      }
      if (mode !== "drag") return;

      const u = unitsPerPx();
      dragState.x = dx * u;
      dragState.y = -dy * u;
      const dt = Math.max(1, e.timeStamp - last.t) / 1000;
      const k = 0.35; // smoothing on the measured hand velocity
      dragState.vx += (((e.clientX - last.x) * u) / dt - dragState.vx) * k;
      dragState.vy += (((last.y - e.clientY) * u) / dt - dragState.vy) * k;
      last = { x: e.clientX, y: e.clientY, t: e.timeStamp };

      const tx = dragState.x;
      const ty = ROW_Y + dragState.y - (PLAYER_Y + PLAYER_BOX.offsetY);
      const over =
        Math.abs(tx) < PLAYER_BOX.halfW + TAPE_HALF.w - 12 &&
        Math.abs(ty) < PLAYER_BOX.halfH + TAPE_HALF.h - 12;
      const progress = Math.max(0, 1 - Math.hypot(tx, ty) / 420);
      useDeck.getState().setDrag(Math.round(progress * 50) / 50, over);
    };

    const up = (e: PointerEvent) => {
      if (!start || e.pointerId !== start.id) return;
      const dx = e.clientX - start.x;
      const deck = useDeck.getState();
      if (mode === "swipe" && Math.abs(dx) > SWIPE_PX)
        deck.step(dx < 0 ? 1 : -1);
      if (mode === "undecided" && start.grabbed) insert();
      if (mode === "drag") {
        document.body.style.cursor = "";
        if (deck.overPlayer) {
          deck.setPhase("inserting");
        } else {
          // Throw it with the hand's velocity (zero if the hand had stopped).
          const still = e.timeStamp - last.t > 80;
          releaseState.vx = still ? 0 : clamp(dragState.vx, -4500, 4500);
          releaseState.vy = still ? 0 : clamp(dragState.vy, -4500, 4500);
          setDropMessage((prev) => pickDropMessage(prev));
          deck.setPhase("falling");
        }
        deck.setDrag(0, false);
      }
      start = null;
      mode = "none";
    };

    root.addEventListener("pointerdown", down);
    root.addEventListener("pointermove", move);
    root.addEventListener("pointerup", up);
    root.addEventListener("pointercancel", up);
    return () => {
      root.removeEventListener("pointerdown", down);
      root.removeEventListener("pointermove", move);
      root.removeEventListener("pointerup", up);
      root.removeEventListener("pointercancel", up);
    };
  }, [router]);

  // Enter / Space inserts the centre tape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      unlockAudio();
      if (e.key === "Enter" || e.key === " ") {
        if ((e.target as HTMLElement)?.closest("a,button")) return;
        e.preventDefault();
        insert();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const hint =
    phase === "inserting"
      ? "loading…"
      : phase === "playing"
        ? "now playing ▶"
        : phase === "dragging" && overPlayer
          ? "let go to play"
          : "drag the tape into the walkman";

  return (
    <>
      <div
        ref={rootRef}
        className={styles.root}
        style={{ "--row-y": ROW_Y, "--player-y": PLAYER_Y } as CSSProperties}
      >
        <Stage labelFont={labelFont} onReady={() => setSceneReady(true)} />

        <div className={styles.overlay}>
          <section
            className={styles.hero}
            data-intro={introDone ? undefined : "waiting"}
          >
            <Image
              ref={heroLogo}
              src="/logo.png"
              alt=""
              width={390}
              height={287}
              priority
              className={styles.heroArt}
            />
            <div className={styles.heroText}>
              <h1 className={styles.headline}>
                {/* Hover (or focus) reveals a hand-written aside pointing at the name. */}
                <span className={styles.nameTag} tabIndex={0}>
                  {/* remounted when the intro ends, so the name types in after the logo lands */}
                  <TypedText
                    key={introDone ? "go" : "wait"}
                    text={profile.name}
                  />
                  <span className={styles.nickname} aria-hidden>
                    <svg width="46" height="40" viewBox="0 0 46 40" fill="none">
                      <path
                        className={styles.nicknameArrow}
                        d="M42 5C30 6 15 13 8 33M8 33L4.5 24.5M8 33L15.5 27.5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        pathLength={1}
                      />
                    </svg>
                    <span className={styles.nicknameText}>
                      {profile.nickname}
                    </span>
                  </span>
                </span>
              </h1>
              <p className={styles.role}>{profile.role}</p>
              <p className={styles.intro}>{profile.intro}</p>
            </div>
          </section>

          {/* Sticky note with the centre tape's title. The outer div positions it;
            motion animates the inner one, since it owns the transform. */}
          <div className={styles.noteAnchor}>
            <AnimatePresence mode="wait">
              <motion.div
                key={tape.slug}
                className={styles.note}
                initial={{ opacity: 0, y: -6, rotate: -14 }}
                animate={{
                  opacity: phase === "idle" || phase === "dragging" ? 1 : 0,
                  y: 0,
                  rotate: -10.06,
                }}
                exit={{
                  opacity: 0,
                  y: 6,
                  rotate: -6,
                  transition: { duration: 0.12 },
                }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                {tape.title}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* A dropped tape leaves a little message in its spot until it pops back. */}
          <div className={styles.oopsAnchor}>
            <AnimatePresence>
              {phase === "falling" && (
                <motion.p
                  key="oops"
                  className={styles.oops}
                  role="status"
                  initial={{ opacity: 0, scale: 0.4, rotate: -14 }}
                  animate={{ opacity: 1, scale: 1, rotate: -5 }}
                  exit={{
                    opacity: 0,
                    scale: 0.8,
                    y: -10,
                    transition: { duration: 0.18 },
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 420,
                    damping: 14,
                    delay: 0.08,
                  }}
                >
                  {dropMessage}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <p className={styles.hint} aria-live="polite">
            {hint}
          </p>

          <footer className={styles.footer}>
            <span>
              Walkman by{" "}
              <a href="https://sketchfab.com/3d-models/sony-walkman-professional-wm-d6c-fa57b1cf2cf34746baecc3fe1736b704">
                Nedotyopa
              </a>
              , tapes by{" "}
              <a href="https://sketchfab.com/3d-models/cassette-tape-d12bc8517ecb470f87862e1c24250d91">
                Zian
              </a>{" "}
              (
              <a href="http://creativecommons.org/licenses/by/4.0/">
                CC BY 4.0
              </a>
              )
            </span>
          </footer>
        </div>

        <nav className={styles.srOnly} aria-label="Tapes">
          <ul>
            {tapes.map((t) => (
              <li key={t.slug}>
                <Link href={hrefFor(t)}>{t.title}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <motion.div
          className={styles.fade}
          initial={false}
          animate={{ opacity: leaving ? 1 : 0 }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
        />
      </div>
      {/* a sibling of the fixed root (not inside it) so it can cover the nav too */}
      {!introPlayed && (
        <IntroLoader
          ready={sceneReady}
          target={heroLogo}
          onDone={finishIntro}
        />
      )}
    </>
  );
}

function insert() {
  const deck = useDeck.getState();
  if (deck.phase !== "idle") return;
  deck.setDrag(1, true);
  deck.setPhase("inserting");
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}
