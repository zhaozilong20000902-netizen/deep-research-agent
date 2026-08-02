'use client';

import { useRef, useState } from 'react';
import {
  readTeachingMaterial,
  type ParsedTeachingMaterial,
} from '@/lib/material-reader';

interface MaterialUploaderProps {
  materials: ParsedTeachingMaterial[];
  onChange: (materials: ParsedTeachingMaterial[]) => void;
  disabled?: boolean;
}

const MAX_FILES = 4;

export function MaterialUploader({ materials, onChange, disabled = false }: MaterialUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isReading, setIsReading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0 || disabled) return;
    const remainingSlots = Math.max(0, MAX_FILES - materials.length);
    const files = Array.from(fileList).slice(0, remainingSlots);
    if (files.length === 0) {
      setError(`一次教学任务最多读取 ${MAX_FILES} 个文件。`);
      return;
    }

    setIsReading(true);
    setError(null);
    const parsed: ParsedTeachingMaterial[] = [];
    const failures: string[] = [];
    for (const file of files) {
      try {
        parsed.push(await readTeachingMaterial(file));
      } catch (reason) {
        const message = reason instanceof Error ? reason.message : '读取失败';
        failures.push(`${file.name}：${message}`);
      }
    }
    if (parsed.length > 0) onChange([...materials, ...parsed]);
    if (failures.length > 0) setError(failures.join('\n'));
    setIsReading(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="rounded-xl border border-stone-300 bg-stone-50 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-stone-900">上传本节教材或课件</p>
          <p className="mt-1 text-sm leading-6 text-stone-600">
            支持 PDF、DOCX、PPTX、TXT 和 Markdown。文件在浏览器中提取文字，智能体接收的是教材文字，不是原文件。
          </p>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || isReading || materials.length >= MAX_FILES}
          className="shrink-0 whitespace-nowrap rounded-lg bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-900 active:translate-y-px disabled:cursor-not-allowed disabled:bg-stone-300"
        >
          {isReading ? '正在读取教材' : '选择教材文件'}
        </button>
        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          accept=".pdf,.docx,.pptx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain,text/markdown"
          multiple
          onChange={(event) => handleFiles(event.target.files)}
          disabled={disabled || isReading}
        />
      </div>

      {materials.length === 0 && !error && (
        <p className="mt-4 rounded-lg border border-dashed border-stone-300 bg-white px-3 py-4 text-center text-sm text-stone-600">
          尚未添加教材。也可以只填写下方的已有材料和教学问题。
        </p>
      )}

      {materials.length > 0 && (
        <div className="mt-4 grid gap-2">
          {materials.map((material, index) => (
            <div key={`${material.name}-${index}`} className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white px-3 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-stone-900">{material.name}</p>
                <p className="mt-0.5 text-xs text-stone-600">
                  已读取 {material.characters.toLocaleString('zh-CN')} 字{material.truncated ? '，超长部分已截断' : ''}
                </p>
              </div>
              <button
                type="button"
                className="rounded-md px-2 py-1 text-xs font-medium text-stone-600 hover:bg-stone-100 hover:text-stone-950"
                onClick={() => onChange(materials.filter((_, itemIndex) => itemIndex !== index))}
                disabled={disabled || isReading}
                aria-label={`移除 ${material.name}`}
              >
                移除
              </button>
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="mt-3 whitespace-pre-line rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm leading-6 text-red-700" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
