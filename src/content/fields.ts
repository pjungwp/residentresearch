/**
 * Blueprint field registry. Week pages, the Live Blueprint, the AI proposal protocol,
 * progress tracking and exports all read from this one list.
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
  /** counts toward the week's required deliverables */
  required?: boolean;
  /** only shown for a framework */
  framework?: 'PICOT' | 'PEO' | 'SPIDER';
  /** hidden from the Blueprint panel (assignment-only working fields) */
  workingOnly?: boolean;
}

export interface SectionDef {
  id: string;
  title: string;
  week: number;
  steps: string;
}

export const SECTIONS: SectionDef[] = [
  { id: 'problem', title: 'Problem & significance', week: 1, steps: 'Step 1' },
  { id: 'question', title: 'Research question', week: 1, steps: 'Step 2' },
  { id: 'gap', title: 'Evidence gap', week: 2, steps: 'Step 3' },
  { id: 'design', title: 'Study design & methods', week: 3, steps: 'Step 4' },
  { id: 'outcomes', title: 'Outcomes & assessment', week: 3, steps: 'Step 5A–C' },
  { id: 'analysis', title: 'Statistical / qualitative analysis', week: 3, steps: 'Step 5D–E' },
  { id: 'mentors', title: 'Mentors & collaborators', week: 4, steps: 'Step 6A' },
  { id: 'logistics', title: 'Logistics & budget', week: 4, steps: 'Step 6B–E' },
  { id: 'feasibility', title: 'Feasibility & timeline', week: 4, steps: 'Step 7' },
  { id: 'dissemination', title: 'Dissemination plan', week: 4, steps: 'Step 8' },
  { id: 'ethics', title: 'Ethics & IRB preparation', week: 5, steps: 'Step 9' },
  { id: 'references', title: 'References & outstanding issues', week: 5, steps: 'Steps 3, 9' }
];

export const FIELDS: FieldDef[] = [
  // Week 1 · Once Upon a Time research story (working)
  { key: 'story.believed', label: 'Once upon a time, we believed that…', section: 'problem', week: 1, kind: 'long', workingOnly: true, hint: 'What clinicians or educators currently assume or do.' },
  { key: 'story.wondered', label: 'But I wondered whether…', section: 'problem', week: 1, kind: 'long', workingOnly: true, hint: 'The case, pattern or doubt that raised your question.' },
  { key: 'story.propose', label: 'So I propose to investigate…', section: 'problem', week: 1, kind: 'long', workingOnly: true, hint: 'Who, what and where, in plain words.' },
  { key: 'story.anticipate', label: 'I anticipate discovering…', section: 'problem', week: 1, kind: 'long', workingOnly: true, hint: 'Your best guess (a hypothesis), or what you hope to learn.' },
  { key: 'story.change', label: 'And hopefully this will change…', section: 'problem', week: 1, kind: 'long', workingOnly: true, hint: 'Practice, teaching or patient outcomes that could improve.' },
  { key: 'problem', label: 'Problem statement', section: 'problem', week: 1, kind: 'long', required: true, hint: '2–3 sentences: problem → why it matters → what we do not know.' },
  { key: 'significance', label: 'Significance', section: 'problem', week: 1, kind: 'text', required: true, hint: 'One sentence.' },

  { key: 'qtype', label: 'Question type', section: 'question', week: 1, kind: 'select', options: ['Quantitative', 'Qualitative', 'Mixed methods'], required: true },
  { key: 'framework', label: 'Framework', section: 'question', week: 1, kind: 'select', options: ['PICOT', 'PEO', 'SPIDER'], required: true },
  { key: 'fw.P', label: 'Population', section: 'question', week: 1, framework: 'PICOT' },
  { key: 'fw.I', label: 'Intervention / exposure', section: 'question', week: 1, framework: 'PICOT' },
  { key: 'fw.C', label: 'Comparison', section: 'question', week: 1, framework: 'PICOT', hint: 'Leave blank for descriptive questions; don’t invent a comparator.' },
  { key: 'fw.O', label: 'Outcome', section: 'question', week: 1, framework: 'PICOT' },
  { key: 'fw.T', label: 'Time', section: 'question', week: 1, framework: 'PICOT' },
  { key: 'peo.P', label: 'Population', section: 'question', week: 1, framework: 'PEO' },
  { key: 'peo.E', label: 'Exposure / experience', section: 'question', week: 1, framework: 'PEO' },
  { key: 'peo.O', label: 'Outcomes or themes of interest', section: 'question', week: 1, framework: 'PEO' },
  { key: 'sp.S', label: 'Sample', section: 'question', week: 1, framework: 'SPIDER' },
  { key: 'sp.PI', label: 'Phenomenon of interest', section: 'question', week: 1, framework: 'SPIDER' },
  { key: 'sp.D', label: 'Design', section: 'question', week: 1, framework: 'SPIDER' },
  { key: 'sp.E', label: 'Evaluation', section: 'question', week: 1, framework: 'SPIDER' },
  { key: 'sp.R', label: 'Research type', section: 'question', week: 1, framework: 'SPIDER' },
  { key: 'question', label: 'Research question', section: 'question', week: 1, kind: 'long', required: true, hint: 'One sentence.' },
  { key: 'hypothesis', label: 'Hypothesis', section: 'question', week: 1, kind: 'long', hint: 'If applicable.' },
  { key: 'finer.f', label: 'Feasible', section: 'question', week: 1, required: true },
  { key: 'finer.i', label: 'Interesting', section: 'question', week: 1, required: true },
  { key: 'finer.n', label: 'Novel', section: 'question', week: 1, required: true },
  { key: 'finer.e', label: 'Ethical', section: 'question', week: 1, required: true },
  { key: 'finer.r', label: 'Relevant', section: 'question', week: 1, required: true },
  { key: 'backups', label: 'Backup questions', section: 'question', week: 1, kind: 'long', workingOnly: true, hint: '2–3 alternatives.' },

  // Week 2
  { key: 'gap', label: 'Evidence gap', section: 'gap', week: 2, kind: 'long', required: true, hint: '2–3 sentences: what is known, what is missing, why this study.' },
  { key: 'revisedQuestion', label: 'Revised research question', section: 'gap', week: 2, kind: 'long', required: true, hint: 'Or restate the original with a reason for keeping it.' },
  { key: 'revisionNote', label: 'What changed and why', section: 'gap', week: 2, kind: 'long' },

  // Week 3
  { key: 'design', label: 'Study design', section: 'design', week: 3, kind: 'select', required: true,
    options: ['Retrospective cohort / chart review', 'Case-control', 'Cross-sectional survey', 'Prospective observational', 'Pre–post / quality improvement', 'Interrupted time series', 'Randomized trial', 'Nonrandomized intervention', 'Educational pre–post', 'Qualitative (interviews / focus groups)', 'Mixed methods', 'Other'] },
  { key: 'inference', label: 'What the design can show', section: 'design', week: 3, kind: 'select', options: ['Description', 'Association', 'Causal inference', 'Exploration (qualitative)'], required: true },
  { key: 'rationale', label: 'Why this design', section: 'design', week: 3, kind: 'long' },
  { key: 'setting', label: 'Setting and dates', section: 'design', week: 3, required: true },
  { key: 'population', label: 'Population', section: 'design', week: 3, kind: 'long', required: true },
  { key: 'inclusion', label: 'Inclusion criteria', section: 'design', week: 3, kind: 'long', required: true },
  { key: 'exclusion', label: 'Exclusion criteria', section: 'design', week: 3, kind: 'long' },
  { key: 'exposure', label: 'Intervention / exposure', section: 'design', week: 3, kind: 'long' },
  { key: 'comparator', label: 'Comparator', section: 'design', week: 3 },
  { key: 'dataSource', label: 'Data source', section: 'design', week: 3, required: true, hint: 'e.g. Epic chart review, REDCap survey, interviews.' },
  { key: 'recruitment', label: 'Sampling / recruitment', section: 'design', week: 3, kind: 'long' },
  { key: 'bias', label: 'Confounders and bias', section: 'design', week: 3, kind: 'long' },
  { key: 'primaryOutcome', label: 'Primary outcome (exact definition)', section: 'outcomes', week: 3, kind: 'long', required: true },
  { key: 'secondaryOutcomes', label: 'Secondary outcomes', section: 'outcomes', week: 3, kind: 'long' },
  { key: 'variables', label: 'Variables / data dictionary', section: 'outcomes', week: 3, kind: 'long' },
  { key: 'instrument', label: 'Survey or instrument', section: 'outcomes', week: 3, kind: 'long', hint: 'Validated instrument (cite it) or 10–20 draft items + pilot plan.' },
  { key: 'analysis', label: 'Statistical / qualitative analysis plan', section: 'analysis', week: 3, kind: 'long', required: true },
  { key: 'sampleSize', label: 'Sample size or feasibility justification', section: 'analysis', week: 3, kind: 'long', required: true },
  { key: 'missingData', label: 'Missing data plan', section: 'analysis', week: 3, kind: 'long' },

  // Week 4
  { key: 'training.course', label: 'Human subjects training course', section: 'mentors', week: 4, required: true, hint: 'The course your IRB accepts (often CITI).' },
  { key: 'training.date', label: 'Training completed on', section: 'mentors', week: 4, required: true },
  { key: 'mentor.name', label: 'Faculty mentor', section: 'mentors', week: 4, required: true },
  { key: 'mentor.why', label: 'Why this mentor', section: 'mentors', week: 4, kind: 'long' },
  { key: 'logistics.dataAccess', label: 'Data access', section: 'logistics', week: 4, kind: 'long' },
  { key: 'logistics.resources', label: 'Resources, software, storage', section: 'logistics', week: 4, kind: 'long' },
  { key: 'logistics.recruitment', label: 'Recruitment logistics', section: 'logistics', week: 4, kind: 'long' },
  { key: 'risksSummary', label: 'Main risks and contingencies', section: 'feasibility', week: 4, kind: 'long' },
  { key: 'feasibility', label: 'Feasibility call', section: 'feasibility', week: 4, kind: 'select', options: ['GO', 'REVISE', 'DEFER'], required: true },
  { key: 'feasibilityReason', label: 'Reasons', section: 'feasibility', week: 4, kind: 'long' },
  { key: 'authorship', label: 'Authorship plan', section: 'dissemination', week: 4, kind: 'long' },
  { key: 'abstract', label: 'Preliminary abstract (results pending)', section: 'dissemination', week: 4, kind: 'long' },

  // Week 5
  { key: 'reviewCategory', label: 'Likely review category (for the IRB to decide)', section: 'ethics', week: 5, kind: 'long', required: true },
  { key: 'risksBenefits', label: 'Risks and benefits', section: 'ethics', week: 5, kind: 'long', required: true },
  { key: 'privacy', label: 'Privacy, PHI and data security', section: 'ethics', week: 5, kind: 'long', required: true },
  { key: 'consent', label: 'Consent approach', section: 'ethics', week: 5, kind: 'long', required: true },
  { key: 'coi', label: 'Conflicts of interest / power imbalances', section: 'ethics', week: 5, kind: 'long' },
  { key: 'reflection', label: 'Go/no-go reflection', section: 'ethics', week: 5, kind: 'long', required: true, workingOnly: true },
  { key: 'outstanding', label: 'Outstanding issues and institutional requirements', section: 'references', week: 5, kind: 'long', required: true, hint: 'Missing forms, approvals, data agreements, unresolved decisions.' },
  { key: 'decision', label: 'Capstone decision', section: 'ethics', week: 5, kind: 'select', options: ['Go — make it my capstone', 'Revise first', 'No — not this project'], required: true }
];

export const fieldByKey = Object.fromEntries(FIELDS.map((f) => [f.key, f])) as Record<string, FieldDef>;

export interface WeekDef {
  n: number;
  title: string;
  short: string;
  /** design token prefix: w1…w5 */
  tone: 'w1' | 'w2' | 'w3' | 'w4' | 'w5';
  goal: string;
  instructions: string[];
  deliverable: string;
  steps: string;
  checklist: { id: string; text: string }[];
  actions: { label: string; prompt: string }[];
  /** mentor review checkpoint after this week */
  checkpoint?: { id: 'w2' | 'w4' | 'w5'; label: string };
}

export const WEEKS: WeekDef[] = [
  {
    n: 1, title: 'Research story & question', short: 'Idea', tone: 'w1', steps: 'Steps 1–2',
    goal: 'Turn something you noticed into one focused, answerable question.',
    instructions: [
      'Identify a meaningful clinical or educational problem.',
      'Write the Once Upon a Time research story (five prompts).',
      'Formulate a focused PICO(T) question, or PEO/SPIDER for qualitative work.',
      'Check it against FINER and keep 2–3 backup questions.'
    ],
    deliverable: 'A one-page research story and a focused research question.',
    checklist: [
      { id: 'w1.one', text: 'The question fits in one sentence' },
      { id: 'w1.elements', text: 'Every framework element is named' },
      { id: 'w1.measurable', text: 'The outcome can be measured with data I can actually get' },
      { id: 'w1.time', text: 'It could be answered here in about 12–18 months' }
    ],
    actions: [
      { label: 'Shape my story into a problem', prompt: 'Read my Once Upon a Time story and propose a 2–3 sentence problem statement and a one-sentence significance statement.' },
      { label: 'Refine question', prompt: 'Help me refine my research question with the right framework (PICOT, PEO or SPIDER). Propose the components and the one-sentence question.' },
      { label: 'Run a FINER check', prompt: 'Run a FINER check on my current question and propose one line for each letter. Point out the biggest risk.' },
      { label: 'Brainstorm feasible topics', prompt: '/brainstorm Suggest 4 feasible resident research ideas related to my story, each with question, design, data source and main risk.' }
    ]
  },
  {
    n: 2, title: 'Literature & evidence gap', short: 'Evidence', tone: 'w2', steps: 'Step 3',
    goal: 'Learn what is known, find the gap, and sharpen the question.',
    instructions: [
      'Run a focused, logged literature search.',
      'Identify 3–5 highly relevant publications (more if you continue to a capstone).',
      'Write an annotated bibliography from sources you have verified and read.',
      'State the evidence gap, and revise or pivot your question if the literature justifies it.'
    ],
    deliverable: 'Annotated bibliography, evidence-gap statement, revised question.',
    checklist: [
      { id: 'w2.log', text: 'The search is reproducible from the log' },
      { id: 'w2.read', text: 'I opened and read every source I’m including' },
      { id: 'w2.limit', text: 'Every annotation names a limitation' },
      { id: 'w2.gap', text: 'The gap is stated in one or two sentences' }
    ],
    actions: [
      { label: 'Build my search strategy', prompt: '/literature Build a search strategy from my question: concepts, keywords, MeSH terms, and a PubMed search string.' },
      { label: 'Find open-access sources', prompt: 'Search for 5 highly relevant, preferably open-access sources for my question (guidelines, systematic reviews, key primary studies). For each give the DOI and/or PMID exactly as found so I can verify them in the Evidence Library. Do not give any identifier you did not find.' },
      { label: 'Review evidence gap', prompt: 'Using my verified annotated sources, propose a 2–3 sentence evidence-gap statement and say whether my question should change.' }
    ],
    checkpoint: { id: 'w2', label: 'Research question & evidence gap' }
  },
  {
    n: 3, title: 'Study design & assessment', short: 'Methods', tone: 'w3', steps: 'Steps 4–5',
    goal: 'Choose the simplest design that answers the question, and plan the analysis before collecting data.',
    instructions: [
      'Choose a quantitative, qualitative, mixed-methods or QI design.',
      'Define participants, sampling, exposure, comparator and data source.',
      'Define the primary outcome (or qualitative phenomenon) and instruments.',
      'Address validity, reliability, bias and confounders.',
      'Draft the analysis plan and sample-size rationale.'
    ],
    deliverable: 'A one-to-two-page study design, assessment and analysis plan.',
    checklist: [
      { id: 'w3.align', text: 'The primary outcome matches the question' },
      { id: 'w3.plan', text: 'Each outcome has a planned analysis' },
      { id: 'w3.size', text: 'Sample size or feasibility is justified' },
      { id: 'w3.stats', text: 'Biostatistics consult requested if needed' }
    ],
    actions: [
      { label: 'Compare designs', prompt: '/methods Compare 2–3 study designs that could answer my question, with feasibility here, and recommend one.' },
      { label: 'Define outcomes', prompt: '/assessment Propose an exact primary outcome definition, secondary outcomes, and the data dictionary.' },
      { label: 'Explain the statistics', prompt: 'Propose a statistical (or qualitative) analysis plan and a sample-size or feasibility justification for my design, explained simply.' },
      { label: 'Critique methodology', prompt: 'Review my design for confounding, selection bias, information bias and other validity threats. Propose mitigations.' }
    ]
  },
  {
    n: 4, title: 'Mentorship, feasibility & dissemination', short: 'Planning', tone: 'w4', steps: 'Steps 6–8',
    goal: 'Decide whether this can be finished in residency, who helps, and where results go.',
    instructions: [
      'Complete human subjects research training (CITI, or the free OHRP course if your IRB accepts it).',
      'Identify possible faculty mentors and collaborators.',
      'Plan logistics, data access, recruitment and resources; estimate the budget.',
      'Name the main risks and contingencies; make a GO / REVISE / DEFER call.',
      'Choose target meetings or journals and draft an abstract without results.'
    ],
    deliverable: 'A one-page feasibility and dissemination plan with mentor roster and preliminary budget.',
    checklist: [
      { id: 'w4.training', text: 'Human subjects training completed and certificate saved' },
      { id: 'w4.mentor', text: 'A mentor is identified (even if not yet asked)' },
      { id: 'w4.time', text: 'The timeline ends before graduation with a buffer' },
      { id: 'w4.cost', text: 'Every cost has a funding source or no-cost alternative' }
    ],
    actions: [
      { label: 'Draft a mentor request', prompt: 'Draft a short, specific email asking my faculty mentor to supervise this project.' },
      { label: 'Check feasibility', prompt: '/feasibility Assess my project for GO / REVISE / DEFER with specific reasons, and the top 3 risks with fallbacks.' },
      { label: 'Draft my abstract', prompt: '/abstract Draft a preliminary structured abstract with results pending. Do not invent findings.' },
      { label: 'Pick a venue', prompt: 'Suggest 2–3 suitable meetings and journals for this study, including whether each journal is open access. Only state deadlines you actually verified.' }
    ],
    checkpoint: { id: 'w4', label: 'Methodological feasibility' }
  },
  {
    n: 5, title: 'Protocol & IRB draft', short: 'IRB', tone: 'w5', steps: 'Step 9',
    goal: 'Consolidate Weeks 1–4 into a protocol draft ready for faculty review.',
    instructions: [
      'Consolidate earlier work into a coherent protocol in the Proposal editor.',
      'Address risks, benefits, recruitment protections, consent and confidentiality.',
      'Describe data management: minimum necessary data, storage, access, destruction.',
      'List missing information and institutional requirements.',
      'Decide whether to continue as your residency capstone.'
    ],
    deliverable: 'A 3–5 page preliminary protocol, attachments list and draft institutional application.',
    checklist: [
      { id: 'w5.template', text: 'Checked our IRB’s template and forms' },
      { id: 'w5.phi', text: 'PHI plan: minimum necessary, storage, access, destruction' },
      { id: 'w5.consent', text: 'Consent approach or waiver justified' },
      { id: 'w5.mentor', text: 'Mentor meeting scheduled (if going ahead)' }
    ],
    actions: [
      { label: 'Draft protections', prompt: '/irb Propose the risks/benefits, privacy and data security, and consent sections for my protocol. Do not declare an exemption; note what the IRB must decide.' },
      { label: 'Readiness check', prompt: 'Review my whole Blueprint for IRB readiness. List what is missing or weak, most important first.' },
      { label: 'Peer-review critique', prompt: '/critique Give a rigorous peer-review style critique of my proposal.' }
    ],
    checkpoint: { id: 'w5', label: 'IRB-draft readiness' }
  }
];

export const TONE_CLASSES: Record<WeekDef['tone'], { text: string; bg: string; soft: string; border: string }> = {
  w1: { text: 'text-w1-text', bg: 'bg-w1', soft: 'bg-w1-soft', border: 'border-w1' },
  w2: { text: 'text-w2-text', bg: 'bg-w2', soft: 'bg-w2-soft', border: 'border-w2' },
  w3: { text: 'text-w3-text', bg: 'bg-w3', soft: 'bg-w3-soft', border: 'border-w3' },
  w4: { text: 'text-w4-text', bg: 'bg-w4', soft: 'bg-w4-soft', border: 'border-w4' },
  w5: { text: 'text-w5-text', bg: 'bg-w5', soft: 'bg-w5-soft', border: 'border-w5' }
};

/** Fields whose change should flag downstream sections for review. */
export const UPSTREAM_KEYS = ['question', 'revisedQuestion', 'fw.P', 'fw.I', 'fw.C', 'fw.O', 'peo.P', 'peo.E', 'peo.O', 'sp.S', 'sp.PI'];
export const DOWNSTREAM_KEYS = ['design', 'population', 'inclusion', 'exposure', 'comparator', 'primaryOutcome', 'secondaryOutcomes', 'analysis', 'sampleSize', 'instrument'];
