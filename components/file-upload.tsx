"use client"

import type React from "react"

import { useState, useRef } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface FileUploadProps {
  onFileSelect: (file: File) => void
  accept?: string
  label?: string
  multiple?: boolean
}

export function FileUpload({
  onFileSelect,
  accept = "image/*",
  label = "Upload Imagem",
  multiple = false,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      if (multiple) {
        files.forEach((file) => onFileSelect(file))
      } else {
        onFileSelect(files[0])
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.currentTarget.files || [])
    if (files.length > 0) {
      if (multiple) {
        files.forEach((file) => onFileSelect(file))
      } else {
        onFileSelect(files[0])
      }
    }
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "rounded-lg border-2 border-dashed border-border p-8 text-center transition-colors",
        isDragging && "border-primary bg-primary/5",
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        className="hidden"
      />

      <svg className="mx-auto h-12 w-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33A3 3 0 0116.5 19.5H6.75z"
        />
      </svg>

      <p className="mt-4 text-sm font-medium text-foreground">Arraste sua imagem aqui ou</p>

      <Button type="button" variant="default" size="sm" className="mt-3" onClick={() => inputRef.current?.click()}>
        {label}
      </Button>

      <p className="mt-2 text-xs text-muted-foreground">PNG, JPG, WebP até 50MB</p>
    </div>
  )
}
