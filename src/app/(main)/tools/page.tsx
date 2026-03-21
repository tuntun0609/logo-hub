import { ExternalLink, Search } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Input } from '@/components/ui/input'

interface Tool {
  description: string
  href: string
  isExternal?: boolean
  name: string
  thumbnail?: string
}

interface ToolGroup {
  label: string
  tools: Tool[]
}

const toolGroups: ToolGroup[] = [
  {
    label: 'AI 工具',
    tools: [
      {
        name: 'Logo Diffusion',
        description: 'AI 驱动的 Logo 生成工具',
        href: 'https://logodiffusion.com',
        isExternal: true,
      },
      {
        name: 'Brandmark',
        description: 'AI 品牌标识一站式设计',
        href: 'https://brandmark.io',
        isExternal: true,
      },
      {
        name: 'Looka',
        description: 'AI Logo 生成与品牌套件',
        href: 'https://looka.com',
        isExternal: true,
      },
      {
        name: 'Logomaster.ai',
        description: '简洁高效的 AI Logo 生成器',
        href: 'https://logomaster.ai',
        isExternal: true,
      },
      {
        name: 'Canva',
        description: '模板化 Logo、名片与社交媒体物料',
        href: 'https://www.canva.com',
        isExternal: true,
      },
      {
        name: 'DesignEvo',
        description: '海量模板在线 Logo 编辑器',
        href: 'https://www.designevo.com',
        isExternal: true,
      },
      {
        name: 'Figma',
        description: '协作式矢量与界面设计，适合精修标识',
        href: 'https://www.figma.com',
        isExternal: true,
      },
    ],
  },
  {
    label: '转换工具',
    tools: [
      {
        name: 'Icon Maker',
        description: '选择图标、渐变与背景，生成并导出 App 图标',
        href: '/tools/icon-maker',
      },
      {
        name: 'ICO Converter',
        description: '将图片转换为多尺寸 ICO 图标文件',
        href: '/tools/ico-converter',
      },
      {
        name: 'Background Remover',
        description: '纯浏览器端 AI 一键移除图片背景',
        href: '/tools/background-remover',
      },
      {
        name: 'Logo Resize',
        description: '导入图片，按固定比例、自由比例或固定尺寸裁切并导出',
        href: '/tools/logo-resize',
      },
      {
        name: 'Image to SVG',
        description: '将位图 Logo 描摹转换为可缩放的 SVG 矢量图',
        href: '/tools/image-to-svg',
      },
      {
        name: 'SVG Viewer',
        description: '浏览、编辑、优化 SVG 并转换为多种格式',
        href: '/tools/svg-viewer',
      },
      {
        name: 'Vectorizer.AI',
        description: '将位图 Logo 转为可缩放矢量（需留意授权与用途）',
        href: 'https://vectorizer.ai',
        isExternal: true,
      },
      {
        name: 'RealFaviconGenerator',
        description: '为多平台生成 Favicon、Apple Touch 与 PWA 图标',
        href: 'https://realfavicongenerator.net',
        isExternal: true,
      },
      {
        name: 'Squoosh',
        description: '本地处理图片压缩、格式转换与尺寸调整',
        href: 'https://squoosh.app',
        isExternal: true,
      },
    ],
  },
  {
    label: '配色工具',
    tools: [
      {
        name: 'Theme Color Extractor',
        description: '从图片中提取主题配色方案',
        href: '/tools/color-extractor',
      },
      {
        name: 'Coolors',
        description: '快速生成和浏览配色方案',
        href: 'https://coolors.co',
        isExternal: true,
      },
      {
        name: 'Adobe Color',
        description: '专业色彩搭配与主题提取',
        href: 'https://color.adobe.com',
        isExternal: true,
      },
      {
        name: 'Khroma',
        description: '基于偏好的 AI 配色学习与生成',
        href: 'https://khroma.co',
        isExternal: true,
      },
      {
        name: 'Huemint',
        description: '面向界面与品牌的 AI 配色灵感',
        href: 'https://huemint.com',
        isExternal: true,
      },
    ],
  },
  {
    label: '字体工具',
    tools: [
      {
        name: 'Google Fonts',
        description: '免费开源字体库',
        href: 'https://fonts.google.com',
        isExternal: true,
      },
      {
        name: 'Font Pair',
        description: '字体搭配灵感与建议',
        href: 'https://www.fontpair.co',
        isExternal: true,
      },
      {
        name: 'Adobe Fonts',
        description: '专业字体库与授权说明（常与 Creative Cloud 联动）',
        href: 'https://fonts.adobe.com',
        isExternal: true,
      },
      {
        name: 'Font Squirrel',
        description: '可商用手字体筛选与 Webfont 生成',
        href: 'https://www.fontsquirrel.com',
        isExternal: true,
      },
    ],
  },
  {
    label: '灵感与参考',
    tools: [
      {
        name: 'Dribbble',
        description: '设计师作品与标识视觉趋势',
        href: 'https://dribbble.com',
        isExternal: true,
      },
      {
        name: 'Behance',
        description: '完整品牌案例与作品集展示',
        href: 'https://www.behance.net',
        isExternal: true,
      },
      {
        name: 'Brand New',
        description: '知名品牌换标与视觉识别评析',
        href: 'https://www.underconsideration.com/brandnew/',
        isExternal: true,
      },
    ],
  },
]

function ToolCard({ tool }: { tool: Tool }) {
  const content = (
    <>
      <div className="relative aspect-16/10 overflow-hidden rounded-t-xl bg-muted">
        {tool.thumbnail ? (
          <Image
            alt={tool.name}
            className="size-full object-cover transition-transform group-hover:scale-105"
            height={250}
            src={tool.thumbnail}
            width={400}
          />
        ) : (
          <div className="flex size-full items-center justify-center" />
        )}
        {tool.isExternal && (
          <ExternalLink className="absolute top-2 right-2 size-4 text-muted-foreground" />
        )}
      </div>
      <div className="p-3">
        <h3 className="truncate font-medium text-sm">{tool.name}</h3>
        <p className="mt-0.5 truncate text-muted-foreground text-xs">
          {tool.description}
        </p>
      </div>
    </>
  )

  if (tool.isExternal) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL
    const externalHref = appUrl
      ? `${tool.href}${tool.href.includes('?') ? '&' : '?'}ref=${appUrl}`
      : tool.href

    return (
      <a
        className="group overflow-hidden rounded-xl border transition-colors hover:bg-muted/50"
        href={externalHref}
        rel="noopener noreferrer"
        target="_blank"
      >
        {content}
      </a>
    )
  }

  return (
    <Link
      className="group overflow-hidden rounded-xl border transition-colors hover:bg-muted/50"
      href={tool.href}
    >
      {content}
    </Link>
  )
}

export default function ToolsPage() {
  return (
    <div className="flex flex-col gap-6 p-2">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-semibold text-2xl tracking-tight">Tools</h1>
          <p className="mt-1 text-muted-foreground text-sm">
            探索和使用 Logo 相关工具
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="搜索工具..." />
        </div>
      </div>

      {toolGroups.map((group) => (
        <section className="flex flex-col gap-3" key={group.label}>
          <h2 className="font-medium text-muted-foreground text-sm">
            {group.label}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {group.tools.map((tool) => (
              <ToolCard key={tool.name} tool={tool} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
