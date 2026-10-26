export type Profile = {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  created_at?: string;
};

export type Scheduler = {
  id: string;
  owner_id: string;
  title: string;
  color_theme: string;
  created_at?: string;
};

export type SchedulerMember = {
  id: string;
  scheduler_id: string;
  user_id: string;
  role: 'owner' | 'editor' | 'viewer';
  status: 'pending' | 'accepted' | 'rejected';
  created_at?: string;
  profiles?: Profile;
  schedulers?: Scheduler;
};

export type Schedule = {
  id: string;
  scheduler_id: string;
  author_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  is_shared: boolean;
  recurrence_rule: 'none' | 'weekly' | 'monthly' | 'yearly';
  color: string;
  created_at?: string;
};
