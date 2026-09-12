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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_table: string
          id: string
          new_value: Json | null
          previous_value: Json | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_table: string
          id?: string
          new_value?: Json | null
          previous_value?: Json | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_table?: string
          id?: string
          new_value?: Json | null
          previous_value?: Json | null
        }
        Relationships: []
      }
      government_rates: {
        Row: {
          area_name: string | null
          created_at: string
          created_by: string | null
          district: string
          fiscal_year: string
          id: string
          land_category: string | null
          municipality: string | null
          province: string | null
          rate_per_sq_m: number | null
          rate_unit: string
          source: string | null
          updated_at: string
          ward: string | null
        }
        Insert: {
          area_name?: string | null
          created_at?: string
          created_by?: string | null
          district: string
          fiscal_year: string
          id?: string
          land_category?: string | null
          municipality?: string | null
          province?: string | null
          rate_per_sq_m?: number | null
          rate_unit?: string
          source?: string | null
          updated_at?: string
          ward?: string | null
        }
        Update: {
          area_name?: string | null
          created_at?: string
          created_by?: string | null
          district?: string
          fiscal_year?: string
          id?: string
          land_category?: string | null
          municipality?: string | null
          province?: string | null
          rate_per_sq_m?: number | null
          rate_unit?: string
          source?: string | null
          updated_at?: string
          ward?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          nec_number: string | null
          nec_obtained_year: number | null
          onboarding_completed: boolean
          organization: string | null
          phone: string | null
          updated_at: string
          verification_note: string | null
          verification_status: Database["public"]["Enums"]["verification_status"]
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          nec_number?: string | null
          nec_obtained_year?: number | null
          onboarding_completed?: boolean
          organization?: string | null
          phone?: string | null
          updated_at?: string
          verification_note?: string | null
          verification_status?: Database["public"]["Enums"]["verification_status"]
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          nec_number?: string | null
          nec_obtained_year?: number | null
          onboarding_completed?: boolean
          organization?: string | null
          phone?: string | null
          updated_at?: string
          verification_note?: string | null
          verification_status?: Database["public"]["Enums"]["verification_status"]
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      valuation_records: {
        Row: {
          area_source: string
          created_at: string
          created_by: string
          currency: string
          deleted_at: string | null
          deleted_by: string | null
          district: string | null
          estimated_value: number | null
          geometry: Json | null
          id: string
          land_area_sq_m: number | null
          latitude: number | null
          locality: string | null
          longitude: number | null
          market_rate_per_sq_m: number | null
          metadata: Json
          municipality: string | null
          notes: string | null
          plot_number: string | null
          property_type: string | null
          province: string | null
          reference_code: string | null
          road_category: string | null
          status: Database["public"]["Enums"]["record_status"]
          title: string
          updated_at: string
          valuation_date: string | null
          visibility: Database["public"]["Enums"]["record_visibility"]
          ward: string | null
        }
        Insert: {
          area_source?: string
          created_at?: string
          created_by: string
          currency?: string
          deleted_at?: string | null
          deleted_by?: string | null
          district?: string | null
          estimated_value?: number | null
          geometry?: Json | null
          id?: string
          land_area_sq_m?: number | null
          latitude?: number | null
          locality?: string | null
          longitude?: number | null
          market_rate_per_sq_m?: number | null
          metadata?: Json
          municipality?: string | null
          notes?: string | null
          plot_number?: string | null
          property_type?: string | null
          province?: string | null
          reference_code?: string | null
          road_category?: string | null
          status?: Database["public"]["Enums"]["record_status"]
          title: string
          updated_at?: string
          valuation_date?: string | null
          visibility?: Database["public"]["Enums"]["record_visibility"]
          ward?: string | null
        }
        Update: {
          area_source?: string
          created_at?: string
          created_by?: string
          currency?: string
          deleted_at?: string | null
          deleted_by?: string | null
          district?: string | null
          estimated_value?: number | null
          geometry?: Json | null
          id?: string
          land_area_sq_m?: number | null
          latitude?: number | null
          locality?: string | null
          longitude?: number | null
          market_rate_per_sq_m?: number | null
          metadata?: Json
          municipality?: string | null
          notes?: string | null
          plot_number?: string | null
          property_type?: string | null
          province?: string | null
          reference_code?: string | null
          road_category?: string | null
          status?: Database["public"]["Enums"]["record_status"]
          title?: string
          updated_at?: string
          valuation_date?: string | null
          visibility?: Database["public"]["Enums"]["record_visibility"]
          ward?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      public_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string | null
          organization: string | null
          verification_status:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string | null
          organization?: string | null
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string | null
          organization?: string | null
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Relationships: []
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
      is_admin: { Args: never; Returns: boolean }
      is_valuator: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "guest" | "registered_valuator" | "admin"
      record_status: "draft" | "submitted" | "approved" | "archived"
      record_visibility: "private" | "universal"
      verification_status:
        | "guest"
        | "verification_pending"
        | "verified_valuator"
        | "admin"
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
    Enums: {
      app_role: ["guest", "registered_valuator", "admin"],
      record_status: ["draft", "submitted", "approved", "archived"],
      record_visibility: ["private", "universal"],
      verification_status: [
        "guest",
        "verification_pending",
        "verified_valuator",
        "admin",
      ],
    },
  },
} as const
