import { ExternalLink, Search } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { type PlatformTool, toolGroups } from '@/data/platform'

interface ToolsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function firstValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value
}

function ToolCard({ tool }: { tool: PlatformTool }) {
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

export default async function ToolsPage({ searchParams }: ToolsPageProps) {
  const params = await searchParams
  const rawQuery = firstValue(params.q)?.trim() ?? ''
  const query = rawQuery.toLowerCase()

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
    <div className="flex flex-col gap-6 p-2">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-semibold text-2xl tracking-tight">工具库</h1>
          <p className="mt-1 text-muted-foreground text-sm">
            收拢生成、配色、转换、字体与灵感类工具
          </p>
        </div>
        <form action="/tools" className="relative w-full sm:w-72">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            defaultValue={rawQuery}
            name="q"
            placeholder="搜索工具..."
          />
        </form>
      </div>

      {filteredGroups.map((group) => (
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

      {filteredGroups.length === 0 && (
        <div className="rounded-3xl border border-dashed p-10 text-center">
          <p className="font-medium">没有找到匹配工具</p>
          <p className="mt-2 text-muted-foreground text-sm">
            试试搜索“SVG”“配色”“AI”或“字体”。
          </p>
        </div>
      )}
    </div>
  )
}
