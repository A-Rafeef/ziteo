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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      billing_events: {
        Row: {
          created_at: string
          environment: string
          event_key: string
          event_time: string
          event_type: string
          outcome: string
          provider_subscription_id: string | null
        }
        Insert: {
          created_at?: string
          environment: string
          event_key: string
          event_time: string
          event_type: string
          outcome?: string
          provider_subscription_id?: string | null
        }
        Update: {
          created_at?: string
          environment?: string
          event_key?: string
          event_time?: string
          event_type?: string
          outcome?: string
          provider_subscription_id?: string | null
        }
        Relationships: []
      }
      billing_payments: {
        Row: {
          amount_minor: number
          created_at: string
          currency: string
          environment: string
          id: string
          period_end: string
          period_start: string
          provider_payment_id: string
          refunded: boolean
          store_id: string
          subscription_id: string
        }
        Insert: {
          amount_minor: number
          created_at?: string
          currency: string
          environment: string
          id?: string
          period_end: string
          period_start: string
          provider_payment_id: string
          refunded?: boolean
          store_id: string
          subscription_id: string
        }
        Update: {
          amount_minor?: number
          created_at?: string
          currency?: string
          environment?: string
          id?: string
          period_end?: string
          period_start?: string
          provider_payment_id?: string
          refunded?: boolean
          store_id?: string
          subscription_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_payments_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "billing_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_refunds: {
        Row: {
          amount_minor: number
          created_at: string
          environment: string
          provider_payment_id: string
          provider_refund_id: string
        }
        Insert: {
          amount_minor: number
          created_at?: string
          environment: string
          provider_payment_id: string
          provider_refund_id: string
        }
        Update: {
          amount_minor?: number
          created_at?: string
          environment?: string
          provider_payment_id?: string
          provider_refund_id?: string
        }
        Relationships: []
      }
      billing_subscriptions: {
        Row: {
          amount_minor: number
          api_state: string
          created_at: string
          currency: string
          customer_email: string
          customer_name: string
          customer_phone: string
          environment: string
          id: string
          idempotency_key: string
          last_event_at: string | null
          owner_id: string
          period_months: number
          plan_id: string
          provider_id: string
          session_id: string | null
          status: string
          store_id: string
        }
        Insert: {
          amount_minor: number
          api_state?: string
          created_at?: string
          currency?: string
          customer_email: string
          customer_name: string
          customer_phone: string
          environment: string
          id?: string
          idempotency_key?: string
          last_event_at?: string | null
          owner_id: string
          period_months: number
          plan_id: string
          provider_id: string
          session_id?: string | null
          status?: string
          store_id: string
        }
        Update: {
          amount_minor?: number
          api_state?: string
          created_at?: string
          currency?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          environment?: string
          id?: string
          idempotency_key?: string
          last_event_at?: string | null
          owner_id?: string
          period_months?: number
          plan_id?: string
          provider_id?: string
          session_id?: string | null
          status?: string
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_subscriptions_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_metrics: {
        Row: {
          date: string
          product_views: number
          store_id: string
          store_views: number
          whatsapp_clicks: number
        }
        Insert: {
          date?: string
          product_views?: number
          store_id: string
          store_views?: number
          whatsapp_clicks?: number
        }
        Update: {
          date?: string
          product_views?: number
          store_id?: string
          store_views?: number
          whatsapp_clicks?: number
        }
        Relationships: [
          {
            foreignKeyName: "daily_metrics_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      media_assets: {
        Row: {
          byte_size: number
          created_at: string
          id: string
          mime_type: string
          object_key: string
          store_id: string
        }
        Insert: {
          byte_size: number
          created_at?: string
          id?: string
          mime_type: string
          object_key: string
          store_id: string
        }
        Update: {
          byte_size?: number
          created_at?: string
          id?: string
          mime_type?: string
          object_key?: string
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_assets_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          archived_at: string | null
          created_at: string
          data: Json
          id: string
          short_id: string
          status: string
          store_id: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          data: Json
          id?: string
          short_id: string
          status?: string
          store_id: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          data?: Json
          id?: string
          short_id?: string
          status?: string
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      store_verifications: {
        Row: {
          phone: string
          store_id: string
          verified_at: string
        }
        Insert: {
          phone: string
          store_id: string
          verified_at?: string
        }
        Update: {
          phone?: string
          store_id?: string
          verified_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_verifications_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: true
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      storefronts: {
        Row: {
          data: Json
          slug: string
          store_id: string
        }
        Insert: {
          data: Json
          slug: string
          store_id: string
        }
        Update: {
          data?: Json
          slug?: string
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "storefronts_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: true
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      stores: {
        Row: {
          created_at: string
          data: Json
          id: string
          owner_id: string
          published: boolean
          revision: number
          slug: string
        }
        Insert: {
          created_at?: string
          data: Json
          id?: string
          owner_id: string
          published?: boolean
          revision?: number
          slug: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          owner_id?: string
          published?: boolean
          revision?: number
          slug?: string
        }
        Relationships: []
      }
      verification_challenges: {
        Row: {
          attempts: number
          consumed_at: string | null
          created_at: string
          expires_at: string
          id: string
          phone: string
          provider_session_id: string | null
          store_id: string
          user_id: string
        }
        Insert: {
          attempts?: number
          consumed_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          phone: string
          provider_session_id?: string | null
          store_id: string
          user_id: string
        }
        Update: {
          attempts?: number
          consumed_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          phone?: string
          provider_session_id?: string | null
          store_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "verification_challenges_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      attach_phone_session: {
        Args: { p_challenge: string; p_session: string }
        Returns: undefined
      }
      claim_phone_attempt: {
        Args: { p_challenge: string; p_owner: string; p_store: string }
        Returns: Json
      }
      complete_subscription_creation: {
        Args: { p_id: string; p_session_id: string }
        Returns: undefined
      }
      confirm_phone_verification: {
        Args: { p_challenge: string; p_owner: string; p_store: string }
        Returns: undefined
      }
      is_store_phone_verified: {
        Args: { p_store_id: string }
        Returns: boolean
      }
      record_cashfree_event: {
        Args: { p_environment: string; p_event: Json; p_event_key: string }
        Returns: string
      }
      record_store_event: {
        Args: {
          p_owner?: string
          p_product?: string
          p_store: string
          p_type: string
        }
        Returns: boolean
      }
      reserve_phone_verification: {
        Args: { p_owner: string; p_store: string }
        Returns: Json
      }
      reserve_subscription: {
        Args: {
          p_amount_minor: number
          p_customer_email: string
          p_customer_name: string
          p_customer_phone: string
          p_environment: string
          p_owner: string
          p_period_months: number
          p_plan_id: string
          p_store: string
        }
        Returns: Json
      }
      save_store: {
        Args: {
          p_data: Json
          p_published: boolean
          p_revision: number
          p_slug: string
          p_store: string
        }
        Returns: {
          created_at: string
          data: Json
          id: string
          owner_id: string
          published: boolean
          revision: number
          slug: string
        }[]
        SetofOptions: {
          from: "*"
          to: "stores"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
