import { ArrowRight, ExternalLink, Search } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { getUnifiedSearchItems, type SearchItemType } from '@/data/platform'

interface SearchPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const typeOptions: { label: string; value: SearchItemType | 'all' }[] = [
  { label: '全部', value: 'all' },
  { label: '工具', value: 'tool' },
  { label: '网站', value: 'site' },
  { label: '作者', value: 'author' },
  { label: '方案', value: 'idea' },
  { label: '专题', value: 'topic' },
]

function firstValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value
}

function withParams(
  base: Record<string, string>,
  patch: Record<string, string>
) {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries({ ...base, ...patch })) {
    if (value) {
      params.set(key, value)
    }
  }

  const query = params.toString()
  return query ? `/search?${query}` : '/search'
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams
  const q = firstValue(params.q)?.trim() ?? ''
  const type =
    (firstValue(params.type) as SearchItemType | 'all' | undefined) || 'all'
  const normalizedQuery = q.toLowerCase()
  const allItems = getUnifiedSearchItems()

  const filtered = allItems.filter((item) => {
    const matchesType = type === 'all' || item.type === type
    const matchesQuery =
      !normalizedQuery ||
      [item.title, item.description, item.category, ...item.tags]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery)

    return matchesType && matchesQuery
  })

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div>
          <h1 className="font-semibold text-2xl tracking-tight">统一搜索</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground text-sm">
            跨内容类型检索工具、网站、作者与设计方案。
          </p>
        </div>

        <form action="/search" className="flex max-w-xl gap-2">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              className="h-10 w-full rounded-lg border bg-background pr-4 pl-10 text-sm outline-none transition placeholder:text-muted-foreground/60 focus:border-foreground/25 focus:ring-1 focus:ring-foreground/10"
              defaultValue={q}
              name="q"
              placeholder="搜索关键词，例如：科技、极简、SVG、品牌升级"
              type="search"
            />
          </div>
          <input name="type" type="hidden" value={type} />
          <button
            className="h-10 shrink-0 rounded-lg bg-foreground px-4 font-medium text-background text-sm transition hover:bg-foreground/90"
            type="submit"
          >
            搜索
          </button>
        </form>
      </div>

      <div className="flex flex-wrap gap-2">
        {typeOptions.map((option) => (
          <Link
            className={
              option.value === type
                ? 'rounded-lg bg-foreground px-3 py-1.5 font-medium text-background text-sm'
                : 'rounded-lg border px-3 py-1.5 text-muted-foreground text-sm transition hover:text-foreground'
            }
            href={withParams({ q }, { type: option.value })}
            key={option.value}
          >
            {option.label}
          </Link>
        ))}
      </div>

      <section className="space-y-4">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-muted-foreground text-sm">
            共 {filtered.length} 条结果
          </p>
          {q && (
            <Link
              className="text-muted-foreground text-sm transition hover:text-foreground"
              href={withParams({}, { type })}
            >
              清空关键词
            </Link>
          )}
        </div>

        {filtered.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((item) => {
              const cardClass =
                'group rounded-xl border bg-card p-4 transition-colors hover:bg-muted/40'
              const content = (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <Badge variant="secondary">{item.type}</Badge>
                    {item.isExternal ? (
                      <ExternalLink className="size-3.5 text-muted-foreground/50" />
                    ) : (
                      <ArrowRight className="size-3.5 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5" />
                    )}
                  </div>
                  <h3 className="mt-3 font-medium text-sm">{item.title}</h3>
                  <p className="mt-1.5 line-clamp-2 text-muted-foreground text-xs leading-relaxed">
                    {item.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <Badge className="text-[11px]" variant="outline">
                      {item.category}
                    </Badge>
                    {item.tags.slice(0, 2).map((tag) => (
                      <Badge
                        className="text-[11px]"
                        key={tag}
                        variant="outline"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </>
              )

              return item.isExternal ? (
                <a
                  className={cardClass}
                  href={item.href}
                  key={`${item.type}-${item.title}`}
                  rel="noreferrer"
                  target="_blank"
                >
                  {content}
                </a>
              ) : (
                <Link
                  className={cardClass}
                  href={item.href}
                  key={`${item.type}-${item.title}`}
                >
                  {content}
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="font-medium text-muted-foreground">没有匹配结果</p>
            <p className="mt-2 text-muted-foreground/70 text-sm">
              试试搜索"品牌升级""科技""AI""字体""极简"等关键词。
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
