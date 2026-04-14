import { Search } from 'lucide-react'
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
      className="group overflow-hidden rounded-xl border bg-card transition-colors hover:bg-muted/40"
      href={tool.href}
    >
      <div className="relative aspect-16/10 overflow-hidden bg-muted/50">
        {thumbnail}
      </div>
      <div className="p-3.5">
        <h3 className="truncate font-medium text-sm">{tool.name}</h3>
        <p className="mt-1 truncate text-muted-foreground text-xs">
          {tool.description}
        </p>
      </div>
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
    <div className="space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-semibold text-2xl tracking-tight">工具库</h1>
          <p className="mt-1 text-muted-foreground text-sm">
            收拢生成、配色、转换、字体与灵感类工具
          </p>
        </div>
        <form action="/tools" className="relative w-full sm:w-64">
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
        <section className="space-y-4" key={group.label}>
          <h2 className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
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
        <div className="py-20 text-center">
          <p className="font-medium text-muted-foreground">没有找到匹配工具</p>
          <p className="mt-2 text-muted-foreground/70 text-sm">
            试试搜索"SVG""配色""AI"或"字体"。
          </p>
        </div>
      )}
    </div>
  )
}
