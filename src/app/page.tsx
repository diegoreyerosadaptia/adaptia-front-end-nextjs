import { Navigation } from "@/components/navigation"
import { HowItWorksWithDrawer } from "@/components/how-it-works-with-drawer"
import { AnalysisSection } from "@/components/analysis-section"
import { WhyAdaptiaSection } from "@/components/why-adaptia-section"
import { ComparisonSection } from "@/components/comparison-section"
import { TargetAudienceSection } from "@/components/target-audience-section"
import { SupportersSection } from "@/components/supporters-section"
import { Footer } from "@/components/footer"
import { FinalCtaWithDrawer } from "@/components/final-cta-with-drawer"
import { HeroSectionDrawer } from "@/components/hero-section-with-drawer"
import { ScrollToTop } from "@/components/scroll-to-top"
import { VideoSection } from "@/components/videos-sections"
import { PricingByEmployeesSection } from "@/components/price-card-section"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation />

      <HeroSectionDrawer />

      <div className="bg-combo-blue-gray-light relative">
        {/* ✅ NO bloquear scroll/click */}
        <div className="absolute inset-0 bg-brand-pattern opacity-20 pointer-events-none" />
        <div className="relative z-10">
          <VideoSection />
        </div>
      </div>

      <HowItWorksWithDrawer />

      <AnalysisSection />

      <div className="bg-combo-blue-gray-light relative">
        {/* ✅ NO bloquear scroll/click */}
        <div className="absolute inset-0 bg-brand-pattern opacity-20 pointer-events-none" />
        <div className="relative z-10">
          <WhyAdaptiaSection />
        </div>
      </div>

      <div className="bg-combo-green-gray-light relative">
        {/* ✅ NO bloquear scroll/click */}
        <div className="absolute inset-0 bg-brand-pattern opacity-15 pointer-events-none" />
        <div className="relative z-10">
          <ComparisonSection />
        </div>
      </div>

      <div className="bg-combo-blue-gray-light relative">
        {/* ✅ NO bloquear scroll/click */}
        <div className="absolute inset-0 bg-brand-pattern opacity-20 pointer-events-none" />
        <div className="relative z-10">
          <TargetAudienceSection />
        </div>
      </div>
      
      <div className="bg-combo-green-gray-light relative">
        {/* ✅ NO bloquear scroll/click */}
        <div className="absolute inset-0 bg-brand-pattern opacity-15 pointer-events-none" />
        <div className="relative z-10">
          <PricingByEmployeesSection />
        </div>
      </div>

      <div className="bg-white relative">
        {/* ✅ NO bloquear scroll/click */}
        <div className="absolute inset-0 bg-brand-pattern opacity-10 pointer-events-none" />
        <div className="relative z-10">
          <SupportersSection />
        </div>
      </div>

      <FinalCtaWithDrawer />

      <Footer />

      <ScrollToTop />
    </main>
  )
}