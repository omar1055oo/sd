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
      profiles: {
        Row: {
          id: string
          email: string
          display_name: string | null
          avatar_url: string | null
          total_points: number
          created_at: string
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          avatar_url?: string | null
          total_points?: number
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          avatar_url?: string | null
          total_points?: number
          created_at?: string
        }
      }
      goals: {
        Row: {
          id: string
          user_id: string
          title: string
          category: 'study' | 'habits' | 'breaking_bad' | 'career' | 'general'
          difficulty: 'easy' | 'medium' | 'hard'
          base_points: number
          multiplier: number
          total_points: number
          status: 'pending' | 'completed'
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          category: 'study' | 'habits' | 'breaking_bad' | 'career' | 'general'
          difficulty: 'easy' | 'medium' | 'hard'
          base_points: number
          multiplier: number
          total_points: number
          status?: 'pending' | 'completed'
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          category?: 'study' | 'habits' | 'breaking_bad' | 'career' | 'general'
          difficulty?: 'easy' | 'medium' | 'hard'
          base_points?: number
          multiplier?: number
          total_points?: number
          status?: 'pending' | 'completed'
          created_at?: string
          completed_at?: string | null
        }
      }
      points_log: {
        Row: {
          id: string
          user_id: string
          goal_id: string | null
          points_earned: number
          earned_at: string
        }
        Insert: {
          id?: string
          user_id: string
          goal_id?: string | null
          points_earned: number
          earned_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          goal_id?: string | null
          points_earned?: number
          earned_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          user_id: string
          content: string
          type: string
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          type?: string
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          type?: string
          metadata?: Json | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
