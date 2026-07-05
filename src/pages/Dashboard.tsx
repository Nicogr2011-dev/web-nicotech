import { useAuth } from "@/lib/AuthContext";
import { SiteNav } from "@/components/nav/SiteNav";
import { SubscriptionsSection } from "@/components/dashboard/SubscriptionsSection";
import { AdSlot } from "@/components/ads/AdSlot";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-mist">
      <SiteNav authed userName={user?.name ?? user?.email} tier={user?.tier} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <SubscriptionsSection />
      </main>
      <footer className="px-4 pb-8 sm:px-6">
        <AdSlot tier={user?.tier} />
      </footer>
    </div>
  );
}
