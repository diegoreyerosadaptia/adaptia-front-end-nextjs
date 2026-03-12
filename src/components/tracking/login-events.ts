import { trackEvent } from "@/lib/ga"

export function trackLoginSuccess(loginType: "manual" | "auto_confirm" | "auto_recovery") {
  trackEvent("login_success", {
    page_type: "login",
    login_type: loginType,
  })
}