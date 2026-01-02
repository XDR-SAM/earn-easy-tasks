import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Coins, Eye, Loader2 } from "lucide-react";
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
  } | null;
}

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  approved: "bg-success/10 text-success border-success/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

const MySubmissions = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('submissions')
        .select(`
          id,
          submission_details,
          status,
          created_at,
          task:tasks (
            title,
            payable_amount
          )
        `)
        .eq('worker_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setSubmissions(data as unknown as Submission[]);
      }
      setLoading(false);
    };

    fetchSubmissions();
  }, [user]);

  const filterSubmissions = (status: string) => {
    if (status === 'all') return submissions;
    return submissions.filter(s => s.status === status);
  };

  const SubmissionsTable = ({ items }: { items: Submission[] }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Task</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Submitted</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((submission) => (
          <TableRow key={submission.id}>
            <TableCell className="font-medium max-w-[200px] truncate">
              {submission.task?.title || 'N/A'}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Coins className="w-4 h-4 text-warning" />
                {submission.task?.payable_amount || 0}
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline" className={statusColors[submission.status]}>
                {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {new Date(submission.created_at).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedSubmission(submission)}
                  >
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
                      <p className="text-sm font-medium text-muted-foreground">Status</p>
                      <Badge variant="outline" className={statusColors[selectedSubmission?.status || 'pending']}>
                        {selectedSubmission?.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Your Submission</p>
                      <p className="whitespace-pre-wrap bg-muted p-3 rounded-lg">
                        {selectedSubmission?.submission_details}
                      </p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
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
        <h1 className="font-display text-2xl font-bold mb-2">My Submissions</h1>
        <p className="text-muted-foreground">Track all your task submissions.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center justify-between">
            <span className="text-muted-foreground">Total</span>
            <span className="text-2xl font-bold">{submissions.length}</span>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center justify-between">
            <span className="text-muted-foreground">Approved</span>
            <span className="text-2xl font-bold text-success">
              {submissions.filter(s => s.status === 'approved').length}
            </span>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center justify-between">
            <span className="text-muted-foreground">Pending</span>
            <span className="text-2xl font-bold text-warning">
              {submissions.filter(s => s.status === 'pending').length}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Submissions Table */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Submission History</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              {filterSubmissions('all').length > 0 ? (
                <SubmissionsTable items={filterSubmissions('all')} />
              ) : (
                <p className="text-center py-8 text-muted-foreground">No submissions yet.</p>
              )}
            </TabsContent>
            <TabsContent value="pending">
              {filterSubmissions('pending').length > 0 ? (
                <SubmissionsTable items={filterSubmissions('pending')} />
              ) : (
                <p className="text-center py-8 text-muted-foreground">No pending submissions.</p>
              )}
            </TabsContent>
            <TabsContent value="approved">
              {filterSubmissions('approved').length > 0 ? (
                <SubmissionsTable items={filterSubmissions('approved')} />
              ) : (
                <p className="text-center py-8 text-muted-foreground">No approved submissions.</p>
              )}
            </TabsContent>
            <TabsContent value="rejected">
              {filterSubmissions('rejected').length > 0 ? (
                <SubmissionsTable items={filterSubmissions('rejected')} />
              ) : (
                <p className="text-center py-8 text-muted-foreground">No rejected submissions.</p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default MySubmissions;
