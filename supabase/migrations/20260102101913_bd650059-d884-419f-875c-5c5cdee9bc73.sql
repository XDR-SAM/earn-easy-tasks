-- Add foreign key references to enable Supabase joins

-- Add foreign key from tasks.buyer_id to profiles.user_id
ALTER TABLE public.tasks
ADD CONSTRAINT tasks_buyer_id_profiles_fkey 
FOREIGN KEY (buyer_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Add foreign key from submissions.worker_id to profiles.user_id
ALTER TABLE public.submissions
ADD CONSTRAINT submissions_worker_id_profiles_fkey 
FOREIGN KEY (worker_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Add foreign key from withdrawals.user_id to profiles.user_id
ALTER TABLE public.withdrawals
ADD CONSTRAINT withdrawals_user_id_profiles_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;