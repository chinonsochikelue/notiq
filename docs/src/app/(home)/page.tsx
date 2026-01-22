import {
  BookIcon,
  ChevronRight,
  Code2Icon,
  CpuIcon,
  Gamepad2Icon,
  LayersIcon,
  SparklesIcon,
  WebhookIcon,
  ZapIcon
} from 'lucide-react'
import Link from 'next/link'
import type { ReactElement, ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { LiveDemo } from '@/components/LiveDemo'

export default function LandingPage(): ReactElement {
  return (
    <main className='flex flex-col w-full min-h-screen bg-background overflow-x-hidden'>
      {/* Hero Section */}
      <section className='relative pt-32 pb-20 px-6 overflow-hidden'>
        <div className='absolute inset-0 -z-10'>
          <div className='absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full' />
          <div className='absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full' />
        </div>

        <div className='max-w-6xl mx-auto flex flex-col items-center text-center'>
          <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 text-[10px] font-bold uppercase tracking-widest mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000'>
            <SparklesIcon className='w-3 h-3' />
            AI-Enhanced Editing is Here
          </div>

          <h1 className='text-6xl md:text-8xl font-black tracking-tight mb-8 bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100'>
            The Editor of the <br /> <span className='text-blue-600'>Future</span>
          </h1>

          <p className='max-w-2xl text-lg md:text-xl text-muted-foreground mb-12 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200'>
            Notiq is a powerful, modular, and AI-powered rich text editor built for modern workflows. Notion-style power, developer-first flexibility.
          </p>

          <div className='flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300'>
            <Link
              href='/docs'
              className='px-10 py-4 font-bold bg-foreground text-background rounded-full hover:scale-105 transition-all shadow-xl shadow-foreground/5'
            >
              Start Building
            </Link>
            <Link
              href='/playground'
              className='px-10 py-4 font-bold border border-border bg-background rounded-full hover:bg-muted transition-all flex items-center gap-2 group'
            >
              Explore Playground
              <ChevronRight className='w-4 h-4 group-hover:translate-x-1 transition-transform' />
            </Link>
          </div>
        </div>
      </section>

      {/* Interactive Preview Section */}
      <section className='py-20 px-6 bg-muted/30 relative'>
        <div className='max-w-5xl mx-auto'>
          <div className='mb-12 text-center'>
            <h2 className='text-3xl font-bold mb-4 tracking-tight'>Try it instantly</h2>
            <p className='text-muted-foreground'>Experience the smooth editing feel and AI capabilities right here.</p>
          </div>
          <div className='animate-in fade-in slide-in-from-bottom-20 duration-1000 delay-500'>
            <LiveDemo />
          </div>
        </div>
      </section>

      {/* Documentation Overview */}
      <section className='py-32 px-6'>
        <div className='max-w-6xl mx-auto'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            <DocCategory
              title="Essentials"
              icon={LayersIcon}
              description="Master the fundamentals. From setup to core editing."
              items={[
                { label: "Quickstart Guide", href: "/docs/quickstart" },
                { label: "Core Features", href: "/docs" },
                { label: "Usage Examples", href: "/docs/examples" }
              ]}
            />
            <DocCategory
              title="Guides"
              icon={BookIcon}
              description="Learn advanced patterns and deep integrations."
              items={[
                { label: "Theming & Styling", href: "/docs/guides/theming" },
                { label: "Collaboration", href: "/docs/guides/collaboration" },
                { label: "Plugin Development", href: "/docs/guides/plugin-dev" }
              ]}
            />
            <DocCategory
              title="Reference"
              icon={Code2Icon}
              description="Deep dive into props, types, and the complete API."
              items={[
                { label: "Editor API", href: "/docs/api-reference/editor" },
                { label: "Component Specs", href: "/docs/guides/components" },
                { label: "Plugin Architecture", href: "/docs/guides/plugin-dev" }
              ]}
            />
          </div>
        </div>
      </section>

      {/* Feature Grids */}
      <section className='py-32 px-6 border-t'>
        <div className='max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
          <FeatureCard
            icon={CpuIcon}
            title="AI Writing"
            description="Integrated AI assistants for grammar, tone, and content generation."
          />
          <FeatureCard
            icon={Gamepad2Icon}
            title="Interactive"
            description="Native support for Excalidraw, Figma, and poll components."
          />
          <FeatureCard
            icon={WebhookIcon}
            title="Modular"
            description="Extensible plugin system built on the powerful Lexical engine."
          />
          <FeatureCard
            icon={ZapIcon}
            title="Performant"
            description="Lightweight footprint with blazing fast editing performance."
          />
        </div>
      </section>

      {/* CTA Footer */}
      <section className='py-32 px-6 bg-blue-600 text-white text-center'>
        <div className='max-w-4xl mx-auto'>
          <h2 className='text-4xl md:text-5xl font-black mb-12 tracking-tight'>Ready to build amazing things?</h2>
          <Link
            href="/docs"
            className='px-12 py-5 bg-white text-blue-600 font-black rounded-full text-xl hover:scale-110 transition-transform shadow-2xl inline-block'
          >
            Deploy Notiq Now
          </Link>
        </div>
      </section>
    </main>
  )
}

function DocCategory({
  title,
  icon: Icon,
  description,
  items
}: {
  title: string,
  icon: any,
  description: string,
  items: { label: string, href: string }[]
}) {
  return (
    <div className='p-8 rounded-3xl border border-border bg-fd-accent/10 backdrop-blur-sm flex flex-col h-full'>
      <div className='size-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6 text-blue-600'>
        <Icon className='w-6 h-6' />
      </div>
      <h3 className='text-2xl font-bold mb-3'>{title}</h3>
      <p className='text-muted-foreground text-sm mb-8 flex-1'>{description}</p>
      <div className='flex flex-col gap-3'>
        {items.map((item, i) => (
          <Link
            key={i}
            href={item.href}
            className='flex items-center justify-between group p-3 rounded-xl hover:bg-muted transition-colors text-sm font-medium border border-transparent hover:border-border'
          >
            {item.label}
            <ChevronRight className='w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all' />
          </Link>
        ))}
      </div>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className='group'>
      <div className='size-10 rounded-xl bg-muted flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors'>
        <Icon className='w-5 h-5' />
      </div>
      <h4 className='font-bold mb-2'>{title}</h4>
      <p className='text-muted-foreground text-sm leading-relaxed'>{description}</p>
    </div>
  )
}
