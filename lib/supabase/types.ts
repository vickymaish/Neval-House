export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      enquiries: { Row: { id: number; created_at: string; name: string; phone: string; email: string; check_in: string; check_out: string; guests: number; message: string | null; status: "new" | "contacted" | "confirmed" | "declined" }; Insert: { id?: number; created_at?: string; name: string; phone: string; email: string; check_in: string; check_out: string; guests: number; message?: string | null; status?: "new" | "contacted" | "confirmed" | "declined" }; Update: { id?: number; created_at?: string; name?: string; phone?: string; email?: string; check_in?: string; check_out?: string; guests?: number; message?: string | null; status?: "new" | "contacted" | "confirmed" | "declined" }; Relationships: [] };
      blocked_dates: { Row: { id: number; start_date: string; end_date: string; reason: string | null }; Insert: { id?: number; start_date: string; end_date: string; reason?: string | null }; Update: { id?: number; start_date?: string; end_date?: string; reason?: string | null }; Relationships: [] };
      site_settings: { Row: { key: string; value: Json }; Insert: { key: string; value: Json }; Update: { value?: Json }; Relationships: [] };
    };
    Views: Record<string, never>; Functions: Record<string, never>; Enums: Record<string, never>; CompositeTypes: Record<string, never>;
  };
};
