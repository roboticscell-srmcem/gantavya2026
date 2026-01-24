// Database Types
export interface Database {
  public: {
    Tables: {
      events: {
        Row: {
          id: string
          slug: string
          name: string
          brief: string
          description: string
          min_team_size: number
          max_team_size: number
          rulebook_url: string | null
          prize_amount: number
          prize_currency: string
          entry_fee: number
          content: string | null
          banner_url: string | null
          start_time: string | null
          venue: string | null
          visibility: 'draft' | 'public' | 'hidden' | 'archived'
          registration_open: boolean
          created_at: string
          updated_at: string
          updated_by: string | null
        }
        Insert: Omit<Database['public']['Tables']['events']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['events']['Insert']>
      }
      event_rules: {
        Row: {
          id: string
          event_id: string
          rule_text: string
        }
        Insert: Omit<Database['public']['Tables']['event_rules']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['event_rules']['Insert']>
      }
      teams: {
        Row: {
          id: string
          event_id: string
          team_name: string
          college_name: string
          captain_name: string
          captain_email: string
          total_amount_payable: number
          currency: string
          has_paid: boolean
          payment_gateway: 'razorpay' | 'upi' | 'free' | 'manual' | string
          payment_order_id: string | null
          payment_mode: 'upi' | 'card' | 'netbanking' | null
          payment_status: 'created' | 'pending' | 'pending_verification' | 'completed' | 'failed' | 'refunded' | 'not_required'
          transaction_id: string | null
          account_holder_name: string | null
          passes_generated: boolean
          is_active: boolean
          created_at: string
          updated_at: string
          updated_by: string | null
        }
        Insert: Omit<Database['public']['Tables']['teams']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['teams']['Insert']>
      }
      team_members: {
        Row: {
          id: string
          team_id: string
          member_name: string
          member_email: string
          member_contact: string
          role: 'captain' | 'member'
          is_active: boolean
          joined_at: string
        }
        Insert: Omit<Database['public']['Tables']['team_members']['Row'], 'id' | 'joined_at'>
        Update: Partial<Database['public']['Tables']['team_members']['Insert']>
      }
      admin_users: {
        Row: {
          id: string
          email: string
          username: string | null
          password_hash: string | null
          access_code: string | null
          role: 'admin' | 'super_admin'
          is_active: boolean
          last_login: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['admin_users']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['admin_users']['Insert']>
      }
      access_codes: {
        Row: {
          id: string
          code: string
          is_active: boolean
          created_by: string | null
          created_at: string
          expires_at: string | null
          last_used_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['access_codes']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['access_codes']['Insert']>
      }
    }
    Views: {
      event_kpis: {
        Row: {
          event_id: string
          event_name: string
          visibility: string
          total_teams: number
          total_participants: number
          paid_teams: number
          total_collection: number
        }
      }
    }
  }
}
