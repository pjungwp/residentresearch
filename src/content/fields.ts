/**
 * Concierge field registry. Stage pages, the Live Blueprint, the AI proposal protocol,
 * progress tracking and exports all read from this one list.
 * Note: `week` on fields/sections is the Concierge STAGE number (1–7); the name is kept for stored-data compatibility.
 */
export interface FieldDef {
  key: string;
  label: string;
  section: string;
  week: number;
  kind?: 'text' | 'long' | 'select';
  options?: string[];
  hint?: string;
  placeholder?: string;
  /** counts toward the stage's required decisions */
  required?: boolean;
  /** only shown for a framework */
  framework?: 'PICOT' | 'PEO' | 'SPIDER';
  /** hidden from the Blueprint panel (working fields) */
  workingOnly?: boolean;
}

export interface SectionDef {
  id: string;
  title: string;
  week: number;
  steps: string;
}

export const SECTIONS: SectionDef[] = [
  { id: 'problem', title: 'Problem & significance', week: 1, steps: 'Stage 1' },
  { id: 'question', title: 'Research question', week: 2, steps: 'Stage 2' },
  { id: 'gap', title: 'Evidence gap', week: 2, steps: 'Stage 2' },
  { id: 'theory', title: 'Theory & conceptual framework', week: 3, steps: 'Stage 3' },
  { id: 'design', title: 'Study design', week: 4, steps: 'Stage 4' },
  { id: 'participants', title: 'Participants & intervention', week: 5, steps: 'Stage 5' },
  { id: 'outcomes', title: 'Outcomes & measurement', week: 5, steps: 'Stage 5' },
  { id: 'analysis', title: 'Analysis plan', week: 6, steps: 'Stage 6' },
  { id: 'ethics', title: 'Ethics & IRB preparation', week: 6, steps: 'Stage 6' },
  { id: 'mentors', title: 'Mentor & training', week: 6, steps: 'Stage 6' },
  { id: 'logistics', title: 'Logistics & budget', week: 6, steps: 'Stage 6' },
  { id: 'feasibility', title: 'Feasibility & timeline', week: 6, steps: 'Stage 6' },
  { id: 'dissemination', title: 'Dissemination', week: 7, steps: 'Stage 7' },
  { id: 'references', title: 'Outstanding issues', week: 7, steps: 'Stage 7' }
];

export const FIELDS: FieldDef[] = [
  // Stage 1 · idea and problem (story is optional working space)
  { key: 'story.believed', label: 'Once upon a time, we believed that…', section: 'problem', week: 1, kind: 'long', workingOnly: true, hint: 'What clinicians or educators currently assume or do.' },
  { key: 'story.wondered', label: 'But I wondered whether…', section: 'problem', week: 1, kind: 'long', workingOnly: true, hint: 'The case, pattern or doubt that raised your question.' },
  { key: 'story.propose', label: 'So I propose to investigate…', section: 'problem', week: 1, kind: 'long', workingOnly: true, hint: 'Who, what and where, in plain words.' },
  { key: 'story.anticipate', label: 'I anticipate discovering…', section: 'problem', week: 1, kind: 'long', workingOnly: true, hint: 'Your best guess (a hypothesis), or what you hope to learn.' },
  { key: 'story.change', label: 'And hopefully this will change…', section: 'problem', week: 1, kind: 'long', workingOnly: true, hint: 'Practice, teaching or patient outcomes that could improve.' },
  { key: 'problem', label: 'Problem statement', section: 'problem', week: 1, kind: 'long', required: true, hint: '2–3 sentences: problem → why it matters → what we do not know.' },
  { key: 'purpose', label: 'Study purpose', section: 'problem', week: 1, kind: 'long', hint: 'The purpose of this study is to…' },
  { key: 'significance', label: 'Significance', section: 'problem', week: 1, kind: 'text', required: true, hint: 'One sentence.' },

  { key: 'qtype', label: 'Question type', section: 'question', week: 2, kind: 'select', options: ['Quantitative', 'Qualitative', 'Mixed methods'], required: true },
  { key: 'framework', label: 'Framework', section: 'question', week: 2, kind: 'select', options: ['PICOT', 'PEO', 'SPIDER'], required: true },
  { key: 'fw.P', label: 'Population', section: 'question', week: 2, framework: 'PICOT' },
  { key: 'fw.I', label: 'Intervention / exposure', section: 'question', week: 2, framework: 'PICOT' },
  { key: 'fw.C', label: 'Comparison', section: 'question', week: 2, framework: 'PICOT', hint: 'Leave blank for descriptive questions; don’t invent a comparator.' },
  { key: 'fw.O', label: 'Outcome', section: 'question', week: 2, framework: 'PICOT' },
  { key: 'fw.T', label: 'Time', section: 'question', week: 2, framework: 'PICOT' },
  { key: 'peo.P', label: 'Population', section: 'question', week: 2, framework: 'PEO' },
  { key: 'peo.E', label: 'Exposure / experience', section: 'question', week: 2, framework: 'PEO' },
  { key: 'peo.O', label: 'Outcomes or themes of interest', section: 'question', week: 2, framework: 'PEO' },
  { key: 'sp.S', label: 'Sample', section: 'question', week: 2, framework: 'SPIDER' },
  { key: 'sp.PI', label: 'Phenomenon of interest', section: 'question', week: 2, framework: 'SPIDER' },
  { key: 'sp.D', label: 'Design', section: 'question', week: 2, framework: 'SPIDER' },
  { key: 'sp.E', label: 'Evaluation', section: 'question', week: 2, framework: 'SPIDER' },
  { key: 'sp.R', label: 'Research type', section: 'question', week: 2, framework: 'SPIDER' },
  { key: 'question', label: 'Research question', section: 'question', week: 2, kind: 'long', required: true, hint: 'One sentence.' },
  { key: 'hypothesis', label: 'Hypothesis', section: 'question', week: 2, kind: 'long', hint: 'If applicable.' },
  { key: 'finer.f', label: 'Feasible', section: 'question', week: 2, required: true },
  { key: 'finer.i', label: 'Interesting', section: 'question', week: 2, required: true },
  { key: 'finer.n', label: 'Novel', section: 'question', week: 2, required: true },
  { key: 'finer.e', label: 'Ethical', section: 'question', week: 2, required: true },
  { key: 'finer.r', label: 'Relevant', section: 'question', week: 2, required: true },
  { key: 'backups', label: 'Backup questions', section: 'question', week: 2, kind: 'long', workingOnly: true, hint: '2–3 alternatives.' },

  // Stage 2 · evidence gap
  { key: 'gap', label: 'Evidence gap', section: 'gap', week: 2, kind: 'long', required: true, hint: '2–3 sentences: what is known, what is missing, why this study.' },
  { key: 'revisedQuestion', label: 'Revised research question', section: 'gap', week: 2, kind: 'long', required: true, hint: 'Or restate the original with a reason for keeping it.' },
  { key: 'revisionNote', label: 'What changed and why', section: 'gap', week: 2, kind: 'long' },

  // Stage 3 · theory & conceptual framework
  { key: 'theory', label: 'Guiding theory or model', section: 'theory', week: 3, kind: 'select',
    options: ['Adult learning (Knowles)', 'Experiential learning (Kolb)', 'Cognitive load theory', 'Constructivism', 'Situated learning / communities of practice', 'Self-determination theory', 'Deliberate practice', 'Other', 'Not an education study (clinical model instead)'] },
  { key: 'theoryWhy', label: 'Why this theory fits', section: 'theory', week: 3, kind: 'long', hint: '2–3 sentences linking the theory to your intervention.' },
  { key: 'mechanism', label: 'How it should work (mechanism)', section: 'theory', week: 3, kind: 'long', hint: 'What changes in the learner, and why.' },
  { key: 'logic.inputs', label: 'Logic model · Inputs', section: 'theory', week: 3, kind: 'long' },
  { key: 'logic.activities', label: 'Logic model · Activities', section: 'theory', week: 3, kind: 'long' },
  { key: 'logic.outputs', label: 'Logic model · Outputs', section: 'theory', week: 3, kind: 'long' },
  { key: 'logic.outcomes', label: 'Logic model · Outcomes (short → long term)', section: 'theory', week: 3, kind: 'long' },
  { key: 'conceptualFramework', label: 'Conceptual framework (summary)', section: 'theory', week: 3, kind: 'long', hint: 'One paragraph or a described diagram.' },

  // Stage 4 · design
  { key: 'design', label: 'Study design', section: 'design', week: 4, kind: 'select', required: true,
    options: ['Retrospective cohort / chart review', 'Case-control', 'Cross-sectional survey', 'Prospective observational', 'Pre–post / quality improvement', 'Interrupted time series', 'Randomized trial', 'Nonrandomized intervention', 'Educational pre–post', 'Crossover', 'Design-based research', 'Qualitative (interviews / focus groups)', 'Mixed methods', 'Other'] },
  { key: 'inference', label: 'What the design can show', section: 'design', week: 4, kind: 'select', options: ['Description', 'Association', 'Causal inference', 'Exploration (qualitative)'], required: true },
  { key: 'rationale', label: 'Why this design', section: 'design', week: 4, kind: 'long', required: true },
  { key: 'designAlternatives', label: 'Designs considered and rejected', section: 'design', week: 4, kind: 'long', hint: 'One line each: design → why not.' },
  { key: 'setting', label: 'Setting and dates', section: 'design', week: 4, required: true },
  { key: 'population', label: 'Population', section: 'participants', week: 5, kind: 'long', required: true },
  { key: 'inclusion', label: 'Inclusion criteria', section: 'participants', week: 5, kind: 'long', required: true },
  { key: 'exclusion', label: 'Exclusion criteria', section: 'participants', week: 5, kind: 'long' },
  { key: 'exposure', label: 'Intervention / exposure', section: 'participants', week: 5, kind: 'long' },
  { key: 'comparator', label: 'Comparator', section: 'participants', week: 5 },
  { key: 'dataSource', label: 'Data source', section: 'participants', week: 5, required: true, hint: 'e.g. Epic chart review, REDCap survey, interviews.' },
  { key: 'recruitment', label: 'Sampling / recruitment', section: 'participants', week: 5, kind: 'long' },
  { key: 'procedures', label: 'Procedures & timeline', section: 'participants', week: 5, kind: 'long' },
  { key: 'bias', label: 'Confounders and bias', section: 'design', week: 4, kind: 'long' },
  { key: 'primaryOutcome', label: 'Primary outcome (exact definition)', section: 'outcomes', week: 5, kind: 'long', required: true },
  { key: 'secondaryOutcomes', label: 'Secondary outcomes', section: 'outcomes', week: 5, kind: 'long' },
  { key: 'variables', label: 'Variables / data dictionary', section: 'outcomes', week: 5, kind: 'long' },
  { key: 'outcomeLevel', label: 'Outcome level', section: 'outcomes', week: 5, kind: 'select', options: ['Kirkpatrick 1 · Reaction', 'Kirkpatrick 2 · Learning (knows / knows how)', 'Kirkpatrick 2 · Skills (shows how)', 'Kirkpatrick 3 · Behavior (does)', 'Kirkpatrick 4 · Results / patient outcomes', 'Clinical outcome (not educational)'] },
  { key: 'instrument', label: 'Instrument, rubric or survey', section: 'outcomes', week: 5, kind: 'long', hint: 'Existing instrument (cite it) or your draft rubric/items + pilot plan.' },
  { key: 'raterPlan', label: 'Rater training & reliability', section: 'outcomes', week: 5, kind: 'long' },
  { key: 'validityPlan', label: 'Validity evidence plan', section: 'outcomes', week: 5, kind: 'long', hint: 'Content, response process, internal structure, relations, consequences.' },
  { key: 'analysis', label: 'Statistical / qualitative analysis plan', section: 'analysis', week: 6, kind: 'long', required: true },
  { key: 'sampleSize', label: 'Sample size or feasibility justification', section: 'analysis', week: 6, kind: 'long', required: true },
  { key: 'missingData', label: 'Missing data plan', section: 'analysis', week: 6, kind: 'long' },

  // Stage 6 · mentor, logistics, feasibility
  { key: 'training.course', label: 'Human subjects training course', section: 'mentors', week: 6, required: true, hint: 'The course your IRB accepts (often CITI).' },
  { key: 'training.date', label: 'Training completed on', section: 'mentors', week: 6, required: true },
  { key: 'mentor.name', label: 'Faculty mentor', section: 'mentors', week: 6, required: true },
  { key: 'mentor.why', label: 'Why this mentor', section: 'mentors', week: 6, kind: 'long' },
  { key: 'logistics.dataAccess', label: 'Data access', section: 'logistics', week: 6, kind: 'long' },
  { key: 'logistics.resources', label: 'Resources, software, storage', section: 'logistics', week: 6, kind: 'long' },
  { key: 'logistics.recruitment', label: 'Recruitment logistics', section: 'logistics', week: 6, kind: 'long' },
  { key: 'timeline', label: 'Timeline', section: 'feasibility', week: 6, kind: 'long', hint: 'Key dates: IRB, data, analysis, write-up.' },
  { key: 'risksSummary', label: 'Main risks and contingencies', section: 'feasibility', week: 6, kind: 'long' },
  { key: 'feasibility', label: 'Feasibility call', section: 'feasibility', week: 6, kind: 'select', options: ['GO', 'REVISE', 'DEFER'], required: true },
  { key: 'feasibilityReason', label: 'Reasons', section: 'feasibility', week: 6, kind: 'long' },
  { key: 'authorship', label: 'Authorship plan', section: 'dissemination', week: 7, kind: 'long' },
  { key: 'abstract', label: 'Preliminary abstract (results pending)', section: 'dissemination', week: 7, kind: 'long' },

  // Stage 6–7 · ethics, protocol
  { key: 'reviewCategory', label: 'Likely review category (for the IRB to decide)', section: 'ethics', week: 6, kind: 'long', required: true },
  { key: 'risksBenefits', label: 'Risks and benefits', section: 'ethics', week: 6, kind: 'long', required: true },
  { key: 'privacy', label: 'Privacy, PHI and data security', section: 'ethics', week: 6, kind: 'long', required: true },
  { key: 'consent', label: 'Consent approach', section: 'ethics', week: 6, kind: 'long', required: true },
  { key: 'coi', label: 'Conflicts of interest / power imbalances', section: 'ethics', week: 6, kind: 'long' },
  { key: 'reflection', label: 'Go/no-go reflection', section: 'ethics', week: 7, kind: 'long', required: true, workingOnly: true },
  { key: 'outstanding', label: 'Outstanding issues and institutional requirements', section: 'references', week: 7, kind: 'long', required: true, hint: 'Missing forms, approvals, data agreements, unresolved decisions.' },
  { key: 'decision', label: 'Capstone decision', section: 'ethics', week: 7, kind: 'select', options: ['Go — make it my capstone', 'Revise first', 'No — not this project'], required: true }
];

export const fieldByKey = Object.fromEntries(FIELDS.map((f) => [f.key, f])) as Record<string, FieldDef>;

export type Tone = 'w1' | 'w2' | 'w3' | 'w4' | 'w5' | 'w6' | 'w7';

export interface WeekDef {
  /** stage number 1–7 */
  n: number;
  title: string;
  short: string;
  tone: Tone;
  /** one-line purpose */
  goal: string;
  /** progressive-disclosure prompts (short) */
  instructions: string[];
  deliverable: string;
  steps: string;
  checklist: { id: string; text: string }[];
  /** optional AI prompts (paid credits) */
  actions: { label: string; prompt: string }[];
  /** mentor review checkpoint after this stage */
  checkpoint?: { id: 'w2' | 'w4' | 'w5'; label: string };
}

/** The seven Concierge stages. Users can jump between them freely. */
export const WEEKS: WeekDef[] = [
  {
    n: 1, title: 'Describe the problem', short: 'Problem', tone: 'w1', steps: 'Stage 1',
    goal: 'What did you notice, and why does it matter?',
    instructions: ['Tell the story in plain words.', 'Turn it into a 2–3 sentence problem statement.'],
    deliverable: 'Problem statement + significance',
    checklist: [{ id: 's1.who', text: 'I named who is affected' }],
    actions: [
      { label: 'Story → problem statement', prompt: 'Read my story and propose a 2–3 sentence problem statement and a one-sentence significance statement.' },
      { label: 'Brainstorm feasible angles', prompt: '/brainstorm Suggest 4 feasible study ideas from my problem, each with question, design, data source and main risk.' }
    ]
  },
  {
    n: 2, title: 'Refine the question', short: 'Question', tone: 'w2', steps: 'Stage 2',
    goal: 'One focused, answerable question.',
    instructions: ['Pick PICOT, PEO or SPIDER.', 'Write one sentence.', 'Check FINER.', 'Name the evidence gap.'],
    deliverable: 'Research question + FINER + gap',
    checklist: [
      { id: 'w1.one', text: 'The question fits in one sentence' },
      { id: 'w1.measurable', text: 'The outcome is measurable with data I can get' }
    ],
    actions: [
      { label: 'Refine my question', prompt: 'Help me refine my research question with the right framework (PICOT, PEO or SPIDER). Propose the components and the one-sentence question.' },
      { label: 'FINER check', prompt: 'Run a FINER check on my current question and propose one line for each letter. Point out the biggest risk.' },
      { label: 'Search strategy', prompt: '/literature Build a search strategy from my question: concepts, keywords, MeSH terms, and a PubMed search string.' }
    ],
    checkpoint: { id: 'w2', label: 'Question & evidence gap' }
  },
  {
    n: 3, title: 'Framework (if relevant)', short: 'Framework', tone: 'w3', steps: 'Stage 3',
    goal: 'Why should it work? Optional for many clinical studies.',
    instructions: ['Education study: pick a learning theory.', 'Clinical study: name the mechanism or model.', 'Sketch a logic model (optional).'],
    deliverable: 'Theory or mechanism (optional)',
    checklist: [{ id: 's3.link', text: 'Theory, intervention and outcome connect' }],
    actions: [
      { label: 'Match a theory', prompt: 'Suggest 2–3 learning theories that fit my intervention, with one sentence each on the mechanism and what it predicts. Cite only real, standard sources.' },
      { label: 'Draft logic model', prompt: 'Propose a logic model (inputs, activities, outputs, outcomes) for my study as Blueprint proposals.' }
    ]
  },
  {
    n: 4, title: 'Compare designs', short: 'Design', tone: 'w4', steps: 'Stage 4',
    goal: 'The simplest design that answers the question.',
    instructions: ['Compare 2–3 designs.', 'Pick one and say why.', 'Name the main bias.'],
    deliverable: 'Design + rationale',
    checklist: [{ id: 'w3.align', text: 'The design can answer my question type' }],
    actions: [
      { label: 'Compare designs', prompt: '/methods Compare 2–3 study designs that could answer my question, with feasibility here, and recommend one.' },
      { label: 'Bias check', prompt: 'Review my design for confounding, selection bias and information bias. Propose mitigations.' }
    ]
  },
  {
    n: 5, title: 'People, intervention & measures', short: 'Measures', tone: 'w5', steps: 'Stage 5',
    goal: 'Who, what, and how you will measure it.',
    instructions: ['Define participants and sampling.', 'Describe the intervention and comparator.', 'Define outcomes and instruments.', 'Plan validity evidence.'],
    deliverable: 'Methods & measurement plan',
    checklist: [{ id: 'w3.plan', text: 'Every outcome has a measure' }],
    actions: [
      { label: 'Define outcomes', prompt: '/assessment Propose an exact primary outcome definition, outcome level, instrument and validity evidence plan.' },
      { label: 'Draft a rubric', prompt: 'Draft a 4–6 criterion analytic rubric for my primary outcome with 3 performance levels. Mark it as a draft needing pilot testing.' }
    ],
    checkpoint: { id: 'w4', label: 'Methods & measurement' }
  },
  {
    n: 6, title: 'Analysis & ethics', short: 'Analysis', tone: 'w6', steps: 'Stage 6',
    goal: 'Plan analysis, protections and feasibility before collecting data.',
    instructions: ['Match analysis to each outcome.', 'Justify sample size.', 'Plan consent, privacy and risks.', 'Check feasibility and training.'],
    deliverable: 'Analysis, ethics & feasibility plan',
    checklist: [
      { id: 'w3.size', text: 'Sample size or feasibility is justified' },
      { id: 'w4.training', text: 'Human subjects training done' }
    ],
    actions: [
      { label: 'Analysis plan', prompt: 'Propose a statistical (or qualitative) analysis plan and a sample-size or feasibility justification, explained simply.' },
      { label: 'Ethics sections', prompt: '/irb Propose risks/benefits, privacy and consent sections. Do not declare an exemption; note what the IRB must decide.' },
      { label: 'Feasibility call', prompt: '/feasibility Assess GO / REVISE / DEFER with reasons and the top 3 risks with fallbacks.' }
    ]
  },
  {
    n: 7, title: 'Generate the protocol', short: 'Protocol', tone: 'w7', steps: 'Stage 7',
    goal: 'Pull it together and export.',
    instructions: ['Review open items.', 'Plan dissemination.', 'Open the Protocol editor and export.'],
    deliverable: 'Exportable research protocol',
    checklist: [{ id: 'w5.mentor', text: 'Mentor review scheduled' }],
    actions: [
      { label: 'Readiness check', prompt: 'Review my whole Blueprint for protocol readiness. List what is missing or weak, most important first.' },
      { label: 'Peer-review critique', prompt: '/critique Give a rigorous peer-review style critique of my proposal.' },
      { label: 'Draft abstract', prompt: '/abstract Draft a structured abstract with results pending. Do not invent findings.' }
    ],
    checkpoint: { id: 'w5', label: 'Protocol readiness' }
  }
];
export const STAGES = WEEKS;

export const TONE_CLASSES: Record<Tone, { text: string; bg: string; soft: string; border: string }> = {
  w1: { text: 'text-w1-text', bg: 'bg-w1', soft: 'bg-w1-soft', border: 'border-w1' },
  w2: { text: 'text-w2-text', bg: 'bg-w2', soft: 'bg-w2-soft', border: 'border-w2' },
  w3: { text: 'text-w3-text', bg: 'bg-w3', soft: 'bg-w3-soft', border: 'border-w3' },
  w4: { text: 'text-w4-text', bg: 'bg-w4', soft: 'bg-w4-soft', border: 'border-w4' },
  w5: { text: 'text-w5-text', bg: 'bg-w5', soft: 'bg-w5-soft', border: 'border-w5' },
  w6: { text: 'text-w6-text', bg: 'bg-w6', soft: 'bg-w6-soft', border: 'border-w6' },
  w7: { text: 'text-w7-text', bg: 'bg-w7', soft: 'bg-w7-soft', border: 'border-w7' }
};

/** Fields whose change should flag downstream sections for review. */
export const UPSTREAM_KEYS = ['question', 'revisedQuestion', 'fw.P', 'fw.I', 'fw.C', 'fw.O', 'peo.P', 'peo.E', 'peo.O', 'sp.S', 'sp.PI'];
export const DOWNSTREAM_KEYS = ['design', 'population', 'inclusion', 'exposure', 'comparator', 'primaryOutcome', 'secondaryOutcomes', 'analysis', 'sampleSize', 'instrument'];
