import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Coins, CalendarIcon, Image, Users, FileText, Loader2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AddTask = () => {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    submissionInfo: "",
    imageUrl: "",
    requiredWorkers: 1,
    payableAmount: 1,
  });
  const [completionDate, setCompletionDate] = useState<Date | undefined>();

  const totalCost = formData.requiredWorkers * formData.payableAmount;
  const hasEnoughCoins = (profile?.coins || 0) >= totalCost;

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!completionDate) {
      toast({
        title: "Missing deadline",
        description: "Please select a completion date.",
        variant: "destructive",
      });
      return;
    }

    if (!hasEnoughCoins) {
      toast({
        title: "Insufficient coins",
        description: `You need ${totalCost} coins but only have ${profile?.coins || 0}.`,
        variant: "destructive",
      });
      return;
    }

    if (formData.requiredWorkers < 1 || formData.payableAmount < 1) {
      toast({
        title: "Invalid values",
        description: "Workers and payment must be at least 1.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Create task
      const { error: taskError } = await supabase
        .from('tasks')
        .insert({
          buyer_id: user!.id,
          title: formData.title.trim(),
          description: formData.description.trim(),
          submission_info: formData.submissionInfo.trim(),
          image_url: formData.imageUrl.trim() || null,
          required_workers: formData.requiredWorkers,
          payable_amount: formData.payableAmount,
          completion_date: format(completionDate, 'yyyy-MM-dd'),
        });

      if (taskError) throw taskError;

      // Deduct coins from buyer
      const { error: coinsError } = await supabase
        .from('profiles')
        .update({ coins: (profile?.coins || 0) - totalCost })
        .eq('user_id', user!.id);

      if (coinsError) throw coinsError;

      await refreshProfile();

      toast({
        title: "Task created!",
        description: `${totalCost} coins deducted from your balance.`,
      });

      navigate('/dashboard/my-tasks');
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="font-display text-2xl font-bold mb-2">Create New Task</h1>
        <p className="text-muted-foreground">Post a task for workers to complete.</p>
      </div>

      {/* Balance Card */}
      <Card className="glass-card">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Coins className="w-8 h-8 text-warning" />
            <div>
              <p className="text-sm text-muted-foreground">Your Balance</p>
              <p className="text-2xl font-bold">{profile?.coins?.toLocaleString() || 0} coins</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Task Cost</p>
            <p className={cn(
              "text-2xl font-bold",
              hasEnoughCoins ? "text-success" : "text-destructive"
            )}>
              {totalCost} coins
            </p>
          </div>
        </CardContent>
      </Card>

      {!hasEnoughCoins && totalCost > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-destructive">Insufficient balance</p>
            <p className="text-sm text-muted-foreground">
              You need {totalCost - (profile?.coins || 0)} more coins to create this task.
            </p>
          </div>
        </div>
      )}

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Task Details</CardTitle>
          <CardDescription>Fill in all the details about your task.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title</Label>
              <Input
                id="title"
                placeholder="e.g., Watch YouTube video and leave a comment"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what workers need to do..."
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="submissionInfo">
                <FileText className="w-4 h-4 inline mr-2" />
                What to Submit
              </Label>
              <Textarea
                id="submissionInfo"
                placeholder="Tell workers what proof/information they need to submit..."
                value={formData.submissionInfo}
                onChange={(e) => handleChange("submissionInfo", e.target.value)}
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">
                <Image className="w-4 h-4 inline mr-2" />
                Task Image URL (Optional)
              </Label>
              <Input
                id="imageUrl"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={formData.imageUrl}
                onChange={(e) => handleChange("imageUrl", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="requiredWorkers">
                  <Users className="w-4 h-4 inline mr-2" />
                  Number of Workers
                </Label>
                <Input
                  id="requiredWorkers"
                  type="number"
                  min={1}
                  value={formData.requiredWorkers}
                  onChange={(e) => handleChange("requiredWorkers", parseInt(e.target.value) || 1)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="payableAmount">
                  <Coins className="w-4 h-4 inline mr-2" />
                  Coins per Worker
                </Label>
                <Input
                  id="payableAmount"
                  type="number"
                  min={1}
                  value={formData.payableAmount}
                  onChange={(e) => handleChange("payableAmount", parseInt(e.target.value) || 1)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>
                <CalendarIcon className="w-4 h-4 inline mr-2" />
                Completion Deadline
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !completionDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {completionDate ? format(completionDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={completionDate}
                    onSelect={setCompletionDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="gradient"
                className="flex-1"
                disabled={loading || !hasEnoughCoins}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>Create Task ({totalCost} coins)</>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddTask;
