// Long-form case study content, keyed by tape slug (see tapes.ts).
// A figure without `src` shows a placeholder until its image is added:
// drop the file in public/work/<slug>/ and set `src: '/work/<slug>/name.png'`.

export type Point = { lead?: string; text: string };

export type Figure = {
  label: string;
  caption: string;
  src?: string;
  alt?: string;
  /** The image's pixel size, so the page reserves the right space while it loads. */
  width?: number;
  height?: number;
  /** Sit the image on the watercolor backdrop (for designs with transparent backgrounds). */
  backdrop?: boolean;
};

export type Block =
  | { type: 'text'; text: string }
  | { type: 'points'; points: Point[] }
  | { type: 'figure'; figure: Figure }
  | { type: 'note'; text: string }
  /** Something a user said, with who said it. */
  | { type: 'quote'; text: string; cite: string }
  /** A plain table. The first column is treated as the row heading. */
  | { type: 'table'; columns: string[]; rows: string[][] }
  /** A table of coloured levels, e.g. how results are marked, with what each one means. */
  | { type: 'scale'; title: string; levels: { label: string; tone: 'good' | 'warn' | 'bad'; meaning?: string }[] };

export type Part = {
  /** Left-column title, e.g. "Discharge-led journey". */
  title: string;
  /** Small spaced-caps tag under the title, e.g. "Problem map". */
  tag?: string;
  blocks: Block[];
};

export type Chapter = { numeral: string; title: string; parts: Part[] };

/** One piece of the shipped solution: a numbered panel with a big image or video. */
export type SolutionItem = {
  title: string;
  text: string;
  /** Without `src` or `video`, the panel shows a placeholder. */
  src?: string;
  /**
   * A video, or several encodings of it for the browser to choose from (a
   * transparent video needs HEVC for Safari and VP9 WebM for everyone else).
   */
  video?: string | { src: string; type: string }[];
  /** Still frame shown while the video loads. */
  poster?: string;
  alt?: string;
};

/** "The solution": the final designs, shown right after the chapter that sets up the problem. */
export type Solution = {
  /** Numeral of the chapter it follows, e.g. 'I'. */
  after: string;
  title: string;
  intro: string;
  items: SolutionItem[];
};

export type CaseStudy = {
  /** The page's big heading. */
  headline: string;
  /** Grey line under the heading. */
  subtitle: string;
  /** Opening sentence, set darker than the rest of the intro. */
  lead: string;
  intro: string;
  /** Extra project facts shown alongside Role / Year / Team. */
  facts: { label: string; value: string; wide?: boolean }[];
  stats: { value: string; label: string; detail: string }[];
  solution?: Solution;
  chapters: Chapter[];
};

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

export type OutlineEntry =
  | { kind: 'chapter'; numeral: string; chapter: Chapter }
  | { kind: 'solution'; numeral: string; solution: Solution };

/**
 * The chapters in reading order with the numerals shown on the page. The
 * solution counts as a chapter, so the ones after it shift down by one (a
 * chapter's own `numeral` is just its key, used by `solution.after`).
 */
export function outline(study: CaseStudy): OutlineEntry[] {
  const out: OutlineEntry[] = [];
  for (const chapter of study.chapters) {
    out.push({ kind: 'chapter', numeral: ROMAN[out.length], chapter });
    if (study.solution?.after === chapter.numeral)
      out.push({ kind: 'solution', numeral: ROMAN[out.length], solution: study.solution });
  }
  return out;
}

export const caseStudies: Record<string, CaseStudy> = {
};
