import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { AboutSection } from "@/components/sections/AboutSection";
import { CategoriesSection } from "@/components/sections/CategoriesSection";
import { HeroSection } from "@/components/sections/HeroSection";
import { MemoriesSection } from "@/components/sections/MemoriesSection";

export default function HomePage() {
  return (
    <div className="site-shell">
      <SiteHeader />

      <main>
        <HeroSection />
        <CategoriesSection />
        <MemoriesSection />
        <AboutSection />
      </main>

      <SiteFooter />
    </div>
  );
}