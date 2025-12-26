"use client"
import { Navigation } from "@/components/navigation"
import { PdfGeneratorForm } from "@/components/pdf-generator-form"

export default function PdfPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-slate-50 dark:to-slate-900">
      <Navigation />

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground">
            Gerador de{" "}
            <span className="bg-gradient-to-r from-cyan-500 via-blue-500 to-sky-500 bg-clip-text text-transparent">
              PDF
            </span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            Converta suas imagens em documentos PDF profissionais. Suporte para múltiplas imagens.
          </p>
        </div>

        <PdfGeneratorForm />
      </div>
    </main>
  )
}
