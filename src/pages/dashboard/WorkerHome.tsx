import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileCheck, Clock, Coins, TrendingUp, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

// Mock data
const stats = {
  totalSubmissions: 156,
  pendingSubmissions: 12,
  totalEarnings: 2450,
};

const approvedSubmissions = [
  {
    id: 1,
    taskTitle: "Watch YouTube video and comment",
    payableAmount: 15,
    buyerName: "Marketing Pro",
    status: "approved",
  },
  {
    id: 2,
    taskTitle: "Complete survey about shopping habits",
    payableAmount: 25,
    buyerName: "Research Inc",
    status: "approved",
  },
  {
    id: 3,
    taskTitle: "Share post on social media",
    payableAmount: 10,
    buyerName: "Brand Boost",
    status: "approved",
  },
  {
    id: 4,
    taskTitle: "Write a product review",
    payableAmount: 50,
    buyerName: "TechReview",
    status: "approved",
  },
];

const WorkerHome = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold mb-2">Welcome back, John! 👋</h1>
        <p className="text-muted-foreground">Here's an overview of your earning activity.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card hover-lift">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Submissions
            </CardTitle>
            <FileCheck className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalSubmissions}</p>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-success">+12%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card hover-lift">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Submissions
            </CardTitle>
            <Clock className="w-5 h-5 text-warning" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.pendingSubmissions}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting buyer review
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card hover-lift bg-gradient-to-br from-primary/10 to-accent/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Earnings
            </CardTitle>
            <TrendingUp className="w-5 h-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Coins className="w-6 h-6 text-warning" />
              <p className="text-3xl font-bold">{stats.totalEarnings.toLocaleString()}</p>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ≈ ${(stats.totalEarnings / 20).toFixed(2)} USD
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Approved Submissions */}
      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Approved Submissions</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Your recently approved work</p>
          </div>
          <Link to="/dashboard/submissions">
            <Button variant="ghost" size="sm">
              View All <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task Title</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {approvedSubmissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell className="font-medium">{submission.taskTitle}</TableCell>
                  <TableCell>{submission.buyerName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Coins className="w-4 h-4 text-warning" />
                      {submission.payableAmount}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                      Approved
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="glass-card p-6">
          <h3 className="font-semibold mb-2">Ready to earn more?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Browse available tasks and start completing them to earn coins.
          </p>
          <Link to="/dashboard/tasks">
            <Button variant="gradient">
              Browse Tasks <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </Card>

        <Card className="glass-card p-6">
          <h3 className="font-semibold mb-2">Withdraw your earnings</h3>
          <p className="text-sm text-muted-foreground mb-4">
            You have {stats.totalEarnings} coins available for withdrawal.
          </p>
          <Link to="/dashboard/withdrawals">
            <Button variant="outline">
              Withdraw <Coins className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
};

export default WorkerHome;
