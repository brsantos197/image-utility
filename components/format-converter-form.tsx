"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { FileUpload } from "@/components/file-upload"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"

const supportedFormats = ["jpeg", "png", "webp", "gif", "bmp"]

const converterSchema = z.object({
  targetFormat: z.enum(["jpeg", "png", "webp", "gif", "bmp"]),
})

type ConverterFormData = z.infer<typeof converterSchema>

interface FormatConverterFormProps {
  onConversionComplete: (result: {
    originalFile: File
    originalFormat: string
    newFormat: string
    convertedBlob: Blob
  }) => void
}

export function FormatConverterForm({ onConversionComplete }: FormatConverterFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isConverting, setIsConverting] = useState(false)

  const form = useForm<ConverterFormData>({
    resolver: zodResolver(converterSchema),
    defaultValues: {
      targetFormat: "webp",
    },
  })

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
  }

  const onSubmit = async (data: ConverterFormData) => {
    if (!selectedFile) return

    setIsConverting(true)

    try {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = () => {
          const canvas = document.createElement("canvas")
          canvas.width = img.width
          canvas.height = img.height

          const ctx = canvas.getContext("2d")
          if (!ctx) throw new Error("Could not get canvas context")

          ctx.drawImage(img, 0, 0)

          const mimeType = `image/${data.targetFormat === "jpg" ? "jpeg" : data.targetFormat}`

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const originalFormat = selectedFile.name.split(".").pop() || "unknown"
                onConversionComplete({
                  originalFile: selectedFile,
                  originalFormat,
                  newFormat: data.targetFormat,
                  convertedBlob: blob,
                })
              }
              setIsConverting(false)
            },
            mimeType,
            0.95,
          )
        }
        img.src = e.target?.result as string
      }
      reader.readAsDataURL(selectedFile)
    } catch (error) {
      console.error("Erro na conversão:", error)
      setIsConverting(false)
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
            <p className="text-xs text-muted-foreground">
              Formato: {selectedFile.name.split(".").pop()?.toUpperCase()}
            </p>
          </div>
        </Card>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="targetFormat"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Converter para</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="jpeg">JPEG (JPG) - Compatível</SelectItem>
                    <SelectItem value="png">PNG - Sem Perda</SelectItem>
                    <SelectItem value="webp">WebP - Moderno</SelectItem>
                    <SelectItem value="gif">GIF - Animado</SelectItem>
                    <SelectItem value="bmp">BMP - Bitmap</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={!selectedFile || isConverting} size="lg">
            {isConverting ? "Convertendo..." : "Converter Imagem"}
          </Button>
        </form>
      </Form>
    </div>
  )
}
