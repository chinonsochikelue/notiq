import Editor from "@/components/editor"

export default function Home() {
  return (
    /* Enhanced page layout with better spacing and visual hierarchy */
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto px-4 md:px-8">
        <Editor isEditable={true} />
      </div>
    </div>
  )
}
