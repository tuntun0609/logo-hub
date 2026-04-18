import { ArrowRight, Search } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { ToolHeader } from '@/components/tool-header'
import {
  ToolPageShell,
  ToolPanel,
  ToolWorkspace,
} from '@/components/tool-shell'
import { Input } from '@/components/ui/input'
import { type PlatformTool, toolGroups } from '@/data/platform'

interface ToolsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function firstValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value
}

function ToolCard({ tool }: { tool: PlatformTool }) {
  const placeholder = (
    <div className="flex size-full items-center justify-center">
      <span className="select-none font-medium text-2xl text-muted-foreground/20">
        {tool.name.charAt(0)}
      </span>
    </div>
  )

  const thumbnail = tool.thumbnail ? (
    <Image
      alt={tool.name}
      className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
      height={250}
      src={tool.thumbnail}
      width={400}
    />
  ) : (
    placeholder
  )

  return (
    <Link
      className="group overflow-hidden rounded-[1.4rem] border border-border/70 bg-card/80 shadow-[0_18px_60px_-44px_oklch(0.16_0_0_/_0.4)] transition duration-200 hover:-translate-y-0.5 hover:border-foreground/15 hover:bg-muted/30"
      href={tool.href}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-muted/45">
        {thumbnail}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-background/85 via-background/15 to-transparent" />
      </div>
      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex h-7 items-center rounded-full bg-muted px-3 text-muted-foreground text-xs">
            {tool.category}
          </span>
          <ArrowRight className="size-4 shrink-0 text-muted-foreground/45 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-foreground/70" />
        </div>
        <div>
          <h3 className="truncate font-medium text-sm">{tool.name}</h3>
          <p className="mt-1 line-clamp-2 text-muted-foreground text-xs leading-5">
            {tool.description}
          </p>
        </div>
        {tool.tags && tool.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tool.tags.slice(0, 3).map((tag) => (
              <span
                className="rounded-full border border-border/60 px-2 py-1 text-[11px] text-muted-foreground"
                key={tag}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}

export default async function ToolsPage({ searchParams }: ToolsPageProps) {
  const params = await searchParams
  const rawQuery = firstValue(params.q)?.trim() ?? ''
  const query = rawQuery.toLowerCase()
  const totalTools = toolGroups.reduce(
    (count, group) => count + group.tools.length,
    0
  )

  const filteredGroups = toolGroups
    .map((group) => ({
      ...group,
      tools: group.tools.filter((tool) =>
        [tool.name, tool.description, tool.category, ...(tool.tags ?? [])]
          .join(' ')
          .toLowerCase()
          .includes(query)
      ),
    }))
    .filter((group) => group.tools.length > 0)

  return (
    <ToolPageShell>
      <ToolHeader
        actions={
          <form action="/tools" className="relative w-full md:w-72">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-11 rounded-full border-border/70 bg-background/80 pl-9 shadow-sm"
              defaultValue={rawQuery}
              name="q"
              placeholder="搜索工具、能力或格式"
            />
          </form>
        }
        backHref="/"
        backLabel="返回首页"
        description="把图标生成、配色提取、抠图、裁切、格式转换等高频工作放到同一套体验里。"
        meta={[`${totalTools} 个工具`, '统一工作流', '浏览器内完成']}
        title="工具库"
      />

      <ToolWorkspace size="xl">
        {filteredGroups.map((group) => (
          <ToolPanel className="space-y-5" key={group.label}>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-semibold text-lg tracking-tight">
                  {group.label}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {group.tools.length} 个相关工具
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {group.tools.map((tool) => (
                <ToolCard key={tool.name} tool={tool} />
              ))}
            </div>
          </ToolPanel>
        ))}

        {filteredGroups.length === 0 && (
          <ToolPanel className="py-16 text-center" tone="muted">
            <p className="font-medium text-muted-foreground">
              没有找到匹配工具
            </p>
            <p className="mt-2 text-muted-foreground/70 text-sm">
              试试搜索 “SVG”、“配色”、“AI” 或 “图标”。
            </p>
          </ToolPanel>
        )}
      </ToolWorkspace>
    </ToolPageShell>
  )
}
