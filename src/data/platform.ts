export type SearchItemType =
  | 'author'
  | 'idea'
  | 'logo'
  | 'site'
  | 'tool'
  | 'topic'

export interface PlatformTool {
  category: string
  description: string
  href: string
  isExternal?: boolean
  name: string
  tags?: string[]
  thumbnail?: string
}

export interface PlatformToolGroup {
  label: string
  tools: PlatformTool[]
}

export interface PlatformSite {
  category: string
  description: string
  href: string
  name: string
  notes: string
  tags: string[]
}

export interface PlatformIdea {
  description: string
  href: string
  tags: string[]
  title: string
}

export interface PlatformAuthor {
  description: string
  href: string
  name: string
  specialty: string
  tags: string[]
}

export interface PlatformTopic {
  description: string
  href: string
  title: string
}

export interface PlatformLogoSpotlight {
  category: string
  description: string
  href: string
  name: string
  tags: string[]
}

export interface UnifiedSearchItem {
  category: string
  description: string
  href: string
  isExternal?: boolean
  tags: string[]
  title: string
  type: SearchItemType
}

export const toolGroups: PlatformToolGroup[] = [
  {
    label: 'AI 工具',
    tools: [
      {
        category: '生成',
        name: 'Logo Diffusion',
        description: 'AI 驱动的 Logo 生成工具',
        href: 'https://logodiffusion.com',
        isExternal: true,
        tags: ['AI', '生成', '品牌套件'],
      },
      {
        category: '生成',
        name: 'Brandmark',
        description: 'AI 品牌标识一站式设计',
        href: 'https://brandmark.io',
        isExternal: true,
        tags: ['AI', '生成', '品牌套件'],
      },
      {
        category: '生成',
        name: 'Looka',
        description: 'AI Logo 生成与品牌套件',
        href: 'https://looka.com',
        isExternal: true,
        tags: ['AI', '生成', '品牌识别'],
      },
      {
        category: '生成',
        name: 'Logomaster.ai',
        description: '简洁高效的 AI Logo 生成器',
        href: 'https://logomaster.ai',
        isExternal: true,
        tags: ['AI', '生成'],
      },
      {
        category: '生成',
        name: 'Canva',
        description: '模板化 Logo、名片与社交媒体物料',
        href: 'https://www.canva.com',
        isExternal: true,
        tags: ['模板', '品牌资产'],
      },
      {
        category: '生成',
        name: 'DesignEvo',
        description: '海量模板在线 Logo 编辑器',
        href: 'https://www.designevo.com',
        isExternal: true,
        tags: ['模板', '在线编辑'],
      },
      {
        category: '生成',
        name: 'Figma',
        description: '协作式矢量与界面设计，适合精修标识',
        href: 'https://www.figma.com',
        isExternal: true,
        tags: ['协作', '矢量', '精修'],
      },
    ],
  },
  {
    label: '转换工具',
    tools: [
      {
        category: '转换',
        name: 'Icon Maker',
        description: '选择图标、渐变与背景，生成并导出 App 图标',
        href: '/tools/icon-maker',
        tags: ['图标', '导出'],
      },
      {
        category: '转换',
        name: 'ICO Converter',
        description: '将图片转换为多尺寸 ICO 图标文件',
        href: '/tools/ico-converter',
        tags: ['ICO', '格式转换'],
      },
      {
        category: '转换',
        name: 'Background Remover',
        description: '纯浏览器端 AI 一键移除图片背景',
        href: '/tools/background-remover',
        tags: ['抠图', 'AI'],
      },
      {
        category: '转换',
        name: 'Logo Resize',
        description: '导入图片，按固定比例、自由比例或固定尺寸裁切并导出',
        href: '/tools/logo-resize',
        tags: ['尺寸调整', '裁切'],
      },
      {
        category: '转换',
        name: 'Image to SVG',
        description: '将位图 Logo 描摹转换为可缩放的 SVG 矢量图',
        href: '/tools/image-to-svg',
        tags: ['SVG', '矢量化'],
      },
      {
        category: '转换',
        name: 'SVG Viewer',
        description: '浏览、编辑、优化 SVG 并转换为多种格式',
        href: '/tools/svg-viewer',
        tags: ['SVG', '查看', '优化'],
      },
      {
        category: '转换',
        name: 'Watermark Remover',
        description: '去除 Gemini 生成图片的 nanobanana 水印',
        href: '/tools/watermark-remover',
        tags: ['清理', '图片'],
      },
      {
        category: '转换',
        name: 'Vectorizer.AI',
        description: '将位图 Logo 转为可缩放矢量（需留意授权与用途）',
        href: 'https://vectorizer.ai',
        isExternal: true,
        tags: ['SVG', '矢量化'],
      },
      {
        category: '转换',
        name: 'RealFaviconGenerator',
        description: '为多平台生成 Favicon、Apple Touch 与 PWA 图标',
        href: 'https://realfavicongenerator.net',
        isExternal: true,
        tags: ['Favicon', '导出'],
      },
      {
        category: '转换',
        name: 'Squoosh',
        description: '本地处理图片压缩、格式转换与尺寸调整',
        href: 'https://squoosh.app',
        isExternal: true,
        tags: ['压缩', '格式转换'],
      },
    ],
  },
  {
    label: '配色工具',
    tools: [
      {
        category: '配色',
        name: 'Theme Color Extractor',
        description: '从图片中提取主题配色方案',
        href: '/tools/color-extractor',
        tags: ['配色', '提取'],
      },
      {
        category: '配色',
        name: 'Coolors',
        description: '快速生成和浏览配色方案',
        href: 'https://coolors.co',
        isExternal: true,
        tags: ['配色', '灵感'],
      },
      {
        category: '配色',
        name: 'Adobe Color',
        description: '专业色彩搭配与主题提取',
        href: 'https://color.adobe.com',
        isExternal: true,
        tags: ['配色', '专业'],
      },
      {
        category: '配色',
        name: 'Khroma',
        description: '基于偏好的 AI 配色学习与生成',
        href: 'https://khroma.co',
        isExternal: true,
        tags: ['AI', '配色'],
      },
      {
        category: '配色',
        name: 'Huemint',
        description: '面向界面与品牌的 AI 配色灵感',
        href: 'https://huemint.com',
        isExternal: true,
        tags: ['AI', '品牌色'],
      },
    ],
  },
  {
    label: '字体工具',
    tools: [
      {
        category: '字体',
        name: 'Google Fonts',
        description: '免费开源字体库',
        href: 'https://fonts.google.com',
        isExternal: true,
        tags: ['字体', '免费'],
      },
      {
        category: '字体',
        name: 'Font Pair',
        description: '字体搭配灵感与建议',
        href: 'https://www.fontpair.co',
        isExternal: true,
        tags: ['字体', '搭配'],
      },
      {
        category: '字体',
        name: 'Adobe Fonts',
        description: '专业字体库与授权说明（常与 Creative Cloud 联动）',
        href: 'https://fonts.adobe.com',
        isExternal: true,
        tags: ['字体', '授权'],
      },
      {
        category: '字体',
        name: 'Font Squirrel',
        description: '可商用手字体筛选与 Webfont 生成',
        href: 'https://www.fontsquirrel.com',
        isExternal: true,
        tags: ['字体', '商用'],
      },
    ],
  },
  {
    label: '灵感与参考',
    tools: [
      {
        category: '灵感',
        name: 'Dribbble',
        description: '设计师作品与标识视觉趋势',
        href: 'https://dribbble.com',
        isExternal: true,
        tags: ['灵感', '案例'],
      },
      {
        category: '灵感',
        name: 'Behance',
        description: '完整品牌案例与作品集展示',
        href: 'https://www.behance.net',
        isExternal: true,
        tags: ['灵感', '作品集'],
      },
      {
        category: '灵感',
        name: 'Brand New',
        description: '知名品牌换标与视觉识别评析',
        href: 'https://www.underconsideration.com/brandnew/',
        isExternal: true,
        tags: ['品牌升级', '评析'],
      },
    ],
  },
]

export const curatedSites: PlatformSite[] = [
  {
    category: '灵感案例',
    name: 'LogoLounge',
    description: '全球 Logo 趋势、风格分类与案例索引。',
    href: 'https://www.logolounge.com',
    notes: '适合快速建立行业对比基线。',
    tags: ['趋势', '分类浏览', '案例库'],
  },
  {
    category: '灵感案例',
    name: 'Brand New',
    description: '新旧品牌视觉升级的评论与拆解。',
    href: 'https://www.underconsideration.com/brandnew/',
    notes: '适合做品牌重设计研究。',
    tags: ['品牌升级', '案例分析'],
  },
  {
    category: '社区作品',
    name: 'Behance',
    description: '完整的品牌案例、视觉系统与作品集。',
    href: 'https://www.behance.net',
    notes: '适合深入查看完整品牌叙事。',
    tags: ['作品集', '品牌视觉'],
  },
  {
    category: '社区作品',
    name: 'Dribbble',
    description: '高频更新的 Logo 灵感与风格实验。',
    href: 'https://dribbble.com',
    notes: '适合快速扫图获取风格方向。',
    tags: ['灵感', '趋势'],
  },
  {
    category: '品牌资源',
    name: 'Logo Archive',
    description: '聚合经典 Logo、徽章与图形语言。',
    href: 'https://www.logoarchive.shop',
    notes: '适合找复古、徽章、图形化方向。',
    tags: ['经典', '徽章', '复古'],
  },
  {
    category: '品牌资源',
    name: 'World Brand Design',
    description: '包装、品牌与标识设计案例聚合。',
    href: 'https://worldbranddesign.com',
    notes: '适合消费品、餐饮与包装方向。',
    tags: ['品牌包装', '案例'],
  },
  {
    category: '字体色彩',
    name: 'Typewolf',
    description: '高质量字体观察与网页字体搭配参考。',
    href: 'https://www.typewolf.com',
    notes: '适合补足品牌字体系统。',
    tags: ['字体', '排版'],
  },
  {
    category: '字体色彩',
    name: 'Coolors',
    description: '高效生成品牌配色与色板灵感。',
    href: 'https://coolors.co',
    notes: '适合从 Logo 方向延展配色方案。',
    tags: ['配色', '品牌色'],
  },
]

export const platformIdeas: PlatformIdea[] = [
  {
    title: '极简科技品牌 Logo 拆解',
    description: '总结科技类品牌常见的几何、负空间与字标策略。',
    href: '/search?type=idea&q=%E7%A7%91%E6%8A%80',
    tags: ['科技', '极简', '几何'],
  },
  {
    title: '餐饮品牌如何做出高记忆度标识',
    description: '围绕符号、色彩与应用场景整理方向模板。',
    href: '/search?type=idea&q=%E9%A4%90%E9%A5%AE',
    tags: ['餐饮', '记忆点', '品牌符号'],
  },
  {
    title: '从案例到工具的 Logo 工作流',
    description: '把找灵感、抽配色、矢量化、导出串成一条可执行链路。',
    href: '/search?type=idea&q=workflow',
    tags: ['工作流', '工具链'],
  },
]

export const authorHighlights: PlatformAuthor[] = [
  {
    name: 'Mackey Saturday',
    specialty: '字标与品牌识别',
    description: '偏向现代字标、字形系统与品牌延展。',
    href: '/search?type=author&q=Mackey',
    tags: ['字标', '品牌识别'],
  },
  {
    name: 'Jessica Walsh',
    specialty: '视觉叙事与品牌表达',
    description: '擅长把品牌故事转成强烈记忆点的视觉语言。',
    href: '/search?type=author&q=Walsh',
    tags: ['品牌叙事', '创意'],
  },
  {
    name: 'Allan Peters',
    specialty: '徽章与图形标识',
    description: '适合参考图形化、复古与徽章型 Logo 方向。',
    href: '/search?type=author&q=Allan',
    tags: ['徽章', '图形标'],
  },
]

export const topicHighlights: PlatformTopic[] = [
  {
    title: '科技品牌 Logo',
    description: '聚合几何、未来感、极简字标案例与工具。',
    href: '/search?type=topic&q=%E7%A7%91%E6%8A%80',
  },
  {
    title: '极简风 Logo',
    description: '适合 SaaS、创作者品牌与轻品牌项目。',
    href: '/search?type=topic&q=%E6%9E%81%E7%AE%80',
  },
  {
    title: '餐饮与咖啡品牌',
    description: '重点关注图形符号、配色与包装延展。',
    href: '/search?type=topic&q=%E9%A4%90%E9%A5%AE',
  },
]

export const logoSpotlights: PlatformLogoSpotlight[] = [
  {
    name: '科技 SaaS 标识库',
    category: '科技',
    description: '适合对比无衬线字标、几何图形和蓝绿品牌色趋势。',
    href: '/logos',
    tags: ['几何', '字标', 'SaaS'],
  },
  {
    name: '消费品牌标识观察',
    category: '消费',
    description: '聚焦包装、亲和力与色彩识别策略。',
    href: '/logos',
    tags: ['消费', '包装', '配色'],
  },
  {
    name: '金融与企业品牌案例',
    category: '金融',
    description: '优先关注稳定感、可信度与系统化延展。',
    href: '/logos',
    tags: ['金融', '企业识别'],
  },
]

export const allTools = toolGroups.flatMap((group) =>
  group.tools.map((tool) => ({ ...tool, group: group.label }))
)

export function getUnifiedSearchItems(): UnifiedSearchItem[] {
  const tools = allTools.map<UnifiedSearchItem>((tool) => ({
    title: tool.name,
    description: tool.description,
    href: tool.href,
    isExternal: tool.isExternal,
    category: tool.category,
    tags: [tool.group, ...(tool.tags ?? [])],
    type: 'tool',
  }))

  const sites = curatedSites.map<UnifiedSearchItem>((site) => ({
    title: site.name,
    description: site.description,
    href: site.href,
    isExternal: true,
    category: site.category,
    tags: [...site.tags, site.notes],
    type: 'site',
  }))

  const ideas = platformIdeas.map<UnifiedSearchItem>((idea) => ({
    title: idea.title,
    description: idea.description,
    href: idea.href,
    category: '设计方案',
    tags: idea.tags,
    type: 'idea',
  }))

  const authors = authorHighlights.map<UnifiedSearchItem>((author) => ({
    title: author.name,
    description: `${author.specialty} · ${author.description}`,
    href: author.href,
    category: '作者',
    tags: author.tags,
    type: 'author',
  }))

  const topics = topicHighlights.map<UnifiedSearchItem>((topic) => ({
    title: topic.title,
    description: topic.description,
    href: topic.href,
    category: '专题',
    tags: [],
    type: 'topic',
  }))

  const logos = logoSpotlights.map<UnifiedSearchItem>((logo) => ({
    title: logo.name,
    description: logo.description,
    href: logo.href,
    category: logo.category,
    tags: logo.tags,
    type: 'logo',
  }))

  return [...logos, ...tools, ...sites, ...authors, ...ideas, ...topics]
}
