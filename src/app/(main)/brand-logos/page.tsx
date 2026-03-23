'use client'

import { Dialog as DialogPrimitive } from '@base-ui/react/dialog'
import { api } from '@convex/_generated/api'
import type { Doc } from '@convex/_generated/dataModel'
import { useQuery } from 'convex/react'
import { Download, ExternalLink, Search, XIcon } from 'lucide-react'
import { AnimatePresence, motion, type Transition } from 'motion/react'
import { type ReactNode, useCallback, useRef, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogHeader,
  DialogPortal,
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

interface CardRect {
  height: number
  width: number
  x: number
  y: number
}

const SPRING: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 35,
  mass: 0.8,
}

const FADE: Transition = {
  duration: 0.2,
  ease: 'easeOut',
}

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

function LogoCard({
  logo,
  onSelect,
}: {
  logo: BrandLogo
  onSelect: (logo: BrandLogo, rect: CardRect) => void
}) {
  const ref = useRef<HTMLButtonElement>(null)

  const handleClick = () => {
    if (ref.current) {
      const r = ref.current.getBoundingClientRect()
      onSelect(logo, { x: r.x, y: r.y, width: r.width, height: r.height })
    }
  }

  return (
    <motion.button
      className="group flex flex-col overflow-hidden rounded-lg border bg-card text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
      onClick={handleClick}
      ref={ref}
      type="button"
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.985 }}
    >
      <div className="flex aspect-4/3 items-center justify-center overflow-hidden bg-muted p-4">
        <img
          alt={logo.name}
          className="h-full w-full object-contain"
          draggable={false}
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
    </motion.button>
  )
}

function LogoDetailModal({
  logo,
  origin,
  onClose,
}: {
  logo: BrandLogo
  origin: CardRect
  onClose: () => void
}) {
  // Calculate the transform origin so the modal appears to expand from the card
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1024
  const vh = typeof window !== 'undefined' ? window.innerHeight : 768

  // Modal final size (approx center of viewport)
  const modalW = Math.min(672, vw - 48) // max-w-2xl = 672px, minus padding
  const modalH = Math.min(vh * 0.85, 700) // max-h-[85vh]
  const finalX = (vw - modalW) / 2
  const finalY = (vh - modalH) / 2

  const scaleX = origin.width / modalW
  const scaleY = origin.height / modalH

  // Translate so scaled modal overlaps the card position
  const translateX = origin.x - finalX - (modalW * (1 - scaleX)) / 2
  const translateY = origin.y - finalY - (modalH * (1 - scaleY)) / 2

  return (
    <Dialog onOpenChange={(nextOpen) => !nextOpen && onClose()} open>
      <DialogPortal>
        <DialogPrimitive.Backdrop
          className="fixed inset-0 z-50 bg-black/16 supports-backdrop-filter:backdrop-blur-xs"
          render={
            <motion.div
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              transition={FADE}
            />
          }
        />
        <DialogPrimitive.Popup
          className="fixed inset-0 z-50 flex items-center justify-center p-4 outline-none sm:p-6"
          render={
            <motion.div
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              initial={{ opacity: 1 }}
              transition={FADE}
            />
          }
        >
          <motion.div
            animate={{
              scale: 1,
              x: 0,
              y: 0,
              opacity: 1,
            }}
            className="relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border bg-background text-sm shadow-2xl ring-1 ring-foreground/10"
            exit={{
              scale: Math.max(scaleX, scaleY),
              x: translateX,
              y: translateY,
              opacity: 0,
            }}
            initial={{
              scale: Math.max(scaleX, scaleY),
              x: translateX,
              y: translateY,
              opacity: 0.6,
            }}
            transition={SPRING}
          >
            <DialogPrimitive.Close
              render={
                <Button
                  className="absolute top-3 right-3 z-10"
                  size="icon-sm"
                  variant="ghost"
                />
              }
            >
              <XIcon className="size-4" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>

            <div className="overflow-y-auto">
              <div className="flex aspect-3/2 items-center justify-center overflow-hidden bg-muted p-6 sm:p-8">
                <img
                  alt={logo.name}
                  className="h-full w-full object-contain"
                  draggable={false}
                  height={320}
                  src={logo.logoUrl}
                  width={320}
                />
              </div>

              <div className="flex flex-col gap-4 p-4 sm:p-5">
                <DialogHeader className="gap-3">
                  <DialogTitle className="flex items-center gap-2 pr-10 text-lg">
                    <span className="truncate">{logo.name}</span>
                    {logo.brandColor && (
                      <div
                        className="size-3 shrink-0 rounded-full border"
                        style={{ backgroundColor: logo.brandColor }}
                      />
                    )}
                  </DialogTitle>
                  {logo.category && (
                    <Badge className="w-fit" variant="secondary">
                      {logo.category}
                    </Badge>
                  )}
                </DialogHeader>

                {logo.description && (
                  <p className="text-muted-foreground text-sm">
                    {logo.description}
                  </p>
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
            </div>
          </motion.div>
        </DialogPrimitive.Popup>
      </DialogPortal>
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

export default function BrandLogosPage() {
  const logos = useQuery(api.brandLogos.listVisible)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [selectedLogo, setSelectedLogo] = useState<BrandLogo | null>(null)
  const [cardRect, setCardRect] = useState<CardRect | null>(null)

  const handleSelect = useCallback((logo: BrandLogo, rect: CardRect) => {
    setCardRect(rect)
    setSelectedLogo(logo)
  }, [])

  const handleClose = useCallback(() => {
    setSelectedLogo(null)
    setCardRect(null)
  }, [])

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
          <LogoCard key={logo._id} logo={logo} onSelect={handleSelect} />
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

      <AnimatePresence>
        {selectedLogo && cardRect && (
          <LogoDetailModal
            key={selectedLogo._id}
            logo={selectedLogo}
            onClose={handleClose}
            origin={cardRect}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
