import { Routes, Route } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import WorkerHome from "./dashboard/WorkerHome";
import TaskList from "./dashboard/TaskList";

// Placeholder components for other routes
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <h2 className="font-display text-2xl font-bold mb-2">{title}</h2>
      <p className="text-muted-foreground">This page is coming soon.</p>
    </div>
  </div>
);

const Dashboard = () => {
  return (
    <DashboardLayout>
      <Routes>
        <Route index element={<WorkerHome />} />
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
        <Route path="notifications" element={<PlaceholderPage title="Notifications" />} />
        <Route path="profile" element={<PlaceholderPage title="Profile" />} />
        <Route path="settings" element={<PlaceholderPage title="Settings" />} />
      </Routes>
    </DashboardLayout>
  );
};

export default Dashboard;
