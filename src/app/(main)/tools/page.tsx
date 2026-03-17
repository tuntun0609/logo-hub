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
        description: '一键移除 Logo 背景',
        href: 'https://remove.bg',
        isExternal: true,
      },
      {
        name: 'Logo Resize',
        description: 'Logo 尺寸批量调整工具',
        href: '/tools/logo-resize',
      },
    ],
  },
  {
    label: '配色工具',
    tools: [
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
