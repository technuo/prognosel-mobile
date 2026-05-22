export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          selected_zone: string;
          display_name: string | null;
          avatar_url: string | null;
          currency: string;
          price_unit: string;
          notify_tips: boolean;
          notify_weekly: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          selected_zone?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          currency?: string;
          price_unit?: string;
          notify_tips?: boolean;
          notify_weekly?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          selected_zone?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          currency?: string;
          price_unit?: string;
          notify_tips?: boolean;
          notify_weekly?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          appliance_id: string | null;
          title: string;
          description: string | null;
          scheduled_at: string | null;
          status: string;
          estimated_savings: number;
          actual_savings: number | null;
          zone: string;
          source: string;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          appliance_id?: string | null;
          title: string;
          description?: string | null;
          scheduled_at?: string | null;
          status?: string;
          estimated_savings?: number;
          actual_savings?: number | null;
          zone?: string;
          source?: string;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          appliance_id?: string | null;
          title?: string;
          description?: string | null;
          scheduled_at?: string | null;
          status?: string;
          estimated_savings?: number;
          actual_savings?: number | null;
          zone?: string;
          source?: string;
          completed_at?: string | null;
          created_at?: string;
        };
      };
      forecasts: {
        Row: {
          id: string;
          zone: string;
          horizon_hours: number;
          timestamp: string;
          predicted_price: number;
          confidence_lower: number | null;
          confidence_upper: number | null;
          model_version: string;
          generated_at: string;
        };
        Insert: {
          id?: string;
          zone: string;
          horizon_hours: number;
          timestamp: string;
          predicted_price: number;
          confidence_lower?: number | null;
          confidence_upper?: number | null;
          model_version?: string;
          generated_at?: string;
        };
        Update: {
          id?: string;
          zone?: string;
          horizon_hours?: number;
          timestamp?: string;
          predicted_price?: number;
          confidence_lower?: number | null;
          confidence_upper?: number | null;
          model_version?: string;
          generated_at?: string;
        };
      };
      chat_sessions: {
        Row: {
          id: string;
          user_id: string;
          title: string | null;
          context_snapshot: Json | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string | null;
          context_snapshot?: Json | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string | null;
          context_snapshot?: Json | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          session_id: string;
          role: string;
          content: string;
          source: string | null;
          meta: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          role: string;
          content: string;
          source?: string | null;
          meta?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          role?: string;
          content?: string;
          source?: string | null;
          meta?: Json | null;
          created_at?: string;
        };
      };
    };
    Views: {
      daily_forecast_summary: {
        Row: {
          zone: string;
          horizon_hours: number;
          forecast_date: string;
          min_price: number;
          max_price: number;
          avg_price: number;
          cheapest_hour: string;
        };
      };
    };
    Functions: {
      get_user_savings_summary: {
        Args: { user_uuid: string };
        Returns: {
          total_tasks: number;
          completed_tasks: number;
          total_estimated_savings: number;
          total_actual_savings: number;
        };
      };
    };
  };
}
