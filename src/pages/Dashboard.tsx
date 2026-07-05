import { useAuth } from "@/lib/AuthContext";
import { SiteNav } from "@/components/nav/SiteNav";
import { SubscriptionsSection } from "@/components/dashboard/SubscriptionsSection";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-mist">
      <SiteNav authed userName={user?.name ?? user?.email} tier={user?.tier} avatarUrl={user?.avatarUrl} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <SubscriptionsSection />
      </main>
    </div>
  );
}
