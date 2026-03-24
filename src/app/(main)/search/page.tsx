import { ArrowRight, ExternalLink, Search } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { getUnifiedSearchItems, type SearchItemType } from '@/data/platform'

interface SearchPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const typeOptions: { label: string; value: SearchItemType | 'all' }[] = [
  { label: '全部', value: 'all' },
  { label: '案例', value: 'logo' },
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

  const counts = typeOptions
    .filter((option) => option.value !== 'all')
    .map((option) => ({
      ...option,
      count: allItems.filter((item) => item.type === option.value).length,
    }))

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-border/70 bg-[linear-gradient(135deg,rgba(15,23,42,0.04),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.95),rgba(248,250,252,0.98))] p-6 sm:p-8">
        <Badge className="rounded-full px-3 py-1 text-xs" variant="secondary">
          P0 主骨架 · 统一搜索
        </Badge>
        <div className="mt-5 grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)]">
          <div>
            <h1 className="font-semibold text-3xl tracking-tight sm:text-4xl">
              一个入口检索案例、工具、网站、作者与设计方案
            </h1>
            <p className="mt-3 max-w-3xl text-base text-muted-foreground sm:text-lg">
              先搭出跨内容类型的搜索骨架，后续再接入真实内容模型、筛选器与返回状态保留。
            </p>

            <form
              action="/search"
              className="mt-6 flex flex-col gap-3 sm:flex-row"
            >
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  className="h-12 w-full rounded-2xl border border-border/70 bg-background pr-4 pl-11 text-sm outline-none transition focus:border-primary"
                  defaultValue={q}
                  name="q"
                  placeholder="搜索关键词，例如：科技、极简、SVG、品牌升级"
                  type="search"
                />
              </div>
              <input name="type" type="hidden" value={type} />
              <button
                className="h-12 rounded-2xl bg-primary px-5 font-medium text-primary-foreground"
                type="submit"
              >
                搜索
              </button>
            </form>
          </div>

          <div className="grid gap-3">
            {counts.map((item) => (
              <div
                className="rounded-[1.5rem] border border-border/60 bg-background/80 p-4"
                key={item.value}
              >
                <p className="text-muted-foreground text-xs">{item.label}</p>
                <p className="mt-2 font-medium text-lg">
                  {item.count} 条预置内容
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex flex-wrap gap-2">
        {typeOptions.map((option) => (
          <Link
            className={
              option.value === type
                ? 'rounded-full border border-primary bg-primary px-4 py-2 text-primary-foreground text-sm'
                : 'rounded-full border px-4 py-2 text-muted-foreground text-sm transition hover:text-foreground'
            }
            href={withParams({ q }, { type: option.value })}
            key={option.value}
          >
            {option.label}
          </Link>
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="font-semibold text-xl">搜索结果</h2>
            <p className="mt-1 text-muted-foreground text-sm">
              共找到 {filtered.length} 条结果
            </p>
          </div>
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
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((item) =>
              item.isExternal ? (
                <a
                  className="group rounded-[1.75rem] border border-border/70 p-5 transition hover:-translate-y-1 hover:border-foreground/15"
                  href={item.href}
                  key={`${item.type}-${item.title}`}
                  rel="noreferrer"
                  target="_blank"
                >
                  <div className="flex items-center justify-between gap-3">
                    <Badge variant="secondary">{item.type}</Badge>
                    <ExternalLink className="size-4 text-muted-foreground" />
                  </div>
                  <h3 className="mt-4 font-medium text-lg">{item.title}</h3>
                  <p className="mt-2 text-muted-foreground text-sm">
                    {item.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge variant="outline">{item.category}</Badge>
                    {item.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </a>
              ) : (
                <Link
                  className="group rounded-[1.75rem] border border-border/70 p-5 transition hover:-translate-y-1 hover:border-foreground/15"
                  href={item.href}
                  key={`${item.type}-${item.title}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <Badge variant="secondary">{item.type}</Badge>
                    <ArrowRight className="size-4 text-muted-foreground transition group-hover:translate-x-1" />
                  </div>
                  <h3 className="mt-4 font-medium text-lg">{item.title}</h3>
                  <p className="mt-2 text-muted-foreground text-sm">
                    {item.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge variant="outline">{item.category}</Badge>
                    {item.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </Link>
              )
            )}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-dashed p-10 text-center">
            <p className="font-medium text-lg">没有匹配结果</p>
            <p className="mt-2 text-muted-foreground text-sm">
              试试搜索“品牌升级”“科技”“AI”“字体”“极简”等关键词。
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
