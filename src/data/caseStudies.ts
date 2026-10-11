// Long-form case study content, keyed by tape slug (see tapes.ts).
// A figure without `src` shows a placeholder until its image is added:
// drop the file in public/work/<slug>/ and set `src: '/work/<slug>/name.png'`.

export type Point = { lead?: string; text: string };

export type Figure = { label: string; caption: string; src?: string; alt?: string };

export type Block =
  | { type: 'text'; text: string }
  | { type: 'points'; points: Point[] }
  | { type: 'figure'; figure: Figure }
  | { type: 'note'; text: string };

export type Part = {
  /** Left-column title, e.g. "Discharge-led journey". */
  title: string;
  /** Small spaced-caps tag under the title, e.g. "Problem map". */
  tag?: string;
  blocks: Block[];
};

export type Chapter = { numeral: string; title: string; parts: Part[] };

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
  chapters: Chapter[];
};

export const caseStudies: Record<string, CaseStudy> = {
  'killing-the-dur': {
    headline: 'Killing the DUR',
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
};
