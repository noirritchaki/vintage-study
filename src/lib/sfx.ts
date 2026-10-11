// Tape sounds. Decoded once into Web Audio buffers so they play with no
// latency. Browsers only allow audio after a user gesture, so call
// unlockAudio() from a pointer/key handler.

const SOUNDS = {
  insert: '/sounds/tape-insert.mp3',
  eject: '/sounds/tape-eject.mp3',
} as const;

export type SoundName = keyof typeof SOUNDS;

let ctx: AudioContext | null = null;
const buffers = new Map<SoundName, Promise<AudioBuffer | null>>();

function context() {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  return ctx;
}

function load(name: SoundName) {
  const ac = context();
  if (!ac) return Promise.resolve(null);
  let p = buffers.get(name);
  if (!p) {
    p = fetch(SOUNDS[name])
      .then((r) => r.arrayBuffer())
      .then((data) => ac.decodeAudioData(data))
      .catch(() => null);
    buffers.set(name, p);
  }
  return p;
}

export function unlockAudio() {
  const ac = context();
  if (!ac) return;
  if (ac.state === 'suspended') void ac.resume();
  (Object.keys(SOUNDS) as SoundName[]).forEach(load);
}

export function playSound(name: SoundName, volume = 1) {
  const ac = context();
  if (!ac) return;
  if (ac.state === 'suspended') void ac.resume();
  void load(name).then((buffer) => {
    if (!buffer) return;
    const src = ac.createBufferSource();
    src.buffer = buffer;
    const gain = ac.createGain();
    gain.gain.value = volume;
    src.connect(gain).connect(ac.destination);
    src.start();
  });
}
