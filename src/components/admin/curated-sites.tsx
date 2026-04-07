'use client'

import { useUploadFiles } from '@better-upload/client'
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  ImageIcon,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { curatedSites as staticSites } from '@/data/platform'
import type { SiteCategory } from '@/db/schema'
import {
  createSite,
  deleteSite,
  type SearchSitesResult,
  searchSites,
  seedSites,
  toggleSiteVisibility,
  updateSite,
} from '@/lib/actions/admin/sites'
import type { CuratedSiteWithTags } from '@/lib/actions/sites'

const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || ''

function stripTrailingSlash(url: string) {
  return url.endsWith('/') ? url.slice(0, -1) : url
}

interface SiteFormData {
  category: string
  description: string
  href: string
  image: string
  name: string
  notes: string
  order: string
  tags: string
  visible: boolean
}

const emptyForm: SiteFormData = {
  name: '',
  href: '',
  description: '',
  category: '',
  image: '',
  notes: '',
  tags: '',
  order: '',
  visible: true,
}

function siteToForm(site: CuratedSiteWithTags): SiteFormData {
  return {
    name: site.name,
    href: site.href,
    description: site.description,
    category: site.category,
    image: site.image ?? '',
    notes: site.notes ?? '',
    tags: site.tags?.join(', ') ?? '',
    order: site.order?.toString() ?? '',
    visible: site.visible,
  }
}

interface SiteFormDialogProps {
  categories: SiteCategory[]
  editing: CuratedSiteWithTags | null
  onClose: () => void
  open: boolean
}

function SiteFormDialog({
  open,
  onClose,
  editing,
  categories,
}: SiteFormDialogProps) {
  const [form, setForm] = useState<SiteFormData>(emptyForm)
  const [saving, setSaving] = useState(false)

  const { control: uploadControl } = useUploadFiles({
    route: 'logos',
    onUploadComplete: ({ files: uploaded, metadata }) => {
      const base =
        typeof metadata.r2PublicUrl === 'string' && metadata.r2PublicUrl
          ? stripTrailingSlash(metadata.r2PublicUrl)
          : stripTrailingSlash(R2_PUBLIC_URL)
      if (uploaded.length > 0) {
        const url = `${base}/${uploaded[0].objectInfo.key}`
        setForm((prev) => ({ ...prev, image: url }))
        toast.success('截图已上传')
      }
    },
    onError: (error) => {
      toast.error(error.message || '上传失败')
    },
  })

  useEffect(() => {
    if (open) {
      setForm(editing ? siteToForm(editing) : emptyForm)
    }
  }, [open, editing])

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      onClose()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!(form.name.trim() && form.href.trim() && form.description.trim())) {
      toast.error('请填写站点名称、链接和描述')
      return
    }

    setSaving(true)
    try {
      const data = {
        name: form.name.trim(),
        href: form.href.trim(),
        description: form.description.trim(),
        category: form.category.trim(),
        image: form.image.trim() || undefined,
        notes: form.notes.trim() || undefined,
        tags: form.tags.trim()
          ? form.tags
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean)
          : undefined,
        order: form.order ? Number.parseInt(form.order, 10) : undefined,
        visible: form.visible,
      }

      if (editing) {
        await updateSite(editing.id, data)
        toast.success('网站已更新')
      } else {
        await createSite(data)
        toast.success('网站已创建')
      }
      onClose()
    } catch (err) {
      if (err instanceof Error && err.message === 'duplicate_name') {
        toast.error(`站点名称 "${form.name.trim()}" 已存在`)
      } else {
        toast.error('操作失败，请重试')
      }
    } finally {
      setSaving(false)
    }
  }

  const setField = <K extends keyof SiteFormData>(
    key: K,
    value: SiteFormData[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  let submitLabel: string
  if (saving) {
    submitLabel = '保存中...'
  } else if (editing) {
    submitLabel = '保存修改'
  } else {
    submitLabel = '创建'
  }

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? '编辑网站' : '新增网站'}</DialogTitle>
          <DialogDescription>
            {editing ? '修改推荐网站信息' : '添加一个新的推荐网站'}
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="name">站点名称 *</Label>
            <Input
              id="name"
              onChange={(e) => setField('name', e.target.value)}
              placeholder="例如: Behance"
              required
              value={form.name}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="href">网站链接 *</Label>
            <Input
              id="href"
              onChange={(e) => setField('href', e.target.value)}
              placeholder="https://..."
              required
              type="url"
              value={form.href}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">简介 *</Label>
            <Textarea
              id="description"
              onChange={(e) => setField('description', e.target.value)}
              placeholder="一两句话介绍这个网站..."
              rows={3}
              value={form.description}
            />
          </div>
          <div className="grid gap-2">
            <Label>网站截图</Label>
            {form.image ? (
              <div className="relative">
                <img
                  alt="网站截图"
                  className="aspect-video w-full rounded-lg border object-cover"
                  height={180}
                  src={form.image}
                  width={320}
                />
                <Button
                  className="absolute top-2 right-2"
                  onClick={() => setField('image', '')}
                  size="icon-xs"
                  type="button"
                  variant="secondary"
                >
                  <X className="size-3" />
                </Button>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed p-6 transition hover:bg-muted/50">
                <ImageIcon className="size-6 text-muted-foreground" />
                <span className="text-muted-foreground text-xs">
                  {uploadControl.isPending
                    ? '上传中...'
                    : '点击上传网站截图（16:10 推荐）'}
                </span>
                <input
                  accept="image/*"
                  className="hidden"
                  disabled={uploadControl.isPending}
                  onChange={(e) => {
                    const files = Array.from(e.target.files ?? [])
                    if (files.length > 0) {
                      uploadControl.upload(files)
                    }
                    e.target.value = ''
                  }}
                  type="file"
                />
              </label>
            )}
          </div>
          <div className="grid gap-2">
            <Label>分类</Label>
            <Select
              onValueChange={(value) => setField('category', value ?? '')}
              value={form.category}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="选择分类" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="notes">推荐语</Label>
            <Input
              id="notes"
              onChange={(e) => setField('notes', e.target.value)}
              placeholder="一句话推荐语，例如: 适合快速建立行业对比基线。"
              value={form.notes}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tags">标签</Label>
            <Input
              id="tags"
              onChange={(e) => setField('tags', e.target.value)}
              placeholder="用逗号分隔，例如: 趋势, 案例库"
              value={form.tags}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="order">排序</Label>
            <Input
              id="order"
              onChange={(e) => setField('order', e.target.value)}
              placeholder="数字越小越靠前"
              type="number"
              value={form.order}
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={form.visible}
              id="visible"
              onCheckedChange={(checked) =>
                setField('visible', checked as boolean)
              }
            />
            <Label htmlFor="visible">公开可见</Label>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              取消
            </DialogClose>
            <Button disabled={saving} type="submit">
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface DeleteConfirmDialogProps {
  onClose: () => void
  open: boolean
  site: CuratedSiteWithTags | null
}

function DeleteConfirmDialog({
  open,
  onClose,
  site,
}: DeleteConfirmDialogProps) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!site) {
      return
    }
    setDeleting(true)
    try {
      await deleteSite(site.id)
      toast.success(`已删除 "${site.name}"`)
      onClose()
    } catch {
      toast.error('删除失败')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Dialog onOpenChange={(nextOpen) => !nextOpen && onClose()} open={open}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>确认删除</DialogTitle>
          <DialogDescription>
            确定要删除 &ldquo;{site?.name}&rdquo; 吗？此操作不可撤销。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>取消</DialogClose>
          <Button
            disabled={deleting}
            onClick={handleDelete}
            variant="destructive"
          >
            {deleting ? '删除中...' : '确认删除'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface JsonSiteInput {
  category: string
  description: string
  href: string
  name: string
  notes?: string
  tags?: string[]
}

interface JsonImportDialogProps {
  onClose: () => void
  open: boolean
}

const JSON_EXAMPLE = `[
  {
    "name": "网站名称",
    "href": "https://example.com",
    "description": "一两句话介绍这个网站",
    "category": "分类名称",
    "notes": "推荐语（可选）",
    "tags": ["标签1", "标签2"]
  }
]`

function parseJsonSites(
  jsonText: string
): { error: string } | { sites: JsonSiteInput[] } {
  let parsed: unknown
  try {
    parsed = JSON.parse(jsonText)
  } catch {
    return { error: 'JSON 格式不正确，请检查语法' }
  }
  if (!Array.isArray(parsed)) {
    return { error: 'JSON 必须是一个数组 [ ... ]' }
  }
  if (parsed.length === 0) {
    return { error: '数组为空，没有可导入的数据' }
  }
  const sites: JsonSiteInput[] = []
  for (let i = 0; i < parsed.length; i++) {
    const item = parsed[i] as Record<string, unknown>
    if (
      typeof item.name !== 'string' ||
      typeof item.href !== 'string' ||
      typeof item.description !== 'string' ||
      typeof item.category !== 'string'
    ) {
      return {
        error: `第 ${i + 1} 条数据缺少必填字段（name、href、description、category）`,
      }
    }
    sites.push({
      name: item.name,
      href: item.href,
      description: item.description,
      category: item.category,
      notes: typeof item.notes === 'string' ? item.notes : undefined,
      tags: Array.isArray(item.tags)
        ? (item.tags as unknown[])
            .filter((t) => typeof t === 'string')
            .map(String)
        : undefined,
    })
  }
  return { sites }
}

function JsonImportDialog({ open, onClose }: JsonImportDialogProps) {
  const [jsonText, setJsonText] = useState('')
  const [error, setError] = useState('')
  const [importing, setImporting] = useState(false)

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      onClose()
      setJsonText('')
      setError('')
    }
  }

  const handleImport = async () => {
    setError('')
    const result = parseJsonSites(jsonText)
    if ('error' in result) {
      setError(result.error)
      return
    }
    setImporting(true)
    try {
      const { inserted, skipped } = await seedSites(result.sites)
      if (inserted > 0) {
        toast.success(`已成功导入 ${inserted} 个站点`)
      }
      if (skipped.length > 0) {
        toast.warning(
          `已跳过 ${skipped.length} 个重复站点：${skipped.slice(0, 3).join('、')}${skipped.length > 3 ? ' 等' : ''}`
        )
      }
      if (inserted === 0) {
        setError('所有站点均已存在，无新内容导入')
        return
      }
      onClose()
      setJsonText('')
    } catch {
      setError('导入失败，请重试')
    } finally {
      setImporting(false)
    }
  }

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>批量导入 JSON</DialogTitle>
          <DialogDescription>
            粘贴 JSON 数组，每条需包含 name、href、description、category
            四个必填字段
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>JSON 数据</Label>
            <Textarea
              className="font-mono text-xs"
              onChange={(e) => {
                setJsonText(e.target.value)
                setError('')
              }}
              placeholder={JSON_EXAMPLE}
              rows={12}
              value={jsonText}
            />
            {error && <p className="text-destructive text-xs">{error}</p>}
          </div>
          <details className="text-xs">
            <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
              查看格式示例
            </summary>
            <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-3 text-muted-foreground">
              {JSON_EXAMPLE}
            </pre>
          </details>
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>取消</DialogClose>
          <Button
            disabled={importing || !jsonText.trim()}
            onClick={handleImport}
          >
            {importing ? '导入中...' : '开始导入'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface SiteListItemProps {
  onDelete: (site: CuratedSiteWithTags) => void
  onEdit: (site: CuratedSiteWithTags) => void
  onToggleVisibility: (site: CuratedSiteWithTags) => void
  site: CuratedSiteWithTags
}

function SiteListItem({
  site,
  onEdit,
  onDelete,
  onToggleVisibility,
}: SiteListItemProps) {
  return (
    <li className="grid gap-3 px-4 py-4 transition-colors hover:bg-muted/30 sm:grid-cols-[minmax(0,1.5fr)_minmax(0,0.8fr)_auto] sm:items-center">
      <div className="min-w-0 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate font-medium text-sm sm:text-base">
            {site.name}
          </h3>
          <Badge variant={site.visible ? 'secondary' : 'outline'}>
            {site.visible ? '已公开' : '已隐藏'}
          </Badge>
        </div>
        <p className="line-clamp-2 text-muted-foreground text-xs sm:text-sm">
          {site.description}
        </p>
        <p className="truncate text-muted-foreground text-xs">{site.href}</p>
      </div>

      <div className="hidden min-w-0 space-y-1.5 sm:block">
        <Badge variant="outline">{site.category || '未分类'}</Badge>
        {site.tags && site.tags.length > 0 && (
          <p className="text-muted-foreground text-xs">
            标签 {site.tags.length} 个
          </p>
        )}
      </div>

      <div className="flex items-center gap-1 border-t pt-3 sm:justify-end sm:border-t-0 sm:pt-0">
        <Button onClick={() => onEdit(site)} size="icon-xs" variant="ghost">
          <Pencil />
        </Button>
        <Button
          onClick={() => onToggleVisibility(site)}
          size="icon-xs"
          variant="ghost"
        >
          {site.visible ? <Eye /> : <EyeOff />}
        </Button>
        <Button
          className="ml-auto"
          onClick={() => onDelete(site)}
          size="icon-xs"
          variant="ghost"
        >
          <Trash2 className="text-destructive" />
        </Button>
      </div>
    </li>
  )
}

const PAGE_SIZE = 20

interface AdminSitesContentProps {
  categories: SiteCategory[]
}

export function AdminSitesContent({ categories }: AdminSitesContentProps) {
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<CuratedSiteWithTags | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<CuratedSiteWithTags | null>(
    null
  )
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [visibilityFilter, setVisibilityFilter] = useState<
    '' | 'hidden' | 'visible'
  >('')
  const [currentPage, setCurrentPage] = useState(0)
  const [seeding, setSeeding] = useState(false)
  const [jsonImportOpen, setJsonImportOpen] = useState(false)

  const [data, setData] = useState<SearchSitesResult>({
    sites: [],
    total: 0,
    totalPages: 0,
  })
  const [isPending, startTransition] = useTransition()

  const categoryNames = categories.map((c) => c.name)

  const fetchSites = useCallback(
    (page: number, s: string, cat: string, vis: '' | 'hidden' | 'visible') => {
      startTransition(async () => {
        const result = await searchSites({
          search: s || undefined,
          category: cat || undefined,
          visibility: vis || undefined,
          page,
          pageSize: PAGE_SIZE,
        })
        setData(result)
      })
    },
    []
  )

  // Initial load + refetch on filter/page changes
  useEffect(() => {
    fetchSites(currentPage, search, categoryFilter, visibilityFilter)
  }, [currentPage, search, categoryFilter, visibilityFilter, fetchSites])

  // Reset page when filters change
  const handleSearchChange = (value: string) => {
    setSearch(value)
    setCurrentPage(0)
  }
  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value)
    setCurrentPage(0)
  }
  const handleVisibilityChange = (value: string) => {
    setVisibilityFilter(value as '' | 'hidden' | 'visible')
    setCurrentPage(0)
  }

  const reload = () => {
    fetchSites(currentPage, search, categoryFilter, visibilityFilter)
  }

  const handleEdit = (site: CuratedSiteWithTags) => {
    setEditing(site)
    setFormOpen(true)
  }

  const handleCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const handleToggleVisibility = async (site: CuratedSiteWithTags) => {
    try {
      await toggleSiteVisibility(site.id, site.visible)
      toast.success(`已${site.visible ? '隐藏' : '显示'} "${site.name}"`)
      reload()
    } catch {
      toast.error('操作失败')
    }
  }

  const handleSeed = async () => {
    setSeeding(true)
    try {
      const { inserted, skipped } = await seedSites(
        staticSites.map((s) => ({
          name: s.name,
          description: s.description,
          href: s.href,
          category: s.category,
          notes: s.notes || undefined,
          tags: s.tags.length > 0 ? s.tags : undefined,
        }))
      )
      if (inserted > 0) {
        toast.success(`已导入 ${inserted} 个预置站点`)
        reload()
      }
      if (skipped.length > 0) {
        toast.warning(`已跳过 ${skipped.length} 个重复站点`)
      }
      if (inserted === 0) {
        toast.info('所有预置站点均已存在')
      }
    } catch {
      toast.error('导入失败')
    } finally {
      setSeeding(false)
    }
  }

  const { sites: pageItems, total, totalPages } = data
  const hasFilters = !!(search || categoryFilter || visibilityFilter)
  const canGoPrev = currentPage > 0
  const canGoNext = currentPage < totalPages - 1

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl">推荐网站管理</h1>
          <p className="mt-1 text-muted-foreground text-sm">
            管理所有推荐网站资源 · 共 {total} 个
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setJsonImportOpen(true)} variant="outline">
            <Upload className="mr-1.5 size-4" />
            批量导入
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="mr-1.5 size-4" />
            新增网站
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8"
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="搜索站点名称..."
            value={search}
          />
        </div>
        <Select
          onValueChange={(value) => handleCategoryChange(value as string)}
          value={categoryFilter}
        >
          <SelectTrigger>
            <SelectValue placeholder="所有分类" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">所有分类</SelectItem>
            {categoryNames.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          onValueChange={(value) => handleVisibilityChange(value as string)}
          value={visibilityFilter}
        >
          <SelectTrigger>
            <SelectValue placeholder="所有状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">所有状态</SelectItem>
            <SelectItem value="visible">已公开</SelectItem>
            <SelectItem value="hidden">已隐藏</SelectItem>
          </SelectContent>
        </Select>
        {isPending && (
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* List */}
      {pageItems.length > 0 ? (
        <div className="overflow-hidden rounded-xl border bg-background">
          <div className="hidden grid-cols-[minmax(0,1.5fr)_minmax(0,0.8fr)_auto] gap-3 border-b bg-muted/30 px-4 py-3 text-muted-foreground text-xs uppercase tracking-[0.12em] sm:grid">
            <span>站点信息</span>
            <span>分类与标签</span>
            <span className="text-right">操作</span>
          </div>
          <ul className="divide-y">
            {pageItems.map((site) => (
              <SiteListItem
                key={site.id}
                onDelete={setDeleteTarget}
                onEdit={handleEdit}
                onToggleVisibility={handleToggleVisibility}
                site={site}
              />
            ))}
          </ul>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
          <p className="text-muted-foreground">
            {hasFilters ? '没有找到匹配的站点' : '还没有添加任何推荐网站'}
          </p>
          {!hasFilters && (
            <div className="mt-4 flex flex-col items-center gap-2 sm:flex-row">
              <Button onClick={handleCreate} variant="outline">
                <Plus className="mr-1.5 size-4" />
                添加第一个网站
              </Button>
              <Button
                disabled={seeding}
                onClick={handleSeed}
                variant="secondary"
              >
                {seeding
                  ? '导入中...'
                  : `导入预置数据（${staticSites.length} 个站点）`}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">
            第 {currentPage + 1} 页 / {totalPages} 页
          </p>
          <div className="flex items-center gap-2">
            <Button
              disabled={!canGoPrev}
              onClick={() => setCurrentPage((p) => p - 1)}
              size="sm"
              variant="outline"
            >
              <ChevronLeft className="mr-1 size-4" />
              上一页
            </Button>
            <Button
              disabled={!canGoNext}
              onClick={() => setCurrentPage((p) => p + 1)}
              size="sm"
              variant="outline"
            >
              下一页
              <ChevronRight className="ml-1 size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <SiteFormDialog
        categories={categories}
        editing={editing}
        onClose={() => {
          setFormOpen(false)
          setEditing(null)
          reload()
        }}
        open={formOpen}
      />
      <DeleteConfirmDialog
        onClose={() => {
          setDeleteTarget(null)
          reload()
        }}
        open={!!deleteTarget}
        site={deleteTarget}
      />
      <JsonImportDialog
        onClose={() => {
          setJsonImportOpen(false)
          reload()
        }}
        open={jsonImportOpen}
      />
    </div>
  )
}
