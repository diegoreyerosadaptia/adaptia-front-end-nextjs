import Link from "next/link"
import { BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"

const GA_ANALYTICS_URL =
  "https://analytics.google.com/analytics/web/#/a384550060p524633962/reports/explorer?params=_u..nav%3Dmaui%26_r.explorerCard..startRow%3D0%26_r.explorerCard..rowsPerPage%3D50&ruid=top-events,business-objectives,examine-user-behavior&collectionId=business-objectives&r=top-events"

export function AnalyticsButton() {
  return (
    <Button
      asChild
      variant="outline"
      size="lg"
      className="
        border-[#163F6A]/30
        text-[#163F6A]
        hover:bg-[#163F6A]
        hover:text-white
        hover:border-[#163F6A]
        bg-white/50
        backdrop-blur-sm
        rounded-lg px-6 py-2.5 flex gap-2 items-center
        transition-all duration-200
        shadow-sm hover:shadow-md
      "
    >
      <Link
        href={GA_ANALYTICS_URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        <BarChart3 className="h-4 w-4" />
        <span className="hidden sm:inline">Ver Analytics</span>
      </Link>
    </Button>
  )
}