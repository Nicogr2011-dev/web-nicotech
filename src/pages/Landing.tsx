import { Link } from "react-router-dom";
import { SiteNav } from "@/components/nav/SiteNav";
import { Hero } from "@/components/landing/Hero";
import { FeatureSwatches } from "@/components/landing/FeatureSwatches";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { CtaSection } from "@/components/landing/CtaSection";
import { Changelog } from "@/components/landing/Changelog";

export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteNav />
      <main className="flex-1">
        <Hero />
        <FeatureSwatches />
        <HowItWorks />
        <CtaSection />
        <Changelog />
      </main>
      <footer className="border-t border-black/5 bg-white px-4 py-8 text-center text-sm text-slate sm:px-6">
        <p>
          © {new Date().getFullYear()} Nicotech ·{" "}
          <Link to="/login" className="font-medium text-azure">
            Iniciar sesión
          </Link>
        </p>
      </footer>
    </div>
  );
}
