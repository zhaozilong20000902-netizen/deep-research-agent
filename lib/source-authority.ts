export type SourceAuthorityLevel = 'high' | 'medium' | 'review';

export interface SourceAuthorityAssessment {
  level: SourceAuthorityLevel;
  labelZh: string;
  labelEn: string;
  descriptionZh: string;
  descriptionEn: string;
}

interface SourceLike {
  type: 'academic' | 'web';
  doi?: string;
  journal?: string;
  url?: string;
  source?: string;
}

const OFFICIAL_HOST_PATTERNS = [
  /(^|\.)gov\.cn$/i,
  /(^|\.)edu\.cn$/i,
  /(^|\.)gov$/i,
  /(^|\.)edu$/i,
  /(^|\.)who\.int$/i,
  /(^|\.)unesco\.org$/i,
  /(^|\.)oecd\.org$/i,
  /(^|\.)stats\.gov\.cn$/i,
  /(^|\.)std\.samr\.gov\.cn$/i,
];

function getHost(url?: string): string {
  if (!url) return '';
  try {
    return new URL(url).hostname.replace(/^www\./i, '').toLowerCase();
  } catch {
    return '';
  }
}

function isOfficialHost(host: string): boolean {
  return OFFICIAL_HOST_PATTERNS.some(pattern => pattern.test(host));
}

/**
 * Give teachers a transparent, conservative source-strength hint. This is a
 * first-pass classification based on source metadata, not a claim that the
 * source is automatically correct or peer reviewed.
 */
export function assessSourceAuthority(source: SourceLike): SourceAuthorityAssessment {
  if (source.type === 'academic' && (source.doi || source.journal)) {
    return {
      level: 'high',
      labelZh: '学术来源',
      labelEn: 'Academic source',
      descriptionZh: '包含期刊或 DOI 信息，仍建议打开原文核验',
      descriptionEn: 'Journal or DOI metadata is present; verify the original paper',
    };
  }

  const host = getHost(source.url);
  if (source.type === 'web' && isOfficialHost(host)) {
    return {
      level: 'high',
      labelZh: '官方/公共机构',
      labelEn: 'Official institution',
      descriptionZh: '来自政府、教育或国际公共机构网站',
      descriptionEn: 'Government, education, or international public institution domain',
    };
  }

  if (source.type === 'web' && (source.source || host)) {
    return {
      level: 'medium',
      labelZh: '行业/网页来源',
      labelEn: 'Industry / web source',
      descriptionZh: '可作为补充依据，使用前请核对原文、发布日期和发布主体',
      descriptionEn: 'Useful as supporting evidence; check the author, date, and original page',
    };
  }

  return {
    level: 'review',
    labelZh: '待教师核验',
    labelEn: 'Teacher review needed',
    descriptionZh: '元数据不足，不能仅凭搜索结果判断权威性',
    descriptionEn: 'Insufficient metadata to judge authority from search results alone',
  };
}
