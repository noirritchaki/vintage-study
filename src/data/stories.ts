// Case studies in the "story" layout: a narrative page modelled on the
// structure of meganyap.me/work/splunk (context → user problem → problem
// statement → solution → explorations with a final pick → key flows →
// reflection → next up). Case studies that aren't here use the chapter layout
// in caseStudies.ts.
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
  /** A coloured callout: problem statement, my goal, user insight. */
  | { type: 'statement'; label: string; text: string }
  /** The solution's three cards ("A … that"). */
  | { type: 'cards'; cards: { title: string; text: string; media?: Media }[] }
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
  | { type: 'flows'; flows: { title: string; text: string; media?: Media }[] }
  | { type: 'learnings'; items: { title: string; text: string }[] }
  | { type: 'figure'; media?: Media; caption: string };

export type StorySection = {
  id: string;
  /** Short name in the table of contents. */
  nav: string;
  /** Small uppercase label above the heading. */
  label: string;
  heading: string;
  blocks: StoryBlock[];
};

export type Story = {
  tags: string[];
  title: string;
  summary: string;
  hero?: Media;
  meta: { role: string; team: string[]; timeline: string[]; skills: string[] };
  impact: { value: string; label: string }[];
  sections: StorySection[];
  /** Slug of the case study to suggest at the end. */
  nextUp?: string;
};

export const stories: Record<string, Story> = {
  'when-the-insurer-says-no': {
    tags: ['Plum', 'Handed to engineering'],
    title: 'When the Insurer Says No',
    summary:
      'Designed how Plum users understand, and dispute, an insurer’s decision when a claim is settled for less or rejected outright. Three weeks from kickoff to a leadership-reviewed mobile flow, plus an email redesign that shipped the same explanations right away.',
    hero: { alt: 'The claim dispute flow' },
    meta: {
      role: 'Sole Product Designer',
      team: ['Claims PM', 'Design lead', 'Head of product'],
      timeline: ['9–30 Oct 2026', '(3 weeks)'],
      skills: ['Content design', 'Interaction design', 'Rules logic', 'Prototyping'],
    },
    impact: [
      { value: '86%', label: 'Deductions reviewed by the model in the pilot (~92% accuracy)' },
      { value: '3 weeks', label: 'From kickoff to engineering handoff' },
      { value: '75%', label: 'Auto-review target the design is built for' },
    ],
    nextUp: 'killing-the-document-update-request',
    sections: [
      {
        id: 'context',
        nav: 'Context',
        label: 'Context',
        heading: 'Plum fights unfair claims for its users. Nobody could see it.',
        blocks: [
          {
            type: 'text',
            text: 'When an insurer settles a claim, Plum checks whether the decision was fair and fights the unfair ones. These disputes recover an estimated ₹80–100 lakh a month for users. Users never saw any of it: one team reviewed every settlement by hand, another phoned people to explain deductions, and the app went silent at exactly the moment they were most anxious.',
          },
          {
            type: 'text',
            text: 'SettlementLens, Plum’s system for reviewing insurer decisions automatically, was about to take over the roughly 85% of cases where the insurer was fair, so specialists could focus on real disputes. But automation only helps if people trust and understand its verdicts. That trust gap is where I came in, as the only designer on the project.',
          },
        ],
      },
      {
        id: 'user-problem',
        nav: 'User problem',
        label: 'User problem',
        heading: 'When a claim comes back short, people can’t tell why.',
        blocks: [
          {
            type: 'text',
            text: '80–85% of hospital (IPD) claims settle with a deduction, usually for several reasons at once, with non-medical items the top driver. Rejections are mostly about coverage: 57% were treatments the policy didn’t cover, and only 6% were about missing documents.',
          },
          {
            type: 'text',
            text: 'People went looking for answers and didn’t find them. Rejected or deducted claimants revisited the claim page 10–15 times on average, 40% of deducted claimants went to support, and 40% of rejected claimants opened a ticket within a week.',
          },
          {
            type: 'statement',
            label: 'Problem statement',
            text: 'How might we help people understand why their claim was cut, and dispute it fairly when it shouldn’t have been?',
          },
        ],
      },
      {
        id: 'solution',
        nav: 'Solution',
        label: 'Solution',
        heading: 'A claim page that…',
        blocks: [
          {
            type: 'cards',
            cards: [
              {
                title: 'Explains every deduction',
                text: 'A grouped reason, the amount, a plain-language cause and a citation for each one, so a fair deduction never needs a phone call.',
              },
              {
                title: 'Shows Plum working for you',
                text: 'A “Plum is verifying” stage with an ETA, and visible disputes when Plum fights the insurer on your behalf.',
              },
              {
                title: 'Makes disputing fair',
                text: 'Dispute any item with proof, or a reason you don’t have it, then track it through to an outcome.',
              },
            ],
          },
        ],
      },
      {
        id: 'research',
        nav: 'Digging into the data',
        label: 'Digging into the data',
        heading: 'Before sketching anything, three sources reframed the project.',
        blocks: [
          {
            type: 'list',
            items: [
              {
                lead: 'Claims data:',
                text: 'most “no” decisions are rule-based, not arbitrary. The core design problem was explaining rules clearly, not building a dispute machine.',
              },
              {
                lead: 'App analytics:',
                text: 'the claim page was the right place to answer the question, and it wasn’t answering it. Page revisits and support visits became my success measures.',
              },
              {
                lead: 'Ops conversations:',
                text: 'the explanation was happening by phone, taking about half of claims ops’ effort. Insurer document requests read as bad-faith excuses, which made Plum look “as evil as the insurer.”',
              },
            ],
          },
          {
            type: 'statement',
            label: 'User insight',
            text: 'Only about 15% of people can provide every document an insurer asks for. Hospitals lose records, patients are unconscious, rural clinics never issue paperwork. A missing document is normal, not bad faith.',
          },
          {
            type: 'statement',
            label: 'My goal',
            text: 'Explain every “no” clearly enough that a fair deduction never turns into a dispute, and make the unfair ones easy to fight.',
          },
        ],
      },
      {
        id: 'two-paths',
        nav: 'Two paths to a dispute',
        label: 'Two paths to a dispute',
        heading: 'One system, two ways a dispute starts.',
        blocks: [
          {
            type: 'text',
            text: 'Every settled claim now passes through SettlementLens before it closes. Either Plum disputes it, or the user does. Designing both, and making them feel like one system, was the heart of the project.',
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
                'During “Plum is verifying”, up to 3 working days after settlement',
                'After verification, until they accept the settlement and leave feedback',
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
            text: 'Both paths share one claim timeline, one deduction breakdown and the same outcome states (in review, approved, partially approved, rejected). Nobody should need to know which path they’re on to understand where their money stands.',
          },
        ],
      },
      {
        id: 'constraints',
        nav: 'Constraints',
        label: 'Constraints',
        heading: 'The UI was simple. The rules and the words weren’t.',
        blocks: [
          {
            type: 'list',
            items: [
              {
                lead: 'Business:',
                text: 'every dispute costs specialist time, so the flow had to reduce the disputes that shouldn’t happen without hiding the ones that should.',
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
      {
        id: 'summary-explorations',
        nav: 'Deduction summary explorations',
        label: 'Deduction summary explorations',
        heading: 'A long list of deductions needed a home.',
        blocks: [
          {
            type: 'text',
            text: 'Most deducted claims had several reasons at once, so the list could get long. I explored three ways to explain them, each with a way to dispute.',
          },
          {
            type: 'options',
            options: [
              {
                title: 'Inline on the claim page',
                pros: ['Explanations sit right where people look', 'A dispute button on every item'],
                cons: ['Unwieldy once there are many deductions'],
              },
              {
                title: 'A separate post-settlement summary',
                pros: ['Reads like a receipt', 'Groups deductions into fixable, policy-limited and not covered'],
                cons: ['Items can hide inside collapsed groups'],
              },
              {
                title: 'A guided walkthrough',
                pros: ['One deduction at a time, nothing missed'],
                cons: ['Tedious with several deductions', 'Slow for people who just want the total'],
              },
            ],
          },
          {
            type: 'finalPick',
            title: 'The grouped summary, with dispute access on every item',
            pros: [
              'Scannable groups: fixable, policy-limited, not covered',
              'Nothing hidden: every item is visible',
              'Disputing stays next to the thing being disputed',
            ],
          },
        ],
      },
      {
        id: 'copy',
        nav: 'Words that build trust',
        label: 'Copy explorations',
        heading: '“Verified by Plum” sounded like Plum had approved the cut.',
        blocks: [
          {
            type: 'text',
            text: '“Verified by Plum” was meant to build trust, but next to a dispute option it read as a contradiction. In review, the design lead put it plainly: it felt like Plum had approved the settlement, until the next line said you could dispute it. Plum can’t judge everything the insurer did, so the copy had to be honest about what Plum’s check means.',
          },
          {
            type: 'options',
            options: [
              {
                title: '“Verified by Plum”',
                pros: ['A clear trust signal'],
                cons: ['Reads as Plum standing behind every rupee', 'Contradicts the dispute option below it'],
              },
              {
                title: '“You can’t dispute” for rule-based items',
                pros: ['Accurate'],
                cons: ['A closed door, at the moment people already feel Plum is siding with the insurer'],
              },
            ],
          },
          {
            type: 'finalPick',
            title: 'Plum has done its due diligence, and every rule has a way to get help',
            pros: [
              'Keeps the trust signal without claiming more than Plum knows',
              'Leaves room for a fair dispute',
              'Non-disputable items explain their rule and offer “Contact us” instead of a dead end',
            ],
          },
        ],
      },
      {
        id: 'dispute-explorations',
        nav: 'Dispute flow explorations',
        label: 'Dispute flow explorations',
        heading: 'Every disputed item needs proof, or a reason why not.',
        blocks: [
          {
            type: 'text',
            text: 'Since only about 15% of people have every document, “I don’t have this document” had to be a first-class answer, not an error. I explored three ways to attach proof, and took them to the design team.',
          },
          {
            type: 'options',
            options: [
              {
                title: 'Select items, then resolve each on a checklist',
                pros: ['Progress is explicit (“0 of 2”)', 'The “no document” route is visible'],
                cons: ['Adds a step'],
              },
              {
                title: 'Checking an item reveals an upload button on its card',
                pros: ['Everything happens in one place'],
                cons: ['Small targets', 'Up to three taps per card'],
              },
              {
                title: 'Tapping an item opens the upload sheet directly',
                pros: ['Fastest when you have the document'],
                cons: ['Unclear that you can continue without uploading for every item'],
              },
            ],
          },
          {
            type: 'finalPick',
            title: 'Select, then resolve each item on a checklist',
            pros: [
              'Progress is always explicit',
              'Proof or a reason, never a dead end',
              'Chosen by the design lead in review',
            ],
          },
        ],
      },
      {
        id: 'considerations',
        nav: 'Design considerations',
        label: 'Design considerations',
        heading: 'Rules the flow enforces.',
        blocks: [
          {
            type: 'list',
            items: [
              {
                lead: 'Dispute or accept, not both.',
                text: 'A claim ends when you dispute, or accept and leave feedback. Once feedback is given, disputing closes and the screen says so.',
              },
              { lead: 'Partial amounts.', text: 'You can dispute part of a deduction, up to its full amount.' },
              {
                lead: 'A reason is always required,',
                text: 'stricter than the optional note in early explorations, so specialists get usable context.',
              },
              {
                lead: 'One tracked page per dispute,',
                text: 'so a claim can hold a dispute for a shortfall and another for bills found later. You can dispute again only after earlier ones resolve, up to a cap.',
              },
              { lead: 'Rejections too.', text: 'Outright rejections can be disputed, not just deductions.' },
              {
                lead: 'Low-key, not hidden.',
                text: 'The dispute entry point is deliberately quiet, but hiding it would just push people to the generic Help & Support link and recreate the support load.',
              },
            ],
          },
        ],
      },
      {
        id: 'key-flows',
        nav: 'Key flows',
        label: 'Key flows',
        heading: 'The final result',
        blocks: [
          {
            type: 'flows',
            flows: [
              {
                title: 'Wait while Plum verifies',
                text: 'A “Plum is verifying” stage, with an ETA, between settled and closed. Disputes are paused with a line explaining why, and Plum disputes any unfair deductions on your behalf.',
              },
              {
                title: 'Understand every deduction',
                text: 'Deductions grouped into fixable, policy-limited and not covered, each with its amount, a plain-language reason and a citation, like “Syringe ₹200, Gloves ₹250, per IRDAI non-medical list.”',
              },
              {
                title: 'Raise a dispute',
                text: 'Pick the items, set an amount, then resolve each on a checklist with proof or a reason you don’t have it.',
              },
              {
                title: 'Track the outcome',
                text: 'Each dispute gets its own page, from in review to approved, partially approved or rejected, with the recovered amount.',
              },
            ],
          },
        ],
      },
      {
        id: 'prototype',
        nav: 'The prototype',
        label: 'The prototype',
        heading: 'A link leadership could open on their phones.',
        blocks: [
          {
            type: 'text',
            text: 'I built a mobile-first clickable prototype covering both paths end to end, and shared it with the PM, design lead and head of product on 29 October: the verification stage and Plum-initiated disputes, user disputes on settled claims and rejections, uploading and tracking, and every outcome state.',
          },
          {
            type: 'text',
            text: 'A hidden side tab let reviewers jump to any screen or state, and a public link meant people without tool access could open it on their phones. Leadership feedback came back within hours.',
          },
        ],
      },
      {
        id: 'impact',
        nav: 'Impact',
        label: 'Impact',
        heading: 'Built to move the numbers that defined the problem.',
        blocks: [
          {
            type: 'text',
            text: 'I framed success around whether people stop needing support, not how many disputes come in.',
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
          {
            type: 'list',
            items: [
              {
                lead: 'Handed to engineering:',
                text: 'a complete mobile flow for both dispute paths, and a rules framework covering which deductions can be disputed, when disputing closes and how repeat disputes work.',
              },
              {
                lead: 'Shipped right away:',
                text: 'a deduction table (reason, amount, notes) in the closure email, so people got clear explanations before the app flow launched.',
              },
            ],
          },
        ],
      },
      {
        id: 'reflection',
        nav: 'Reflection',
        label: 'Reflection',
        heading: 'An explanation project, dressed up as a dispute flow.',
        blocks: [
          {
            type: 'text',
            text: 'I came in expecting to design a way to fight insurers. The data showed most people just needed to understand what had happened, and that reordering saved us from building friction nobody needed.',
          },
          {
            type: 'learnings',
            items: [
              {
                title: 'Let the data define the problem',
                text: 'Explaining came before disputing, and doing it in that order is what keeps a fair deduction from becoming a dispute.',
              },
              {
                title: 'Trust is a copy problem first',
                text: 'The hardest calls were about words like “verified,” “can’t” and “need help,” not layout.',
              },
              {
                title: 'Make invisible work visible',
                text: 'Plum was already fighting for users; the auto-dispute path just let them see it.',
              },
              {
                title: 'Designing friction on purpose is still design',
                text: 'Keeping the dispute entry point low-key without hiding it meant balancing Plum’s costs against users’ rights.',
              },
              {
                title: 'Prototypes beat review meetings',
                text: 'A link people could open on their phones got leadership feedback within hours.',
              },
            ],
          },
        ],
      },
    ],
  },
  'health-checkup': {
    tags: ['Plum', 'Shipped'],
    title: 'Health Checkup',
    summary:
      'Redesigned how people book, track and read their preventive health checkup at Plum, turning a one-off transaction into a journey people could discover, trust and act on. Grounded in a usability study and funnel data, then measured after launch with PostHog.',
    hero: {
      video: [
        { src: '/work/health-checkup/walkthrough.mov', type: 'video/quicktime; codecs="hvc1"' },
        { src: '/work/health-checkup/walkthrough.webm', type: 'video/webm; codecs="vp9"' },
      ],
      poster: '/work/health-checkup/walkthrough-poster.webp',
      alt: 'Prototype walkthrough of booking a health checkup.',
    },
    meta: {
      role: 'Product Designer, design owner for booking, tracking and reports',
      team: ['Product', 'PMM', 'Engineering'],
      timeline: ['2026', 'Live since July'],
      skills: ['Usability research', 'Interaction design', 'Data storytelling', 'Prototyping'],
    },
    impact: [
      { value: '~16k', label: 'Confirmed bookings, 17 Jul – 1 Nov 2026' },
      { value: '+21.5%', label: 'Weekly bookings after the release' },
      { value: '~90%', label: 'Of bookers went on to read their report' },
    ],
    nextUp: 'when-the-insurer-says-no',
    sections: [
      {
        id: 'context',
        nav: 'Context',
        label: 'Context',
        heading: 'Sales were growing fast. The app was where intent went to die.',
        blocks: [
          {
            type: 'text',
            text: 'Plum is an India-based health benefits platform, and Health Checkups is its preventive-care product: curated biomarker panels (built from 200+ markers researched down to what matters), at-home sample collection, an in-app report and a free follow-up doctor consultation. Many employees get it free through their employer; others buy retail plans.',
          },
          {
            type: 'text',
            text: 'Checkups grew 350%+ with 50,000+ completed in a year, but the in-app, self-serve journey converted a sliver of installs. The vision was to make it a repeatable loop of awareness → action, not a one-time formality.',
          },
          {
            type: 'text',
            text: 'I owned two surfaces: the booking & tracking journey and the post-checkup report. Discovery, marketing and the plan catalog sat with PMM and product.',
          },
        ],
      },
      {
        id: 'user-problem',
        nav: 'User problem',
        label: 'User problem',
        heading: 'People wanted a checkup, and the app kept losing them.',
        blocks: [
          {
            type: 'list',
            items: [
              { lead: '0.16% of installs booked:', text: '104 bookings from 61,434 installs over 90 days.' },
              { lead: '8% corporate adoption,', text: 'even though the checkup was fully free for those employees.' },
              { lead: '~41% dropped after a single listing view,', text: 'because booking spanned more than one session.' },
              { lead: '82% booked only for themselves,', text: 'leaving family demand untapped.' },
            ],
          },
          {
            type: 'figure',
            media: {
              src: '/work/health-checkup/funnel.webp',
              alt: 'Bar chart: of everyone who launched the app, about 14% reached the checkup homepage, about 4% viewed a listing and under 2% confirmed a booking.',
              width: 1605,
              height: 615,
              fit: 'plain',
            },
            caption:
              'Unique users by stage, as a share of app launches. Discovery and the first listing view are where the journey collapses.',
          },
          {
            type: 'quote',
            text: 'I didn’t know I could book it for my mother until I reached this page. I had to check with her and come back later.',
            cite: 'Usability participant, abandoning at member selection',
          },
          {
            type: 'statement',
            label: 'Problem statement',
            text: 'How might we turn a checkup people already want into one they actually book, track and act on?',
          },
        ],
      },
      {
        id: 'solution',
        nav: 'Solution',
        label: 'Solution',
        heading: 'A checkup journey that…',
        blocks: [
          {
            type: 'cards',
            cards: [
              {
                title: 'Says “free” up front',
                text: 'Free, at-home collection and family eligibility visible before anyone commits.',
                media: { src: '/work/health-checkup/motivators.webp', alt: 'Checkup home with callouts for doorstep collection and booking for family.', width: 2000, height: 1272, fit: 'contain' },
              },
              {
                title: 'Waits for you',
                text: 'A way back into a booking people finish across sessions, and tracking that says what happens next.',
                media: { src: '/work/health-checkup/resume.webp', alt: 'A “Pick up where you left off” card with a Resume button.', width: 1290, height: 812, fit: 'contain' },
              },
              {
                title: 'Reads at a glance',
                text: 'A report that shows what needs attention first, tied to a free doctor consultation.',
                media: { src: '/work/health-checkup/report.webp', alt: 'The report snapshot ring and a biomarker detail page.', width: 2000, height: 1274, fit: 'contain' },
              },
            ],
          },
        ],
      },
      {
        id: 'research',
        nav: 'How I validated',
        label: 'How I validated',
        heading: 'A usability study, a survey and the funnel, read together.',
        blocks: [
          {
            type: 'text',
            text: 'The work is anchored in a dedicated usability study of the live product: 9 moderated remote sessions (recent bookers, drop-offs and non-starters) plus a survey of 197 higher-intent users, read against funnel data from Clevertap, Metabase and Smartlook. Each step was coded as clear, usable but unclear, or confusing.',
          },
          {
            type: 'list',
            items: [
              { lead: 'Booking rarely finished in one sitting.', text: 'People explored, left and returned, with no way to resume.' },
              {
                lead: 'Key motivators surfaced too late.',
                text: '“Free,” at-home collection and booking for family only appeared deep in the flow, after many had already decided or left.',
              },
              {
                lead: 'Reports were hard to find, then hard to trust.',
                text: 'People looked in their profile; the report lived under “Your bookings.” Once open, borderline values and inconsistent marker counts shook confidence.',
              },
            ],
          },
          {
            type: 'quote',
            text: 'I couldn’t find my report initially. My colleagues faced the same issue, one even thought the report had vanished.',
            cite: 'Usability participant, on finding reports',
          },
          {
            type: 'statement',
            label: 'User insight',
            text: 'The ~41% who left after one listing weren’t lost. They were coming back later, and the app gave them nowhere to come back to.',
          },
          {
            type: 'statement',
            label: 'My goal',
            text: 'Move what already motivates people earlier, and connect the moments that already exist, instead of adding more.',
          },
        ],
      },
      {
        id: 'booking',
        nav: 'Booking & tracking',
        label: 'Design decisions: booking & tracking',
        heading: 'Three fixes for the moments people dropped off.',
        blocks: [
          {
            type: 'finalPick',
            label: 'Decision 01',
            title: 'Pull the motivators forward',
            media: { src: '/work/health-checkup/motivators.webp', alt: 'Two screens: the checkup home with “Doorstep Sample Collection” and “Book for Family” callouts, and a “Who is this for?” sheet.', width: 2000, height: 1272, fit: 'contain' },
            pros: [
              'Employer-free was the #1 booking motivator (45.2%), now visible before anyone commits',
              '“Who is this for?” comes earlier, before effort goes into slots',
              'Says “at-home sample collection” plainly, instead of implying it with “phlebotomist”',
            ],
          },
          {
            type: 'finalPick',
            label: 'Decision 02',
            title: 'Treat the drop-off as a resume problem',
            media: { src: '/work/health-checkup/resume.webp', alt: 'A “Pick up where you left off” card, and a pickup sheet with the member and address saved.', width: 1290, height: 812, fit: 'contain' },
            pros: [
              'A “pick up where you left off” card meets the real behaviour: explore, leave, return',
              'Saved member and address, so coming back is one tap',
              'Morning weekday slots first, the clear preference for fasting',
            ],
          },
          {
            type: 'finalPick',
            label: 'Decision 03',
            title: 'Make the wait reassuring',
            media: { src: '/work/health-checkup/tracking.webp', alt: 'Five tracking screens from scheduled to report ready.', width: 2000, height: 740, fit: 'contain' },
            pros: [
              'Phlebotomist assignment and visit tracking close the gap between booking and collection',
              'A clear “what happens next” makes the hour-before-assignment surprise an expected step',
            ],
          },
          {
            type: 'quote',
            text: 'Plum is way easier than other websites. The UX is better and it doesn’t ask for unnecessary things.',
            cite: 'Usability participant comparing booking flows',
          },
        ],
      },
      {
        id: 'reports',
        nav: 'Reports',
        label: 'Design decisions: reports',
        heading: 'A report that speaks to tests and trust, not just a score.',
        blocks: [
          {
            type: 'figure',
            media: {
              src: '/work/health-checkup/survey.webp',
              alt: 'Bar chart: price influences about 64% of check-up decisions, the tests included about 58%, and the lab or hospital brand about 49%.',
              width: 1605,
              height: 540,
              fit: 'plain',
            },
            caption: 'Survey (n=197): what most influences a checkup decision.',
          },
          {
            type: 'finalPick',
            label: 'Decision 04',
            title: 'Snapshot → category → biomarker',
            media: { src: '/work/health-checkup/report.webp', alt: 'The health snapshot ring and a Blood Urea Nitrogen detail page.', width: 2000, height: 1274, fit: 'contain' },
            pros: [
              'Opens with how many markers need attention, then out-of-range categories first',
              'Users called the category and detail pages “crystal clear”',
              'A value exactly on the edge of its range no longer reads as “non-optimal”',
            ],
          },
          {
            type: 'scale',
            title: 'Level',
            levels: [
              { label: 'Optimal', tone: 'good', meaning: 'Within the healthy range for that marker.' },
              { label: 'Sub-optimal', tone: 'warn', meaning: 'Just outside the healthy range. Worth keeping an eye on and re-testing.' },
              { label: 'Needs attention', tone: 'bad', meaning: 'Clearly out of range. Shown first, next to the free doctor consultation.' },
            ],
          },
          {
            type: 'finalPick',
            label: 'Decision 05',
            title: 'Reunite the report with the next action',
            media: { src: '/work/health-checkup/consult.webp', alt: 'Five versions of the report’s “Next steps” card.', width: 2000, height: 634, fit: 'contain' },
            pros: [
              'Several people never found the free consult and planned to pay for one elsewhere',
              'The “Next steps” card offers it at the moment you read your report, and changes as it’s booked and followed up',
            ],
          },
        ],
      },
      {
        id: 'key-flows',
        nav: 'Key flows',
        label: 'Key flows',
        heading: 'The final result',
        blocks: [
          {
            type: 'flows',
            flows: [
              {
                title: 'Book, with the motivators up front',
                text: '“Free,” at-home collection and family eligibility visible before anyone commits, with “Who is this for?” moved earlier.',
                media: {
                  video: [
                    { src: '/work/health-checkup/walkthrough.mov', type: 'video/quicktime; codecs="hvc1"' },
                    { src: '/work/health-checkup/walkthrough.webm', type: 'video/webm; codecs="vp9"' },
                  ],
                  poster: '/work/health-checkup/walkthrough-poster.webp',
                  alt: 'Prototype walkthrough of booking a health checkup.',
                },
              },
              {
                title: 'Pick up where you left off',
                text: 'Resume a booking from the home screen, straight back to your saved slot and cart.',
                media: {
                  video: [
                    { src: '/work/health-checkup/resume-walkthrough.mov', type: 'video/quicktime; codecs="hvc1"' },
                    { src: '/work/health-checkup/resume-walkthrough.webm', type: 'video/webm; codecs="vp9"' },
                  ],
                  poster: '/work/health-checkup/resume-walkthrough-poster.webp',
                  alt: 'Prototype walkthrough of resuming a booking.',
                },
              },
              {
                title: 'Track the checkup',
                text: 'From scheduled, to sample collected, to the report being ready.',
                media: {
                  video: [
                    { src: '/work/health-checkup/tracking-walkthrough.mov', type: 'video/quicktime; codecs="hvc1"' },
                    { src: '/work/health-checkup/tracking-walkthrough.webm', type: 'video/webm; codecs="vp9"' },
                  ],
                  poster: '/work/health-checkup/tracking-walkthrough-poster.webp',
                  alt: 'Prototype walkthrough of tracking a checkup.',
                },
              },
              {
                title: 'Read the report',
                text: 'The snapshot first, then the biomarkers that need attention, then each one in detail.',
                media: {
                  video: [
                    { src: '/work/health-checkup/report-walkthrough.mov', type: 'video/quicktime; codecs="hvc1"' },
                    { src: '/work/health-checkup/report-walkthrough.webm', type: 'video/webm; codecs="vp9"' },
                  ],
                  poster: '/work/health-checkup/report-walkthrough-poster.webp',
                  alt: 'Prototype walkthrough of the health report.',
                },
              },
              {
                title: 'Take the next step',
                text: 'The free doctor consultation, offered right where you read your report.',
                media: {
                  video: [
                    { src: '/work/health-checkup/next-steps-walkthrough.mov', type: 'video/quicktime; codecs="hvc1"' },
                    { src: '/work/health-checkup/next-steps-walkthrough.webm', type: 'video/webm; codecs="vp9"' },
                  ],
                  poster: '/work/health-checkup/next-steps-walkthrough-poster.webp',
                  alt: 'Scrolling through the report’s “Next steps” cards.',
                },
              },
            ],
          },
        ],
      },
      {
        id: 'impact',
        nav: 'Impact',
        label: 'Impact',
        heading: 'After launch, the numbers moved.',
        blocks: [
          {
            type: 'text',
            text: 'Between 17 July and 1 November 2026, 72.7k people opened the checkup homepage and about 13.5k of them booked, for roughly 16k confirmed bookings. Monthly bookings rose from 4,215 in August to 5,941 in September and held at 5,744 in October.',
          },
          {
            type: 'figure',
            media: {
              src: '/work/health-checkup/bookings-monthly.webp',
              alt: 'Bar chart of confirmed bookings: 4,215 in August, 5,941 in September and 5,744 in October.',
              width: 1600,
              height: 620,
              fit: 'plain',
            },
            caption: 'Confirmed bookings per month. July is left out: only about two weeks of it were tracked.',
          },
          {
            type: 'text',
            text: 'Weekly bookings averaged 1,182 in the weeks before the release (10–30 Aug) and 1,436 in the weeks after it (7 Sep – 4 Oct), a 21.5% lift. Telehealth grew 13% over the same weeks, so some of that is the app growing overall, but checkups grew faster.',
          },
          {
            type: 'list',
            items: [
              { lead: 'People come back for their results:', text: 'about 90% of bookers viewed their report (12,231 of 13,550).' },
              { lead: 'And come back to book again:', text: 'about 15% have booked more than once (1,997 of 13,550).' },
              {
                lead: 'Paying users follow through:',
                text: 'those who reached the payment gateway booked at 84.5%, against 15.9% for everyone else, and about 83% completed payment.',
              },
              {
                lead: 'The report earned trust:',
                text: 'one user cross-checked it against an AI tool and found “everything the AI said turned out to be similar to what the app is saying.”',
              },
            ],
          },
        ],
      },
      {
        id: 'still-broken',
        nav: 'What’s still broken',
        label: 'What’s still broken',
        heading: 'Where the funnel still leaks.',
        blocks: [
          {
            type: 'text',
            text: 'The biggest drop is between browsing and choosing: 65% of homepage visitors reach a listing, but only 21% add anything to the cart. Once something is in the cart, the flow is quick, with a median of 2 minutes from cart to slot.',
          },
          {
            type: 'figure',
            media: {
              src: '/work/health-checkup/funnel-posthog.webp',
              alt: 'Funnel: homepage viewed 72,540 (100%), listing viewed 47,192 (65.1%), added to cart 15,501 (21.4%), slot selected 8,945 (12.3%), member selected 8,506 (11.7%), booking confirmed 6,677 (9.2%), report viewed 5,868 (8.1%), report action 2,167 (3.0%).',
              width: 1600,
              height: 586,
              fit: 'plain',
            },
            caption: 'People who completed each step in order, as a share of homepage viewers (17 Jul – 1 Nov).',
          },
          {
            type: 'list',
            items: [
              { lead: 'Reports are still hard to find:', text: 'the “Your bookings” entry point fights people’s mental models.' },
              {
                lead: 'Data integrity hurts trust:',
                text: 'colleagues on the same plan saw different marker counts (“I had 29 parameters, my colleague had 35”).',
              },
              {
                lead: 'Location blocks real demand:',
                text: 'about 11% of people who checked serviceability couldn’t get a checkup in their area (6,375 of 57,377).',
              },
              { lead: 'Reading isn’t acting yet:', text: 'only about 37% of people who viewed their report took an action from it.' },
            ],
          },
        ],
      },
      {
        id: 'next',
        nav: 'What I’d ship next',
        label: 'What I’d ship next',
        heading: 'Sequenced by effort-to-trust ratio.',
        blocks: [
          {
            type: 'list',
            items: [
              { text: 'Relocate reports to a predictable home (profile or an upfront card) and keep them there regardless of booking count.' },
              { text: 'Resolve the marker-count discrepancy at the data layer before any more visual polish.' },
              {
                text: 'Lean into packages: 43.4% of people who add a package go on to book, against 24.3% for individual tests, which argues for curating and bundling the catalog.',
              },
            ],
          },
        ],
      },
      {
        id: 'reflection',
        nav: 'Reflection',
        label: 'Reflection',
        heading: 'The hardest problems weren’t on the screen.',
        blocks: [
          {
            type: 'text',
            text: 'They were in sequence and trust. The redesign proved a report could make preventive health legible and even enjoyable, but a beautiful report nobody can find, built on data people can’t reconcile with a colleague’s, erodes faster than it earns.',
          },
          {
            type: 'learnings',
            items: [
              {
                title: 'Move what exists before adding more',
                text: 'The clearest wins came from surfacing “free,” family and the free consult earlier, not from new features.',
              },
              { title: 'Drop-off isn’t always loss', text: 'Treating it as a resume problem matched how people actually book.' },
              { title: 'Trust is built in the data layer too', text: 'Visual polish can’t make up for numbers that don’t match between colleagues.' },
              { title: 'Measure after you ship', text: 'PostHog turned the funnel from a black box into the next design brief.' },
            ],
          },
        ],
      },
    ],
  },
  'killing-the-document-update-request': {
    tags: ['Plum', 'Shipped'],
    title: 'Killing the Document Update Request',
    summary:
      'Rebuilt how Plum members claim money back after they’ve already paid a hospital bill. Claims stall because of documents, not money, so I redesigned three connected journeys around one goal: get every document right the first time, so the claim never comes back.',
    hero: { alt: 'The reimbursement claim flow' },
    meta: {
      role: 'Product Designer',
      team: ['Claims PM', 'Engineering', 'Claims ops'],
      timeline: ['2026', 'Discharge-led claim shipped Aug 2026'],
      skills: ['Systems design', 'Interaction design', 'Error states', 'Content design'],
    },
    impact: [
      { value: '3', label: 'Document journeys unified into one system' },
      { value: '~30s', label: 'Bank check by ₹1 penny-drop, replacing manual proof uploads' },
      { value: 'Aug 2026', label: 'Discharge-led claim shipped, now under funnel evaluation' },
    ],
    nextUp: 'health-checkup',
    sections: [
      {
        id: 'context',
        nav: 'Context',
        label: 'Context',
        heading: 'A high-stakes task, at a low-capacity moment.',
        blocks: [
          {
            type: 'text',
            text: 'Reimbursement is the hardest path in the product, and the one people fall back to when cashless fails. It carries real money and real health context, and the person filing is usually a patient or a caregiver mid-recovery, not a power user.',
          },
          {
            type: 'list',
            items: [
              { text: 'Every claim needs a specific, insurer-dependent set of documents the member has never been asked for before.' },
              { text: 'Mistakes are expensive and invisible: a wrong or low-quality scan becomes a deduction or a document query weeks later.' },
              { text: 'Delays compound when a member’s health ID or policy is still pending at the time they file.' },
            ],
          },
        ],
      },
      {
        id: 'user-problem',
        nav: 'User problem',
        label: 'User problem',
        heading: 'The claim stalls on documents, not money.',
        blocks: [
          {
            type: 'text',
            text: 'A missing bill, an unreadable scan or a mismatched name triggers a Document Update Request (DUR): the insurer bounces the claim back, and a week or more evaporates. I grounded the redesign in three recurring, costly failures seen across claims operations and support.',
          },
          {
            type: 'list',
            items: [
              {
                lead: 'Duplicate claims.',
                text: 'Members forgot a document, assumed the claim was lost, and filed the same claim again for the same patient, doubling ops load.',
              },
              {
                lead: 'Missed and mismatched documents.',
                text: 'Bills left out, reports with issues, and bank proofs whose name didn’t match the insured. Each one was a silent dead end.',
              },
              {
                lead: 'No sense of what happens next.',
                text: 'Once submitted, the claim disappeared into a black box with no expectations set on timelines or delays.',
              },
            ],
          },
          {
            type: 'statement',
            label: 'Problem statement',
            text: 'How might we help people get every document right the first time, so their claim never comes back?',
          },
        ],
      },
      {
        id: 'solution',
        nav: 'Solution',
        label: 'Solution',
        heading: 'A claim flow that…',
        blocks: [
          {
            type: 'cards',
            cards: [
              {
                title: 'Starts from the discharge summary',
                text: 'Checked on upload, then used to pre-fill everything else, instead of hand-keyed details.',
              },
              {
                title: 'Catches errors before the insurer does',
                text: 'Document problems found in the app, with one re-upload to fix every issue in a go.',
              },
              {
                title: 'Never loses your progress',
                text: 'Drafts that resume, nudges against duplicate claims, and ₹1 bank checks that take seconds.',
              },
            ],
          },
        ],
      },
      {
        id: 'principles',
        nav: 'The approach',
        label: 'The approach',
        heading: 'Four principles, so three journeys feel like one product.',
        blocks: [
          {
            type: 'text',
            text: 'Rather than redesign screens one at a time, I set principles that every journey had to follow.',
          },
          {
            type: 'list',
            items: [
              { lead: 'Anchor on the one document everyone has.', text: 'The discharge summary becomes the backbone that validates and pre-fills the claim.' },
              { lead: 'Catch errors before the insurer does.', text: 'Validate documents in the app and let people fix every issue in a single pass.' },
              { lead: 'Make every requirement legible.', text: 'Mandatory and optional tags, per-section status and progress counters, so nothing is ambiguous.' },
              { lead: 'Never lose progress.', text: 'Drafts resume, nudges prevent duplicates, and payouts verify in seconds.' },
            ],
          },
          {
            type: 'statement',
            label: 'User insight',
            text: '25% of people filing an outpatient claim miss at least one bill, leading to wasted effort, slower processing or forgotten expenses.',
          },
          {
            type: 'statement',
            label: 'My goal',
            text: 'Stop a DUR before it happens: every requirement clear up front, every mistake caught in the app.',
          },
        ],
      },
      {
        id: 'journeys',
        nav: 'The three journeys',
        label: 'Design decisions: the three journeys',
        heading: 'One document hub, three journeys.',
        blocks: [
          {
            type: 'figure',
            caption: 'One document hub runs all three journeys, with mandatory and optional made explicit up front.',
          },
          {
            type: 'finalPick',
            label: 'Decision 01',
            title: 'Lead the claim with the discharge summary',
            pros: [
              'The flow checks the file really is a discharge summary, stopping a whole class of rejections at the door',
              'Hospital, dates and reason for treatment are carried forward instead of re-asked',
              'Each claim category has a plain-language definition, so people pick the right one',
            ],
          },
          {
            type: 'finalPick',
            label: 'Decision 02',
            title: 'Fix every report issue in one pass',
            pros: [
              'Handles the real combinations ops sees: one issue, several issues, a missing report, a report that implies medicines',
              '“Upload all your files again to review for all the issues in a go,” instead of one rejection at a time',
              'Reports stay optional, so a valid claim is never blocked on a document it doesn’t need',
            ],
          },
          {
            type: 'finalPick',
            label: 'Decision 03',
            title: 'Put the missed-bill nudge where the mistake happens',
            pros: [
              'The final hospital bill and its receipt are mandatory; everything else is optional, with a status tag',
              'One total claim amount ties the bills to the money being claimed, cutting mismatch queries',
              'The 25% missed-bill finding became an in-context callout, not a generic warning',
            ],
          },
        ],
      },
      {
        id: 'connective',
        nav: 'The connective tissue',
        label: 'Design decisions: the connective tissue',
        heading: 'Where “redesign” became “overhaul.”',
        blocks: [
          {
            type: 'text',
            text: 'The three journeys only pay off because of the scaffolding around them.',
          },
          {
            type: 'finalPick',
            label: 'Decision 04',
            title: 'Nudge people back to the draft they already started',
            pros: [
              '“There is a claim in your drafts for the same patient” routes people to resume it',
              'Directly attacks the duplicate-claim failure',
            ],
          },
          {
            type: 'finalPick',
            label: 'Decision 05',
            title: 'Verify bank details with a ₹1 penny-drop',
            pros: [
              'Verifies an account in about 30 seconds, replacing cancelled-cheque and passbook uploads',
              'If the name doesn’t match the insured, it falls back to an HR letter instead of a dead end',
            ],
          },
          {
            type: 'list',
            items: [
              {
                lead: 'Upfront delay warnings.',
                text: 'If a health ID or policy is still pending, a callout says “this can affect the reimbursement timeline” before they file, setting expectations instead of apologising later.',
              },
              {
                lead: 'A status page after submitting,',
                text: 'mapping the claim from “submitted to Plum” through to “money credited.”',
              },
            ],
          },
        ],
      },
      {
        id: 'considerations',
        nav: 'Design considerations',
        label: 'Design considerations',
        heading: 'Keeping a document-heavy flow from feeling heavy.',
        blocks: [
          {
            type: 'list',
            items: [
              {
                lead: 'A shared component language',
                text: '(status tags, section lists, progress counters, spot icons), so a new document type is configuration, not a new screen.',
              },
              {
                lead: 'Progressive disclosure:',
                text: '“things to keep in mind,” sample documents and a “why do we need this?” rationale sit one tap away instead of crowding the main action.',
              },
              {
                lead: 'An embedded help path',
                text: '(“book a slot with our claims expert,” in beta) for the cases where self-serve isn’t enough.',
              },
            ],
          },
        ],
      },
      {
        id: 'key-flows',
        nav: 'Key flows',
        label: 'Key flows',
        heading: 'The final result',
        blocks: [
          {
            type: 'flows',
            flows: [
              {
                title: 'Start from the discharge summary',
                text: 'Upload it, have it checked, and see the treatment details filled in for you.',
              },
              {
                title: 'Fix report issues in one go',
                text: 'See every problem with your reports at once, then re-upload once to fix them all.',
              },
              {
                title: 'Add bills and receipts',
                text: 'Clear mandatory and optional bills, with the missed-bill nudge right on the upload screen.',
              },
              {
                title: 'Get paid',
                text: 'A ₹1 bank check, then a status page that follows the claim through to the money landing.',
              },
            ],
          },
        ],
      },
      {
        id: 'impact',
        nav: 'Impact',
        label: 'Impact',
        heading: 'Shipped, with measurement in flight.',
        blocks: [
          {
            type: 'text',
            text: 'The discharge-summary-led claim shipped in August 2026; the reports and bills journeys build on it as the document system matures. I’m tracking three outcomes to validate the bets above.',
          },
          {
            type: 'list',
            items: [
              { lead: 'Fewer duplicate claims per patient,', text: 'from the draft-resume nudge.' },
              { lead: 'Lower document-query (DUR) and deduction rates,', text: 'from in-app validation and the batch re-upload.' },
              { lead: 'Faster, cleaner payouts,', text: 'from penny-drop verification and a single claim amount.' },
            ],
          },
          {
            type: 'text',
            text: 'Outcome metrics are being instrumented, and figures will be added once post-launch data lands. The 25% missed-bill figure is the pre-redesign baseline that motivated the bills journey.',
          },
        ],
      },
      {
        id: 'reflection',
        nav: 'Reflection',
        label: 'Reflection',
        heading: 'The best claim is the one that never comes back.',
        blocks: [
          {
            type: 'text',
            text: 'The work was less about any single screen than about a system: principles that let three journeys behave like one product, and scaffolding that catches mistakes before an insurer ever sees them.',
          },
          {
            type: 'learnings',
            items: [
              { title: 'Set principles before screens', text: 'Four principles kept three journeys consistent without designing each one in isolation.' },
              { title: 'Prevent, don’t apologise', text: 'Validation, nudges and upfront warnings do more than any status message after the fact.' },
              { title: 'Turn data into placement', text: 'The 25% missed-bill finding mattered because the nudge sits exactly where the mistake happens.' },
              { title: 'Design the dead ends out', text: 'Every failure, from a mismatched bank name to a missing report, needed a way forward.' },
            ],
          },
        ],
      },
    ],
  },
};
