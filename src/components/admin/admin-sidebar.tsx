'use client'

import {
  Camera,
  FolderTree,
  Globe,
  LayoutDashboard,
  Settings,
  Upload,
  Users,
  Wrench,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: '推荐网站', href: '/admin/sites', icon: Globe },
  { label: '网站分类', href: '/admin/categories', icon: FolderTree },
  { label: '作者管理', href: '/admin/authors', icon: Users },
  { label: '文件上传', href: '/admin/upload', icon: Upload },
  { label: '网页截图', href: '/admin/screenshot', icon: Camera },
  { label: '工具管理', href: '/admin/tools', icon: Wrench },
  { label: '系统设置', href: '/admin/settings', icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex w-60 shrink-0 flex-col border-border border-r">
      <div className="flex h-14 items-center border-border border-b px-4">
        <Link className="font-semibold text-lg" href="/admin">
          Logo Hub Admin
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/admin' && pathname.startsWith(item.href))
          return (
            <Link
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                isActive
                  ? 'bg-accent font-medium text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
              }`}
              href={item.href}
              key={item.href}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="border-border border-t p-4">
        <Link
          className="text-muted-foreground text-sm hover:text-foreground"
          href="/"
        >
          ← 返回主站
        </Link>
      </div>
    </aside>
  )
}
