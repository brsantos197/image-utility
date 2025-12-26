"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ConversionResultProps {
  result: {
    originalFile: File
    originalFormat: string
    newFormat: string
    convertedBlob: Blob
  }
}

export function ConversionResult({ result }: ConversionResultProps) {
  const downloadConverted = () => {
    const url = URL.createObjectURL(result.convertedBlob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${result.originalFile.name.split(".")[0]}.${result.newFormat}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const originalSizeKB = (result.originalFile.size / 1024).toFixed(2)
  const convertedSizeKB = (result.convertedBlob.size / 1024).toFixed(2)

  return (
    <div className="space-y-4">
      <Card className="border-border bg-gradient-to-br from-card to-card/50 p-6">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Formato Original</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{result.originalFormat.toUpperCase()}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Novo Formato</p>
              <p className="mt-1 text-2xl font-bold text-primary">{result.newFormat.toUpperCase()}</p>
            </div>
          </div>

          <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Tamanho Original</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{originalSizeKB} KB</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Tamanho Convertido</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{convertedSizeKB} KB</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-primary/10 p-3">
            <p className="text-sm font-medium text-primary">✓ Conversão realizada com sucesso</p>
          </div>
        </div>
      </Card>

      <Button onClick={downloadConverted} size="lg" className="w-full">
        Baixar Imagem Convertida
      </Button>
    </div>
  )
}
