'use client'

import { Download, GripVertical, Pencil, Plus, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'
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
import { Skeleton } from '@/components/ui/skeleton'
import type { SiteCategory } from '@/db/schema'
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  seedCategories,
  updateCategory,
} from '@/lib/actions/admin/categories'

const PRESET_CATEGORIES = [
  { name: '灵感案例', order: 1 },
  { name: '社区作品', order: 2 },
  { name: '品牌资源', order: 3 },
  { name: '字体色彩', order: 4 },
  { name: '设计工具', order: 5 },
  { name: '学习参考', order: 6 },
]

function CategoryFormDialog({
  open,
  onClose,
  editing,
  onDone,
}: {
  editing: SiteCategory | null
  onClose: () => void
  onDone: () => void
  open: boolean
}) {
  const [name, setName] = useState('')
  const [order, setOrder] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setName(editing?.name ?? '')
      setOrder(editing?.order?.toString() ?? '')
    }
  }, [open, editing])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('请填写分类名称')
      return
    }
    setSaving(true)
    try {
      const orderVal = order ? Number.parseInt(order, 10) : undefined
      if (editing) {
        await updateCategory(editing.id, { name: name.trim(), order: orderVal })
        toast.success('分类已更新')
      } else {
        await createCategory({ name: name.trim(), order: orderVal })
        toast.success('分类已创建')
      }
      onDone()
      onClose()
    } catch {
      toast.error('操作失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  let submitLabel = '创建'
  if (saving) {
    submitLabel = '保存中...'
  } else if (editing) {
    submitLabel = '保存修改'
  }

  return (
    <Dialog onOpenChange={(next) => !next && onClose()} open={open}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{editing ? '编辑分类' : '新增分类'}</DialogTitle>
          <DialogDescription>
            分类名称将显示在网站导航的筛选标签中。
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="cat-name">分类名称 *</Label>
            <Input
              id="cat-name"
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：灵感案例"
              required
              value={name}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cat-order">排序</Label>
            <Input
              id="cat-order"
              onChange={(e) => setOrder(e.target.value)}
              placeholder="数字越小越靠前"
              type="number"
              value={order}
            />
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

function DeleteConfirmDialog({
  open,
  onClose,
  category,
  onDone,
}: {
  category: SiteCategory | null
  onClose: () => void
  onDone: () => void
  open: boolean
}) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!category) {
      return
    }
    setDeleting(true)
    try {
      await deleteCategory(category.id)
      toast.success(`已删除「${category.name}」`)
      onDone()
      onClose()
    } catch {
      toast.error('删除失败')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Dialog onOpenChange={(next) => !next && onClose()} open={open}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>确认删除</DialogTitle>
          <DialogDescription>
            确定要删除分类「{category?.name}
            」吗？已关联该分类的网站不会被删除，但分类字段将失去对应入口。
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

export default function AdminCategoriesPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<SiteCategory[] | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<SiteCategory | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SiteCategory | null>(null)
  const [seeding, setSeeding] = useState(false)
  const [, startTransition] = useTransition()

  const loadCategories = () => {
    startTransition(async () => {
      const data = await getAllCategories()
      setCategories(data)
    })
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const handleRefresh = () => {
    router.refresh()
    loadCategories()
  }

  const handleSeed = async () => {
    setSeeding(true)
    try {
      await seedCategories(PRESET_CATEGORIES)
      toast.success(`已导入 ${PRESET_CATEGORIES.length} 个预置分类`)
      handleRefresh()
    } catch {
      toast.error('导入失败')
    } finally {
      setSeeding(false)
    }
  }

  if (categories === null) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-40" />
          <Skeleton className="mt-2 h-4 w-60" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton className="h-14 rounded-xl" key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl">网站分类管理</h1>
          <p className="mt-1 text-muted-foreground text-sm">
            共 {categories.length} 个分类 · 排序值越小越靠前
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button disabled={seeding} onClick={handleSeed} variant="outline">
            <Download className="mr-1.5 size-4" />
            {seeding ? '导入中...' : '导入预置分类'}
          </Button>
          <Button
            onClick={() => {
              setEditing(null)
              setFormOpen(true)
            }}
          >
            <Plus className="mr-1.5 size-4" />
            新增分类
          </Button>
        </div>
      </div>

      {categories.length > 0 ? (
        <div className="overflow-hidden rounded-xl border bg-background">
          <ul className="divide-y">
            {categories.map((cat) => (
              <li
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/30"
                key={cat.id}
              >
                <GripVertical className="size-4 shrink-0 text-muted-foreground/40" />
                <span className="flex-1 font-medium text-sm">{cat.name}</span>
                {cat.order !== undefined && cat.order !== null && (
                  <span className="text-muted-foreground text-xs">
                    order: {cat.order}
                  </span>
                )}
                <div className="flex items-center gap-1">
                  <Button
                    onClick={() => {
                      setEditing(cat)
                      setFormOpen(true)
                    }}
                    size="icon-xs"
                    variant="ghost"
                  >
                    <Pencil />
                  </Button>
                  <Button
                    onClick={() => setDeleteTarget(cat)}
                    size="icon-xs"
                    variant="ghost"
                  >
                    <Trash2 className="text-destructive" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
          <p className="text-muted-foreground">还没有添加任何分类</p>
          <div className="mt-4 flex flex-col items-center gap-2 sm:flex-row">
            <Button
              onClick={() => {
                setEditing(null)
                setFormOpen(true)
              }}
              variant="outline"
            >
              <Plus className="mr-1.5 size-4" />
              添加第一个分类
            </Button>
            <Button disabled={seeding} onClick={handleSeed} variant="secondary">
              <Download className="mr-1.5 size-4" />
              {seeding
                ? '导入中...'
                : `导入预置（${PRESET_CATEGORIES.length} 个）`}
            </Button>
          </div>
        </div>
      )}

      <CategoryFormDialog
        editing={editing}
        onClose={() => {
          setFormOpen(false)
          setEditing(null)
        }}
        onDone={handleRefresh}
        open={formOpen}
      />
      <DeleteConfirmDialog
        category={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onDone={handleRefresh}
        open={!!deleteTarget}
      />
    </div>
  )
}
