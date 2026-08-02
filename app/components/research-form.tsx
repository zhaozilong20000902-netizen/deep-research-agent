'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';
import {
  SCHOOL_NAME,
  TEACHING_FRAMEWORKS,
  TEACHING_TASK_TYPES,
  type TeachingContext,
} from '@/lib/teaching';
import { combineTeachingMaterials, type ParsedTeachingMaterial } from '@/lib/material-reader';
import { MaterialUploader } from './material-uploader';

const DEPTH_OPTIONS = [
  { value: 'quick', labelKey: 'quick' as const },
  { value: 'standard', labelKey: 'standard' as const },
  { value: 'deep', labelKey: 'deep' as const },
];

const CITATION_STYLES = [
  { value: 'gb7714', label: 'GB/T 7714' },
  { value: 'apa', label: 'APA' },
  { value: 'mla', label: 'MLA' },
  { value: 'chicago', label: 'Chicago' },
] as const;

export type CitationStyle = (typeof CITATION_STYLES)[number]['value'];

interface ResearchFormProps {
  onSubmit: (
    question: string,
    depth: string,
    citationStyle: CitationStyle,
    teachingContext: TeachingContext,
  ) => void;
  isLoading: boolean;
}

const inputClassName = 'w-full rounded-xl border border-stone-300 bg-white px-3.5 py-3 text-sm text-stone-900 placeholder:text-stone-500 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 disabled:opacity-60';

function inferTopic(question: string): string {
  const firstSentence = question.split(/[。！？?!\n]/)[0].trim();
  return firstSentence.length > 52 ? `${firstSentence.slice(0, 52)}…` : firstSentence;
}

export function ResearchForm({ onSubmit, isLoading }: ResearchFormProps) {
  const { t, locale } = useI18n();
  const [question, setQuestion] = useState('');
  const [depth, setDepth] = useState('standard');
  const [citationStyle, setCitationStyle] = useState<CitationStyle>('gb7714');
  const [parsedMaterials, setParsedMaterials] = useState<ParsedTeachingMaterial[]>([]);
  const [showContext, setShowContext] = useState(false);
  const [showMaterials, setShowMaterials] = useState(false);
  const [context, setContext] = useState<TeachingContext>({
    school: SCHOOL_NAME,
    course: '',
    grade: '',
    topic: '',
    duration: locale === 'zh' ? '2 课时' : '2 lessons',
    classSize: '',
    lessonNumber: '',
    lessonLocation: '',
    lessonForm: '',
    learnerProfile: '',
    framework: locale === 'zh' ? '任务驱动' : 'Task-based learning',
    taskType: locale === 'zh' ? '教学灵感与活动建议' : 'Teaching inspiration and activity ideas',
    materials: '',
    constraints: '',
    materialFileNames: '',
    materialContent: '',
  });

  const updateContext = (field: keyof TeachingContext, value: string) => {
    setContext(current => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (isLoading || (!question.trim() && parsedMaterials.length === 0)) return;

    const materialContent = combineTeachingMaterials(parsedMaterials).slice(0, 90_000);
    const topic = context.topic.trim() || inferTopic(question) || (locale === 'zh' ? '待确定教学主题' : 'Teaching topic to confirm');
    const effectiveQuestion = question.trim() || (locale === 'zh'
      ? `请先阅读我上传的教材内容，提炼本节课的重点，并生成“${context.taskType}”。所有事实判断都要标注可核验来源，缺失信息标记为待教师确认。`
      : `Read the uploaded teaching material first, identify the lesson essentials, and produce ${context.taskType}. Cite verifiable sources for factual claims and mark missing details for teacher confirmation.`);

    onSubmit(effectiveQuestion, depth, citationStyle, {
      ...context,
      topic,
      materialFileNames: parsedMaterials.map(material => material.name).join('、'),
      materialContent,
    });
  };

  return (
    <section className="overflow-hidden rounded-[28px] border border-stone-200 bg-white shadow-[0_24px_80px_rgba(28,45,38,0.10)]">
      <div className="border-b border-stone-200 bg-emerald-950 px-6 py-8 text-stone-50 sm:px-9 sm:py-10">
        <div className="flex items-start gap-4">
          <Image
            src="/xzjm-logo.png"
            alt={`${SCHOOL_NAME}校徽`}
            width={64}
            height={64}
            className="h-16 w-16 shrink-0 rounded-2xl bg-white p-1 object-contain shadow-lg"
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold tracking-wide text-emerald-200">{t.conversationHeroEyebrow}</p>
            <h2 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">{t.conversationHeroTitle}</h2>
            <p className="mt-3 max-w-3xl text-base leading-7 text-emerald-100">{t.conversationHeroDescription}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2 text-sm text-emerald-100">
          <span className="rounded-full border border-emerald-700 bg-emerald-900/70 px-3 py-1.5">{SCHOOL_NAME}</span>
          <span className="rounded-full border border-emerald-700/70 px-3 py-1.5">{t.evidenceFirstTitle}</span>
          <span className="rounded-full border border-emerald-700/70 px-3 py-1.5">{t.optionalMaterials}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 px-6 py-7 sm:px-9 sm:py-9">
        <label className="block space-y-3">
          <span className="text-sm font-semibold text-stone-950">{t.problemToSolve}</span>
          <textarea
            value={question}
            onChange={event => setQuestion(event.target.value)}
            placeholder={t.conversationPromptHint}
            className={`${inputClassName} min-h-44 resize-y text-base leading-7`}
            disabled={isLoading}
            autoFocus
          />
          <span className="block text-xs leading-5 text-stone-500">
            {locale === 'zh' ? '可以只说一个问题，也可以直接说“帮我准备这节课”。信息不完整时，结果会明确标记待教师确认。' : 'A short request is enough. If key information is missing, the result will mark it for teacher confirmation.'}
          </span>
        </label>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-3.5 text-sm text-emerald-950">
          <p className="font-semibold">{t.evidenceFirstTitle}</p>
          <p className="mt-1 leading-6 text-emerald-900/80">{t.evidenceFirstHint}</p>
        </div>

        <div>
          <p className="text-sm font-semibold text-stone-800">{t.teachingTaskTitle}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(locale === 'zh' ? TEACHING_TASK_TYPES : ['Teaching inspiration', 'School-format lesson plan', 'Competition lesson optimization', 'Class activity worksheet', 'Assessment rubric']).map(item => (
              <button
                key={item}
                type="button"
                onClick={() => updateContext('taskType', item)}
                className={`rounded-full border px-3.5 py-2 text-sm font-medium transition-colors active:translate-y-px ${
                  context.taskType === item
                    ? 'border-emerald-800 bg-emerald-800 text-white'
                    : 'border-stone-300 bg-white text-stone-700 hover:border-emerald-700 hover:text-emerald-900'
                }`}
                disabled={isLoading}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 border-t border-stone-200 pt-5 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setShowContext(value => !value)}
            className="flex items-center justify-between rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-left text-sm font-medium text-stone-800 transition-colors hover:border-emerald-700 hover:bg-emerald-50"
            disabled={isLoading}
          >
            <span>{t.optionalContext}</span>
            <span className="text-lg leading-none text-stone-500">{showContext ? '−' : '+'}</span>
          </button>
          <button
            type="button"
            onClick={() => setShowMaterials(value => !value)}
            className="flex items-center justify-between rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-left text-sm font-medium text-stone-800 transition-colors hover:border-emerald-700 hover:bg-emerald-50"
            disabled={isLoading}
          >
            <span>{t.optionalMaterials}</span>
            <span className="text-lg leading-none text-stone-500">{showMaterials ? '−' : '+'}</span>
          </button>
        </div>

        {showContext && (
          <div className="rounded-2xl border border-stone-200 bg-stone-50/70 p-4 sm:p-5">
            <p className="text-sm font-semibold text-stone-900">{t.teachingContextTitle}</p>
            <p className="mt-1 text-xs leading-5 text-stone-500">{t.teachingContextHint}</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <label className="space-y-2 text-sm font-medium text-stone-800"><span>{t.courseName}</span><input value={context.course} onChange={event => updateContext('course', event.target.value)} className={inputClassName} disabled={isLoading} /></label>
              <label className="space-y-2 text-sm font-medium text-stone-800"><span>{t.gradeLevel}</span><input value={context.grade} onChange={event => updateContext('grade', event.target.value)} placeholder={locale === 'zh' ? '例如：物工高职 41 班' : 'e.g. Class 41'} className={inputClassName} disabled={isLoading} /></label>
              <label className="space-y-2 text-sm font-medium text-stone-800"><span>{t.teachingTopic}</span><input value={context.topic} onChange={event => updateContext('topic', event.target.value)} placeholder={t.teachingTopicPlaceholder} className={inputClassName} disabled={isLoading} /></label>
              <label className="space-y-2 text-sm font-medium text-stone-800"><span>{t.lessonDuration}</span><input value={context.duration} onChange={event => updateContext('duration', event.target.value)} className={inputClassName} disabled={isLoading} /></label>
              <label className="space-y-2 text-sm font-medium text-stone-800"><span>{t.classSize}</span><input value={context.classSize} onChange={event => updateContext('classSize', event.target.value)} className={inputClassName} disabled={isLoading} /></label>
              <label className="space-y-2 text-sm font-medium text-stone-800"><span>{t.teachingFramework}</span><select value={context.framework} onChange={event => updateContext('framework', event.target.value)} className={inputClassName} disabled={isLoading}>{(locale === 'zh' ? TEACHING_FRAMEWORKS : ['Task-based learning', 'Project-based learning', 'Scenario teaching', 'Case teaching']).map(item => <option key={item} value={item}>{item}</option>)}</select></label>
              <label className="space-y-2 text-sm font-medium text-stone-800"><span>{locale === 'zh' ? '授课次序' : 'Lesson number'}</span><input value={context.lessonNumber} onChange={event => updateContext('lessonNumber', event.target.value)} placeholder={locale === 'zh' ? '例如：第 1 次' : 'e.g. Lesson 1'} className={inputClassName} disabled={isLoading} /></label>
              <label className="space-y-2 text-sm font-medium text-stone-800"><span>{locale === 'zh' ? '上课地点' : 'Location'}</span><input value={context.lessonLocation} onChange={event => updateContext('lessonLocation', event.target.value)} placeholder={locale === 'zh' ? '例如：实训室' : 'e.g. Lab'} className={inputClassName} disabled={isLoading} /></label>
              <label className="space-y-2 text-sm font-medium text-stone-800"><span>{locale === 'zh' ? '授课形式' : 'Lesson format'}</span><input value={context.lessonForm} onChange={event => updateContext('lessonForm', event.target.value)} placeholder={locale === 'zh' ? '例如：理实一体' : 'e.g. Blended'} className={inputClassName} disabled={isLoading} /></label>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-stone-800"><span>{t.learnerProfile}</span><textarea value={context.learnerProfile} onChange={event => updateContext('learnerProfile', event.target.value)} placeholder={t.learnerProfilePlaceholder} className={`${inputClassName} min-h-24 resize-y`} disabled={isLoading} /></label>
              <label className="space-y-2 text-sm font-medium text-stone-800"><span>{t.availableMaterials}</span><textarea value={context.materials} onChange={event => updateContext('materials', event.target.value)} placeholder={t.availableMaterialsPlaceholder} className={`${inputClassName} min-h-24 resize-y`} disabled={isLoading} /></label>
              <label className="space-y-2 text-sm font-medium text-stone-800 sm:col-span-2"><span>{t.realConstraints}</span><textarea value={context.constraints} onChange={event => updateContext('constraints', event.target.value)} placeholder={t.realConstraintsPlaceholder} className={`${inputClassName} min-h-24 resize-y`} disabled={isLoading} /></label>
            </div>
          </div>
        )}

        {showMaterials && (
          <div className="rounded-2xl border border-stone-200 bg-stone-50/70 p-4 sm:p-5">
            <p className="mb-1 text-sm font-semibold text-stone-900">{t.optionalMaterials}</p>
            <p className="mb-4 text-xs leading-5 text-stone-500">{locale === 'zh' ? '上传教材、课件或讲义会增强结果，但不是开始对话的前提。' : 'Files improve grounding but are never required to start the conversation.'}</p>
            <MaterialUploader materials={parsedMaterials} onChange={setParsedMaterials} disabled={isLoading} />
          </div>
        )}

        {!question.trim() && (
          <div>
            <p className="text-sm font-medium text-stone-700">{t.tryExample}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {t.examplePrompts.slice(0, 3).map(prompt => (
                <button key={prompt} type="button" onClick={() => setQuestion(prompt)} className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-left text-sm text-stone-700 transition-colors hover:border-emerald-700 hover:text-emerald-900">
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4 border-t border-stone-200 pt-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex rounded-xl bg-stone-100 p-1">
              {DEPTH_OPTIONS.map(option => (
                <button key={option.value} type="button" onClick={() => setDepth(option.value)} className={`rounded-lg px-3 py-2 text-sm font-medium ${depth === option.value ? 'bg-white text-stone-950 shadow-sm' : 'text-stone-600'}`} disabled={isLoading}>{t[option.labelKey]}</button>
              ))}
            </div>
            <label className="flex items-center gap-2 text-sm text-stone-700">
              <span>{t.citationStyleLabel}</span>
              <select value={citationStyle} onChange={event => setCitationStyle(event.target.value as CitationStyle)} className="rounded-lg border border-stone-300 bg-white px-3 py-2 font-medium" disabled={isLoading}>
                {CITATION_STYLES.map(style => <option key={style.value} value={style.value}>{style.label}</option>)}
              </select>
            </label>
          </div>

          <Button type="submit" size="lg" disabled={(!question.trim() && parsedMaterials.length === 0) || isLoading} className="whitespace-nowrap bg-emerald-800 text-white hover:bg-emerald-900">
            {isLoading ? t.researching : t.startResearch}
          </Button>
        </div>
      </form>
    </section>
  );
}
