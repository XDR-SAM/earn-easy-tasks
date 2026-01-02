import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Coins, Users, Calendar, Search, Loader2, Eye, Trash2 } from "lucide-react";
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
  buyer: {
    full_name: string;
    email: string;
  } | null;
}

const ManageTasks = () => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        buyer:profiles!tasks_buyer_id_profiles_fkey (
          full_name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTasks(data as unknown as Task[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

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

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.buyer?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.buyer?.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalCoinsInTasks = tasks.reduce((sum, t) => sum + (t.payable_amount * t.required_workers), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold mb-2">Manage Tasks</h1>
        <p className="text-muted-foreground">View and manage all platform tasks.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center justify-between">
            <span className="text-muted-foreground">Total Tasks</span>
            <span className="text-2xl font-bold">{tasks.length}</span>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center justify-between">
            <span className="text-muted-foreground">Active Tasks</span>
            <span className="text-2xl font-bold text-success">
              {tasks.filter(t => t.required_workers > 0).length}
            </span>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center justify-between">
            <span className="text-muted-foreground">Coins in Tasks</span>
            <div className="flex items-center gap-1">
              <Coins className="w-5 h-5 text-warning" />
              <span className="text-2xl font-bold">{totalCoinsInTasks.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tasks Table */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>All Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTasks.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Workers</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {task.title}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{task.buyer?.full_name || 'N/A'}</p>
                        <p className="text-sm text-muted-foreground">{task.buyer?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Coins className="w-4 h-4 text-warning" />
                        {task.payable_amount}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {task.required_workers}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(task.completion_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedTask(task)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-xl">
                            <DialogHeader>
                              <DialogTitle>{selectedTask?.title}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Description</p>
                                <p className="whitespace-pre-wrap">{selectedTask?.description}</p>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Buyer</p>
                                  <p>{selectedTask?.buyer?.full_name}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Payment</p>
                                  <p>{selectedTask?.payable_amount} coins per worker</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Workers Needed</p>
                                  <p>{selectedTask?.required_workers}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Deadline</p>
                                  <p>{selectedTask?.completion_date}</p>
                                </div>
                              </div>
                            </div>
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              No tasks found.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageTasks;
