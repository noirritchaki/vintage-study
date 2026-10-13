// What JontyLLM knows about you. Most of it is built from the site's own data,
// so editing your bio, timeline or case studies updates the bot too. The
// `extras` section is only for the bot: fill in the TODOs, in your own voice.

import { profile } from './profile';
import { aboutParagraphs, photoGroups, timeline } from './about';
import { caseStudies } from './caseStudies';
import { tapes } from './tapes';

/** Things visitors might ask that aren't written anywhere on the site. */
const extras = `
## How I talk
- Casual, warm, a little dry. Short sentences. Lowercase is fine.
- I never use em dashes.
- TODO: a few phrases or habits that sound like me.

## Contact and availability
- TODO: how people should reach me (email / LinkedIn), and whether I'm open to new roles, freelance or just chatting.

## How I approach design
- TODO: two or three beliefs about design I'd stand behind in an interview.

## Fun facts
- Friends call me Jonty.
- I brew a pour-over most Mondays; the "brew a coffee" page on this site lets visitors make one.
- TODO: anything else (where I'm based, favourite tools, what I'm reading).
`;

function caseStudyText() {
  return Object.entries(caseStudies)
    .map(([slug, cs]) => {
      const tape = tapes.find((t) => t.slug === slug);
      const chapters = cs.chapters
        .map(
          (ch) =>
            `### ${ch.numeral}. ${ch.title}\n` +
            ch.parts
              .map((p) => {
                const body = p.blocks
                  .map((b) => {
                    if (b.type === 'text' || b.type === 'note') return b.text;
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
        chapters,
      ].join('\n\n');
    })
    .join('\n\n');
}

export function buildKnowledge() {
  const work = timeline.map((r) => `- ${r.when}: ${r.title} at ${r.company}`).join('\n');
  const hobbies = photoGroups.map((g) => g.label).filter((l) => l !== 'me').join(', ');
  const otherWork = tapes
    .filter((t) => t.kind === 'work' && !caseStudies[t.slug])
    .map((t) => t.title)
    .join(', ');

  return [
    `# About ${profile.name}`,
    `${profile.name}, a ${profile.role}. Nickname: Jonty.`,
    aboutParagraphs.join('\n\n'),
    `## Where I've worked\n${work}`,
    `## Things I love outside work\n${hobbies}`,
    caseStudyText(),
    otherWork ? `## Other work on the site\nStill being written up: ${otherWork}. Don't describe them.` : '',
    `## The site itself\nA portfolio built like a shelf of cassettes: drag a tape into the Walkman to open a case study. Pages: home, about, what i like doing (hobbies), projects, and "brew a coffee" (an interactive pour-over).`,
    extras,
  ]
    .filter(Boolean)
    .join('\n\n');
}
