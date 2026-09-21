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
      expense_splits: {
        Row: {
          id: string
          expense_id: string
          user_id: string
          amount_owed: number
          percentage: number | null
          is_settled: boolean
          settled_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          expense_id: string
          user_id: string
          amount_owed: number
          percentage?: number | null
          is_settled?: boolean
          settled_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          expense_id?: string
          user_id?: string
          amount_owed?: number
          percentage?: number | null
          is_settled?: boolean
          settled_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      itinerary_days: {
        Row: {
          id: string
          trip_id: string
          day_date: string
          day_index: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          day_date: string
          day_index: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          day_date?: string
          day_index?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          id: string
          trip_id: string
          paid_by: string
          amount: number
          currency: string
          description: string
          category: string | null
          expense_date: string
          split_method: "equal" | "percentage" | "custom"
          receipt_image_url: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          paid_by: string
          amount: number
          currency?: string
          description: string
          category?: string | null
          expense_date?: string
          split_method?: "equal" | "percentage" | "custom"
          receipt_image_url?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          paid_by?: string
          amount?: number
          currency?: string
          description?: string
          category?: string | null
          expense_date?: string
          split_method?: "equal" | "percentage" | "custom"
          receipt_image_url?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          trip_id: string | null
          type: "invite" | "itinerary_update" | "expense_update" | "checklist_update" | "chat_message" | "trip_update"
          title: string
          body: string | null
          is_read: boolean
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          trip_id?: string | null
          type: "invite" | "itinerary_update" | "expense_update" | "checklist_update" | "chat_message" | "trip_update"
          title: string
          body?: string | null
          is_read?: boolean
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          trip_id?: string | null
          type?: "invite" | "itinerary_update" | "expense_update" | "checklist_update" | "chat_message" | "trip_update"
          title?: string
          body?: string | null
          is_read?: boolean
          read_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      checklist_items: {
        Row: {
          id: string
          checklist_id: string
          title: string
          assigned_to: string | null
          is_completed: boolean
          completed_at: string | null
          position: number
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          checklist_id: string
          title: string
          assigned_to?: string | null
          is_completed?: boolean
          completed_at?: string | null
          position?: number
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          checklist_id?: string
          title?: string
          assigned_to?: string | null
          is_completed?: boolean
          completed_at?: string | null
          position?: number
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      trip_invites: {
        Row: {
          id: string
          trip_id: string
          code: string
          created_by: string
          expires_at: string | null
          max_uses: number | null
          uses_count: number
          created_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          code: string
          created_by: string
          expires_at?: string | null
          max_uses?: number | null
          uses_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          code?: string
          created_by?: string
          expires_at?: string | null
          max_uses?: number | null
          uses_count?: number
          created_at?: string
        }
        Relationships: []
      }
      checklists: {
        Row: {
          id: string
          trip_id: string
          type: "todo" | "packing"
          title: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          type: "todo" | "packing"
          title: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          type?: "todo" | "packing"
          title?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      trip_members: {
        Row: {
          id: string
          trip_id: string
          user_id: string
          role: "owner" | "member"
          status: "pending" | "accepted" | "declined" | "removed"
          invited_by: string | null
          joined_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          user_id: string
          role?: "owner" | "member"
          status?: "pending" | "accepted" | "declined" | "removed"
          invited_by?: string | null
          joined_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          user_id?: string
          role?: "owner" | "member"
          status?: "pending" | "accepted" | "declined" | "removed"
          invited_by?: string | null
          joined_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          user_id: string
          notifications_enabled: boolean
          language: "vi" | "en"
          theme: "light" | "dark"
          updated_at: string
        }
        Insert: {
          user_id: string
          notifications_enabled?: boolean
          language?: "vi" | "en"
          theme?: "light" | "dark"
          updated_at?: string
        }
        Update: {
          user_id?: string
          notifications_enabled?: boolean
          language?: "vi" | "en"
          theme?: "light" | "dark"
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          id: string
          trip_id: string
          target_type: "itinerary_item" | "expense" | "post"
          target_id: string
          author_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          target_type: "itinerary_item" | "expense" | "post"
          target_id: string
          author_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          target_type?: "itinerary_item" | "expense" | "post"
          target_id?: string
          author_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      trip_posts: {
        Row: {
          id: string
          trip_id: string
          author_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          author_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          author_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      itinerary_items: {
        Row: {
          id: string
          day_id: string
          title: string
          start_time: string | null
          end_time: string | null
          location_name: string | null
          latitude: number | null
          longitude: number | null
          note: string | null
          image_url: string | null
          position: number
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          day_id: string
          title: string
          start_time?: string | null
          end_time?: string | null
          location_name?: string | null
          latitude?: number | null
          longitude?: number | null
          note?: string | null
          image_url?: string | null
          position?: number
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          day_id?: string
          title?: string
          start_time?: string | null
          end_time?: string | null
          location_name?: string | null
          latitude?: number | null
          longitude?: number | null
          note?: string | null
          image_url?: string | null
          position?: number
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      trips: {
        Row: {
          id: string
          name: string
          destination: string | null
          start_date: string | null
          end_date: string | null
          cover_image_url: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          destination?: string | null
          start_date?: string | null
          end_date?: string | null
          cover_image_url?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          destination?: string | null
          start_date?: string | null
          end_date?: string | null
          cover_image_url?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          id: string
          trip_id: string
          sender_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          sender_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          sender_id?: string
          content?: string
          created_at?: string
        }
        Relationships: []
      }
      expense_settlements: {
        Row: {
          id: string
          trip_id: string
          from_user: string
          to_user: string
          amount: number
          note: string | null
          settled_at: string
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          from_user: string
          to_user: string
          amount: number
          note?: string | null
          settled_at?: string
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          from_user?: string
          to_user?: string
          amount?: number
          note?: string | null
          settled_at?: string
          created_by?: string
          created_at?: string
        }
        Relationships: []
      }
      itinerary_item_votes: {
        Row: {
          id: string
          item_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          item_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          item_id?: string
          user_id?: string
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      member_role: 'owner' | 'member'
      member_status: 'pending' | 'accepted' | 'declined' | 'removed'
      split_method: 'equal' | 'percentage' | 'custom'
      checklist_type: 'todo' | 'packing'
      comment_target_type: 'itinerary_item' | 'expense' | 'post'
      notification_type:
        | 'invite'
        | 'itinerary_update'
        | 'expense_update'
        | 'checklist_update'
        | 'chat_message'
        | 'trip_update'
      app_language: 'vi' | 'en'
      app_theme: 'light' | 'dark'
    }
  }
}

// Convenience export types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

export type Profile = Tables<'profiles'>
export type Trip = Tables<'trips'>
export type TripMember = Tables<'trip_members'>
export type ItineraryItem = Tables<'itinerary_items'>
export type Expense = Tables<'expenses'>
export type ExpenseSplit = Tables<'expense_splits'>
export type Settlement = Tables<'expense_settlements'>
export type Checklist = Tables<'checklists'>
