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
import { Input } from "@/components/ui/input"

const pdfSchema = z.object({
  pageSize: z.enum(["A4", "Letter", "A3"]),
  orientation: z.enum(["portrait", "landscape"]),
  title: z.string().optional(),
})

type PdfFormData = z.infer<typeof pdfSchema>

export function PdfGeneratorForm() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const form = useForm<PdfFormData>({
    resolver: zodResolver(pdfSchema),
    defaultValues: {
      pageSize: "A4",
      orientation: "portrait",
      title: "",
    },
  })

  const handleFileSelect = (file: File) => {
    setSelectedFiles((prev) => [...prev, file])
  }

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: PdfFormData) => {
    if (selectedFiles.length === 0) return

    setIsGenerating(true)

    try {
      // Import PDFKit dynamically to avoid SSR issues
      const { jsPDF } = await import("jspdf")

      const pageSizes: Record<string, [number, number]> = {
        A4: [210, 297],
        Letter: [215.9, 279.4],
        A3: [297, 420],
      }

      const [pageWidth, pageHeight] = pageSizes[data.pageSize]

      const pdf = new jsPDF({
        orientation: data.orientation,
        unit: "mm",
        format: data.pageSize.toLowerCase(),
      })

      // Add title if provided
      if (data.title) {
        pdf.setFontSize(16)
        pdf.text(data.title, pageWidth / 2, 15, { align: "center" })
      }

      const actualPageHeight = data.orientation === "portrait" ? pageHeight : pageWidth
      const actualPageWidth = data.orientation === "portrait" ? pageWidth : pageHeight
      const margin = 10
      const contentHeight = actualPageHeight - margin * 2 - (data.title ? 20 : 0)
      const contentWidth = actualPageWidth - margin * 2

      let yPosition = data.title ? 30 : margin

      for (const file of selectedFiles) {
        const reader = new FileReader()
        await new Promise<void>((resolve) => {
          reader.onload = (e) => {
            const img = new Image()
            img.crossOrigin = "anonymous"
            img.onload = () => {
              const imgRatio = img.width / img.height
              let imgWidth = contentWidth
              let imgHeight = imgWidth / imgRatio

              if (imgHeight > contentHeight - (yPosition - margin)) {
                imgHeight = contentHeight - (yPosition - margin)
                imgWidth = imgHeight * imgRatio
              }

              const xPosition = margin + (contentWidth - imgWidth) / 2

              if (yPosition + imgHeight > actualPageHeight - margin) {
                pdf.addPage()
                yPosition = margin
              }

              pdf.addImage(e.target?.result as string, "PNG", xPosition, yPosition, imgWidth, imgHeight)
              yPosition += imgHeight + 10

              resolve()
            }
            img.src = e.target?.result as string
          }
          reader.readAsDataURL(file)
        })
      }

      const fileName = data.title ? `${data.title}.pdf` : "documento.pdf"
      pdf.save(fileName)
    } catch (error) {
      console.error("Erro ao gerar PDF:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <FileUpload onFileSelect={handleFileSelect} accept="image/*" multiple label="Selecionar Imagens" />

      {selectedFiles.length > 0 && (
        <Card className="border-border bg-card p-4">
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">{selectedFiles.length} imagem(ns) selecionada(s)</p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between rounded bg-muted p-2">
                  <span className="text-sm text-muted-foreground truncate">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="text-xs text-destructive hover:underline"
                  >
                    Remover
                  </button>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título do Documento (Opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Relatório de Fotos" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="pageSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tamanho da Página</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="A4">A4</SelectItem>
                      <SelectItem value="Letter">Letter</SelectItem>
                      <SelectItem value="A3">A3</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="orientation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Orientação</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="portrait">Retrato</SelectItem>
                      <SelectItem value="landscape">Paisagem</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" className="w-full" disabled={selectedFiles.length === 0 || isGenerating} size="lg">
            {isGenerating ? "Gerando PDF..." : "Gerar PDF"}
          </Button>
        </form>
      </Form>
    </div>
  )
}
