declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
}

export type GAParams = Record<string, string | number | boolean | null | undefined>

export function trackEvent(eventName: string, params: GAParams = {}) {
  if (typeof window === "undefined") return
  if (typeof window.gtag !== "function") return

  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null)
  )

  window.gtag("event", eventName, cleanParams)
}

export function setUserProperties(props: Record<string, string | number | boolean>) {
  if (typeof window === "undefined") return
  if (typeof window.gtag !== "function") return

  window.gtag("set", "user_properties", props)
}

export function getGaClientId(gaId: string): Promise<string | null> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(null)
    if (typeof window.gtag !== "function") return resolve(null)

    window.gtag("get", gaId, "client_id", (clientId: string) => {
      resolve(clientId || null)
    })
  })
}