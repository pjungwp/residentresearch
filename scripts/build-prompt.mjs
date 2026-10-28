// Regenerates src/content/masterPrompt.ts from src/content/masterPrompt.md
// (shared by the app UI and the Netlify edge function). Run: npm run prompt
import { readFileSync, writeFileSync } from 'node:fs';
const md = readFileSync(new URL('../src/content/masterPrompt.md', import.meta.url), 'utf8');
writeFileSync(
  new URL('../src/content/masterPrompt.ts', import.meta.url),
  `// GENERATED from masterPrompt.md by scripts/build-prompt.mjs — edit the .md, then run \`npm run prompt\`.\nexport const MASTER_PROMPT = ${JSON.stringify(md)};\n`
);
console.log('masterPrompt.ts written', md.length, 'chars');
