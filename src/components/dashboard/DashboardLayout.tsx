import { ReactNode } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";

interface DashboardLayoutProps {
  children: ReactNode;
}

// Mock user data - will be replaced with actual auth
const mockUser = {
  name: "John Doe",
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
  role: "worker" as const,
  coins: 2450,
};

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/30">
        <DashboardSidebar
          userRole={mockUser.role}
          userName={mockUser.name}
          userAvatar={mockUser.avatar}
          userCoins={mockUser.coins}
        />
        <SidebarInset className="flex-1">
          <DashboardHeader
            userName={mockUser.name}
            userAvatar={mockUser.avatar}
            userCoins={mockUser.coins}
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
