import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Coins, Calendar, Users, ArrowLeft, Send, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Task {
  id: string;
  title: string;
  description: string;
  submission_info: string;
  image_url: string | null;
  payable_amount: number;
  required_workers: number;
  completion_date: string;
  buyer_id: string;
  buyer: {
    full_name: string;
    avatar_url: string | null;
  } | null;
}

const TaskDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const { toast } = useToast();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submissionDetails, setSubmissionDetails] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    const fetchTask = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          buyer:profiles!tasks_buyer_id_profiles_fkey (
            full_name,
            avatar_url
          )
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching task:', error);
        toast({
          title: "Error",
          description: "Failed to load task details.",
          variant: "destructive",
        });
        return;
      }

      setTask(data as unknown as Task);

      // Check if user has already submitted
      if (user) {
        const { data: existingSubmission } = await supabase
          .from('submissions')
          .select('id')
          .eq('task_id', id)
          .eq('worker_id', user.id)
          .maybeSingle();

        setHasSubmitted(!!existingSubmission);
      }

      setLoading(false);
    };

    fetchTask();
  }, [id, user]);

  const handleSubmit = async () => {
    if (!task || !user || !submissionDetails.trim()) return;

    if (role !== 'worker') {
      toast({
        title: "Not allowed",
        description: "Only workers can submit tasks.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      // Create submission
      const { error: submissionError } = await supabase
        .from('submissions')
        .insert({
          task_id: task.id,
          worker_id: user.id,
          submission_details: submissionDetails.trim(),
        });

      if (submissionError) throw submissionError;

      // Decrease required workers
      const { error: updateError } = await supabase
        .from('tasks')
        .update({ required_workers: task.required_workers - 1 })
        .eq('id', task.id);

      if (updateError) throw updateError;

      // Notify buyer
      await supabase
        .from('notifications')
        .insert({
          user_id: task.buyer_id,
          message: `New submission received for "${task.title}"`,
          action_route: '/dashboard',
        });

      toast({
        title: "Submission successful!",
        description: "Your work has been submitted for review.",
      });

      setHasSubmitted(true);
      setSubmissionDetails("");
    } catch (error) {
      console.error('Error submitting:', error);
      toast({
        title: "Submission failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Task not found.</p>
        <Button variant="ghost" onClick={() => navigate(-1)} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
        </Button>
      </div>
    );
  }

  const isExpired = new Date(task.completion_date) < new Date();
  const isFull = task.required_workers <= 0;

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Tasks
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass-card overflow-hidden">
            {task.image_url && (
              <div className="h-64 overflow-hidden">
                <img
                  src={task.image_url}
                  alt={task.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h1 className="font-display text-2xl font-bold">{task.title}</h1>
                <div className="coin-badge text-lg">
                  <Coins className="w-5 h-5" />
                  {task.payable_amount}
                </div>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={task.buyer?.avatar_url || ''} />
                  <AvatarFallback>{task.buyer?.full_name?.[0] || 'B'}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{task.buyer?.full_name || 'Unknown'}</p>
                  <p className="text-sm text-muted-foreground">Task Owner</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{task.description}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">What to Submit</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap bg-muted/50 p-4 rounded-lg">
                    {task.submission_info}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Task Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Deadline</span>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(task.completion_date).toLocaleDateString()}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Spots Left</span>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {task.required_workers}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                {isExpired ? (
                  <Badge variant="destructive">Expired</Badge>
                ) : isFull ? (
                  <Badge variant="secondary">Full</Badge>
                ) : (
                  <Badge variant="default" className="bg-success">Open</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submit Work - Only for workers */}
          {role === 'worker' && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Submit Your Work</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {hasSubmitted ? (
                  <div className="text-center py-4">
                    <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                      Already Submitted
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-2">
                      Waiting for buyer review
                    </p>
                  </div>
                ) : isExpired ? (
                  <p className="text-center text-muted-foreground py-4">
                    This task has expired.
                  </p>
                ) : isFull ? (
                  <p className="text-center text-muted-foreground py-4">
                    No spots available.
                  </p>
                ) : (
                  <>
                    <Textarea
                      placeholder="Enter your submission details..."
                      value={submissionDetails}
                      onChange={(e) => setSubmissionDetails(e.target.value)}
                      rows={5}
                    />
                    <Button
                      className="w-full"
                      variant="gradient"
                      onClick={handleSubmit}
                      disabled={submitting || !submissionDetails.trim()}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Submit Work
                        </>
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;
