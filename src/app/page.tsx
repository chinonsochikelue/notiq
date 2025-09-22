import Editor from "@/components/editor"
import { ModeToggle } from "@/components/theme/ModeToggle"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <ModeToggle />
      <div className="container max-w-6xl mx-auto md:px-8">
        <Editor isEditable={false} />
      </div>
    </div>
  )
}
