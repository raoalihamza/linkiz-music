-- Create secure_shares table
CREATE TABLE IF NOT EXISTS secure_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE SET NULL, -- Optional (can be anonymous?) Let's keep it mostly for tracking
  file_path text NOT NULL,
  file_name text NOT NULL,
  file_size text,
  file_type text,
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '24 hours') -- Matches signed URL expiry
);

-- Enable RLS
ALTER TABLE secure_shares ENABLE ROW LEVEL SECURITY;

-- Policies
-- Creator can view/delete
CREATE POLICY "Users can view own shares"
  ON secure_shares FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Public (Anonymous) needs to 'Unlock' via API (we won't give direct SELECT access to anonymous usually, logic handles verification)
-- But for the "Unlock Page" metadata (filename/size), we might want public read access IF they have the ID.
CREATE POLICY "Public can view share metadata"
  ON secure_shares FOR SELECT
  TO anon
  USING (true); -- Security relying on ID secrecy + Password for actual file access

-- Force Schema Cache Reload
NOTIFY pgrst, 'reload schema';
