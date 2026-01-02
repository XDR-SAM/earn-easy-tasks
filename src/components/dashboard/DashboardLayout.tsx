import { ReactNode } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";
import { useAuth } from "@/hooks/useAuth";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { profile, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-lg">Loading dashboard...</div>
      </div>
    );
  }

  const userName = profile?.full_name || "User";
  const userAvatar = profile?.avatar_url || "";
  const userCoins = profile?.coins || 0;
  const userRole = role || "worker";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/30">
        <DashboardSidebar
          userRole={userRole}
          userName={userName}
          userAvatar={userAvatar}
          userCoins={userCoins}
        />
        <SidebarInset className="flex-1">
          <DashboardHeader
            userName={userName}
            userAvatar={userAvatar}
            userCoins={userCoins}
          />
          <main className="p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
