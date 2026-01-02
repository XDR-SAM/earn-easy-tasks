import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, ClipboardList, Coins, CreditCard, Check, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

const AdminHome = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [stats, setStats] = useState({
    totalWorkers: 0,
    totalBuyers: 0,
    totalCoins: 0,
    totalPayments: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    // Fetch stats
    const { data: profiles } = await supabase
      .from('profiles')
      .select('coins');

    const { data: roles } = await supabase
      .from('user_roles')
      .select('role');

    const { data: payments } = await supabase
      .from('payments')
      .select('amount_usd');

    const workers = roles?.filter(r => r.role === 'worker').length || 0;
    const buyers = roles?.filter(r => r.role === 'buyer').length || 0;
    const totalCoins = profiles?.reduce((sum, p) => sum + p.coins, 0) || 0;
    const totalPayments = payments?.reduce((sum, p) => sum + Number(p.amount_usd), 0) || 0;

    setStats({
      totalWorkers: workers,
      totalBuyers: buyers,
      totalCoins: totalCoins,
      totalPayments: totalPayments,
    });

    // Fetch pending withdrawals
    const { data: withdrawalData } = await supabase
      .from('withdrawals')
      .select(`
        id,
        coins,
        amount_usd,
        payment_system,
        account_number,
        status,
        created_at,
        user:profiles!withdrawals_user_id_fkey (
          full_name,
          email,
          user_id,
          coins
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (withdrawalData) {
      setWithdrawals(withdrawalData as unknown as Withdrawal[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApproveWithdrawal = async (withdrawal: Withdrawal) => {
    if (!withdrawal.user) return;

    try {
      // Update withdrawal status
      const { error: withdrawalError } = await supabase
        .from('withdrawals')
        .update({ status: 'approved' })
        .eq('id', withdrawal.id);

      if (withdrawalError) throw withdrawalError;

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

      fetchData();
    } catch (error) {
      console.error('Error approving withdrawal:', error);
      toast({
        title: "Error",
        description: "Failed to approve withdrawal.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold mb-2">Admin Dashboard 🛡️</h1>
        <p className="text-muted-foreground">Platform overview and management.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-card hover-lift">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Workers
            </CardTitle>
            <Users className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalWorkers}</p>
          </CardContent>
        </Card>

        <Card className="glass-card hover-lift">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Buyers
            </CardTitle>
            <Users className="w-5 h-5 text-accent" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalBuyers}</p>
          </CardContent>
        </Card>

        <Card className="glass-card hover-lift">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Coins
            </CardTitle>
            <Coins className="w-5 h-5 text-warning" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalCoins.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="glass-card hover-lift bg-gradient-to-br from-success/10 to-accent/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Payments
            </CardTitle>
            <CreditCard className="w-5 h-5 text-success" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${stats.totalPayments.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Withdrawals */}
      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Pending Withdrawal Requests</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Approve worker withdrawals</p>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : withdrawals.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Worker</TableHead>
                  <TableHead>Coins</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals.map((withdrawal) => (
                  <TableRow key={withdrawal.id}>
                    <TableCell className="font-medium">{withdrawal.user?.full_name || 'N/A'}</TableCell>
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
                    <TableCell>
                      <Button 
                        variant="success" 
                        size="sm"
                        onClick={() => handleApproveWithdrawal(withdrawal)}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No pending withdrawal requests.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="glass-card p-6">
          <h3 className="font-semibold mb-2">Manage Users</h3>
          <p className="text-sm text-muted-foreground mb-4">
            View and manage all platform users.
          </p>
          <Link to="/dashboard/users">
            <Button variant="gradient">
              Manage Users <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </Card>

        <Card className="glass-card p-6">
          <h3 className="font-semibold mb-2">Manage Tasks</h3>
          <p className="text-sm text-muted-foreground mb-4">
            View and manage all platform tasks.
          </p>
          <Link to="/dashboard/manage-tasks">
            <Button variant="outline">
              Manage Tasks <ClipboardList className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
};

export default AdminHome;
