'use client'

import { useUploadFiles } from '@better-upload/client'
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  ImageIcon,
  Link as LinkIcon,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
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
import type { CuratedSiteWithTags } from '@/lib/data/sites'
import { useAdminCategories } from '@/lib/query/hooks/use-admin-categories'
import { useCaptureScreenshot } from '@/lib/query/hooks/use-admin-screenshot'
import {
  useAdminSites,
  useCreateSite,
  useDeleteSite,
  useSeedSites,
  useToggleSiteVisibility,
  useUpdateSite,
} from '@/lib/query/hooks/use-admin-sites'
import type { AdminSitesListParams } from '@/lib/query/keys'

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

function usePasteUpload(
  active: boolean,
  upload: (files: File[]) => Promise<unknown>
) {
  const [isPasting, setIsPasting] = useState(false)

  useEffect(() => {
    if (!active) {
      setIsPasting(false)
      return
    }

    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) {
        return
      }

      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          e.preventDefault()
          const file = item.getAsFile()
          if (file) {
            setIsPasting(true)
            try {
              await upload([file])
            } finally {
              setIsPasting(false)
            }
          }
          break
        }
      }
    }

    document.addEventListener('paste', handlePaste)
    return () => document.removeEventListener('paste', handlePaste)
  }, [active, upload])

  return isPasting
}

interface SiteImageInputProps {
  image: string
  onImageChange: (url: string) => void
  open: boolean
  siteUrl: string
}

function SiteImageInput({
  image,
  onImageChange,
  open,
  siteUrl,
}: SiteImageInputProps) {
  const [imageInputMode, setImageInputMode] = useState<
    'upload' | 'url' | 'screenshot'
  >('upload')
  const [screenshotUrl, setScreenshotUrl] = useState('')
  const [directImageUrl, setDirectImageUrl] = useState('')

  const captureScreenshotMutation = useCaptureScreenshot()

  const { control: uploadControl } = useUploadFiles({
    route: 'logos',
    onUploadComplete: ({ files: uploaded, metadata }) => {
      const base =
        typeof metadata.r2PublicUrl === 'string' && metadata.r2PublicUrl
          ? stripTrailingSlash(metadata.r2PublicUrl)
          : stripTrailingSlash(R2_PUBLIC_URL)
      if (uploaded.length > 0) {
        const url = `${base}/${uploaded[0].objectInfo.key}`
        onImageChange(url)
        toast.success('截图已上传')
      }
    },
    onError: (error) => {
      toast.error(error.message || '上传失败')
    },
  })

  const isPasting = usePasteUpload(
    open && imageInputMode === 'upload',
    uploadControl.upload
  )

  useEffect(() => {
    if (open) {
      setImageInputMode('upload')
      setScreenshotUrl('')
      setDirectImageUrl('')
    }
  }, [open])

  const handleCaptureScreenshot = async () => {
    if (!screenshotUrl.trim()) {
      toast.error('请输入网址')
      return
    }

    try {
      const result = await captureScreenshotMutation.mutateAsync({
        options: {
          devicePixelRatio: 2,
          fullPage: false,
          height: 1080,
          uploadToR2: true,
          width: 1920,
        },
        url: screenshotUrl,
      })

      if (result.success && result.url) {
        onImageChange(result.url ?? '')
        toast.success('截图已生成')
      } else {
        toast.error(result.error || '截图失败')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '截图失败')
    }
  }

  const handleSetDirectUrl = () => {
    if (!directImageUrl.trim()) {
      toast.error('请输入图片链接')
      return
    }
    onImageChange(directImageUrl.trim())
    toast.success('图片链接已设置')
  }

  return (
    <Card className="sm:col-span-2" size="sm">
      <CardHeader className="border-b">
        <CardTitle>网站截图</CardTitle>
        <CardDescription>上传、输入链接或自动截图</CardDescription>
      </CardHeader>
      <CardContent>
        {image ? (
          <div className="relative">
            <img
              alt="网站截图"
              className="w-full rounded-lg border object-contain"
              height={400}
              src={image}
              width={640}
            />
            <Button
              className="absolute top-2 right-2"
              onClick={() => onImageChange('')}
              size="icon-xs"
              type="button"
              variant="secondary"
            >
              <X className="size-3" />
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={() => setImageInputMode('upload')}
                size="sm"
                type="button"
                variant={imageInputMode === 'upload' ? 'default' : 'outline'}
              >
                <Upload className="mr-2 size-4" />
                上传
              </Button>
              <Button
                className="flex-1"
                onClick={() => setImageInputMode('url')}
                size="sm"
                type="button"
                variant={imageInputMode === 'url' ? 'default' : 'outline'}
              >
                <LinkIcon className="mr-2 size-4" />
                图片链接
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  setImageInputMode('screenshot')
                  setScreenshotUrl(siteUrl)
                }}
                size="sm"
                type="button"
                variant={
                  imageInputMode === 'screenshot' ? 'default' : 'outline'
                }
              >
                <Camera className="mr-2 size-4" />
                网页截图
              </Button>
            </div>

            {imageInputMode === 'upload' && (
              <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed p-8 transition hover:bg-muted/50">
                <ImageIcon className="size-6 text-muted-foreground" />
                <span className="text-muted-foreground text-xs">
                  {uploadControl.isPending || isPasting
                    ? '上传中...'
                    : '点击上传或粘贴图片（16:10 推荐）'}
                </span>
                <input
                  accept="image/*"
                  className="hidden"
                  disabled={uploadControl.isPending || isPasting}
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

            {imageInputMode === 'url' && (
              <div className="flex items-center gap-2">
                <Input
                  className="flex-1"
                  onChange={(e) => setDirectImageUrl(e.target.value)}
                  placeholder="https://example.com/image.png"
                  type="url"
                  value={directImageUrl}
                />
                <Button
                  disabled={!directImageUrl.trim()}
                  onClick={handleSetDirectUrl}
                  size="sm"
                  type="button"
                >
                  设置
                </Button>
              </div>
            )}

            {imageInputMode === 'screenshot' && (
              <div className="flex items-center gap-2">
                <Input
                  className="flex-1"
                  onChange={(e) => setScreenshotUrl(e.target.value)}
                  placeholder="https://example.com"
                  type="url"
                  value={screenshotUrl}
                />
                <Button
                  disabled={
                    captureScreenshotMutation.isPending || !screenshotUrl.trim()
                  }
                  onClick={handleCaptureScreenshot}
                  size="sm"
                  type="button"
                >
                  {captureScreenshotMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      截图中...
                    </>
                  ) : (
                    <>
                      <Camera className="mr-2 size-4" />
                      生成截图
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface SiteFormDialogProps {
  categories: SiteCategory[]
  editing: CuratedSiteWithTags | null
  onClose: (saved?: boolean) => void
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

  const createSiteMutation = useCreateSite()
  const updateSiteMutation = useUpdateSite()

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
        await updateSiteMutation.mutateAsync({ body: data, id: editing.id })
        toast.success('网站已更新')
      } else {
        await createSiteMutation.mutateAsync(data)
        toast.success('网站已创建')
      }
      onClose(true)
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
      <DialogContent className="flex! max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <div className="shrink-0 px-6 pt-6 pb-2">
          <DialogHeader>
            <DialogTitle className="text-lg">
              {editing ? '编辑网站' : '新增网站'}
            </DialogTitle>
            <DialogDescription>
              {editing ? '修改推荐网站信息' : '添加一个新的推荐网站'}
            </DialogDescription>
          </DialogHeader>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <form
            className="grid gap-5 px-6 pt-2 pb-6"
            id="site-form"
            onSubmit={handleSubmit}
          >
            <div className="grid gap-5 sm:grid-cols-2">
              {/* 基本信息 */}
              <Card className="sm:col-span-2" size="sm">
                <CardHeader className="border-b">
                  <CardTitle>基本信息</CardTitle>
                  <CardDescription>站点名称、链接和简介</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-1.5">
                    <Label htmlFor="name">站点名称 *</Label>
                    <Input
                      id="name"
                      onChange={(e) => setField('name', e.target.value)}
                      placeholder="例如: Behance"
                      required
                      value={form.name}
                    />
                  </div>
                  <div className="grid gap-1.5">
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
                  <div className="grid gap-1.5 sm:col-span-2">
                    <Label htmlFor="description">简介 *</Label>
                    <Textarea
                      id="description"
                      onChange={(e) => setField('description', e.target.value)}
                      placeholder="一两句话介绍这个网站..."
                      rows={2}
                      value={form.description}
                    />
                  </div>
                </CardContent>
              </Card>

              <SiteImageInput
                image={form.image}
                onImageChange={(url) => setField('image', url)}
                open={open}
                siteUrl={form.href.trim()}
              />

              {/* 分类与标签 */}
              <Card size="sm">
                <CardHeader className="border-b">
                  <CardTitle>分类与标签</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid gap-1.5">
                    <Label>分类</Label>
                    <Select
                      items={categories.map((cat) => ({
                        label: cat.name,
                        value: cat.name,
                      }))}
                      onValueChange={(value) =>
                        setField('category', value ?? '')
                      }
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
                  <div className="grid gap-1.5">
                    <Label htmlFor="tags">标签</Label>
                    <Input
                      id="tags"
                      onChange={(e) => setField('tags', e.target.value)}
                      placeholder="用逗号分隔，例如: 设计, 灵感"
                      value={form.tags}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* 其他设置 */}
              <Card size="sm">
                <CardHeader className="border-b">
                  <CardTitle>其他设置</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="notes">备注</Label>
                    <Textarea
                      id="notes"
                      onChange={(e) => setField('notes', e.target.value)}
                      placeholder="内部备注（不会显示给用户）"
                      rows={2}
                      value={form.notes}
                    />
                  </div>
                  <div className="grid grid-cols-2 items-end gap-4">
                    <div className="grid gap-1.5">
                      <Label htmlFor="order">排序</Label>
                      <Input
                        id="order"
                        onChange={(e) => setField('order', e.target.value)}
                        placeholder="数字越小越靠前"
                        type="number"
                        value={form.order}
                      />
                    </div>
                    <div className="flex items-center gap-2 pb-1.5">
                      <Switch
                        checked={form.visible}
                        id="visible"
                        onCheckedChange={(checked) =>
                          setField('visible', checked)
                        }
                      />
                      <Label className="cursor-pointer" htmlFor="visible">
                        显示在前台
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </form>
        </div>
        <DialogFooter className="mx-0 mb-0 shrink-0 rounded-b-xl px-6">
          <Button
            disabled={saving}
            onClick={() => onClose()}
            type="button"
            variant="outline"
          >
            取消
          </Button>
          <Button disabled={saving} form="site-form" type="submit">
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function CuratedSitesManager() {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [visibilityFilter, setVisibilityFilter] = useState<
    'all' | 'visible' | 'hidden'
  >('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSite, setEditingSite] = useState<CuratedSiteWithTags | null>(
    null
  )
  const [confirmDialog, setConfirmDialog] = useState<{
    message: string
    onConfirm: () => void
    open: boolean
    title: string
  }>({ message: '', onConfirm: () => undefined, open: false, title: '' })

  const { data: categories = [] } = useAdminCategories()
  const seedSitesMutation = useSeedSites()
  const deleteSiteMutation = useDeleteSite()
  const toggleVisibilityMutation = useToggleSiteVisibility()

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, categoryFilter, visibilityFilter])

  const listParams: AdminSitesListParams = useMemo(
    () => ({
      category: categoryFilter,
      page: currentPage,
      pageSize: 20,
      search: searchQuery,
      visibility: visibilityFilter,
    }),
    [categoryFilter, currentPage, searchQuery, visibilityFilter]
  )

  const { data: sitesResult, isPending, isFetching } = useAdminSites(listParams)
  const sites = sitesResult ?? { sites: [], total: 0, totalPages: 0 }
  const loading = isPending
  const isPendingNav = isFetching

  const handleSeedData = () => {
    setConfirmDialog({
      message: `确定要导入 ${staticSites.length} 个静态站点数据吗？\n\n注意：已存在的站点名称会被跳过。`,
      onConfirm: async () => {
        try {
          const result = await seedSitesMutation.mutateAsync(staticSites)
          toast.success(
            `成功导入 ${result.inserted} 个站点，跳过 ${result.skipped.length} 个重复站点`
          )
          setCurrentPage(1)
        } catch {
          toast.error('导入失败')
        }
      },
      open: true,
      title: '确认导入数据',
    })
  }

  const handleDelete = (site: CuratedSiteWithTags) => {
    setConfirmDialog({
      message: `确定要删除 "${site.name}" 吗？`,
      onConfirm: async () => {
        try {
          await deleteSiteMutation.mutateAsync(site.id)
          toast.success('已删除')
        } catch {
          toast.error('删除失败')
        }
      },
      open: true,
      title: '确认删除',
    })
  }

  const handleToggleVisibility = async (site: CuratedSiteWithTags) => {
    try {
      await toggleVisibilityMutation.mutateAsync(site.id)
      toast.success(site.visible ? '已隐藏' : '已显示')
    } catch {
      toast.error('操作失败')
    }
  }

  const handleEdit = (site: CuratedSiteWithTags) => {
    setEditingSite(site)
    setDialogOpen(true)
  }

  const handleCreate = () => {
    setEditingSite(null)
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingSite(null)
  }

  const totalPages = sites.totalPages

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl">推荐网站管理</h1>
          <p className="mt-1 text-muted-foreground text-sm">
            管理首页展示的推荐网站
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSeedData} size="sm" variant="outline">
            <Upload className="mr-2 size-4" />
            导入静态数据
          </Button>
          <Button onClick={handleCreate} size="sm">
            <Plus className="mr-2 size-4" />
            新增网站
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索网站名称、链接或描述..."
            value={searchQuery}
          />
        </div>
        <Select
          items={[
            { label: '所有分类', value: '' },
            ...categories.map((cat) => ({
              label: cat.name,
              value: cat.name,
            })),
          ]}
          onValueChange={(value) => setCategoryFilter(value ?? '')}
          value={categoryFilter}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="所有分类" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">所有分类</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.name}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          items={[
            { label: '全部', value: 'all' },
            { label: '已显示', value: 'visible' },
            { label: '已隐藏', value: 'hidden' },
          ]}
          onValueChange={(value) =>
            setVisibilityFilter(value as 'all' | 'visible' | 'hidden')
          }
          value={visibilityFilter}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部</SelectItem>
            <SelectItem value="visible">已显示</SelectItem>
            <SelectItem value="hidden">已隐藏</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {!loading && sites.sites.length === 0 && (
        <div className="rounded-lg border border-dashed py-12 text-center">
          <p className="text-muted-foreground">暂无数据</p>
        </div>
      )}

      {!loading && sites.sites.length > 0 && (
        <>
          <div className="rounded-lg border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-sm">
                      网站
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-sm">
                      分类
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-sm">
                      标签
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-sm">
                      排序
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-sm">
                      状态
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-sm">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {sites.sites.map((site) => (
                    <tr className="hover:bg-muted/50" key={site.id}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {site.image && (
                            <img
                              alt=""
                              className="size-12 rounded border object-cover"
                              height={48}
                              src={site.image}
                              width={48}
                            />
                          )}
                          <div className="min-w-0">
                            <div className="font-medium">{site.name}</div>
                            <div className="truncate text-muted-foreground text-xs">
                              {site.href}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary">{site.category}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {site.tags?.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="outline">
                              {tag}
                            </Badge>
                          ))}
                          {site.tags && site.tags.length > 2 && (
                            <Badge variant="outline">
                              +{site.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-sm">
                        {site.order ?? '-'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={site.visible ? 'default' : 'secondary'}>
                          {site.visible ? '显示' : '隐藏'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Button
                            onClick={() => handleToggleVisibility(site)}
                            size="icon-sm"
                            variant="ghost"
                          >
                            {site.visible ? (
                              <EyeOff className="size-4" />
                            ) : (
                              <Eye className="size-4" />
                            )}
                          </Button>
                          <Button
                            onClick={() => handleEdit(site)}
                            size="icon-sm"
                            variant="ghost"
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            onClick={() => handleDelete(site)}
                            size="icon-sm"
                            variant="ghost"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-sm">
                共 {sites.total} 条，第 {currentPage} / {totalPages} 页
              </p>
              <div className="flex gap-2">
                <Button
                  disabled={currentPage === 1 || isPendingNav}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  size="sm"
                  variant="outline"
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  disabled={currentPage === totalPages || isPendingNav}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  size="sm"
                  variant="outline"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <SiteFormDialog
        categories={categories}
        editing={editingSite}
        onClose={handleCloseDialog}
        open={dialogOpen}
      />

      <Dialog
        onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
        open={confirmDialog.open}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmDialog.title}</DialogTitle>
            <DialogDescription className="whitespace-pre-line">
              {confirmDialog.message}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() =>
                setConfirmDialog((prev) => ({ ...prev, open: false }))
              }
              variant="outline"
            >
              取消
            </Button>
            <Button
              onClick={() => {
                setConfirmDialog((prev) => ({ ...prev, open: false }))
                confirmDialog.onConfirm()
              }}
              variant="destructive"
            >
              确认
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
