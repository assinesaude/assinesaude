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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activity_categories: {
        Row: {
          created_at: string
          display_order: number
          icon_url: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          icon_url: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          icon_url?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      brazilian_cities: {
        Row: {
          id: string
          name: string
          state_id: string
        }
        Insert: {
          id?: string
          name: string
          state_id: string
        }
        Update: {
          id?: string
          name?: string
          state_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brazilian_cities_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "brazilian_states"
            referencedColumns: ["id"]
          },
        ]
      }
      brazilian_states: {
        Row: {
          abbreviation: string
          id: string
          name: string
        }
        Insert: {
          abbreviation: string
          id?: string
          name: string
        }
        Update: {
          abbreviation?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      contract_templates: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          type: string
          updated_at: string
          variables: Json | null
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          type?: string
          updated_at?: string
          variables?: Json | null
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          type?: string
          updated_at?: string
          variables?: Json | null
        }
        Relationships: []
      }
      coupon_usage: {
        Row: {
          coupon_id: string
          id: string
          used_at: string
          user_id: string
        }
        Insert: {
          coupon_id: string
          id?: string
          used_at?: string
          user_id: string
        }
        Update: {
          coupon_id?: string
          id?: string
          used_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupon_usage_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "discount_coupons"
            referencedColumns: ["id"]
          },
        ]
      }
      discount_coupons: {
        Row: {
          code: string
          created_at: string
          created_by: string
          created_by_type: string
          current_uses: number
          description: string | null
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean
          max_uses: number | null
          professional_id: string | null
          target_audience: string
          updated_at: string
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by: string
          created_by_type?: string
          current_uses?: number
          description?: string | null
          discount_type?: string
          discount_value: number
          id?: string
          is_active?: boolean
          max_uses?: number | null
          professional_id?: string | null
          target_audience?: string
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string
          created_by_type?: string
          current_uses?: number
          description?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean
          max_uses?: number | null
          professional_id?: string | null
          target_audience?: string
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discount_coupons_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professional_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discount_coupons_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professional_profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      message_recipients: {
        Row: {
          created_at: string
          id: string
          message_id: string
          read_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message_id: string
          read_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message_id?: string
          read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_recipients_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "platform_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          birth_date: string | null
          city: string | null
          cpf: string
          created_at: string
          full_name: string
          id: string
          phone: string | null
          state: string | null
          updated_at: string
          user_id: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          birth_date?: string | null
          city?: string | null
          cpf: string
          created_at?: string
          full_name: string
          id?: string
          phone?: string | null
          state?: string | null
          updated_at?: string
          user_id: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          birth_date?: string | null
          city?: string | null
          cpf?: string
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          state?: string | null
          updated_at?: string
          user_id?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      platform_messages: {
        Row: {
          content: string
          created_at: string
          created_by: string
          filter_city_id: string | null
          filter_profession_id: string | null
          filter_specialty_id: string | null
          filter_state_id: string | null
          id: string
          is_automatic: boolean
          message_type: string
          scheduled_at: string | null
          sent_at: string | null
          target_audience: string
          title: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by: string
          filter_city_id?: string | null
          filter_profession_id?: string | null
          filter_specialty_id?: string | null
          filter_state_id?: string | null
          id?: string
          is_automatic?: boolean
          message_type?: string
          scheduled_at?: string | null
          sent_at?: string | null
          target_audience?: string
          title: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string
          filter_city_id?: string | null
          filter_profession_id?: string | null
          filter_specialty_id?: string | null
          filter_state_id?: string | null
          id?: string
          is_automatic?: boolean
          message_type?: string
          scheduled_at?: string | null
          sent_at?: string | null
          target_audience?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_messages_filter_city_id_fkey"
            columns: ["filter_city_id"]
            isOneToOne: false
            referencedRelation: "brazilian_cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_messages_filter_profession_id_fkey"
            columns: ["filter_profession_id"]
            isOneToOne: false
            referencedRelation: "professions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_messages_filter_specialty_id_fkey"
            columns: ["filter_specialty_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_messages_filter_state_id_fkey"
            columns: ["filter_state_id"]
            isOneToOne: false
            referencedRelation: "brazilian_states"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_plans: {
        Row: {
          created_at: string
          description: string | null
          features: Json | null
          id: string
          is_active: boolean
          is_free: boolean
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean
          is_free?: boolean
          name: string
          price?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean
          is_free?: boolean
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      professional_councils: {
        Row: {
          abbreviation: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          profession_id: string
          updated_at: string
        }
        Insert: {
          abbreviation: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          profession_id: string
          updated_at?: string
        }
        Update: {
          abbreviation?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          profession_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_councils_profession_id_fkey"
            columns: ["profession_id"]
            isOneToOne: false
            referencedRelation: "professions"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_profiles: {
        Row: {
          approval_status: Database["public"]["Enums"]["approval_status"]
          approved_at: string | null
          approved_by: string | null
          avatar_url: string | null
          bio: string | null
          city: string | null
          clinic_address: string | null
          clinic_name: string | null
          council_id: string | null
          cpf: string
          created_at: string
          document_back_url: string | null
          document_front_url: string | null
          facebook_url: string | null
          full_name: string
          google_my_business_url: string | null
          google_street_view_url: string | null
          id: string
          instagram_url: string | null
          kwai_url: string | null
          phone: string | null
          profession_id: string | null
          professional_registration: string
          rejection_reason: string | null
          slug: string | null
          specialty: string
          specialty_id: string | null
          state: string | null
          telegram_url: string | null
          tiktok_url: string | null
          updated_at: string
          user_id: string
          whatsapp_number: string | null
          youtube_url: string | null
          zip_code: string | null
        }
        Insert: {
          approval_status?: Database["public"]["Enums"]["approval_status"]
          approved_at?: string | null
          approved_by?: string | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          clinic_address?: string | null
          clinic_name?: string | null
          council_id?: string | null
          cpf: string
          created_at?: string
          document_back_url?: string | null
          document_front_url?: string | null
          facebook_url?: string | null
          full_name: string
          google_my_business_url?: string | null
          google_street_view_url?: string | null
          id?: string
          instagram_url?: string | null
          kwai_url?: string | null
          phone?: string | null
          profession_id?: string | null
          professional_registration: string
          rejection_reason?: string | null
          slug?: string | null
          specialty: string
          specialty_id?: string | null
          state?: string | null
          telegram_url?: string | null
          tiktok_url?: string | null
          updated_at?: string
          user_id: string
          whatsapp_number?: string | null
          youtube_url?: string | null
          zip_code?: string | null
        }
        Update: {
          approval_status?: Database["public"]["Enums"]["approval_status"]
          approved_at?: string | null
          approved_by?: string | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          clinic_address?: string | null
          clinic_name?: string | null
          council_id?: string | null
          cpf?: string
          created_at?: string
          document_back_url?: string | null
          document_front_url?: string | null
          facebook_url?: string | null
          full_name?: string
          google_my_business_url?: string | null
          google_street_view_url?: string | null
          id?: string
          instagram_url?: string | null
          kwai_url?: string | null
          phone?: string | null
          profession_id?: string | null
          professional_registration?: string
          rejection_reason?: string | null
          slug?: string | null
          specialty?: string
          specialty_id?: string | null
          state?: string | null
          telegram_url?: string | null
          tiktok_url?: string | null
          updated_at?: string
          user_id?: string
          whatsapp_number?: string | null
          youtube_url?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "professional_profiles_council_id_fkey"
            columns: ["council_id"]
            isOneToOne: false
            referencedRelation: "professional_councils"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professional_profiles_profession_id_fkey"
            columns: ["profession_id"]
            isOneToOne: false
            referencedRelation: "professions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professional_profiles_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          plan_id: string
          professional_id: string
          started_at: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          plan_id: string
          professional_id: string
          started_at?: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          plan_id?: string
          professional_id?: string
          started_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "platform_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professional_subscriptions_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professional_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professional_subscriptions_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professional_profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      professions: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      service_offerings: {
        Row: {
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          is_active: boolean
          price: number
          professional_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean
          price: number
          professional_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean
          price?: number
          professional_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_offerings_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professional_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_offerings_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professional_profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      specialties: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          profession_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          profession_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          profession_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "specialties_profession_id_fkey"
            columns: ["profession_id"]
            isOneToOne: false
            referencedRelation: "professions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      professional_profiles_public: {
        Row: {
          approval_status: Database["public"]["Enums"]["approval_status"] | null
          avatar_url: string | null
          bio: string | null
          city: string | null
          clinic_address: string | null
          clinic_name: string | null
          facebook_url: string | null
          full_name: string | null
          google_my_business_url: string | null
          google_street_view_url: string | null
          id: string | null
          instagram_url: string | null
          kwai_url: string | null
          profession_id: string | null
          slug: string | null
          specialty: string | null
          specialty_id: string | null
          state: string | null
          telegram_url: string | null
          tiktok_url: string | null
          whatsapp_number: string | null
          youtube_url: string | null
        }
        Insert: {
          approval_status?:
            | Database["public"]["Enums"]["approval_status"]
            | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          clinic_address?: string | null
          clinic_name?: string | null
          facebook_url?: string | null
          full_name?: string | null
          google_my_business_url?: string | null
          google_street_view_url?: string | null
          id?: string | null
          instagram_url?: string | null
          kwai_url?: string | null
          profession_id?: string | null
          slug?: string | null
          specialty?: string | null
          specialty_id?: string | null
          state?: string | null
          telegram_url?: string | null
          tiktok_url?: string | null
          whatsapp_number?: string | null
          youtube_url?: string | null
        }
        Update: {
          approval_status?:
            | Database["public"]["Enums"]["approval_status"]
            | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          clinic_address?: string | null
          clinic_name?: string | null
          facebook_url?: string | null
          full_name?: string | null
          google_my_business_url?: string | null
          google_street_view_url?: string | null
          id?: string | null
          instagram_url?: string | null
          kwai_url?: string | null
          profession_id?: string | null
          slug?: string | null
          specialty?: string | null
          specialty_id?: string | null
          state?: string | null
          telegram_url?: string | null
          tiktok_url?: string | null
          whatsapp_number?: string | null
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "professional_profiles_profession_id_fkey"
            columns: ["profession_id"]
            isOneToOne: false
            referencedRelation: "professions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professional_profiles_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_approved_professional: { Args: { _user_id: string }; Returns: boolean }
      validate_coupon_code: {
        Args: { coupon_code: string }
        Returns: {
          code: string
          discount_type: string
          discount_value: number
          id: string
          valid_until: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "professional" | "patient"
      approval_status: "pending" | "approved" | "rejected"
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
    Enums: {
      app_role: ["admin", "professional", "patient"],
      approval_status: ["pending", "approved", "rejected"],
    },
  },
} as const
