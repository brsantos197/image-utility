"use client"

import type React from "react"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Download, Upload, Loader2 } from "lucide-react"
import JSZip from "jszip"

const faviconSchema = z.object({
  image: z.any(),
})

type FaviconFormValues = z.infer<typeof faviconSchema>

interface GeneratedFavicon {
  size: string
  url: string
  filename: string
}

const FAVICON_SIZES = [
  { size: 16, filename: "favicon-16x16.png" },
  { size: 32, filename: "favicon-32x32.png" },
  { size: 48, filename: "favicon-48x48.png" },
  { size: 180, filename: "apple-touch-icon.png" },
  { size: 192, filename: "android-chrome-192x192.png" },
  { size: 512, filename: "android-chrome-512x512.png" },
]

export function FaviconConverterForm() {
  const [preview, setPreview] = useState<string | null>(null)
  const [generatedFavicons, setGeneratedFavicons] = useState<GeneratedFavicon[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FaviconFormValues>({
    resolver: zodResolver(faviconSchema),
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      setPreview(result)
      generateFavicons(result)
    }
    reader.readAsDataURL(file)
  }

  const generateFavicons = async (imageUrl: string) => {
    setIsProcessing(true)
    const favicons: GeneratedFavicon[] = []

    const img = new Image()
    img.src = imageUrl

    img.onload = () => {
      FAVICON_SIZES.forEach(({ size, filename }) => {
        const canvas = document.createElement("canvas")
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext("2d")

        if (ctx) {
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = "high"
          ctx.drawImage(img, 0, 0, size, size)

          const url = canvas.toDataURL("image/png")
          favicons.push({
            size: `${size}x${size}`,
            url,
            filename,
          })
        }
      })

      // Generate ICO file (using the 16, 32, and 48 sizes)
      generateIcoFile(
        favicons.filter(
          (f) => f.filename.includes("16x16") || f.filename.includes("32x32") || f.filename.includes("48x48"),
        ),
      )

      setGeneratedFavicons(favicons)
      setIsProcessing(false)
    }
  }

  const generateIcoFile = (pngFavicons: GeneratedFavicon[]) => {
    // For simplicity, we'll use the 32x32 as the main ICO
    // In a real implementation, you'd create a proper multi-layer ICO
    const canvas = document.createElement("canvas")
    canvas.width = 32
    canvas.height = 32
    const ctx = canvas.getContext("2d")

    const img = new Image()
    const favicon32 = pngFavicons.find((f) => f.filename.includes("32x32"))

    if (favicon32 && ctx) {
      img.src = favicon32.url
      img.onload = () => {
        ctx.drawImage(img, 0, 0, 32, 32)
        const icoUrl = canvas.toDataURL("image/x-icon")

        setGeneratedFavicons((prev) => [
          ...prev,
          {
            size: "ico",
            url: icoUrl,
            filename: "favicon.ico",
          },
        ])
      }
    }
  }

  const downloadAll = async () => {
    const zip = new JSZip()

    // Add all favicon images to zip
    for (const favicon of generatedFavicons) {
      const base64Data = favicon.url.split(",")[1]
      zip.file(favicon.filename, base64Data, { base64: true })
    }

    // Add site.webmanifest
    const manifest = {
      name: "",
      short_name: "",
      icons: [
        {
          src: "/android-chrome-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "/android-chrome-512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
      ],
      theme_color: "#ffffff",
      background_color: "#ffffff",
      display: "standalone",
    }
    zip.file("site.webmanifest", JSON.stringify(manifest, null, 2))

    // Add HTML snippet
    const htmlSnippet = `<!-- Place these tags in the <head> of your HTML -->
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="manifest" href="/site.webmanifest">`
    zip.file("installation.html", htmlSnippet)

    // Generate and download zip
    const blob = await zip.generateAsync({ type: "blob" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "favicons.zip"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const downloadSingle = (favicon: GeneratedFavicon) => {
    const a = document.createElement("a")
    a.href = favicon.url
    a.download = favicon.filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="image">Upload de Imagem</Label>
            <div className="mt-2">
              <label
                htmlFor="image"
                className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 p-12 transition-colors hover:border-primary hover:bg-muted"
              >
                <Upload className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">Clique para fazer upload ou arraste e solte</p>
                <p className="mt-1 text-xs text-muted-foreground">PNG, JPG ou BMP (recomendado: imagem quadrada)</p>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  {...register("image")}
                  onChange={handleImageChange}
                />
              </label>
            </div>
          </div>

          {preview && (
            <div className="flex justify-center rounded-lg border border-border bg-muted/30 p-8">
              <div className="flex flex-col items-center gap-4">
                <p className="text-sm font-medium text-muted-foreground">Preview Original</p>
                <img
                  src={preview || "/placeholder.svg"}
                  alt="Preview"
                  className="h-32 w-32 rounded-lg border border-border object-contain shadow-md"
                />
              </div>
            </div>
          )}
        </div>
      </Card>

      {isProcessing && (
        <Card className="p-6">
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Gerando favicons...</p>
          </div>
        </Card>
      )}

      {generatedFavicons.length > 0 && !isProcessing && (
        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Favicons Gerados</h3>
                <p className="text-sm text-muted-foreground">
                  {generatedFavicons.length} arquivos prontos para download
                </p>
              </div>
              <Button onClick={downloadAll} className="gap-2">
                <Download className="h-4 w-4" />
                Baixar Tudo (ZIP)
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {generatedFavicons.map((favicon) => (
                <div
                  key={favicon.filename}
                  className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-4"
                >
                  <div
                    className="flex h-16 w-16 items-center justify-center rounded-md border border-border bg-white"
                    style={{
                      backgroundImage:
                        "linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)",
                      backgroundSize: "10px 10px",
                      backgroundPosition: "0 0, 0 5px, 5px -5px, -5px 0px",
                    }}
                  >
                    <img
                      src={favicon.url || "/placeholder.svg"}
                      alt={favicon.filename}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate text-sm font-medium text-foreground">{favicon.filename}</p>
                    <p className="text-xs text-muted-foreground">{favicon.size}</p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => downloadSingle(favicon)}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <h4 className="mb-2 text-sm font-semibold text-foreground">Instruções de Instalação</h4>
              <ol className="list-inside list-decimal space-y-1 text-sm text-muted-foreground">
                <li>Baixe todos os arquivos usando o botão "Baixar Tudo"</li>
                <li>Coloque os arquivos no diretório raiz do seu website</li>
                <li>Copie o código HTML do arquivo installation.html</li>
                <li>Cole o código dentro da tag &lt;head&gt; do seu HTML</li>
              </ol>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
