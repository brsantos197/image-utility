"use client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface ResizePreviewProps {
  result: {
    originalFile: File
    originalWidth: number
    originalHeight: number
    newWidth: number
    newHeight: number
    resizedBlob: Blob
  }
}

export function ResizePreview({ result }: ResizePreviewProps) {
  const [imageUrl, setImageUrl] = useState<string>("")

  const handleImageLoad = (blob: Blob) => {
    const url = URL.createObjectURL(blob)
    setImageUrl(url)
  }

  if (!imageUrl) {
    handleImageLoad(result.resizedBlob)
  }

  const downloadResized = () => {
    const url = URL.createObjectURL(result.resizedBlob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${result.originalFile.name.split(".")[0]}_resized.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <Card className="border-border bg-card p-6">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Dimensões Originais</p>
              <p className="mt-1 text-lg font-semibold text-foreground">
                {result.originalWidth} × {result.originalHeight} px
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Novas Dimensões</p>
              <p className="mt-1 text-lg font-semibold text-primary">
                {result.newWidth} × {result.newHeight} px
              </p>
            </div>
          </div>

          <div
            className="rounded-lg p-4 flex items-center justify-center min-h-64 overflow-auto border border-border"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='16' height='16' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='0' y='0' width='8' height='8' fill='%23e5e7eb'/%3E%3Crect x='8' y='8' width='8' height='8' fill='%23e5e7eb'/%3E%3C/svg%3E\")",
              backgroundSize: "16px 16px",
            }}
          >
            {imageUrl && (
              <img
                src={imageUrl || "/placeholder.svg"}
                alt="Preview redimensionado"
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                }}
              />
            )}
          </div>
        </div>
      </Card>

      <Button onClick={downloadResized} size="lg" className="w-full">
        Baixar Imagem
      </Button>
    </div>
  )
}
