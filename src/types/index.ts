export type UserPlan = 'free' | 'pro' | 'agency';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type SubmissionStatus = 'pending' | 'approved' | 'rejected';
export type WorkflowStatus = 'approved' | 'pending' | 'draft';
export type PageStatus = 'draft' | 'published';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'user' | 'admin';
  plan: UserPlan;
  paddle_customer_id: string | null;
  credits: number;
  created_at: string;
  updated_at: string;
}

export interface Workflow {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: string;
  price_cents: number;
  paddle_price_id: string | null;
  file_url: string | null;
  preview_url: string | null;
  node_count: number;
  tools: string[];
  featured: boolean;
  published: boolean;
  author_id: string | null;
  status: WorkflowStatus;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  difficulty: Difficulty;
  price_cents: number;
  paddle_price_id: string | null;
  lessons: Lesson[];
  lesson_count: number;
  featured: boolean;
  published: boolean;
  author_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  video_url?: string;
}

export interface Purchase {
  id: string;
  user_id: string;
  template_id: string | null;
  workflow_id: string | null;
  course_id: string | null;
  paddle_transaction_id: string | null;
  amount_cents: number | null;
  status: 'completed' | 'refunded' | 'pending';
  download_url: string | null;
  download_expires_at: string | null;
  downloaded_at: string | null;
  created_at: string;
}

export interface Submission {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: string;
  file_url: string | null;
  tools: string[];
  status: SubmissionStatus;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan: string;
  paddle_subscription_id: string | null;
  status: string;
  current_period_end: string | null;
  created_at: string;
}

export interface Page {
  id: string;
  slug: string;
  title: string;
  content: string;
  updated_at: string;
}

export interface SiteSetting {
  id: string;
  key: string;
  value: Record<string, unknown>;
  updated_at: string;
}
