/**
 * Research Design Academy — five-week mini-course content.
 * Readings are standard health-professions-education literature, each checked before inclusion.
 * They are NOT presented as assigned readings from any specific program's syllabus.
 */
import type { Tone } from './fields';

export interface Reading {
  id: string;
  cite: string;
  url: string;
  /** one-line reason to read it */
  why: string;
}

export const READINGS: Record<string, Reading> = {
  kern: { id: 'kern', cite: 'Thomas PA, Kern DE, Hughes MT, Tackett SA, Chen BY, eds. Curriculum Development for Medical Education: A Six-Step Approach. 4th ed. Johns Hopkins University Press; 2022.', url: 'https://www.press.jhu.edu/books/title/12470/curriculum-development-medical-education', why: 'Needs assessment → goals → methods → evaluation.' },
  bordageDawson: { id: 'bordageDawson', cite: 'Bordage G, Dawson B. Experimental study design and grant writing in eight steps and 28 questions. Med Educ. 2003;37(4):376-385.', url: 'https://doi.org/10.1046/j.1365-2923.2003.01468.x', why: 'A step-by-step checklist for an education study.' },
  lingard: { id: 'lingard', cite: 'Lingard L. Joining a conversation: the problem/gap/hook heuristic. Perspect Med Educ. 2015;4(5):252-253.', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4602011/', why: 'Frame problem, gap and hook. Open access.' },
  hulley: { id: 'hulley', cite: 'Browner WS, Newman TB, Cummings SR, et al. Designing Clinical Research. 5th ed. Wolters Kluwer; 2022.', url: 'https://shop.lww.com/Designing-Clinical-Research/p/9781975174408', why: 'Source of the FINER criteria.' },
  cookPurpose: { id: 'cookPurpose', cite: 'Cook DA, Bordage G, Schmidt HG. Description, justification and clarification: a framework for classifying the purposes of research in medical education. Med Educ. 2008;42(2):128-133.', url: 'https://doi.org/10.1111/j.1365-2923.2007.02974.x', why: 'Aim for clarification: why and how it works.' },
  yardley: { id: 'yardley', cite: "Yardley S, Dornan T. Kirkpatrick's levels and education 'evidence'. Med Educ. 2012;46(1):97-106.", url: 'https://doi.org/10.1111/j.1365-2923.2011.04076.x', why: 'Uses and limits of Kirkpatrick levels.' },
  maggio: { id: 'maggio', cite: 'Maggio LA, Sewell JL, Artino AR Jr. The literature review: a foundation for high-quality medical education research. J Grad Med Educ. 2016;8(3):297-303.', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4936839/', why: 'How to find and argue the gap. Open access.' },
  bordage2009: { id: 'bordage2009', cite: 'Bordage G. Conceptual frameworks to illuminate and magnify. Med Educ. 2009;43(4):312-319.', url: 'https://doi.org/10.1111/j.1365-2923.2009.03295.x', why: 'Frameworks focus what you see — and hide.' },
  varpio: { id: 'varpio', cite: 'Varpio L, Paradis E, Uijtdehaage S, Young M. The distinctions between theory, theoretical framework, and conceptual framework. Acad Med. 2020;95(7):989-994.', url: 'https://doi.org/10.1097/ACM.0000000000003075', why: 'Clear definitions of three confusing terms.' },
  taylorHamdy: { id: 'taylorHamdy', cite: 'Taylor DCM, Hamdy H. Adult learning theories: implications for learning and teaching in medical education: AMEE Guide No. 83. Med Teach. 2013;35(11):e1561-e1572.', url: 'https://doi.org/10.3109/0142159X.2013.828153', why: 'Tour of learning theories for clinicians.' },
  knowles: { id: 'knowles', cite: 'Knowles MS, Holton EF III, Swanson RA. The Adult Learner. 8th ed. Routledge; 2015.', url: 'https://search.worldcat.org/search?q=The%20Adult%20Learner%20Knowles%20Holton%20Swanson%208th%20edition', why: 'Andragogy: relevance, self-direction, experience.' },
  kolb: { id: 'kolb', cite: 'Kolb DA. Experiential Learning: Experience as the Source of Learning and Development. 2nd ed. Pearson; 2015.', url: 'https://search.worldcat.org/search?q=Kolb%20Experiential%20Learning%20second%20edition%202015', why: 'Experience → reflection → concept → experiment.' },
  sweller: { id: 'sweller', cite: 'van Merriënboer JJG, Sweller J. Cognitive load theory in health professional education: design principles and strategies. Med Educ. 2010;44(1):85-93.', url: 'https://doi.org/10.1111/j.1365-2923.2009.03498.x', why: 'Design for limited working memory.' },
  lave: { id: 'lave', cite: 'Lave J, Wenger E. Situated Learning: Legitimate Peripheral Participation. Cambridge University Press; 1991.', url: 'https://search.worldcat.org/search?q=Lave%20Wenger%20Situated%20Learning%20Legitimate%20Peripheral%20Participation', why: 'Learning by joining a community of practice.' },
  ryanDeci: { id: 'ryanDeci', cite: 'Ryan RM, Deci EL. Self-determination theory and the facilitation of intrinsic motivation, social development, and well-being. Am Psychol. 2000;55(1):68-78.', url: 'https://doi.org/10.1037/0003-066X.55.1.68', why: 'Autonomy, competence, relatedness.' },
  frye: { id: 'frye', cite: 'Frye AW, Hemmer PA. Program evaluation models and related theories: AMEE Guide No. 67. Med Teach. 2012;34(5):e288-e299.', url: 'https://doi.org/10.3109/0142159X.2012.668637', why: 'Logic models and evaluation models.' },
  ringsted: { id: 'ringsted', cite: "Ringsted C, Hodges B, Scherpbier A. 'The research compass': an introduction to research in medical education: AMEE Guide No. 56. Med Teach. 2011;33(9):695-709.", url: 'https://doi.org/10.3109/0142159X.2011.595436', why: 'Map of education research approaches.' },
  kuper: { id: 'kuper', cite: 'Kuper A, Reeves S, Levinson W. An introduction to reading and appraising qualitative research. BMJ. 2008;337:a288.', url: 'https://doi.org/10.1136/bmj.a288', why: 'Short primer on qualitative quality.' },
  creswell: { id: 'creswell', cite: 'Creswell JW, Plano Clark VL. Designing and Conducting Mixed Methods Research. 3rd ed. SAGE; 2018.', url: 'https://search.worldcat.org/search?q=Creswell%20Plano%20Clark%20Designing%20and%20Conducting%20Mixed%20Methods%20Research%203rd%20edition', why: 'Core mixed-methods designs.' },
  malterud: { id: 'malterud', cite: 'Malterud K, Siersma VD, Guassora AD. Sample size in qualitative interview studies: guided by information power. Qual Health Res. 2016;26(13):1753-1760.', url: 'https://doi.org/10.1177/1049732315617444', why: 'How many interviews are enough.' },
  miller: { id: 'miller', cite: 'Miller GE. The assessment of clinical skills/competence/performance. Acad Med. 1990;65(9 Suppl):S63-S67.', url: 'https://doi.org/10.1097/00001888-199009000-00045', why: "Miller's pyramid." },
  cookBeckman: { id: 'cookBeckman', cite: 'Cook DA, Beckman TJ. Current concepts in validity and reliability for psychometric instruments: theory and application. Am J Med. 2006;119(2):166.e7-166.e16.', url: 'https://doi.org/10.1016/j.amjmed.2005.10.036', why: "Messick's five sources of validity evidence." },
  cookKane: { id: 'cookKane', cite: "Cook DA, Brydges R, Ginsburg S, Hatala R. A contemporary approach to validity arguments: a practical guide to Kane's framework. Med Educ. 2015;49(6):560-575.", url: 'https://doi.org/10.1111/medu.12678', why: 'Build a validity argument step by step.' },
  cookHatala: { id: 'cookHatala', cite: 'Cook DA, Hatala R. Validation of educational assessments: a primer for simulation and beyond. Adv Simul. 2016;1:31.', url: 'https://doi.org/10.1186/s41077-016-0033-y', why: 'Practical validation, open access.' },
  artino: { id: 'artino', cite: 'Artino AR Jr, La Rochelle JS, Dezee KJ, Gehlbach H. Developing questionnaires for educational research: AMEE Guide No. 87. Med Teach. 2014;36(6):463-474.', url: 'https://doi.org/10.3109/0142159X.2014.889814', why: 'Seven steps to a good survey.' },
  sullivanFeinn: { id: 'sullivanFeinn', cite: 'Sullivan GM, Feinn R. Using effect size—or why the P value is not enough. J Grad Med Educ. 2012;4(3):279-282.', url: 'https://doi.org/10.4300/JGME-D-12-00156.1', why: 'Report effect sizes. Open access.' },
  sullivanArtino: { id: 'sullivanArtino', cite: 'Sullivan GM, Artino AR Jr. Analyzing and interpreting data from Likert-type scales. J Grad Med Educ. 2013;5(4):541-542.', url: 'https://doi.org/10.4300/JGME-5-4-18', why: 'Analyzing Likert data. Open access.' },
  braunClarke: { id: 'braunClarke', cite: 'Braun V, Clarke V. Using thematic analysis in psychology. Qual Res Psychol. 2006;3(2):77-101.', url: 'https://doi.org/10.1191/1478088706qp063oa', why: 'Six phases of thematic analysis.' },
  lincolnGuba: { id: 'lincolnGuba', cite: 'Lincoln YS, Guba EG. Naturalistic Inquiry. SAGE; 1985.', url: 'https://search.worldcat.org/search?q=Lincoln%20Guba%20Naturalistic%20Inquiry%201985', why: 'Trustworthiness criteria.' },
  srqr: { id: 'srqr', cite: 'O’Brien BC, Harris IB, Beckman TJ, Reed DA, Cook DA. Standards for reporting qualitative research: a synthesis of recommendations. Acad Med. 2014;89(9):1245-1251.', url: 'https://doi.org/10.1097/ACM.0000000000000388', why: 'SRQR reporting checklist.' },
  belmont: { id: 'belmont', cite: 'National Commission for the Protection of Human Subjects. The Belmont Report. 1979.', url: 'https://www.hhs.gov/ohrp/regulations-and-policy/belmont-report/index.html', why: 'Respect, beneficence, justice.' },
  commonRule: { id: 'commonRule', cite: 'Protection of Human Subjects, 45 CFR Part 46 (Common Rule).', url: 'https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-A/part-46', why: 'Federal rules your IRB applies.' },
  equator: { id: 'equator', cite: 'EQUATOR Network. Reporting guidelines library.', url: 'https://www.equator-network.org/', why: 'Find the right reporting checklist.' },
  bordage2001: { id: 'bordage2001', cite: 'Bordage G. Reasons reviewers reject and accept manuscripts: the strengths and weaknesses in medical education reports. Acad Med. 2001;76(9):889-896.', url: 'https://doi.org/10.1097/00001888-200109000-00010', why: 'Avoid the common fatal flaws.' },
  glassick: { id: 'glassick', cite: "Glassick CE. Boyer's expanded definitions of scholarship, the standards for assessing scholarship, and the elusiveness of the scholarship of teaching. Acad Med. 2000;75(9):877-880.", url: 'https://doi.org/10.1097/00001888-200009000-00007', why: 'Six standards for scholarly work.' },
  biggs: { id: 'biggs', cite: 'Biggs J. Enhancing teaching through constructive alignment. High Educ. 1996;32(3):347-364.', url: 'https://doi.org/10.1007/BF00138871', why: 'Align outcomes, activities, assessment.' },
  hattie: { id: 'hattie', cite: 'Hattie J, Timperley H. The power of feedback. Rev Educ Res. 2007;77(1):81-112.', url: 'https://doi.org/10.3102/003465430298487', why: 'Feed up, feed back, feed forward.' },
  grimes: { id: 'grimes', cite: 'Grimes DA, Schulz KF. An overview of clinical research: the lay of the land. Lancet. 2002;359(9300):57-61.', url: 'https://doi.org/10.1016/S0140-6736(02)07283-5', why: 'One-page map of clinical study designs.' },
  grade: { id: 'grade', cite: 'Guyatt GH, Oxman AD, Vist GE, et al. GRADE: an emerging consensus on rating quality of evidence and strength of recommendations. BMJ. 2008;336(7650):924-926.', url: 'https://pubmed.ncbi.nlm.nih.gov/18436948/', why: 'How certainty of evidence is rated.' },
  sambunjak: { id: 'sambunjak', cite: 'Sambunjak D, Straus SE, Marusić A. Mentoring in academic medicine: a systematic review. JAMA. 2006;296(9):1103-1115.', url: 'https://doi.org/10.1001/jama.296.9.1103', why: 'What mentoring does for trainee research.' },
  strobe: { id: 'strobe', cite: 'von Elm E, Altman DG, Egger M, et al. The Strengthening the Reporting of Observational Studies in Epidemiology (STROBE) statement: guidelines for reporting observational studies. Lancet. 2007;370(9596):1453-1457.', url: 'https://doi.org/10.1016/S0140-6736(07)61602-X', why: 'Reporting checklist for observational studies.' },
  pubmedHelp: { id: 'pubmedHelp', cite: 'National Library of Medicine. PubMed User Guide.', url: 'https://pubmed.ncbi.nlm.nih.gov/help/', why: 'MeSH, filters and search tips.' },
  ohrp: { id: 'ohrp', cite: 'HHS Office for Human Research Protections. Human research protection training (free).', url: 'https://www.hhs.gov/ohrp/education-and-outreach/human-research-protection-training/index.html', why: 'Free option if your IRB accepts it.' },
  icmje: { id: 'icmje', cite: 'International Committee of Medical Journal Editors. Recommendations (authorship criteria).', url: 'https://www.icmje.org/recommendations/', why: 'Who qualifies as an author.' },
  citi: { id: 'citi', cite: 'CITI Program. Human subjects research training.', url: 'https://about.citiprogram.org/', why: 'Training most IRBs require.' }
};

/* ───────── slides ───────── */
export type Slide =
  | { kind: 'big'; title: string; statement: string; caption?: string }
  | { kind: 'cards'; title: string; items: { label: string; text?: string }[]; caption?: string }
  | { kind: 'steps'; title: string; items: { label: string; text?: string }[]; caption?: string }
  | { kind: 'pyramid'; title: string; items: { label: string; text?: string }[]; caption?: string }
  | { kind: 'compare'; title: string; left: { label: string; items: string[] }; right: { label: string; items: string[] }; caption?: string }
  | { kind: 'table'; title: string; columns: string[]; rows: string[][]; caption?: string }
  | { kind: 'case'; title: string; text: string; points: string[] }
  | { kind: 'check'; title: string; question: string; options: { text: string; correct?: boolean; why: string }[] };

/* ───────── assignments ───────── */
export interface AssignmentField {
  key: string;
  label: string;
  hint?: string;
  example?: string;
  kind?: 'text' | 'long' | 'select';
  options?: string[];
  required?: boolean;
  /** fill-in-the-blank sentence frame (inserted on request) */
  starter?: string;
  /** Concierge field to fill when transferring */
  concierge?: string;
}

export interface CourseWeek {
  n: number;
  tone: Tone;
  title: string;
  short: string;
  /** one line */
  promise: string;
  frameworks: string[];
  slides: Slide[];
  /** quick theory review */
  theory: { label: string; text: string }[];
  theoryCites: string[];
  keyIdeas: string[];
  practice: { tip: string; cite: string }[];
  /** optional box for education-research projects */
  eduBox?: { title: string; points: string[]; cites: string[] };
  assignment: { title: string; steps: string[]; output: string; minutes: number; fields: AssignmentField[] };
  readings: string[];
}


export const RUNNING_NAME = 'BP Check';
export const RUNNING_CASE = 'BP Check: do text-message reminders get more postpartum patients with hypertension a blood-pressure check within 10 days of discharge?';

export const COURSE: CourseWeek[] = [
  {
    n: 1, tone: 'w1', title: 'Research story & question', short: 'Question',
    promise: 'Turn something you noticed into one answerable question.',
    frameworks: ['Once upon a time story', 'PICOT', 'PEO / SPIDER (qualitative)', 'FINER'],
    theory: [
      { label: 'Start with a story', text: 'A story makes the problem, the gap and why it matters visible before you lock in wording.' },
      { label: 'Problem → gap → hook', text: 'What is wrong, what we don’t know, and why it matters now.' },
      { label: 'Structure the question', text: 'PICOT for comparisons; PEO or SPIDER for experiences. Each element later becomes a design choice.' },
      { label: 'Test it with FINER', text: 'Feasible, Interesting, Novel, Ethical, Relevant — the classic screen for a good question.' }
    ],
    theoryCites: ['lingard', 'hulley', 'cookPurpose'],
    slides: [
      { kind: 'steps', title: 'Once upon a time…', items: [{ label: 'We believed', text: 'Current practice' }, { label: 'I wondered', text: 'What bothered you' }, { label: 'I propose', text: 'What you’ll study' }, { label: 'I anticipate', text: 'Your best guess' }, { label: 'This will change', text: 'Why it matters' }] },
      { kind: 'compare', title: 'Problem ≠ question', left: { label: 'Problem', items: ['Many postpartum patients miss BP checks'] }, right: { label: 'Question', items: ['Do text reminders increase BP checks within 10 days vs usual care?'] } },
      { kind: 'cards', title: 'PICOT', items: [{ label: 'P', text: 'Postpartum patients with hypertension' }, { label: 'I', text: 'Text reminders' }, { label: 'C', text: 'Usual discharge instructions' }, { label: 'O', text: 'BP check done' }, { label: 'T', text: 'Within 10 days' }] },
      { kind: 'compare', title: 'Not every question is PICOT', left: { label: 'Quantitative', items: ['Does it work?', 'How much?', 'PICOT'] }, right: { label: 'Qualitative', items: ['Why? How? What is it like?', 'PEO or SPIDER'] } },
      { kind: 'steps', title: 'FINER', items: [{ label: 'F', text: 'Feasible' }, { label: 'I', text: 'Interesting' }, { label: 'N', text: 'Novel' }, { label: 'E', text: 'Ethical' }, { label: 'R', text: 'Relevant' }], caption: 'Browner et al., Designing Clinical Research' },
      { kind: 'case', title: 'Running example', text: RUNNING_CASE, points: ['Story: patients readmitted with severe BP', 'Question: PICOT above', 'FINER: feasible — EHR data, one hospital'] },
      { kind: 'check', title: 'Quick check', question: 'Which question is ready to study?', options: [
        { text: 'How can we improve postpartum care?', why: 'Too broad to answer.' },
        { text: 'Do text reminders increase 10-day BP checks vs usual care in postpartum patients with hypertension?', correct: true, why: 'Every PICOT element is named and measurable.' },
        { text: 'Do patients like text messages?', why: 'Measures preference, not the outcome that matters.' }
      ] }
    ],
    keyIdeas: ['Write the story first; the question comes out of it.', 'Name every PICOT (or PEO) element.', 'Choose an outcome you can actually get data for.', 'Keep 1–2 backup questions.'],
    practice: [{ tip: 'Check FINER with a mentor before investing time.', cite: 'hulley' }, { tip: 'Glance at the literature now — 2 minutes can reshape your question (see Week 2).', cite: 'maggio' }],
    assignment: {
      title: 'Research story and question',
      steps: ['Fill in the 5-line story.', 'Write one PICOT (or PEO) question.', 'Run a FINER check.'],
      output: 'A 5-line story, one question, a FINER line.',
      minutes: 30,
      fields: [
        { key: 'story.believed', label: 'Once upon a time, we believed…', kind: 'long', required: true, starter: 'Once upon a time, we believed that ', example: '…giving postpartum patients written BP instructions was enough.', concierge: 'story.believed' },
        { key: 'story.wondered', label: 'But I wondered whether…', kind: 'long', required: true, starter: 'But I wondered whether ', example: '…many never get their BP checked after discharge.', concierge: 'story.wondered' },
        { key: 'story.propose', label: 'So I propose to investigate…', kind: 'long', required: true, starter: 'So I propose to investigate ', example: '…whether text reminders increase BP checks within 10 days.', concierge: 'story.propose' },
        { key: 'story.anticipate', label: 'I anticipate discovering…', kind: 'long', starter: 'I anticipate discovering that ', example: '…more patients get checked with reminders.', concierge: 'story.anticipate' },
        { key: 'story.change', label: 'And hopefully this will change…', kind: 'long', starter: 'And hopefully this will change ', example: '…our discharge workflow and reduce readmissions.', concierge: 'story.change' },
        { key: 'framework', label: 'Question type', kind: 'select', options: ['PICOT', 'PEO', 'SPIDER'], required: true, concierge: 'framework' },
        { key: 'question', label: 'Research question', kind: 'long', required: true, hint: 'One sentence.', starter: 'In [population], does [intervention] compared with [comparison] change [outcome] within [time]?', example: 'In postpartum patients with hypertension, do text reminders compared with usual instructions increase BP checks within 10 days of discharge?', concierge: 'question' },
        { key: 'finer', label: 'FINER check', kind: 'long', required: true, starter: 'F: \nI: \nN: \nE: \nR: ', example: 'F: EHR data, ~200 patients/yr · I: department priority · N: few local data · E: minimal risk · R: guidelines call for early postpartum BP checks' },
        { key: 'backups', label: 'Backup question (optional)', kind: 'long', concierge: 'backups' }
      ]
    },
    readings: ['lingard', 'hulley', 'cookPurpose', 'bordageDawson']
  },
  {
    n: 2, tone: 'w2', title: 'Literature search & evidence gap', short: 'Literature',
    promise: 'Find what is known, name the gap, sharpen the question.',
    frameworks: ['Concepts → keywords → MeSH', 'Boolean AND / OR', 'Evidence hierarchy', 'Annotated bibliography'],
    theory: [
      { label: 'Search is a method', text: 'Turn each PICOT element into a concept, list synonyms and MeSH terms, combine with OR inside and AND between.' },
      { label: 'Not all evidence is equal', text: 'Guidelines and systematic reviews first; then trials and cohorts. GRADE rates how certain the evidence is.' },
      { label: 'Read to find the gap', text: 'A gap is what the best evidence still can’t answer — for your population, setting or outcome.' },
      { label: 'Verify every citation', text: 'AI tools can invent references. Confirm each one in PubMed or by DOI and read it yourself.' }
    ],
    theoryCites: ['maggio', 'grade', 'pubmedHelp'],
    slides: [
      { kind: 'steps', title: 'From question to search', items: [{ label: 'Concepts', text: 'One per PICOT element' }, { label: 'Synonyms', text: 'Plus MeSH terms' }, { label: 'Combine', text: 'OR inside, AND between' }, { label: 'Log it', text: 'Date, database, hits' }] },
      { kind: 'table', title: 'Search string example', columns: ['Concept', 'Terms'], rows: [['Postpartum', 'postpartum OR puerperium OR Postpartum Period[mh]'], ['Hypertension', 'hypertension OR preeclampsia OR Hypertension, Pregnancy-Induced[mh]'], ['Reminders', 'text message* OR SMS OR Reminder Systems[mh]']], caption: 'PubMed User Guide' },
      { kind: 'pyramid', title: 'Where to look first', items: [{ label: 'Guidelines', text: 'ACOG, USPSTF' }, { label: 'Systematic reviews', text: 'Cochrane' }, { label: 'Trials & cohorts', text: 'Primary studies' }, { label: 'Opinion & case reports', text: 'Least certain' }], caption: 'Certainty rated with GRADE (Guyatt et al. 2008)' },
      { kind: 'cards', title: 'Annotate each source', items: [{ label: 'What they did', text: 'Design, sample' }, { label: 'What they found', text: 'One line' }, { label: 'Limitation', text: 'Always one' }, { label: 'Why it matters', text: 'For your question' }] },
      { kind: 'compare', title: 'Gap → better question', left: { label: 'Before', items: ['Do reminders help postpartum BP follow-up?'] }, right: { label: 'After reading (hypothetical)', items: ['Say most trials used home BP cuffs, not texts alone.', 'New focus: texts alone, in our clinic.'] } },
      { kind: 'case', title: 'Running example', text: RUNNING_CASE, points: ['4 key sources: 1 guideline, 1 review, 2 trials', 'Gap: texts alone, safety-net population', 'Question narrowed to our clinic'] },
      { kind: 'check', title: 'Quick check', question: 'An AI tool gives you a perfect-looking reference. What next?', options: [
        { text: 'Cite it — the formatting is correct.', why: 'Formatting proves nothing; references can be invented.' },
        { text: 'Find it in PubMed or by DOI and read it before citing.', correct: true, why: 'Verify existence and content yourself.' },
        { text: 'Ask the AI if it is real.', why: 'The same tool can confidently confirm a fake.' }
      ] }
    ],
    keyIdeas: ['Search systematically and keep a log.', 'Start with guidelines and reviews.', 'Annotate: what, found, limitation, relevance.', 'Let the gap reshape your question.'],
    practice: [{ tip: 'Build the literature review to argue a gap, not to list papers.', cite: 'maggio' }, { tip: 'Ask a medical librarian — it’s free and fast.', cite: 'pubmedHelp' }],
    assignment: {
      title: 'Mini literature review',
      steps: ['Run one logged PubMed search.', 'Annotate 3–5 key sources.', 'State the gap and revise the question.'],
      output: 'Search string, 3–5 annotations, gap, revised question.',
      minutes: 30,
      fields: [
        { key: 'search', label: 'PubMed search string', kind: 'long', required: true, hint: 'Use the button below to run it.', starter: '(concept 1 terms) AND (concept 2 terms) AND (concept 3 terms)', example: '(postpartum OR puerperium) AND (hypertension OR preeclampsia) AND ("text message*" OR SMS)' },
        { key: 'searchLog', label: 'Search log', kind: 'text', starter: 'Date: · Database: PubMed · Hits: · Kept: ', example: 'Oct 30 · PubMed · 84 hits · 5 kept' },
        { key: 'source1', label: 'Source 1', kind: 'long', required: true, starter: 'Citation + DOI/PMID: \nWhat they did: \nFound: \nLimitation: \nWhy it matters: ', example: 'Author, year (PMID) · RCT, n=… · texting increased BP checks · single center · supports our intervention' },
        { key: 'source2', label: 'Source 2', kind: 'long', required: true, starter: 'Citation + DOI/PMID: \nWhat they did: \nFound: \nLimitation: \nWhy it matters: ' },
        { key: 'source3', label: 'Source 3', kind: 'long', required: true, starter: 'Citation + DOI/PMID: \nWhat they did: \nFound: \nLimitation: \nWhy it matters: ' },
        { key: 'source4', label: 'Source 4 (optional)', kind: 'long', starter: 'Citation + DOI/PMID: \nWhat they did: \nFound: \nLimitation: \nWhy it matters: ' },
        { key: 'source5', label: 'Source 5 (optional)', kind: 'long', starter: 'Citation + DOI/PMID: \nWhat they did: \nFound: \nLimitation: \nWhy it matters: ' },
        { key: 'gap', label: 'Evidence gap', kind: 'long', required: true, starter: 'We know that … but we do not know whether … in … .', concierge: 'gap' },
        { key: 'revisedQuestion', label: 'Revised question (or why it stays)', kind: 'long', required: true, concierge: 'revisedQuestion' }
      ]
    },
    readings: ['maggio', 'grade', 'pubmedHelp', 'lingard']
  },
  {
    n: 3, tone: 'w3', title: 'Study design, measures & analysis', short: 'Design',
    promise: 'Pick the simplest design that answers your question — and plan the analysis now.',
    frameworks: ['Design hierarchy', 'Bias & confounding', 'Validity & reliability', 'Effect size'],
    theory: [
      { label: 'The question picks the design', text: 'Descriptive → survey or chart review. Association → cohort, case-control. Does it work? → trial or controlled pre/post. Why/how? → qualitative.' },
      { label: 'Three rivals to any result', text: 'Chance, bias and confounding. Good design limits each.' },
      { label: 'Measure well', text: 'Use a validated instrument when one exists; define the outcome exactly.' },
      { label: 'Plan analysis first', text: 'Match each outcome to an analysis; report effect size and confidence intervals, not just P.' }
    ],
    theoryCites: ['grimes', 'hulley', 'sullivanFeinn'],
    eduBox: {
      title: 'If your study is about teaching or learning',
      points: ['Name a learning theory that explains why it should work (e.g., Kolb’s experiential learning, cognitive load theory).', 'Aim above satisfaction: Kirkpatrick levels and Miller’s pyramid.', 'Gather validity evidence for rubrics and surveys.'],
      cites: ['varpio', 'taylorHamdy', 'yardley', 'miller', 'cookBeckman', 'ringsted']
    },
    slides: [
      { kind: 'table', title: 'Match design to question', columns: ['You ask…', 'Design'], rows: [['How common?', 'Survey, chart review'], ['What is linked to it?', 'Cohort, case-control'], ['Does it work?', 'Randomized, controlled pre/post'], ['Why? How?', 'Interviews, focus groups']], caption: 'Grimes & Schulz 2002' },
      { kind: 'cards', title: 'Three rivals', items: [{ label: 'Chance', text: 'Too few patients' }, { label: 'Bias', text: 'Who got in, how measured' }, { label: 'Confounding', text: 'Something else explains it' }] },
      { kind: 'compare', title: 'Define the outcome exactly', left: { label: 'Vague', items: ['“BP follow-up”'] }, right: { label: 'Exact', items: ['Any documented BP reading 3–10 days after discharge, from the EHR'] } },
      { kind: 'table', title: 'Match analysis to outcome', columns: ['Outcome', 'Common analysis'], rows: [['Yes/no, two groups', 'Chi-square; risk difference'], ['Number, two groups', 't-test or Mann-Whitney'], ['Adjusting for confounders', 'Regression'], ['Interview text', 'Thematic analysis']], caption: 'Ask a biostatistician early' },
      { kind: 'cards', title: 'Surveys that work', items: [{ label: 'Use a validated one', text: 'If it exists, cite it' }, { label: 'Else: 7 steps', text: 'Review, interview, draft, expert review, pilot' }, { label: 'Likert data', text: 'Analyze thoughtfully' }], caption: 'Artino et al. 2014; Sullivan & Artino 2013' },
      { kind: 'case', title: 'Running example', text: RUNNING_CASE, points: ['Design: pre/post with historical control', 'Outcome: documented BP 3–10 days', 'Analysis: risk difference + 95% CI, adjust for parity, race, insurance'] },
      { kind: 'check', title: 'Quick check', question: 'Reminder group was also enrolled after a new BP clinic opened. The problem?', options: [
        { text: 'Chance', why: 'The issue is not sample size.' },
        { text: 'Confounding by time (co-intervention)', correct: true, why: 'The new clinic could explain the change.' },
        { text: 'Measurement error', why: 'The outcome was measured the same way.' }
      ] }
    ],
    keyIdeas: ['Simplest design that answers the question.', 'Write the outcome so two people would measure it the same way.', 'Every outcome gets a planned analysis.', 'See a biostatistician before collecting data.'],
    practice: [{ tip: 'Report effect sizes with confidence intervals.', cite: 'sullivanFeinn' }, { tip: 'Building a survey? Follow the seven steps.', cite: 'artino' }],
    assignment: {
      title: 'Design and analysis plan',
      steps: ['Choose a design and say why.', 'Define participants, intervention and exact outcome.', 'Match an analysis to the outcome.'],
      output: 'One page: design, people, outcome, analysis.',
      minutes: 30,
      fields: [
        { key: 'design', label: 'Design', kind: 'select', required: true, options: ['Retrospective cohort / chart review', 'Case-control', 'Cross-sectional survey', 'Prospective observational', 'Pre–post / quality improvement', 'Randomized trial', 'Nonrandomized intervention', 'Educational pre–post', 'Qualitative (interviews / focus groups)', 'Mixed methods', 'Other'], concierge: 'design' },
        { key: 'rationale', label: 'Why this design', kind: 'long', required: true, starter: 'This design fits because … . A stronger design is not feasible because … .', concierge: 'rationale' },
        { key: 'population', label: 'Participants', kind: 'long', required: true, starter: 'Include: … Exclude: … Expected number: …', example: 'Include: postpartum patients with a hypertensive disorder, delivered here. Exclude: no phone. ~200/year.', concierge: 'population' },
        { key: 'exposure', label: 'Intervention / exposure & comparison', kind: 'long', required: true, starter: 'Intervention: … Compared with: …', concierge: 'exposure' },
        { key: 'primaryOutcome', label: 'Primary outcome (exact)', kind: 'long', required: true, starter: 'The proportion of … with … measured by … at … .', concierge: 'primaryOutcome' },
        { key: 'dataSource', label: 'Data source / instrument', kind: 'text', required: true, example: 'EHR chart review; REDCap form', concierge: 'dataSource' },
        { key: 'analysis', label: 'Analysis plan', kind: 'long', required: true, starter: 'We will compare … using … and report … with 95% confidence intervals. We will adjust for … .', concierge: 'analysis' },
        { key: 'sampleSize', label: 'Sample size or feasibility', kind: 'long', starter: 'We expect … participants in … months, which is enough to … / a feasibility sample because … .', concierge: 'sampleSize' },
        { key: 'bias', label: 'Main bias + how you’ll limit it', kind: 'long', concierge: 'bias' }
      ]
    },
    readings: ['grimes', 'hulley', 'sullivanFeinn', 'sullivanArtino', 'artino', 'strobe']
  },
  {
    n: 4, tone: 'w4', title: 'Mentor, logistics & dissemination', short: 'Plan',
    promise: 'Make sure it can be finished — and shared.',
    frameworks: ['Mentorship', 'Feasibility: GO / REVISE / DEFER', 'Human subjects training', 'Scholarship standards'],
    theory: [
      { label: 'Mentors change outcomes', text: 'Mentored trainees report more research productivity and career satisfaction.' },
      { label: 'Ethics starts with training', text: 'Belmont principles — respect, beneficence, justice — underlie the CITI or OHRP course your IRB requires.' },
      { label: 'Feasibility is a decision', text: 'Time, data access, people and money. Decide GO, REVISE or DEFER honestly.' },
      { label: 'Scholarship is public', text: 'Work becomes scholarship when it is shared and peer reviewed.' }
    ],
    theoryCites: ['sambunjak', 'belmont', 'glassick'],
    slides: [
      { kind: 'cards', title: 'A good mentor', items: [{ label: 'Content or method', text: 'Knows your topic or your design' }, { label: 'Available', text: 'Regular short meetings' }, { label: 'Track record', text: 'Has finished projects' }], caption: 'Sambunjak et al. 2006' },
      { kind: 'steps', title: 'Human subjects training', items: [{ label: 'Ask your IRB', text: 'Which course?' }, { label: 'Take it', text: 'CITI (often free via institution) or OHRP' }, { label: 'Save certificate', text: 'You’ll attach it' }] },
      { kind: 'cards', title: 'Feasibility check', items: [{ label: 'Time', text: 'Done before graduation?' }, { label: 'Data', text: 'Access approved?' }, { label: 'People', text: 'Who helps?' }, { label: 'Money', text: 'Any costs covered?' }] },
      { kind: 'compare', title: 'GO / REVISE / DEFER', left: { label: 'GO', items: ['Data, mentor, time all in place'] }, right: { label: 'REVISE or DEFER', items: ['Shrink scope, change data source, or save for later'] } },
      { kind: 'steps', title: 'Share it', items: [{ label: 'Abstract', text: 'Regional or national meeting' }, { label: 'Poster', text: 'Department research day' }, { label: 'Paper', text: 'Peer-reviewed journal' }], caption: 'Authorship per ICMJE' },
      { kind: 'case', title: 'Running example', text: RUNNING_CASE, points: ['Mentor: MFM faculty + nurse navigator', 'Timeline: IRB Jan, data Mar–Aug, abstract Oct', 'Call: GO'] },
      { kind: 'check', title: 'Quick check', question: 'Your data needs a new IT report that may take 6 months. Best call?', options: [
        { text: 'GO — it will work out.', why: 'Ignores a real risk.' },
        { text: 'REVISE — use data you can get now, or shrink scope.', correct: true, why: 'Keeps the project finishable.' },
        { text: 'Abandon research entirely.', why: 'Too drastic; revise first.' }
      ] }
    ],
    keyIdeas: ['Ask a mentor early, with a one-page plan.', 'Finish CITI/OHRP training now.', 'Build a timeline backward from graduation.', 'Pick a meeting deadline to aim for.'],
    practice: [{ tip: 'Agree on authorship roles at the start.', cite: 'icmje' }, { tip: 'Meet your mentor briefly and regularly.', cite: 'sambunjak' }],
    assignment: {
      title: 'Feasibility and dissemination plan',
      steps: ['Complete training and name a mentor.', 'Sketch logistics and a timeline.', 'Make a GO/REVISE/DEFER call and pick a venue.'],
      output: 'Training done, mentor, timeline, call, venue.',
      minutes: 30,
      fields: [
        { key: 'training.course', label: 'Human subjects training', kind: 'text', required: true, starter: 'Course: … Completed on: …', example: 'CITI Biomedical Research — Basic, completed Nov 2', concierge: 'training.course' },
        { key: 'mentor.name', label: 'Mentor (even if not asked yet)', kind: 'text', required: true, concierge: 'mentor.name' },
        { key: 'mentor.why', label: 'Why this mentor', kind: 'long', concierge: 'mentor.why' },
        { key: 'logistics', label: 'Data access, people, costs', kind: 'long', required: true, starter: 'Data: … People: … Costs: … (funded by …)', concierge: 'logistics.resources' },
        { key: 'timeline', label: 'Timeline', kind: 'long', required: true, starter: 'IRB: … · Data: … · Analysis: … · Abstract: … · Paper: …', concierge: 'timeline' },
        { key: 'risksSummary', label: 'Biggest risk + fallback', kind: 'long', starter: 'Risk: … Fallback: …', concierge: 'risksSummary' },
        { key: 'feasibility', label: 'Feasibility call', kind: 'select', options: ['GO', 'REVISE', 'DEFER'], required: true, concierge: 'feasibility' },
        { key: 'dissemination', label: 'Where you’ll share it', kind: 'text', required: true, example: 'ACOG Annual Meeting abstract; department research day' }
      ]
    },
    readings: ['sambunjak', 'citi', 'ohrp', 'belmont', 'icmje', 'glassick']
  },
  {
    n: 5, tone: 'w5', title: 'Protocol & IRB draft', short: 'IRB',
    promise: 'Pull Weeks 1–4 into a protocol your mentor and IRB can review.',
    frameworks: ['Belmont principles', 'Common Rule review levels', 'Consent & privacy', 'Reporting guidelines'],
    theory: [
      { label: 'Belmont, applied', text: 'Respect → consent. Beneficence → minimize risk. Justice → fair selection.' },
      { label: 'Your IRB decides the level', text: 'Exempt, expedited or full board — you propose, the IRB determines.' },
      { label: 'Minimum necessary data', text: 'Collect only what you need; plan storage, access and destruction.' },
      { label: 'Write for the reader', text: 'Common rejection reasons: weak question, poor design, unclear methods. Fix them now.' }
    ],
    theoryCites: ['belmont', 'commonRule', 'bordage2001'],
    slides: [
      { kind: 'cards', title: 'Belmont principles', items: [{ label: 'Respect for persons', text: 'Informed, voluntary consent' }, { label: 'Beneficence', text: 'Benefits outweigh risks' }, { label: 'Justice', text: 'Fair burden and benefit' }], caption: 'The Belmont Report, 1979' },
      { kind: 'pyramid', title: 'Review levels', items: [{ label: 'Full board', text: 'More than minimal risk' }, { label: 'Expedited', text: 'Minimal risk, listed categories' }, { label: 'Exempt', text: 'Certain minimal-risk categories' }], caption: '45 CFR 46 — the IRB decides, not you' },
      { kind: 'cards', title: 'Protect data', items: [{ label: 'Minimum', text: 'Only needed fields' }, { label: 'Secure', text: 'Approved storage (e.g., REDCap)' }, { label: 'Code it', text: 'Key kept separately' }, { label: 'Destroy', text: 'Say when' }] },
      { kind: 'steps', title: 'Protocol outline', items: [{ label: 'Background & gap' }, { label: 'Question' }, { label: 'Methods' }, { label: 'Analysis' }, { label: 'Ethics & privacy' }, { label: 'Timeline' }] },
      { kind: 'cards', title: 'Avoid common rejections', items: [{ label: 'Unclear question' }, { label: 'Design can’t answer it' }, { label: 'Outcome not defined' }, { label: 'No analysis plan' }], caption: 'Bordage 2001' },
      { kind: 'case', title: 'Running example', text: RUNNING_CASE, points: ['Likely expedited or exempt — IRB decides', 'Waiver of consent requested for chart review', 'Data in REDCap, coded, destroyed after 5 years'] },
      { kind: 'check', title: 'Quick check', question: 'Who decides if your study is exempt?', options: [
        { text: 'You, the investigator', why: 'Investigators propose; they don’t decide.' },
        { text: 'Your mentor', why: 'Mentors advise; the IRB determines.' },
        { text: 'The IRB', correct: true, why: 'Only the IRB (or its designee) makes the determination.' }
      ] }
    ],
    keyIdeas: ['Reuse Weeks 1–4 — don’t start over.', 'Propose a review level; let the IRB decide.', 'Write a clear privacy plan.', 'List what is still missing.'],
    practice: [{ tip: 'Check your draft against common reasons for rejection.', cite: 'bordage2001' }, { tip: 'Use the right reporting checklist from the start.', cite: 'equator' }],
    assignment: {
      title: 'Protocol and IRB draft',
      steps: ['Fill the ethics fields.', 'List what is missing.', 'Export the full protocol.'],
      output: 'Exportable protocol draft (Weeks 1–5).',
      minutes: 30,
      fields: [
        { key: 'reviewCategory', label: 'Likely review level (IRB decides)', kind: 'text', required: true, starter: 'Likely … because … ; for IRB determination.', concierge: 'reviewCategory' },
        { key: 'risksBenefits', label: 'Risks & benefits', kind: 'long', required: true, starter: 'Risks: … Minimized by: … Benefits: …', concierge: 'risksBenefits' },
        { key: 'consent', label: 'Consent approach', kind: 'long', required: true, starter: 'We will obtain … consent / request a waiver because … .', concierge: 'consent' },
        { key: 'privacy', label: 'Privacy & data plan', kind: 'long', required: true, starter: 'Data collected: … Stored in: … Access: … Destroyed: …', concierge: 'privacy' },
        { key: 'outstanding', label: 'Still missing', kind: 'long', required: true, starter: 'Forms: … Approvals: … Decisions: …', concierge: 'outstanding' },
        { key: 'decision', label: 'Continue as capstone?', kind: 'select', options: ['Go — make it my capstone', 'Revise first', 'No — not this project'], required: true, concierge: 'decision' }
      ]
    },
    readings: ['belmont', 'commonRule', 'citi', 'bordage2001', 'equator', 'strobe', 'srqr']
  }
];

/** How the course itself is designed (shown on the Academy home). */
export const COURSE_DESIGN = [
  { label: 'Built backward', text: 'Outcomes, activities and assignments align.', cite: 'biggs' },
  { label: 'Six-step design', text: 'Needs → goals → methods → evaluation.', cite: 'kern' },
  { label: 'Small chunks', text: 'One idea per slide to limit load.', cite: 'sweller' },
  { label: 'Feedback loops', text: 'Weekly submissions with faculty feedback.', cite: 'hattie' }
];
