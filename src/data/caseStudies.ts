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
  'killing-the-document-update-request': {
    headline: 'Killing the Document Update Request',
    subtitle: 'Rebuilding How People Claim Their Health Money',
    lead: 'A redesign of the claim Plum members file after they’ve already paid a hospital bill.',
    intro:
      "The single biggest reason these claims stall isn't the money. It's the documents. A missing bill, an unreadable scan, a mismatched name triggers a Document Update Request (DUR): the insurer bounces the claim back, and a week or more evaporates. I redesigned three connected journeys (the discharge-led flow, bills & receipts, and reports & prescriptions) around one goal: get every document right the first time, so the claim never comes back.",
    facts: [
      { label: 'Platform', value: 'Mobile' },
      { label: 'Surface', value: 'Reimbursement claims' },
      {
        label: 'Status',
        value: 'Discharge-led flow live and under funnel evaluation; bills & receipts and reports in build.',
        wide: true,
      },
    ],
    stats: [
      { value: '25%', label: 'OPD claimants', detail: 'missed ≥1 bill in the old flow' },
      { value: '3', label: 'Document journeys', detail: 'unified into one system' },
      { value: '₹1', label: 'Penny-drop', detail: 'replaced manual bank proofs' },
      { value: 'V2', label: 'Discharge-led claim', detail: 'shipped Aug 2026' },
    ],
    solution: {
      after: 'I', // Why claims break
      title: 'Get every document right the first time',
      intro: 'Here’s the 4 part solution, from the first upload to the payout.',
      items: [
        {
          title: 'Discharge-led journey',
          text: 'The discharge summary leads the claim: checked on upload, then used to pre-fill everything else.',
        },
        {
          title: 'Reports & prescriptions',
          text: 'Document problems caught in the app, with one re-upload to fix every issue in a go.',
        },
        {
          title: 'Bills & receipts',
          text: 'Clear mandatory and optional bills, plus a nudge right where 25% of people used to miss one.',
        },
        {
          title: 'The connective tissue',
          text: 'Duplicate-draft nudges, ₹1 penny-drop bank checks and upfront delay warnings that tie it all together.',
        },
      ],
    },
    chapters: [
      {
        numeral: 'I',
        title: 'Why claims break',
        parts: [
          {
            title: 'A high-stakes task at a low-capacity moment',
            blocks: [
              {
                type: 'text',
                text: 'Reimbursement is the hardest path in the product, and the one people fall back to when cashless fails. It carries real money and real health context, and the person filing is usually a patient or a caregiver mid-recovery, not a power user.',
              },
              {
                type: 'points',
                points: [
                  { text: 'Every claim demands a specific, insurer-dependent set of documents the member has never been asked for before.' },
                  { text: 'Mistakes are expensive and invisible: a wrong or low-quality scan becomes a deduction or a document query (DUR) weeks later.' },
                  { text: "Delays compound when a member's health ID or policy is still pending at the time they file." },
                ],
              },
            ],
          },
          {
            title: 'The failure modes I designed against',
            tag: 'Problem map',
            blocks: [
              {
                type: 'text',
                text: 'I grounded the redesign in three recurring, costly failures observed across claims operations and support.',
              },
              {
                type: 'points',
                points: [
                  {
                    lead: 'Duplicate claims.',
                    text: 'Members forgot a document, assumed the claim was lost, and re-filed the same claim for the same patient, doubling ops load.',
                  },
                  {
                    lead: 'Missed & mis-matched documents.',
                    text: "Bills left out, reports with issues, and bank proofs whose name didn't match the insured. Each one was a silent dead-end.",
                  },
                  {
                    lead: 'No sense of “what happens next.”',
                    text: 'Once submitted, the claim disappeared into a black box with no expectation-setting on timelines or delays.',
                  },
                ],
              },
              {
                type: 'figure',
                figure: {
                  label: 'Fig. 1',
                  caption: 'One document hub orchestrates all three journeys, with mandatory vs. optional made explicit upfront.',
                },
              },
            ],
          },
        ],
      },
      {
        numeral: 'II',
        title: 'The approach',
        parts: [
          {
            title: 'Four principles that held the system together',
            blocks: [
              {
                type: 'text',
                text: 'Rather than redesign screens one at a time, I set principles that made the three journeys feel like one product.',
              },
              {
                type: 'points',
                points: [
                  {
                    lead: 'Anchor on the one document everyone has.',
                    text: 'The discharge summary becomes the backbone that validates and pre-fills the claim.',
                  },
                  {
                    lead: 'Catch errors before the insurer does.',
                    text: 'Validate documents in-app and let people fix every issue in a single pass.',
                  },
                  {
                    lead: 'Make every requirement legible.',
                    text: 'Mandatory/optional tags, per-section status, and progress counters so nothing is ambiguous.',
                  },
                  {
                    lead: 'Never lose progress.',
                    text: 'Drafts resume, nudges prevent duplicates, and payouts verify in seconds.',
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        numeral: 'III',
        title: 'The three journeys',
        parts: [
          {
            title: 'Discharge-led journey',
            tag: 'Discharge summary as anchor',
            blocks: [
              {
                type: 'text',
                text: 'Internally called “Discharge Summary Driven Reimbursement, V2”, this was the move that reframed the entire claim. Instead of asking members to hand-key admission dates, hospital, and treatment reason, the flow leads with the discharge summary and reads the claim out of it.',
              },
              {
                type: 'points',
                points: [
                  {
                    lead: 'Validate first.',
                    text: 'The flow confirms the uploaded file is actually a discharge summary and blocks the member from proceeding on the wrong document, stopping a whole class of downstream rejections at the door.',
                  },
                  {
                    lead: 'Pre-fill the rest.',
                    text: 'Basic details (hospital, admission/discharge dates, reason for treatment) are carried forward into treatment details and the final review, instead of re-asked.',
                  },
                  {
                    lead: 'Set the category honestly.',
                    text: 'Hospitalization, day-care, pre/post-hospitalization, consultations, and home treatments each carry a plain-language definition so people self-classify correctly.',
                  },
                ],
              },
              {
                type: 'figure',
                figure: { label: 'Fig. 2', caption: 'Discharge summary validation and treatment details auto-fill.' },
              },
            ],
          },
          {
            title: 'Reports & Prescriptions',
            tag: 'Error recovery',
            blocks: [
              {
                type: 'text',
                text: 'This is where the system earns its trust: catching document problems in-app rather than letting the insurer bounce them. I designed the review to handle the messy real-world combinations claims ops actually sees.',
              },
              {
                type: 'points',
                points: [
                  {
                    lead: 'Resolve the full matrix of issues:',
                    text: 'one report with one issue, one report with multiple issues, a missing report sub-class, and a report that implies additional needs (e.g. medicines).',
                  },
                  {
                    lead: 'Fix everything in one pass.',
                    text: '“Upload all your files again to review for all the issues in a go”, so members aren’t ping-ponged through repeated single-file rejections.',
                  },
                  {
                    text: 'Reports stay optional in the hub, so the flow never blocks a valid claim on a document that isn’t required, but flags issues clearly when they are provided.',
                  },
                ],
              },
              {
                type: 'figure',
                figure: { label: 'Fig. 3', caption: 'Errors found in reports: missing documents and a single batch re-upload.' },
              },
            ],
          },
          {
            title: 'Bills & Receipts',
            tag: 'Nudge-driven',
            blocks: [
              {
                type: 'text',
                text: 'The insight that shaped this journey: 25% of people filing an OPD claim miss at least one bill, “leading to wasted effort, slower claims processing or forgotten expenses.” I turned that data point into a contextual callout placed exactly where the mistake happens.',
              },
              {
                type: 'points',
                points: [
                  {
                    lead: 'Clear requirement hierarchy:',
                    text: 'final hospital bill and its payment receipt are mandatory; other bills & receipts are optional, each with a status tag.',
                  },
                  {
                    text: 'A single total claim amount field ties the uploaded bills to the money being claimed, reducing mismatch queries.',
                  },
                  {
                    text: 'The missed-bill nudge sits in-context on the upload screen rather than as a generic warning, turning an analytics finding into a prevention.',
                  },
                ],
              },
              {
                type: 'figure',
                figure: { label: 'Fig. 4', caption: 'Bills and receipts, with the contextual 25% missed-bill callout.' },
              },
            ],
          },
        ],
      },
      {
        numeral: 'IV',
        title: 'The connective tissue',
        parts: [
          {
            title: 'The systemic moves that made it one product',
            blocks: [
              {
                type: 'text',
                text: 'The three journeys only pay off because of the scaffolding around them. This is where “overhaul” rather than “redesign” shows up.',
              },
              {
                type: 'points',
                points: [
                  {
                    lead: 'Duplicate-draft nudge.',
                    text: 'When someone starts a claim for a patient who already has one in drafts, the flow surfaces “There is a claim in your drafts for the same patient” and routes them to resume it, directly attacking the duplicate-claim failure mode.',
                  },
                  {
                    lead: 'Penny-drop bank verification.',
                    text: 'A ₹1 transfer verifies account details in ~30 seconds, replacing manual cancelled-cheque/passbook uploads. When the account name doesn’t match the insured, the flow degrades gracefully to an HR-letter upload instead of a dead-end.',
                  },
                  {
                    lead: 'Upfront delay warnings.',
                    text: 'If a member’s health ID or policy is still pending, a callout warns that “this can affect the reimbursement timeline” before they file, setting expectations instead of apologizing later.',
                  },
                  {
                    lead: 'Progress never lost.',
                    text: 'Drafts save and resume (“you can always resume from where you left off”), and a post-submission status page maps the claim from “submitted to Plum” through “money credited.”',
                  },
                ],
              },
            ],
          },
          {
            title: 'Craft & system notes',
            blocks: [
              { type: 'text', text: 'Decisions that kept a document-heavy flow from feeling heavy.' },
              {
                type: 'points',
                points: [
                  {
                    text: 'A shared component language (status tags, section lists, progress counters, spot icons), so a new document type is a configuration, not a new screen.',
                  },
                  {
                    text: 'Progressive disclosure: “things to keep in mind,” sample documents, and a “why do we need this?” rationale sit one tap away rather than crowding the primary action.',
                  },
                  {
                    text: 'An embedded help path (“book a slot with our claims expert,” in beta) for the cases where self-serve isn’t enough.',
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        numeral: 'V',
        title: 'Impact & what’s next',
        parts: [
          {
            title: 'Shipped, with measurement in flight',
            tag: 'Live',
            blocks: [
              {
                type: 'text',
                text: 'The discharge-summary-led claim (V2) shipped in August 2026; the reports and bills journeys build on it as the document system matures. I’m tracking three outcomes to validate the bets above. This section will harden as the numbers land.',
              },
              {
                type: 'points',
                points: [
                  { text: 'Fewer duplicate claims per patient, attributable to the draft-resume nudge.' },
                  { text: 'Lower document-query (DUR) and deduction rates, from in-app validation and batch re-upload.' },
                  { text: 'Faster, cleaner payouts via penny-drop verification and a single claim-amount reconciliation.' },
                ],
              },
              {
                type: 'note',
                text: 'Outcome metrics are being instrumented; figures will be added once post-launch data is available. The 25% missed-bill figure is the pre-redesign baseline that motivated the bills journey.',
              },
            ],
          },
        ],
      },
    ],
  },
  'health-checkup': {
    headline: 'Health Checkup',
    subtitle: 'Booking, Tracking & Reports',
    lead: 'A preventive-health product that launched to real users, and the design story of what worked and what the data told us to fix next.',
    intro:
      'Plum’s Annual Health Checkups grew 350%+ with 50,000+ completed in a year, but the in-app self-serve journey still converted a sliver of installs and only 8% of free corporate check-ups were being used. V2 redesigned the two moments I owned (the booking & tracking flow and the post-check-up report) to turn a transaction into a journey people could discover, trust, and act on. This is an honest launch-and-learn account, grounded in a usability study (9 moderated sessions, n=197 survey), funnel data from Clevertap, Metabase and Smartlook, and post-launch analytics from PostHog.',
    facts: [
      { label: 'Platform', value: 'Mobile' },
      { label: 'Surface', value: 'Preventive health checkups' },
      {
        label: 'Research',
        value: '9 moderated usability sessions, a survey of 197 higher-intent users, and funnel data from Clevertap, Metabase and Smartlook.',
        wide: true,
      },
      {
        label: 'Post-launch data',
        value: 'PostHog, 17 Jul – 1 Nov 2026 (tracking started in July, so there’s no earlier baseline in it).',
        wide: true,
      },
    ],
    stats: [
      { value: '72.7k', label: 'Opened the checkup home', detail: '17 Jul – 1 Nov 2026' },
      { value: '~16k', label: 'Confirmed bookings', detail: 'by 13.5k people' },
      { value: '+21.5%', label: 'Weekly bookings', detail: 'after the release' },
      { value: '~90%', label: 'Bookers read their report', detail: '12,231 of 13,550' },
    ],
    solution: {
      after: 'II', // The problem
      title: 'From a transaction to a journey people trust',
      intro: 'Here’s the 5 part solution across booking, tracking and the report.',
      items: [
        {
          title: 'Motivators up front',
          text: '“Free,” at-home collection and family eligibility visible before anyone commits, with “Who is this for?” moved earlier.',
          // transparent background, so it sits straight on the watercolor
          video: [
            { src: '/work/health-checkup/walkthrough.mov', type: 'video/quicktime; codecs="hvc1"' },
            { src: '/work/health-checkup/walkthrough.webm', type: 'video/webm; codecs="vp9"' },
          ],
          poster: '/work/health-checkup/walkthrough-poster.webp',
          alt: 'Prototype walkthrough of booking a health checkup, from the checkup home screen through choosing a package.',
        },
        {
          title: 'Pick up where you left off',
          text: 'A way back into a booking people finish across sessions, with morning weekday slots first.',
          video: [
            { src: '/work/health-checkup/resume-walkthrough.mov', type: 'video/quicktime; codecs="hvc1"' },
            { src: '/work/health-checkup/resume-walkthrough.webm', type: 'video/webm; codecs="vp9"' },
          ],
          poster: '/work/health-checkup/resume-walkthrough-poster.webp',
          alt: 'Prototype walkthrough of resuming a booking: tapping Resume on the home screen’s “Pick up where you left off” card, landing on the saved pickup slot, then the cart.',
        },
        {
          title: 'Reassuring tracking',
          text: 'Phlebotomist assignment, visit tracking and a clear “what happens next” after booking.',
          video: [
            { src: '/work/health-checkup/tracking-walkthrough.mov', type: 'video/quicktime; codecs="hvc1"' },
            { src: '/work/health-checkup/tracking-walkthrough.webm', type: 'video/webm; codecs="vp9"' },
          ],
          poster: '/work/health-checkup/tracking-walkthrough-poster.webp',
          alt: 'Prototype walkthrough of tracking a checkup: from scheduled, to sample collected and on the way to the lab, to the report being ready with the free doctor consultation offered.',
        },
        {
          title: 'Snapshot → category → biomarker',
          text: 'A three-layer report that shows what needs attention first, then lets you drill in.',
          video: [
            { src: '/work/health-checkup/report-walkthrough.mov', type: 'video/quicktime; codecs="hvc1"' },
            { src: '/work/health-checkup/report-walkthrough.webm', type: 'video/webm; codecs="vp9"' },
          ],
          poster: '/work/health-checkup/report-walkthrough-poster.webp',
          alt: 'Prototype walkthrough of the health report: the snapshot ring of biomarkers tested, then drilling into Blood Urea Nitrogen with its value on a coloured range bar.',
        },
        {
          title: 'Report to next action',
          text: 'The free doctor consultation, tied to the moment you read your report.',
          video: [
            { src: '/work/health-checkup/next-steps-walkthrough.mov', type: 'video/quicktime; codecs="hvc1"' },
            { src: '/work/health-checkup/next-steps-walkthrough.webm', type: 'video/webm; codecs="vp9"' },
          ],
          poster: '/work/health-checkup/next-steps-walkthrough-poster.webp',
          alt: 'Scrolling through the report’s “Next steps” cards: schedule a free doctor consultation, consultation confirmed, an action plan ready, a follow-up with the doctor, and a paid consultation.',
        },
      ],
    },
    chapters: [
      {
        numeral: 'I',
        title: 'Context & my role',
        parts: [
          {
            title: 'The product',
            blocks: [
              {
                type: 'text',
                text: 'Plum is an India-based health benefits platform; Health Checkups is its preventive-care product. It offers curated biomarker panels (built from 200+ markers researched down to what matters), at-home sample collection, an in-app report, and a free follow-up doctor consultation. Many employees get it free through their employer; others buy retail plans (Core, Pulse, Professional, Athlete, Disease Risk).',
              },
              {
                type: 'points',
                points: [
                  { text: 'The business was growing fast on the sales side, but the in-app experience was where intent went to die.' },
                  { text: 'The vision: not a one-time formality, but a repeatable loop of awareness → action.' },
                ],
              },
            ],
          },
          {
            title: 'My scope',
            tag: 'Design owner',
            blocks: [
              {
                type: 'text',
                text: 'I owned two surfaces of V2: the booking & tracking journey and the post-check-up report. Discovery/marketing and the plan-catalog strategy sat with PMM and product; V3 (Master Health Checkup) is a separate, later effort owned by someone else and is out of scope here.',
              },
            ],
          },
          {
            title: 'How I validated',
            blocks: [
              {
                type: 'text',
                text: 'The work is anchored in a dedicated usability study of the live product: 9 moderated remote sessions (a mix of recent bookers, drop-offs, and non-starters) plus a survey of 197 higher-intent users, read against funnel analytics.',
              },
              { type: 'text', text: 'Severity was coded per step as clear, usable but unclear, or confusing.' },
            ],
          },
        ],
      },
      {
        numeral: 'II',
        title: 'The problem',
        parts: [
          {
            title: 'Intent leaked out of the funnel',
            blocks: [
              { type: 'text', text: 'Before the redesign, the numbers told the same story from every angle.' },
              {
                type: 'points',
                points: [
                  { lead: '0.16% of installs booked:', text: '104 bookings from 61,434 installs over 90 days.' },
                  { lead: '8% corporate adoption,', text: 'even though the checkup was fully free for those employees.' },
                  { lead: '~41% dropped after a single listing view,', text: 'because booking spanned more than one session.' },
                  { lead: '82% booked only for themselves,', text: 'leaving family demand untapped.' },
                ],
              },
              {
                type: 'figure',
                figure: {
                  label: 'Fig. 1',
                  caption:
                    'Unique users by stage, as a share of app launches. Discovery and the first listing view are where the journey collapses.',
                  src: '/work/health-checkup/funnel.webp',
                  alt: 'Bar chart: of everyone who launched the app, about 14% reached the checkup homepage, about 4% viewed a listing and under 2% confirmed a booking.',
                  width: 1605,
                  height: 615,
                },
              },
            ],
          },
          {
            title: 'Three friction points, in my scope',
            blocks: [
              { type: 'text', text: 'The usability study localized the pain to specific, fixable moments.' },
              {
                type: 'points',
                points: [
                  {
                    lead: 'Booking rarely finished in one sitting.',
                    text: '~41% dropped after a single listing view; people explored, left, and returned, with no way to resume.',
                  },
                  {
                    lead: 'Key motivators surfaced too late.',
                    text: '“Free,” at-home collection, and booking for family only appeared deep in the flow, after many had already decided or left.',
                  },
                  {
                    lead: 'Reports were hard to find, then hard to trust.',
                    text: 'Users looked in their profile; the report lived under “Your bookings.” Once open, borderline values and inconsistent marker counts shook confidence.',
                  },
                ],
              },
            ],
          },
          {
            title: 'In their words',
            blocks: [
              {
                type: 'quote',
                text: 'I couldn’t find my report initially. My colleagues faced the same issue, one even thought the report had vanished.',
                cite: 'Usability participant, on finding reports',
              },
              {
                type: 'quote',
                text: 'I didn’t know I could book it for my mother until I reached this page. I had to check with her and come back later.',
                cite: 'Usability participant, abandoning at member selection',
              },
            ],
          },
        ],
      },
      {
        numeral: 'III',
        title: 'Design response: booking & tracking',
        parts: [
          {
            title: 'Pull motivators forward',
            tag: 'Inferred from research',
            blocks: [
              {
                type: 'text',
                text: 'Make “free,” at-home collection, and family eligibility visible before the user has to commit. These were the strongest triggers (employer-free was the #1 booking motivator at 45.2%) yet were buried.',
              },
              {
                type: 'points',
                points: [
                  { text: 'Move “Who is this for?” earlier so people commit to a person before investing effort in slots.' },
                  { text: 'Say “at-home sample collection” in plain copy, not implied by a word like “phlebotomist.”' },
                ],
              },
              {
                type: 'figure',
                figure: {
                  label: 'Fig. 2',
                  caption: '“Free,” at-home collection and family eligibility up front, with “Who is this for?” moved earlier.',
                  src: '/work/health-checkup/motivators.webp',
                  alt: 'Two screens: the checkup home with “Doorstep Sample Collection” and “Book for Family” callouts under the search bar, and a “Who is this for?” sheet for picking a family member.',
                  width: 2000,
                  height: 1272,
                  backdrop: true,
                },
              },
            ],
          },
          {
            title: 'Support multi-session booking',
            tag: 'Inferred from research',
            blocks: [
              {
                type: 'text',
                text: 'Treat the ~41% drop-off as a resume problem, not a loss. A “pick up where you left off” re-entry point meets the real behavior: explore, leave, return. Morning weekday slots, the clear preference for fasting, get prioritized in the UI.',
              },
              {
                type: 'figure',
                figure: {
                  label: 'Fig. 3',
                  caption: 'A “pick up where you left off” re-entry point, with morning weekday slots first.',
                  src: '/work/health-checkup/resume.webp',
                  alt: 'Two screens: a “Pick up where you left off” card on the home screen with a Resume button, and a sample pickup sheet with the member and address saved and morning time slots to choose from.',
                  width: 1290,
                  height: 812,
                  backdrop: true,
                },
              },
            ],
          },
          {
            title: 'Make tracking reassuring',
            tag: 'Inferred from research',
            blocks: [
              {
                type: 'text',
                text: 'Close the anxiety gap between booking and sample collection. Phlebotomist assignment and visit tracking, plus a clear “what happens next” on the summary, so the hour-before-assignment surprise becomes an expected step.',
              },
              {
                type: 'figure',
                figure: {
                  label: 'Fig. 4',
                  caption: 'Phlebotomist assignment, visit tracking and a clear “what happens next” on the summary.',
                  src: '/work/health-checkup/tracking.webp',
                  alt: 'Five tracking screens in order: checkup scheduled, partner assigned with their name and a call button, sample collected and on the way to the lab, report being processed, and report ready with a prompt to book the free doctor consultation.',
                  width: 2000,
                  height: 740,
                  backdrop: true,
                },
              },
              {
                type: 'quote',
                text: 'Plum is way easier than other websites. The UX is better and it doesn’t ask for unnecessary things.',
                cite: 'Usability participant comparing booking flows',
              },
            ],
          },
        ],
      },
      {
        numeral: 'IV',
        title: 'Design response: reports',
        parts: [
          {
            title: 'Design for the real decision factors',
            blocks: [
              {
                type: 'figure',
                figure: {
                  label: 'Fig. 5',
                  caption:
                    'Survey (n=197): what most influences a check-up decision. The report has to speak to tests and credibility, not just a score.',
                  src: '/work/health-checkup/survey.webp',
                  alt: 'Bar chart: price influences about 64% of check-up decisions, the tests included about 58%, and the lab or hospital brand about 49%.',
                  width: 1605,
                  height: 540,
                },
              },
            ],
          },
          {
            title: 'Snapshot → category → biomarker',
            tag: 'Inferred from research',
            blocks: [
              {
                type: 'text',
                text: 'A three-layer report that opens with a snapshot of how many markers need attention, surfaces out-of-range categories first, then drills into each biomarker. This layering tested well: users called the category and detail pages “crystal clear” and valued seeing problems first.',
              },
              {
                type: 'points',
                points: [
                  { text: 'Make the snapshot visualization tappable straight to the markers that need attention, not just a scroll cue.' },
                  { text: 'Fix borderline representation: a value exactly on the edge shouldn’t read as “non-optimal.”' },
                ],
              },
              {
                type: 'figure',
                figure: {
                  label: 'Fig. 6',
                  caption: 'The three-layer report: a snapshot, out-of-range categories first, then each biomarker.',
                  src: '/work/health-checkup/report.webp',
                  alt: 'Two report screens: a health snapshot ring showing 102 biomarkers tested (97 in range, 8 sub-optimal, 4 non-optimal) with a prompt to schedule the free doctor consultation, and a Blood Urea Nitrogen detail page with the value on a coloured range bar and a summary.',
                  width: 2000,
                  height: 1274,
                  backdrop: true,
                },
              },
            ],
          },
          {
            title: 'How to detect severity',
            blocks: [
              {
                type: 'text',
                text: 'Every biomarker gets one of three levels, so the report reads at a glance: what’s fine, what to keep an eye on, and what to act on. Colour does the first read and the label says it in words. The levels also decide what comes first, with anything that needs attention pulled to the top, and a value sitting right on the edge of its range shouldn’t land in a worse level than it deserves.',
              },
              {
                type: 'scale',
                title: 'Level',
                levels: [
                  { label: 'Optimal', tone: 'good', meaning: 'Within the healthy range for that marker.' },
                  {
                    label: 'Sub-optimal',
                    tone: 'warn',
                    meaning: 'Just outside the healthy range. Worth keeping an eye on and re-testing.',
                  },
                  {
                    label: 'Needs attention',
                    tone: 'bad',
                    meaning: 'Clearly out of range. Shown first, next to the free doctor consultation.',
                  },
                ],
              },
            ],
          },
          {
            title: 'Reunite the report with the next action',
            tag: 'Inferred from research',
            blocks: [
              {
                type: 'text',
                text: 'Tie the free doctor consultation to the report moment. Several users never discovered the free consult and planned to pay for one elsewhere, the strongest unforced error to fix. And surface reports where people’s mental model expects them, not only inside “Your bookings.”',
              },
              {
                type: 'figure',
                figure: {
                  label: 'Fig. 7',
                  caption:
                    'The “Next steps” card ties the free doctor consultation to the report, and changes as the consult is booked and followed up.',
                  src: '/work/health-checkup/consult.webp',
                  alt: 'Five versions of the report’s “Next steps” card: schedule a free doctor consultation, schedule a paid consultation, consultation confirmed, an action plan ready to view, and book a follow-up with the doctor.',
                  width: 2000,
                  height: 634,
                  backdrop: true,
                },
              },
            ],
          },
        ],
      },
      {
        numeral: 'V',
        title: 'Launched, and what we learned',
        parts: [
          {
            title: 'Scale after launch',
            tag: 'PostHog',
            blocks: [
              {
                type: 'text',
                text: 'Between 17 July and 1 November 2026, 72.7k people opened the checkup homepage and about 13.5k of them booked, for roughly 16k confirmed bookings. Monthly bookings rose from 4,215 in August to 5,941 in September and held at 5,744 in October.',
              },
              {
                type: 'text',
                text: 'Weekly bookings averaged 1,182 in the weeks before the release (10–30 Aug) and 1,436 in the weeks after it (7 Sep – 4 Oct), a 21.5% lift. Telehealth grew 13% over the same weeks, so some of that is the app growing overall, but checkups grew faster.',
              },
              {
                type: 'figure',
                figure: {
                  label: 'Fig. 8',
                  caption: 'Confirmed checkup bookings per month. July is left out: only about two weeks of it were tracked.',
                  src: '/work/health-checkup/bookings-monthly.webp',
                  alt: 'Bar chart of confirmed bookings: 4,215 in August, 5,941 in September and 5,744 in October.',
                  width: 1600,
                  height: 620,
                },
              },
            ],
          },
          {
            title: 'Where the funnel still leaks',
            tag: 'PostHog',
            blocks: [
              {
                type: 'text',
                text: 'The biggest drop is between browsing and choosing: 65% of homepage visitors reach a listing, but only 21% add anything to the cart. Once something is in the cart, the flow is quick, with a median of 2 minutes from cart to slot and under a minute from picking a member to booking.',
              },
              {
                type: 'figure',
                figure: {
                  label: 'Fig. 9',
                  caption:
                    'People who completed each step in order, as a share of homepage viewers (17 Jul – 1 Nov). Because it only counts people who went step by step, it’s lower than the total number of bookers.',
                  src: '/work/health-checkup/funnel-posthog.webp',
                  alt: 'Funnel: homepage viewed 72,540 (100%), listing viewed 47,192 (65.1%), added to cart 15,501 (21.4%), slot selected 8,945 (12.3%), member selected 8,506 (11.7%), booking confirmed 6,677 (9.2%), report viewed 5,868 (8.1%), report action 2,167 (3.0%).',
                  width: 1600,
                  height: 586,
                },
              },
              {
                type: 'text',
                text: 'And the people who leave mostly aren’t gone. Of those who viewed a listing without adding anything, within 14 days about 29.7k went back to the app home, about 17.8k came back to the checkup home, and about 9k moved over to Telehealth, while about 28.4k left the app.',
              },
            ],
          },
          {
            title: 'What clearly worked',
            tag: 'Validated',
            blocks: [
              {
                type: 'text',
                text: 'The report experience is the product’s strongest asset.',
              },
              {
                type: 'points',
                points: [
                  { text: 'Biomarker breakdown, fasting info, and out-of-range-first ordering were consistently praised.' },
                  {
                    text: 'One user cross-checked the report against an AI tool: “everything the AI said turned out to be similar to what the app is saying.” Trust, earned.',
                  },
                  { text: 'The slot and address steps were low-friction; all participants completed them easily.' },
                  { lead: 'People come back for their results:', text: 'about 90% of bookers went on to view their report (12,231 of 13,550).' },
                  { lead: 'And come back to book again:', text: 'about 15% have booked more than once (1,997 of 13,550).' },
                  {
                    lead: 'Paying users follow through:',
                    text: 'people who reached the payment gateway (paying themselves rather than covered by their employer) booked at 84.5%, against 15.9% for everyone else, and about 83% of them completed payment (2,021 of 2,432).',
                  },
                ],
              },
            ],
          },
          {
            title: 'What’s still broken',
            tag: 'Open',
            blocks: [
              { type: 'text', text: 'Honest gaps the live data and sessions exposed.' },
              {
                type: 'points',
                points: [
                  { text: 'Report discoverability remains the top complaint: the “Your bookings” entry point fights users’ mental models.' },
                  {
                    lead: 'Data integrity hurts trust:',
                    text: 'colleagues on the same corporate plan saw different marker counts (“I had 29 parameters, my colleague had 35”).',
                  },
                  {
                    text: 'Discovery & comparison (upstream of my scope) still gates volume: “free” is invisible on the home screen and plans can’t be compared side-by-side.',
                  },
                  {
                    lead: 'Location blocks real demand:',
                    text: 'about 11% of people who checked serviceability couldn’t get a checkup in their area (6,375 of 57,377). They wanted one; we couldn’t reach them.',
                  },
                  {
                    lead: 'Reading isn’t acting yet:',
                    text: 'of people who viewed their report in the funnel, only about 37% took an action from it (2,167 of 5,868).',
                  },
                ],
              },
            ],
          },
          {
            title: 'What I’d ship next',
            blocks: [
              { type: 'text', text: 'Sequenced by effort-to-trust ratio.' },
              {
                type: 'points',
                points: [
                  { text: 'Relocate reports to a predictable home (profile / upfront card) and persist them regardless of booking count.' },
                  { text: 'Resolve the marker-count discrepancy at the data layer before any further visual polish.' },
                  {
                    text: 'Lean into packages: 43.4% of people who add a package go on to book, against 24.3% for individual tests (7,910 of 18,239 vs 1,096 of 4,511), which argues for curating and bundling the catalog.',
                  },
                ],
              },
              {
                type: 'note',
                text: 'Member and slot selection, once missing from the funnel, are now tracked in PostHog, so the funnel is no longer a black box between cart and booking.',
              },
            ],
          },
        ],
      },
      {
        numeral: 'VI',
        title: 'Reflection',
        parts: [
          {
            title: 'What this taught me',
            blocks: [
              {
                type: 'text',
                text: 'The hardest design problems here weren’t on the screen; they were in sequence and trust. V2 proved the report could make preventive health legible and even enjoyable. But a beautiful report nobody can find, built on data a user can’t reconcile with their colleague’s, erodes faster than it earns. The clearest wins came from moving existing content earlier and connecting moments that already existed (discovery of “free,” of family, of the free consult), not from adding more. That’s the thread I carried into the handoff.',
              },
            ],
          },
        ],
      },
    ],
  },
  'when-the-insurer-says-no': {
    headline: 'When the Insurer Says No',
    subtitle: 'Designing a Fair Claim Dispute Flow at Plum',
    lead: 'How Plum users understand, and dispute, an insurer’s decision when a claim is settled for less or rejected outright.',
    intro:
      'There are two ways a dispute starts: Plum’s system verifies the settlement and disputes unfair deductions on the user’s behalf, or the user raises one themselves from the app. In three weeks I took this from kickoff to a leadership-reviewed mobile flow handed to engineering, plus an interim email redesign that shipped the same explanations right away.',
    facts: [
      { label: 'Platform', value: 'Mobile app + email' },
      { label: 'Timeline', value: '3 weeks (9–30 Oct 2026)' },
      { label: 'Team', value: 'Claims PM, design lead, head of product' },
      {
        label: 'Status',
        value: 'Mobile flow handed to engineering; the interim email redesign shipped the same explanations right away.',
        wide: true,
      },
    ],
    stats: [
      { value: '80–85%', label: 'IPD claims settled', detail: 'with a deduction' },
      { value: '40%', label: 'Deducted claimants', detail: 'went to support' },
      { value: '40%', label: 'Rejected claimants', detail: 'opened a ticket within 7 days' },
      { value: '10–15×', label: 'Claim page revisits', detail: 'by rejected or deducted claimants' },
    ],
    solution: {
      after: 'II', // The problem, in the data
      title: 'Explain first, then make disputing fair',
      intro: 'Here’s the 5 part solution across the claim page, the dispute journey and email.',
      items: [
        {
          title: 'Cited deduction explanations',
          text: 'Every deduction shows a grouped reason, the amount, a plain-language cause, and a reference to the bill or the rule behind it.',
        },
        {
          title: 'A grouped summary, with dispute on every item',
          text: 'Deductions grouped into fixable, policy-limited and not covered, with a way to dispute right next to each one.',
        },
        {
          title: 'Plum is verifying',
          text: 'A new stage between settled and closed, with an ETA, so the days Plum spends checking the insurer’s decision are visible.',
        },
        {
          title: 'Raising a dispute',
          text: 'Pick the items, then resolve each one on a checklist: upload proof, or say why you don’t have it.',
        },
        {
          title: 'The interim email',
          text: 'A deduction table in the closure email, so people got clear explanations before the app flow shipped.',
        },
      ],
    },
    chapters: [
      {
        numeral: 'I',
        title: 'Context & my role',
        parts: [
          {
            title: 'Plum is the user’s referee, but only behind the scenes',
            blocks: [
              {
                type: 'text',
                text: 'When an insurer settles a claim, Plum checks whether the decision was fair and fights the unfair ones. These disputes recover an estimated ₹80–100 lakh a month for users. Users never saw any of it.',
              },
              {
                type: 'text',
                text: 'Until now, one team reviewed every settlement by hand and another phoned users to explain deductions. Users got a human-written email after settlement, and the app went silent at exactly the moment they were most anxious.',
              },
            ],
          },
          {
            title: 'SettlementLens',
            tag: 'The system',
            blocks: [
              {
                type: 'text',
                text: 'SettlementLens is Plum’s system for reviewing insurer decisions automatically. It takes over the roughly 85% of cases where the insurer was fair, so specialists can focus on real disputes. But automation only helps if users trust and understand its verdicts. That trust gap is where design came in.',
              },
            ],
          },
          {
            title: 'My role',
            tag: 'Sole product designer',
            blocks: [
              {
                type: 'text',
                text: 'I was the only designer, end to end, working with the claims PM, the design lead and the head of product. Three weeks from kickoff to a mobile flow reviewed by leadership and handed to engineering, plus an interim email redesign.',
              },
            ],
          },
        ],
      },
      {
        numeral: 'II',
        title: 'The problem, in the data',
        parts: [
          {
            title: 'Deductions are the norm, and rarely the user’s fault',
            tag: 'Claims data',
            blocks: [
              {
                type: 'text',
                text: 'Before sketching anything, I pulled together three sources to find out where users actually got stuck. Each one changed what I thought the project was about.',
              },
              {
                type: 'text',
                text: '80–85% of IPD claims settled with a deduction, and non-medical items were the top driver. Most deducted claims had several reasons at once, not just one. For rejections, 57% were about coverage (the policy didn’t cover the treatment), OPD exclusions alone were 31%, and only 6% were about missing documents.',
              },
              {
                type: 'points',
                points: [
                  {
                    lead: 'What it told me:',
                    text: 'most “no” decisions are rule-based, not arbitrary. The core design problem was explaining rules clearly, not building a dispute machine.',
                  },
                ],
              },
            ],
          },
          {
            title: 'Users were looking for answers and not finding them',
            tag: 'App analytics',
            blocks: [
              {
                type: 'text',
                text: 'Rejected or deducted claimants revisited the claim page 10–15 times on average. 40% of deducted claimants went to support, and 40% of rejected claimants opened a support ticket within 7 days.',
              },
              {
                type: 'points',
                points: [
                  {
                    lead: 'What it told me:',
                    text: 'the claim page was the right place to answer the question, and it wasn’t answering it. These two metrics became my success measures.',
                  },
                ],
              },
            ],
          },
          {
            title: 'The explanation was happening by phone',
            tag: 'Ops conversations',
            blocks: [
              {
                type: 'text',
                text: 'Claims ops spent about 50% of their effort on settlement reviews and calls. From talking to the team, I learned only about 15% of users could provide every document an insurer asked for, because hospitals lost records, patients were unconscious, or rural clinics never issued paperwork. Users read these requests as bad-faith excuses, which made Plum look “as evil as the insurer.”',
              },
              {
                type: 'points',
                points: [
                  {
                    lead: 'What it told me:',
                    text: 'the tone of every explanation mattered as much as its content, and the dispute flow had to accept “I don’t have this document” as a valid answer.',
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        numeral: 'III',
        title: 'Two paths to a dispute',
        parts: [
          {
            title: 'One system, two ways in',
            blocks: [
              {
                type: 'text',
                text: 'Every settled claim now passes through SettlementLens before it closes, and a dispute can start in one of two ways. Designing both, and making them feel like one system, was the heart of the project.',
              },
              {
                type: 'table',
                columns: ['', 'Plum-initiated', 'User-initiated'],
                rows: [
                  [
                    'Who starts it',
                    'SettlementLens flags an unfair deduction or rejection, and Plum disputes it with the insurer',
                    'The user, from the claim page, after Plum has verified the settlement',
                  ],
                  [
                    'When',
                    'During the “Plum is verifying” stage, up to 3 working days after settlement',
                    'After verification, until the user accepts the settlement and leaves feedback',
                  ],
                  [
                    'What the user does',
                    'Nothing required; they track progress and may be asked for a document',
                    'Selects items, enters an amount, uploads proof or explains why they can’t, and writes a reason',
                  ],
                  [
                    'What design had to solve',
                    'Making invisible work visible, so users trust Plum is acting for them',
                    'Making disputing possible but deliberate, so specialist time goes to real cases',
                  ],
                ],
              },
              {
                type: 'text',
                text: 'The two paths share one claim timeline, one deduction breakdown, and the same outcome states (in review, approved, partially approved, rejected). A user should never have to know which path they’re on to understand where their money stands.',
              },
            ],
          },
          {
            title: 'Constraints',
            blocks: [
              {
                type: 'text',
                text: 'Three constraints shaped every screen. My early read was that UI complexity was low; the real work was in the messaging and the rules logic.',
              },
              {
                type: 'points',
                points: [
                  {
                    lead: 'Business:',
                    text: 'every dispute costs Plum specialist time. The flow had to reduce disputes that shouldn’t happen without hiding the ones that should.',
                  },
                  {
                    lead: 'Regulatory:',
                    text: 'some deductions, like non-medical items under IRDAI rules and co-pay, can never be disputed.',
                  },
                  {
                    lead: 'System:',
                    text: 'reviews run on an AI model, so some settlements come back “unsure” and need a human. The interface needed a way to handle that wait.',
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        numeral: 'IV',
        title: 'Key decisions, and the data behind them',
        parts: [
          {
            title: 'Explain before you offer a fight',
            blocks: [
              {
                type: 'points',
                points: [
                  {
                    lead: 'The data:',
                    text: '57% of rejections were coverage-based and most deductions followed fixed rules. Users revisited the claim page 10–15 times looking for a reason.',
                  },
                ],
              },
              {
                type: 'text',
                text: 'The PM and I split the work into two parts: (A) explaining every deduction with full citations, then (B) the dispute flow. We finished A first. A clear explanation is what keeps a fair deduction from becoming a dispute.',
              },
              {
                type: 'text',
                text: 'Each deduction shows a grouped reason, the amount, a plain-language cause, and a reference, such as “X-ray on bill #143, report not uploaded” or “Syringe ₹200, Gloves ₹250, per IRDAI non-medical list.” Policy deductions like co-pay cite the user’s own policy clause.',
              },
              {
                type: 'figure',
                figure: { label: 'Fig. 1', caption: 'A deduction explained with its reason, amount, plain-language cause and citation.' },
              },
            ],
          },
          {
            title: 'A grouped summary, with dispute access on every item',
            blocks: [
              {
                type: 'points',
                points: [{ lead: 'The data:', text: 'most deducted claims had several reasons at once, so lists could get long.' }],
              },
              {
                type: 'text',
                text: 'I explored two directions. Direction A explained deductions inline on the claim page with a dispute button on each item, but got unwieldy with long lists. Direction B was a separate post-settlement summary, like a delivery receipt, grouping deductions into fixable, policy-limited, and not covered, but risked hiding items inside collapsed groups. I dropped a third, a guided walkthrough, as too tedious. The final design combines B’s grouped summary with A’s dispute access next to each item.',
              },
              {
                type: 'figure',
                figure: {
                  label: 'Fig. 2',
                  caption: 'Directions A and B, and the combination: B’s grouped summary with A’s dispute access on each item.',
                },
              },
            ],
          },
          {
            title: 'Never say “you can’t”',
            blocks: [
              {
                type: 'points',
                points: [{ lead: 'The data:', text: 'ops calls showed users already saw Plum as siding with the insurer.' }],
              },
              {
                type: 'text',
                text: 'Non-disputable items stay visible and grouped, but point to help instead of a dead end. Early explorations labelled this group “You can’t dispute.” In review we agreed that read as a closed door, so each item now explains its rule and offers “Contact us.”',
              },
            ],
          },
          {
            title: 'Accept the missing document',
            blocks: [
              {
                type: 'points',
                points: [
                  { lead: 'The data:', text: 'only about 15% of users could provide every document the insurer asked for.' },
                ],
              },
              {
                type: 'text',
                text: 'A disputed item needs either supporting proof or a stated reason for not having it. Confirming “I don’t have this document” is a first-class option, not an error.',
              },
            ],
          },
          {
            title: 'Dispute or accept, not both',
            blocks: [
              {
                type: 'points',
                points: [
                  {
                    lead: 'The data:',
                    text: '50% of ops effort went to settlement reviews and comms, so every unnecessary dispute had a real cost.',
                  },
                ],
              },
              {
                type: 'text',
                text: 'Each claim ends one of two ways: the user disputes, or accepts and leaves feedback. Once feedback is given, disputing closes and the screen says so; feedback is off while a dispute is open. The dispute entry point is deliberately low-key. I flagged that hiding it too much would just push users to the generic Help & Support link, recreating the support load we were trying to cut.',
              },
            ],
          },
        ],
      },
      {
        numeral: 'V',
        title: 'Path 1: when Plum disputes for you',
        parts: [
          {
            title: 'Design for the wait',
            blocks: [
              {
                type: 'text',
                text: 'The auto-dispute path had a simple goal: show users that Plum is working for them during the days they’d otherwise see a settled claim with nothing happening.',
              },
              {
                type: 'text',
                text: 'I added a “Plum is verifying” stage, with an ETA, between “settled” and “closed.” Human review of unsure cases takes up to 3 working days. During this stage, user disputes are turned off, with a line explaining why, and the screen says Plum will proactively dispute any unfair deductions.',
              },
              {
                type: 'figure',
                figure: { label: 'Fig. 3', caption: 'The “Plum is verifying” stage, with an ETA, between settled and closed.' },
              },
            ],
          },
          {
            title: 'Screens and states',
            blocks: [
              {
                type: 'points',
                points: [
                  { lead: 'Verifying:', text: 'the settlement amount, the ETA, and what Plum is checking.' },
                  {
                    lead: 'Verified, no issues found:',
                    text: 'the settlement stands; the user can now accept it or raise their own dispute.',
                  },
                  { lead: 'Plum raised a dispute:', text: 'which items Plum is disputing, the amount at stake, and why.' },
                  {
                    lead: 'Outcome:',
                    text: 'in review, approved, partially approved, or rejected, with the recovered amount.',
                  },
                ],
              },
              {
                type: 'figure',
                figure: { label: 'Fig. 4', caption: 'The Plum-initiated path, from verifying through to the outcome.' },
              },
            ],
          },
          {
            title: 'The copy problem at the centre of it',
            tag: 'Copy',
            blocks: [
              {
                type: 'text',
                text: '“Verified by Plum” was meant to build trust, but next to a dispute option it read as a contradiction. The design lead put it plainly in review: it felt like Plum had approved the settlement, until the next line said the user could dispute it.',
              },
              {
                type: 'text',
                text: 'The fix was to be honest about what Plum’s check means. Plum can’t judge everything the insurer did, so the final copy says Plum has done its due diligence and verified the settlement, not that Plum stands behind every rupee. That keeps the trust signal and leaves room for a fair dispute.',
              },
            ],
          },
        ],
      },
      {
        numeral: 'VI',
        title: 'Path 2: when the user disputes',
        parts: [
          {
            title: 'Proof, or a reason why not',
            blocks: [
              {
                type: 'text',
                text: 'If Plum verifies the settlement but the user still disagrees, they can raise a dispute themselves. Every interaction pattern I explored had to enforce one rule: each disputed item needs a supporting document, or a stated reason for not having one.',
              },
              {
                type: 'table',
                columns: ['Pattern', 'How it works', 'Trade-off'],
                rows: [
                  [
                    'Option 1 (chosen)',
                    'Select items, then resolve each on a checklist (“0 of 2”) through an upload sheet',
                    'Adds a step, but makes progress explicit',
                  ],
                  [
                    'Option 2',
                    'Checking an item reveals an upload button on its card',
                    'Small targets, up to three taps per card',
                  ],
                  [
                    'Option 3',
                    'Tapping an item opens the upload sheet directly',
                    'Unclear that users can continue without uploading for every item',
                  ],
                ],
              },
              {
                type: 'text',
                text: 'I took the options to the design team, and the design lead chose Option 1. The explicit checklist made the “no document” route visible, which mattered given that only about 15% of users had every document.',
              },
              {
                type: 'figure',
                figure: { label: 'Fig. 5', caption: 'Option 1: select items, then resolve each one on a checklist.' },
              },
            ],
          },
          {
            title: 'Rules the flow enforces',
            blocks: [
              {
                type: 'points',
                points: [
                  { text: 'Users can dispute a partial amount, up to the deduction on each item.' },
                  {
                    text: 'A written reason is always required, stricter than the optional note in early explorations, so specialists get usable context.',
                  },
                  {
                    text: 'Each dispute gets its own tracked sub-page, so a claim can hold one dispute for a shortfall and another for bills found later.',
                  },
                  {
                    text: 'A user can dispute again only after earlier disputes are resolved, with a cap on how many times.',
                  },
                  { text: 'Outright rejections can be disputed too, not just deductions.' },
                ],
              },
            ],
          },
          {
            title: 'The prototype',
            blocks: [
              {
                type: 'text',
                text: 'I built a mobile-first clickable prototype covering both paths end to end and shared it with the PM, design lead and head of product on 29 October. It covered:',
              },
              {
                type: 'points',
                points: [
                  { text: 'The verification stage and Plum-initiated disputes' },
                  { text: 'User disputes on a settled claim, and on an outright rejection' },
                  { text: 'Uploading documents, submitting, and tracking' },
                  { text: 'Every outcome state: in review, approved, partially approved, rejected' },
                ],
              },
              {
                type: 'text',
                text: 'A hidden side tab let reviewers jump to any screen or state. I published it to a public link so reviewers without tool access could open it on their phones, and leadership feedback came back within hours.',
              },
            ],
          },
        ],
      },
      {
        numeral: 'VII',
        title: 'Impact',
        parts: [
          {
            title: 'Do people stop needing support?',
            tag: 'Measures',
            blocks: [
              {
                type: 'text',
                text: 'I framed success around whether users stop needing support, not just how many disputes come in. The design is built to move the same metrics that defined the problem.',
              },
              {
                type: 'table',
                columns: ['Metric', 'Baseline', 'Target / result'],
                rows: [
                  ['Deducted claimants visiting support', '40%', 'Measured after launch'],
                  ['Claim page revisits, rejected or deducted', '10–15×', 'Measured after launch'],
                  ['Deduction claims auto-reviewed (>95% accuracy)', '0%', '75% target'],
                  ['Rejection claims auto-reviewed', '0%', '50% target'],
                  ['Zero-human-touch IPD claims (non-SAS)', '15%', '35% target'],
                  ['Avoidable dispute rate, auto-closed claims', 'No baseline', 'Same as human-reviewed'],
                  ['Claims NPS, auto-closed claims', 'No baseline', 'Same as human-reviewed'],
                ],
              },
              {
                type: 'text',
                text: 'On a run of about 1,300 claims, the review model covered 86% of deductions at about 92% accuracy, and 40% of rejections, before tuning.',
              },
            ],
          },
          {
            title: 'What I delivered',
            tag: 'Handed to engineering',
            blocks: [
              {
                type: 'points',
                points: [
                  {
                    lead: 'A complete mobile flow for both dispute paths:',
                    text: 'cited deduction explanations, a verification stage with an ETA, grouped disputable and non-disputable items, and a dispute journey from selection to outcome.',
                  },
                  {
                    lead: 'An interim email redesign:',
                    text: 'a deduction table (reason, amount, expanded notes) added to the closure email, so users got clear explanations before the app flow shipped.',
                  },
                  {
                    lead: 'A rules framework engineering could build from:',
                    text: 'which deductions can be disputed, when disputing closes, and how repeat disputes work.',
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        numeral: 'VIII',
        title: 'Reflection',
        parts: [
          {
            title: 'What this taught me',
            blocks: [
              {
                type: 'points',
                points: [
                  {
                    lead: 'Let the data define the problem.',
                    text: 'I came in expecting a dispute-flow project. The claims data showed it was an explanation project first, and that reordering saved us from building friction users didn’t need.',
                  },
                  {
                    lead: 'Trust is a copy problem first.',
                    text: 'The hardest calls were about words like “verified,” “can’t,” and “need help,” not layout.',
                  },
                  {
                    lead: 'Make invisible work visible.',
                    text: 'Plum was already fighting for users; the auto-dispute path just let them see it.',
                  },
                  {
                    lead: 'Designing friction on purpose is still design.',
                    text: 'Keeping the dispute entry point low-key without hiding it meant balancing Plum’s costs against users’ rights.',
                  },
                  {
                    lead: 'Prototypes beat review meetings.',
                    text: 'A link people could open on their phones got leadership feedback within hours.',
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
};
