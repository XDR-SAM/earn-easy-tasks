-- Fix 1: Update profiles RLS policy to restrict access
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Allow users to view their own profile
-- Also allow viewing profiles of users they have task relationships with (buyer-worker)
-- Also allow admins to view all profiles
CREATE POLICY "Users can view related profiles" ON public.profiles
  FOR SELECT USING (
    auth.uid() = user_id OR
    has_role(auth.uid(), 'admin'::app_role) OR
    -- Allow viewing profiles of workers who submitted to your tasks
    EXISTS (
      SELECT 1 FROM tasks t
      JOIN submissions s ON s.task_id = t.id
      WHERE t.buyer_id = auth.uid() AND s.worker_id = profiles.user_id
    ) OR
    -- Allow viewing buyer profiles for tasks you submitted to
    EXISTS (
      SELECT 1 FROM tasks t
      JOIN submissions s ON s.task_id = t.id
      WHERE s.worker_id = auth.uid() AND t.buyer_id = profiles.user_id
    )
  );

-- Fix 2: Add unique constraint to prevent multiple pending withdrawals
CREATE UNIQUE INDEX IF NOT EXISTS unique_pending_withdrawal 
  ON public.withdrawals (user_id) 
  WHERE status = 'pending';

-- Drop the old insert policy
DROP POLICY IF EXISTS "Workers can create withdrawals" ON public.withdrawals;

-- Create new insert policy with pending withdrawal check
CREATE POLICY "Workers can create withdrawals" ON public.withdrawals
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND 
    has_role(auth.uid(), 'worker'::app_role) AND
    -- Ensure user has enough coins (check available balance minus pending withdrawals)
    (SELECT COALESCE(p.coins, 0) - COALESCE(
      (SELECT SUM(w.coins) FROM withdrawals w WHERE w.user_id = auth.uid() AND w.status = 'pending'), 0
    ) FROM profiles p WHERE p.user_id = auth.uid()) >= coins
  );