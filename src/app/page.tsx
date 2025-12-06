import { Navigation } from "@/components/navigation"
import { HeroSection } from "@/components/hero-section"
import { HowItWorksWithDrawer } from "@/components/how-it-works-with-drawer"

import { AnalysisSection } from "@/components/analysis-section"
import { WhyAdaptiaSection } from "@/components/why-adaptia-section"
import { ComparisonSection } from "@/components/comparison-section"
import { TargetAudienceSection } from "@/components/target-audience-section"
import { SupportersSection } from "@/components/supporters-section"
import { FinalCtaSection } from "@/components/final-cta-section"
import { Footer } from "@/components/footer"
import { FinalCtaWithDrawer } from "@/components/final-cta-with-drawer"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation />
      <HeroSection />
      <HowItWorksWithDrawer />
      <AnalysisSection />
      <div className="bg-combo-blue-gray-light relative">
        <div className="absolute inset-0 bg-brand-pattern opacity-20"></div>
        <div className="relative z-10">
          <WhyAdaptiaSection />
        </div>
      </div>
      <div className="bg-combo-green-gray-light relative">
        <div className="absolute inset-0 bg-brand-pattern opacity-15"></div>
        <div className="relative z-10">
          <ComparisonSection />
        </div>
      </div>
      <div className="bg-combo-blue-gray-light relative">
        <div className="absolute inset-0 bg-brand-pattern opacity-20"></div>
        <div className="relative z-10">
          <TargetAudienceSection />
        </div>
      </div>
      <div className="bg-white relative">
        <div className="absolute inset-0 bg-brand-pattern opacity-10"></div>
        <div className="relative z-10">
          <SupportersSection />
        </div>
      </div>
      <FinalCtaWithDrawer />
      <Footer />
    </main>
  )
}
