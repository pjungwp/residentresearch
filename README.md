# Research Forge — Resident Research Concierge

A five-week studio that takes a resident from an idea to a faculty-reviewed IRB **draft**. An AI research mentor (Claude) works alongside a Live Research Blueprint the resident owns and edits.

| Week | Focus | Deliverable |
|---|---|---|
| 1 | Research story & question | "Once upon a time" story → PICOT / PEO / SPIDER question, FINER check |
| 2 | Literature & evidence gap | Logged search, 3–5 verified and annotated sources, evidence gap, revised question |
| 3 | Design, measures & analysis | Methods blueprint: design, outcomes, instrument, analysis, sample size |
| 4 | Mentor, logistics & dissemination | Human-subjects training (CITI / OHRP), mentor, team, budget, timeline, risks, GO/REVISE/DEFER |
| 5 | IRB draft | Assembled protocol draft, review category, consent and privacy plan, reflection |

Faculty checkpoints come after Weeks 2, 4 and 5. A project that passes the Week 5 checkpoint can be continued as the residency capstone.

## What it does

- **Studio**: the default screen. You chat with the AI mentor, and its suggestions arrive as *proposed* Blueprint updates you Accept, Edit or Dismiss. Nothing is overwritten silently, and every field keeps its revision history.
- **Field status**: each field is Confirmed, Proposed, Unknown or Needs verification. If you change the research question, downstream fields are flagged for review.
- **Evidence Library**:
  - Add sources by DOI, PMID, PMCID or a pasted citation, or search Europe PMC with an open-access filter.
  - Each source is checked against Crossref, PubMed and Europe PMC, plus Unpaywall for open-access PDF links. Retractions are flagged.
  - You can annotate sources, compare them, and export RIS or AMA citations.
  - A citation is **never** marked verified just because the AI supplied it.
- **Proposal editor**: builds a 16-section protocol from the Blueprint. It warns you when your edited text no longer matches the Blueprint and exports DOCX labeled "Draft — Pending Faculty and Institutional Review".
- **Mentor Review**:
  - Mentors comment on each section and mark it Ready, Needs revision or Pending.
  - Mentors sign off at each checkpoint.
  - The resident and mentor pass the project back and forth as a JSON backup, so no accounts are needed.
- **Offline-capable PWA**: projects are stored in the browser (IndexedDB) with JSON export and import. Includes a dark theme and keyboard shortcuts (`Ctrl/Cmd+K` search; `g` then `s/w/e/p/r/b` to jump).

## Deploy to Netlify

1. Connect this repo in Netlify. The build settings come from `netlify.toml`: `npm run build`, publish `dist`, Node 20.
2. In **Site configuration → Environment variables**, add:

| Variable | Required | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | yes | Claude API key. Used only inside the Edge Function and never sent to the browser. |
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
