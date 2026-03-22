'use client'

import { api } from '@convex/_generated/api'
import type { Doc } from '@convex/_generated/dataModel'
import { useQuery } from 'convex/react'
import { Download, ExternalLink, Search } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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

function LogoCard({ logo, onClick }: { logo: BrandLogo; onClick: () => void }) {
  return (
    <button
      className="group flex flex-col overflow-hidden rounded-lg border bg-card text-left outline-none transition-all hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring"
      onClick={onClick}
      type="button"
    >
      <div className="flex aspect-4/3 items-center justify-center overflow-hidden bg-muted p-4">
        <img
          alt={logo.name}
          className="max-h-full max-w-full object-contain transition-transform group-hover:scale-105"
          height={160}
          src={logo.logoUrl}
          width={160}
        />
      </div>
      <div className="flex flex-col gap-1 p-2.5">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-medium text-sm">{logo.name}</h3>
          {logo.brandColor && (
            <div
              className="size-2.5 shrink-0 rounded-full border"
              style={{ backgroundColor: logo.brandColor }}
            />
          )}
        </div>
        {logo.category && (
          <Badge className="w-fit text-[10px]" variant="secondary">
            {logo.category}
          </Badge>
        )}
      </div>
    </button>
  )
}

function LogoDetailModal({
  logo,
  onClose,
  open,
}: {
  logo: BrandLogo | null
  onClose: () => void
  open: boolean
}) {
  if (!logo) {
    return null
  }

  return (
    <Dialog onOpenChange={(nextOpen) => !nextOpen && onClose()} open={open}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {logo.name}
            {logo.brandColor && (
              <div
                className="size-3 shrink-0 rounded-full border"
                style={{ backgroundColor: logo.brandColor }}
              />
            )}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex aspect-3/2 items-center justify-center overflow-hidden rounded-lg bg-muted p-6">
            <img
              alt={logo.name}
              className="max-h-full max-w-full object-contain"
              height={320}
              src={logo.logoUrl}
              width={320}
            />
          </div>

          {logo.category && (
            <Badge className="w-fit" variant="secondary">
              {logo.category}
            </Badge>
          )}

          {logo.description && (
            <p className="text-muted-foreground text-sm">{logo.description}</p>
          )}

          {logo.tags && logo.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {logo.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 border-t pt-4">
            {logo.website && (
              <Button
                onClick={() => window.open(logo.website, '_blank')}
                size="sm"
                variant="outline"
              >
                <ExternalLink className="mr-1.5 size-3.5" />
                官网
              </Button>
            )}
            <Button
              onClick={async () => {
                try {
                  const url = logo.logoSvgUrl || logo.logoUrl
                  const res = await fetch(url)
                  const blob = await res.blob()
                  const a = document.createElement('a')
                  a.href = URL.createObjectURL(blob)
                  const ext = logo.logoSvgUrl ? '.svg' : '.png'
                  a.download = `${logo.name}${ext}`
                  a.click()
                  URL.revokeObjectURL(a.href)
                } catch {
                  window.open(logo.logoSvgUrl || logo.logoUrl, '_blank')
                }
              }}
              size="sm"
              variant="outline"
            >
              <Download className="mr-1.5 size-3.5" />
              下载
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function LoadingSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <div className="flex flex-col rounded-lg border" key={i}>
          <Skeleton className="aspect-4/3 rounded-t-lg" />
          <div className="space-y-1.5 p-2.5">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-10" />
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
  const [selectedLogo, setSelectedLogo] = useState<BrandLogo | null>(null)

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
      <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {filtered.map((logo) => (
          <LogoCard
            key={logo._id}
            logo={logo}
            onClick={() => setSelectedLogo(logo)}
          />
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

      {/* Detail Modal */}
      <LogoDetailModal
        logo={selectedLogo}
        onClose={() => setSelectedLogo(null)}
        open={!!selectedLogo}
      />
    </div>
  )
}
