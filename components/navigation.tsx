"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "./theme-toggle"

export function Navigation() {
  const pathname = usePathname()

  const links = [
    { href: "/", label: "Início" },
    { href: "/compress", label: "Compressor" },
    { href: "/resize", label: "Redimensionar" },
    { href: "/crop", label: "Cortar" },
    { href: "/qrcode", label: "QR Code" },
    { href: "/convert", label: "Converter" },
    { href: "/pdf", label: "PDF" },
    { href: "/favicon", label: "Favicon" }, // Added favicon converter link
  ]

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 via-blue-500 to-sky-500">
            <span className="text-lg font-bold text-white">🖼️</span>
          </div>
          <span className="hidden font-bold sm:inline">ImageTools</span>
        </Link>

        <div className="hidden gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === link.href
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="md:hidden">
            <button className="rounded-md p-2 hover:bg-muted">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
