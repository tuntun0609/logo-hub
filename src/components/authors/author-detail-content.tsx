'use client'

import { ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { useAuthorById } from '@/lib/query/hooks/use-authors'
import { cn } from '@/lib/utils'

const WHITESPACE_RE = /\s+/

function getInitials(name: string) {
  return name
    .split(WHITESPACE_RE)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function AuthorDetailContent({ authorId }: { authorId: number }) {
  const { data: author, isPending } = useAuthorById(authorId)

  if (isPending || !author) {
    return (
      <div className="mx-auto max-w-2xl space-y-8 py-4">
        <div className="h-24 animate-pulse rounded-lg bg-muted" />
        <div className="h-20 animate-pulse rounded-lg bg-muted" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 py-4">
      <div className="flex items-center gap-4">
        <Avatar className="size-20">
          <AvatarImage alt={author.name} src={author.avatar ?? undefined} />
          <AvatarFallback className="text-xl">
            {getInitials(author.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h1 className="font-semibold text-2xl tracking-tight">
            {author.name}
          </h1>
          {author.specialty.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {author.specialty.map((s) => (
                <Badge key={s} variant="secondary">
                  {s}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {author.bio && (
        <section className="space-y-2">
          <h2 className="font-medium text-muted-foreground text-sm">简介</h2>
          <p className="text-sm leading-relaxed">{author.bio}</p>
        </section>
      )}

      {author.websiteUrl && (
        <div>
          <a
            className={cn(buttonVariants({ variant: 'outline' }))}
            href={author.websiteUrl}
            rel="noreferrer"
            target="_blank"
          >
            <ExternalLink className="mr-1.5 size-4" />
            访问网站
          </a>
        </div>
      )}

      {author.featuredWorks.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-medium text-muted-foreground text-sm">
            代表作品
          </h2>
          <ul className="space-y-2">
            {author.featuredWorks.map((work) => (
              <li key={work.url}>
                <a
                  className="inline-flex items-center gap-1.5 text-sm underline-offset-4 hover:underline"
                  href={work.url}
                  rel="noreferrer"
                  target="_blank"
                >
                  {work.title}
                  <ExternalLink className="size-3 text-muted-foreground" />
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="border-t pt-6">
        <Link
          className="text-muted-foreground text-sm hover:text-foreground"
          href="/authors"
        >
          ← 返回作者列表
        </Link>
      </div>
    </div>
  )
}
