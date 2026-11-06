// What JontyLLM knows about you. Most of it is built from the site's own data,
// so editing your bio, timeline or case studies updates the bot too. The
// `extras` section is only for the bot: fill in the TODOs, in your own voice.

import { profile } from './profile';
import { aboutText, photoGroups, timeline } from './about';
import { caseStudies, outline } from './caseStudies';
import { tapes } from './tapes';
import { DOSE, STEPS, TOTAL } from '@/components/brew/brewSim';

/** Things visitors might ask that aren't written anywhere on the site. */
const extras = `
## How I talk
- My full voice guide is in the bot's instructions. In short: casual, curious, direct, a bit of a rabbit-holer, practical but not blindly so.
- I never use em dashes.

## Contact and availability
- TODO: how people should reach me (email / LinkedIn), and whether I'm open to new roles, freelance or just chatting.

## How I approach design
- TODO: two or three beliefs about design I'd stand behind in an interview.

## Fun facts
- Friends call me Jonty.
- I brew a pour-over most Mondays; the "brew a coffee" page on this site lets visitors make one.
- TODO: anything else (where I'm based, favourite tools, what I'm reading).
`;

/**
 * How you'd actually answer these out loud. The bot copies this tone more than
 * anything else, so write them the way you talk, not the way you'd write a
 * portfolio: typos, "honestly", lowercase, whatever is really you.
 */
const voiceSamples: { q: string; a: string }[] = [
  // { q: 'what do you do at plum?', a: '...' },
];

function voiceText() {
  if (!voiceSamples.length) return '';
  return (
    `## Example answers in my real voice\nMatch this tone and rhythm. Don't reuse these word for word.\n\n` +
    voiceSamples.map((s) => `Q: ${s.q}\nA: ${s.a}`).join('\n\n')
  );
}

/** The pour-over recipe the brew page walks visitors through. */
function recipeText() {
  const steps = STEPS.map((s) =>
    s.end === null ? `- then ${s.title.toLowerCase()}` : `- ${s.start}s to ${s.end}s: ${s.title.toLowerCase()}`,
  ).join('\n');
  return `## My pour-over recipe (the one on the brew a coffee page)\n${DOSE}g coffee to ${TOTAL}g water (about 1:${Math.round(TOTAL / DOSE)}), done in about two and a half minutes:\n${steps}`;
}

function caseStudyText() {
  return Object.entries(caseStudies)
    .map(([slug, cs]) => {
      const tape = tapes.find((t) => t.slug === slug);
      const chapters = outline(cs)
        .filter((e) => e.kind === 'chapter')
        .map(
          ({ numeral, chapter: ch }) =>
            `### ${numeral}. ${ch.title}\n` +
            ch.parts
              .map((p) => {
                const body = p.blocks
                  .map((b) => {
                    if (b.type === 'text' || b.type === 'note') return b.text;
                    if (b.type === 'table')
                      return [b.columns.join(' | '), ...b.rows.map((r) => r.join(' | '))].join('\n');
                    if (b.type === 'scale')
                      return `${b.title}: ${b.levels.map((l) => `${l.label} (${{ good: 'green', warn: 'yellow', bad: 'red' }[l.tone]})${l.meaning ? `, ${l.meaning}` : ''}`).join('; ')}`;
                    if (b.type === 'quote') return `A user said: "${b.text}" (${b.cite})`;
                    if (b.type === 'points')
                      return b.points.map((pt) => `- ${pt.lead ? pt.lead + ' ' : ''}${pt.text}`).join('\n');
                    return '';
                  })
                  .filter(Boolean)
                  .join('\n');
                return `#### ${p.title}\n${body}`;
              })
              .join('\n\n'),
        )
        .join('\n\n');
      const stats = cs.stats.map((s) => `- ${s.value} ${s.label}: ${s.detail}`).join('\n');
      const facts = cs.facts.map((f) => `- ${f.label}: ${f.value}`).join('\n');
      return [
        `## Case study: ${cs.headline} (${cs.subtitle})`,
        `Page: /work/${slug}. Role: ${tape?.role ?? ''}. Year: ${tape?.year ?? ''}.`,
        facts,
        `${cs.lead} ${cs.intro}`,
        `Key numbers:\n${stats}`,
        cs.solution
          ? `The solution, in short (${cs.solution.title}):\n${cs.solution.items.map((i) => `- ${i.title}: ${i.text}`).join('\n')}`
          : '',
        chapters,
      ].join('\n\n');
    })
    .join('\n\n');
}

export function buildKnowledge() {
  const work = timeline.map((r) => `- ${r.when}: ${r.title} at ${r.company}`).join('\n');
  // Each group with its photo captions, which hold small real details (my coffee
  // order, the races, the trips) the bot can mention.
  const hobbies = photoGroups
    .filter((g) => g.label !== 'me')
    .map((g) => {
      const captions = g.photos.map((p) => p.caption).filter(Boolean);
      return `- ${g.label}${captions.length ? `: ${captions.join('; ')}` : ''}`;
    })
    .join('\n');
  const otherWork = tapes
    .filter((t) => t.kind === 'work' && !caseStudies[t.slug])
    .map((t) => t.title)
    .join(', ');

  return [
    `# About ${profile.name}`,
    `${profile.name}, a ${profile.role}. Nickname: Jonty.`,
    aboutText.join('\n\n'),
    `## Where I've worked\n${work}`,
    recipeText(),
    `## Things I love outside work\nEach with the captions from my photos on the about page (short and playful; this is everything I've written about them so far).\n${hobbies}`,
    caseStudyText(),
    otherWork ? `## Other work on the site\nStill being written up: ${otherWork}. Don't describe them.` : '',
    `## The site itself\nA portfolio built like a shelf of cassettes: drag a tape into the Walkman to open a case study. Pages: home, about, what i like doing (hobbies), vintage stuff i own (my vintage pieces floating around the page, with a note on each), projects, and "brew a coffee" (an interactive pour-over).`,
    extras,
    voiceText(),
  ]
    .filter(Boolean)
    .join('\n\n');
}
