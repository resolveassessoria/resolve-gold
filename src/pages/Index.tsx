import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { TrustSection } from "@/components/landing/TrustSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { InvestorSection } from "@/components/landing/InvestorSection";
import { RewardsSection } from "@/components/landing/RewardsSection";
import { RoadmapSection } from "@/components/landing/RoadmapSection";
import { MarketplaceSection } from "@/components/landing/MarketplaceSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { FaqSection } from "@/components/landing/FaqSection";
import { PreRegistrationSection } from "@/components/landing/PreRegistrationSection";
import { FranchiseSection } from "@/components/landing/FranchiseSection";
import { Footer } from "@/components/landing/Footer";
import { WhatsAppButton } from "@/components/landing/WhatsAppButton";
import { PageEntrance, GoldParticles } from "@/components/landing/AnimationUtils";

const Index = () => {
  return (
    <PageEntrance>
      <div className="min-h-screen bg-background relative">
        {/* Ambient background effects */}
        <div className="fixed inset-0 bg-ambient-glow pointer-events-none z-0" />
        <GoldParticles />

        <div className="relative z-10">
          <Navbar />
          <HeroSection />
          <TrustSection />
          <HowItWorksSection />
          <PricingSection />
          <InvestorSection />
          <RewardsSection />
          <FranchiseSection />
          <RoadmapSection />
          <MarketplaceSection />
          <TestimonialsSection />
          <FaqSection />
          <PreRegistrationSection />
          <Footer />
        </div>
        <WhatsAppButton />
      </div>
    </PageEntrance>
  );
};

export default Index;
