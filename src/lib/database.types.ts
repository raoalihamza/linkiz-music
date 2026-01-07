export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          avatar_url: string
          plan_type: 'free' | 'starter' | 'creator'
          downloads_used: number
          downloads_limit: number
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: string | null
          subscription_period_start: string | null
          subscription_period_end: string | null
          terms_accepted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string
          avatar_url?: string
          plan_type?: 'free' | 'starter' | 'creator'
          downloads_used?: number
          downloads_limit?: number
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          subscription_period_start?: string | null
          subscription_period_end?: string | null
          terms_accepted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          avatar_url?: string
          plan_type?: 'free' | 'starter' | 'creator'
          downloads_used?: number
          downloads_limit?: number
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          subscription_period_start?: string | null
          subscription_period_end?: string | null
          terms_accepted_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      linkiz_pages: {
        Row: {
          id: string
          user_id: string
          slug: string
          title: string
          description: string
          avatar_url: string
          theme_color: string
          is_published: boolean
          view_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          slug: string
          title: string
          description?: string
          avatar_url?: string
          theme_color?: string
          is_published?: boolean
          view_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          slug?: string
          title?: string
          description?: string
          avatar_url?: string
          theme_color?: string
          is_published?: boolean
          view_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      links: {
        Row: {
          id: string
          page_id: string
          title: string
          url: string
          icon: string
          file_url: string | null
          file_size: number | null
          file_type: string | null
          is_downloadable: boolean
          download_count: number
          position: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          page_id: string
          title: string
          url: string
          icon?: string
          file_url?: string | null
          file_size?: number | null
          file_type?: string | null
          is_downloadable?: boolean
          download_count?: number
          position?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          page_id?: string
          title?: string
          url?: string
          icon?: string
          file_url?: string | null
          file_size?: number | null
          file_type?: string | null
          is_downloadable?: boolean
          download_count?: number
          position?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      downloads: {
        Row: {
          id: string
          user_id: string
          link_id: string
          page_id: string
          file_name: string
          watermarked: boolean
          plan_type_at_download: string
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          link_id: string
          page_id: string
          file_name: string
          watermarked?: boolean
          plan_type_at_download: string
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          link_id?: string
          page_id?: string
          file_name?: string
          watermarked?: boolean
          plan_type_at_download?: string
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_subscription_id: string
          stripe_customer_id: string
          plan_type: 'starter' | 'creator'
          status: string
          current_period_start: string
          current_period_end: string
          cancel_at_period_end: boolean
          canceled_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_subscription_id: string
          stripe_customer_id: string
          plan_type: 'starter' | 'creator'
          status: string
          current_period_start: string
          current_period_end: string
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_subscription_id?: string
          stripe_customer_id?: string
          plan_type?: 'starter' | 'creator'
          status?: string
          current_period_start?: string
          current_period_end?: string
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
