# Linkiz Platform - Complete Project Documentation

**Updated:** January 10, 2026
**Developer:** Ali (Full Stack MERN Developer)
**GitHub Repo:** [raoalihamza/linkiz-music](https://github.com/raoalihamza/linkiz-music)
**Budget:** €700 (€400 upfront, €300 on delivery)
**Architecture:** React Frontend + Node.js Backend + PostgreSQL (Supabase)

---

## Table of Contents

1. [Executive Summary & Current State](#1-executive-summary--current-state)
2. [Code Review Findings (70% Complete)](#2-code-review-findings-70-complete)
3. [Technology Stack & Architecture](#3-technology-stack--architecture)
4. [Features Already Built (Bolt.new)](#4-features-already-built-boltnew)
5. [Features Partially Complete](#5-features-partially-complete)
6. [Features Not Started](#6-features-not-started)
7. [Phase-by-Phase Development Plan](#7-phase-by-phase-development-plan)
8. [Database Schema](#8-database-schema)
9. [Technical Requirements](#9-technical-requirements)
10. [Testing Strategy](#10-testing-strategy)

---

## 1. Executive Summary & Current State

### Project Status: 70% Complete
**Timeline:** 7-9 days remaining  
**Budget:** €700 (€400 received upfront)

### What is Linkiz?

Linkiz is a freemium platform combining two core services:

1. **Multi-platform link aggregation** (like Linktree for musicians)
   - Centralize music streaming links (Spotify, Apple Music, Deezer)
   - Social media profiles
   - Online stores and merchandise
   - Downloadable files (samples, stems, exclusive content)

2. **High-quality media converter** (YouTube, Instagram, TikTok, SoundCloud)
   - Download videos and audio in multiple formats
   - MP3 320kbps, MP4 HD 1080p, MP4 SD 720p
   - Works for both authenticated and anonymous users

### Current Development Status

| Component | Status | Progress |
|-----------|--------|----------|
| Authentication System | ✓ Complete | 100% |
| Database Schema | ✓ Complete | 100% |
| Plan Management | ✓ Complete | 100% |
| UI Components | ✓ Complete | 95% |
| Media Converter Frontend | ✓ Complete | 100% |
| Media Converter Backend | ⚠️ In Progress | 30% |
| File Upload System | ❌ Not Started | 0% |
| Stripe Integration | ❌ Not Started | 0% |
| Analytics Dashboard | ⚠️ Basic | 50% |

### What's Working vs What Needs Work

**✓ Working Perfectly:**
- User authentication (email/password)
- Plan switching (Free/Starter/Creator)
- Database with Row Level Security
- Dashboard with basic stats
- Page editor (create/edit pages)
- Public page viewing
- Download quota checking
- Beautiful, responsive UI

**⚠️ Needs Implementation:**
- Real media conversion (currently returns mock data)
- File upload functionality
- Watermarking system
- Stripe payment integration with proper 3 tiers plans and upgrade plan as well 

### Architecture Decision: Node.js Backend

**Important Update:** The original plan was to use Supabase Edge Functions (Deno runtime) for the converter backend. However, after analysis, we identified critical limitations:

**Why Supabase Edge Functions Won't Work:**
1. **Deno Runtime Limitations**: Cannot run FFmpeg binary (required for video/audio conversion)
2. **Native Module Issues**: ytdl-core and fluent-ffmpeg require Node.js native modules
3. **No Watermarking Support**: FFmpeg is essential for audio watermarking (Free plan requirement)
4. **Limited Processing Power**: Edge functions have strict timeout and memory limits

**New Approach: Node.js Backend**
- **Architecture**: React Frontend → Node.js/Express Backend → PostgreSQL (Supabase)
- **Benefits**:
  - Full FFmpeg support for conversions
  - Native ytdl-core integration
  - Complete control over watermarking
  - Flexible deployment options
  - Better performance for large files
- **Database**: Keep PostgreSQL (Supabase) - 70% of existing code preserved
- **Storage**: Continue using Supabase Storage for file hosting
- **Auth**: Keep Supabase Auth - just verify JWT tokens in Node.js middleware

**What This Means:**
- Need to build a separate Node.js backend (3-4 days)
- Frontend already 95% complete - minimal changes needed
- Database and auth remain unchanged
- Overall project completion: Still 7-9 days

---

## 2. Code Review Findings

#### Authentication
**Files:** `AuthContext.tsx`, `AuthModal.tsx`

- ✓ Email/password signup and login
- ✓ Session management with JWT
- ✓ Automatic profile creation
- ✓ No email confirmation required (dev mode)
- ✓ Error handling with user-friendly messages
- ✓ Sign out functionality

#### User Profiles
**Database:** `user_profiles` table

- ✓ Extends auth.users
- ✓ Stores plan_type, downloads_used, downloads_limit
- ✓ Stripe IDs ready for integration
- ✓ Terms acceptance tracking

#### Plan System
**File:** `SubscriptionManager.tsx`

- ✓ Three plan tiers: Free (€0), Starter (€4), Creator (€7)
- ✓ Instant plan switching (test mode)
- ✓ Quota tracking and management
- ✓ Visual plan comparison cards
- ✓ Quota reset on plan change

**Plan Details:**
```
Free:    0 downloads, watermarked files, ads enabled
Starter: 3 downloads/month, metadata watermark, no ads
Creator: 20 downloads/month, clean files, no ads, priority support
```

#### Database Schema
**File:** `supabase/migrations/20251229044344_create_linkiz_schema.sql`

**Tables Created:**
- `user_profiles` - User data with plan and quota info
- `linkiz_pages` - Multi-link pages
- `links` - Individual links within pages
- `downloads` - Download history and tracking
- `subscriptions` - Stripe subscription data

**Security:**
- ✓ Row Level Security (RLS) enabled on all tables
- ✓ Users can only access their own data
- ✓ Public can view published pages
- ✓ Comprehensive policies

#### Dashboard
**File:** `Dashboard.tsx`

- ✓ Stats display (pages, links, views, downloads)
- ✓ Plan information card
- ✓ Quota indicator
- ✓ Quick actions
- ✓ Responsive design

#### Page Editor
**File:** `PageEditor.tsx`

- ✓ Create/edit pages
- ✓ Custom slug generation
- ✓ Theme color picker
- ✓ Add/remove links
- ✓ Icon selection (Music, YouTube, Instagram, etc.)
- ✓ Link positioning (moveUp/moveDown)
- ✓ Publish/unpublish toggle
- ⚠️ Visual drag & drop (uses buttons, not DnD library)
- ⚠️ File upload (currently manual URL input)

#### Public Pages
**File:** `PublicPage.tsx`

- ✓ Beautiful page rendering
- ✓ Theme color application
- ✓ Click tracking
- ✓ Download modal integration
- ✓ Anonymous access
- ✓ View counter

#### Download Modal
**File:** `DownloadModal.tsx`

- ✓ Quota checking
- ✓ Upgrade prompts
- ✓ Plan-based restrictions
- ✓ Download counter increment
- ✓ User-friendly messages

#### Converter Frontend
**File:** `Converter.tsx`

- ✓ Beautiful, modern UI
- ✓ URL input with validation
- ✓ Format selection (MP3/MP4)
- ✓ Platform icons
- ✓ Progress indicators
- ✓ Error handling
- ✓ Success state with download

#### Media Converter Backend
**File:** `supabase/functions/converter/index.ts`

**✓ What's Working:**
- CORS headers configured
- URL validation for all platforms
- Format parameter handling
- Mock response generation

**❌ What's Missing:**
- No ytdl-core or youtube-dl-exec integration
- No actual video/audio extraction
- No FFmpeg conversion
- No file storage in Supabase Storage
- No signed URL generation
- Returns fake download links

**Required Implementation:**
1. Install ytdl-core in edge function
2. Extract video/audio from YouTube/SoundCloud
3. Use FFmpeg for format conversion
4. Store in Supabase Storage temporarily
5. Generate signed URL (24h expiry)
6. Return real download link

#### Link Page System
**Issues:**
- Visual drag & drop could be enhanced
- File upload component not built
- Real-time preview could be improved

#### Analytics
**What's Working:**
- Basic stat counters

**What's Missing:**
- Charts/graphs (Chart.js or Recharts)
- Time-based filtering
- Per-link analytics
- Export functionality

#### File Upload System
**Required Components:**

1. **Supabase Storage Setup**
   - Create "user-files" bucket
   - Configure public/private access
   - Set file size limits (100MB)
   - Set file type restrictions (MP3, WAV, ZIP)

2. **Upload Component**
   - File selection UI
   - Drag & drop support
   - Progress bar
   - Size validation
   - Type validation
   - Error handling

3. **Integration with Page Editor**
   - Add upload button to link editor
   - Store file URL in links table
   - Display uploaded files
   - Delete functionality

**Estimated Time:** 2-3 days

#### Watermarking System (0%)
**Plan-Based Logic:**

**Free Plan:**
- Audible watermark ("Downloaded from Linkiz")
- Metadata watermark in file
- Implementation: FFmpeg audio overlay + music-metadata

**Starter Plan:**
- Invisible metadata watermark only
- No audible watermark
- Implementation: music-metadata library

**Creator Plan:**
- Clean files, no watermark
- Original file served directly

**Required Packages:**
- `music-metadata` - MP3 metadata editing
- `fluent-ffmpeg` - Audio processing
- `file-type` - File type detection

**Estimated Time:** 1-2 days

#### Stripe Payment Integration (0%)
**Current Status:** Test mode working (instant plan switching without payment)

**Required for Production:**

1. **Stripe Setup**
   - Create Stripe account
   - Add products: Starter (€4/mo), Creator (€7/mo)
   - Get API keys

2. **Edge Functions**
   - `create-checkout` - Generate Stripe session
   - `stripe-webhook` - Handle subscription events

3. **Frontend Changes**
   - Replace `handleChangePlan` with Stripe checkout
   - Add customer portal link
   - Handle success/cancel redirects

4. **Webhook Events**
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

**Estimated Time:** 2-3 days

**Note:** Client said test mode is acceptable for now, so this can be Phase 4 or post-delivery.

---

## 3. Technology Stack & Architecture

### Current Technology Stack

| Layer | Technology | Version | Status |
|-------|-----------|---------|--------|
| Frontend | React | 18.3.1 | ✓ Working |
| Build Tool | Vite | 5.4.2 | ✓ Working |
| Language | TypeScript | 5.5.3 | ✓ Working |
| Styling | Tailwind CSS | 3.4.1 | ✓ Working |
| Icons | Lucide React | 0.344.0 | ✓ Working |
| Backend | Node.js + Express | 20.x | ⚠️ To be built |
| Database | PostgreSQL | Via Supabase | ✓ Working |
| Authentication | Supabase Auth | Cloud | ✓ Working |
| Storage | Supabase Storage | Cloud | ⚠️ Not configured |
| Media Processing | FFmpeg + ytdl-core | Latest | ⚠️ To be integrated |

### Project Structure

```
linkiz-music/
├── frontend/                # React Frontend
│   ├── src/
│   │   ├── components/           # React components
│   │   │   ├── AuthModal.tsx    # Authentication UI
│   │   │   ├── Dashboard.tsx    # User dashboard
│   │   │   ├── PageEditor.tsx   # Page creation/editing
│   │   │   ├── PublicPage.tsx   # Public page view
│   │   │   ├── DownloadModal.tsx # Download flow
│   │   │   ├── SubscriptionManager.tsx # Plan management
│   │   │   ├── Converter.tsx    # Media converter UI
│   │   │   ├── Header.tsx       # Navigation
│   │   │   ├── Footer.tsx       # Footer
│   │   │   └── LandingPage.tsx  # Home page
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx  # Auth state management
│   │   ├── lib/
│   │   │   ├── supabase.ts      # Supabase client
│   │   │   ├── database.types.ts # TypeScript types
│   │   │   └── downloadService.ts # Download logic
│   │   └── App.tsx              # Main app component
│   ├── public/                  # Static assets
│   └── package.json            # Frontend dependencies
│
├── backend/                 # Node.js Backend (NEW)
│   ├── src/
│   │   ├── routes/
│   │   │   ├── converter.ts    # Conversion endpoints
│   │   │   ├── upload.ts       # File upload endpoints
│   │   │   └── watermark.ts    # Watermarking endpoints
│   │   ├── services/
│   │   │   ├── youtubeService.ts   # YouTube download logic
│   │   │   ├── ffmpegService.ts    # FFmpeg conversion
│   │   │   ├── storageService.ts   # Supabase Storage
│   │   │   └── watermarkService.ts # Watermarking logic
│   │   ├── middleware/
│   │   │   ├── auth.ts         # Authentication middleware
│   │   │   ├── quota.ts        # Download quota check
│   │   │   └── validation.ts   # Input validation
│   │   ├── utils/
│   │   │   ├── supabase.ts     # Supabase client
│   │   │   └── helpers.ts      # Helper functions
│   │   └── server.ts           # Express server setup
│   ├── temp/                   # Temporary conversion files
│   └── package.json            # Backend dependencies
│
└── supabase/
    └── migrations/          # Database migrations
```

### Architecture Diagram

```
┌─────────────────────────────────────┐
│     Frontend (React + Vite)         │
│  - Components, Routing, UI          │
│  - Hosted on Vercel                 │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│   Node.js Backend (Express.js)      │
│  - Conversion API (/api/convert)    │
│  - Upload API (/api/upload)         │
│  - Watermarking logic               │
│  - ytdl-core + FFmpeg               │
│  - Hosted on VPS/Railway/Render     │
└─────────┬───────────────────┬───────┘
          │                   │
          ▼                   ▼
┌───────────────────┐  ┌─────────────────────┐
│ Supabase Services │  │  External Services  │
│ - Authentication  │  │ - YouTube API       │
│ - PostgreSQL DB   │  │ - SoundCloud API    │
│ - Storage Buckets │  │ - Stripe (optional) │
│ - Row Level Sec.  │  │                     │
└───────────────────┘  └─────────────────────┘
```

### Code Quality Assessment

**✓ Strengths:**
- Clean component separation
- Proper TypeScript types
- Context-based state management
- Supabase client properly configured
- Environment variables setup
- Consistent naming conventions
- Good error handling

**⚠️ Areas for Improvement:**
- Add more comments in complex logic
- Create reusable UI components
- Add unit tests
- Implement loading skeleton components
- Add error boundary components

---

## 4. Features Already Built (Bolt.new)

### Authentication System (100% Complete)

**Files:** `AuthContext.tsx`, `AuthModal.tsx`

**Implemented Features:**
- Email + Password signup and login
- Session management with JWT
- Automatic profile creation on signup
- Profile refresh on auth state change
- Sign out functionality
- No email confirmation required (dev mode)
- Error handling with user-friendly French messages

**Code Quality:**
- Clean context pattern
- Proper TypeScript types
- Error handling with translated messages
- Automatic redirect on auth state changes

**How It Works:**
```typescript
// User signs up
const { error } = await signUpWithPassword(email, password);

// Profile automatically created in user_profiles table
// Session established
// User redirected to dashboard
```

### Plan Management System (100% Complete)

**File:** `SubscriptionManager.tsx`

**Features:**
- Three plan tiers: Free, Starter (€4), Creator (€7)
- Instant plan switching (test mode)
- Quota tracking (downloads_used / download_limit)
- Visual plan comparison cards
- Current plan indicator
- Quota reset on plan change

**Plan Comparison:**

| Feature | Free | Starter | Creator |
|---------|------|---------|---------|
| Price | €0 | €4/mo | €7/mo |
| Public Pages | Unlimited | Unlimited | Unlimited |
| Links | Unlimited | Unlimited | Unlimited |
| Downloads | 0 (blocked) | 3/month | 20/month |
| Watermark | Audio + Metadata | Metadata only | None |
| Ads | Yes | No | No |
| Support | - | Email | Priority |

**Test Mode:**
Users can switch plans instantly without payment for testing. Ready for Stripe integration when needed.

**Plan Switching Logic:**
```typescript
const handleChangePlan = async (planType: PlanType) => {
  const downloadLimits = {
    free: 0,
    starter: 3,
    creator: 20
  };

  await supabase
    .from('user_profiles')
    .update({
      plan_type: planType,
      download_limit: downloadLimits[planType],
      downloads_used: 0  // Reset quota
    })
    .eq('id', user.id);
};
```

### Database Schema (100% Complete)

**File:** `supabase/migrations/20251229044344_create_linkiz_schema.sql`

#### Tables Created

**1. user_profiles**
```sql
CREATE TABLE user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text NOT NULL,
  full_name text DEFAULT '',
  avatar_url text DEFAULT '',
  plan_type text DEFAULT 'free',
  downloads_used integer DEFAULT 0,
  downloads_limit integer DEFAULT 0,
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text,
  created_at timestamptz DEFAULT now()
);
```

**2. linkiz_pages**
```sql
CREATE TABLE linkiz_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  avatar_url text DEFAULT '',
  theme_color text DEFAULT '#3b82f6',
  is_published boolean DEFAULT true,
  view_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
```

**3. links**
```sql
CREATE TABLE links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid REFERENCES linkiz_pages(id),
  title text NOT NULL,
  url text NOT NULL,
  icon text DEFAULT 'link',
  file_url text,
  is_downloadable boolean DEFAULT false,
  download_count integer DEFAULT 0,
  position integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
```

**4. downloads**
```sql
CREATE TABLE downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id),
  link_id uuid REFERENCES links(id),
  page_id uuid REFERENCES linkiz_pages(id),
  file_name text NOT NULL,
  watermarked boolean DEFAULT false,
  plan_type_at_download text NOT NULL,
  created_at timestamptz DEFAULT now()
);
```

**5. subscriptions**
```sql
CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id),
  stripe_subscription_id text UNIQUE NOT NULL,
  stripe_customer_id text NOT NULL,
  plan_type text NOT NULL,
  status text NOT NULL,
  current_period_start timestamptz NOT NULL,
  current_period_end timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);
```

#### Row Level Security (RLS)

**Security Features:**
- ✓ RLS enabled on all tables
- ✓ Users can only access their own data
- ✓ Public can view published pages only
- ✓ Comprehensive policies for SELECT, INSERT, UPDATE, DELETE

**Example Policy:**
```sql
CREATE POLICY "Users can view own pages"
  ON linkiz_pages FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Public can view published pages"
  ON linkiz_pages FOR SELECT
  TO anon
  USING (is_published = true);
```

### UI Components (95% Complete)

**Dashboard** (`Dashboard.tsx`)
- Stats display (pages, links, views, downloads)
- Plan information card with gradient
- Quota indicator with progress bar
- Quick actions
- Responsive design

**Page Editor** (`PageEditor.tsx`)
- Create/edit pages
- Custom slug generation
- Theme color picker
- Add/remove links
- Icon selection
- Link positioning
- Publish toggle

**Public Pages** (`PublicPage.tsx`)
- Beautiful page rendering
- Theme color application
- Click tracking
- Download modal integration
- Anonymous access
- View counter

**Download Modal** (`DownloadModal.tsx`)
- Quota checking
- Upgrade prompts
- Plan-based restrictions
- Download counter increment
- User-friendly messages

**Converter** (`Converter.tsx`)
- Beautiful UI
- URL validation
- Format selection
- Progress indicators
- Error handling

---

## 5. Features Partially Complete

### Media Converter (30% Complete)

#### Frontend (100% Complete)
**File:** `src/components/Converter.tsx`

**Features:**
- Beautiful, modern UI design
- URL input with validation
- Format selection (MP3 320kbps, MP4 HD, MP4 SD)
- Platform icons (YouTube, Instagram, TikTok, Facebook, etc.)
- Progress indicators
- Error handling with user-friendly messages
- Success state with download button
- "New conversion" button to reset

**Supported Platforms UI:**
- YouTube (youtube.com, youtu.be, m.youtube.com)
- Instagram (instagram.com)
- Facebook (facebook.com, fb.watch)
- TikTok (tiktok.com, vm.tiktok.com)
- Vimeo (vimeo.com)
- Dailymotion (dailymotion.com)
- SoundCloud (soundcloud.com)

#### Backend (0% Complete - Node.js Backend)
**New Approach:** Node.js + Express backend

**⚠️ Current Status:**
- Previous Supabase Edge Function approach abandoned
- Reason: Deno runtime limitations with FFmpeg and native modules
- New approach: Dedicated Node.js backend with full control

**❌ What Needs to Be Built:**
- Node.js Express server setup
- ytdl-core integration for YouTube extraction
- FFmpeg integration for format conversion
- Supabase Storage integration for file hosting
- Signed URL generation for downloads
- API endpoints: `/api/convert`, `/api/upload`, `/api/watermark`
- Authentication middleware (verify Supabase JWT)
- Download quota middleware
- Error handling and logging

**Required Implementation Steps (Node.js Backend):**

1. **Setup Node.js Backend Project**
```bash
mkdir backend
cd backend
npm init -y
npm install express cors ytdl-core fluent-ffmpeg @supabase/supabase-js
npm install -D typescript @types/node @types/express ts-node
```

2. **Implement YouTube Extraction (Node.js)**
```typescript
import ytdl from 'ytdl-core';

const info = await ytdl.getInfo(url);
const format = ytdl.chooseFormat(info.formats, {
  quality: 'highestaudio',
  filter: 'audioonly'
});

// Download stream to temp file
const stream = ytdl(url, { format: format });
```

3. **FFmpeg Conversion (Node.js)**
```typescript
import ffmpeg from 'fluent-ffmpeg';

// Convert to desired format
await new Promise((resolve, reject) => {
  ffmpeg(inputPath)
    .audioCodec('libmp3lame')
    .audioBitrate(320)
    .toFormat('mp3')
    .save(outputPath)
    .on('end', resolve)
    .on('error', reject);
});
```

4. **Upload to Supabase Storage**
```typescript
const { data, error } = await supabase.storage
  .from('conversions')
  .upload(`${userId}/${filename}`, fs.createReadStream(filePath), {
    contentType: 'audio/mpeg',
    cacheControl: '86400' // 24 hours
  });
```

5. **Generate Signed URL**
```typescript
const { data } = await supabase.storage
  .from('conversions')
  .createSignedUrl(filePath, 86400); // 24 hours

// Cleanup temp files
fs.unlinkSync(inputPath);
fs.unlinkSync(outputPath);

return {
  downloadUrl: data.signedUrl,
  filename,
  fileSize,
  duration
};
```

### Link Page System (90% Complete)

**Page Editor Issues:**
- Visual drag & drop uses buttons (moveUp/moveDown) instead of DnD library
- File upload component not built (currently manual URL input)
- Real-time preview could be enhanced

**What Works Well:**
- Create/edit pages ✓
- Slug generation ✓
- Theme customization ✓
- Add/remove links ✓
- Icon selection ✓
- Publish/unpublish ✓

### Analytics (50% Complete)

**What's Working:**
- Basic stat counters (pages, links, views, downloads)
- Display in dashboard
- Real-time updates

**What's Missing:**
- Charts/graphs visualization
- Time-based filtering (last 7 days, 30 days, etc.)
- Per-link analytics breakdown
- Export functionality (CSV, PDF)
- Geographic data (optional)

**Recommended Libraries:**
- Chart.js or Recharts for graphs
- date-fns for date manipulation
- papaparse for CSV export

---

## 6. Features Not Started

### File Upload System (0% Complete)

**Estimated Time:** 2-3 days

#### Required Components

**1. Supabase Storage Setup**

Tasks:
- Create "user-files" bucket in Supabase dashboard
- Configure bucket settings:
  - Public: true (for direct file access)
  - File size limit: 100MB
  - Allowed MIME types: `audio/mpeg`, `audio/wav`, `application/zip`
  - No auto-delete (files persist until user removes)

**2. Upload Component**

Create `src/components/FileUpload.tsx`:

```typescript
interface FileUploadProps {
  onUploadComplete: (fileUrl: string, fileInfo: FileInfo) => void;
}

export function FileUpload({ onUploadComplete }: FileUploadProps) {
  // File selection
  // Drag & drop support
  // Progress bar
  // Size validation (max 100MB)
  // Type validation (MP3, WAV, ZIP only)
  // Error handling
}
```

**3. Integration with Page Editor**

Modify `PageEditor.tsx`:
- Add "Upload File" button to link editor
- Show FileUpload component in modal
- Store file URL in `links.file_url`
- Display uploaded files with preview
- Add delete file functionality

**4. File Validation Logic**

```typescript
const validateFile = (file: File) => {
  // Check file size
  if (file.size > 100 * 1024 * 1024) {
    throw new Error('File too large (max 100MB)');
  }

  // Check file type
  const allowedTypes = ['audio/mpeg', 'audio/wav', 'application/zip'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type');
  }

  return true;
};
```

**5. Upload Logic**

```typescript
const uploadFile = async (file: File) => {
  const filename = `${userId}/${Date.now()}-${file.name}`;

  const { data, error } = await supabase.storage
    .from('user-files')
    .upload(filename, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) throw error;

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('user-files')
    .getPublicUrl(filename);

  return publicUrl;
};
```

### Watermarking System (0% Complete)

**Estimated Time:** 1-2 days

#### Plan-Based Watermarking Logic

**Free Plan:**
- Audible watermark: "Downloaded from Linkiz" at beginning/end
- Metadata watermark in file tags
- Implementation: FFmpeg audio overlay + music-metadata

**Starter Plan:**
- Invisible metadata watermark only
- Adds custom comment field in MP3 tags
- No audible watermark
- Implementation: music-metadata library only

**Creator Plan:**
- Clean files, no watermark at all
- Original file served directly
- Premium experience

#### Required Packages

```bash
npm install music-metadata      # MP3 metadata editing
npm install fluent-ffmpeg        # Audio processing
npm install file-type            # File type detection
```

#### Implementation Example

**Metadata Watermarking (Starter Plan):**

```typescript
import * as mm from 'music-metadata';
import { writeFile } from 'fs/promises';

async function addMetadataWatermark(filePath: string) {
  const metadata = await mm.parseFile(filePath);

  // Add custom comment
  const watermarkedMetadata = {
    ...metadata.common,
    comment: ['Downloaded from Linkiz - Starter Plan']
  };

  // Write back to file
  // Use music-metadata-browser or ID3 library
}
```

**Audio Watermarking (Free Plan):**

```typescript
import ffmpeg from 'fluent-ffmpeg';

async function addAudioWatermark(inputPath: string, outputPath: string) {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(inputPath)
      .input('watermark.mp3')  // Pre-recorded "Downloaded from Linkiz"
      .complexFilter([
        '[0:a][1:a]concat=n=2:v=0:a=1[out]'  // Concatenate at beginning
      ])
      .outputOptions('-map', '[out]')
      .save(outputPath)
      .on('end', resolve)
      .on('error', reject);
  });
}
```

#### Service Function

Create `src/lib/watermarkService.ts`:

```typescript
export async function applyWatermark(
  filePath: string,
  planType: 'free' | 'starter' | 'creator'
): Promise<string> {
  switch (planType) {
    case 'free':
      // Apply both audio and metadata watermark
      const audioWatermarked = await addAudioWatermark(filePath);
      return await addMetadataWatermark(audioWatermarked);

    case 'starter':
      // Apply metadata watermark only
      return await addMetadataWatermark(filePath);

    case 'creator':
      // No watermark, return original
      return filePath;
  }
}
```

### Stripe Payment Integration (0% Complete)

**Estimated Time:** 2-3 days  
**Status:** OPTIONAL - Test mode is working and acceptable for now

#### Current Test Mode

Users can switch plans instantly:
- No payment required
- Instant quota updates
- Perfect for development/testing

#### Required for Production

**1. Stripe Setup**

Tasks:
- Create Stripe account at https://stripe.com
- Create two products:
  - Starter: €4/month
  - Creator: €7/month
- Get API keys:
  - Publishable key (pk_live_...)
  - Secret key (sk_live_...)
  - Webhook secret (whsec_...)

**2. Environment Variables**

Add to `.env`:
```env
VITE_STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**3. Edge Function: Create Checkout**

Create `supabase/functions/create-checkout/index.ts`:

```typescript
import Stripe from 'npm:stripe@14';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!);

Deno.serve(async (req) => {
  const { priceId, userId } = await req.json();

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/dashboard?success=true`,
    cancel_url: `${origin}/dashboard?canceled=true`,
    client_reference_id: userId,
  });

  return new Response(JSON.stringify({ url: session.url }));
});
```

**4. Edge Function: Webhook Handler**

Create `supabase/functions/stripe-webhook/index.ts`:

```typescript
import Stripe from 'npm:stripe@14';
import { createClient } from 'npm:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature')!;
  const body = await req.text();

  const event = stripe.webhooks.constructEvent(
    body, signature, webhookSecret
  );

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    // Update user profile
    await supabase
      .from('user_profiles')
      .update({
        plan_type: getPlanFromPrice(session.amount_total),
        download_limit: getLimitFromPrice(session.amount_total),
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription
      })
      .eq('id', session.client_reference_id);
  }

  return new Response(JSON.stringify({ received: true }));
});
```

**5. Update Frontend**

Modify `SubscriptionManager.tsx`:

```typescript
const handleUpgrade = async (priceId: string) => {
  const response = await fetch(
    `${supabaseUrl}/functions/v1/create-checkout`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session?.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ priceId, userId: user.id })
    }
  );

  const { url } = await response.json();
  window.location.href = url;  // Redirect to Stripe checkout
};
```

**6. Webhook Events to Handle**

- `checkout.session.completed` - Initial payment success
- `customer.subscription.updated` - Plan change
- `customer.subscription.deleted` - Cancellation
- `invoice.payment_failed` - Payment failure

---

## 7. Phase-by-Phase Development Plan

### Timeline Overview

| Phase | Duration | Priority | Description |
|-------|----------|----------|-------------|
| Phase 1 | 3-4 days | **HIGHEST** | Media Converter Backend |
| Phase 2 | 2-3 days | **HIGH** | File Upload & Watermarking |
| Phase 3 | 1-2 days | **MEDIUM** | Testing & Polish |
| Phase 4 | 2-3 days | **LOW** | Stripe Integration (Optional) |

**Total: 7-9 days (excluding optional Phase 4)**

---

### PHASE 1: Media Converter Backend (Days 1-4)

**Priority:** HIGHEST (Client's main requirement)
**Duration:** 3-4 days
**Approach:** Node.js + Express Backend
**Files to Create:** Complete `backend/` directory structure

#### Day 1: Node.js Backend Setup & YouTube Integration

**Morning:**
```bash
□ Setup Node.js Backend Project
  • Create backend/ directory
  • Initialize npm project
  • Install dependencies: express, cors, ytdl-core, fluent-ffmpeg
  • Install TypeScript and types
  • Create basic Express server structure
  • Setup environment variables (.env file)

□ Project Structure Setup
  • Create src/routes/ directory
  • Create src/services/ directory
  • Create src/middleware/ directory
  • Create src/utils/ directory
  • Create temp/ directory for conversions
  • Setup TypeScript configuration
```

**Afternoon:**
```bash
□ Implement YouTube Service
  • Create youtubeService.ts
  • Implement getVideoInfo() function
  • Implement downloadVideo() function
  • Handle different YouTube URL formats
  • Test with various YouTube videos

□ Create Conversion API Endpoint
  • Create routes/converter.ts
  • Setup POST /api/convert endpoint
  • Implement basic URL validation
  • Test endpoint with Postman/curl

□ Error Handling
  • Invalid URL handling
  • Private video detection
  • Age-restricted content handling
```

**Success Criteria:**
- ✓ Node.js server running on port 3000
- ✓ Can extract YouTube video metadata
- ✓ Can download video stream to temp file
- ✓ API endpoint responds correctly

#### Day 2: FFmpeg Integration & Format Conversion

**Morning:**
```bash
□ Install FFmpeg System Binary
  • Install FFmpeg on development machine
  • Verify FFmpeg installation: ffmpeg -version
  • Create ffmpegService.ts
  • Test FFmpeg availability in Node.js

□ Implement MP3 Conversion
  • Create convertToMP3() function in ffmpegService.ts
  • Extract audio from video
  • Convert to MP3 320kbps
  • Test with sample videos
  • Implement progress tracking
  • Optimize conversion speed
```

**Afternoon:**
```bash
□ Implement Video Conversions
  • Create convertToMP4HD() function (1080p)
  • Create convertToMP4SD() function (720p)
  • Maintain video quality
  • Optimize file sizes
  • Handle audio/video sync

□ Complete Conversion Flow
  • Download → Convert → Save to temp/
  • Add file cleanup logic (delete after upload)
  • Test all formats end-to-end

□ Test All Formats
  • Long videos (>10 minutes)
  • Short videos (<1 minute)
  • Music videos
  • Podcasts
  • Different resolutions
```

**Success Criteria:**
- ✓ FFmpeg working in Node.js environment
- ✓ MP3 320kbps conversion working
- ✓ MP4 HD 1080p conversion working
- ✓ MP4 SD 720p conversion working
- ✓ Temp files cleaned up properly

#### Day 3: Supabase Storage Integration & Complete Flow

**Morning:**
```bash
□ Supabase Storage Setup
  • Create "conversions" bucket in Supabase dashboard
  • Configure public access
  • Set file size limits (500MB)
  • Configure allowed MIME types
  • Test bucket permissions

□ Create Storage Service
  • Create storageService.ts
  • Implement uploadToStorage() function
  • Implement generateSignedUrl() function
  • Setup Supabase client with service role key
  • Handle upload errors with retry logic
```

**Afternoon:**
```bash
□ Complete Conversion Flow
  • Integrate all services in converter route
  • Full flow: Request → Download → Convert → Upload → Signed URL
  • Delete temp files after successful upload
  • Implement proper error handling at each step
  • Add detailed logging

□ Authentication & Quota Middleware
  • Create auth.ts middleware
  • Verify Supabase JWT from frontend
  • Create quota.ts middleware
  • Check downloads_used vs downloads_limit
  • Block if quota exceeded

□ Integration Testing
  • Test complete flow with real YouTube URLs
  • Test different formats (MP3, MP4 HD, MP4 SD)
  • Measure conversion times
  • Verify signed URLs work
  • Test quota enforcement
```

**Success Criteria:**
- ✓ Files uploaded to Supabase Storage successfully
- ✓ Signed URLs generated with 24h expiry
- ✓ Downloads work from generated URLs
- ✓ Temp files cleaned up after upload
- ✓ Authentication middleware working
- ✓ Quota system integrated

#### Day 4: Frontend Integration, Testing & Deployment

**Morning:**
```bash
□ Update Frontend to Use Node.js API
  • Update Converter.tsx
  • Change API endpoint from Supabase Edge Function to Node.js backend
  • Update fetch URL: http://localhost:4004/api/convert
  • Pass Supabase JWT in Authorization header
  • Test frontend → backend integration

□ Add SoundCloud Support (if time permits)
  • Research SoundCloud download methods
  • Implement in youtubeService.ts
  • Test with various tracks

□ CORS Configuration
  • Configure CORS in Express to allow frontend origin
  • Test cross-origin requests
```

**Afternoon:**
```bash
□ Comprehensive Testing
  • Test YouTube → MP3 320kbps
  • Test YouTube → MP4 HD 1080p
  • Test YouTube → MP4 SD 720p
  • Test SoundCloud → MP3
  • Test invalid URLs
  • Test quota enforcement
  • Test error scenarios
  • Edge cases (very long videos, private videos)

□ Performance Optimization
  • Measure average conversion times
  • Optimize FFmpeg parameters
  • Implement conversion queue (if needed)
  • Add progress tracking

□ Backend Deployment Preparation
  • Create Dockerfile (optional)
  • Update .env.example with required variables
  • Document deployment steps
  • Choose hosting: Railway, Render, or VPS

□ Documentation
  • Document API endpoints
  • Document error codes
  • Create BACKEND_API.md
  • Update README.md
```

**Success Criteria:**
- ✓ Frontend successfully communicates with Node.js backend
- ✓ YouTube downloads working perfectly
- ✓ All formats functional (MP3, MP4 HD, MP4 SD)
- ✓ Proper error handling and user feedback
- ✓ Quota system integrated
- ✓ Good performance (<60s for average 5min video)
- ✓ Ready for deployment

#### Technical Details for Phase 1 (Node.js Backend)

**Required Packages (Backend):**
```json
{
  "express": "^4.18.2",
  "cors": "^2.8.5",
  "ytdl-core": "^4.11.5",
  "fluent-ffmpeg": "^2.1.2",
  "@supabase/supabase-js": "^2.39.0",
  "dotenv": "^16.3.1",
  "express-rate-limit": "^7.1.5",
  "typescript": "^5.3.3",
  "@types/node": "^20.10.6",
  "@types/express": "^4.17.21",
  "@types/fluent-ffmpeg": "^2.1.24",
  "ts-node": "^10.9.2"
}
```

**Environment Variables (Backend .env):**
```env
# Server Configuration
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Supabase Configuration
SUPABASE_URL=https://nzdcqxazpwnagkfkpunx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key

# Optional
YOUTUBE_API_KEY=your-youtube-api-key
```

**Node.js Backend Structure:**
```typescript
// backend/src/server.ts

import express from 'express';
import cors from 'cors';
import converterRoutes from './routes/converter';

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

app.use('/api', converterRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
```

```typescript
// backend/src/routes/converter.ts

import express from 'express';
import { convertMedia } from '../services/youtubeService';
import { authMiddleware } from '../middleware/auth';
import { quotaMiddleware } from '../middleware/quota';

const router = express.Router();

router.post('/convert', authMiddleware, quotaMiddleware, async (req, res) => {
  // 1. Validate URL
  // 2. Download video using ytdl-core
  // 3. Convert with FFmpeg
  // 4. Upload to Supabase Storage
  // 5. Generate signed URL
  // 6. Cleanup temp files
  // 7. Return download link
});

export default router;
```

**Conversion Flow (Node.js Backend):**
```
Frontend (Converter.tsx)
    ↓
POST /api/convert
    ↓
Auth Middleware (Verify Supabase JWT)
    ↓
Quota Middleware (Check downloads_used)
    ↓
Validate URL
    ↓
Extract Video Info (ytdl-core)
    ↓
Download to temp/ (ytdl-core)
    ↓
Convert Format (FFmpeg → temp/)
    ↓
Upload to Supabase Storage
    ↓
Generate Signed URL (24h)
    ↓
Delete temp files
    ↓
Increment downloads_used
    ↓
Return JSON { downloadUrl, filename, ... }
    ↓
Frontend displays download button
    ↓
User clicks download
```

---

### PHASE 2: File Upload & Watermarking (Days 5-7)

**Priority:** HIGH (Core monetization feature)  
**Duration:** 2-3 days  
**Files to Create/Modify:** `FileUpload.tsx`, `PageEditor.tsx`, `watermarkService.ts`

#### Day 5: Storage & Upload Component

**Morning:**
```bash
□ Supabase Storage Setup
  • Create "user-files" bucket
  • Configure bucket settings:
    - Public: true
    - File size limit: 100MB
    - Allowed types: audio/mpeg, audio/wav, application/zip
  • Create RLS policies for user files
  • Test bucket permissions

□ Research Upload Libraries
  • Decide on approach (native or library)
  • Review Supabase upload documentation
  • Plan component structure
```

**Afternoon:**
```bash
□ Build FileUpload Component
  • Create src/components/FileUpload.tsx
  • File selection UI
  • Drag & drop support
  • Progress bar indicator
  • File preview (name, size, type)
  • Upload button

□ Implement File Validation
  • Size validation (max 100MB)
  • Type validation (MP3, WAV, ZIP)
  • Error messages
  • Client-side checks
```

**Success Criteria:**
- ✓ Can select files
- ✓ Drag & drop working
- ✓ Progress shown during upload
- ✓ Validation working correctly

#### Day 6: Integration & Basic Watermarking

**Morning:**
```bash
□ Integrate Upload into Page Editor
  • Add "Upload File" button in PageEditor.tsx
  • Show FileUpload modal
  • Store file URL in links.file_url
  • Update link with file information
  • Display uploaded files

□ Test Upload Flow
  • Upload MP3 file
  • Upload WAV file
  • Upload ZIP file
  • Verify files in storage
  • Verify URLs saved in database
```

**Afternoon:**
```bash
□ Install Watermarking Dependencies
  • npm install music-metadata
  • npm install file-type
  • Test packages locally

□ Implement Metadata Watermarking
  • Create src/lib/watermarkService.ts
  • Implement metadata watermark function
  • Add "Downloaded from Linkiz" comment
  • Test with MP3 files
```

**Success Criteria:**
- ✓ Upload integrated in page editor
- ✓ Files saved correctly
- ✓ Metadata watermark working (Starter plan)

#### Day 7: Plan-Based Logic & Testing

**Morning:**
```bash
□ Implement Plan-Based Watermarking
  • Free plan: Block downloads or add audio watermark
  • Starter plan: Metadata watermark only
  • Creator plan: No watermark

□ Test Watermarking Logic
  • Test as Free user
  • Test as Starter user
  • Test as Creator user
  • Verify correct watermark applied
```

**Afternoon:**
```bash
□ End-to-End Testing
  • Upload file from page editor
  • Publish page
  • Download as different plan users
  • Verify quota decrements
  • Verify download counter increments
  • Check watermarking applied correctly

□ Bug Fixes & Polish
  • Fix any issues found
  • Improve error messages
  • Add loading states
  • Optimize performance
```

**Success Criteria:**
- ✓ File upload working end-to-end
- ✓ Watermarking applied per plan
- ✓ Download quota system functional
- ✓ All edge cases handled

#### Technical Details for Phase 2

**FileUpload Component:**
```typescript
// src/components/FileUpload.tsx

interface FileUploadProps {
  onUploadComplete: (fileUrl: string, fileInfo: FileInfo) => void;
  maxSize?: number;  // Default 100MB
  allowedTypes?: string[];
}

export function FileUpload({
  onUploadComplete,
  maxSize = 100 * 1024 * 1024,
  allowedTypes = ['audio/mpeg', 'audio/wav', 'application/zip']
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleUpload = async (file: File) => {
    // Validate file
    // Upload to Supabase Storage
    // Return public URL
  };

  // UI implementation
}
```

**Watermark Service:**
```typescript
// src/lib/watermarkService.ts

export async function applyWatermark(
  file: File,
  planType: 'free' | 'starter' | 'creator'
): Promise<File> {
  switch (planType) {
    case 'free':
      // Add audio watermark (if time permits)
      // Add metadata watermark
      return watermarkedFile;

    case 'starter':
      // Add metadata watermark only
      return addMetadataWatermark(file);

    case 'creator':
      // No watermark
      return file;
  }
}
```

**Storage Structure:**
```
user-files/
  ├── {userId}/
  │   ├── {timestamp}-filename.mp3
  │   ├── {timestamp}-filename.wav
  │   └── {timestamp}-filename.zip
```

---

### PHASE 3: Testing & Polish (Days 8-9)

**Priority:** MEDIUM (Quality assurance)  
**Duration:** 1-2 days

#### Day 8: Comprehensive Testing

**Morning:**
```bash
□ End-to-End User Flows
  • Complete signup flow
  • Create page → Add links → Upload file → Publish
  • Access public page as visitor
  • Try to download (should prompt for login)
  • Login → Download (check quota)
  • Switch plan → Verify quota reset

□ Converter Testing
  • Test all platforms (YouTube, SoundCloud)
  • Test all formats (MP3, MP4 HD, MP4 SD)
  • Test invalid URLs
  • Test very long videos
  • Test short videos
  • Measure conversion times
```

**Afternoon:**
```bash
□ Edge Cases & Error Scenarios
  • Network failures during upload
  • Quota exceeded scenarios
  • Invalid file types
  • File size exceeds limit
  • Duplicate slug handling
  • Deleted files
  • Private videos

□ Mobile Testing
  • Test on mobile browsers
  • Check responsive design
  • Test touch interactions
  • Verify all features work on mobile
```

**Success Criteria:**
- ✓ All user flows working smoothly
- ✓ No critical bugs found
- ✓ Mobile experience is good
- ✓ Error handling is robust

#### Day 9: Bug Fixes & Documentation

**Morning:**
```bash
□ Bug Fixes
  • Fix all bugs found in Day 8 testing
  • Improve error messages
  • Add missing loading states
  • Polish UI/UX issues

□ Performance Optimization
  • Optimize page load times
  • Reduce image sizes
  • Lazy load components
  • Check database query performance
```

**Afternoon:**
```bash
□ Documentation
  • Update README.md with setup instructions
  • Document environment variables
  • Create deployment guide
  • Update FEATURES.md
  • Update CONVERTER_GUIDE.md
  • Add inline code comments

□ Final Testing
  • Run through all features one more time
  • Verify documentation is accurate
  • Check all links in docs
  • Test deployment process
```

**Success Criteria:**
- ✓ All known bugs fixed
- ✓ Performance is good
- ✓ Documentation is complete
- ✓ Ready for delivery

#### Testing Checklist

**Authentication:**
- [ ] Signup with email/password
- [ ] Login with credentials
- [ ] Logout
- [ ] Protected routes redirect
- [ ] Profile created automatically

**Plan Management:**
- [ ] Switch Free → Starter
- [ ] Switch Starter → Creator
- [ ] Switch Creator → Free
- [ ] Quota updates correctly
- [ ] downloads_used resets

**Media Converter:**
- [ ] YouTube video → MP3 320kbps
- [ ] YouTube video → MP4 HD 1080p
- [ ] YouTube video → MP4 SD 720p
- [ ] SoundCloud track → MP3
- [ ] Invalid URL error handling
- [ ] Download button works
- [ ] File downloads successfully

**Page Management:**
- [ ] Create new page
- [ ] Add multiple links
- [ ] Reorder links
- [ ] Choose different icons
- [ ] Set theme color
- [ ] Upload avatar
- [ ] Publish page
- [ ] Access public page via /slug
- [ ] View count increments

**File Upload & Downloads:**
- [ ] Upload MP3 file
- [ ] Upload WAV file
- [ ] Upload ZIP file
- [ ] File size validation (100MB)
- [ ] File type validation
- [ ] Free plan: downloads blocked
- [ ] Starter plan: 3 downloads, metadata watermark
- [ ] Creator plan: 20 downloads, clean files
- [ ] Quota counter decrements
- [ ] Upgrade modal when quota exceeded
- [ ] Download history tracked

**Mobile Responsiveness:**
- [ ] All pages load correctly on mobile
- [ ] Forms usable on mobile
- [ ] Buttons accessible
- [ ] Images scale properly
- [ ] Navigation works on mobile

---

### PHASE 4 (Optional): Stripe Integration

**Priority:** LOW (Test mode sufficient for now)  
**Duration:** 2-3 days  
**Status:** Can be done post-delivery

#### Overview

Client mentioned test mode is acceptable, so real payments can be implemented later if needed. Test mode allows:
- Instant plan switching
- Quota management
- All features work without payment

#### Implementation (if required)

**Day 1: Stripe Setup**
- Create Stripe account
- Add products (Starter €4, Creator €7)
- Get API keys
- Setup webhook endpoint

**Day 2: Edge Functions**
- Create checkout session function
- Implement webhook handler
- Test payment flows

**Day 3: Frontend Integration**
- Update SubscriptionManager
- Add customer portal
- Handle redirects
- Test end-to-end

---

## 8. Database Schema

### Complete Schema Reference

All tables are already created and functional.  
See: `supabase/migrations/20251229044344_create_linkiz_schema.sql`

### Tables Overview

#### 1. user_profiles

Extends auth.users with subscription and quota tracking.

```sql
CREATE TABLE user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text DEFAULT '',
  avatar_url text DEFAULT '',
  plan_type text DEFAULT 'free' CHECK (plan_type IN ('free', 'starter', 'creator')),
  downloads_used integer DEFAULT 0,
  downloads_limit integer DEFAULT 0,
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text,
  subscription_period_start timestamptz,
  subscription_period_end timestamptz,
  terms_accepted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Key Fields:**
- `plan_type`: Current subscription plan
- `downloads_used`: Number of downloads this month
- `downloads_limit`: Max downloads allowed per month
- `stripe_*`: Stripe integration fields (for future use)

**Indexes:**
- `idx_user_profiles_email` on email
- `idx_user_profiles_stripe_customer` on stripe_customer_id

#### 2. linkiz_pages

User-created multi-link pages.

```sql
CREATE TABLE linkiz_pages (
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
```

**Key Fields:**
- `slug`: Unique URL identifier (linkiz.app/slug)
- `theme_color`: Hex color for page styling
- `is_published`: Controls public visibility
- `view_count`: Tracks page visits

**Indexes:**
- `idx_linkiz_pages_user_id` on user_id
- `idx_linkiz_pages_slug` on slug (unique)

#### 3. links

Individual links within a page.

```sql
CREATE TABLE links (
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
```

**Key Fields:**
- `icon`: Icon type (music, youtube, instagram, etc.)
- `file_url`: URL to downloadable file (if is_downloadable)
- `position`: Order of links on page
- `download_count`: Track download popularity

**Indexes:**
- `idx_links_page_id` on page_id

#### 4. downloads

Download history and tracking.

```sql
CREATE TABLE downloads (
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
```

**Key Fields:**
- `watermarked`: Whether file was watermarked
- `plan_type_at_download`: User's plan when downloaded (for analytics)
- `ip_address`, `user_agent`: For abuse prevention

**Indexes:**
- `idx_downloads_user_id` on user_id
- `idx_downloads_link_id` on link_id

#### 5. subscriptions

Stripe subscription history.

```sql
CREATE TABLE subscriptions (
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
```

**Key Fields:**
- `stripe_subscription_id`: Stripe's subscription ID
- `status`: active, canceled, past_due, etc.
- `current_period_*`: Billing period tracking

**Indexes:**
- `idx_subscriptions_user_id` on user_id
- `idx_subscriptions_stripe_sub` on stripe_subscription_id

### Row Level Security (RLS)

All tables have RLS enabled with restrictive policies.

**Key Policies:**

**user_profiles:**
- Users can view and update their own profile
- Public can view basic profile info

**linkiz_pages:**
- Users can CRUD their own pages
- Public can view published pages only

**links:**
- Users can CRUD links on their own pages
- Public can view active links on published pages

**downloads:**
- Users can view their own downloads
- Page owners can view downloads of their content

**subscriptions:**
- Users can view their own subscriptions only

---

## 9. Technical Requirements

### NPM Packages

#### Already Installed

```json
{
  "@supabase/supabase-js": "^2.57.4",
  "lucide-react": "^0.344.0",
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "tailwindcss": "^3.4.1"
}
```

#### To Install for Phase 1 (Node.js Backend)

**Backend Dependencies:**
```bash
cd backend
npm install express cors ytdl-core fluent-ffmpeg @supabase/supabase-js dotenv express-rate-limit
npm install -D typescript @types/node @types/express @types/fluent-ffmpeg ts-node nodemon
```

**System Requirements:**
- FFmpeg must be installed on the server
  - macOS: `brew install ffmpeg`
  - Ubuntu: `sudo apt-get install ffmpeg`
  - Windows: Download from ffmpeg.org

**Frontend Updates:**
```bash
cd frontend
# No new dependencies needed, just update API endpoint
```

#### To Install for Phase 2 (File Processing)

```bash
npm install music-metadata    # Audio metadata editing
npm install file-type          # File type detection
npm install sharp              # Image processing (optional)
```

#### Optional Enhancements

```bash
npm install chart.js react-chartjs-2    # Analytics graphs
npm install @stripe/stripe-js stripe    # Payments
npm install react-beautiful-dnd         # Visual drag & drop
```

### Environment Variables

#### Frontend (.env)

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://nzdcqxazpwnagkfkpunx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Backend API URL
VITE_API_URL=http://localhost:4004  # Development
# VITE_API_URL=https://your-backend-domain.com  # Production

# Stripe (Optional - Phase 4)
VITE_STRIPE_PUBLIC_KEY=pk_live_...
```

#### Backend (.env)

```env
# Server Configuration
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Supabase Configuration (for database & storage)
SUPABASE_URL=https://nzdcqxazpwnagkfkpunx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key

# JWT Secret (for verifying Supabase JWT tokens)
SUPABASE_JWT_SECRET=your-jwt-secret

# Optional APIs
YOUTUBE_API_KEY=your-youtube-api-key
SOUNDCLOUD_CLIENT_ID=your-soundcloud-client-id

# Stripe (Optional - Phase 4)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Supabase Storage Buckets

#### Bucket 1: conversions

**Purpose:** Temporary storage for converter output

**Configuration:**
- Public: `true` (for download links)
- File size limit: `500MB`
- Auto-delete: After 24 hours
- Allowed types: `audio/*`, `video/*`

**Setup:**
```sql
-- In Supabase Dashboard > Storage
1. Create bucket "conversions"
2. Make it public
3. Add RLS policy for auto-delete
```

#### Bucket 2: user-files

**Purpose:** User-uploaded files for download

**Configuration:**
- Public: `true`
- File size limit: `100MB`
- Allowed types: `audio/mpeg`, `audio/wav`, `application/zip`
- No auto-delete (permanent until user removes)

**Setup:**
```sql
-- In Supabase Dashboard > Storage
1. Create bucket "user-files"
2. Make it public
3. Add RLS policies for user access
```

**RLS Policy Example:**
```sql
-- Allow users to upload to their own folder
CREATE POLICY "Users can upload own files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'user-files' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
```

### API Endpoints

#### Node.js Backend API

**Base URL (Development):** `http://localhost:4004`
**Base URL (Production):** `https://your-backend-domain.com`

**1. Converter Endpoint**
```
POST /api/convert

Headers:
  Content-Type: application/json
  Authorization: Bearer {supabase-jwt-token}

Body:
{
  "url": "https://youtube.com/watch?v=...",
  "format": "mp3-320" | "mp4-hd" | "mp4-sd",
  "userId": "<user-id>"
}

Response (Success):
{
  "success": true,
  "downloadUrl": "https://nzdcqxazpwnagkfkpunx.supabase.co/storage/v1/...",
  "filename": "Video_Title_320kbps.mp3",
  "fileSize": "5.24 MB",
  "duration": "3:24",
  "videoInfo": {
    "title": "Video Title",
    "author": "Channel Name",
    "thumbnail": "https://..."
  }
}

Response (Error):
{
  "success": false,
  "error": "Error message",
  "code": "INVALID_URL" | "QUOTA_EXCEEDED" | "CONVERSION_FAILED"
}
```

**2. File Upload Endpoint (Phase 2)**
```
POST /api/upload

Headers:
  Content-Type: multipart/form-data
  Authorization: Bearer {supabase-jwt-token}

Body:
  file: (binary)
  userId: string

Response:
{
  "success": true,
  "fileUrl": "https://...",
  "filename": "uploaded_file.mp3",
  "fileSize": "10 MB"
}
```

**3. Watermark Endpoint (Phase 2)**
```
POST /api/watermark

Headers:
  Content-Type: application/json
  Authorization: Bearer {supabase-jwt-token}

Body:
{
  "fileUrl": "https://...",
  "planType": "free" | "starter" | "creator",
  "userId": "<user-id>"
}

Response:
{
  "success": true,
  "watermarkedUrl": "https://..."
}
```

**4. Health Check Endpoint**
```
GET /api/health

Response:
{
  "status": "ok",
  "timestamp": "2026-01-10T12:00:00Z",
  "uptime": 12345
}
```

### External Services

| Service | Purpose | Cost | Setup Required |
|---------|---------|------|----------------|
| YouTube Data API | Video metadata | Free (10K/day) | Yes - API key |
| SoundCloud API | Track downloads | Free | Yes - Client ID |
| FFmpeg | Media conversion | Free (open source) | Binary installation |
| Stripe | Payments | 2.9% + €0.25 | Yes - Account setup |

### System Requirements

**Development:**
- Node.js 20.x or higher (for both frontend and backend)
- npm 9.x or higher
- FFmpeg installed locally (for backend development)
- Git
- Code editor (VS Code recommended)
- Postman or curl (for API testing)

**Production:**
- Vercel account (frontend hosting)
- Railway/Render/VPS (backend hosting with Node.js support)
- Supabase project (database & storage - already setup)
- FFmpeg installed on production server
- Domain (optional)

---

## 10. Testing Strategy

### Testing Levels

1. **Unit Testing** - Individual functions (optional for this project)
2. **Integration Testing** - Component interactions
3. **End-to-End Testing** - Complete user flows (primary focus)
4. **Manual Testing** - UI/UX verification

### Critical Test Scenarios

| Feature | Test Scenario | Expected Result |
|---------|---------------|-----------------|
| **Authentication** | Signup with email/password | Account created, auto-login, profile created |
| | Login with credentials | Session established, redirect to dashboard |
| | Logout | Session cleared, redirect to home |
| **Plan Switching** | Free → Starter | plan_type=starter, limit=3, used=0 |
| | Starter → Creator | plan_type=creator, limit=20, used=0 |
| | Creator → Free | plan_type=free, limit=0, used=0 |
| **Converter** | YouTube → MP3 320kbps | Real MP3 file, good quality, downloadable |
| | YouTube → MP4 HD | Real MP4 file, 1080p, downloadable |
| | SoundCloud → MP3 | Real MP3 file, original quality |
| | Invalid URL | Error: "URL not supported" |
| **Page Create** | New page with links | Page saved, accessible via /slug |
| | Duplicate slug | Error: "Slug already taken" |
| **Public Page** | View published page | All active links visible, clicks tracked |
| | View unpublished page | 404 error |
| **Downloads** | Free plan attempt | Blocked, upgrade modal shown |
| | Starter plan download | Success, quota decremented, metadata watermark |
| | Creator plan download | Success, clean file, no watermark |
| | Quota exceeded | Blocked, upgrade modal shown |
| **File Upload** | Upload MP3 (50MB) | Success, file stored, URL saved |
| | Upload 150MB file | Error: "File too large (max 100MB)" |
| | Upload .exe file | Error: "Invalid file type" |

### Manual Testing Checklist

#### Authentication & Profile
- [ ] Signup creates account and profile
- [ ] Login redirects to dashboard
- [ ] Logout clears session
- [ ] Protected routes require auth
- [ ] Profile displays correct information

#### Plan Management
- [ ] Free plan shows correct limits
- [ ] Can switch to Starter plan
- [ ] Can switch to Creator plan
- [ ] Can downgrade to Free
- [ ] Quota resets on plan change
- [ ] UI shows current plan correctly

#### Media Converter
- [ ] YouTube video → MP3 320kbps works
- [ ] YouTube video → MP4 HD 1080p works
- [ ] YouTube video → MP4 SD 720p works
- [ ] SoundCloud track → MP3 works
- [ ] Invalid URL shows error
- [ ] Download button downloads file
- [ ] File has correct format and quality
- [ ] "New conversion" button resets form

#### Page Management
- [ ] Can create new page
- [ ] Slug auto-generates from title
- [ ] Can set custom slug
- [ ] Can add multiple links
- [ ] Can reorder links (up/down)
- [ ] Can choose link icons
- [ ] Can set theme color
- [ ] Can publish/unpublish
- [ ] Save button creates/updates page

#### Public Pages
- [ ] Published pages accessible via /slug
- [ ] Unpublished pages return 404
- [ ] Theme color applies correctly
- [ ] Links are clickable
- [ ] Download links open modal
- [ ] View counter increments
- [ ] Mobile responsive

#### File Upload & Downloads
- [ ] Can upload MP3 file
- [ ] Can upload WAV file
- [ ] Can upload ZIP file
- [ ] File size validation works
- [ ] File type validation works
- [ ] Progress bar shows during upload
- [ ] File appears in page editor
- [ ] Free plan: downloads blocked
- [ ] Starter plan: 3 downloads allowed
- [ ] Creator plan: 20 downloads allowed
- [ ] Quota counter decrements
- [ ] Watermark applied per plan
- [ ] Upgrade modal on quota exceeded

#### Mobile Responsiveness
- [ ] Home page looks good on mobile
- [ ] Dashboard accessible on mobile
- [ ] Page editor usable on mobile
- [ ] Public pages display well on mobile
- [ ] Converter works on mobile
- [ ] Forms are usable on mobile
- [ ] Buttons are tappable on mobile

#### Performance
- [ ] Pages load in <2 seconds
- [ ] Converter completes in <30 seconds
- [ ] File uploads show progress
- [ ] No memory leaks
- [ ] Smooth animations

#### Error Handling
- [ ] Invalid URLs show clear errors
- [ ] Network failures handled gracefully
- [ ] File upload errors displayed
- [ ] Download errors explained
- [ ] Form validation errors shown

### Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Page Load Time | <2s | TBD |
| Time to Interactive | <3s | TBD |
| Converter Processing | <30s | TBD |
| File Upload (10MB) | <10s | TBD |
| API Response Time | <500ms | TBD |
| Lighthouse Score | >90 | TBD |

### Browser Compatibility

**Desktop:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Mobile:**
- iOS Safari 13+
- Android Chrome 80+

### Testing Tools

**Recommended:**
- Chrome DevTools (debugging, performance)
- React DevTools (component inspection)
- Lighthouse (performance audit)
- BrowserStack (cross-browser testing)

**Optional:**
- Vitest (unit testing)
- React Testing Library (component testing)
- Playwright (E2E testing)

---

## Project Summary & Next Steps

### Current Status: 70% Complete

**What's Already Done:**
- ✓ Authentication system (100%)
- ✓ Database schema with RLS (100%)
- ✓ Plan management system (100%)
- ✓ Dashboard and UI components (95%)
- ✓ Page editor and public pages (90%)
- ✓ Download quota system (95%)
- ✓ Converter frontend (100%)

**What Needs to Be Done:**
- ⚠️ Converter backend - Real implementation (3-4 days)
- ⚠️ File upload system (2-3 days)
- ⚠️ Watermarking logic (1-2 days)
- ⚠️ Testing and polish (1-2 days)

**Total Remaining: 7-9 days**

### Budget Breakdown

- **Received:** €400 upfront
- **Remaining:** €300 on delivery
- **Total:** €700

### Immediate Next Steps

#### Step 1: Setup Development Environment
```bash
git clone https://github.com/raoalihamza/linkiz-music
cd linkiz-music
npm install
```

#### Step 2: Create Claude AI Project
1. Open Claude AI
2. Create new project
3. Upload this documentation
4. Add GitHub repo as resource: `raoalihamza/linkiz-music`

#### Step 3: Start Phase 1 (Node.js Backend)
1. Create backend/ directory structure
2. Initialize Node.js project with TypeScript
3. Install dependencies: express, ytdl-core, fluent-ffmpeg
4. Implement YouTube extraction service
5. Implement FFmpeg conversion service
6. Integrate with Supabase Storage
7. Create API endpoints
8. Test with various YouTube videos

### Deployment Ready

**Frontend:**
- Deploy to Vercel
- Connect GitHub repo
- Set environment variables (VITE_SUPABASE_URL, VITE_API_URL)
- Build command: `npm run build`
- Output directory: `dist`

**Backend (Node.js):**
- Deploy to Railway/Render/VPS
- Ensure FFmpeg is installed on server
- Set environment variables (all backend .env variables)
- Start command: `npm start` or `node dist/server.js`
- Port: 3000 or assigned by hosting platform
- Configure CORS to allow frontend origin

**Database & Storage:**
- Already live on Supabase
- All migrations applied
- RLS policies active
- Storage buckets configured

### Critical Success Factors

1. **Media converter must work flawlessly** (client's main requirement)
2. **Download quota system must prevent abuse**
3. **Plan switching must be smooth**
4. **Mobile experience must be excellent**
5. **Error handling must be user-friendly**

### Post-Delivery Options

**Potential Enhancements:**
- Stripe integration (real payments)
- Analytics dashboard with charts
- Advanced converter features (playlists, 4K)
- Admin panel for monitoring
- API for external integrations
- Mobile app (React Native)

### Resources

**Documentation:**
- README.md - Project overview
- FEATURES.md - Complete feature list
- CONVERTER_GUIDE.md - Converter usage guide
- AUTHENTICATION_SETUP.md - Auth configuration
- PLAN_SWITCHING_GUIDE.md - Plan management
- TROUBLESHOOTING.md - Common issues

**Links:**
- GitHub: https://github.com/raoalihamza/linkiz-music
- Supabase: https://nzdcqxazpwnagkfkpunx.supabase.co
- Vercel: (to be deployed)

### Contact

**Developer:** Ali  
**Location:** Lahore, Pakistan  
**Experience:** 5+ years MERN Stack  
**Client:** Streetiz Phil (French)

---

## Ready to Start Phase 1! 🚀

### Architecture Summary

**Frontend:**
- React + Vite + TypeScript
- Already 95% complete
- Hosted on Vercel
- Connects to Node.js backend via REST API

**Backend (NEW):**
- Node.js + Express + TypeScript
- ytdl-core for YouTube extraction
- FFmpeg for video/audio conversion
- Hosted on Railway/Render/VPS
- Provides API endpoints: /api/convert, /api/upload, /api/watermark

**Database & Services:**
- PostgreSQL (Supabase) - Keep existing setup
- Supabase Auth - JWT verification in Node.js
- Supabase Storage - File hosting with signed URLs
- Stripe (optional) - Payment processing

### What This Documentation Provides

This document provides complete context for:
- Current project state (70% complete)
- What's working vs what needs work
- Detailed Node.js backend implementation plans
- Technology stack and architecture decisions
- Phase-by-phase development roadmap (Days 1-9)
- Technical requirements and dependencies
- Testing strategy and deployment guide

Use this as reference throughout development. Update as you progress through each phase.

**Next Action:** Begin Phase 1 - Node.js Backend Implementation (Days 1-4)

---

## Quick Start Commands

**Backend Setup (Day 1):**
```bash
# Create backend directory
mkdir backend && cd backend

# Initialize Node.js project
npm init -y

# Install dependencies
npm install express cors ytdl-core fluent-ffmpeg @supabase/supabase-js dotenv
npm install -D typescript @types/node @types/express ts-node nodemon

# Create directory structure
mkdir -p src/{routes,services,middleware,utils} temp

# Initialize TypeScript
npx tsc --init
```

**Frontend Update:**
```bash
# Update API endpoint in Converter.tsx
# Change from: https://...supabase.co/functions/v1/converter
# To: http://localhost:4004/api/convert (development)
```

**Install FFmpeg:**
- macOS: `brew install ffmpeg`
- Ubuntu: `sudo apt-get install ffmpeg`
- Windows: Download from ffmpeg.org

---

*Document Version: 3.0 (Node.js Backend Edition)*
*Last Updated: January 10, 2026*
*Status: Ready for Node.js Backend Development*
*Architecture: React → Node.js → PostgreSQL (Supabase)*
