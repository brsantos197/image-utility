import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface DashboardCardProps {
  tool: {
    id: string
    title: string
    description: string
    icon: string
    href: string
  }
}

export function DashboardCard({ tool }: DashboardCardProps) {
  return (
    <Link href={tool.href}>
      <Card className="group h-full cursor-pointer border-border transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/10">
        <div className="flex h-full flex-col gap-4 p-6">
          <div className="flex items-start justify-between">
            <div className="text-4xl">{tool.icon}</div>
            <div className="rounded-lg bg-primary/10 p-2 opacity-0 transition-opacity group-hover:opacity-100">
              <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-foreground group-hover:text-primary">{tool.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{tool.description}</p>
          </div>

          <Button variant="outline" className="w-full bg-transparent">
            Acessar
          </Button>
        </div>
      </Card>
    </Link>
  )
}
