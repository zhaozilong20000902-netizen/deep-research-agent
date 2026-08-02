'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';
import {
  TEACHING_FRAMEWORKS,
  TEACHING_TASK_TYPES,
  type TeachingContext,
} from '@/lib/teaching';

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

export function ResearchForm({ onSubmit, isLoading }: ResearchFormProps) {
  const { t, locale } = useI18n();
  const [question, setQuestion] = useState('');
  const [depth, setDepth] = useState('standard');
  const [citationStyle, setCitationStyle] = useState<CitationStyle>('gb7714');
  const [context, setContext] = useState<TeachingContext>({
    course: locale === 'zh' ? '智慧仓配运营' : 'Smart Warehousing Operations',
    grade: locale === 'zh' ? '职业院校' : 'Vocational college',
    topic: '',
    duration: locale === 'zh' ? '2课时' : '2 lessons',
    classSize: '30',
    learnerProfile: '',
    framework: locale === 'zh' ? '三阶六步' : 'Task-based learning',
    taskType: locale === 'zh' ? '完整教学活动设计' : 'Complete teaching activity plan',
    materials: '',
    constraints: '',
  });

  const updateContext = (field: keyof TeachingContext, value: string) => {
    setContext((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!question.trim() || !context.topic.trim() || isLoading) return;
    onSubmit(question.trim(), depth, citationStyle, context);
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-[0_20px_70px_rgba(28,45,38,0.08)]">
      <div className="grid border-b border-stone-200 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="bg-emerald-950 px-6 py-7 text-stone-50 sm:px-8">
          <p className="text-sm font-semibold text-emerald-200">{t.teachingWorkbench}</p>
          <h2 className="mt-2 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
            {t.teachingHeroTitle}
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-emerald-100">
            {t.teachingHeroDescription}
          </p>
        </div>
        <div className="bg-stone-100 px-6 py-7 sm:px-8">
          <p className="text-sm font-semibold text-stone-900">{t.deliveryStandard}</p>
          <div className="mt-4 grid gap-3 text-sm text-stone-700">
            {[t.standardEvidence, t.standardActivity, t.standardAssessment, t.standardChecklist].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-md bg-emerald-800 text-xs font-bold text-white">✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 px-6 py-7 sm:px-8">
        <fieldset>
          <legend className="text-lg font-semibold text-stone-950">{t.teachingContextTitle}</legend>
          <p className="mt-1 text-sm text-stone-600">{t.teachingContextHint}</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <label className="space-y-2 text-sm font-medium text-stone-800">
              <span>{t.courseName}</span>
              <input value={context.course} onChange={(e) => updateContext('course', e.target.value)} className={inputClassName} disabled={isLoading} />
            </label>
            <label className="space-y-2 text-sm font-medium text-stone-800">
              <span>{t.gradeLevel}</span>
              <input value={context.grade} onChange={(e) => updateContext('grade', e.target.value)} className={inputClassName} disabled={isLoading} />
            </label>
            <label className="space-y-2 text-sm font-medium text-stone-800">
              <span>{t.teachingTopic}</span>
              <input value={context.topic} onChange={(e) => updateContext('topic', e.target.value)} placeholder={t.teachingTopicPlaceholder} className={inputClassName} disabled={isLoading} required />
            </label>
            <label className="space-y-2 text-sm font-medium text-stone-800">
              <span>{t.lessonDuration}</span>
              <input value={context.duration} onChange={(e) => updateContext('duration', e.target.value)} className={inputClassName} disabled={isLoading} />
            </label>
            <label className="space-y-2 text-sm font-medium text-stone-800">
              <span>{t.classSize}</span>
              <input value={context.classSize} onChange={(e) => updateContext('classSize', e.target.value)} className={inputClassName} disabled={isLoading} />
            </label>
            <label className="space-y-2 text-sm font-medium text-stone-800">
              <span>{t.teachingFramework}</span>
              <select value={context.framework} onChange={(e) => updateContext('framework', e.target.value)} className={inputClassName} disabled={isLoading}>
                {(locale === 'zh' ? TEACHING_FRAMEWORKS : ['Task-based learning', 'Project-based learning', 'Scenario teaching', 'Case teaching']).map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-stone-800">
              <span>{t.learnerProfile}</span>
              <textarea value={context.learnerProfile} onChange={(e) => updateContext('learnerProfile', e.target.value)} placeholder={t.learnerProfilePlaceholder} className={`${inputClassName} min-h-24 resize-y`} disabled={isLoading} />
            </label>
            <label className="space-y-2 text-sm font-medium text-stone-800">
              <span>{t.availableMaterials}</span>
              <textarea value={context.materials} onChange={(e) => updateContext('materials', e.target.value)} placeholder={t.availableMaterialsPlaceholder} className={`${inputClassName} min-h-24 resize-y`} disabled={isLoading} />
            </label>
          </div>
        </fieldset>

        <fieldset className="border-t border-stone-200 pt-7">
          <legend className="text-lg font-semibold text-stone-950">{t.teachingTaskTitle}</legend>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {(locale === 'zh' ? TEACHING_TASK_TYPES : ['Complete activity plan', 'Competition lesson optimization', 'Class activity worksheet', 'Teaching game design', 'Assessment rubric']).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => updateContext('taskType', item)}
                className={`min-h-16 rounded-xl border px-3 py-3 text-left text-sm font-medium transition-colors active:translate-y-px ${
                  context.taskType === item
                    ? 'border-emerald-800 bg-emerald-50 text-emerald-950'
                    : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400'
                }`}
                disabled={isLoading}
              >
                {item}
              </button>
            ))}
          </div>

          <label className="mt-5 block space-y-2 text-sm font-medium text-stone-800">
            <span>{t.problemToSolve}</span>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={t.inputPlaceholder}
              className={`${inputClassName} min-h-32 resize-y text-base leading-7`}
              disabled={isLoading}
              required
            />
          </label>
          <label className="mt-4 block space-y-2 text-sm font-medium text-stone-800">
            <span>{t.realConstraints}</span>
            <input value={context.constraints} onChange={(e) => updateContext('constraints', e.target.value)} placeholder={t.realConstraintsPlaceholder} className={inputClassName} disabled={isLoading} />
          </label>

          {!question && (
            <div className="mt-5">
              <p className="text-sm font-medium text-stone-700">{t.tryExample}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {t.examplePrompts.map((prompt) => (
                  <button key={prompt} type="button" onClick={() => setQuestion(prompt)} className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-left text-sm text-stone-700 hover:border-emerald-700 hover:text-emerald-900">
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}
        </fieldset>

        <div className="flex flex-col gap-4 border-t border-stone-200 pt-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex rounded-xl bg-stone-100 p-1">
              {DEPTH_OPTIONS.map((option) => (
                <button key={option.value} type="button" onClick={() => setDepth(option.value)} className={`rounded-lg px-4 py-2 text-sm font-medium ${depth === option.value ? 'bg-white text-stone-950 shadow-sm' : 'text-stone-600'}`} disabled={isLoading}>
                  {t[option.labelKey]}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2 text-sm text-stone-700">
              <span>{t.citationStyleLabel}</span>
              <select value={citationStyle} onChange={(e) => setCitationStyle(e.target.value as CitationStyle)} className="rounded-lg border border-stone-300 bg-white px-3 py-2 font-medium" disabled={isLoading}>
                {CITATION_STYLES.map((style) => <option key={style.value} value={style.value}>{style.label}</option>)}
              </select>
            </label>
          </div>

          <Button type="submit" size="lg" disabled={!question.trim() || !context.topic.trim() || isLoading} className="whitespace-nowrap bg-emerald-800 text-white hover:bg-emerald-900">
            {isLoading ? t.researching : t.startResearch}
          </Button>
        </div>
      </form>
    </section>
  );
}
