import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileCheck, Clock, Coins, TrendingUp, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface Submission {
  id: string;
  submission_details: string;
  status: string;
  created_at: string;
  task: {
    title: string;
    payable_amount: number;
    buyer: {
      full_name: string;
    } | null;
  } | null;
}

const WorkerHome = () => {
  const { profile, user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    pendingSubmissions: 0,
    totalEarnings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      // Fetch submissions with task details
      const { data: submissionsData, error } = await supabase
        .from('submissions')
        .select(`
          id,
          submission_details,
          status,
          created_at,
          task:tasks (
            title,
            payable_amount,
            buyer:profiles!tasks_buyer_id_fkey (
              full_name
            )
          )
        `)
        .eq('worker_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!error && submissionsData) {
        setSubmissions(submissionsData as unknown as Submission[]);
        
        // Calculate stats
        const total = submissionsData.length;
        const pending = submissionsData.filter(s => s.status === 'pending').length;
        const earnings = submissionsData
          .filter(s => s.status === 'approved')
          .reduce((sum, s) => sum + ((s.task as any)?.payable_amount || 0), 0);

        setStats({
          totalSubmissions: total,
          pendingSubmissions: pending,
          totalEarnings: profile?.coins || earnings,
        });
      }
      setLoading(false);
    };

    fetchData();
  }, [user, profile]);

  const approvedSubmissions = submissions.filter(s => s.status === 'approved');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold mb-2">Welcome back, {profile?.full_name?.split(' ')[0]}! 👋</h1>
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
              All time submissions
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
              Available Coins
            </CardTitle>
            <TrendingUp className="w-5 h-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Coins className="w-6 h-6 text-warning" />
              <p className="text-3xl font-bold">{profile?.coins?.toLocaleString() || 0}</p>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ≈ ${((profile?.coins || 0) / 20).toFixed(2)} USD
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
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : approvedSubmissions.length > 0 ? (
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
                {approvedSubmissions.slice(0, 5).map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell className="font-medium">{submission.task?.title || 'N/A'}</TableCell>
                    <TableCell>{submission.task?.buyer?.full_name || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Coins className="w-4 h-4 text-warning" />
                        {submission.task?.payable_amount || 0}
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
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No approved submissions yet. Start completing tasks!
            </div>
          )}
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
            You have {profile?.coins || 0} coins available for withdrawal.
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
