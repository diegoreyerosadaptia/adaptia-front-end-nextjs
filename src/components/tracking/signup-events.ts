import { trackEvent } from "@/lib/ga"

export function trackSignupComplete(signupType: "manual" | "claim_register" = "manual") {
  trackEvent("signup_complete", {
    page_type: "register",
    signup_type: signupType,
  })
}