"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { ResizeForm } from "@/components/resize-form"
import { ResizePreview } from "@/components/resize-preview"

export default function ResizePage() {
  const [result, setResult] = useState<{
    originalFile: File
    originalWidth: number
    originalHeight: number
    newWidth: number
    newHeight: number
    resizedBlob: Blob
  } | null>(null)

  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-slate-50 dark:to-slate-900">
      <Navigation />

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground">
            Redimensionar{" "}
            <span className="bg-gradient-to-r from-cyan-500 via-blue-500 to-sky-500 bg-clip-text text-transparent">
              Imagens
            </span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            Altere as dimensões mantendo a proporção ou criando tamanhos customizados.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="mb-6 text-lg font-semibold text-foreground">Upload & Configurações</h2>
            <ResizeForm onResizeComplete={setResult} />
          </div>

          {result && (
            <div>
              <h2 className="mb-6 text-lg font-semibold text-foreground">Preview</h2>
              <ResizePreview result={result} />
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
