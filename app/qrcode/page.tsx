"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { QrCodeForm } from "@/components/qr-code-form"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function QrCodePage() {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")

  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-slate-50 dark:to-slate-900">
      <Navigation />

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground">
            Gerador de{" "}
            <span className="bg-gradient-to-r from-cyan-500 via-blue-500 to-sky-500 bg-clip-text text-transparent">
              QR Code
            </span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            Crie códigos QR profissionais a partir de URLs, textos ou imagens.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="mb-6 text-lg font-semibold text-foreground">Configurações</h2>
            <QrCodeForm onQrGenerated={setQrCodeUrl} />
          </div>

          {qrCodeUrl && (
            <div className="space-y-4">
              <h2 className="mb-6 text-lg font-semibold text-foreground">Preview</h2>
              <Card className="border-border bg-card p-6 flex items-center justify-center min-h-96">
                <img src={qrCodeUrl || "/placeholder.svg"} alt="QR Code" className="h-64 w-64" />
              </Card>
              <Button
                onClick={() => {
                  const a = document.createElement("a")
                  a.href = qrCodeUrl
                  a.download = "qrcode.png"
                  document.body.appendChild(a)
                  a.click()
                  document.body.removeChild(a)
                }}
                size="lg"
                className="w-full"
              >
                Baixar QR Code
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
