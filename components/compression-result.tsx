"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface CompressionResultProps {
  result: {
    originalSize: number
    compressedSize: number
    originalFile: File
    compressedBlob: Blob
    reduction: number
    format: string
  }
}

export function CompressionResult({ result }: CompressionResultProps) {
  const downloadCompressed = () => {
    const url = URL.createObjectURL(result.compressedBlob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${result.originalFile.name.split(".")[0]}_compressed.${result.format}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const originalSizeKB = (result.originalSize / 1024).toFixed(2)
  const compressedSizeKB = (result.compressedSize / 1024).toFixed(2)
  const reductionPercent = result.reduction.toFixed(1)

  return (
    <div className="space-y-4">
      <Card className="border-border bg-gradient-to-br from-card to-card/50 p-6">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Tamanho Original</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{originalSizeKB} KB</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Tamanho Comprimido</p>
              <p className="mt-1 text-2xl font-bold text-primary">{compressedSizeKB} KB</p>
            </div>
          </div>

          <div className="rounded-lg bg-muted/30 p-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Redução de Tamanho</p>
                <p className="mt-2 text-3xl font-bold text-accent">{reductionPercent}%</p>
              </div>
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                {reductionPercent}%
              </div>
            </div>
          </div>

          <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Economia</p>
            <p className="text-lg font-semibold text-foreground">
              {((result.originalSize - result.compressedSize) / 1024).toFixed(2)} KB economizados
            </p>
          </div>
        </div>
      </Card>

      <Button onClick={downloadCompressed} size="lg" className="w-full">
        Baixar Imagem Comprimida
      </Button>
    </div>
  )
}
