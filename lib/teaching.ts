export const TEACHING_FRAMEWORKS = [
  '三阶六步',
  '任务驱动',
  '项目式学习',
  '情境教学',
  '案例教学',
] as const;

export const TEACHING_TASK_TYPES = [
  '完整教学活动设计',
  '教学能力大赛优化',
  '课堂活动与任务单',
  '教学游戏设计',
  '评价任务与量规',
] as const;

export interface TeachingContext {
  course: string;
  grade: string;
  topic: string;
  duration: string;
  classSize: string;
  learnerProfile: string;
  framework: string;
  taskType: string;
  materials: string;
  constraints: string;
}

export function formatTeachingContext(
  context?: Partial<TeachingContext>,
  locale: string = 'zh',
): string {
  if (!context) return '';

  const entries = locale === 'en'
    ? [
        ['Course', context.course],
        ['Learner level', context.grade],
        ['Teaching topic', context.topic],
        ['Lesson duration', context.duration],
        ['Class size', context.classSize],
        ['Learner profile', context.learnerProfile],
        ['Teaching framework', context.framework],
        ['Requested deliverable', context.taskType],
        ['Available materials', context.materials],
        ['Constraints', context.constraints],
      ]
    : [
        ['课程', context.course],
        ['学段/年级', context.grade],
        ['教学主题', context.topic],
        ['课时', context.duration],
        ['班级规模', context.classSize],
        ['学情', context.learnerProfile],
        ['教学框架', context.framework],
        ['交付物', context.taskType],
        ['已有材料', context.materials],
        ['现实约束', context.constraints],
      ];

  return entries
    .filter(([, value]) => typeof value === 'string' && value.trim())
    .map(([label, value]) => `${label}: ${value!.trim()}`)
    .join('\n');
}
