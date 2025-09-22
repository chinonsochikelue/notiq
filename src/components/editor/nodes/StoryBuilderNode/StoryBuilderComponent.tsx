"use client"

import React, { useState, useCallback, useRef } from "react"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { $getNodeByKey } from "lexical"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { 
  Plus, Play, Edit3, Trash2, ArrowRight, BookOpen, Zap, GitBranch, 
  Image, Upload, Eye, EyeOff, Settings, Copy, Save, Share2,
  MapPin, Timer, Users, Target, Palette, Volume2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { $isStoryBuilderNode, type StoryNode, type StoryChoice, type StoryBuilderPayload } from "./StoryBuilderNode"

interface StoryBuilderComponentProps {
  nodes: StoryNode[]
  currentNodeId: string
  title: string
  nodeKey: string
}

interface EnhancedStoryNode extends StoryNode {
  image?: string
  backgroundColor?: string
  textColor?: string
  mood?: 'neutral' | 'happy' | 'sad' | 'mysterious' | 'exciting' | 'dark'
  music?: string
  estimatedReadTime?: number
  tags?: string[]
}

interface EnhancedStoryChoice extends StoryChoice {
  consequence?: string
  requiredItem?: string
  probabilityWeight?: number
  icon?: string
}

export default function StoryBuilderComponent({ nodes, currentNodeId, title, nodeKey }: StoryBuilderComponentProps) {
  const [editor] = useLexicalComposerContext()
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [previewNodeId, setPreviewNodeId] = useState("")
  const [editingNode, setEditingNode] = useState<string | null>(null)
  const [storyTitle, setStoryTitle] = useState(title)
  const [showAdvancedEditor, setShowAdvancedEditor] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'flowchart'>('grid')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const moodColors = {
    neutral: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-900' },
    happy: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-900' },
    sad: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900' },
    mysterious: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-900' },
    exciting: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-900' },
    dark: { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-900' },
  }

  const initializeStory = useCallback(() => {
    if (nodes.length === 0) {
      const startNode: EnhancedStoryNode = {
        id: "start",
        title: "The Beginning",
        content: "Your epic adventure begins here. The world awaits your decisions...",
        choices: [{ 
          id: "choice1", 
          text: "Begin the adventure", 
          targetId: "node1",
          consequence: "You step into the unknown",
          icon: "🚀"
        }],
        isStart: true,
        mood: 'exciting',
        estimatedReadTime: 1,
        tags: ['beginning', 'adventure']
      }

      const secondNode: EnhancedStoryNode = {
        id: "node1",
        title: "Chapter 1: The Journey",
        content: "The adventure continues as you face your first challenge...",
        choices: [],
        isEnd: true,
        mood: 'neutral',
        estimatedReadTime: 2,
        tags: ['chapter1', 'challenge']
      }

      updateStoryBuilder({
        nodes: [startNode, secondNode],
        currentNodeId: "start",
        title: storyTitle,
      })
    }
  }, [nodes.length, storyTitle])

  const updateStoryBuilder = useCallback(
    (payload: StoryBuilderPayload) => {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey)
        if ($isStoryBuilderNode(node)) {
          node.updateStory(payload)
        }
      })
    },
    [editor, nodeKey],
  )

  const addNewNode = useCallback(() => {
    const newNodeId = `node_${Date.now()}`
    const newNode: EnhancedStoryNode = {
      id: newNodeId,
      title: "New Chapter",
      content: "Write your story content here...",
      choices: [],
      mood: 'neutral',
      estimatedReadTime: 1,
      tags: []
    }

    updateStoryBuilder({
      nodes: [...nodes, newNode],
      currentNodeId,
      title: storyTitle,
    })
  }, [nodes, currentNodeId, storyTitle, updateStoryBuilder])

  const updateNode = useCallback(
    (nodeId: string, updates: Partial<EnhancedStoryNode>) => {
      const updatedNodes = nodes.map((node) => (node.id === nodeId ? { ...node, ...updates } : node))

      updateStoryBuilder({
        nodes: updatedNodes,
        currentNodeId,
        title: storyTitle,
      })
    },
    [nodes, currentNodeId, storyTitle, updateStoryBuilder],
  )

  const deleteNode = useCallback(
    (nodeId: string) => {
      const filteredNodes = nodes.filter((node) => node.id !== nodeId)
      const cleanedNodes = filteredNodes.map((node) => ({
        ...node,
        choices: node.choices.filter((choice) => choice.targetId !== nodeId),
      }))

      updateStoryBuilder({
        nodes: cleanedNodes,
        currentNodeId: currentNodeId === nodeId ? cleanedNodes[0]?.id || "" : currentNodeId,
        title: storyTitle,
      })
    },
    [nodes, currentNodeId, storyTitle, updateStoryBuilder],
  )

  const addChoice = useCallback(
    (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId)
      if (!node) return

      const newChoice: EnhancedStoryChoice = {
        id: `choice_${Date.now()}`,
        text: "New choice",
        targetId: "",
        consequence: "Something happens...",
        probabilityWeight: 1,
        icon: "⭐"
      }

      updateNode(nodeId, {
        choices: [...node.choices, newChoice],
      })
    },
    [nodes, updateNode],
  )

  const updateChoice = useCallback(
    (nodeId: string, choiceId: string, updates: Partial<EnhancedStoryChoice>) => {
      const node = nodes.find((n) => n.id === nodeId)
      if (!node) return

      const updatedChoices = node.choices.map((choice) => (choice.id === choiceId ? { ...choice, ...updates } : choice))
      updateNode(nodeId, { choices: updatedChoices })
    },
    [nodes, updateNode],
  )

  const deleteChoice = useCallback(
    (nodeId: string, choiceId: string) => {
      const node = nodes.find((n) => n.id === nodeId)
      if (!node) return

      const filteredChoices = node.choices.filter((choice) => choice.id !== choiceId)
      updateNode(nodeId, { choices: filteredChoices })
    },
    [nodes, updateNode],
  )

  const handleImageUpload = useCallback((nodeId: string, file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const imageData = e.target?.result as string
      updateNode(nodeId, { image: imageData })
    }
    reader.readAsDataURL(file)
  }, [updateNode])

  const duplicateNode = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId)
    if (!node) return

    const newNodeId = `node_${Date.now()}`
    const duplicatedNode = {
      ...node,
      id: newNodeId,
      title: `${node.title} (Copy)`,
      choices: node.choices.map(choice => ({
        ...choice,
        id: `choice_${Date.now()}_${Math.random()}`
      }))
    }

    updateStoryBuilder({
      nodes: [...nodes, duplicatedNode],
      currentNodeId,
      title: storyTitle,
    })
  }, [nodes, currentNodeId, storyTitle, updateStoryBuilder])

  const exportStory = useCallback(() => {
    const storyData = {
      title: storyTitle,
      nodes: nodes,
      metadata: {
        totalNodes: nodes.length,
        totalChoices: nodes.reduce((sum, node) => sum + node.choices.length, 0),
        estimatedTotalReadTime: nodes.reduce((sum, node) => sum + (node.estimatedReadTime || 1), 0),
        createdAt: new Date().toISOString()
      }
    }
    
    const blob = new Blob([JSON.stringify(storyData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${storyTitle.replace(/\s+/g, '_')}_story.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [storyTitle, nodes])

  React.useEffect(() => {
    initializeStory()
  }, [initializeStory])

  const currentPreviewNode = nodes.find((n) => n.id === previewNodeId) as EnhancedStoryNode

  if (isPreviewMode) {
    const nodeMood = currentPreviewNode?.mood || 'neutral'
    const moodStyle = moodColors[nodeMood]

    return (
      <Card className="w-full max-w-5xl mx-auto my-6 shadow-2xl border-0 overflow-hidden">
        <div className={cn("relative", moodStyle.bg)}>
          {currentPreviewNode?.image && (
            <div className="relative h-64 w-full">
              <img 
                src={currentPreviewNode.image} 
                alt={currentPreviewNode.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
          )}
          
          <CardHeader className="relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <Play className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent">
                    {storyTitle}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                    <Timer className="w-4 h-4" />
                    {currentPreviewNode?.estimatedReadTime || 1} min read
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsPreviewMode(false)} className="backdrop-blur-sm bg-white/20">
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Story
              </Button>
            </div>
          </CardHeader>
        </div>

        <CardContent className="p-8">
          {currentPreviewNode ? (
            <div className="space-y-6">
              <div className="prose prose-xl max-w-none">
                <h2 className="text-3xl font-bold mb-6 text-foreground">
                  {currentPreviewNode.title}
                </h2>
                <div className="text-lg leading-relaxed text-muted-foreground whitespace-pre-wrap">
                  {currentPreviewNode.content}
                </div>
              </div>

              {currentPreviewNode.tags && currentPreviewNode.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {currentPreviewNode.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}

              {currentPreviewNode.choices.length > 0 && (
                <div className="space-y-4 mt-8">
                  <h3 className="font-bold text-xl flex items-center gap-2">
                    <Target className="w-5 h-5 text-accent" />
                    What's your next move?
                  </h3>
                  <div className="grid gap-3">
                    {currentPreviewNode.choices.map((choice, index) => (
                      <Button
                        key={choice.id}
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left h-auto p-6 group transition-all duration-300",
                          "hover:shadow-lg hover:scale-[1.02] hover:border-accent/50 hover:bg-accent/5",
                          "border-2 border-border/30"
                        )}
                        onClick={() => setPreviewNodeId(choice.targetId)}
                        disabled={!choice.targetId}
                      >
                        <div className="flex items-start gap-4 w-full">
                          <div className="text-2xl">{choice.icon || "➤"}</div>
                          <div className="flex-1">
                            <div className="font-semibold text-base group-hover:text-accent transition-colors">
                              {choice.text}
                            </div>
                            {choice.consequence && (
                              <p className="text-sm text-muted-foreground mt-1 italic">
                                → {choice.consequence}
                              </p>
                            )}
                          </div>
                          <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity text-accent" />
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {currentPreviewNode.isEnd && (
                <div className="text-center py-8 bg-gradient-to-r from-accent/10 to-secondary/10 rounded-2xl">
                  <div className="text-6xl mb-4">🎭</div>
                  <Badge variant="secondary" className="text-lg px-6 py-3 rounded-full">
                    The End
                  </Badge>
                  <p className="text-muted-foreground mt-4">Thank you for experiencing this story!</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-8xl mb-6">📖</div>
              <h3 className="text-2xl font-bold mb-4">Ready to Begin?</h3>
              <p className="text-muted-foreground mb-8 text-lg">Select a starting point to experience the story</p>
              <Button
                size="lg"
                className="px-8 py-4 text-lg"
                onClick={() => {
                  const startNode = nodes.find((n) => n.isStart) || nodes[0]
                  if (startNode) setPreviewNodeId(startNode.id)
                }}
              >
                <Play className="w-5 h-5 mr-2" />
                Start Adventure
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto my-6">
      <Card className="shadow-2xl border-0 overflow-hidden">
        <CardHeader className="bg-gradient-to-br from-accent/20 via-accent/10 to-secondary/10 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-accent/20 rounded-2xl backdrop-blur-sm">
                <GitBranch className="w-8 h-8 text-accent" />
              </div>
              <div className="space-y-1">
                <Input
                  value={storyTitle}
                  onChange={(e) => setStoryTitle(e.target.value)}
                  onBlur={() => updateStoryBuilder({ nodes, currentNodeId, title: storyTitle })}
                  className="text-2xl font-bold bg-transparent border-none p-0 h-auto focus-visible:ring-0 text-foreground"
                  placeholder="Enter your story title..."
                />
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    Interactive Story Builder
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {nodes.length} Chapters
                  </span>
                  <span className="flex items-center gap-1">
                    <Timer className="w-4 h-4" />
                    ~{nodes.reduce((sum, node) => sum + ((node as EnhancedStoryNode).estimatedReadTime || 1), 0)} min
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="mr-4">
                <TabsList className="bg-white/50 backdrop-blur-sm">
                  <TabsTrigger value="grid" size="sm">Grid</TabsTrigger>
                  <TabsTrigger value="list" size="sm">List</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <Button variant="outline" size="sm" onClick={exportStory}>
                <Save className="w-4 h-4 mr-2" />
                Export
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const startNode = nodes.find((n) => n.isStart) || nodes[0]
                  if (startNode) {
                    setPreviewNodeId(startNode.id)
                    setIsPreviewMode(true)
                  }
                }}
                disabled={nodes.length === 0}
                className="bg-accent/10 border-accent/30 hover:bg-accent/20"
              >
                <Play className="w-4 h-4 mr-2" />
                Preview
              </Button>
              
              <Button size="sm" onClick={addNewNode} className="bg-accent hover:bg-accent/90">
                <Plus className="w-4 h-4 mr-2" />
                Add Chapter
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {nodes.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-8xl mb-6">✨</div>
              <h3 className="text-3xl font-bold mb-4">Create Your Interactive Story</h3>
              <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                Build immersive, branching narratives where every choice matters. 
                Add images, set moods, and create unforgettable adventures.
              </p>
              <Button size="lg" onClick={addNewNode} className="px-8 py-4 text-lg">
                <Plus className="w-5 h-5 mr-2" />
                Start Creating
              </Button>
            </div>
          ) : (
            <div className={cn(
              "gap-6",
              viewMode === 'grid' ? "grid md:grid-cols-2" : "space-y-4"
            )}>
              {nodes.map((node) => {
                const enhancedNode = node as EnhancedStoryNode
                const nodeMood = enhancedNode.mood || 'neutral'
                const moodStyle = moodColors[nodeMood]

                return (
                  <Card
                    key={node.id}
                    className={cn(
                      "group relative transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-2",
                      node.isStart && "ring-4 ring-accent/30 shadow-accent/20 shadow-lg",
                      editingNode === node.id && "ring-4 ring-secondary/50",
                      moodStyle.border,
                      "overflow-hidden"
                    )}
                  >
                    {enhancedNode.image && (
                      <div className="relative h-32 w-full">
                        <img 
                          src={enhancedNode.image} 
                          alt={node.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 bg-white/20 backdrop-blur-sm hover:bg-white/30"
                          onClick={() => updateNode(node.id, { image: undefined })}
                        >
                          <Trash2 className="w-3 h-3 text-white" />
                        </Button>
                      </div>
                    )}

                    <CardHeader className={cn("pb-3", moodStyle.bg)}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 flex-wrap">
                          {node.isStart && (
                            <Badge className="bg-accent text-accent-foreground">
                              🚀 Start
                            </Badge>
                          )}
                          {node.isEnd && (
                            <Badge variant="outline" className="border-accent/50">
                              🎯 End
                            </Badge>
                          )}
                          {enhancedNode.tags?.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => duplicateNode(node.id)}
                            className="hover:bg-accent/20"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingNode(editingNode === node.id ? null : node.id)}
                            className="hover:bg-accent/20"
                          >
                            <Edit3 className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNode(node.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      {editingNode === node.id ? (
                        <div className="space-y-3">
                          <Input
                            value={node.title}
                            onChange={(e) => updateNode(node.id, { title: e.target.value })}
                            className="font-semibold text-lg"
                            placeholder="Chapter title"
                          />
                          
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-xs">Mood</Label>
                              <select
                                value={enhancedNode.mood || 'neutral'}
                                onChange={(e) => updateNode(node.id, { mood: e.target.value as any })}
                                className="w-full text-sm border rounded px-2 py-1 bg-background"
                              >
                                <option value="neutral">😐 Neutral</option>
                                <option value="happy">😊 Happy</option>
                                <option value="sad">😢 Sad</option>
                                <option value="mysterious">🔮 Mysterious</option>
                                <option value="exciting">🚀 Exciting</option>
                                <option value="dark">🌙 Dark</option>
                              </select>
                            </div>
                            <div>
                              <Label className="text-xs">Read Time (min)</Label>
                              <Input
                                type="number"
                                value={enhancedNode.estimatedReadTime || 1}
                                onChange={(e) => updateNode(node.id, { estimatedReadTime: parseInt(e.target.value) || 1 })}
                                className="text-sm"
                                min={1}
                              />
                            </div>
                          </div>

                          <div>
                            <Label className="text-xs">Tags (comma-separated)</Label>
                            <Input
                              value={enhancedNode.tags?.join(', ') || ''}
                              onChange={(e) => updateNode(node.id, { tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                              placeholder="adventure, fantasy, mystery"
                              className="text-sm"
                            />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <CardTitle className={cn("text-xl mb-2", moodStyle.text)}>
                            {node.title}
                          </CardTitle>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Timer className="w-3 h-3" />
                              {enhancedNode.estimatedReadTime || 1}m
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {node.choices.length} choices
                            </span>
                          </div>
                        </div>
                      )}
                    </CardHeader>

                    <CardContent className="space-y-4 p-4">
                      {editingNode === node.id ? (
                        <Textarea
                          value={node.content}
                          onChange={(e) => updateNode(node.id, { content: e.target.value })}
                          placeholder="Write your story content..."
                          className="min-h-[120px] resize-none text-sm"
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground line-clamp-4 leading-relaxed">
                          {node.content}
                        </p>
                      )}

                      {/* Image Upload Section */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-medium">Scene Image</Label>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) handleImageUpload(node.id, file)
                            }}
                            className="hidden"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-xs h-6 px-2"
                          >
                            <Upload className="w-3 h-3 mr-1" />
                            {enhancedNode.image ? 'Change' : 'Upload'}
                          </Button>
                        </div>
                      </div>

                      {/* Choices Section */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium flex items-center gap-1">
                            <GitBranch className="w-3 h-3" />
                            Choices ({node.choices.length})
                          </span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => addChoice(node.id)}
                            className="text-xs h-6 px-2 hover:bg-accent/20"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>

                        {node.choices.map((choice) => {
                          const enhancedChoice = choice as EnhancedStoryChoice
                          return (
                            <div key={choice.id} className="space-y-2 p-3 bg-muted/30 rounded-lg border border-border/30">
                              <div className="flex gap-2 items-start">
                                <Input
                                  value={enhancedChoice.icon || '⭐'}
                                  onChange={(e) => updateChoice(node.id, choice.id, { icon: e.target.value })}
                                  placeholder="🎭"
                                  className="w-12 h-8 text-center text-sm p-1"
                                />
                                <Input
                                  value={choice.text}
                                  onChange={(e) => updateChoice(node.id, choice.id, { text: e.target.value })}
                                  placeholder="Choice text"
                                  className="flex-1 text-sm h-8"
                                />
                                <select
                                  value={choice.targetId}
                                  onChange={(e) => updateChoice(node.id, choice.id, { targetId: e.target.value })}
                                  className="text-sm border rounded px-2 py-1 bg-background h-8 min-w-[120px]"
                                >
                                  <option value="">Select target</option>
                                  {nodes
                                    .filter((n) => n.id !== node.id)
                                    .map((n) => (
                                      <option key={n.id} value={n.id}>
                                        {n.title}
                                      </option>
                                    ))}
                                </select>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteChoice(node.id, choice.id)}
                                  className="text-destructive hover:text-destructive p-1 h-8 w-8"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                              
                              {editingNode === node.id && (
                                <div className="space-y-2">
                                  <Input
                                    value={enhancedChoice.consequence || ''}
                                    onChange={(e) => updateChoice(node.id, choice.id, { consequence: e.target.value })}
                                    placeholder="What happens when this choice is selected?"
                                    className="text-xs text-muted-foreground italic"
                                  />
                                  <div className="flex gap-2">
                                    <Input
                                      value={enhancedChoice.requiredItem || ''}
                                      onChange={(e) => updateChoice(node.id, choice.id, { requiredItem: e.target.value })}
                                      placeholder="Required item (optional)"
                                      className="text-xs flex-1"
                                    />
                                    <Input
                                      type="number"
                                      value={enhancedChoice.probabilityWeight || 1}
                                      onChange={(e) => updateChoice(node.id, choice.id, { probabilityWeight: parseInt(e.target.value) || 1 })}
                                      placeholder="Weight"
                                      className="text-xs w-16"
                                      min={1}
                                      max={10}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Advanced Settings Dialog */}
      <Dialog open={showAdvancedEditor} onOpenChange={setShowAdvancedEditor}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Advanced Story Settings
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="space-y-3">
              <Label>Story Metadata</Label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Total Nodes</Label>
                  <Input value={nodes.length} disabled className="text-sm" />
                </div>
                <div>
                  <Label className="text-xs">Total Choices</Label>
                  <Input 
                    value={nodes.reduce((sum, node) => sum + node.choices.length, 0)} 
                    disabled 
                    className="text-sm" 
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Story Statistics</Label>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-accent/10 rounded-lg text-center">
                  <div className="text-2xl font-bold text-accent">
                    {nodes.reduce((sum, node) => sum + ((node as EnhancedStoryNode).estimatedReadTime || 1), 0)}
                  </div>
                  <div className="text-xs text-muted-foreground">Total Minutes</div>
                </div>
                <div className="p-3 bg-secondary/10 rounded-lg text-center">
                  <div className="text-2xl font-bold text-secondary">
                    {nodes.filter(node => (node as EnhancedStoryNode).image).length}
                  </div>
                  <div className="text-xs text-muted-foreground">With Images</div>
                </div>
                <div className="p-3 bg-primary/10 rounded-lg text-center">
                  <div className="text-2xl font-bold text-primary">
                    {new Set(nodes.flatMap(node => (node as EnhancedStoryNode).tags || [])).size}
                  </div>
                  <div className="text-xs text-muted-foreground">Unique Tags</div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Export Options</Label>
              <div className="flex gap-2">
                <Button onClick={exportStory} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  Export as JSON
                </Button>
                <Button variant="outline" className="flex-1">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Story
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Story Validation</Label>
              <div className="space-y-2 text-sm">
                {nodes.some(node => !node.isStart && !nodes.some(n => n.choices.some(c => c.targetId === node.id))) && (
                  <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
                    ⚠️ Some nodes are unreachable from the start
                  </div>
                )}
                {nodes.some(node => node.choices.some(choice => !choice.targetId)) && (
                  <div className="p-2 bg-red-50 border border-red-200 rounded text-red-800">
                    ❌ Some choices don't have target nodes
                  </div>
                )}
                {!nodes.some(node => node.isStart) && (
                  <div className="p-2 bg-red-50 border border-red-200 rounded text-red-800">
                    ❌ No starting node defined
                  </div>
                )}
                {nodes.every(node => node.choices.length > 0) && (
                  <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
                    ⚠️ No ending nodes (all nodes have choices)
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}