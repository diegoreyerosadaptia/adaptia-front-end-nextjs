import type React from "react"
import type { Metadata } from "next"
import { Montserrat } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { MessageCircle } from "lucide-react"
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

// 👉 Fuente global Montserrat
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "Adaptia - Sostenibilidad sin fricción",
  description:
    "Recibe un análisis de doble materialidad ESG y estrategia de sostenibilidad para tu empresa en 24 horas.",
  icons: {
    icon: "/favicon.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${montserrat.variable} font-sans`}>
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
