"use client"

import { Toaster } from "sonner"

export function ToasterClient() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        style: {
          fontFamily: "Space Grotesk, sans-serif",
          borderRadius: "12px",
          fontSize: "15px",
          boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
        },
      }}
    />
  )
}
