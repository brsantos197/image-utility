"use client"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { FileUpload } from "@/components/file-upload"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"

const compressionSchema = z.object({
  quality: z.number().min(1).max(100),
  format: z.enum(["jpeg", "png", "webp"]),
})

type CompressionFormData = z.infer<typeof compressionSchema>

interface CompressorFormProps {
  onCompressionComplete: (result: {
    originalSize: number
    compressedSize: number
    originalFile: File
    compressedBlob: Blob
    reduction: number
    format: string
  }) => void
}

export function CompressorForm({ onCompressionComplete }: CompressorFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isCompressing, setIsCompressing] = useState(false)

  const form = useForm<CompressionFormData>({
    resolver: zodResolver(compressionSchema),
    defaultValues: {
      quality: 80,
      format: "webp",
    },
  })

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
  }

  const onSubmit = async (data: CompressionFormData) => {
    if (!selectedFile) return

    setIsCompressing(true)

    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = async () => {
          const canvas = document.createElement("canvas")
          canvas.width = img.width
          canvas.height = img.height

          const ctx = canvas.getContext("2d")
          if (!ctx) throw new Error("Could not get canvas context")

          ctx.drawImage(img, 0, 0)

          const mimeType = `image/${data.format}`
          const quality = data.quality / 100

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const reduction = ((selectedFile.size - blob.size) / selectedFile.size) * 100

                onCompressionComplete({
                  originalSize: selectedFile.size,
                  compressedSize: blob.size,
                  originalFile: selectedFile,
                  compressedBlob: blob,
                  reduction: Math.max(0, reduction),
                  format: data.format,
                })
              }
              setIsCompressing(false)
            },
            mimeType,
            quality,
          )
        }
        img.src = e.target?.result as string
      }
      reader.readAsDataURL(selectedFile)
    } catch (error) {
      console.error("Erro na compressão:", error)
      setIsCompressing(false)
    }
  }

  return (
    <div className="space-y-6">
      <FileUpload onFileSelect={handleFileSelect} />

      {selectedFile && (
        <Card className="border-border bg-card p-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Arquivo Selecionado</p>
            <p className="text-sm text-muted-foreground">{selectedFile.name}</p>
            <p className="text-xs text-muted-foreground">Tamanho: {(selectedFile.size / 1024).toFixed(2)} KB</p>
          </div>
        </Card>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="quality"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel className="text-base">Qualidade: {field.value}%</FormLabel>
                  <span className="text-sm text-muted-foreground">
                    {field.value <= 50 ? "Baixa" : field.value <= 80 ? "Média" : "Alta"}
                  </span>
                </div>
                <FormControl>
                  <Slider
                    min={1}
                    max={100}
                    step={1}
                    value={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                    className="mt-2"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="format"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Formato de Saída</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="webp">WebP (Melhor Compressão)</SelectItem>
                    <SelectItem value="jpeg">JPEG (Compatibilidade)</SelectItem>
                    <SelectItem value="png">PNG (Sem Perda)</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={!selectedFile || isCompressing} size="lg">
            {isCompressing ? "Comprimindo..." : "Comprimir Imagem"}
          </Button>
        </form>
      </Form>
    </div>
  )
}
