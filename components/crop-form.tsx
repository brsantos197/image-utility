"use client"

import type React from "react"
import { useState, useRef } from "react"
import { FileUpload } from "@/components/file-upload"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

type ResizeHandle = "nw" | "n" | "ne" | "w" | "e" | "sw" | "s" | "se" | null

export function CropForm() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string>("")
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null)
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 200, height: 200 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [resizingHandle, setResizingHandle] = useState<ResizeHandle>(null)
  const imageContainerRef = useRef<HTMLDivElement>(null)

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      const url = e.target?.result as string
      setImageUrl(url)

      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        setImageDimensions({ width: img.width, height: img.height })
        setCropArea({
          x: img.width * 0.25,
          y: img.height * 0.25,
          width: img.width * 0.5,
          height: img.height * 0.5,
        })
      }
      img.src = url
    }
    reader.readAsDataURL(file)
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return

    const rect = imageContainerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (isInCropArea(x, y)) {
      setIsDragging(true)
      setDragStart({ x, y })
    }
  }

  const handleResizeMouseDown = (e: React.MouseEvent<HTMLDivElement>, handle: ResizeHandle) => {
    e.stopPropagation()
    setResizingHandle(handle)
    if (!imageContainerRef.current) return

    const rect = imageContainerRef.current.getBoundingClientRect()
    setDragStart({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current || !imageDimensions) return

    const rect = imageContainerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const dx = x - dragStart.x
    const dy = y - dragStart.y

    if (isDragging) {
      setCropArea((prev) => ({
        ...prev,
        x: Math.max(0, Math.min(prev.x + dx, imageDimensions.width - prev.width)),
        y: Math.max(0, Math.min(prev.y + dy, imageDimensions.height - prev.height)),
      }))
      setDragStart({ x, y })
    } else if (resizingHandle) {
      handleResize(dx, dy)
      setDragStart({ x, y })
    }
  }

  const handleResize = (dx: number, dy: number) => {
    if (!imageDimensions) return

    setCropArea((prev) => {
      const newArea = { ...prev }
      const minSize = 50

      switch (resizingHandle) {
        case "nw":
          newArea.x = Math.max(0, prev.x + dx)
          newArea.y = Math.max(0, prev.y + dy)
          newArea.width = Math.max(minSize, prev.width - dx)
          newArea.height = Math.max(minSize, prev.height - dy)
          break
        case "n":
          newArea.y = Math.max(0, prev.y + dy)
          newArea.height = Math.max(minSize, prev.height - dy)
          break
        case "ne":
          newArea.y = Math.max(0, prev.y + dy)
          newArea.width = Math.max(minSize, prev.width + dx)
          newArea.height = Math.max(minSize, prev.height - dy)
          break
        case "w":
          newArea.x = Math.max(0, prev.x + dx)
          newArea.width = Math.max(minSize, prev.width - dx)
          break
        case "e":
          newArea.width = Math.max(minSize, prev.width + dx)
          break
        case "sw":
          newArea.x = Math.max(0, prev.x + dx)
          newArea.width = Math.max(minSize, prev.width - dx)
          newArea.height = Math.max(minSize, prev.height + dy)
          break
        case "s":
          newArea.height = Math.max(minSize, prev.height + dy)
          break
        case "se":
          newArea.width = Math.max(minSize, prev.width + dx)
          newArea.height = Math.max(minSize, prev.height + dy)
          break
      }

      newArea.x = Math.min(newArea.x, imageDimensions.width - newArea.width)
      newArea.y = Math.min(newArea.y, imageDimensions.height - newArea.height)

      return newArea
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setResizingHandle(null)
  }

  const isInCropArea = (x: number, y: number) => {
    return x >= cropArea.x && x <= cropArea.x + cropArea.width && y >= cropArea.y && y <= cropArea.y + cropArea.height
  }

  const handleCrop = async () => {
    if (!selectedFile || !imageDimensions) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        const canvas = document.createElement("canvas")
        canvas.width = cropArea.width
        canvas.height = cropArea.height

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        ctx.drawImage(img, -cropArea.x, -cropArea.y)

        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `${selectedFile.name.split(".")[0]}_cropped.png`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
          }
        }, "image/png")
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(selectedFile)
  }

  return (
    <div className="space-y-6">
      <FileUpload onFileSelect={handleFileSelect} />

      {imageUrl && imageDimensions && (
        <div className="space-y-4">
          <Card className="border-border bg-card p-4">
            <div className="space-y-4">
              <p className="text-sm font-medium text-foreground">Arraste para mover, redimensione pelas bordas</p>

              <div
                ref={imageContainerRef}
                className="relative overflow-auto rounded-lg border border-border"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <img
                  src={imageUrl || "/placeholder.svg"}
                  alt="Crop preview"
                  className="block select-none"
                  style={{
                    width: imageDimensions.width,
                    height: imageDimensions.height,
                  }}
                />

                <div
                  className="absolute pointer-events-none"
                  style={{
                    top: 0,
                    left: 0,
                    width: cropArea.width,
                    height: cropArea.height,
                    backgroundImage: `
                      linear-gradient(to right, rgba(0,0,0,0.5) ${cropArea.x}px, transparent ${cropArea.x}px, transparent ${cropArea.x + cropArea.width}px, rgba(0,0,0,0.5) ${cropArea.x + cropArea.width}px),
                      linear-gradient(to bottom, rgba(0,0,0,0.5) ${cropArea.y}px, transparent ${cropArea.y}px, transparent ${cropArea.y + cropArea.height}px, rgba(0,0,0,0.5) ${cropArea.y + cropArea.height}px)
                    `,
                  }}
                />

                <div
                  className="absolute border-2 border-dashed border-cyan-400 cursor-move"
                  style={{
                    left: cropArea.x,
                    top: cropArea.y,
                    width: cropArea.width,
                    height: cropArea.height,
                    pointerEvents: "auto",
                  }}
                >
                  {[
                    { handle: "nw", cursor: "nw-resize", top: -6, left: -6 },
                    { handle: "n", cursor: "n-resize", top: -6, left: "50%", transform: "translateX(-50%)" },
                    { handle: "ne", cursor: "ne-resize", top: -6, right: -6 },
                    { handle: "w", cursor: "w-resize", top: "50%", left: -6, transform: "translateY(-50%)" },
                    { handle: "e", cursor: "e-resize", top: "50%", right: -6, transform: "translateY(-50%)" },
                    { handle: "sw", cursor: "sw-resize", bottom: -6, left: -6 },
                    { handle: "s", cursor: "s-resize", bottom: -6, left: "50%", transform: "translateX(-50%)" },
                    { handle: "se", cursor: "se-resize", bottom: -6, right: -6 },
                  ].map(({ handle, cursor, ...style }) => (
                    <div
                      key={handle}
                      onMouseDown={(e) => handleResizeMouseDown(e, handle as ResizeHandle)}
                      className="absolute w-3 h-3 bg-cyan-400 border border-white rounded-full"
                      style={
                        {
                          ...style,
                          cursor,
                          position: "absolute",
                          left: style.left || "auto",
                          right: style.right || "auto",
                          top: style.top || "auto",
                          bottom: style.bottom || "auto",
                          transform: style.transform,
                          pointerEvents: "auto",
                        } as React.CSSProperties
                      }
                    />
                  ))}
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Posição X</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">{Math.round(cropArea.x)}px</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Posição Y</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">{Math.round(cropArea.y)}px</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Largura</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">{Math.round(cropArea.width)}px</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Altura</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">{Math.round(cropArea.height)}px</p>
                </div>
              </div>
            </div>
          </Card>

          <Button onClick={handleCrop} className="w-full" size="lg">
            Baixar Imagem Cortada
          </Button>
        </div>
      )}
    </div>
  )
}
