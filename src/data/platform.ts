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

export const toolGroups: PlatformToolGroup[] = [
  {
    label: '转换工具',
    tools: [
      {
        category: '转换',
        name: 'Icon Maker',
        description: '选择图标、渐变与背景，生成并导出 App 图标',
        href: '/tools/icon-maker',
        tags: ['图标', '导出'],
        thumbnail:
          'https://oss.logohub.art/logos/1776520547759-notion-cover-icon-maker.png',
      },
      {
        category: '转换',
        name: 'ICO Converter',
        description: '将图片转换为多尺寸 ICO 图标文件',
        href: '/tools/ico-converter',
        tags: ['ICO', '格式转换'],
        thumbnail:
          'https://oss.logohub.art/logos/1776520547759-notion-cover-ico-converter.png',
      },
      {
        category: '转换',
        name: 'Background Remover',
        description: '纯浏览器端 AI 一键移除图片背景',
        href: '/tools/background-remover',
        tags: ['抠图', 'AI'],
        thumbnail:
          'https://oss.logohub.art/logos/1776520019198-3d9c22e8-ab81-4cc8-be5d-38a883795f5b.png',
      },
      {
        category: '转换',
        name: 'Logo Resize',
        description: '导入图片，按固定比例、自由比例或固定尺寸裁切并导出',
        href: '/tools/logo-resize',
        tags: ['尺寸调整', '裁切'],
        thumbnail:
          'https://oss.logohub.art/logos/1776520547759-notion-cover-logo-resize.png',
      },
      {
        category: '转换',
        name: 'Image to SVG',
        description: '将位图 Logo 描摹转换为可缩放的 SVG 矢量图',
        href: '/tools/image-to-svg',
        tags: ['SVG', '矢量化'],
        thumbnail:
          'https://oss.logohub.art/logos/1776520547759-notion-cover-image-to-svg.png',
      },
      {
        category: '转换',
        name: 'SVG Viewer',
        description: '浏览、编辑、优化 SVG 并转换为多种格式',
        href: '/tools/svg-viewer',
        tags: ['SVG', '查看', '优化'],
        thumbnail:
          'https://oss.logohub.art/logos/1776520547759-notion-cover-svg-viewer.png',
      },
      {
        category: '转换',
        name: 'Watermark Remover',
        description: '去除 Gemini 生成图片的 nanobanana 水印',
        href: '/tools/watermark-remover',
        tags: ['清理', '图片'],
        thumbnail:
          'https://oss.logohub.art/logos/1776520547759-notion-cover-watermark-remover.png',
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
        thumbnail:
          'https://oss.logohub.art/logos/1776520547759-notion-cover-color-extractor.png',
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

export const allTools = toolGroups.flatMap((group) =>
  group.tools.map((tool) => ({ ...tool, group: group.label }))
)
