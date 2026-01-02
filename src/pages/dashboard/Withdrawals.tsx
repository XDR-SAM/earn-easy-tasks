import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Coins, Wallet, Loader2, AlertCircle } from "lucide-react";
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
}

const MIN_WITHDRAWAL_COINS = 200;
const COIN_TO_USD_RATE = 20; // 20 coins = $1

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  approved: "bg-success/10 text-success border-success/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

const Withdrawals = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [coins, setCoins] = useState("");
  const [paymentSystem, setPaymentSystem] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  const fetchWithdrawals = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setWithdrawals(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWithdrawals();
  }, [user]);

  // Calculate available balance (current coins minus pending withdrawals)
  const pendingWithdrawalCoins = withdrawals
    .filter(w => w.status === 'pending')
    .reduce((sum, w) => sum + w.coins, 0);
  const availableCoins = (profile?.coins || 0) - pendingWithdrawalCoins;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const coinsAmount = parseInt(coins);
    
    if (!coinsAmount || coinsAmount < MIN_WITHDRAWAL_COINS) {
      toast({
        title: "Invalid amount",
        description: `Minimum withdrawal is ${MIN_WITHDRAWAL_COINS} coins.`,
        variant: "destructive",
      });
      return;
    }

    if (coinsAmount > availableCoins) {
      toast({
        title: "Insufficient balance",
        description: "You don't have enough available coins (excluding pending withdrawals).",
        variant: "destructive",
      });
      return;
    }

    // Check if there's already a pending withdrawal
    const hasPendingWithdrawal = withdrawals.some(w => w.status === 'pending');
    if (hasPendingWithdrawal) {
      toast({
        title: "Pending withdrawal exists",
        description: "Please wait for your pending withdrawal to be processed before requesting another.",
        variant: "destructive",
      });
      return;
    }

    if (!paymentSystem || !accountNumber.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const amountUsd = coinsAmount / COIN_TO_USD_RATE;

      const { error } = await supabase
        .from('withdrawals')
        .insert({
          user_id: user!.id,
          coins: coinsAmount,
          amount_usd: amountUsd,
          payment_system: paymentSystem,
          account_number: accountNumber.trim(),
        });

      if (error) {
        // Handle unique constraint violation
        if (error.code === '23505') {
          toast({
            title: "Pending withdrawal exists",
            description: "You already have a pending withdrawal request.",
            variant: "destructive",
          });
        } else if (error.code === '42501') {
          toast({
            title: "Insufficient balance",
            description: "You don't have enough available coins for this withdrawal.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }

      toast({
        title: "Withdrawal requested!",
        description: "Your request is being processed by admin.",
      });

      setCoins("");
      setPaymentSystem("");
      setAccountNumber("");
      await refreshProfile();
      fetchWithdrawals();
    } catch (error) {
      console.error('Error creating withdrawal:', error);
      toast({
        title: "Error",
        description: "Failed to create withdrawal request.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const usdValue = coins ? (parseInt(coins) / COIN_TO_USD_RATE).toFixed(2) : "0.00";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold mb-2">Withdraw Coins</h1>
        <p className="text-muted-foreground">Convert your coins to real money.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Withdrawal Form */}
        <div className="lg:col-span-1">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Request Withdrawal
              </CardTitle>
              <CardDescription>
                Minimum withdrawal: {MIN_WITHDRAWAL_COINS} coins (${MIN_WITHDRAWAL_COINS / COIN_TO_USD_RATE})
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Balance Display */}
              <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 mb-6">
                <p className="text-sm text-muted-foreground mb-1">Available Balance</p>
                <div className="flex items-center gap-2">
                  <Coins className="w-6 h-6 text-warning" />
                  <span className="text-2xl font-bold">{profile?.coins?.toLocaleString() || 0}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  ≈ ${((profile?.coins || 0) / COIN_TO_USD_RATE).toFixed(2)} USD
                </p>
              </div>

              {availableCoins < MIN_WITHDRAWAL_COINS ? (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-warning/10 border border-warning/20">
                  <AlertCircle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-warning">Insufficient balance</p>
                    <p className="text-sm text-muted-foreground">
                      You need at least {MIN_WITHDRAWAL_COINS} coins to withdraw.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="coins">Amount (Coins)</Label>
                    <Input
                      id="coins"
                      type="number"
                      placeholder={`Min ${MIN_WITHDRAWAL_COINS}`}
                      value={coins}
                      onChange={(e) => setCoins(e.target.value)}
                      min={MIN_WITHDRAWAL_COINS}
                      max={availableCoins}
                    />
                    {pendingWithdrawalCoins > 0 && (
                      <p className="text-sm text-warning">
                        {pendingWithdrawalCoins} coins reserved in pending withdrawal
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      You'll receive: ${usdValue} USD
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentSystem">Payment Method</Label>
                    <Select value={paymentSystem} onValueChange={setPaymentSystem}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bkash">bKash</SelectItem>
                        <SelectItem value="nagad">Nagad</SelectItem>
                        <SelectItem value="rocket">Rocket</SelectItem>
                        <SelectItem value="paypal">PayPal</SelectItem>
                        <SelectItem value="bank">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input
                      id="accountNumber"
                      type="text"
                      placeholder="Enter account number"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    variant="gradient"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Request Withdrawal"
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Withdrawal History */}
        <div className="lg:col-span-2">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Withdrawal History</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : withdrawals.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Coins</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {withdrawals.map((withdrawal) => (
                      <TableRow key={withdrawal.id}>
                        <TableCell className="text-muted-foreground">
                          {new Date(withdrawal.created_at).toLocaleDateString()}
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
                        <TableCell>
                          <Badge variant="outline" className={statusColors[withdrawal.status]}>
                            {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  No withdrawal requests yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Withdrawals;
