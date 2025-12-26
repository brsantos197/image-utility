"use client"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { FileUpload } from "@/components/file-upload"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

const resizeSchema = z.object({
  width: z.coerce.number().positive("Largura deve ser positiva"),
  height: z.coerce.number().positive("Altura deve ser positiva"),
  maintainAspect: z.boolean().default(true),
})

type ResizeFormData = z.infer<typeof resizeSchema>

interface ResizeFormProps {
  onResizeComplete: (result: {
    originalFile: File
    originalWidth: number
    originalHeight: number
    newWidth: number
    newHeight: number
    resizedBlob: Blob
  }) => void
}

export function ResizeForm({ onResizeComplete }: ResizeFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imageInfo, setImageInfo] = useState<{ width: number; height: number } | null>(null)
  const [isResizing, setIsResizing] = useState(false)

  const form = useForm<ResizeFormData>({
    resolver: zodResolver(resizeSchema),
    defaultValues: {
      width: 800,
      height: 600,
      maintainAspect: true,
    },
  })

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        setImageInfo({ width: img.width, height: img.height })
        form.setValue("width", img.width)
        form.setValue("height", img.height)
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const handleWidthChange = (width: number) => {
    form.setValue("width", width)
    if (form.getValues("maintainAspect") && imageInfo) {
      const aspectRatio = imageInfo.height / imageInfo.width
      form.setValue("height", Math.round(width * aspectRatio))
    }
  }

  const handleHeightChange = (height: number) => {
    form.setValue("height", height)
    if (form.getValues("maintainAspect") && imageInfo) {
      const aspectRatio = imageInfo.width / imageInfo.height
      form.setValue("width", Math.round(height * aspectRatio))
    }
  }

  const onSubmit = async (data: ResizeFormData) => {
    if (!selectedFile || !imageInfo) return

    setIsResizing(true)

    try {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = () => {
          const canvas = document.createElement("canvas")
          canvas.width = data.width
          canvas.height = data.height

          const ctx = canvas.getContext("2d")
          if (!ctx) throw new Error("Could not get canvas context")

          ctx.drawImage(img, 0, 0, data.width, data.height)

          canvas.toBlob((blob) => {
            if (blob) {
              onResizeComplete({
                originalFile: selectedFile,
                originalWidth: imageInfo.width,
                originalHeight: imageInfo.height,
                newWidth: data.width,
                newHeight: data.height,
                resizedBlob: blob,
              })
            }
            setIsResizing(false)
          }, "image/png")
        }
        img.src = e.target?.result as string
      }
      reader.readAsDataURL(selectedFile)
    } catch (error) {
      console.error("Erro ao redimensionar:", error)
      setIsResizing(false)
    }
  }

  return (
    <div className="space-y-6">
      <FileUpload onFileSelect={handleFileSelect} />

      {selectedFile && imageInfo && (
        <Card className="border-border bg-card p-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Informações da Imagem</p>
            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              <p>Arquivo: {selectedFile.name}</p>
              <p>
                Dimensões: {imageInfo.width}x{imageInfo.height}px
              </p>
            </div>
          </div>
        </Card>
      )}

      {imageInfo && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="width"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Largura (px)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={(e) => handleWidthChange(Number(e.target.value))} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Altura (px)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={(e) => handleHeightChange(Number(e.target.value))} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maintainAspect"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="h-4 w-4 rounded border-input cursor-pointer"
                    />
                    <Label className="cursor-pointer text-sm">Manter proporção</Label>
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full" disabled={!selectedFile || isResizing} size="lg">
              {isResizing ? "Redimensionando..." : "Redimensionar"}
            </Button>
          </form>
        </Form>
      )}
    </div>
  )
}
