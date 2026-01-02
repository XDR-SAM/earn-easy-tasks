import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Coins, Check, X, Loader2, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface Withdrawal {
  id: string;
  coins: number;
  amount_usd: number;
  payment_system: string;
  account_number: string;
  status: string;
  created_at: string;
  user: {
    full_name: string;
    email: string;
    user_id: string;
    coins: number;
  } | null;
}

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  approved: "bg-success/10 text-success border-success/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

const AdminWithdrawals = () => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWithdrawals = async () => {
    const { data, error } = await supabase
      .from('withdrawals')
      .select(`
        *,
        user:profiles!withdrawals_user_id_profiles_fkey (
          full_name,
          email,
          user_id,
          coins
        )
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setWithdrawals(data as unknown as Withdrawal[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleApprove = async (withdrawal: Withdrawal) => {
    if (!withdrawal.user) return;

    try {
      // Update withdrawal status
      await supabase
        .from('withdrawals')
        .update({ status: 'approved' })
        .eq('id', withdrawal.id);

      // Deduct coins from user
      await supabase
        .from('profiles')
        .update({ coins: withdrawal.user.coins - withdrawal.coins })
        .eq('user_id', withdrawal.user.user_id);

      // Create notification
      await supabase
        .from('notifications')
        .insert({
          user_id: withdrawal.user.user_id,
          message: `Your withdrawal of $${withdrawal.amount_usd} has been approved!`,
          action_route: '/dashboard/withdrawals',
        });

      toast({
        title: "Withdrawal approved!",
        description: `$${withdrawal.amount_usd} sent to ${withdrawal.user.full_name}.`,
      });

      fetchWithdrawals();
    } catch (error) {
      console.error('Error approving:', error);
      toast({
        title: "Error",
        description: "Failed to approve withdrawal.",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (withdrawal: Withdrawal) => {
    if (!withdrawal.user) return;

    try {
      // Update withdrawal status
      await supabase
        .from('withdrawals')
        .update({ status: 'rejected' })
        .eq('id', withdrawal.id);

      // Create notification
      await supabase
        .from('notifications')
        .insert({
          user_id: withdrawal.user.user_id,
          message: `Your withdrawal request of $${withdrawal.amount_usd} was rejected.`,
          action_route: '/dashboard/withdrawals',
        });

      toast({
        title: "Withdrawal rejected",
        description: "User has been notified.",
      });

      fetchWithdrawals();
    } catch (error) {
      console.error('Error rejecting:', error);
      toast({
        title: "Error",
        description: "Failed to reject withdrawal.",
        variant: "destructive",
      });
    }
  };

  const filterWithdrawals = (status: string) => {
    if (status === 'all') return withdrawals;
    return withdrawals.filter(w => w.status === status);
  };

  const stats = {
    total: withdrawals.length,
    pending: withdrawals.filter(w => w.status === 'pending').length,
    approved: withdrawals.filter(w => w.status === 'approved').length,
    totalAmount: withdrawals.filter(w => w.status === 'approved').reduce((sum, w) => sum + Number(w.amount_usd), 0),
  };

  const WithdrawalsTable = ({ items, showActions }: { items: Withdrawal[]; showActions?: boolean }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Coins</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Method</TableHead>
          <TableHead>Account</TableHead>
          <TableHead>Date</TableHead>
          {showActions && <TableHead>Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((withdrawal) => (
          <TableRow key={withdrawal.id}>
            <TableCell>
              <div>
                <p className="font-medium">{withdrawal.user?.full_name || 'N/A'}</p>
                <p className="text-sm text-muted-foreground">{withdrawal.user?.email}</p>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Coins className="w-4 h-4 text-warning" />
                {withdrawal.coins}
              </div>
            </TableCell>
            <TableCell>${Number(withdrawal.amount_usd).toFixed(2)}</TableCell>
            <TableCell>
              <Badge variant="outline">{withdrawal.payment_system}</Badge>
            </TableCell>
            <TableCell className="font-mono text-sm">{withdrawal.account_number}</TableCell>
            <TableCell className="text-muted-foreground">
              {new Date(withdrawal.created_at).toLocaleDateString()}
            </TableCell>
            {showActions && (
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => handleApprove(withdrawal)}
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleReject(withdrawal)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            )}
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
        <h1 className="font-display text-2xl font-bold mb-2">Withdrawal Requests</h1>
        <p className="text-muted-foreground">Manage worker withdrawal requests.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <Wallet className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Total Requests</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-warning">{stats.pending}</p>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-success">{stats.approved}</p>
            <p className="text-sm text-muted-foreground">Approved</p>
          </CardContent>
        </Card>
        <Card className="glass-card bg-gradient-to-br from-success/10 to-accent/10">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">${stats.totalAmount.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">Total Paid</p>
          </CardContent>
        </Card>
      </div>

      {/* Withdrawals Table */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>All Withdrawal Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending">
            <TabsList className="mb-4">
              <TabsTrigger value="pending">
                Pending ({filterWithdrawals('pending').length})
              </TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
            <TabsContent value="pending">
              {filterWithdrawals('pending').length > 0 ? (
                <WithdrawalsTable items={filterWithdrawals('pending')} showActions />
              ) : (
                <p className="text-center py-8 text-muted-foreground">No pending requests.</p>
              )}
            </TabsContent>
            <TabsContent value="approved">
              {filterWithdrawals('approved').length > 0 ? (
                <WithdrawalsTable items={filterWithdrawals('approved')} />
              ) : (
                <p className="text-center py-8 text-muted-foreground">No approved requests.</p>
              )}
            </TabsContent>
            <TabsContent value="rejected">
              {filterWithdrawals('rejected').length > 0 ? (
                <WithdrawalsTable items={filterWithdrawals('rejected')} />
              ) : (
                <p className="text-center py-8 text-muted-foreground">No rejected requests.</p>
              )}
            </TabsContent>
            <TabsContent value="all">
              {withdrawals.length > 0 ? (
                <WithdrawalsTable items={withdrawals} />
              ) : (
                <p className="text-center py-8 text-muted-foreground">No withdrawal requests.</p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminWithdrawals;
