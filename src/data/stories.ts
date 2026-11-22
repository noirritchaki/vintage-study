// Case studies, told in six numbered sections after elaineyu.design/hackduke-2026:
// a meta card (role, timeline, tools, team), the title, an intro and tags, then
// 01 Problem · 02 Goal · 03 Challenge · 04 Process · 05 Impact · 06 Reflection,
// and a "next stop" link.
//
// Media without `src` / `video` shows a placeholder until the design is added:
// drop the file in public/work/<slug>/ and set `src: '/work/<slug>/name.png'`.

export type Media = {
  src?: string;
  video?: string | { src: string; type: string }[];
  poster?: string;
  alt?: string;
  /** Pixel size of an image, so the page reserves the right space. */
  width?: number;
  height?: number;
  /** 'contain': a design on a transparent background, padded on the watercolor.
      'plain': a chart on white, no watercolor. Default fills the frame. */
  fit?: 'contain' | 'plain';
};

export type StoryBlock =
  | { type: 'text'; text: string }
  /** A soft callout: problem statement, user insight. */
  | { type: 'statement'; label: string; text: string }
  /** Numbered decisions ("01 · Title"), each optionally with a picture. */
  | { type: 'decisions'; items: { title: string; text: string; media?: Media }[] }
  /** The story's hypotheses: as set at the start ('set'), or checked against
      what happened ('result'). The list itself lives on the story. */
  | { type: 'hypotheses'; show: 'set' | 'result' }
  /** A small mono heading inside a section, e.g. "Social campaign". */
  | { type: 'subhead'; text: string }
  /** Big numbers with a line each. */
  | { type: 'stats'; items: { value: string; label: string }[] }
  /** Explorations, each with what worked (+) and what didn't (−). */
  | { type: 'options'; options: { title: string; media?: Media; pros: string[]; cons: string[] }[] }
  /** The choice made (label defaults to "Final pick"). */
  | { type: 'finalPick'; label?: string; title: string; media?: Media; pros: string[] }
  /** Something a user said. */
  | { type: 'quote'; text: string; cite: string }
  /** Coloured levels and what each means. */
  | { type: 'scale'; title: string; levels: { label: string; tone: 'good' | 'warn' | 'bad'; meaning: string }[] }
  | { type: 'list'; items: { lead?: string; text: string }[] }
  | { type: 'table'; columns: string[]; rows: string[][] }
  | { type: 'figure'; media?: Media; caption: string };

export type StorySection = {
  id: string;
  /** Uppercase label, shown as "01 — PROBLEM"; also the timeline entry. */
  label: string;
  heading: string;
  blocks: StoryBlock[];
};

/** A bet made early from the data, and whether it came true. */
export type Hypothesis = {
  /** "If … then …" */
  belief: string;
  /** The data it came from. */
  because: string;
  /** How we'd know. */
  measure: string;
  status: 'validated' | 'partly' | 'disproved' | 'measuring';
  /** What actually happened (or what's being watched). */
  result: string;
};

export type Story = {
  title: string;
  /** The TL;DR at the top of the page. */
  intro: string;
  /** Up to three headline numbers for the TL;DR; trend adds an arrow. */
  tldr: { value: string; label: string; trend?: 'up' | 'down' }[];
  hypotheses: Hypothesis[];
  tags: string[];
  hero?: Media;
  meta: { role: string; timeline: string; tools: string; team: string };
  sections: StorySection[];
  /** Slug of the case study to suggest at the end. */
  nextUp?: string;
};

const hc = (name: string) => `/work/health-checkup/${name}`;
const walkthrough = (name: string): Media['video'] => [
  { src: hc(`${name}.mov`), type: 'video/quicktime; codecs="hvc1"' },
  { src: hc(`${name}.webm`), type: 'video/webm; codecs="vp9"' },
];
const ins = (name: string, alt: string, w = 1248, h = 880): Media => ({
  src: `/work/when-the-insurer-says-no/${name}.webp`,
  alt,
  width: w,
  height: h,
  fit: 'contain',
});
const dur = (name: string, alt: string, w = 1248, h = 880): Media => ({
  src: `/work/killing-the-document-update-request/${name}.webp`,
  alt,
  width: w,
  height: h,
  fit: 'contain',
});

export const stories: Record<string, Story> = {
  // ---------------------------------------------------------------- dispute
  'when-the-insurer-says-no': {
    title: 'When the Insurer Says No',
    intro:
      'When an insurer settles a claim for less, or rejects it, people need to know why and what they can do. I designed how Plum users understand and dispute those decisions, from kickoff to a leadership-reviewed mobile flow in three weeks, plus an email redesign that shipped the same explanations right away.',
    tags: ['2026', 'Mobile', 'Claims', 'Content design'],
    tldr: [
      { value: '86%', label: 'Deductions auto-reviewed in pilot' },
      { value: '3 weeks', label: 'Kickoff to engineering handoff' },
      { value: '₹80–100L', label: 'Recovered for users each month, now visible' },
    ],
    hypotheses: [
      {
        belief: 'If every deduction is explained with its reason and a citation, fewer deducted claimants will need to contact support.',
        because: '40% of deducted claimants went to support, people revisited the claim page 10–15 times, and 57% of rejections were rule-based.',
        measure: 'Share of deducted claimants visiting support, and claim page revisits.',
        status: 'measuring',
        result: 'Baselines are set (40% and 10–15×). The interim email with a deduction table is live; the app flow is with engineering.',
      },
      {
        belief: 'If SettlementLens reviews settlements automatically, most deductions won’t need a human at all.',
        because: 'In roughly 85% of cases the insurer’s decision was already fair.',
        measure: 'Share of deduction claims auto-reviewed at over 95% accuracy (target 75%).',
        status: 'partly',
        result: 'On ~1,300 pilot claims the model covered 86% of deductions, ahead of the target, but at ~92% accuracy, still short of the 95% bar before tuning.',
      },
      {
        belief: 'If “I don’t have this document” is a valid answer, disputes stay fair without becoming dead ends.',
        because: 'Only about 15% of people can provide every document an insurer asks for.',
        measure: 'Avoidable dispute rate on auto-closed claims, compared with human-reviewed ones.',
        status: 'measuring',
        result: 'Measured once the dispute flow launches.',
      },
    ],
    hero: ins(
      'hero',
      'Five claim screens: verifying deductions, Plum has verified your claim, choosing what to dispute, all three items ready to submit, and a dispute partly approved',
      2056,
      880,
    ),
    meta: {
      role: 'Sole Product Designer',
      timeline: '3 weeks (9–30 Oct 2026)',
      tools: 'Figma, clickable prototype',
      team: 'Claims PM, design lead, head of product',
    },
    nextUp: 'killing-the-document-update-request',
    sections: [
      {
        id: 'problem',
        label: 'Problem',
        heading: 'Claims came back short, and nobody explained why',
        blocks: [
          {
            type: 'text',
            text: '80–85% of hospital claims settle with a deduction, usually for several reasons at once. People went looking for answers and didn’t find them: rejected or deducted claimants revisited the claim page 10–15 times, 40% of deducted claimants went to support, and 40% of rejected claimants opened a ticket within a week.',
          },
          {
            type: 'text',
            text: 'Behind the scenes, Plum already checks every settlement and fights the unfair ones, recovering an estimated ₹80–100 lakh a month for users. They never saw any of it: one team reviewed settlements by hand, another phoned people to explain, and the app went silent at exactly the moment they were most anxious.',
          },
        ],
      },
      {
        id: 'goal',
        label: 'Goal',
        heading: 'Explain first, then make disputing fair',
        blocks: [
          {
            type: 'text',
            text: 'Explain every “no” clearly enough that a fair deduction never turns into a support call, show people when Plum is fighting for them, and make the genuinely unfair decisions easy to dispute. Success meant fewer support visits and claim page revisits, not more disputes.',
          },
          {
            type: 'statement',
            label: 'Problem statement',
            text: 'How might we help people understand why their claim was cut, and dispute it fairly when it shouldn’t have been?',
          },
          { type: 'subhead', text: 'Hypotheses' },
          { type: 'hypotheses', show: 'set' },
        ],
      },
      {
        id: 'challenge',
        label: 'Challenge',
        heading: 'The UI was simple. The rules and the words weren’t.',
        blocks: [
          {
            type: 'text',
            text: 'SettlementLens, Plum’s system for reviewing insurer decisions automatically, was about to take over the roughly 85% of cases where the insurer was fair. That meant two ways a dispute could start, Plum disputing for you or you disputing yourself, and both had to feel like one system.',
          },
          {
            type: 'list',
            items: [
              { lead: 'Business:', text: 'every dispute costs specialist time, so fair deductions shouldn’t become disputes.' },
              { lead: 'Regulatory:', text: 'some deductions, like non-medical items under IRDAI rules and co-pay, can never be disputed.' },
              { lead: 'System:', text: 'reviews run on an AI model, so some settlements come back “unsure” and need up to 3 working days with a human.' },
              {
                lead: 'People:',
                text: 'only about 15% can provide every document an insurer asks for, and those requests read as bad faith, making Plum look “as evil as the insurer.”',
              },
            ],
          },
        ],
      },
      {
        id: 'process',
        label: 'Process',
        heading: 'Four decisions that shaped it',
        blocks: [
          {
            type: 'text',
            text: 'Before sketching, I read claims data, app analytics and ops conversations together. Most “no” decisions turned out to be rule-based, not arbitrary, so the PM and I split the work: explain every deduction first, then design the dispute flow.',
          },
          {
            type: 'decisions',
            items: [
              {
                title: 'A “Plum is verifying” stage',
                text: 'A new stage between settled and closed, with an ETA. Disputes are paused with a line explaining why, and Plum disputes any unfair deductions on the user’s behalf, so invisible work finally shows.',
                media: ins('flow-verify', 'Verifying deductions, verification taking longer with disputes not yet available, then Plum has verified your claim'),
              },
              {
                title: 'A grouped summary, with dispute on every item',
                text: 'I explored explaining deductions inline, as a separate receipt-like summary, and as a guided walkthrough. The final design groups deductions into fixable, policy-limited and not covered, with dispute access next to each item, so nothing hides in a collapsed group.',
                media: ins('summary', 'Plum has verified your claim, the deductions breakdown, and choosing which items to dispute'),
              },
              {
                title: 'Never say “you can’t”',
                text: '“Verified by Plum” read like Plum had approved the cut, and “You can’t dispute” read as a closed door. The copy now says Plum has done its due diligence, and every rule-based deduction explains itself and offers a way to get help.',
                media: ins('copy', 'Deduction reason sheets for non-medical expenses and a missing report, and the items that go to Plum Support'),
              },
              {
                title: 'Proof, or a reason why not',
                text: 'Of three ways to attach proof, the design lead picked a checklist: select items, then resolve each with a document or a stated reason you don’t have it. Progress is always explicit, and a missing document is never a dead end.',
                media: ins('checklist', 'Choosing what to dispute, then completing each item: 0 of 3, then 3 of 3 ready to submit'),
              },
            ],
          },
          { type: 'subhead', text: 'Rules the flow enforces' },
          {
            type: 'list',
            items: [
              { text: 'A claim ends with a dispute, or with accepting and leaving feedback. Once feedback is given, disputing closes.' },
              { text: 'People can dispute part of a deduction, and a written reason is always required.' },
              { text: 'Each dispute gets its own tracked page; you can dispute again only after earlier ones resolve, up to a cap.' },
              { text: 'Outright rejections can be disputed too, not just deductions.' },
            ],
          },
          {
            type: 'figure',
            media: ins('flow-track', 'Plum reviewing your documents, the dispute partly approved, and fully approved', 1248, 879),
            caption: 'Every dispute ends in a clear outcome: in review, partly approved, approved or rejected, with the recovered amount.',
          },
          { type: 'subhead', text: 'Prototype' },
          {
            type: 'text',
            text: 'I built a mobile-first clickable prototype of both paths end to end and shared it as a public link on 29 October, with a hidden side tab to jump to any state. Leadership could open it on their phones, and feedback came back within hours.',
          },
        ],
      },
      {
        id: 'impact',
        label: 'Impact',
        heading: 'Built to move the numbers that defined the problem',
        blocks: [
          {
            type: 'stats',
            items: [
              { value: '86%', label: 'of deductions reviewed by the model in the pilot, at ~92% accuracy' },
              { value: '3 weeks', label: 'from kickoff to engineering handoff' },
              { value: '75%', label: 'auto-review target the design is built for' },
            ],
          },
          { type: 'subhead', text: 'Did the hypotheses hold?' },
          { type: 'hypotheses', show: 'result' },
          {
            type: 'text',
            text: 'The mobile flow and a rules framework went to engineering, and a deduction table in the closure email shipped right away, so people got clear explanations before the app flow launched. Support visits (40%) and claim page revisits (10–15×) are the baselines I’ll measure against after launch.',
          },
        ],
      },
      {
        id: 'reflection',
        label: 'Reflection',
        heading: 'An explanation project, dressed up as a dispute flow',
        blocks: [
          {
            type: 'text',
            text: 'I came in expecting to design a way to fight insurers. The data showed most people just needed to understand what had happened, and doing the explaining first saved us from building friction nobody needed.',
          },
          {
            type: 'text',
            text: 'The hardest calls were about words like “verified,” “can’t” and “need help,” not layout. Trust turned out to be a copy problem first, and a prototype people could open on their phones beat any review meeting.',
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------- health checkup
  'health-checkup': {
    title: 'Health Checkup',
    intro:
      'Plum’s preventive health checkups were growing fast in sales, but the in-app journey converted a sliver of installs. I owned booking, tracking and the report, and redesigned them to turn a one-off transaction into a journey people could discover, trust and act on.',
    tags: ['2026', 'Mobile', 'Health', 'Research'],
    tldr: [
      { value: '21.5%', label: 'Weekly bookings', trend: 'up' },
      { value: '~16k', label: 'Confirmed bookings in 3.5 months' },
      { value: '~90%', label: 'Bookers who read their report' },
    ],
    hypotheses: [
      {
        belief: 'If “free,” at-home collection and family eligibility show before people commit, more of the people who reach a listing will book.',
        because: 'Employer-free was the #1 booking motivator (45.2%), yet only 8% of free corporate checkups were used.',
        measure: 'Weekly bookings, and listing-to-cart conversion.',
        status: 'partly',
        result: 'Weekly bookings rose 21.5% after the release, faster than the app’s 13% overall growth. But only 21% of homepage visitors add to cart, so the listing is still the biggest leak.',
      },
      {
        belief: 'If people can pick up where they left off, the ~41% who leave after one listing will come back and finish.',
        because: '~41% dropped after a single listing view, and sessions showed people exploring, leaving and returning.',
        measure: 'Bookings completed from the resume card.',
        status: 'measuring',
        result: 'About 17.8k people who left a listing came back to the checkup home within 14 days, but resume-card completions aren’t tracked yet.',
      },
      {
        belief: 'If the report shows what needs attention first and sits where people expect it, they’ll read it and act on it.',
        because: 'People couldn’t find the report, and several never discovered the free doctor consultation.',
        measure: 'Report view rate among bookers, and actions taken from the report.',
        status: 'partly',
        result: 'Reading held up: ~90% of bookers viewed their report. Acting didn’t yet: only ~37% of viewers took an action from it.',
      },
    ],
    hero: { video: walkthrough('walkthrough'), poster: hc('walkthrough-poster.webp'), alt: 'Prototype walkthrough of booking a health checkup.' },
    meta: {
      role: 'Product Designer, booking, tracking and reports',
      timeline: '2026, live since July',
      tools: 'Figma, PostHog, Clevertap, Metabase',
      team: 'Product, PMM, engineering',
    },
    nextUp: 'when-the-insurer-says-no',
    sections: [
      {
        id: 'problem',
        label: 'Problem',
        heading: 'People wanted a checkup, and the app kept losing them',
        blocks: [
          {
            type: 'text',
            text: 'Checkups grew 350%+ with 50,000+ completed in a year, yet only 0.16% of installs booked in the app (104 of 61,434 over 90 days). Corporate adoption sat at 8% even though the checkup was free, ~41% dropped after a single listing view, and 82% booked only for themselves.',
          },
          {
            type: 'figure',
            media: {
              src: hc('funnel.webp'),
              alt: 'Bar chart: of everyone who launched the app, about 14% reached the checkup homepage, about 4% viewed a listing and under 2% confirmed a booking.',
              width: 1605,
              height: 615,
              fit: 'plain',
            },
            caption: 'Unique users by stage, as a share of app launches. Discovery and the first listing view are where the journey collapses.',
          },
        ],
      },
      {
        id: 'goal',
        label: 'Goal',
        heading: 'From a transaction to a journey people trust',
        blocks: [
          {
            type: 'text',
            text: 'Make the checkup something people discover, book, track and actually act on, not a one-time formality. That meant moving what already motivates people earlier, and connecting moments that already existed instead of adding more.',
          },
          {
            type: 'statement',
            label: 'Problem statement',
            text: 'How might we turn a checkup people already want into one they actually book, track and act on?',
          },
          { type: 'subhead', text: 'Hypotheses' },
          { type: 'hypotheses', show: 'set' },
        ],
      },
      {
        id: 'challenge',
        label: 'Challenge',
        heading: 'Three friction points, in my scope',
        blocks: [
          {
            type: 'text',
            text: 'A usability study (9 moderated sessions and a survey of 197 higher-intent users), read against funnel data, pinned the pain to specific, fixable moments.',
          },
          {
            type: 'list',
            items: [
              { lead: 'Booking rarely finished in one sitting.', text: 'People explored, left and returned, with no way to resume.' },
              { lead: 'Motivators surfaced too late.', text: '“Free,” at-home collection and booking for family appeared deep in the flow, after many had left.' },
              { lead: 'Reports were hard to find, then hard to trust.', text: 'They lived under “Your bookings,” and borderline values shook confidence.' },
            ],
          },
          {
            type: 'quote',
            text: 'I didn’t know I could book it for my mother until I reached this page. I had to check with her and come back later.',
            cite: 'Usability participant',
          },
        ],
      },
      {
        id: 'process',
        label: 'Process',
        heading: 'Five decisions that shaped it',
        blocks: [
          {
            type: 'decisions',
            items: [
              {
                title: 'Pull the motivators forward',
                text: 'Employer-free was the #1 booking motivator (45.2%) yet was buried. “Free,” at-home collection and family eligibility now show before anyone commits, and “Who is this for?” comes before slots.',
                media: { src: hc('motivators.webp'), alt: 'Checkup home with doorstep collection and book-for-family callouts, and a “Who is this for?” sheet.', width: 2000, height: 1272, fit: 'contain' },
              },
              {
                title: 'Treat drop-off as a resume problem',
                text: 'A “pick up where you left off” card meets the real behaviour: explore, leave, return. The member and address are saved, and morning weekday slots, the clear preference for fasting, come first.',
                media: { src: hc('resume.webp'), alt: 'A “Pick up where you left off” card and a pickup sheet with morning slots.', width: 1290, height: 812, fit: 'contain' },
              },
              {
                title: 'Make the wait reassuring',
                text: 'Phlebotomist assignment, visit tracking and a clear “what happens next” turn the hour-before-assignment surprise into an expected step.',
                media: { src: hc('tracking.webp'), alt: 'Five tracking screens from scheduled to report ready.', width: 2000, height: 740, fit: 'contain' },
              },
              {
                title: 'Snapshot → category → biomarker',
                text: 'The report opens with how many markers need attention, shows out-of-range categories first, then each biomarker. People called the detail pages “crystal clear.”',
                media: { src: hc('report.webp'), alt: 'The health snapshot ring and a biomarker detail page.', width: 2000, height: 1274, fit: 'contain' },
              },
              {
                title: 'Reunite the report with the next action',
                text: 'Several people never found the free doctor consultation and planned to pay elsewhere. A “Next steps” card now offers it right where you read your report, and changes as it’s booked.',
                media: { src: hc('consult.webp'), alt: 'Five versions of the report’s “Next steps” card.', width: 2000, height: 634, fit: 'contain' },
              },
            ],
          },
          { type: 'subhead', text: 'How severity reads' },
          {
            type: 'scale',
            title: 'Level',
            levels: [
              { label: 'Optimal', tone: 'good', meaning: 'Within the healthy range for that marker.' },
              { label: 'Sub-optimal', tone: 'warn', meaning: 'Just outside the healthy range. Worth keeping an eye on and re-testing.' },
              { label: 'Needs attention', tone: 'bad', meaning: 'Clearly out of range. Shown first, next to the free doctor consultation.' },
            ],
          },
          { type: 'subhead', text: 'The prototype' },
          {
            type: 'figure',
            media: { video: walkthrough('report-walkthrough'), poster: hc('report-walkthrough-poster.webp'), alt: 'Prototype walkthrough of the health report.' },
            caption: 'Reading the report: the snapshot, the biomarkers that need attention, then one in detail.',
          },
        ],
      },
      {
        id: 'impact',
        label: 'Impact',
        heading: 'After launch, the numbers moved',
        blocks: [
          {
            type: 'stats',
            items: [
              { value: '~16k', label: 'confirmed bookings, 17 Jul – 1 Nov 2026' },
              { value: '+21.5%', label: 'weekly bookings after the release' },
              { value: '~90%', label: 'of bookers went on to read their report' },
            ],
          },
          { type: 'subhead', text: 'Did the hypotheses hold?' },
          { type: 'hypotheses', show: 'result' },
          {
            type: 'figure',
            media: {
              src: hc('bookings-monthly.webp'),
              alt: 'Bar chart of confirmed bookings: 4,215 in August, 5,941 in September and 5,744 in October.',
              width: 1600,
              height: 620,
              fit: 'plain',
            },
            caption: 'Confirmed bookings per month. July is left out: only about two weeks of it were tracked.',
          },
          {
            type: 'text',
            text: '72.7k people opened the checkup homepage and about 13.5k booked. Telehealth grew 13% over the same weeks, so some of the 21.5% lift is the app growing overall, but checkups grew faster. About 15% have booked more than once, and paying users booked at 84.5% once they reached the payment gateway.',
          },
          {
            type: 'text',
            text: 'The funnel still leaks between browsing and choosing: 65% reach a listing, but only 21% add anything to the cart. Reports are still hard to find, marker counts don’t always match between colleagues, and about 11% couldn’t get a checkup in their area.',
          },
        ],
      },
      {
        id: 'reflection',
        label: 'Reflection',
        heading: 'The hardest problems weren’t on the screen',
        blocks: [
          {
            type: 'text',
            text: 'They were in sequence and trust. The report proved preventive health could be legible and even enjoyable, but a beautiful report nobody can find, built on data people can’t reconcile with a colleague’s, erodes faster than it earns.',
          },
          {
            type: 'text',
            text: 'Next I’d relocate reports to a predictable home, fix the marker-count discrepancy at the data layer before more visual polish, and lean into packages, which book at 43.4% against 24.3% for individual tests.',
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------- DUR
  'killing-the-document-update-request': {
    title: 'Killing the Document Update Request',
    intro:
      'Reimbursement claims stall because of documents, not money. A missing bill or an unreadable scan triggers a Document Update Request, and a week or more evaporates. I redesigned three connected journeys around one goal: get every document right the first time.',
    tags: ['2026', 'Mobile', 'Claims', 'Systems design'],
    tldr: [
      { value: '3', label: 'Document journeys unified' },
      { value: '~30s', label: 'Bank check by ₹1 penny-drop' },
      { value: '25%', label: 'Claimants who missed a bill, designed against' },
    ],
    hypotheses: [
      {
        belief: 'If documents are checked in the app and every issue is fixed in one pass, fewer claims will bounce back with a Document Update Request.',
        because: 'Most DURs came from missing, unreadable or mismatched documents, each costing a week or more.',
        measure: 'DUR and deduction rates per claim.',
        status: 'measuring',
        result: 'The discharge-led claim shipped in August and is under funnel evaluation; DUR rates are being instrumented.',
      },
      {
        belief: 'If the missed-bill check sits exactly where people upload, fewer will leave a bill out.',
        because: '25% of outpatient claimants missed at least one bill in the old flow.',
        measure: 'Share of claims missing a bill at submission.',
        status: 'measuring',
        result: 'Measured as the bills journey rolls out, against the 25% baseline.',
      },
      {
        belief: 'If people are nudged back to the draft they started, duplicate claims will fall.',
        because: 'People re-filed the same claim for the same patient when they thought it was lost, doubling ops load.',
        measure: 'Duplicate claims per patient.',
        status: 'measuring',
        result: 'Being instrumented alongside the draft nudge.',
      },
    ],
    hero: dur(
      'hero',
      'Five claim screens: the reimbursement hub, uploading bills, reports with missing documents, fixing a flagged scan, and matching expenses to proofs',
      2056,
      1147,
    ),
    meta: {
      role: 'Product Designer',
      timeline: '2026, discharge-led claim shipped Aug',
      tools: 'Figma',
      team: 'Claims PM, engineering, claims ops',
    },
    nextUp: 'health-checkup',
    sections: [
      {
        id: 'problem',
        label: 'Problem',
        heading: 'The claim stalls on documents, not money',
        blocks: [
          {
            type: 'text',
            text: 'Reimbursement is the hardest path in the product, and the one people fall back to when cashless fails. The person filing is usually a patient or caregiver mid-recovery, facing an insurer-specific list of documents they’ve never been asked for.',
          },
          {
            type: 'list',
            items: [
              { lead: 'Duplicate claims.', text: 'People forgot a document, assumed the claim was lost and filed it again, doubling ops load.' },
              { lead: 'Missed and mismatched documents.', text: '25% of outpatient claimants missed at least one bill, and bank proofs often didn’t match the insured’s name.' },
              { lead: 'No sense of what happens next.', text: 'Once submitted, the claim disappeared into a black box.' },
            ],
          },
        ],
      },
      {
        id: 'goal',
        label: 'Goal',
        heading: 'Get every document right the first time',
        blocks: [
          {
            type: 'text',
            text: 'Stop a Document Update Request before it happens: make every requirement clear up front, catch every mistake in the app, and never lose someone’s progress.',
          },
          {
            type: 'statement',
            label: 'Problem statement',
            text: 'How might we help people get every document right the first time, so their claim never comes back?',
          },
          { type: 'subhead', text: 'Hypotheses' },
          { type: 'hypotheses', show: 'set' },
        ],
      },
      {
        id: 'challenge',
        label: 'Challenge',
        heading: 'Three journeys that had to feel like one',
        blocks: [
          {
            type: 'text',
            text: 'Bills and receipts, reports and prescriptions, and the discharge-led claim were each document-heavy on their own. Rather than redesign screens one at a time, I set four principles every journey had to follow.',
          },
          {
            type: 'list',
            items: [
              { lead: 'Anchor on the one document everyone has:', text: 'the discharge summary validates and pre-fills the claim.' },
              { lead: 'Catch errors before the insurer does:', text: 'validate in the app and fix every issue in one pass.' },
              { lead: 'Make every requirement legible:', text: 'mandatory and optional tags, status and progress counters.' },
              { lead: 'Never lose progress:', text: 'drafts resume, nudges prevent duplicates, payouts verify in seconds.' },
            ],
          },
          {
            type: 'figure',
            media: dur('hub', 'The claim hub, the bills upload screen and the reports upload list'),
            caption: 'One document hub runs all three journeys, with mandatory and optional made explicit up front.',
          },
        ],
      },
      {
        id: 'process',
        label: 'Process',
        heading: 'Five decisions that shaped it',
        blocks: [
          {
            type: 'decisions',
            items: [
              {
                title: 'Lead the claim with the discharge summary',
                text: 'The flow checks the file really is a discharge summary, stopping a whole class of rejections at the door, then carries the hospital, dates and reason for treatment forward instead of asking again.',
              },
              {
                title: 'Fix every report issue in one pass',
                text: 'The review handles the real combinations ops sees, from one issue to a missing report, and asks people to “upload all your files again to review for all the issues in a go” instead of rejecting one file at a time.',
                media: dur('reports', 'Reports screens: missing documents and a file to fix, the issues found in an ultrasound scan, and confirming “I don’t have these files”', 1248, 1147),
              },
              {
                title: 'Catch bill mistakes where they happen',
                text: 'The final bill and its receipt are mandatory, everything else is optional with a status tag, and one claim amount ties bills to proofs, so a mismatch is flagged before it becomes a query.',
                media: dur('bills', 'Bills screens: issues found in new files, fixing a final bill, and expenses not matching proofs', 1248, 1153),
              },
              {
                title: 'Nudge people back to the draft they started',
                text: '“There is a claim in your drafts for the same patient” routes people to resume it, directly attacking duplicate claims.',
              },
              {
                title: 'Verify bank details with a ₹1 penny-drop',
                text: 'A ₹1 transfer verifies an account in about 30 seconds, replacing cancelled-cheque uploads. If the name doesn’t match the insured, it falls back to an HR letter instead of a dead end.',
              },
            ],
          },
          { type: 'subhead', text: 'Keeping a heavy flow light' },
          {
            type: 'list',
            items: [
              { text: 'A shared component language, so a new document type is configuration, not a new screen.' },
              { text: 'Sample documents and “why do we need this?” sit one tap away instead of crowding the main action.' },
              { text: 'An embedded “book a slot with our claims expert” path for when self-serve isn’t enough.' },
            ],
          },
          {
            type: 'figure',
            media: dur('reports-flow', 'Scanning uploaded files, the list of missing and flagged documents, and the fix screen for one file', 1248, 1147),
            caption: 'Reports and prescriptions: scan, see every issue at once, fix them in one go.',
          },
        ],
      },
      {
        id: 'impact',
        label: 'Impact',
        heading: 'Shipped, with measurement in flight',
        blocks: [
          {
            type: 'stats',
            items: [
              { value: '3', label: 'document journeys unified into one system' },
              { value: '~30s', label: 'bank check by ₹1 penny-drop' },
              { value: 'Aug 2026', label: 'discharge-led claim shipped' },
            ],
          },
          { type: 'subhead', text: 'Did the hypotheses hold?' },
          { type: 'hypotheses', show: 'result' },
          {
            type: 'text',
            text: 'The discharge-led claim is live and under funnel evaluation, with bills and reports building on it. I’m tracking fewer duplicate claims per patient, lower document-query and deduction rates, and faster payouts; figures will be added once post-launch data lands.',
          },
        ],
      },
      {
        id: 'reflection',
        label: 'Reflection',
        heading: 'The best claim is the one that never comes back',
        blocks: [
          {
            type: 'text',
            text: 'The work was less about any single screen than about a system: principles that let three journeys behave like one product, and scaffolding that catches mistakes before an insurer ever sees them.',
          },
          {
            type: 'text',
            text: 'Prevention beat apology every time. The 25% missed-bill finding only mattered because the check sits exactly where the mistake happens, and every failure, from a mismatched bank name to a missing report, needed a way forward.',
          },
        ],
      },
    ],
  },
};
