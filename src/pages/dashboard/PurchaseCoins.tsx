import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Coins, CreditCard, Loader2, Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const COIN_PACKAGES = [
  { coins: 100, price: 5, popular: false },
  { coins: 250, price: 10, popular: true },
  { coins: 500, price: 18, popular: false },
  { coins: 1000, price: 30, popular: false },
];

const PurchaseCoins = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    let coins = 0;
    let price = 0;

    if (selectedPackage !== null) {
      const pkg = COIN_PACKAGES[selectedPackage];
      coins = pkg.coins;
      price = pkg.price;
    } else if (customAmount) {
      coins = parseInt(customAmount);
      price = coins * 0.05; // $0.05 per coin
    }

    if (coins < 50) {
      toast({
        title: "Invalid amount",
        description: "Minimum purchase is 50 coins.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Create payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id: user!.id,
          coins: coins,
          amount_usd: price,
          payment_method: 'stripe',
          status: 'completed',
        });

      if (paymentError) throw paymentError;

      // Add coins to profile
      const { error: coinsError } = await supabase
        .from('profiles')
        .update({ coins: (profile?.coins || 0) + coins })
        .eq('user_id', user!.id);

      if (coinsError) throw coinsError;

      await refreshProfile();

      toast({
        title: "Purchase successful!",
        description: `${coins} coins added to your account.`,
      });

      setSelectedPackage(null);
      setCustomAmount("");
    } catch (error) {
      console.error('Error purchasing coins:', error);
      toast({
        title: "Purchase failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="font-display text-2xl font-bold mb-2">Purchase Coins</h1>
        <p className="text-muted-foreground">Buy coins to create tasks for workers.</p>
      </div>

      {/* Current Balance */}
      <Card className="glass-card bg-gradient-to-br from-primary/10 to-accent/10">
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
            <div className="flex items-center gap-2">
              <Coins className="w-8 h-8 text-warning" />
              <span className="text-3xl font-bold">{profile?.coins?.toLocaleString() || 0}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Value</p>
            <p className="text-2xl font-bold">${((profile?.coins || 0) * 0.05).toFixed(2)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Coin Packages */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Select a Package</CardTitle>
          <CardDescription>Choose a coin package or enter a custom amount.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {COIN_PACKAGES.map((pkg, index) => (
              <button
                key={index}
                onClick={() => {
                  setSelectedPackage(index);
                  setCustomAmount("");
                }}
                className={`relative p-6 rounded-xl border-2 transition-all text-left ${
                  selectedPackage === index
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {pkg.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs rounded-full font-medium">
                    Popular
                  </span>
                )}
                <div className="flex items-center gap-2 mb-2">
                  <Coins className="w-5 h-5 text-warning" />
                  <span className="text-2xl font-bold">{pkg.coins}</span>
                </div>
                <p className="text-lg font-semibold">${pkg.price}</p>
                <p className="text-sm text-muted-foreground">
                  ${(pkg.price / pkg.coins).toFixed(3)} per coin
                </p>
                {selectedPackage === index && (
                  <Check className="absolute top-4 right-4 w-5 h-5 text-primary" />
                )}
              </button>
            ))}
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or enter custom amount</span>
            </div>
          </div>

          <div className="max-w-xs mx-auto">
            <Label htmlFor="customAmount">Custom Amount (min 50 coins)</Label>
            <Input
              id="customAmount"
              type="number"
              placeholder="Enter number of coins"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                setSelectedPackage(null);
              }}
              min={50}
            />
            {customAmount && parseInt(customAmount) >= 50 && (
              <p className="text-sm text-muted-foreground mt-2 text-center">
                Cost: ${(parseInt(customAmount) * 0.05).toFixed(2)}
              </p>
            )}
          </div>

          <div className="flex justify-center pt-4">
            <Button
              variant="gradient"
              size="lg"
              onClick={handlePurchase}
              disabled={loading || (selectedPackage === null && (!customAmount || parseInt(customAmount) < 50))}
              className="min-w-[200px]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Purchase
                </>
              )}
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Note: This is a demo. No actual payment will be processed.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PurchaseCoins;
