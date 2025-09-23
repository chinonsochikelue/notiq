"use client"
import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  BarChart3,
  Clock,
  BookOpen,
  MessageSquare,
  Sparkles,
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Brain,
  Palette,
  Menu,
  X,
  Star,
  Users,
  Zap,
  Shield,
  Globe,
  Lightbulb,
  Play,
  Heart,
  Code,
  GitBranch,
  Download,
  Github,
  Coffee,
  Rocket,
  Layers,
  Mic,
  Image,
  GripVertical,
  Link
} from "lucide-react"
import { ModeToggle } from '@/components/theme/ModeToggle'

export default function NotiqLanding() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [activeFeature, setActiveFeature] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % 8)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Writing Assistant",
      description: "GPT-4 integration for content improvement, grammar fixes, auto-completion, and smart content enhancement.",
      color: "bg-blue-500/10 text-blue-600"
    },
    {
      icon: Code,
      title: "Advanced Content Blocks",
      description: "40+ plugins including code blocks, math equations, Excalidraw drawings, polls, and interactive elements.",
      color: "bg-purple-500/10 text-purple-600"
    },
    {
      icon: MessageSquare,
      title: "Slash Commands",
      description: "Type '/' for quick content insertion and formatting with an intuitive command palette.",
      color: "bg-green-500/10 text-green-600"
    },
    {
      icon: Mic,
      title: "Speech-to-Text",
      description: "Voice input capabilities for hands-free writing and content creation.",
      color: "bg-orange-500/10 text-orange-600"
    },
    {
      icon: GripVertical,
      title: "Drag & Drop Interface",
      description: "Draggable blocks and content reordering for intuitive document structure management.",
      color: "bg-pink-500/10 text-pink-600"
    },
    {
      icon: Link,
      title: "Rich Link Previews",
      description: "Automatic link previews with metadata for enhanced content presentation.",
      color: "bg-cyan-500/10 text-cyan-600"
    },
    {
      icon: Layers,
      title: "Multi-column Layouts",
      description: "Flexible layout system with resizable panels and advanced table support.",
      color: "bg-indigo-500/10 text-indigo-600"
    },
    {
      icon: Palette,
      title: "Theme Support",
      description: "Dark/light mode with seamless switching and comprehensive keyboard shortcuts.",
      color: "bg-rose-500/10 text-rose-600"
    }
  ]

  const useCases = [
    {
      icon: BookOpen,
      title: "Documentation",
      description: "Technical docs, API references, user guides with advanced formatting and interactive elements.",
      examples: ["Technical Documentation", "API References", "User Guides", "Knowledge Bases"]
    },
    {
      icon: Rocket,
      title: "Content Creation",
      description: "Blog posts, articles, marketing content with AI assistance and rich media support.",
      examples: ["Blog Posts", "Marketing Content", "Articles", "Social Media"]
    },
    {
      icon: Users,
      title: "Collaborative Writing",
      description: "Team documents, shared knowledge bases with real-time collaboration features.",
      examples: ["Team Documents", "Meeting Notes", "Project Plans", "Shared Knowledge"]
    }
  ]

  const contributors = [
    { name: "Alex Chen", role: "Core Developer", contributions: "Frontend & AI Integration" },
    { name: "Sarah Kim", role: "Plugin Developer", contributions: "Content Blocks & Extensions" },
    { name: "Marcus Rodriguez", role: "UX Designer", contributions: "Interface Design & Interactions" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Enhanced Navigation */}
      <nav className="fixed inset-x-0 z-50 top-2 pointer-events-auto">
        <div
          className={`transition-all duration-300 ${scrollY > 50
            ? 'max-w-[98%] mx-auto rounded-xl px-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-lg'
            : ''
            }`}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                    Notiq
                  </span>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Open Source</div>
                </div>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                <a href="#features" className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200">
                  Features
                </a>
                <a href="#use-cases" className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200">
                  Use Cases
                </a>
                <a href="#contribute" className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200">
                  Contribute
                </a>
                <a href="#sponsor" className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200">
                  Sponsor
                </a>
              </div>

              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" className="hidden sm:flex text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                  <Github className="h-4 w-4 mr-2" />
                  GitHub
                </Button>
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                  <Download className="h-4 w-4 mr-2" />
                  Get Started
                </Button>

                <ModeToggle />

                {/* Mobile menu button */}
                <button
                  className="md:hidden p-2"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
              <div className="md:hidden absolute top-16 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-xl">
                <div className="px-4 py-4 space-y-3">
                  <a href="#features" className="block text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 py-2">
                    Features
                  </a>
                  <a href="#use-cases" className="block text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 py-2">
                    Use Cases
                  </a>
                  <a href="#contribute" className="block text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 py-2">
                    Contribute
                  </a>
                  <a href="#sponsor" className="block text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 py-2">
                    Sponsor
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Enhanced Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-16 lg:pt-32 lg:pb-24">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-400/20 to-orange-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

          {/* Floating elements */}
          <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-blue-500/30 rounded-full animate-bounce delay-300"></div>
          <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-purple-500/30 rounded-full animate-bounce delay-700"></div>
          <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-pink-500/30 rounded-full animate-bounce delay-1000"></div>
        </div>

        <div className="container grid-bg relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="flex justify-center mb-8">
              <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300 border-0 px-4 py-2 text-sm font-medium animate-pulse">
                <Code className="mr-2 h-4 w-4" />
                Open Source AI Editor
                <Zap className="ml-2 h-4 w-4" />
              </Badge>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-8">
              <span className="block mb-2">Powerful AI-enhanced</span>
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                rich text editor
              </span>
            </h1>

            <p className="text-xl leading-8 text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-12">
              Built with Lexical, Next.js, and TypeScript. Features GPT-4 integration, 40+ content blocks, 
              drag & drop interface, and advanced formatting. Free, open source, and ready to contribute to.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Button size="lg" className="h-14 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 group">
                <Download className="mr-2 h-5 w-5" />
                Try Notiq Free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg" className="h-14 px-8 border-2 border-slate-300 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-all duration-300 group">
                <Github className="mr-2 h-5 w-5" />
                View on GitHub
              </Button>
            </div>

            {/* Open Source Stats */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>MIT License</span>
              </div>
              <div className="flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-green-500" />
                <span>Active Development</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                <span>Community Driven</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-16 bg-white/50 dark:bg-slate-800/30 backdrop-blur-sm border-y border-slate-200/50 dark:border-slate-700/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Built with Modern Technologies</h2>
            <p className="text-slate-600 dark:text-slate-300">Powered by industry-leading frameworks and tools</p>
          </div>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
            {[
              { name: "Lexical", description: "Facebook's modern editor framework", color: "text-blue-600" },
              { name: "Next.js", description: "React production framework", color: "text-black dark:text-white" },
              { name: "TypeScript", description: "Type-safe JavaScript", color: "text-blue-700" },
              { name: "OpenAI", description: "GPT-4 AI integration", color: "text-green-600" },
              { name: "Tailwind", description: "Utility-first CSS", color: "text-cyan-600" }
            ].map((tech, index) => (
              <div key={index} className="text-center group hover:scale-105 transition-transform duration-300">
                <div className={`text-2xl font-bold ${tech.color} mb-2`}>
                  {tech.name}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {tech.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section id="features" className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-20">
            <Badge className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 mb-6">
              <Sparkles className="mr-2 h-4 w-4" />
              Core Features
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Everything you need for
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> intelligent writing</span>
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Over 40 plugins, 20+ content block types, and advanced AI integration in a modern, extensible editor.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <Card
                key={index}
                className={`group border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm ${activeFeature === index ? 'ring-2 ring-blue-500 shadow-2xl scale-105' : ''
                  }`}
                onMouseEnter={() => setActiveFeature(index)}
              >
                <CardContent className="p-6">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${feature.color} group-hover:scale-110 transition-transform duration-300 mb-4`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="py-24 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 mb-6">
              <Rocket className="mr-2 h-4 w-4" />
              Use Cases
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Perfect for <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">every writing need</span>
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              From technical documentation to creative content, Notiq adapts to your workflow.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {useCases.map((useCase, index) => (
              <Card key={index} className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-white dark:bg-slate-800">
                <CardContent className="p-8">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 text-blue-600 group-hover:scale-110 transition-transform duration-300">
                      <useCase.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      {useCase.title}
                    </h3>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                    {useCase.description}
                  </p>
                  <div className="space-y-2">
                    {useCase.examples.map((example, exIndex) => (
                      <div key={exIndex} className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>{example}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Start Section */}
      <section className="py-24 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 mb-6">
              <Rocket className="mr-2 h-4 w-4" />
              Quick Start
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Get started in <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">minutes</span>
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="border-0 shadow-2xl bg-slate-900 text-white overflow-hidden">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-slate-400 ml-4">Terminal</span>
                  </div>
                  
                  <div className="space-y-4 font-mono text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="text-green-400">$</span>
                      <span className="text-blue-300">git clone</span>
                      <span className="text-slate-300">https://github.com/chinonsochikelue/notiq.git</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-400">$</span>
                      <span className="text-blue-300">cd</span>
                      <span className="text-slate-300">notiq</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-400">$</span>
                      <span className="text-blue-300">npm install</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-400">$</span>
                      <span className="text-blue-300">npm run</span>
                      <span className="text-slate-300">dev</span>
                    </div>
                    <div className="text-slate-400 mt-4">
                      🚀 Server running on http://localhost:3000
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mt-8 text-center">
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Don't forget to add your OpenAI API key to .env.local for AI features
              </p>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                <Github className="mr-2 h-4 w-4" />
                View Setup Guide
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Contributors Section */}
      <section id="contribute" className="py-24 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 mb-6">
              <Users className="mr-2 h-4 w-4" />
              Open Source Community
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Built by <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">developers, for developers</span>
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Join our growing community of contributors building the future of content creation tools.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 mb-16">
            {contributors.map((contributor, index) => (
              <Card key={index} className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-white dark:bg-slate-800">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                    {contributor.name.charAt(0)}
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-1">{contributor.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{contributor.role}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{contributor.contributions}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center space-y-6">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Ready to contribute?</h3>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white">
                <GitBranch className="mr-2 h-5 w-5" />
                Fork on GitHub
              </Button>
              <Button variant="outline" size="lg" className="border-2 border-slate-300 dark:border-slate-600">
                <BookOpen className="mr-2 h-5 w-5" />
                Read Docs
              </Button>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Check out our <a href="#" className="text-blue-600 hover:text-blue-700 underline">contributing guidelines</a> to get started
            </p>
          </div>
        </div>
      </section>

      {/* Sponsor Section */}
      <section id="sponsor" className="py-24 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 mb-6">
            <Coffee className="mr-2 h-4 w-4" />
            Support the Project
          </Badge>
          
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">
            Help us <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">keep building</span>
          </h2>
          
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-12">
            Notiq is free and open source. Your sponsorship helps us maintain the project, add new features, 
            and support the community.
          </p>

          <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto mb-12">
            <Card className="border-2 border-yellow-200 dark:border-yellow-800 bg-white dark:bg-slate-800 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <Coffee className="h-8 w-8 text-yellow-600 mx-auto mb-4" />
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Buy us a coffee</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">Support development with a one-time contribution</p>
                <Button variant="outline" className="border-yellow-500 text-yellow-600 hover:bg-yellow-50">
                  $5/month
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-800 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <Heart className="h-8 w-8 text-blue-600 mx-auto mb-4" />
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Ongoing Support</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">Monthly sponsorship for consistent development</p>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  $25/month
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-800 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <Rocket className="h-8 w-8 text-purple-600 mx-auto mb-4" />
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Enterprise</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">Custom features and priority support</p>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  Custom
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white">
              <Heart className="mr-2 h-5 w-5" />
              Sponsor on GitHub
            </Button>
            <Button variant="outline" size="lg" className="border-2 border-slate-300 dark:border-slate-600">
              <Coffee className="mr-2 h-5 w-5" />
              Buy Me a Coffee
            </Button>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-white/5 rounded-full blur-2xl animate-pulse delay-1000"></div>
        </div>

        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-8">
            Ready to build the future
            <span className="block">of content creation?</span>
          </h2>

          <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
            Join our open source community and help shape the next generation of AI-powered writing tools. 
            Whether you code, design, or write docs - there's a place for you.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
            <Button size="lg" className="h-16 px-12 bg-white text-blue-600 hover:bg-blue-50 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 text-lg font-bold">
              <Download className="mr-3 h-6 w-6" />
              Get Started Now
            </Button>
            <Button variant="outline" size="lg" className="h-16 px-12 border-2 border-white text-white hover:bg-white hover:text-blue-600 transition-all duration-300 hover:scale-105 text-lg font-bold">
              <Github className="mr-3 h-6 w-6" />
              View Source Code
            </Button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-blue-100">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              <span>100% Free & Open Source</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              <span>MIT License</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              <span>Community Supported</span>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>

        <div className="relative">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
              {/* Brand section */}
              <div className="lg:col-span-2">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <span className="text-xl font-bold">Notiq</span>
                    <div className="text-xs text-blue-400 font-medium">Open Source</div>
                  </div>
                </div>

                <p className="text-slate-300 mb-8 leading-relaxed max-w-md">
                  A powerful, AI-enhanced rich text editor built with Lexical, Next.js, and TypeScript. 
                  Free, open source, and built by the community.
                </p>

                <div className="flex space-x-4">
                  {/* Social links */}
                  <a href="#" className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110 group">
                    <Github className="h-5 w-5 group-hover:text-blue-400" />
                  </a>
                  <a href="#" className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110 group">
                    <MessageSquare className="h-5 w-5 group-hover:text-green-400" />
                  </a>
                  <a href="#" className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110 group">
                    <Users className="h-5 w-5 group-hover:text-purple-400" />
                  </a>
                </div>
              </div>

              {/* Links sections */}
              <div>
                <h4 className="font-bold mb-6 text-lg">Project</h4>
                <ul className="space-y-4">
                  <li><a href="#" className="text-slate-300 hover:text-white transition-colors duration-200 hover:underline underline-offset-4">Features</a></li>
                  <li><a href="#" className="text-slate-300 hover:text-white transition-colors duration-200 hover:underline underline-offset-4">Roadmap</a></li>
                  <li><a href="#" className="text-slate-300 hover:text-white transition-colors duration-200 hover:underline underline-offset-4">Changelog</a></li>
                  <li><a href="#" className="text-slate-300 hover:text-white transition-colors duration-200 hover:underline underline-offset-4">License</a></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold mb-6 text-lg">Community</h4>
                <ul className="space-y-4">
                  <li><a href="#" className="text-slate-300 hover:text-white transition-colors duration-200 hover:underline underline-offset-4">GitHub</a></li>
                  <li><a href="#" className="text-slate-300 hover:text-white transition-colors duration-200 hover:underline underline-offset-4">Discussions</a></li>
                  <li><a href="#" className="text-slate-300 hover:text-white transition-colors duration-200 hover:underline underline-offset-4">Issues</a></li>
                  <li><a href="#" className="text-slate-300 hover:text-white transition-colors duration-200 hover:underline underline-offset-4">Contributing</a></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold mb-6 text-lg">Resources</h4>
                <ul className="space-y-4">
                  <li><a href="#" className="text-slate-300 hover:text-white transition-colors duration-200 hover:underline underline-offset-4">Documentation</a></li>
                  <li><a href="#" className="text-slate-300 hover:text-white transition-colors duration-200 hover:underline underline-offset-4">Examples</a></li>
                  <li><a href="#" className="text-slate-300 hover:text-white transition-colors duration-200 hover:underline underline-offset-4">API Reference</a></li>
                  <li><a href="#" className="text-slate-300 hover:text-white transition-colors duration-200 hover:underline underline-offset-4">Support</a></li>
                </ul>
              </div>
            </div>

            {/* Newsletter/Updates signup */}
            <div className="mt-16 pt-8 border-t border-slate-800">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div>
                  <h3 className="text-xl font-bold mb-2">Stay updated</h3>
                  <p className="text-slate-400">Get notified about new features, releases, and community updates.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="w-full md:w-80 h-12 px-4 pr-12 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-slate-400"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <ArrowRight className="h-5 w-5 text-slate-400" />
                    </div>
                  </div>
                  <Button className="h-12 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium">
                    Subscribe
                  </Button>
                </div>
              </div>
            </div>

            {/* Bottom section */}
            <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-slate-400 text-sm">
                © 2025 Notiq. Open source under MIT License.
              </div>

              <div className="flex items-center gap-6 text-sm text-slate-400">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Active development
                </span>
                <span className="flex items-center gap-1">
                  Built with <Heart className="h-4 w-4 text-red-500 animate-pulse" fill="currentColor" /> by the community
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}