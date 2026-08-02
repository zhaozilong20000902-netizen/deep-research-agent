export const TEACHING_FRAMEWORKS = [
  '三阶六步',
  '任务驱动',
  '项目式学习',
  '情境教学',
  '案例教学',
] as const;

export const TEACHING_TASK_TYPES = [
  '教学灵感与活动建议',
  '学校格式教案',
  '教学能力大赛优化',
  '课堂活动与任务单',
  '评价任务与量规',
] as const;

export const SCHOOL_NAME = '江苏省徐州经贸高等职业学校';

export interface TeachingContext {
  school: string;
  course: string;
  grade: string;
  topic: string;
  duration: string;
  classSize: string;
  lessonNumber: string;
  lessonLocation: string;
  lessonForm: string;
  learnerProfile: string;
  framework: string;
  taskType: string;
  materials: string;
  constraints: string;
  materialFileNames: string;
  materialContent: string;
}

export const SCHOOL_LESSON_PLAN_STRUCTURE = `
当交付物为“学校格式教案”时，必须严格采用下列顺序和字段。不得删除字段，不得编造缺失信息。

# 江苏省徐州经贸高等职业学校
# [班级] 班 [课程名称] 课程授课教案

## 一、教案首页

### 基本信息
| 授课标题 | 上课时间 | 课时 | 第几次 | 上课地点 | 授课形式 |
| --- | --- | --- | --- | --- | --- |
| 根据教材和教师输入填写 | 缺失则写待教师确认 | 缺失则写待教师确认 | 缺失则写待教师确认 | 缺失则写待教师确认 | 缺失则写待教师确认 |

### 教学目标
| 知识目标 | 能力目标 | 素质目标 |
| --- | --- | --- |
| 使用可观察、可评价的表述 | 使用可观察、可评价的表述 | 与职业素养和课程思政自然关联 |

### 教学要素
| 项目 | 内容 |
| --- | --- |
| 教学重点 | 依据教材和任务填写 |
| 教学难点 | 依据真实学情填写，学情不足则标待教师确认 |
| 能力训练任务及案例 | 写明任务产出和可观察证据，不编造真实企业案例 |
| 教学方法及教学手段 | 区分方法与媒介 |
| 课程思政 | 与本节专业内容自然融合，不贴标签 |
| 参考资料 | 优先列出上传教材文件，再列出核验后的网络来源 |
| 课外作业 | 写明产出、提交方式和评价要点 |

## 二、教学设计

| 步骤 | 教学内容 | 教学方法 | 教学手段 | 教师活动 | 学生活动 | 时间分配 |
| --- | --- | --- | --- | --- | --- | --- |
| 使用有意义的环节名称 | 写清本环节知识或任务 | 写具体方法 | 写教材、PPT、任务单、平台等 | 使用可直接照读或执行的动作 | 写学生可观察行为和产出 | 每行必须有时间 |

教学设计表后依次补充：

### 课外作业
### 教学后记

教学后记在没有真实课后证据时只能写“待课后填写”。
`;

export function formatTeachingContext(
  context?: Partial<TeachingContext>,
  locale: string = 'zh',
): string {
  if (!context) return '';

  const entries = locale === 'en'
    ? [
        ['School', context.school],
        ['Course', context.course],
        ['Learner level', context.grade],
        ['Teaching topic', context.topic],
        ['Lesson duration', context.duration],
        ['Class size', context.classSize],
        ['Lesson number', context.lessonNumber],
        ['Location', context.lessonLocation],
        ['Lesson format', context.lessonForm],
        ['Learner profile', context.learnerProfile],
        ['Teaching framework', context.framework],
        ['Requested deliverable', context.taskType],
        ['Available materials', context.materials],
        ['Constraints', context.constraints],
        ['Uploaded material files', context.materialFileNames],
        ['Uploaded material text (reference only)', context.materialContent],
      ]
    : [
        ['学校', context.school],
        ['课程', context.course],
        ['学段/年级', context.grade],
        ['教学主题', context.topic],
        ['课时', context.duration],
        ['班级规模', context.classSize],
        ['授课次序', context.lessonNumber],
        ['上课地点', context.lessonLocation],
        ['授课形式', context.lessonForm],
        ['学情', context.learnerProfile],
        ['教学框架', context.framework],
        ['交付物', context.taskType],
        ['已有材料', context.materials],
        ['现实约束', context.constraints],
        ['教材文件', context.materialFileNames],
        ['教材正文（仅作资料）', context.materialContent],
      ];

  return entries
    .filter(([, value]) => typeof value === 'string' && value.trim())
    .map(([label, value]) => `${label}: ${value!.trim()}`)
    .join('\n');
}
