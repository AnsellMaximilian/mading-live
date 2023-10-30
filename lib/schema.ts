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
      chat_messages: {
        Row: {
          community_id: string
          content: string
          created_at: string
          id: string
          sender_username: string
          user_id: string
        }
        Insert: {
          community_id: string
          content: string
          created_at?: string
          id?: string
          sender_username: string
          user_id: string
        }
        Update: {
          community_id?: string
          content?: string
          created_at?: string
          id?: string
          sender_username?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_community_id_fkey"
            columns: ["community_id"]
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      communities: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          owner_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          owner_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          owner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communities_owner_id_fkey"
            columns: ["owner_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      community_invitations: {
        Row: {
          accepted: boolean | null
          community_id: string
          created_at: string
          id: string
          pending: boolean
          user_id: string
        }
        Insert: {
          accepted?: boolean | null
          community_id: string
          created_at?: string
          id?: string
          pending?: boolean
          user_id: string
        }
        Update: {
          accepted?: boolean | null
          community_id?: string
          created_at?: string
          id?: string
          pending?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_invitations_community_id_fkey"
            columns: ["community_id"]
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_invitations_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      community_members: {
        Row: {
          community_id: string
          created_at: string
          is_admin: boolean | null
          user_id: string
        }
        Insert: {
          community_id: string
          created_at?: string
          is_admin?: boolean | null
          user_id: string
        }
        Update: {
          community_id?: string
          created_at?: string
          is_admin?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_members_community_id_fkey"
            columns: ["community_id"]
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_members_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      notifications: {
        Row: {
          community_id: string | null
          content_id: string | null
          created_at: string
          description: string | null
          id: string
          read: boolean
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string | null
        }
        Insert: {
          community_id?: string | null
          content_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          read: boolean
          title: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string | null
        }
        Update: {
          community_id?: string | null
          content_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          read?: boolean
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_community_id_fkey"
            columns: ["community_id"]
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          username: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          username: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      org_ids_where_auth_user_is_admin_or_owner: {
        Args: Record<PropertyKey, never>
        Returns: string[]
      }
    }
    Enums: {
      notification_type: "community_invitation" | "info"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
