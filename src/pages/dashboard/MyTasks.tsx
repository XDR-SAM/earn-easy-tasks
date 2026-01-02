import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Coins, Users, Calendar, Eye, Check, X, Loader2, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Task {
  id: string;
  title: string;
  description: string;
  payable_amount: number;
  required_workers: number;
  completion_date: string;
  created_at: string;
}

interface Submission {
  id: string;
  submission_details: string;
  status: string;
  created_at: string;
  worker: {
    full_name: string;
    email: string;
    user_id: string;
    coins: number;
  } | null;
}

const MyTasks = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  const fetchTasks = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('buyer_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTasks(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  const fetchSubmissions = async (taskId: string) => {
    setLoadingSubmissions(true);
    const { data, error } = await supabase
      .from('submissions')
      .select(`
        id,
        submission_details,
        status,
        created_at,
        worker:profiles!submissions_worker_id_profiles_fkey (
          full_name,
          email,
          user_id,
          coins
        )
      `)
      .eq('task_id', taskId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setSubmissions(data as unknown as Submission[]);
    }
    setLoadingSubmissions(false);
  };

  const handleApprove = async (submission: Submission, task: Task) => {
    if (!submission.worker) return;

    try {
      // Update submission status
      await supabase
        .from('submissions')
        .update({ status: 'approved' })
        .eq('id', submission.id);

      // Add coins to worker
      await supabase
        .from('profiles')
        .update({ coins: submission.worker.coins + task.payable_amount })
        .eq('user_id', submission.worker.user_id);

      // Create notification
      await supabase
        .from('notifications')
        .insert({
          user_id: submission.worker.user_id,
          message: `You earned ${task.payable_amount} coins from ${profile?.full_name} for completing "${task.title}"`,
          action_route: '/dashboard/submissions',
        });

      toast({
        title: "Submission approved!",
        description: `${task.payable_amount} coins sent to ${submission.worker.full_name}.`,
      });

      fetchSubmissions(task.id);
    } catch (error) {
      console.error('Error approving:', error);
      toast({
        title: "Error",
        description: "Failed to approve submission.",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (submission: Submission, task: Task) => {
    try {
      // Update submission status
      await supabase
        .from('submissions')
        .update({ status: 'rejected' })
        .eq('id', submission.id);

      // Increase required workers
      await supabase
        .from('tasks')
        .update({ required_workers: task.required_workers + 1 })
        .eq('id', task.id);

      toast({
        title: "Submission rejected",
        description: "Task is available for other workers.",
      });

      fetchSubmissions(task.id);
      fetchTasks();
    } catch (error) {
      console.error('Error rejecting:', error);
      toast({
        title: "Error",
        description: "Failed to reject submission.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      toast({
        title: "Task deleted",
        description: "The task has been removed.",
      });

      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "Failed to delete task.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold mb-2">My Tasks</h1>
          <p className="text-muted-foreground">Manage your posted tasks and review submissions.</p>
        </div>
        <Link to="/dashboard/add-task">
          <Button variant="gradient">
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </Link>
      </div>

      {tasks.length > 0 ? (
        <div className="space-y-4">
          {tasks.map((task) => (
            <Card key={task.id} className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg mb-2 truncate">{task.title}</h3>
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                      {task.description}
                    </p>
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-1 text-sm">
                        <Coins className="w-4 h-4 text-warning" />
                        {task.payable_amount} per worker
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Users className="w-4 h-4" />
                        {task.required_workers} spots left
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {new Date(task.completion_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedTask(task);
                            fetchSubmissions(task.id);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Submissions
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Submissions for "{selectedTask?.title}"</DialogTitle>
                        </DialogHeader>
                        {loadingSubmissions ? (
                          <div className="flex justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin" />
                          </div>
                        ) : submissions.length > 0 ? (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Worker</TableHead>
                                <TableHead>Submission</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {submissions.map((submission) => (
                                <TableRow key={submission.id}>
                                  <TableCell className="font-medium">
                                    {submission.worker?.full_name || 'N/A'}
                                  </TableCell>
                                  <TableCell className="max-w-[200px] truncate">
                                    {submission.submission_details}
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className={
                                      submission.status === 'approved' 
                                        ? 'bg-success/10 text-success border-success/20'
                                        : submission.status === 'rejected'
                                        ? 'bg-destructive/10 text-destructive border-destructive/20'
                                        : 'bg-warning/10 text-warning border-warning/20'
                                    }>
                                      {submission.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    {submission.status === 'pending' && selectedTask && (
                                      <div className="flex gap-2">
                                        <Button
                                          size="sm"
                                          variant="success"
                                          onClick={() => handleApprove(submission, selectedTask)}
                                        >
                                          <Check className="w-4 h-4" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="destructive"
                                          onClick={() => handleReject(submission, selectedTask)}
                                        >
                                          <X className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        ) : (
                          <p className="text-center py-8 text-muted-foreground">
                            No submissions yet.
                          </p>
                        )}
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="glass-card">
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground mb-4">You haven't created any tasks yet.</p>
            <Link to="/dashboard/add-task">
              <Button variant="gradient">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Task
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MyTasks;
