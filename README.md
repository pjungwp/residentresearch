# ResearchForge — Research Design Academy & Concierge

Two separate experiences that share one look and feel:

| Tab | What it is | Saved where |
|---|---|---|
| **Research Design Academy** | Five-week mini-course in educational research design. Each week has 7 colorful slides (one idea each, a running example, a quick check), key ideas, evidence-based practice tips, an assignment with guided fields and examples, a **Submit** button, Word export, and checked references. | `localStorage` (`rf.course`), with JSON backup/restore |
| **Research Design Concierge** | Free, self-paced tool for designing your own study in 7 stages: problem → question → framework → design → people & measures → analysis & ethics → protocol. Includes the Evidence Library (citation verification), the Protocol editor with DOCX export, and mentor review. | IndexedDB projects, with JSON export/import |

**Weeks:** 1 research story & question (plus naming a mentor and starting CITI) · 2 literature search & evidence gap · 3 study design, measures & analysis · 4 mentor, logistics & dissemination · 5 protocol & IRB draft.

**Live session:** Wednesdays 12:00–12:15 PM. Assignments are due Wednesday 8:00 AM; faculty review before noon and post written feedback by the afternoon. The schedule is in `SESSION` in `src/content/course.ts`. Assignment answers can be copied into the Concierge with **Bring into Concierge**. This copy never overwrites a Concierge field you have already changed.

**Submitting an assignment** saves a dated final copy and downloads a Word file. If a faculty email is set in Settings, it also opens an email to them. There is no server-side gradebook.

**AI is optional everywhere.** Lessons, assignments, Concierge stages, citation checks and exports all work without it. Every AI button is labeled *uses paid API credits*, because each request is billed to the program's Anthropic account.

**Readability:** the Aa button in the header switches text size between 100%, 112.5% (the default), 125% and 137.5%.

Readings are standard health-professions-education sources, each one checked before it was added. They are not presented as any program's syllabus.

## Deploy to Netlify

1. Connect this repo in Netlify. The build settings come from `netlify.toml`: `npm run build`, publish `dist`, Node 20.
2. In **Site configuration → Environment variables**, add:

| Variable | Required | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | for optional AI | Claude API key. Used only inside the Edge Function and never sent to the browser. Every AI request uses paid credits. |
| `CONCIERGE_ACCESS_CODE` | strongly recommended | Shared code residents enter in Settings. Stops strangers from spending your API credits. |
| `ANTHROPIC_MODEL` | no | Defaults to `claude-sonnet-5-5`. |
| `CONCIERGE_WEB_SEARCH` | no | Set to `off` to disable Claude's web search tool. |

3. Redeploy. Open **Settings → AI service → Check connection** in the app to confirm it is working.

The edge functions are:
- `netlify/edge-functions/concierge.ts` → `/api/concierge`: streams Claude responses. Rate-limited to 30 requests per minute per IP.
- `netlify/edge-functions/lit.ts` → `/api/lit`: an allowlisted fallback proxy for PubMed, Crossref, Europe PMC and Unpaywall.

### Costs

You pay Anthropic per token for Claude responses. The master prompt is cached to reduce cost. Web search is billed separately, at about $10 per 1,000 searches, with at most 5 searches per reply. To cut costs, set `CONCIERGE_WEB_SEARCH=off`; literature lookup and verification still work, because they use free public APIs.

## Privacy & safety

- No PHI or identifiable patient or trainee data. The app warns you before sending text that looks like an MRN, a date of birth, a phone number or an email address.
- Project data stays in the user's browser. Only the chat and a compact project summary are sent to Claude. API keys are never stored in the browser or in exports.
- Faculty review is **not** IRB approval. Every exported document is labeled as a draft.

## Develop

```bash
npm install
npm run dev            # UI only (AI calls need Netlify)
npx netlify dev        # UI + edge functions; put ANTHROPIC_API_KEY in .env
npm test               # unit tests (vitest)
npm run build
python3 scripts/qa.py http://localhost:4174 screenshots   # responsive + flow QA against `vite preview`
```

`src/content/masterPrompt.md` is the mentor's system prompt. `npm run build` compiles it into `masterPrompt.ts`, which the edge function and the app both import.
