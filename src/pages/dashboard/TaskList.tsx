import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Coins, Calendar, Users, Search, Eye, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Task {
  id: string;
  title: string;
  image_url: string | null;
  payable_amount: number;
  required_workers: number;
  completion_date: string;
  buyer: {
    full_name: string;
    avatar_url: string | null;
  } | null;
}

const TaskList = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchTasks = async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          id,
          title,
          image_url,
          payable_amount,
          required_workers,
          completion_date,
          buyer:profiles!tasks_buyer_id_profiles_fkey (
            full_name,
            avatar_url
          )
        `)
        .gt('required_workers', 0)
        .gte('completion_date', new Date().toISOString().split('T')[0])
        .order('created_at', { ascending: false });

      if (!error && data) {
        setTasks(data as unknown as Task[]);
      }
      setLoading(false);
    };

    fetchTasks();
  }, []);

  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.buyer?.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <h1 className="font-display text-2xl font-bold mb-2">Available Tasks</h1>
        <p className="text-muted-foreground">Browse and complete tasks to earn coins.</p>
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

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.map((task) => (
          <Card key={task.id} className="glass-card overflow-hidden hover-lift group">
            <div className="relative h-40 overflow-hidden bg-muted">
              {task.image_url ? (
                <img
                  src={task.image_url}
                  alt={task.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-4xl">📋</span>
                </div>
              )}
              <div className="absolute top-3 right-3">
                <div className="coin-badge">
                  <Coins className="w-4 h-4" />
                  {task.payable_amount}
                </div>
              </div>
            </div>
            
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold line-clamp-2 min-h-[48px]">{task.title}</h3>
              
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={task.buyer?.avatar_url || ''} alt={task.buyer?.full_name} />
                  <AvatarFallback>{task.buyer?.full_name?.[0] || 'B'}</AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">{task.buyer?.full_name || 'Unknown'}</span>
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(task.completion_date).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {task.required_workers} spots
                </div>
              </div>

              <Link to={`/dashboard/tasks/${task.id}`}>
                <Button className="w-full" variant="gradient">
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No tasks found matching your search.</p>
        </div>
      )}
    </div>
  );
};

export default TaskList;
