import type React from "react"
import type { Metadata } from "next"
import Script from "next/script"
import { Montserrat } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { MessageCircle } from "lucide-react"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import { GaPageView } from "@/components/ga-page-view"

// 👉 Fuente global Montserrat
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-montserrat",
})

export const metadata: Metadata = {
  title: "Adaptia - Sostenibilidad sin fricción",
  description:
    "Recibe un análisis de doble materialidad ESG y ruta de sostenibilidad para tu empresa en 24 horas.",
  icons: {
    icon: "/favicon.png",
  },
}

const GA_ID = process.env.NEXT_PUBLIC_GA_ID

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${montserrat.variable} font-sans`}>
        {/* ✅ Google Analytics (GA4) */}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', {
                  send_page_view: true
                });
              `}
            </Script>
          </>
        )}
        <GaPageView />
        <Toaster />
        {children}
        <SonnerToaster />

        <a
          href="https://wa.me/56935027636"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-colors duration-300"
        >
          <MessageCircle className="h-6 w-6" />
        </a>
      </body>
    </html>
  )
}
