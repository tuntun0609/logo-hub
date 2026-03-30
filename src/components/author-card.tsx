import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import type { AuthorWithParsed } from '@/lib/actions/authors'

const WHITESPACE_RE = /\s+/

function getInitials(name: string) {
  return name
    .split(WHITESPACE_RE)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function AuthorCard({ author }: { author: AuthorWithParsed }) {
  return (
    <Link
      className="group flex flex-col gap-3 rounded-2xl border border-border/70 p-4 transition hover:-translate-y-0.5 hover:border-foreground/15 hover:shadow-md"
      href={`/authors/${author.id}`}
    >
      <div className="flex items-center gap-3">
        <Avatar className="size-12">
          <AvatarImage alt={author.name} src={author.avatar ?? undefined} />
          <AvatarFallback>{getInitials(author.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-sm">{author.name}</p>
          {author.specialty.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {author.specialty.slice(0, 3).map((s) => (
                <Badge className="text-[11px]" key={s} variant="secondary">
                  {s}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
      {author.bio && (
        <p className="line-clamp-2 text-muted-foreground text-xs leading-relaxed">
          {author.bio}
        </p>
      )}
    </Link>
  )
}
