import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

const toolGroups = [
  {
    label: 'AI 工具',
    tools: [] as { title: string; description: string }[],
  },
  {
    label: '转换工具',
    tools: [] as { title: string; description: string }[],
  },
]

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
          {group.tools.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.tools.map((tool) => (
                <div
                  className="rounded-xl border p-4 transition-colors hover:bg-muted/50"
                  key={tool.title}
                >
                  <h3 className="font-medium">{tool.title}</h3>
                  <p className="mt-1 text-muted-foreground text-sm">
                    {tool.description}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex aspect-video items-center justify-center rounded-xl bg-muted">
              <span className="text-muted-foreground text-sm">即将推出...</span>
            </div>
          )}
        </section>
      ))}
    </div>
  )
}
