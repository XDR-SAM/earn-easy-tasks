import { Routes, Route } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import WorkerHome from "./dashboard/WorkerHome";
import BuyerHome from "./dashboard/BuyerHome";
import AdminHome from "./dashboard/AdminHome";
import TaskList from "./dashboard/TaskList";
import TaskDetails from "./dashboard/TaskDetails";
import MySubmissions from "./dashboard/MySubmissions";
import Withdrawals from "./dashboard/Withdrawals";
import AddTask from "./dashboard/AddTask";
import MyTasks from "./dashboard/MyTasks";
import PurchaseCoins from "./dashboard/PurchaseCoins";
import PaymentHistory from "./dashboard/PaymentHistory";
import ManageUsers from "./dashboard/ManageUsers";
import ManageTasks from "./dashboard/ManageTasks";
import AdminWithdrawals from "./dashboard/AdminWithdrawals";
import Notifications from "./dashboard/Notifications";
import { useAuth } from "@/hooks/useAuth";

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
        <Route path="tasks/:id" element={<TaskDetails />} />
        <Route path="submissions" element={<MySubmissions />} />
        <Route path="withdrawals" element={<Withdrawals />} />
        <Route path="add-task" element={<AddTask />} />
        <Route path="my-tasks" element={<MyTasks />} />
        <Route path="purchase" element={<PurchaseCoins />} />
        <Route path="payments" element={<PaymentHistory />} />
        <Route path="users" element={<ManageUsers />} />
        <Route path="manage-tasks" element={<ManageTasks />} />
        <Route path="admin-withdrawals" element={<AdminWithdrawals />} />
        <Route path="notifications" element={<Notifications />} />
      </Routes>
    </DashboardLayout>
  );
};

export default Dashboard;
