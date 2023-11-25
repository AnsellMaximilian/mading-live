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
          replied_message_id: string | null
          sender_username: string
          user_id: string
        }
        Insert: {
          community_id: string
          content: string
          created_at?: string
          id?: string
          replied_message_id?: string | null
          sender_username: string
          user_id: string
        }
        Update: {
          community_id?: string
          content?: string
          created_at?: string
          id?: string
          replied_message_id?: string | null
          sender_username?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_replied_message_id_fkey"
            columns: ["replied_message_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
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
            isOneToOne: false
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
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_invitations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
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
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
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
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      post_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string | null
          replied_comment_id: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id?: string | null
          replied_comment_id?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string | null
          replied_comment_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_replied_comment_id_fkey"
            columns: ["replied_comment_id"]
            isOneToOne: false
            referencedRelation: "post_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      posts: {
        Row: {
          author_id: string
          community_id: string
          content: string
          created_at: string
          id: string
          title: string
        }
        Insert: {
          author_id: string
          community_id: string
          content: string
          created_at?: string
          id?: string
          title: string
        }
        Update: {
          author_id?: string
          community_id?: string
          content?: string
          created_at?: string
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
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
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      survey_answers: {
        Row: {
          choice_id: string | null
          created_at: string
          custom_answer: string | null
          survey_id: string
          user_id: string
        }
        Insert: {
          choice_id?: string | null
          created_at?: string
          custom_answer?: string | null
          survey_id: string
          user_id: string
        }
        Update: {
          choice_id?: string | null
          created_at?: string
          custom_answer?: string | null
          survey_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_answers_choice_id_fkey"
            columns: ["choice_id"]
            isOneToOne: false
            referencedRelation: "survey_choices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_answers_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_answers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      survey_choices: {
        Row: {
          created_at: string
          description: string | null
          id: string
          survey_id: string
          text: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          survey_id: string
          text: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          survey_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_choices_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          }
        ]
      }
      surveys: {
        Row: {
          community_id: string
          created_at: string
          creator_id: string
          description: string | null
          id: string
          open: boolean
          title: string
        }
        Insert: {
          community_id: string
          created_at?: string
          creator_id: string
          description?: string | null
          id?: string
          open?: boolean
          title: string
        }
        Update: {
          community_id?: string
          created_at?: string
          creator_id?: string
          description?: string | null
          id?: string
          open?: boolean
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "surveys_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surveys_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
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
      notification_type:
        | "community_invitation"
        | "info"
        | "survey_creation"
        | "post_creation"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
