'use client'

import { api } from '@convex/_generated/api'
import type { Doc } from '@convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { Eye, EyeOff, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
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

interface LogoFormData {
  brandColor: string
  category: string
  description: string
  logoSvgUrl: string
  logoUrl: string
  name: string
  tags: string
  visible: boolean
  website: string
}

const emptyForm: LogoFormData = {
  name: '',
  logoUrl: '',
  logoSvgUrl: '',
  description: '',
  category: '',
  tags: '',
  website: '',
  brandColor: '',
  visible: true,
}

function logoToForm(logo: BrandLogo): LogoFormData {
  return {
    name: logo.name,
    logoUrl: logo.logoUrl,
    logoSvgUrl: logo.logoSvgUrl ?? '',
    description: logo.description ?? '',
    category: logo.category ?? '',
    tags: logo.tags?.join(', ') ?? '',
    website: logo.website ?? '',
    brandColor: logo.brandColor ?? '',
    visible: logo.visible,
  }
}

interface LogoFormDialogProps {
  editing: BrandLogo | null
  onClose: () => void
  open: boolean
}

export function LogoFormDialog({
  open,
  onClose,
  editing,
}: LogoFormDialogProps) {
  const create = useMutation(api.brandLogos.create)
  const update = useMutation(api.brandLogos.update)
  const [form, setForm] = useState<LogoFormData>(emptyForm)
  const [saving, setSaving] = useState(false)

  // Sync form data whenever dialog opens or editing target changes
  useEffect(() => {
    if (open) {
      setForm(editing ? logoToForm(editing) : emptyForm)
    }
  }, [open, editing])

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      onClose()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!(form.name.trim() && form.logoUrl.trim())) {
      toast.error('请填写品牌名称和 Logo URL')
      return
    }

    setSaving(true)
    try {
      const data = {
        name: form.name.trim(),
        logoUrl: form.logoUrl.trim(),
        logoSvgUrl: form.logoSvgUrl.trim() || undefined,
        description: form.description.trim() || undefined,
        category: form.category || undefined,
        tags: form.tags.trim()
          ? form.tags
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean)
          : undefined,
        website: form.website.trim() || undefined,
        brandColor: form.brandColor.trim() || undefined,
        visible: form.visible,
      }

      if (editing) {
        await update({ id: editing._id, ...data })
        toast.success('Logo 已更新')
      } else {
        await create(data)
        toast.success('Logo 已创建')
      }
      onClose()
    } catch {
      toast.error('操作失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  const setField = <K extends keyof LogoFormData>(
    key: K,
    value: LogoFormData[K]
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
          <DialogTitle>{editing ? '编辑 Logo' : '新增 Logo'}</DialogTitle>
          <DialogDescription>
            {editing ? '修改品牌 Logo 信息' : '添加一个新的品牌 Logo'}
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="name">品牌名称 *</Label>
            <Input
              id="name"
              onChange={(e) => setField('name', e.target.value)}
              placeholder="例如: Apple"
              required
              value={form.name}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="logoUrl">Logo URL *</Label>
            <Input
              id="logoUrl"
              onChange={(e) => setField('logoUrl', e.target.value)}
              placeholder="https://example.com/logo.png"
              required
              type="url"
              value={form.logoUrl}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="logoSvgUrl">SVG Logo URL</Label>
            <Input
              id="logoSvgUrl"
              onChange={(e) => setField('logoSvgUrl', e.target.value)}
              placeholder="https://example.com/logo.svg"
              type="url"
              value={form.logoSvgUrl}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">描述</Label>
            <Textarea
              id="description"
              onChange={(e) => setField('description', e.target.value)}
              placeholder="品牌简介..."
              rows={3}
              value={form.description}
            />
          </div>
          <div className="grid gap-2">
            <Label>分类</Label>
            <Select
              onValueChange={(value) => setField('category', value as string)}
              value={form.category}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="选择分类" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tags">标签</Label>
            <Input
              id="tags"
              onChange={(e) => setField('tags', e.target.value)}
              placeholder="用逗号分隔，例如: 科技, 手机, 电脑"
              value={form.tags}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="website">品牌官网</Label>
            <Input
              id="website"
              onChange={(e) => setField('website', e.target.value)}
              placeholder="https://apple.com"
              type="url"
              value={form.website}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="brandColor">品牌主色</Label>
            <div className="flex items-center gap-2">
              <Input
                id="brandColor"
                onChange={(e) => setField('brandColor', e.target.value)}
                placeholder="#000000"
                value={form.brandColor}
              />
              {form.brandColor && (
                <div
                  className="size-8 shrink-0 rounded-md border"
                  style={{ backgroundColor: form.brandColor }}
                />
              )}
            </div>
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
  logo: BrandLogo | null
  onClose: () => void
  open: boolean
}

export function DeleteConfirmDialog({
  open,
  onClose,
  logo,
}: DeleteConfirmDialogProps) {
  const remove = useMutation(api.brandLogos.remove)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!logo) {
      return
    }
    setDeleting(true)
    try {
      await remove({ id: logo._id })
      toast.success(`已删除 "${logo.name}"`)
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
            确定要删除 &ldquo;{logo?.name}&rdquo; 吗？此操作不可撤销。
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

interface LogoCardProps {
  logo: BrandLogo
  onDelete: (logo: BrandLogo) => void
  onEdit: (logo: BrandLogo) => void
  onToggleVisibility: (logo: BrandLogo) => void
}

function LogoCard({
  logo,
  onEdit,
  onDelete,
  onToggleVisibility,
}: LogoCardProps) {
  return (
    <div className="group relative flex flex-col rounded-lg border bg-card p-2.5 transition-shadow hover:shadow-md">
      <div className="relative mb-2 flex aspect-4/3 items-center justify-center overflow-hidden rounded-md bg-muted">
        <img
          alt={logo.name}
          className="max-h-full max-w-full object-contain p-3"
          height={160}
          src={logo.logoUrl}
          width={160}
        />
        {!logo.visible && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60">
            <EyeOff className="size-6 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1">
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
        {logo.description && (
          <p className="line-clamp-2 text-muted-foreground text-xs">
            {logo.description}
          </p>
        )}
      </div>
      <div className="mt-2 flex items-center gap-1 border-t pt-2">
        <Button onClick={() => onEdit(logo)} size="icon-xs" variant="ghost">
          <Pencil />
        </Button>
        <Button
          onClick={() => onToggleVisibility(logo)}
          size="icon-xs"
          variant="ghost"
        >
          {logo.visible ? <Eye /> : <EyeOff />}
        </Button>
        <Button
          className="ml-auto"
          onClick={() => onDelete(logo)}
          size="icon-xs"
          variant="ghost"
        >
          <Trash2 className="text-destructive" />
        </Button>
      </div>
    </div>
  )
}

interface AdminLogosContentProps {
  logos: BrandLogo[]
}

export function AdminLogosContent({ logos }: AdminLogosContentProps) {
  const toggleVisibility = useMutation(api.brandLogos.toggleVisibility)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<BrandLogo | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<BrandLogo | null>(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [visibilityFilter, setVisibilityFilter] = useState<string>('')

  const filtered = logos.filter((logo) => {
    if (search && !logo.name.toLowerCase().includes(search.toLowerCase())) {
      return false
    }
    if (categoryFilter && logo.category !== categoryFilter) {
      return false
    }
    if (visibilityFilter === 'visible' && !logo.visible) {
      return false
    }
    if (visibilityFilter === 'hidden' && logo.visible) {
      return false
    }
    return true
  })

  const handleEdit = (logo: BrandLogo) => {
    setEditing(logo)
    setFormOpen(true)
  }

  const handleCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const handleToggleVisibility = async (logo: BrandLogo) => {
    try {
      await toggleVisibility({ id: logo._id })
      toast.success(`已${logo.visible ? '隐藏' : '显示'} "${logo.name}"`)
    } catch {
      toast.error('操作失败')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl">Logo 管理</h1>
          <p className="mt-1 text-muted-foreground text-sm">
            管理所有品牌 Logo 资源 · 共 {logos.length} 个
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-1.5 size-4" />
          新增 Logo
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8"
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索品牌名称..."
            value={search}
          />
        </div>
        <Select
          onValueChange={(value) => setCategoryFilter(value as string)}
          value={categoryFilter}
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
        <Select
          onValueChange={(value) => setVisibilityFilter(value as string)}
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
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((logo) => (
            <LogoCard
              key={logo._id}
              logo={logo}
              onDelete={setDeleteTarget}
              onEdit={handleEdit}
              onToggleVisibility={handleToggleVisibility}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
          <p className="text-muted-foreground">
            {search || categoryFilter || visibilityFilter
              ? '没有找到匹配的 Logo'
              : '还没有添加任何 Logo'}
          </p>
          {!(search || categoryFilter || visibilityFilter) && (
            <Button className="mt-4" onClick={handleCreate} variant="outline">
              <Plus className="mr-1.5 size-4" />
              添加第一个 Logo
            </Button>
          )}
        </div>
      )}

      {/* Dialogs */}
      <LogoFormDialog
        editing={editing}
        onClose={() => {
          setFormOpen(false)
          setEditing(null)
        }}
        open={formOpen}
      />
      <DeleteConfirmDialog
        logo={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        open={!!deleteTarget}
      />
    </div>
  )
}
