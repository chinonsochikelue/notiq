import Editor from "@/components/editor";





export default function Home() {
  return (
    <div className="container h-[500vh] max-w-7xl mx-auto  max-sm:px-0   md:px-20">
      <Editor isEditable={true}/>
    </div>
  );
}
