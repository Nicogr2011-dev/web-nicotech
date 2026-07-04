import { SiteNav } from "@/components/nav/SiteNav";
import { Hero } from "@/components/landing/Hero";
import { FeatureSwatches } from "@/components/landing/FeatureSwatches";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { CtaSection } from "@/components/landing/CtaSection";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteNav />
      <main className="flex-1">
        <Hero />
        <FeatureSwatches />
        <HowItWorks />
        <CtaSection />
      </main>
      <footer className="border-t border-black/5 bg-white px-4 py-8 text-center text-sm text-slate sm:px-6">
        <p>
          © {new Date().getFullYear()} Nicotech ·{" "}
          <a href="/login" className="font-medium text-azure">
            Iniciar sesión
          </a>
        </p>
      </footer>
    </div>
  );
}
