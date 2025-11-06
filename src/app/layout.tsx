import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { MessageCircle } from "lucide-react"  // 👉 icono (puedes usar el logo oficial también)
import { Toaster as SonnerToaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  title: "Adaptia - Sostenibilidad sin fricción",
  description:
    "Recibe un análisis de doble materialidad ESG y estrategia de sostenibilidad para tu empresa en 24 horas.",
  generator: "v0.app",
  icons: {
    icon: "/favicon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Toaster />
        {children}
                <SonnerToaster />
        <a
          href="https://wa.me/56935027636" 
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-colors duration-300"
        >
          <MessageCircle className="h-6 w-6" />
        </a>
        
      </body>
    </html>
  )
}
