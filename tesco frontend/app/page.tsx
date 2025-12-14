import { CreativeEditor } from "@/components/creative-editor"
import { API_URL } from "@/lib/api";   // ✅ add this line

export default function Home() {

  console.log("Backend URL:", API_URL); // optional, to check

  return (
    <main className="h-screen w-screen overflow-hidden">
      <CreativeEditor />
    </main>
  )
}
