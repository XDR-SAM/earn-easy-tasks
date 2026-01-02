import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  ListTodo,
  FileCheck,
  Wallet,
  Plus,
  ClipboardList,
  CreditCard,
  History,
  Users,
  Bell,
  Coins,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

type UserRole = "worker" | "buyer" | "admin";

interface DashboardSidebarProps {
  userRole: UserRole;
  userName: string;
  userAvatar: string;
  userCoins: number;
}

const menuItems = {
  worker: [
    { title: "Home", url: "/dashboard", icon: Home },
    { title: "Task List", url: "/dashboard/tasks", icon: ListTodo },
    { title: "My Submissions", url: "/dashboard/submissions", icon: FileCheck },
    { title: "Withdrawals", url: "/dashboard/withdrawals", icon: Wallet },
  ],
  buyer: [
    { title: "Home", url: "/dashboard", icon: Home },
    { title: "Add New Task", url: "/dashboard/add-task", icon: Plus },
    { title: "My Tasks", url: "/dashboard/my-tasks", icon: ClipboardList },
    { title: "Purchase Coins", url: "/dashboard/purchase", icon: CreditCard },
    { title: "Payment History", url: "/dashboard/payments", icon: History },
  ],
  admin: [
    { title: "Home", url: "/dashboard", icon: Home },
    { title: "Manage Users", url: "/dashboard/users", icon: Users },
    { title: "Manage Tasks", url: "/dashboard/manage-tasks", icon: ClipboardList },
    { title: "Withdrawals", url: "/dashboard/admin-withdrawals", icon: Wallet },
  ],
};

const roleColors = {
  worker: "role-worker",
  buyer: "role-buyer",
  admin: "role-admin",
};

const DashboardSidebar = ({ userRole, userName, userAvatar, userCoins }: DashboardSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-md">
            <Coins className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg">
            Micro<span className="gradient-text">Tasks</span>
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {/* User Info */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-primary/20">
              <AvatarImage src={userAvatar} alt={userName} />
              <AvatarFallback>{userName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{userName}</p>
              <Badge variant="outline" className={cn("text-xs capitalize", roleColors[userRole])}>
                {userRole}
              </Badge>
            </div>
          </div>
          <div className="mt-3 coin-badge w-full justify-center">
            <Coins className="w-4 h-4" />
            <span>{userCoins.toLocaleString()} Coins</span>
          </div>
        </div>

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems[userRole].map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                  >
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Notifications */}
        <SidebarGroup>
          <SidebarGroupLabel>Notifications</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/dashboard/notifications" className="flex items-center gap-3">
                    <Bell className="w-4 h-4" />
                    <span>Notifications</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} className="flex items-center gap-3 text-destructive hover:text-destructive cursor-pointer">
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default DashboardSidebar;
