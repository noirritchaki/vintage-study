// Suggested questions in the JontyLLM chat, by page, so they fit what the
// visitor is looking at. Keep each one answerable from the bot's notes
// (jontyKnowledge.ts), or it will just say it doesn't know.

const BY_PAGE: Record<string, string[]> = {
  '/': [
    'What are you working on at Plum?',
    'Tell me about Killing the Document Update Request',
    'Tell me about Health Checkup',
    'Tell me about When the Insurer Says No',
    'How do you approach design?',
    'How does this cassette shelf work?',
  ],
  '/about': [
    'Where have you worked before?',
    'What do you do at Plum?',
    'What’s monday coffee?',
    'What’s your coffee order?',
    'What do you do for fun?',
  ],
  '/hobbies': [
    'What do you do for fun?',
    'Do you run races?',
    'Been on any fun trips?',
    'What’s your coffee order?',
  ],
  '/vintage': [
    'What kind of vintage stuff do you collect?',
    'What else do you do for fun?',
    'What’s monday coffee?',
  ],
  '/projects': [
    'What are you working on at Plum?',
    'Tell me about Killing the Document Update Request',
    'Tell me about Health Checkup',
    'Tell me about When the Insurer Says No',
    'How do you approach design?',
  ],
  '/brew': [
    'What’s your pour-over recipe?',
    'What’s monday coffee?',
    'What’s your coffee order?',
    'How long does a pour-over take?',
  ],
  '/work/killing-the-document-update-request': [
    'What’s a DUR, exactly?',
    'Why lead with the discharge summary?',
    'How does penny-drop verification work?',
    'What’s the 25% missed-bill thing?',
    'What’s shipped so far?',
  ],
  '/work/when-the-insurer-says-no': [
    'Why explain deductions before disputes?',
    'What does SettlementLens do?',
    'Why accept “I don’t have this document”?',
    'What was wrong with “Verified by Plum”?',
    'How did you pick the upload pattern?',
  ],
  '/work/health-checkup': [
    'Why did so few installs book?',
    'What did the usability study find?',
    'How does the report show severity?',
    'What’s still broken?',
    'What would you ship next?',
  ],
};

const FALLBACK = ['What are you working on at Plum?', 'How do you approach design?', 'What do you do for fun?'];

/** Questions that fit the page at `pathname`. */
export function startersFor(pathname: string) {
  return BY_PAGE[pathname] ?? (pathname.startsWith('/work/') ? BY_PAGE['/projects'] : FALLBACK);
}
