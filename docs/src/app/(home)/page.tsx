import { BookIcon, type LucideIcon, WebhookIcon } from 'lucide-react'
import type { LinkProps } from 'next/link'
import Link from 'next/link'
import type { ReactElement, ReactNode } from 'react'
import { cn } from '@/lib/cn'

export default function DocsPage(): ReactElement {
  return (
    <main className='mx-auto flex min-h-screen w-full max-w-[1400px] flex-col px-4 py-24'>
      <div className='flex flex-col items-center text-center'>
        <h1 className='bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text font-extrabold text-5xl tracking-tight text-transparent md:text-7xl'>
          Notiq Docs
        </h1>
        <p className='mt-6 max-w-2xl text-fd-muted-foreground text-xl leading-relaxed'>
          Supercharge your rich text experience. Powerful, AI-enhanced, and modular editor built on Lexical.
        </p>
        <div className='mt-10 flex gap-4'>
          <Link
            href='/docs'
            className='rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/20'
          >
            Get Started
          </Link>
          <Link
            href='https://github.com/chinonsochikelue/notiq'
            target='_blank'
            className='rounded-xl border border-border bg-fd-accent/30 px-8 py-4 font-semibold transition-all hover:bg-fd-accent'
          >
            GitHub
          </Link>
        </div>
      </div>

      <div className='mt-24 grid grid-cols-1 gap-6 text-left md:grid-cols-2'>
        <DocumentationItem
          description='Learn how to integrate and customize the Notiq editor in your application.'
          href='/docs'
          icon={{ icon: BookIcon, id: '(index)' }}
          title='Interactive Guides'
        />

        <DocumentationItem
          description='Technical specifications, prop references, and type definitions for the Notiq library.'
          href='/docs/api-reference'
          icon={{ icon: WebhookIcon, id: 'api-reference' }}
          title='API Reference'
        />
      </div>
    </main>
  )
}

function DocumentationItem({
  title,
  description,
  icon: { icon: ItemIcon, id },
  href,
}: {
  title: string
  description: string
  icon: {
    icon: LucideIcon
    id: string
  }
  href: string
}): ReactElement {
  return (
    <Item href={href}>
      <Icon className={id}>
        <ItemIcon className='size-full' />
      </Icon>
      <h2 className='mb-2 font-semibold text-lg'>{title}</h2>
      <p className='text-fd-muted-foreground text-sm'>{description}</p>
    </Item>
  )
}

function Icon({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}): ReactElement {
  return (
    <div
      className={cn(
        'mb-2 size-9 rounded-lg border p-1.5 shadow-fd-primary/30',
        className
      )}
      style={{
        boxShadow: 'inset 0px 8px 8px 0px var(--tw-shadow-color)',
      }}
    >
      {children}
    </div>
  )
}

function Item(
  props: LinkProps & { className?: string; children: ReactNode }
): ReactElement {
  const { className, children, ...rest } = props
  return (
    <Link
      {...rest}
      className={cn(
        'rounded-2xl border border-border bg-fd-accent/30 p-6 shadow-lg backdrop-blur-lg transition-all hover:bg-fd-accent',
        className
      )}
    >
      {children}
    </Link>
  )
}
