import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ClipboardList, Clock, Coins, CreditCard, ArrowRight, Eye, Check, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Submission {
  id: string;
  submission_details: string;
  status: string;
  created_at: string;
  worker: {
    full_name: string;
    email: string;
  } | null;
  task: {
    id: string;
    title: string;
    payable_amount: number;
    required_workers: number;
  } | null;
}

const BuyerHome = () => {
  const { profile, user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [pendingSubmissions, setPendingSubmissions] = useState<Submission[]>([]);
  const [stats, setStats] = useState({
    totalTasks: 0,
    pendingTasks: 0,
    totalPayments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  const fetchData = async () => {
    if (!user) return;

    // Fetch buyer's tasks
    const { data: tasks } = await supabase
      .from('tasks')
      .select('id, required_workers, payable_amount')
      .eq('buyer_id', user.id);

    // Fetch pending submissions for buyer's tasks
    const { data: submissions } = await supabase
      .from('submissions')
      .select(`
        id,
        submission_details,
        status,
        created_at,
        worker:profiles!submissions_worker_id_fkey (
          full_name,
          email
        ),
        task:tasks (
          id,
          title,
          payable_amount,
          required_workers
        )
      `)
      .eq('status', 'pending')
      .in('task_id', tasks?.map(t => t.id) || []);

    if (tasks) {
      const totalPending = tasks.reduce((sum, t) => sum + t.required_workers, 0);
      setStats({
        totalTasks: tasks.length,
        pendingTasks: totalPending,
        totalPayments: 0,
      });
    }

    if (submissions) {
      setPendingSubmissions(submissions as unknown as Submission[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleApprove = async (submission: Submission) => {
    if (!submission.task) return;

    try {
      // Update submission status
      const { error: submissionError } = await supabase
        .from('submissions')
        .update({ status: 'approved' })
        .eq('id', submission.id);

      if (submissionError) throw submissionError;

      // Add coins to worker
      const { data: workerProfile } = await supabase
        .from('profiles')
        .select('coins, user_id')
        .eq('full_name', submission.worker?.full_name)
        .maybeSingle();

      if (workerProfile) {
        await supabase
          .from('profiles')
          .update({ coins: workerProfile.coins + submission.task.payable_amount })
          .eq('user_id', workerProfile.user_id);

        // Create notification for worker
        await supabase
          .from('notifications')
          .insert({
            user_id: workerProfile.user_id,
            message: `You earned ${submission.task.payable_amount} coins from ${profile?.full_name} for completing "${submission.task.title}"`,
            action_route: '/dashboard/submissions',
          });
      }

      toast({
        title: "Submission approved!",
        description: `${submission.task.payable_amount} coins sent to worker.`,
      });

      fetchData();
    } catch (error) {
      console.error('Error approving submission:', error);
      toast({
        title: "Error",
        description: "Failed to approve submission.",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (submission: Submission) => {
    if (!submission.task) return;

    try {
      // Update submission status
      const { error: submissionError } = await supabase
        .from('submissions')
        .update({ status: 'rejected' })
        .eq('id', submission.id);

      if (submissionError) throw submissionError;

      // Increase required workers by 1
      await supabase
        .from('tasks')
        .update({ required_workers: submission.task.required_workers + 1 })
        .eq('id', submission.task.id);

      toast({
        title: "Submission rejected",
        description: "The task is available for other workers.",
      });

      fetchData();
    } catch (error) {
      console.error('Error rejecting submission:', error);
      toast({
        title: "Error",
        description: "Failed to reject submission.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold mb-2">Welcome, {profile?.full_name?.split(' ')[0]}! 👋</h1>
        <p className="text-muted-foreground">Manage your tasks and review submissions.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card hover-lift">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Tasks
            </CardTitle>
            <ClipboardList className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalTasks}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Tasks created by you
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card hover-lift">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Workers
            </CardTitle>
            <Clock className="w-5 h-5 text-warning" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.pendingTasks}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Workers needed across tasks
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card hover-lift bg-gradient-to-br from-primary/10 to-accent/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Available Coins
            </CardTitle>
            <Coins className="w-5 h-5 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Coins className="w-6 h-6 text-warning" />
              <p className="text-3xl font-bold">{profile?.coins?.toLocaleString() || 0}</p>
            </div>
            <Link to="/dashboard/purchase" className="text-xs text-primary hover:underline mt-1 inline-block">
              Purchase more coins →
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Pending Submissions */}
      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Submissions to Review</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Pending worker submissions</p>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : pendingSubmissions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Worker</TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingSubmissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell className="font-medium">{submission.worker?.full_name || 'N/A'}</TableCell>
                    <TableCell>{submission.task?.title || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Coins className="w-4 h-4 text-warning" />
                        {submission.task?.payable_amount || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedSubmission(submission)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Submission Details</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Task</p>
                                <p>{selectedSubmission?.task?.title}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Worker</p>
                                <p>{selectedSubmission?.worker?.full_name}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Submission</p>
                                <p className="whitespace-pre-wrap bg-muted p-3 rounded-lg">
                                  {selectedSubmission?.submission_details}
                                </p>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button 
                          variant="success" 
                          size="sm"
                          onClick={() => handleApprove(submission)}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleReject(submission)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No pending submissions to review.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="glass-card p-6">
          <h3 className="font-semibold mb-2">Create a new task</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Post a task and get it done by our workers.
          </p>
          <Link to="/dashboard/add-task">
            <Button variant="gradient">
              Add Task <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </Card>

        <Card className="glass-card p-6">
          <h3 className="font-semibold mb-2">Need more coins?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Purchase coins to create more tasks.
          </p>
          <Link to="/dashboard/purchase">
            <Button variant="outline">
              Purchase Coins <CreditCard className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
};

export default BuyerHome;
