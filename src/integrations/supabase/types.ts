export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      ai_responses: {
        Row: {
          confidence_score: number | null
          created_at: string
          email_id: string
          id: string
          is_sent: boolean | null
          response_text: string
          updated_at: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          email_id: string
          id?: string
          is_sent?: boolean | null
          response_text: string
          updated_at?: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          email_id?: string
          id?: string
          is_sent?: boolean | null
          response_text?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_responses_email_id_fkey"
            columns: ["email_id"]
            isOneToOne: false
            referencedRelation: "emails"
            referencedColumns: ["id"]
          },
        ]
      }
      email_analytics: {
        Row: {
          created_at: string
          date: string
          id: string
          negative_emails: number | null
          neutral_emails: number | null
          pending_emails: number | null
          positive_emails: number | null
          resolved_emails: number | null
          total_emails: number | null
          urgent_emails: number | null
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          negative_emails?: number | null
          neutral_emails?: number | null
          pending_emails?: number | null
          positive_emails?: number | null
          resolved_emails?: number | null
          total_emails?: number | null
          urgent_emails?: number | null
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          negative_emails?: number | null
          neutral_emails?: number | null
          pending_emails?: number | null
          positive_emails?: number | null
          resolved_emails?: number | null
          total_emails?: number | null
          urgent_emails?: number | null
        }
        Relationships: []
      }
      email_extractions: {
        Row: {
          alternate_email: string | null
          created_at: string
          customer_requirements: string | null
          email_id: string
          id: string
          metadata: Json | null
          phone_number: string | null
          product_order_id: string | null
          sentiment_indicators: Json | null
        }
        Insert: {
          alternate_email?: string | null
          created_at?: string
          customer_requirements?: string | null
          email_id: string
          id?: string
          metadata?: Json | null
          phone_number?: string | null
          product_order_id?: string | null
          sentiment_indicators?: Json | null
        }
        Update: {
          alternate_email?: string | null
          created_at?: string
          customer_requirements?: string | null
          email_id?: string
          id?: string
          metadata?: Json | null
          phone_number?: string | null
          product_order_id?: string | null
          sentiment_indicators?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "email_extractions_email_id_fkey"
            columns: ["email_id"]
            isOneToOne: false
            referencedRelation: "emails"
            referencedColumns: ["id"]
          },
        ]
      }
      emails: {
        Row: {
          body: string
          created_at: string
          id: string
          is_processed: boolean | null
          is_replied: boolean | null
          message_id: string
          priority: string
          received_at: string
          sender_email: string
          sender_name: string | null
          sentiment: string
          subject: string
          updated_at: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_processed?: boolean | null
          is_replied?: boolean | null
          message_id: string
          priority?: string
          received_at: string
          sender_email: string
          sender_name?: string | null
          sentiment?: string
          subject: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_processed?: boolean | null
          is_replied?: boolean | null
          message_id?: string
          priority?: string
          received_at?: string
          sender_email?: string
          sender_name?: string | null
          sentiment?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      Emails: {
        Row: {
          body: string | null
          id: number
          sender: string | null
          sent_date: string | null
          subject: string | null
        }
        Insert: {
          body?: string | null
          id: number
          sender?: string | null
          sent_date?: string | null
          subject?: string | null
        }
        Update: {
          body?: string | null
          id?: number
          sender?: string | null
          sent_date?: string | null
          subject?: string | null
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
