'use client'

import {
  Eye,
  EyeOff,
  Loader2,
  Pencil,
  Plus,
  Star,
  Trash2,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  createAuthor,
  deleteAuthor,
  getAllAuthors,
  toggleAuthorFeatured,
  toggleAuthorVisibility,
  updateAuthor,
} from '@/lib/actions/admin/authors'
import type { AuthorWithParsed } from '@/lib/actions/authors'

interface AuthorFormData {
  avatar: string
  bio: string
  featured: boolean
  featuredWorks: { title: string; url: string }[]
  name: string
  order: string
  specialty: string
  visible: boolean
  websiteUrl: string
}

const emptyForm: AuthorFormData = {
  name: '',
  avatar: '',
  bio: '',
  specialty: '',
  websiteUrl: '',
  featuredWorks: [],
  visible: true,
  featured: false,
  order: '',
}

function authorToForm(author: AuthorWithParsed): AuthorFormData {
  return {
    name: author.name,
    avatar: author.avatar ?? '',
    bio: author.bio ?? '',
    specialty: author.specialty.join(', '),
    websiteUrl: author.websiteUrl ?? '',
    featuredWorks: author.featuredWorks.length > 0 ? author.featuredWorks : [],
    visible: author.visible,
    featured: author.featured,
    order: author.order?.toString() ?? '',
  }
}

// --- Form Dialog ---

interface AuthorFormDialogProps {
  editing: AuthorWithParsed | null
  onClose: () => void
  open: boolean
}

function AuthorFormDialog({ open, onClose, editing }: AuthorFormDialogProps) {
  const [form, setForm] = useState<AuthorFormData>(emptyForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(editing ? authorToForm(editing) : emptyForm)
    }
  }, [open, editing])

  const setField = <K extends keyof AuthorFormData>(
    key: K,
    value: AuthorFormData[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const addWork = () => {
    setForm((prev) => ({
      ...prev,
      featuredWorks: [...prev.featuredWorks, { title: '', url: '' }],
    }))
  }

  const removeWork = (index: number) => {
    setForm((prev) => ({
      ...prev,
      featuredWorks: prev.featuredWorks.filter((_, i) => i !== index),
    }))
  }

  const updateWork = (index: number, field: 'title' | 'url', value: string) => {
    setForm((prev) => ({
      ...prev,
      featuredWorks: prev.featuredWorks.map((w, i) =>
        i === index ? { ...w, [field]: value } : w
      ),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error('请填写作者名称')
      return
    }

    setSaving(true)
    try {
      const data = {
        name: form.name.trim(),
        avatar: form.avatar.trim() || undefined,
        bio: form.bio.trim() || undefined,
        specialty: form.specialty.trim()
          ? form.specialty
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : undefined,
        websiteUrl: form.websiteUrl.trim() || undefined,
        featuredWorks: form.featuredWorks.filter(
          (w) => w.title.trim() && w.url.trim()
        ),
        visible: form.visible,
        featured: form.featured,
        order: form.order ? Number.parseInt(form.order, 10) : undefined,
      }

      if (editing) {
        await updateAuthor(editing.id, data)
        toast.success('作者已更新')
      } else {
        await createAuthor(data)
        toast.success('作者已创建')
      }
      onClose()
    } catch {
      toast.error('操作失败，请重试')
    } finally {
      setSaving(false)
    }
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
    <Dialog onOpenChange={(nextOpen) => !nextOpen && onClose()} open={open}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? '编辑作者' : '新增作者'}</DialogTitle>
          <DialogDescription>
            {editing ? '修改作者信息' : '添加一个新的作者'}
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="author-name">名称 *</Label>
            <Input
              id="author-name"
              onChange={(e) => setField('name', e.target.value)}
              placeholder="作者名称"
              required
              value={form.name}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="author-avatar">头像 URL</Label>
            <Input
              id="author-avatar"
              onChange={(e) => setField('avatar', e.target.value)}
              placeholder="https://..."
              value={form.avatar}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="author-bio">简介</Label>
            <Textarea
              id="author-bio"
              onChange={(e) => setField('bio', e.target.value)}
              placeholder="作者简介..."
              rows={3}
              value={form.bio}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="author-specialty">专长</Label>
            <Input
              id="author-specialty"
              onChange={(e) => setField('specialty', e.target.value)}
              placeholder="用逗号分隔，例如: 品牌设计, 字体设计"
              value={form.specialty}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="author-website">网站</Label>
            <Input
              id="author-website"
              onChange={(e) => setField('websiteUrl', e.target.value)}
              placeholder="https://..."
              value={form.websiteUrl}
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label>代表作品</Label>
              <Button onClick={addWork} size="xs" type="button" variant="ghost">
                <Plus className="mr-1 size-3" />
                添加
              </Button>
            </div>
            {form.featuredWorks.map((work, i) => (
              <div className="flex items-center gap-2" key={i}>
                <Input
                  className="flex-1"
                  onChange={(e) => updateWork(i, 'title', e.target.value)}
                  placeholder="作品名称"
                  value={work.title}
                />
                <Input
                  className="flex-1"
                  onChange={(e) => updateWork(i, 'url', e.target.value)}
                  placeholder="作品链接"
                  value={work.url}
                />
                <Button
                  onClick={() => removeWork(i)}
                  size="icon-xs"
                  type="button"
                  variant="ghost"
                >
                  <X />
                </Button>
              </div>
            ))}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="author-order">排序</Label>
            <Input
              id="author-order"
              onChange={(e) => setField('order', e.target.value)}
              placeholder="数字越小越靠前"
              type="number"
              value={form.order}
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={form.visible}
                id="author-visible"
                onCheckedChange={(checked) =>
                  setField('visible', checked as boolean)
                }
              />
              <Label htmlFor="author-visible">公开可见</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.featured}
                id="author-featured"
                onCheckedChange={(checked) =>
                  setField('featured', checked as boolean)
                }
              />
              <Label htmlFor="author-featured">编辑推荐</Label>
            </div>
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

// --- Delete Dialog ---

interface DeleteConfirmDialogProps {
  author: AuthorWithParsed | null
  onClose: () => void
  open: boolean
}

function DeleteConfirmDialog({
  open,
  onClose,
  author,
}: DeleteConfirmDialogProps) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!author) {
      return
    }
    setDeleting(true)
    try {
      await deleteAuthor(author.id)
      toast.success(`已删除 "${author.name}"`)
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
            确定要删除 &ldquo;{author?.name}&rdquo; 吗？此操作不可撤销。
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

// --- List Item ---

interface AuthorListItemProps {
  author: AuthorWithParsed
  onDelete: (author: AuthorWithParsed) => void
  onEdit: (author: AuthorWithParsed) => void
  onToggleFeatured: (author: AuthorWithParsed) => void
  onToggleVisibility: (author: AuthorWithParsed) => void
}

function AuthorListItem({
  author,
  onEdit,
  onDelete,
  onToggleVisibility,
  onToggleFeatured,
}: AuthorListItemProps) {
  return (
    <li className="grid gap-3 px-4 py-4 transition-colors hover:bg-muted/30 sm:grid-cols-[auto_minmax(0,1.5fr)_minmax(0,0.8fr)_auto] sm:items-center">
      <Avatar className="size-10">
        <AvatarImage alt={author.name} src={author.avatar ?? undefined} />
        <AvatarFallback>{author.name.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>

      <div className="min-w-0 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate font-medium text-sm sm:text-base">
            {author.name}
          </h3>
          <Badge variant={author.visible ? 'secondary' : 'outline'}>
            {author.visible ? '已公开' : '已隐藏'}
          </Badge>
          {author.featured && (
            <Badge variant="secondary">
              <Star className="mr-1 size-3" />
              推荐
            </Badge>
          )}
        </div>
        {author.bio && (
          <p className="line-clamp-1 text-muted-foreground text-xs sm:text-sm">
            {author.bio}
          </p>
        )}
      </div>

      <div className="hidden min-w-0 space-y-1.5 sm:block">
        {author.specialty.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {author.specialty.slice(0, 3).map((s) => (
              <Badge className="text-[11px]" key={s} variant="outline">
                {s}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 border-t pt-3 sm:justify-end sm:border-t-0 sm:pt-0">
        <Button onClick={() => onEdit(author)} size="icon-xs" variant="ghost">
          <Pencil />
        </Button>
        <Button
          onClick={() => onToggleVisibility(author)}
          size="icon-xs"
          variant="ghost"
        >
          {author.visible ? <Eye /> : <EyeOff />}
        </Button>
        <Button
          onClick={() => onToggleFeatured(author)}
          size="icon-xs"
          variant="ghost"
        >
          <Star
            className={author.featured ? 'fill-amber-500 text-amber-500' : ''}
          />
        </Button>
        <Button
          className="ml-auto"
          onClick={() => onDelete(author)}
          size="icon-xs"
          variant="ghost"
        >
          <Trash2 className="text-destructive" />
        </Button>
      </div>
    </li>
  )
}

// --- Main Content ---

export function AdminAuthorsContent() {
  const [authors, setAuthors] = useState<AuthorWithParsed[]>([])
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<AuthorWithParsed | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AuthorWithParsed | null>(
    null
  )
  const [isPending, startTransition] = useTransition()

  const fetchAuthors = useCallback(() => {
    startTransition(async () => {
      const result = await getAllAuthors()
      setAuthors(result)
    })
  }, [])

  useEffect(() => {
    fetchAuthors()
  }, [fetchAuthors])

  const handleEdit = (author: AuthorWithParsed) => {
    setEditing(author)
    setFormOpen(true)
  }

  const handleCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const handleToggleVisibility = async (author: AuthorWithParsed) => {
    try {
      await toggleAuthorVisibility(author.id, author.visible)
      toast.success(`已${author.visible ? '隐藏' : '显示'} "${author.name}"`)
      fetchAuthors()
    } catch {
      toast.error('操作失败')
    }
  }

  const handleToggleFeatured = async (author: AuthorWithParsed) => {
    try {
      await toggleAuthorFeatured(author.id, author.featured)
      toast.success(
        `已${author.featured ? '取消推荐' : '设为推荐'} "${author.name}"`
      )
      fetchAuthors()
    } catch {
      toast.error('操作失败')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl">作者管理</h1>
          <p className="mt-1 text-muted-foreground text-sm">
            管理所有作者信息 · 共 {authors.length} 位
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-1.5 size-4" />
          新增作者
        </Button>
      </div>

      {isPending && (
        <div className="flex justify-center py-8">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {!isPending && authors.length > 0 ? (
        <div className="overflow-hidden rounded-xl border bg-background">
          <div className="hidden grid-cols-[auto_minmax(0,1.5fr)_minmax(0,0.8fr)_auto] gap-3 border-b bg-muted/30 px-4 py-3 text-muted-foreground text-xs uppercase tracking-[0.12em] sm:grid">
            <span className="w-10" />
            <span>作者信息</span>
            <span>专长</span>
            <span className="text-right">操作</span>
          </div>
          <ul className="divide-y">
            {authors.map((author) => (
              <AuthorListItem
                author={author}
                key={author.id}
                onDelete={setDeleteTarget}
                onEdit={handleEdit}
                onToggleFeatured={handleToggleFeatured}
                onToggleVisibility={handleToggleVisibility}
              />
            ))}
          </ul>
        </div>
      ) : (
        !isPending && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
            <p className="text-muted-foreground">还没有添加任何作者</p>
            <Button className="mt-4" onClick={handleCreate} variant="outline">
              <Plus className="mr-1.5 size-4" />
              添加第一位作者
            </Button>
          </div>
        )
      )}

      <AuthorFormDialog
        editing={editing}
        onClose={() => {
          setFormOpen(false)
          setEditing(null)
          fetchAuthors()
        }}
        open={formOpen}
      />
      <DeleteConfirmDialog
        author={deleteTarget}
        onClose={() => {
          setDeleteTarget(null)
          fetchAuthors()
        }}
        open={!!deleteTarget}
      />
    </div>
  )
}
