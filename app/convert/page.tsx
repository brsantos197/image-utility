"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { FormatConverterForm } from "@/components/format-converter-form"
import { ConversionResult } from "@/components/conversion-result"

export default function ConvertPage() {
  const [result, setResult] = useState<{
    originalFile: File
    originalFormat: string
    newFormat: string
    convertedBlob: Blob
  } | null>(null)

  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-slate-50 dark:to-slate-900">
      <Navigation />

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground">
            Conversor de{" "}
            <span className="bg-gradient-to-r from-cyan-500 via-blue-500 to-sky-500 bg-clip-text text-transparent">
              Formatos
            </span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            Converta suas imagens para diferentes formatos com qualidade máxima.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="mb-6 text-lg font-semibold text-foreground">Upload & Conversão</h2>
            <FormatConverterForm onConversionComplete={setResult} />
          </div>

          {result && (
            <div>
              <h2 className="mb-6 text-lg font-semibold text-foreground">Resultado</h2>
              <ConversionResult result={result} />
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
