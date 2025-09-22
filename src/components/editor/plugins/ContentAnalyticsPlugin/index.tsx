"use client"

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { $getRoot } from "lexical"
import { useEffect, useState } from "react"
import { $isHeadingNode } from "@lexical/rich-text"
import { $isListNode } from "@lexical/list"
import { $isCodeNode } from "@lexical/code"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Clock, Eye, BarChart3, Target, BookOpen, TrendingUp, Zap, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface ContentMetrics {
  wordCount: number
  readingTime: number
  paragraphCount: number
  headingCount: number
  listCount: number
  codeBlockCount: number
  imageCount: number
  linkCount: number
  sentenceCount: number
  avgWordsPerSentence: number
  readabilityScore: number
  engagementScore: number
}

interface ContentStructure {
  h1Count: number
  h2Count: number
  h3Count: number
  hasIntroduction: boolean
  hasConclusion: boolean
  structureScore: number
}

function calculateReadabilityScore(avgWordsPerSentence: number, avgSyllablesPerWord: number): number {
  // Simplified Flesch Reading Ease formula
  const score = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord
  return Math.max(0, Math.min(100, score))
}

function calculateEngagementScore(metrics: ContentMetrics, structure: ContentStructure): number {
  let score = 50 // Base score

  // Optimal word count (500-2000 words gets bonus)
  if (metrics.wordCount >= 500 && metrics.wordCount <= 2000) {
    score += 15
  } else if (metrics.wordCount > 2000) {
    score += 10
  }

  // Good structure bonus
  if (structure.structureScore > 70) score += 10

  // Visual elements bonus
  if (metrics.imageCount > 0) score += 5
  if (metrics.listCount > 0) score += 5
  if (metrics.codeBlockCount > 0) score += 3

  // Readability bonus
  if (metrics.readabilityScore > 60) score += 10

  // Links bonus (but not too many)
  if (metrics.linkCount > 0 && metrics.linkCount <= 10) score += 5

  return Math.max(0, Math.min(100, score))
}

function estimateSyllables(word: string): number {
  word = word.toLowerCase()
  if (word.length <= 3) return 1

  const vowels = "aeiouy"
  let syllables = 0
  let previousWasVowel = false

  for (let i = 0; i < word.length; i++) {
    const isVowel = vowels.includes(word[i])
    if (isVowel && !previousWasVowel) {
      syllables++
    }
    previousWasVowel = isVowel
  }

  // Handle silent e
  if (word.endsWith("e")) syllables--

  return Math.max(1, syllables)
}

export default function ContentAnalyticsPlugin() {
  const [editor] = useLexicalComposerContext()
  const [metrics, setMetrics] = useState<ContentMetrics>({
    wordCount: 0,
    readingTime: 0,
    paragraphCount: 0,
    headingCount: 0,
    listCount: 0,
    codeBlockCount: 0,
    imageCount: 0,
    linkCount: 0,
    sentenceCount: 0,
    avgWordsPerSentence: 0,
    readabilityScore: 0,
    engagementScore: 0,
  })
  const [structure, setStructure] = useState<ContentStructure>({
    h1Count: 0,
    h2Count: 0,
    h3Count: 0,
    hasIntroduction: false,
    hasConclusion: false,
    structureScore: 0,
  })
  const [isVisible, setIsVisible] = useState(false)
  const [isPanelHidden, setIsPanelHidden] = useState(false)

  useEffect(() => {
    const updateMetrics = () => {
      editor.read(() => {
        const root = $getRoot()
        const textContent = root.getTextContent()

        // Basic metrics
        const words = textContent
          .trim()
          .split(/\s+/)
          .filter((word) => word.length > 0)
        const wordCount = words.length
        const readingTime = Math.ceil(wordCount / 200) // 200 WPM average

        // Count different elements
        let paragraphCount = 0
        let headingCount = 0
        let listCount = 0
        let codeBlockCount = 0
        let imageCount = 0
        let linkCount = 0
        let h1Count = 0
        let h2Count = 0
        let h3Count = 0

        const children = root.getChildren()
        children.forEach((child) => {
          if ($isHeadingNode(child)) {
            headingCount++
            const tag = child.getTag()
            if (tag === "h1") h1Count++
            else if (tag === "h2") h2Count++
            else if (tag === "h3") h3Count++
          } else if ($isListNode(child)) {
            listCount++
          } else if ($isCodeNode(child)) {
            codeBlockCount++
          } else if (child.getType() === "paragraph") {
            paragraphCount++
          }

          // Count images and links recursively
          const countInNode = (node: any) => {
            if (node.getType() === "image" || node.getType() === "inline-image") {
              imageCount++
            }
            if (node.getType() === "link") {
              linkCount++
            }
            if (node.getChildren) {
              node.getChildren().forEach(countInNode)
            }
          }
          countInNode(child)
        })

        // Calculate sentences and readability
        const sentences = textContent.split(/[.!?]+/).filter((s) => s.trim().length > 0)
        const sentenceCount = sentences.length
        const avgWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : 0

        // Calculate average syllables per word
        const totalSyllables = words.reduce((sum, word) => sum + estimateSyllables(word), 0)
        const avgSyllablesPerWord = wordCount > 0 ? totalSyllables / wordCount : 0

        const readabilityScore = calculateReadabilityScore(avgWordsPerSentence, avgSyllablesPerWord)

        // Structure analysis
        const hasIntroduction = paragraphCount > 0
        const hasConclusion = paragraphCount > 2
        let structureScore = 0

        if (h1Count === 1) structureScore += 20
        if (h2Count >= 2) structureScore += 20
        if (hasIntroduction) structureScore += 15
        if (hasConclusion) structureScore += 15
        if (listCount > 0) structureScore += 10
        if (imageCount > 0) structureScore += 10
        if (linkCount > 0 && linkCount <= 10) structureScore += 10

        const newStructure: ContentStructure = {
          h1Count,
          h2Count,
          h3Count,
          hasIntroduction,
          hasConclusion,
          structureScore,
        }

        const newMetrics: ContentMetrics = {
          wordCount,
          readingTime,
          paragraphCount,
          headingCount,
          listCount,
          codeBlockCount,
          imageCount,
          linkCount,
          sentenceCount,
          avgWordsPerSentence,
          readabilityScore,
          engagementScore: calculateEngagementScore(
            {
              wordCount,
              readingTime,
              paragraphCount,
              headingCount,
              listCount,
              codeBlockCount,
              imageCount,
              linkCount,
              sentenceCount,
              avgWordsPerSentence,
              readabilityScore,
              engagementScore: 0,
            },
            newStructure,
          ),
        }

        setMetrics(newMetrics)
        setStructure(newStructure)
      })
    }

    // Update metrics on editor changes
    const unregister = editor.registerUpdateListener(() => {
      updateMetrics()
    })

    // Initial calculation
    updateMetrics()

    return unregister
  }, [editor])

  // Show/hide based on content
  useEffect(() => {
    setIsVisible(metrics.wordCount > 10)
  }, [metrics.wordCount])

  if (!isVisible) return null

  const getReadabilityLabel = (score: number) => {
    if (score >= 90) return { label: "Very Easy", color: "bg-green-500" }
    if (score >= 80) return { label: "Easy", color: "bg-green-400" }
    if (score >= 70) return { label: "Fairly Easy", color: "bg-yellow-400" }
    if (score >= 60) return { label: "Standard", color: "bg-yellow-500" }
    if (score >= 50) return { label: "Fairly Difficult", color: "bg-orange-400" }
    if (score >= 30) return { label: "Difficult", color: "bg-red-400" }
    return { label: "Very Difficult", color: "bg-red-500" }
  }

  const getEngagementLabel = (score: number) => {
    if (score >= 80) return { label: "Excellent", color: "text-green-600" }
    if (score >= 60) return { label: "Good", color: "text-yellow-600" }
    if (score >= 40) return { label: "Fair", color: "text-orange-600" }
    return { label: "Needs Work", color: "text-red-600" }
  }

  const readability = getReadabilityLabel(metrics.readabilityScore)
  const engagement = getEngagementLabel(metrics.engagementScore)

  return (
    <div
      className={cn(
        "fixed top-20 right-4 z-50 transition-transform duration-300 ease-in-out",
        isPanelHidden ? "translate-x-full" : "translate-x-0",
      )}
    >
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsPanelHidden(!isPanelHidden)}
        className={cn(
          "absolute top-4 -left-10 z-10 h-8 w-8 p-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm shadow-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800",
          isPanelHidden && "-left-8",
        )}
      >
        {isPanelHidden ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </Button>

      <div className="w-80 space-y-4">
        {/* Main Analytics Card */}
        <Card className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm shadow-lg border border-zinc-200 dark:border-zinc-700">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm font-medium">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Content Analytics
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Reading Time & Word Count */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <div>
                  <div className="text-lg font-semibold">{metrics.readingTime}m</div>
                  <div className="text-xs text-muted-foreground">Reading time</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-green-500" />
                <div>
                  <div className="text-lg font-semibold">{metrics.wordCount}</div>
                  <div className="text-xs text-muted-foreground">Words</div>
                </div>
              </div>
            </div>

            {/* Engagement Score */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium">Engagement</span>
                </div>
                <Badge variant="outline" className={engagement.color}>
                  {engagement.label}
                </Badge>
              </div>
              <Progress value={metrics.engagementScore} className="h-2" />
              <div className="text-xs text-muted-foreground">{metrics.engagementScore}/100</div>
            </div>

            {/* Readability */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-indigo-500" />
                  <span className="text-sm font-medium">Readability</span>
                </div>
                <Badge variant="outline" className={cn("text-white", readability.color)}>
                  {readability.label}
                </Badge>
              </div>
              <Progress value={metrics.readabilityScore} className="h-2" />
              <div className="text-xs text-muted-foreground">
                {Math.round(metrics.readabilityScore)}/100 Flesch Score
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Structure Analysis Card */}
        <Card className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm shadow-lg border border-zinc-200 dark:border-zinc-700">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Target className="w-4 h-4" />
              Content Structure
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">H1 Headers:</span>
                <span className={structure.h1Count === 1 ? "text-green-600" : "text-orange-600"}>
                  {structure.h1Count}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">H2 Headers:</span>
                <span className={structure.h2Count >= 2 ? "text-green-600" : "text-orange-600"}>
                  {structure.h2Count}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Paragraphs:</span>
                <span>{metrics.paragraphCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lists:</span>
                <span>{metrics.listCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Images:</span>
                <span>{metrics.imageCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Links:</span>
                <span
                  className={metrics.linkCount > 0 && metrics.linkCount <= 10 ? "text-green-600" : "text-orange-600"}
                >
                  {metrics.linkCount}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Structure Score</span>
                <span className="text-sm">{structure.structureScore}/100</span>
              </div>
              <Progress value={structure.structureScore} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Quick Tips Card */}
        {metrics.engagementScore < 70 && (
          <Card className="bg-amber-50/95 dark:bg-amber-900/20 backdrop-blur-sm shadow-lg border border-amber-200 dark:border-amber-800">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-amber-800 dark:text-amber-200">
                <Zap className="w-4 h-4" />
                Quick Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
                {structure.h1Count !== 1 && <div>• Use exactly one H1 header for your main title</div>}
                {structure.h2Count < 2 && <div>• Add more H2 headers to break up your content</div>}
                {metrics.imageCount === 0 && <div>• Add images to make your content more engaging</div>}
                {metrics.listCount === 0 && <div>• Use bullet points or numbered lists for better readability</div>}
                {metrics.wordCount < 300 && <div>• Consider expanding your content (aim for 500+ words)</div>}
                {metrics.readabilityScore < 50 && <div>• Try shorter sentences for better readability</div>}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
