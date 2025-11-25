// lib/analysis-socket.ts
"use client"

import { io, Socket } from "socket.io-client"

let socket: Socket | null = null

export function getAnalysisSocket() {
  if (!socket) {
    socket = io(
      `${process.env.NEXT_PUBLIC_API_URL}/analysis-status`, // ej: https://api.adaptianow.com/analysis-status
      {
        withCredentials: true,
      }
    )
  }
  return socket
}
