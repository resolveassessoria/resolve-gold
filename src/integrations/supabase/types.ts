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
          created_at: string
          id: string
          ip_address: string | null
          metadata: Json | null
          target_id: string | null
          target_table: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          target_id?: string | null
          target_table?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          target_id?: string | null
          target_table?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      expansion_points: {
        Row: {
          comprou_conteudo: boolean
          created_at: string
          id: string
          mes: string
          pontos: number
          user_id: string
        }
        Insert: {
          comprou_conteudo?: boolean
          created_at?: string
          id?: string
          mes: string
          pontos?: number
          user_id: string
        }
        Update: {
          comprou_conteudo?: boolean
          created_at?: string
          id?: string
          mes?: string
          pontos?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expansion_points_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      indications: {
        Row: {
          created_at: string
          id: string
          indicado_id: string
          indicador_id: string
          nivel: number
        }
        Insert: {
          created_at?: string
          id?: string
          indicado_id: string
          indicador_id: string
          nivel: number
        }
        Update: {
          created_at?: string
          id?: string
          indicado_id?: string
          indicador_id?: string
          nivel?: number
        }
        Relationships: [
          {
            foreignKeyName: "indications_indicado_id_fkey"
            columns: ["indicado_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "indications_indicador_id_fkey"
            columns: ["indicador_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      kyc_documents: {
        Row: {
          created_at: string
          document_type: string
          file_url: string
          id: string
          status: Database["public"]["Enums"]["status_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          document_type: string
          file_url: string
          id?: string
          status?: Database["public"]["Enums"]["status_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          document_type?: string
          file_url?: string
          id?: string
          status?: Database["public"]["Enums"]["status_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kyc_documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_products: {
        Row: {
          comissao_percentual: number
          created_at: string
          id: string
          nome: string
          preco: number
        }
        Insert: {
          comissao_percentual: number
          created_at?: string
          id?: string
          nome: string
          preco: number
        }
        Update: {
          comissao_percentual?: number
          created_at?: string
          id?: string
          nome?: string
          preco?: number
        }
        Relationships: []
      }
      marketplace_sales: {
        Row: {
          comissao_recebida: number
          corretor_id: string
          created_at: string
          id: string
          produto_id: string
          valor: number
        }
        Insert: {
          comissao_recebida: number
          corretor_id: string
          created_at?: string
          id?: string
          produto_id: string
          valor: number
        }
        Update: {
          comissao_recebida?: number
          corretor_id?: string
          created_at?: string
          id?: string
          produto_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_sales_corretor_id_fkey"
            columns: ["corretor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_sales_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "marketplace_products"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          cpf: string | null
          created_at: string
          email: string
          id: string
          nome: string
          status: Database["public"]["Enums"]["status_type"]
          telefone: string | null
          tipo_usuario: Database["public"]["Enums"]["tipo_usuario"]
          updated_at: string
        }
        Insert: {
          cpf?: string | null
          created_at?: string
          email: string
          id: string
          nome: string
          status?: Database["public"]["Enums"]["status_type"]
          telefone?: string | null
          tipo_usuario?: Database["public"]["Enums"]["tipo_usuario"]
          updated_at?: string
        }
        Update: {
          cpf?: string | null
          created_at?: string
          email?: string
          id?: string
          nome?: string
          status?: Database["public"]["Enums"]["status_type"]
          telefone?: string | null
          tipo_usuario?: Database["public"]["Enums"]["tipo_usuario"]
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          created_at: string
          id: string
          mes_referencia: string | null
          tipo: Database["public"]["Enums"]["transaction_type"]
          user_id: string
          valor: number
        }
        Insert: {
          created_at?: string
          id?: string
          mes_referencia?: string | null
          tipo: Database["public"]["Enums"]["transaction_type"]
          user_id: string
          valor: number
        }
        Update: {
          created_at?: string
          id?: string
          mes_referencia?: string | null
          tipo?: Database["public"]["Enums"]["transaction_type"]
          user_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      status_type: "pendente" | "aprovado" | "rejeitado"
      tipo_usuario:
        | "cliente"
        | "fomentador"
        | "corretor"
        | "franqueado"
        | "admin"
      transaction_type: "cashback" | "royalty" | "comissao" | "investimento"
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
      status_type: ["pendente", "aprovado", "rejeitado"],
      tipo_usuario: [
        "cliente",
        "fomentador",
        "corretor",
        "franqueado",
        "admin",
      ],
      transaction_type: ["cashback", "royalty", "comissao", "investimento"],
    },
  },
} as const
