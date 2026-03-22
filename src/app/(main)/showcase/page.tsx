'use client'

import { api } from '@convex/_generated/api'
import type { Doc } from '@convex/_generated/dataModel'
import { useQuery } from 'convex/react'
import { ExternalLink, Search } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'

type BrandLogo = Doc<'brand_logos'>

const CATEGORIES = [
  '科技',
  '金融',
  '电商',
  '社交',
  '游戏',
  '教育',
  '医疗',
  '餐饮',
  '出行',
  '其他',
]

function LogoCard({ logo }: { logo: BrandLogo }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border bg-card transition-all hover:shadow-md">
      <button
        aria-expanded={expanded}
        className="flex w-full cursor-pointer flex-col text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={() => setExpanded(!expanded)}
        type="button"
      >
        <div className="flex aspect-square items-center justify-center overflow-hidden rounded-t-xl bg-muted p-6">
          <img
            alt={logo.name}
            className="max-h-full max-w-full object-contain transition-transform group-hover:scale-105"
            height={256}
            src={logo.logoUrl}
            width={256}
          />
        </div>
        <div className="flex flex-col gap-1.5 p-3">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-medium text-sm">{logo.name}</h3>
            {logo.brandColor && (
              <div
                className="size-3 shrink-0 rounded-full border"
                style={{ backgroundColor: logo.brandColor }}
              />
            )}
          </div>
          {logo.category && (
            <Badge className="w-fit" variant="secondary">
              {logo.category}
            </Badge>
          )}
        </div>
      </button>
      {expanded && (
        <div className="border-t px-3 pt-2 pb-3">
          {logo.description && (
            <p className="mb-2 text-muted-foreground text-xs">
              {logo.description}
            </p>
          )}
          {logo.tags && logo.tags.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1">
              {logo.tags.map((tag) => (
                <Badge className="text-[10px]" key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {logo.website && (
              <Button
                onClick={() => {
                  window.open(logo.website, '_blank')
                }}
                size="xs"
                variant="outline"
              >
                <ExternalLink className="mr-1 size-3" />
                官网
              </Button>
            )}
            {logo.logoSvgUrl && (
              <Button
                onClick={() => {
                  window.open(logo.logoSvgUrl, '_blank')
                }}
                size="xs"
                variant="outline"
              >
                SVG
              </Button>
            )}
            <Button
              onClick={() => {
                window.open(logo.logoUrl, '_blank')
              }}
              size="xs"
              variant="outline"
            >
              PNG
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: 10 }).map((_, i) => (
        <div className="flex flex-col rounded-xl border" key={i}>
          <Skeleton className="aspect-square rounded-t-xl" />
          <div className="space-y-2 p-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-12" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ShowcasePage() {
  const logos = useQuery(api.brandLogos.listVisible)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')

  const filtered = logos?.filter((logo) => {
    if (search && !logo.name.toLowerCase().includes(search.toLowerCase())) {
      return false
    }
    if (category && logo.category !== category) {
      return false
    }
    return true
  })

  let mainContent: ReactNode
  if (logos === undefined) {
    mainContent = <LoadingSkeleton />
  } else if (filtered && filtered.length > 0) {
    mainContent = (
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {filtered.map((logo) => (
          <LogoCard key={logo._id} logo={logo} />
        ))}
      </div>
    )
  } else {
    mainContent = (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
        <p className="text-muted-foreground">
          {search || category ? '没有找到匹配的 Logo' : '暂无 Logo'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-bold text-2xl">Brand Logos</h1>
        <p className="mt-1 text-muted-foreground text-sm">
          浏览和下载品牌 Logo 资源
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8"
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索品牌..."
            value={search}
          />
        </div>
        <Select
          onValueChange={(value) => setCategory(value as string)}
          value={category}
        >
          <SelectTrigger>
            <SelectValue placeholder="所有分类" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">所有分类</SelectItem>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {mainContent}
    </div>
  )
}
