"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { FileUpload } from "@/components/file-upload"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { ColorPicker } from "./ui/color-picker"

const qrSchema = z.object({
  content: z.string().min(1, "Conteúdo obrigatório"),
  size: z.coerce.number().min(100).max(1000),
  errorCorrection: z.enum(["L", "M", "Q", "H"]),
})

type QrFormData = z.infer<typeof qrSchema>

interface QrCodeFormProps {
  onQrGenerated: (url: string) => void
}

export function QrCodeForm({ onQrGenerated }: QrCodeFormProps) {
  const [activeTab, setActiveTab] = useState("text")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [includeImage, setIncludeImage] = useState(false)
  const [overlayScale, setOverlayScale] = useState(0.2)
  const [overlayBorderStyle, setOverlayBorderStyle] = useState<"circle" | "rounded" | "square">("circle")
  const [overlayBorderColor, setOverlayBorderColor] = useState<string>("#000000")
  const [isGenerating, setIsGenerating] = useState(false)

  const form = useForm<QrFormData>({
    resolver: zodResolver(qrSchema),
    defaultValues: {
      content: "",
      size: 300,
      errorCorrection: "M",
    },
  })

  const handleFileSelect = (file: File) => {
    // use uploaded file as an overlay image, do not replace the text/url content
    setSelectedFile(file)

    // regenerate QR automatically if there's content to encode
    const current = form.getValues()
    if (current.content && current.content.length > 0) {
      // call generator with file override to ensure overlay is used immediately
      void onSubmit(current as QrFormData, file)
    }
  }

  const onSubmit = async (data: QrFormData, fileOverride?: File | null) => {
    setIsGenerating(true)

    try {
      const encodedContent = encodeURIComponent(data.content)
      const url = `https://api.qrserver.com/v1/create-qr-code/?size=${data.size}x${data.size}&data=${encodedContent}&ecc=${data.errorCorrection}&format=png`
      const overlayFile = fileOverride ?? selectedFile

      if (overlayFile && includeImage) {
        // Fetch the generated QR image, composite the uploaded image in the center and return a data URL
        const qrResp = await fetch(url)
        const qrBlob = await qrResp.blob()

        const loadImage = (source: string | Blob): Promise<HTMLImageElement> => {
          return new Promise((resolve, reject) => {
            const img = new Image()
            img.crossOrigin = "anonymous"
            img.onload = () => resolve(img)
            img.onerror = (err) => reject(err)
            if (source instanceof Blob) {
              img.src = URL.createObjectURL(source)
            } else {
              img.src = source
            }
          })
        }

        const qrImg = await loadImage(qrBlob)

        // read uploaded file as blob/data url
        const fileBlob = await overlayFile.arrayBuffer().then((buf) => new Blob([buf], { type: overlayFile.type }))
        const overlayImg = await loadImage(fileBlob)

        const size = data.size
        const canvas = document.createElement("canvas")
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext("2d")!

        // draw qr full-size
        ctx.drawImage(qrImg, 0, 0, size, size)

        // calculate overlay size and position
        const overlayPx = Math.max(8, Math.floor(size * overlayScale))
        const overlayX = Math.floor((size - overlayPx) / 2)
        const overlayY = Math.floor((size - overlayPx) / 2)

        // draw background + border and place overlay according to selected style
        const borderPadding = 6
        const half = overlayPx / 2
        const lineWidth = Math.max(2, Math.floor(overlayPx * 0.08))

        const drawRoundedRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
          const radius = Math.max(0, Math.min(r, Math.min(w, h) / 2))
          ctx.beginPath()
          ctx.moveTo(x + radius, y)
          ctx.lineTo(x + w - radius, y)
          ctx.quadraticCurveTo(x + w, y, x + w, y + radius)
          ctx.lineTo(x + w, y + h - radius)
          ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h)
          ctx.lineTo(x + radius, y + h)
          ctx.quadraticCurveTo(x, y + h, x, y + h - radius)
          ctx.lineTo(x, y + radius)
          ctx.quadraticCurveTo(x, y, x + radius, y)
          ctx.closePath()
        }

        if (overlayBorderStyle === "circle") {
          ctx.save()
          ctx.fillStyle = "white"
          ctx.beginPath()
          ctx.arc(size / 2, size / 2, half + borderPadding, 0, Math.PI * 2)
          ctx.fill()
          ctx.lineWidth = lineWidth
          ctx.strokeStyle = overlayBorderColor
          ctx.beginPath()
          ctx.arc(size / 2, size / 2, half + borderPadding - lineWidth / 2, 0, Math.PI * 2)
          ctx.stroke()
          ctx.restore()

          // clip to circle and draw overlay
          ctx.save()
          ctx.beginPath()
          ctx.arc(size / 2, size / 2, half, 0, Math.PI * 2)
          ctx.closePath()
          ctx.clip()
          ctx.drawImage(overlayImg, overlayX, overlayY, overlayPx, overlayPx)
          ctx.restore()
        } else {
          const rx = overlayBorderStyle === "rounded" ? Math.floor(overlayPx * 0.15) : 0
          const x = overlayX - borderPadding
          const y = overlayY - borderPadding
          const w = overlayPx + borderPadding * 2
          const h = overlayPx + borderPadding * 2

          ctx.save()
          ctx.fillStyle = "white"
          drawRoundedRect(ctx, x, y, w, h, rx)
          ctx.fill()
          ctx.lineWidth = lineWidth
          ctx.strokeStyle = overlayBorderColor
          drawRoundedRect(ctx, x + lineWidth / 2, y + lineWidth / 2, w - lineWidth, h - lineWidth, rx)
          ctx.stroke()
          ctx.restore()

          // clip to inner shape and draw overlay
          ctx.save()
          drawRoundedRect(ctx, overlayX, overlayY, overlayPx, overlayPx, rx)
          ctx.clip()
          ctx.drawImage(overlayImg, overlayX, overlayY, overlayPx, overlayPx)
          ctx.restore()
        }

        const dataUrl = canvas.toDataURL("image/png")
        onQrGenerated(dataUrl)
      } else {
        onQrGenerated(url)
      }
    } catch (error) {
      console.error("Erro ao gerar QR Code:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit((data) => onSubmit(data))} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="text">Texto</TabsTrigger>
              <TabsTrigger value="url">URL</TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="space-y-4">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Texto</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Digite o texto que deseja codificar"
                        className="resize-none"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </TabsContent>

            <TabsContent value="url" className="space-y-4">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://exemplo.com" type="url" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </TabsContent>


          </Tabs>

          {/* Image upload for overlay (placed after text/url inputs) */}
          <div className="space-y-4">
            <FileUpload onFileSelect={handleFileSelect} accept="image/*" label="Upload de Imagem (opcional)" />
            {selectedFile && (
              <Card className="border-border bg-card p-4">
                <p className="text-sm text-muted-foreground">Imagem selecionada: {selectedFile.name}</p>
                <div className="mt-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={includeImage}
                      onChange={(e) => setIncludeImage(e.target.checked)}
                    />
                    <span className="text-sm">Incluir imagem no centro do QR</span>
                  </label>

                  {includeImage && (
                    <div className="mt-3">
                      <label className="text-xs font-medium text-muted-foreground">Tamanho da imagem ({Math.round(overlayScale * 100)}%)</label>
                      <input
                        type="range"
                        min={0.08}
                        max={0.5}
                        step={0.01}
                        value={overlayScale}
                        onChange={(e) => setOverlayScale(Number(e.target.value))}
                        className="w-full mt-1"
                      />

                      <div className="mt-3 grid grid-cols-2 gap-2 items-center">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Estilo da borda</label>
                          <FormControl>
                            <Select value={overlayBorderStyle} onValueChange={(v) => setOverlayBorderStyle(v as any)}>
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="circle">Circular</SelectItem>
                                <SelectItem value="rounded">Arredondado</SelectItem>
                                <SelectItem value="square">Quadrado</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                        </div>

                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Cor da borda</label>
                          <ColorPicker
                            className="mt-1 w-full h-8 p-0"
                            onChange={(v) => {
                              if (typeof v === 'string') {
                                setOverlayBorderColor(v)
                              }
                            }}
                            value={overlayBorderColor}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="size"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tamanho ({field.value}px)</FormLabel>
                  <FormControl>
                    <input
                      type="range"
                      min="100"
                      max="1000"
                      step="10"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="errorCorrection"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nível de Correção de Erro</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="L">Baixo (7%)</SelectItem>
                      <SelectItem value="M">Médio (15%)</SelectItem>
                      <SelectItem value="Q">Quartil (25%)</SelectItem>
                      <SelectItem value="H">Alto (30%)</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isGenerating} size="lg">
            {isGenerating ? "Gerando..." : "Gerar QR Code"}
          </Button>
        </form>
      </Form>
    </div>
  )
}
