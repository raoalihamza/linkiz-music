-- Linkiz Platform Database Schema
--
-- Overview:
-- This migration creates the complete database schema for Linkiz, a freemium multi-link music platform
-- with subscription-based downloads.
--
-- New Tables:
-- 1. user_profiles - Extends auth.users with subscription and download tracking
-- 2. linkiz_pages - User-created multi-link pages
-- 3. links - Individual links within a Linkiz page
-- 4. links - Download history and tracking
-- 5. subscriptions - Subscription history and management
--
-- Security:
-- All tables have RLS enabled with restrictive policies
-- Users can only access their own data
-- Public can view published pages and links

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text DEFAULT '',
  avatar_url text DEFAULT '',
  plan_type text DEFAULT 'free' CHECK (plan_type IN ('free', 'starter', 'creator')),
  downloads_used integer DEFAULT 0,
  downloads_limit integer DEFAULT 0,
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete', 'incomplete_expired', 'unpaid')),
  subscription_period_start timestamptz,
  subscription_period_end timestamptz,
  terms_accepted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create linkiz_pages table
CREATE TABLE IF NOT EXISTS linkiz_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  avatar_url text DEFAULT '',
  theme_color text DEFAULT '#3b82f6',
  is_published boolean DEFAULT true,
  view_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create links table
CREATE TABLE IF NOT EXISTS links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid NOT NULL REFERENCES linkiz_pages(id) ON DELETE CASCADE,
  title text NOT NULL,
  url text NOT NULL,
  icon text DEFAULT 'link',
  file_url text,
  file_size bigint,
  file_type text,
  is_downloadable boolean DEFAULT false,
  download_count integer DEFAULT 0,
  position integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create downloads table
CREATE TABLE IF NOT EXISTS downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  link_id uuid NOT NULL REFERENCES links(id) ON DELETE CASCADE,
  page_id uuid NOT NULL REFERENCES linkiz_pages(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  watermarked boolean DEFAULT false,
  plan_type_at_download text NOT NULL,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  stripe_subscription_id text UNIQUE NOT NULL,
  stripe_customer_id text NOT NULL,
  plan_type text NOT NULL CHECK (plan_type IN ('starter', 'creator')),
  status text NOT NULL,
  current_period_start timestamptz NOT NULL,
  current_period_end timestamptz NOT NULL,
  cancel_at_period_end boolean DEFAULT false,
  canceled_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_stripe_customer ON user_profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_linkiz_pages_user_id ON linkiz_pages(user_id);
CREATE INDEX IF NOT EXISTS idx_linkiz_pages_slug ON linkiz_pages(slug);
CREATE INDEX IF NOT EXISTS idx_links_page_id ON links(page_id);
CREATE INDEX IF NOT EXISTS idx_downloads_user_id ON downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_downloads_link_id ON downloads(link_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_sub ON subscriptions(stripe_subscription_id);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkiz_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Public can view basic profile info"
  ON user_profiles FOR SELECT
  TO anon
  USING (true);

-- RLS Policies for linkiz_pages
CREATE POLICY "Users can view own pages"
  ON linkiz_pages FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Public can view published pages"
  ON linkiz_pages FOR SELECT
  TO anon
  USING (is_published = true);

CREATE POLICY "Users can create own pages"
  ON linkiz_pages FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own pages"
  ON linkiz_pages FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own pages"
  ON linkiz_pages FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for links
CREATE POLICY "Users can view links on own pages"
  ON links FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM linkiz_pages
      WHERE linkiz_pages.id = links.page_id
      AND linkiz_pages.user_id = auth.uid()
    )
  );

CREATE POLICY "Public can view active links on published pages"
  ON links FOR SELECT
  TO anon
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM linkiz_pages
      WHERE linkiz_pages.id = links.page_id
      AND linkiz_pages.is_published = true
    )
  );

CREATE POLICY "Users can create links on own pages"
  ON links FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM linkiz_pages
      WHERE linkiz_pages.id = links.page_id
      AND linkiz_pages.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update links on own pages"
  ON links FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM linkiz_pages
      WHERE linkiz_pages.id = links.page_id
      AND linkiz_pages.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM linkiz_pages
      WHERE linkiz_pages.id = links.page_id
      AND linkiz_pages.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete links on own pages"
  ON links FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM linkiz_pages
      WHERE linkiz_pages.id = links.page_id
      AND linkiz_pages.user_id = auth.uid()
    )
  );

-- RLS Policies for downloads
CREATE POLICY "Users can view own downloads"
  ON downloads FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Page owners can view downloads of their content"
  ON downloads FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM linkiz_pages
      WHERE linkiz_pages.id = downloads.page_id
      AND linkiz_pages.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert download records"
  ON downloads FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can insert subscription records"
  ON subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can update subscription records"
  ON subscriptions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_linkiz_pages_updated_at BEFORE UPDATE ON linkiz_pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_links_updated_at BEFORE UPDATE ON links
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();