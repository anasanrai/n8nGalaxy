import { createClient } from '@supabase/supabase-js';
import type { Profile, Workflow, Course, Purchase, Submission, Subscription, Page, SiteSetting } from '../types';

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile>;
        Update: Partial<Profile>;
      };
      workflows: {
        Row: Workflow;
        Insert: Partial<Workflow>;
        Update: Partial<Workflow>;
      };
      courses: {
        Row: Course;
        Insert: Partial<Course>;
        Update: Partial<Course>;
      };
      purchases: {
        Row: Purchase;
        Insert: Partial<Purchase>;
        Update: Partial<Purchase>;
      };
      submissions: {
        Row: Submission;
        Insert: Partial<Submission>;
        Update: Partial<Submission>;
      };
      subscriptions: {
        Row: Subscription;
        Insert: Partial<Subscription>;
        Update: Partial<Subscription>;
      };
      pages: {
        Row: Page;
        Insert: Partial<Page>;
        Update: Partial<Page>;
      };
      site_settings: {
        Row: SiteSetting;
        Insert: Partial<SiteSetting>;
        Update: Partial<SiteSetting>;
      };
    };
  };
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('Missing Supabase env vars');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
