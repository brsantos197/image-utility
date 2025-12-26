import { DashboardCard } from "@/components/dashboard-card"
import { Navigation } from "@/components/navigation"

const tools = [
  {
    id: "compress",
    title: "Compressor de Imagens",
    description: "Reduz o tamanho de imagens com controle de qualidade",
    icon: "📦",
    href: "/compress",
  },
  {
    id: "resize",
    title: "Redimensionar",
    description: "Altere as dimensões de suas imagens",
    icon: "📐",
    href: "/resize",
  },
  {
    id: "crop",
    title: "Cortar",
    description: "Recorte e ajuste suas imagens",
    icon: "✂️",
    href: "/crop",
  },
  {
    id: "qrcode",
    title: "Gerador QR Code",
    description: "Crie códigos QR a partir de imagens ou texto",
    icon: "🔲",
    href: "/qrcode",
  },
  {
    id: "convert",
    title: "Conversor de Formato",
    description: "Converta imagens para diferentes formatos",
    icon: "🔄",
    href: "/convert",
  },
  {
    id: "pdf",
    title: "Gerador PDF",
    description: "Converta imagens em documentos PDF",
    icon: "📄",
    href: "/pdf",
  },
  {
    id: "favicon",
    title: "Conversor de Favicon",
    description: "Converta imagens em favicons de múltiplos tamanhos",
    icon: "⭐",
    href: "/favicon",
  },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-slate-50 dark:to-slate-900">
      <Navigation />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-foreground sm:text-5xl">
            Utilitários para{" "}
            <span className="bg-gradient-to-r from-cyan-500 via-blue-500 to-sky-500 bg-clip-text text-transparent">
              Imagens
            </span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Processe, converta e transforme suas imagens com ferramentas poderosas e fáceis de usar
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <DashboardCard key={tool.id} tool={tool} />
          ))}
        </div>
      </div>
    </main>
  )
}
