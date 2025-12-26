import { Navigation } from "@/components/navigation"
import { FaviconConverterForm } from "@/components/favicon-converter-form"

export default function FaviconPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-slate-50 dark:to-slate-900">
      <Navigation />

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Conversor de Favicon</h1>
          <p className="mt-2 text-muted-foreground">
            Converta sua imagem em favicons de múltiplos tamanhos prontos para usar
          </p>
        </div>

        <FaviconConverterForm />
      </div>
    </main>
  )
}
