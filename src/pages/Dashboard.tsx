import { Routes, Route } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import WorkerHome from "./dashboard/WorkerHome";
import BuyerHome from "./dashboard/BuyerHome";
import AdminHome from "./dashboard/AdminHome";
import TaskList from "./dashboard/TaskList";
import { useAuth } from "@/hooks/useAuth";

// Placeholder components for other routes
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <h2 className="font-display text-2xl font-bold mb-2">{title}</h2>
      <p className="text-muted-foreground">This page is coming soon.</p>
    </div>
  </div>
);

// Dynamic home component based on role
const DashboardHome = () => {
  const { role } = useAuth();

  if (role === 'admin') {
    return <AdminHome />;
  } else if (role === 'buyer') {
    return <BuyerHome />;
  }
  return <WorkerHome />;
};

const Dashboard = () => {
  return (
    <DashboardLayout>
      <Routes>
        <Route index element={<DashboardHome />} />
        <Route path="tasks" element={<TaskList />} />
        <Route path="tasks/:id" element={<PlaceholderPage title="Task Details" />} />
        <Route path="submissions" element={<PlaceholderPage title="My Submissions" />} />
        <Route path="withdrawals" element={<PlaceholderPage title="Withdrawals" />} />
        <Route path="add-task" element={<PlaceholderPage title="Add New Task" />} />
        <Route path="my-tasks" element={<PlaceholderPage title="My Tasks" />} />
        <Route path="purchase" element={<PlaceholderPage title="Purchase Coins" />} />
        <Route path="payments" element={<PlaceholderPage title="Payment History" />} />
        <Route path="users" element={<PlaceholderPage title="Manage Users" />} />
        <Route path="manage-tasks" element={<PlaceholderPage title="Manage Tasks" />} />
        <Route path="admin-withdrawals" element={<PlaceholderPage title="Withdrawal Requests" />} />
        <Route path="notifications" element={<PlaceholderPage title="Notifications" />} />
        <Route path="profile" element={<PlaceholderPage title="Profile" />} />
        <Route path="settings" element={<PlaceholderPage title="Settings" />} />
      </Routes>
    </DashboardLayout>
  );
};

export default Dashboard;
