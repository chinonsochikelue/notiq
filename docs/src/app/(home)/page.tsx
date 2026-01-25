import Link from 'fumadocs-core/link';
import { type ReactElement } from 'react';
import { cn } from '@/lib/cn';
import { buttonVariants } from '@/components/ui/button';
import { GalaxyBackground } from '@/components/landing/GalaxyBackground';
import {
  Cpu,
  Palette,
  Zap,
  Share2,
  Terminal,
  FileText
} from 'lucide-react';

export default function LandingPage(): ReactElement {
  return (
    <GalaxyBackground>
      <div className="flex flex-col items-center justify-start min-h-screen text-center px-4 md:px-6 relative z-10 w-full max-w-7xl mx-auto pt-20 md:pt-32 pb-20">

        {/* Hero Content */}
        <div className="space-y-8 max-w-4xl mx-auto mb-20 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/50 border border-blue-500/30 text-blue-300 text-xs font-bold uppercase tracking-widest mb-4 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            v1.1.3 Now Available
          </div>

          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight leading-[1.1]">
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-slate-400">
              The Editor of the
            </span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-gradient-x bg-[length:200%_auto]">
              Cosmic Future
            </span>
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-light">
            Notiq combines a powerful <strong className="text-white font-medium">Notion-style</strong> block editor with an <strong className="text-white font-medium">Infinite Canvas</strong>, creating a universe for your ideas.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-5 pt-6">
            <Link
              href="/docs"
              className={cn(
                buttonVariants({ size: 'lg', variant: 'default' }),
                "rounded-full h-14 px-10 text-lg bg-white text-slate-950 hover:bg-slate-200 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] transition-all hover:scale-105 font-bold"
              )}
            >
              Start Building
            </Link>
            <Link
              href="https://github.com/chinonsochikelue/notiq"
              className={cn(
                buttonVariants({ size: 'lg', variant: 'outline' }),
                "rounded-full h-14 px-8 text-lg border-slate-800 bg-slate-950/50 text-slate-300 hover:bg-slate-800 hover:text-white backdrop-blur-md transition-all hover:scale-105"
              )}
            >
              Star on GitHub
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl mb-32 animate-in fade-in slide-in-from-bottom-20 duration-1000 delay-300">
          <FeatureCard
            title="AI Copilot"
            desc="Draft, edit, and code with contextual AI that understands your entire document structure."
            icon={<Cpu className="w-6 h-6 text-blue-400" />}
          />
          <FeatureCard
            title="Infinite Canvas"
            desc="Seamlessly switch between text and a whiteboard. Draw, diagram, and brainstorm without limits."
            icon={<Palette className="w-6 h-6 text-purple-400" />}
          />
          <FeatureCard
            title="Real-time Sync"
            desc="Collaborate with your team in real-time. See cursors, edits, and drawings instantly."
            icon={<Share2 className="w-6 h-6 text-pink-400" />}
          />
          <FeatureCard
            title="Slash Commands"
            desc="Format text, insert media, and execute actions without lifting your hands from the keyboard."
            icon={<Terminal className="w-6 h-6 text-emerald-400" />}
          />
          <FeatureCard
            title="Markdown Support"
            desc="Import, export, and write in Markdown. Developer-friendly from the ground up."
            icon={<FileText className="w-6 h-6 text-amber-400" />}
          />
          <FeatureCard
            title="Blazing Fast"
            desc="Built on Lexical for high performance, even with massive documents and complex content."
            icon={<Zap className="w-6 h-6 text-cyan-400" />}
          />
        </div>

        {/* Try it instantly Section */}
        <section className="w-full max-w-6xl mx-auto mb-20 relative">
          <div className="absolute inset-0 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />
          <div className="text-center mb-12 relative z-10">
            <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">Try it instantly</h2>
            <p className="text-slate-400">Experience the editor right here.</p>
          </div>

          {/* Editor Placeholder / Container */}
          <div className="relative w-full min-h-[600px] border border-slate-800 rounded-xl bg-slate-950/80 backdrop-blur-xl shadow-2xl overflow-hidden group hover:border-slate-700 transition-colors">
            {/* This replicates the structure needed for the editor to mount if we added it back, 
                 but for now it's a styled container as per user request to 'enhance' */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-transparent pointer-events-none" />

            <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
              <div className="p-4 rounded-full bg-slate-900 border border-slate-800 group-hover:scale-110 transition-transform duration-500">
                <Palette className="w-12 h-12 text-slate-700 group-hover:text-blue-500 transition-colors" />
              </div>
              <p className="text-lg">Interactive Playground Loading...</p>
              <Link href="/playground" className="text-blue-400 hover:text-blue-300 underline underline-offset-4">
                Or visit the full Playground
              </Link>
            </div>
          </div>
        </section>

      </div>
    </GalaxyBackground>
  );
}

function FeatureCard({ title, desc, icon }: { title: string, desc: string, icon: React.ReactNode }) {
  return (
    <div className="group relative p-8 rounded-3xl border border-slate-800 bg-slate-950/40 backdrop-blur-sm hover:border-slate-600 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-900/20 text-left overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative z-10">
        <div className="mb-6 p-3 bg-slate-900/50 rounded-2xl w-fit border border-slate-800 group-hover:border-slate-700 transition-colors">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{title}</h3>
        <p className="text-slate-400 leading-relaxed text-sm">{desc}</p>
      </div>
    </div>
  )
}
