"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { CompressorForm } from "@/components/compressor-form"
import { CompressionResult } from "@/components/compression-result"

export default function CompressPage() {
  const [result, setResult] = useState<{
    originalSize: number
    compressedSize: number
    originalFile: File
    compressedBlob: Blob
    reduction: number
    format: string
  } | null>(null)

  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-slate-50 dark:to-slate-900">
      <Navigation />

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground">
            Compressor de{" "}
            <span className="bg-gradient-to-r from-cyan-500 via-blue-500 to-sky-500 bg-clip-text text-transparent">
              Imagens
            </span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            Reduza o tamanho das suas imagens sem perder qualidade. Configure a compressão e escolha o formato desejado.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="mb-6 text-lg font-semibold text-foreground">Upload & Configurações</h2>
            <CompressorForm onCompressionComplete={setResult} />
          </div>

          {result && (
            <div>
              <h2 className="mb-6 text-lg font-semibold text-foreground">Resultado</h2>
              <CompressionResult result={result} />
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
