"use client";
import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    BookOpen,
    Menu,
    X,
    Save,
    Share,
    Sparkles,
    FileText,
    Clock,
} from "lucide-react"
import { ModeToggle } from '@/components/theme/ModeToggle'
import Editor from '@/components/editor';


export default function EditorPage() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [wordCount, setWordCount] = useState(0)
    const [readingTime, setReadingTime] = useState(0)
    const [aiAssistantActive, setAiAssistantActive] = useState(false)
    const [documentTitle, setDocumentTitle] = useState("Untitled Document")
    const [lastSaved, setLastSaved] = useState(new Date())
    const [previewMode, setPreviewMode] = useState(false)

    // Auto-save simulation
    useEffect(() => {
        const interval = setInterval(() => {
            setLastSaved(new Date())
        }, 30000) // Auto-save every 30 seconds
        return () => clearInterval(interval)
    }, [])

    const formatLastSaved = (date) => {
        const now = new Date()
        const diff = Math.floor((now - date) / 1000)

        if (diff < 60) return "Saved just now"
        if (diff < 3600) return `Saved ${Math.floor(diff / 60)}m ago`
        if (diff < 86400) return `Saved ${Math.floor(diff / 3600)}h ago`
        return `Saved ${date.toLocaleDateString()}`
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            {/* Enhanced Header */}
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        {/* Logo and Title */}
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-3">
                                <div className="relative">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg">
                                        <BookOpen className="h-4 w-4 text-white" />
                                    </div>
                                    {aiAssistantActive && (
                                        <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-400 rounded-full animate-pulse"></div>
                                    )}
                                </div>
                                <span className="text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                                    Notiq
                                </span>
                            </div>

                            <div className="hidden md:block h-6 w-px bg-slate-300 dark:bg-slate-600"></div>

                            <div className="hidden md:flex items-center space-x-3">
                                <input
                                    type="text"
                                    value={documentTitle}
                                    onChange={(e) => setDocumentTitle(e.target.value)}
                                    className="bg-transparent text-slate-900 dark:text-white font-medium text-lg border-none outline-none focus:bg-slate-100 dark:focus:bg-slate-800 px-2 py-1 rounded transition-colors"
                                    placeholder="Document title..."
                                />
                            </div>
                        </div>

                        {/* Stats and Actions */}
                        <div className="flex items-center space-x-4">

                            <div className="flex items-center space-x-2">

                                <ModeToggle />
                            </div>
                        </div>
                    </div>
                </div>
            </header>


            {/* Main Editor Area */}
            <main className="flex-1">
                <div className="container mx-auto max-w-6xl md:px-8 sm:px-6 lg:px-8 py-8 md:mt-10">
                            <Editor isEditable={true} />
                </div>
            </main>
        </div>
    )
}