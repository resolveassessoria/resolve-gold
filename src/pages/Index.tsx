import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { RewardsSection } from "@/components/landing/RewardsSection";
import { RoadmapSection } from "@/components/landing/RoadmapSection";
import { MarketplaceSection } from "@/components/landing/MarketplaceSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { FaqSection } from "@/components/landing/FaqSection";
import { PreRegistrationSection } from "@/components/landing/PreRegistrationSection";
import { NewsletterSection } from "@/components/landing/NewsletterSection";
import { FranchiseSection } from "@/components/landing/FranchiseSection";
import { Footer } from "@/components/landing/Footer";
import { WhatsAppButton } from "@/components/landing/WhatsAppButton";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <HowItWorksSection />
      <PricingSection />
      <RewardsSection />
      <FranchiseSection />
      <RoadmapSection />
      <MarketplaceSection />
      <TestimonialsSection />
      <FaqSection />
      <PreRegistrationSection />
      <NewsletterSection />
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Index;
