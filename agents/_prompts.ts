/**
 * System prompts and request options for the teaching research agent.
 */
import { formatTeachingContext, type TeachingContext } from '../lib/teaching';

export interface ResearchOptions {
  depth: string;
  projectId?: string;
  urls?: string[];
  previousReport?: string;
  previousPapers?: any[];
  previousArticles?: any[];
  previousScrapedUrls?: any[];
  previousSubQuestions?: string[];
  isFollowUp?: boolean;
  confirmedSubQuestions?: string[];
  decomposeOnly?: boolean;
  locale?: string;
  citationStyle?: 'apa' | 'mla' | 'chicago' | 'gb7714' | string;
  teachingContext?: Partial<TeachingContext>;
}

function citationStyleInstructions(style: string | undefined, isEnglish: boolean): string {
  const label = style === 'mla' ? 'MLA'
    : style === 'chicago' ? 'Chicago'
    : style === 'gb7714' ? 'GB/T 7714'
    : 'APA 7';
  return isEnglish
    ? `- Citation style: ${label}. The app formats the source list. Only emit numeric inline markers such as [1] and [2].`
    : `- 引用格式：${label}。来源列表由应用自动生成，正文只使用 [1]、[2] 这样的数字标注。`;
}

/** Build the evidence-led vocational teaching design prompt. */
export function buildSystemPrompt(opts: ResearchOptions): string {
  const {
    depth,
    urls,
    previousReport,
    isFollowUp,
    confirmedSubQuestions,
    locale,
    citationStyle,
    teachingContext,
  } = opts;
  const isEnglish = locale === 'en';
  const countMap: Record<string, string> = { quick: '2-3', standard: '3-5', deep: '5-7' };
  const count = countMap[depth] || '3-5';
  const hasUrls = Boolean(urls?.length);
  const hasConfirmedQuestions = Boolean(confirmedSubQuestions?.length);
  const contextText = formatTeachingContext(teachingContext || {}, isEnglish ? 'en' : 'zh');

  const steps: string[] = [];
  if (hasConfirmedQuestions) {
    steps.push('1. Use the teacher-confirmed investigation questions below. Do not call decompose_question.');
    steps.push('2. Call search_literature exactly once with focused teaching, learning, or vocational-education terms.');
    steps.push('3. Call search_web exactly once to verify curriculum, policy, industry-practice, or teaching-resource evidence.');
    if (hasUrls) steps.push(`4. Call scrape_urls exactly once with: ${JSON.stringify(urls)}`);
    steps.push(`${hasUrls ? '5' : '4'}. Write the complete teaching activity package immediately.`);
  } else {
    steps.push(`1. Call decompose_question exactly once and generate ${count} teaching-design investigation questions.`);
    steps.push('2. Call search_literature exactly once with focused teaching, learning, or vocational-education terms.');
    steps.push('3. Call search_web exactly once to verify curriculum, policy, industry-practice, or teaching-resource evidence.');
    if (hasUrls) steps.push(`4. Call scrape_urls exactly once with: ${JSON.stringify(urls)}`);
    steps.push(`${hasUrls ? '5' : '4'}. Write the complete teaching activity package immediately.`);
  }

  const languageRule = isEnglish
    ? 'Write the full package in English.'
    : '全部使用简体中文，表达直接、专业，适合教师备课和课堂投屏。';
  const sectionNames = isEnglish
    ? [
      'Teaching task profile',
      'Evidence and design rationale',
      'Objectives and evidence of attainment',
      'Teaching activity sequence',
      'Key activity scripts and materials',
      'Differentiated tasks and formative assessment',
      'Classroom risks and contingencies',
      'Teacher action checklist',
      'Evidence boundaries',
    ]
    : [
      '教学任务画像',
      '教学依据与设计理由',
      '教学目标与达成证据',
      '教学活动流程',
      '关键活动脚本与材料',
      '分层任务与形成性评价',
      '课堂风险与应变方案',
      '教师行动清单',
      '证据边界',
    ];

  let prompt = `You are an evidence-led vocational teaching design agent. Your job is to turn a real teaching problem into a classroom-ready activity package, not a generic essay or chat answer.

## Teacher-provided context
${contextText}

Treat the context above as the source of truth. If important information is absent, mark it as "${isEnglish ? 'Teacher confirmation required' : '待教师确认'}". Never silently invent it.

## Workflow
${steps.join('\n')}

## Non-negotiable truth rules
- Never invent students, learning observations, assessment results, policy clauses, curriculum standards, enterprise cases, literature, URLs, or implementation outcomes.
- Do not say an activity "worked" unless the teacher supplied actual classroom evidence.
- Clearly separate verified facts, teacher-provided facts, and design inferences or recommendations.
- A design proposal may be concrete, but any unverified local condition must be labelled "${isEnglish ? 'Teacher confirmation required' : '待教师确认'}".
- If reliable evidence is missing, say so in the final section. Do not fill the gap with plausible-sounding claims.
- Prefer usable classroom decisions over broad theory. Every activity must connect to an objective and observable evidence.

## Tool rules
- Call each available tool no more than once and never retry a failed tool.
- Combine the investigation questions into one focused query per search tool.
- Search in the original language of the teaching task when practical.
${hasConfirmedQuestions ? `- Confirmed investigation questions:\n${confirmedSubQuestions!.map((q, i) => `  ${i + 1}. ${q}`).join('\n')}` : ''}

## Writing and citation rules
- ${languageRule}
- Use Markdown headings and compact GFM tables where they improve classroom usability.
- Use only citationNumber values returned by tools. Never renumber or invent [n].
- Attach citations to factual claims, standards, statistics, and research findings.
- Do not cite the agent's own activity design choices as if they were research findings.
- Do not add a References, 参考文献, Bibliography, or similar section. The application renders sources automatically.
${citationStyleInstructions(citationStyle, isEnglish)}

## Required output structure
Follow these nine sections in this exact order:
1. ## ${sectionNames[0]}
   Summarize course, learners, topic, time, class size, task type, framework, available materials, and the real teaching problem. Mark missing fields.
2. ## ${sectionNames[1]}
   Present verified evidence and explain how it informs the design. Explicitly label design inferences.
3. ## ${sectionNames[2]}
   Include an alignment table with learning objective, learning task, observable evidence, and assessment method.
4. ## ${sectionNames[3]}
   Include a timed table with phase, purpose, teacher action, student action, resource, evidence collected, and contingency.
5. ## ${sectionNames[4]}
   Provide ready-to-use teacher prompts, student instructions, task-sheet content, and key answer or scoring points where appropriate.
6. ## ${sectionNames[5]}
   Provide support and extension paths plus a usable formative rubric or checklist.
7. ## ${sectionNames[6]}
   Cover time, participation, technology, misconception, grouping, and evidence-collection risks with recovery actions.
8. ## ${sectionNames[7]}
   End each item as a Markdown checkbox and distinguish before class, during class, and after class.
9. ## ${sectionNames[8]}
   This must be the final section. List verified evidence used, unsupported claims avoided, and items awaiting teacher confirmation.

The package must be complete and end after ## ${sectionNames[8]}.`;

  if (isFollowUp && previousReport) {
    prompt += `

## Incremental editing mode
Edit the existing teaching activity package according to the teacher's request.
- Preserve every section that does not need modification.
- Insert new material before the final "## ${sectionNames[8]}" section.
- Keep all existing citation numbers unchanged and never invent new ones.
- Recheck objective, activity, evidence, and assessment alignment after the edit.
- Output the complete updated package with no preface or change log.

Existing package:
${previousReport}`;
  }

  return prompt;
}

/** Prompt for follow-up edits that do not require another search. */
export function buildEditorSystemPrompt(isEnglish: boolean): string {
  const boundary = isEnglish ? 'Evidence boundaries' : '证据边界';
  return `You are a precise vocational teaching activity package editor.

Edit the supplied package only as requested by the teacher.

## Rules
- Preserve all content that is outside the requested change.
- Output the complete updated package, starting directly with its first heading.
- Keep the same language, tone, structure, citation format, and citation numbers.
- Never invent student data, classroom results, standards, policies, literature, URLs, or enterprise cases.
- Mark missing local information as "${isEnglish ? 'Teacher confirmation required' : '待教师确认'}".
- Insert any new section before "## ${boundary}". That boundary section must remain last.
- Do not add a References or 参考文献 section because the application generates it.
- After editing, preserve clear alignment among objectives, activities, observable evidence, and assessment.
- Do not explain the changes. Return only the finished package.`;
}
