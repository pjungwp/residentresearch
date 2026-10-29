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
  keyIdeas: string[];
  practice: { tip: string; cite: string }[];
  assignment: { title: string; steps: string[]; output: string; fields: AssignmentField[] };
  readings: string[];
}

const KIRK = ['Kirkpatrick 1 · Reaction', 'Kirkpatrick 2 · Learning (knows / knows how)', 'Kirkpatrick 2 · Skills (shows how)', 'Kirkpatrick 3 · Behavior (does)', 'Kirkpatrick 4 · Results / patient outcomes'];
const THEORIES = ['Adult learning (Knowles)', 'Experiential learning (Kolb)', 'Cognitive load theory', 'Constructivism', 'Situated learning / communities of practice', 'Self-determination theory', 'Deliberate practice', 'Other'];

export const RUNNING_CASE = 'SimPatient: AI-simulated patient encounters with rubric feedback for third-year clerkship students';

export const COURSE: CourseWeek[] = [
  {
    n: 1, tone: 'w1', title: 'From problem to research question', short: 'Question',
    promise: 'Turn a teaching problem into one sharp question.',
    frameworks: ['Problem → gap → hook', 'FINER', 'PICO(T)', 'Kirkpatrick levels'],
    slides: [
      { kind: 'steps', title: 'What makes it researchable?', items: [{ label: 'Problem', text: 'Something real is not working' }, { label: 'Gap', text: 'We don’t know the answer' }, { label: 'Hook', text: 'Why it matters now' }, { label: 'Question', text: 'One answerable sentence' }], caption: 'Lingard 2015' },
      { kind: 'compare', title: 'Problem ≠ question', left: { label: 'Problem', items: ['Students struggle with hard conversations', 'Too few practice chances'] }, right: { label: 'Question', items: ['Does practice with AI-simulated patients improve communication scores vs usual teaching?'] } },
      { kind: 'steps', title: 'FINER', items: [{ label: 'F', text: 'Feasible' }, { label: 'I', text: 'Interesting' }, { label: 'N', text: 'Novel' }, { label: 'E', text: 'Ethical' }, { label: 'R', text: 'Relevant' }], caption: 'Browner et al., Designing Clinical Research' },
      { kind: 'pyramid', title: 'Choose outcomes that matter', items: [{ label: '4 · Results', text: 'Patients, systems' }, { label: '3 · Behavior', text: 'Changed practice' }, { label: '2 · Learning', text: 'Knowledge, skills' }, { label: '1 · Reaction', text: 'Satisfaction' }], caption: 'Higher = more meaningful, harder to measure (Kirkpatrick; Yardley & Dornan 2012)' },
      { kind: 'compare', title: 'Weak vs strong question', left: { label: 'Weak', items: ['Do students like simulation?', 'Is AI good for teaching?'] }, right: { label: 'Strong', items: ['In third-year clerkship students, do 3 AI-simulated encounters with rubric feedback improve OSCE communication scores vs usual teaching over 6 weeks?'] } },
      { kind: 'case', title: 'Running example', text: RUNNING_CASE, points: ['Problem: few safe chances to practice', 'Gap: little evidence AI patients improve skills', 'Question: does SimPatient raise OSCE communication scores?'] },
      { kind: 'check', title: 'Quick check', question: 'Which is the strongest research question?', options: [
        { text: 'Do residents enjoy the new curriculum?', why: 'Reaction only, and no comparison.' },
        { text: 'In PGY-1s, does weekly feedback coaching improve milestone ratings vs usual feedback over 6 months?', correct: true, why: 'Population, intervention, comparator, outcome and time are all named.' },
        { text: 'How can we improve resident education?', why: 'Too broad to answer.' }
      ] }
    ],
    keyIdeas: ['A problem is what bothers you; a question is what you can answer.', 'Name the gap in one sentence before you design anything.', 'Pick the highest outcome level you can measure well.', 'Aim to explain why, not only whether (clarification research).'],
    practice: [{ tip: 'Write the question first, then check FINER with a mentor.', cite: 'hulley' }, { tip: 'Use problem–gap–hook to frame your introduction.', cite: 'lingard' }],
    assignment: {
      title: 'Research question and rationale',
      steps: ['Describe the problem.', 'Name the gap and purpose.', 'Write one question and check FINER.'],
      output: '1 page: problem, gap, purpose, question.',
      fields: [
        { key: 'problem', label: 'Problem statement', kind: 'long', required: true, hint: '2–3 sentences: what, who, why it matters.', example: 'Clerkship students get few supervised chances to practice difficult conversations, and OSCE communication scores lag.', concierge: 'problem' },
        { key: 'gap', label: 'Evidence gap', kind: 'long', required: true, hint: 'What is known, what is missing.', example: 'Simulation helps, but whether AI-simulated patients improve observed skills is unclear.', concierge: 'gap' },
        { key: 'purpose', label: 'Study purpose', kind: 'long', required: true, hint: 'The purpose of this study is to…', example: 'To test whether AI-simulated encounters with rubric feedback improve communication skills.', concierge: 'purpose' },
        { key: 'question', label: 'Research question', kind: 'long', required: true, hint: 'One sentence. Name population, intervention, comparison, outcome.', example: 'In third-year clerkship students, do three AI-simulated encounters with rubric feedback improve OSCE communication scores compared with usual teaching?', concierge: 'question' },
        { key: 'outcomeLevel', label: 'Outcome level', kind: 'select', options: KIRK, required: true, concierge: 'outcomeLevel' },
        { key: 'finer.f', label: 'Feasible?', kind: 'text', required: true, example: 'Yes — 30 students per block; existing OSCE.', concierge: 'finer.f' },
        { key: 'finer.i', label: 'Interesting?', kind: 'text', concierge: 'finer.i' },
        { key: 'finer.n', label: 'Novel?', kind: 'text', concierge: 'finer.n' },
        { key: 'finer.e', label: 'Ethical?', kind: 'text', concierge: 'finer.e' },
        { key: 'finer.r', label: 'Relevant?', kind: 'text', concierge: 'finer.r' }
      ]
    },
    readings: ['lingard', 'hulley', 'cookPurpose', 'yardley', 'maggio', 'bordageDawson']
  },
  {
    n: 2, tone: 'w2', title: 'Learning theory & conceptual frameworks', short: 'Theory',
    promise: 'Explain why your intervention should work.',
    frameworks: ['Adult learning', 'Kolb', 'Cognitive load', 'Constructivism', 'Situated learning', 'Self-determination', 'Logic model'],
    slides: [
      { kind: 'big', title: 'Why theory?', statement: 'Theory tells you why it should work — and what to measure.', caption: 'Frameworks illuminate and magnify (Bordage 2009)' },
      { kind: 'cards', title: 'Six theories', items: [
        { label: 'Adult learning', text: 'Relevance, self-direction' },
        { label: 'Experiential (Kolb)', text: 'Do → reflect → try again' },
        { label: 'Cognitive load', text: 'Working memory is limited' },
        { label: 'Constructivism', text: 'Build on prior knowledge' },
        { label: 'Situated learning', text: 'Learn by joining the team' },
        { label: 'Self-determination', text: 'Autonomy, competence, relatedness' }
      ] },
      { kind: 'table', title: 'Match theory to intervention', columns: ['Intervention', 'Theory', 'Predicts'], rows: [
        ['Simulation + debrief', 'Kolb', 'Reflection improves performance'],
        ['Worked examples', 'Cognitive load', 'Less overload, faster skill'],
        ['Learner-chosen goals', 'Self-determination', 'More motivation'],
        ['Team-based clinic roles', 'Situated learning', 'Stronger professional identity']
      ] },
      { kind: 'steps', title: 'Logic model', items: [{ label: 'Inputs', text: 'People, time, tools' }, { label: 'Activities', text: 'What you do' }, { label: 'Outputs', text: 'What you count' }, { label: 'Outcomes', text: 'What changes' }], caption: 'Frye & Hemmer 2012' },
      { kind: 'compare', title: 'Three terms', left: { label: 'Theory / theoretical framework', items: ['A tested explanation', 'One theory guides the study'] }, right: { label: 'Conceptual framework', items: ['Your argument', 'How problem, theory, design and outcomes connect'] }, caption: 'Varpio et al. 2020' },
      { kind: 'case', title: 'Running example', text: RUNNING_CASE, points: ['Theory: Kolb experiential learning', 'Mechanism: practice + rubric feedback + reflection', 'Outcome: observed communication skill'] },
      { kind: 'check', title: 'Quick check', question: 'Your intervention breaks a complex skill into worked examples. Which theory fits best?', options: [
        { text: 'Cognitive load theory', correct: true, why: 'Worked examples reduce extraneous load on working memory.' },
        { text: 'Situated learning', why: 'That is about learning inside a community of practice.' },
        { text: 'Self-determination theory', why: 'That is about motivation.' }
      ] }
    ],
    keyIdeas: ['Choose one main theory; say what it predicts.', 'The mechanism links your intervention to your outcome.', 'A logic model makes assumptions visible.', 'A framework also hides things — name what it leaves out.'],
    practice: [{ tip: 'Design so outcomes, activities and assessment align.', cite: 'biggs' }, { tip: 'Build feedback into the intervention: where am I going, how am I doing, what next?', cite: 'hattie' }],
    assignment: {
      title: 'Theory-informed intervention model',
      steps: ['Pick a theory and justify it.', 'Explain the mechanism.', 'Fill in the logic model.'],
      output: 'Theory + logic model + one-paragraph framework.',
      fields: [
        { key: 'theory', label: 'Guiding theory', kind: 'select', options: THEORIES, required: true, concierge: 'theory' },
        { key: 'theoryWhy', label: 'Why it fits', kind: 'long', required: true, hint: '2–3 sentences.', example: 'Kolb: students practice, get feedback, reflect, and try again — the cycle the intervention builds in.', concierge: 'theoryWhy' },
        { key: 'mechanism', label: 'Mechanism', kind: 'long', required: true, hint: 'What changes in the learner?', example: 'Repeated practice with specific feedback sharpens communication behaviors.', concierge: 'mechanism' },
        { key: 'logic.inputs', label: 'Inputs', kind: 'long', example: 'AI platform, rubric, faculty time, 30 students.', concierge: 'logic.inputs' },
        { key: 'logic.activities', label: 'Activities', kind: 'long', example: 'Three 20-minute encounters with rubric feedback.', concierge: 'logic.activities' },
        { key: 'logic.outputs', label: 'Outputs', kind: 'long', example: 'Encounters completed, feedback reports.', concierge: 'logic.outputs' },
        { key: 'logic.outcomes', label: 'Outcomes', kind: 'long', example: 'Short: rubric scores. Long: OSCE communication.', concierge: 'logic.outcomes' },
        { key: 'conceptualFramework', label: 'Conceptual framework', kind: 'long', required: true, hint: 'One paragraph tying it together.', concierge: 'conceptualFramework' }
      ]
    },
    readings: ['varpio', 'bordage2009', 'taylorHamdy', 'knowles', 'kolb', 'sweller', 'lave', 'ryanDeci', 'frye']
  },
  {
    n: 3, tone: 'w3', title: 'Selecting the research design', short: 'Design',
    promise: 'Pick the simplest design that answers your question.',
    frameworks: ['Quantitative', 'Qualitative', 'Mixed methods', 'Experimental / quasi-experimental', 'Design-based research'],
    slides: [
      { kind: 'table', title: 'Match design to question', columns: ['You ask…', 'Use…'], rows: [['Does it work?', 'Randomized, crossover, controlled pre/post'], ['How or why?', 'Interviews, focus groups'], ['Both?', 'Mixed methods'], ['How common? Related?', 'Survey, cohort']] },
      { kind: 'cards', title: 'Quantitative designs', items: [{ label: 'Single-group pre/post', text: 'Easy; weakest causal claim' }, { label: 'Controlled pre/post', text: 'Adds a comparison group' }, { label: 'Randomized', text: 'Strongest causal claim' }, { label: 'Crossover', text: 'Each group gets both; watch carryover' }] },
      { kind: 'cards', title: 'Qualitative inquiry', items: [{ label: 'Interviews', text: 'Depth, individual views' }, { label: 'Focus groups', text: 'Shared views, interaction' }, { label: 'Purposive sampling', text: 'Choose information-rich people' }, { label: 'Enough data', text: 'Information power, not a fixed n' }], caption: 'Kuper et al. 2008; Malterud et al. 2016' },
      { kind: 'steps', title: 'Mixed-methods designs', items: [{ label: 'Convergent', text: 'Collect both, compare' }, { label: 'Explanatory', text: 'Numbers first, then explain' }, { label: 'Exploratory', text: 'Explore first, then measure' }], caption: 'Creswell & Plano Clark 2018' },
      { kind: 'cards', title: 'Watch for', items: [{ label: 'Bias', text: 'Selection, contamination' }, { label: 'Confounding', text: 'Other things that changed' }, { label: 'Feasibility', text: 'Time, numbers, access' }, { label: 'Ethics', text: 'Learners must feel free to say no' }] },
      { kind: 'case', title: 'Running example', text: RUNNING_CASE, points: ['Design: crossover across two clerkship blocks', 'Comparator: usual teaching', 'Add: brief interviews on how feedback was used'] },
      { kind: 'check', title: 'Quick check', question: 'You want to know why residents ignore feedback. Best design?', options: [
        { text: 'Randomized trial', why: 'Tests whether, not why.' },
        { text: 'Qualitative interviews', correct: true, why: '“Why” questions need qualitative depth.' },
        { text: 'Single-group pre/post', why: 'Measures change, not reasons.' }
      ] }
    ],
    keyIdeas: ['The question decides the design.', 'A comparison group strengthens any causal claim.', 'Qualitative work explains how and why.', 'Plan how you will limit bias before you start.'],
    practice: [{ tip: 'Use the research compass to locate your study type.', cite: 'ringsted' }, { tip: 'Answer the 28 design questions before data collection.', cite: 'bordageDawson' }],
    assignment: {
      title: 'Study design and methods outline',
      steps: ['Choose a design.', 'Describe setting, participants, sampling.', 'Describe intervention, comparator, procedures.'],
      output: 'Methods outline (about 1 page).',
      fields: [
        { key: 'design', label: 'Design', kind: 'select', required: true, options: ['Single-group pre/post', 'Controlled pre/post', 'Randomized trial', 'Crossover', 'Qualitative (interviews / focus groups)', 'Mixed methods', 'Survey', 'Design-based research', 'Other'], concierge: 'design' },
        { key: 'rationale', label: 'Why this design', kind: 'long', required: true, example: 'Crossover lets every student get SimPatient while giving a fair comparison.', concierge: 'rationale' },
        { key: 'setting', label: 'Setting', kind: 'text', required: true, example: 'OB/GYN clerkship, one academic hospital, 2027.', concierge: 'setting' },
        { key: 'population', label: 'Participants', kind: 'long', required: true, example: 'Third-year students on the clerkship (about 30 per block).', concierge: 'population' },
        { key: 'recruitment', label: 'Sampling & recruitment', kind: 'long', required: true, example: 'All students invited; opt-in; grades unaffected.', concierge: 'recruitment' },
        { key: 'exposure', label: 'Intervention', kind: 'long', required: true, concierge: 'exposure' },
        { key: 'comparator', label: 'Comparator', kind: 'text', hint: 'If none, say so.', concierge: 'comparator' },
        { key: 'procedures', label: 'Procedures & timeline', kind: 'long', concierge: 'procedures' },
        { key: 'bias', label: 'Main bias + how you’ll limit it', kind: 'long', concierge: 'bias' }
      ]
    },
    readings: ['ringsted', 'bordageDawson', 'kuper', 'creswell', 'malterud']
  },
  {
    n: 4, tone: 'w4', title: 'Assessment, measurement & evidence', short: 'Measures',
    promise: 'Measure learning — not just satisfaction.',
    frameworks: ['Miller’s pyramid', 'Kirkpatrick', 'Messick validity', 'Kane validity argument', 'Rubrics & rater calibration'],
    slides: [
      { kind: 'compare', title: 'Learning vs satisfaction', left: { label: 'Satisfaction', items: ['“Did you like it?”', 'Kirkpatrick 1'] }, right: { label: 'Learning', items: ['“Can they do it?”', 'Observed skill, OSCE, rubric'] } },
      { kind: 'pyramid', title: "Miller's pyramid", items: [{ label: 'Does', text: 'Workplace assessment' }, { label: 'Shows how', text: 'OSCE, simulation' }, { label: 'Knows how', text: 'Case questions' }, { label: 'Knows', text: 'MCQ' }], caption: 'Miller 1990' },
      { kind: 'cards', title: 'Validity evidence', items: [{ label: 'Content', text: 'Right items?' }, { label: 'Response process', text: 'Used as intended?' }, { label: 'Internal structure', text: 'Reliable?' }, { label: 'Relations', text: 'Fits other measures?' }, { label: 'Consequences', text: 'Helps or harms?' }], caption: 'Messick, via Cook & Beckman 2006. Kane: build an argument (Cook et al. 2015).' },
      { kind: 'compare', title: 'Rubric or rating scale?', left: { label: 'Analytic rubric', items: ['Criteria × levels', 'Specific feedback'] }, right: { label: 'Global rating', items: ['Fast, expert judgment', 'Good for complex skills'] } },
      { kind: 'steps', title: 'Calibrate raters', items: [{ label: 'Train', text: 'Shared examples' }, { label: 'Rate', text: 'Same videos' }, { label: 'Discuss', text: 'Resolve gaps' }, { label: 'Check', text: 'Agreement (ICC, kappa)' }] },
      { kind: 'case', title: 'Running example', text: RUNNING_CASE, points: ['Outcome: OSCE communication (shows how)', 'Instrument: 6-item analytic rubric', 'Validity: expert review, rater training, ICC'] },
      { kind: 'check', title: 'Quick check', question: 'Two faculty score the same video very differently. Which validity source is at risk?', options: [
        { text: 'Internal structure (reliability)', correct: true, why: 'Low agreement between raters is a reliability problem.' },
        { text: 'Content', why: 'Content is about whether items cover the skill.' },
        { text: 'Consequences', why: 'That is about effects of using the scores.' }
      ] }
    ],
    keyIdeas: ['Measure at the highest Miller or Kirkpatrick level you can.', 'Validity is an argument built from evidence.', 'Pilot your rubric and train raters.', 'Use an existing instrument when one fits.'],
    practice: [{ tip: 'Follow seven steps when building a survey.', cite: 'artino' }, { tip: 'Plan validation like a simulation study.', cite: 'cookHatala' }],
    assignment: {
      title: 'Assessment and evaluation blueprint',
      steps: ['Define the primary outcome.', 'Draft a rubric or instrument.', 'Plan validity evidence.'],
      output: 'Outcome table + draft rubric + validity plan.',
      fields: [
        { key: 'primaryOutcome', label: 'Primary outcome', kind: 'long', required: true, example: 'OSCE communication score on a 6-item rubric, end of block.', concierge: 'primaryOutcome' },
        { key: 'outcomeLevel', label: 'Outcome level', kind: 'select', options: KIRK, required: true, concierge: 'outcomeLevel' },
        { key: 'secondaryOutcomes', label: 'Other outcomes', kind: 'long', concierge: 'secondaryOutcomes' },
        { key: 'instrument', label: 'Draft rubric or instrument', kind: 'long', required: true, hint: 'Criteria and levels, or items.', example: '1 Opening · 2 Listening · 3 Empathy · 4 Explaining · 5 Shared decision · 6 Closing — each 1 (needs work) to 3 (strong).', concierge: 'instrument' },
        { key: 'validityPlan', label: 'Validity evidence plan', kind: 'long', required: true, hint: 'Which of the 5 sources, and how?', concierge: 'validityPlan' },
        { key: 'raterPlan', label: 'Rater training & reliability', kind: 'long', concierge: 'raterPlan' }
      ]
    },
    readings: ['miller', 'cookBeckman', 'cookKane', 'cookHatala', 'artino', 'yardley']
  },
  {
    n: 5, tone: 'w5', title: 'Analysis, ethics & the proposal', short: 'Proposal',
    promise: 'Put it all together into a protocol.',
    frameworks: ['Analysis planning', 'Thematic analysis', 'Mixed-methods integration', 'Belmont principles', 'Reporting guidelines'],
    slides: [
      { kind: 'table', title: 'Match analysis to outcome', columns: ['Data', 'Common analysis'], rows: [['Scores, one group pre/post', 'Paired t-test or Wilcoxon'], ['Scores, two groups', 't-test, Mann-Whitney, ANCOVA'], ['Yes/no outcomes', 'Chi-square or Fisher'], ['Likert items', 'Ordinal methods'], ['Interview text', 'Thematic analysis']], caption: 'Sullivan & Artino 2013' },
      { kind: 'cards', title: 'Beyond the P value', items: [{ label: 'Effect size', text: 'How big is the change?' }, { label: 'Confidence interval', text: 'How certain?' }, { label: 'Sample size', text: 'Planned from the effect you expect' }], caption: 'Sullivan & Feinn 2012' },
      { kind: 'steps', title: 'Qualitative rigor', items: [{ label: 'Familiarize' }, { label: 'Code' }, { label: 'Build themes' }, { label: 'Review' }, { label: 'Name & write' }], caption: 'Braun & Clarke 2006 · Trustworthiness: Lincoln & Guba 1985' },
      { kind: 'cards', title: 'Ethics essentials', items: [{ label: 'Respect', text: 'Real consent, free to decline' }, { label: 'Beneficence', text: 'Minimize risk' }, { label: 'Justice', text: 'Fair selection' }, { label: 'IRB decides', text: 'Never self-declare exempt' }], caption: 'Belmont Report; 45 CFR 46' },
      { kind: 'steps', title: 'Proposal flow', items: [{ label: 'Problem & gap' }, { label: 'Question' }, { label: 'Framework' }, { label: 'Design' }, { label: 'Measures' }, { label: 'Analysis' }, { label: 'Ethics & timeline' }], caption: 'Report with EQUATOR guidelines (e.g., SRQR)' },
      { kind: 'case', title: 'Running example', text: RUNNING_CASE, points: ['Analysis: mixed model for crossover scores + effect size', 'Interviews: thematic analysis', 'Ethics: opt-in, not graded, data de-identified'] },
      { kind: 'check', title: 'Quick check', question: 'Your students are also your trainees. Biggest ethical risk?', options: [
        { text: 'Too few participants', why: 'A feasibility issue, not the main ethics risk.' },
        { text: 'Students feeling pressure to take part', correct: true, why: 'Power differences threaten voluntary consent; separate recruitment from grading.' },
        { text: 'Using a rubric', why: 'Rubrics are not an ethical risk in themselves.' }
      ] }
    ],
    keyIdeas: ['Plan the analysis before you collect data.', 'Report effect sizes and uncertainty.', 'Protect learners: voluntary, confidential, separate from grades.', 'Your IRB — not you — decides the review category.'],
    practice: [{ tip: 'Check your draft against common reasons for rejection.', cite: 'bordage2001' }, { tip: 'Judge the whole proposal with Glassick’s six standards.', cite: 'glassick' }],
    assignment: {
      title: 'Integrated research protocol',
      steps: ['Plan the analysis.', 'Address ethics and feasibility.', 'Add a timeline, then export.'],
      output: 'Exportable protocol (Weeks 1–5 combined).',
      fields: [
        { key: 'analysis', label: 'Analysis plan', kind: 'long', required: true, example: 'Linear mixed model on rubric scores (period, sequence); Cohen’s d with 95% CI. Interviews: thematic analysis.', concierge: 'analysis' },
        { key: 'sampleSize', label: 'Sample size reasoning', kind: 'long', required: true, concierge: 'sampleSize' },
        { key: 'risksBenefits', label: 'Risks & benefits', kind: 'long', required: true, concierge: 'risksBenefits' },
        { key: 'consent', label: 'Consent & recruitment protections', kind: 'long', required: true, concierge: 'consent' },
        { key: 'privacy', label: 'Confidentiality & data', kind: 'long', required: true, concierge: 'privacy' },
        { key: 'feasibility', label: 'Feasibility call', kind: 'select', options: ['GO', 'REVISE', 'DEFER'], required: true, concierge: 'feasibility' },
        { key: 'feasibilityReason', label: 'Why', kind: 'long', concierge: 'feasibilityReason' },
        { key: 'timeline', label: 'Timeline', kind: 'long', required: true, example: 'Jan: IRB · Mar–Jun: data · Jul: analysis · Sep: abstract.', concierge: 'timeline' }
      ]
    },
    readings: ['sullivanFeinn', 'sullivanArtino', 'braunClarke', 'lincolnGuba', 'belmont', 'commonRule', 'citi', 'equator', 'srqr', 'bordage2001', 'glassick']
  }
];

/** How the course itself is designed (shown on the Academy home). */
export const COURSE_DESIGN = [
  { label: 'Built backward', text: 'Outcomes, activities and assignments align.', cite: 'biggs' },
  { label: 'Six-step design', text: 'Needs → goals → methods → evaluation.', cite: 'kern' },
  { label: 'Small chunks', text: 'One idea per slide to limit load.', cite: 'sweller' },
  { label: 'Feedback loops', text: 'Weekly submissions with faculty feedback.', cite: 'hattie' }
];
