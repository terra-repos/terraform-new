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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      api_access: {
        Row: {
          access_level: string | null
          api_key: string | null
          api_key_expiration: string | null
          created_at: string
          id: string
          organization_id: string | null
          updated_at: string | null
        }
        Insert: {
          access_level?: string | null
          api_key?: string | null
          api_key_expiration?: string | null
          created_at?: string
          id?: string
          organization_id?: string | null
          updated_at?: string | null
        }
        Update: {
          access_level?: string | null
          api_key?: string | null
          api_key_expiration?: string | null
          created_at?: string
          id?: string
          organization_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          allowed_origins: string[] | null
          created_at: string
          created_by_id: string
          expires_at: string | null
          hashed_key: string
          id: number
          is_active: boolean
          key: string
          last_used_at: string | null
          name: string
          organization_id: string | null
          scopes: string[] | null
          updated_at: string
        }
        Insert: {
          allowed_origins?: string[] | null
          created_at?: string
          created_by_id: string
          expires_at?: string | null
          hashed_key: string
          id?: number
          is_active?: boolean
          key: string
          last_used_at?: string | null
          name: string
          organization_id?: string | null
          scopes?: string[] | null
          updated_at?: string
        }
        Update: {
          allowed_origins?: string[] | null
          created_at?: string
          created_by_id?: string
          expires_at?: string | null
          hashed_key?: string
          id?: number
          is_active?: boolean
          key?: string
          last_used_at?: string | null
          name?: string
          organization_id?: string | null
          scopes?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      api_logs: {
        Row: {
          api_key: string
          api_url: string | null
          batch: string | null
          created_at: string
          environment: string | null
          event: string | null
          id: string
          request: Json | null
          response: Json | null
          success: boolean | null
        }
        Insert: {
          api_key: string
          api_url?: string | null
          batch?: string | null
          created_at?: string
          environment?: string | null
          event?: string | null
          id?: string
          request?: Json | null
          response?: Json | null
          success?: boolean | null
        }
        Update: {
          api_key?: string
          api_url?: string | null
          batch?: string | null
          created_at?: string
          environment?: string | null
          event?: string | null
          id?: string
          request?: Json | null
          response?: Json | null
          success?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "api_logs_api_key_fkey"
            columns: ["api_key"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["key"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          organization_id: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          organization_id?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          organization_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      browser_profiles: {
        Row: {
          cookies: Json | null
          created_at: string | null
          failure_count: number | null
          gologin_profile_id: string | null
          id: string
          is_authenticated: boolean | null
          last_used: string | null
          multilogin_profile_id: string | null
          status: string
          success_count: number | null
          updated_at: string | null
        }
        Insert: {
          cookies?: Json | null
          created_at?: string | null
          failure_count?: number | null
          gologin_profile_id?: string | null
          id?: string
          is_authenticated?: boolean | null
          last_used?: string | null
          multilogin_profile_id?: string | null
          status?: string
          success_count?: number | null
          updated_at?: string | null
        }
        Update: {
          cookies?: Json | null
          created_at?: string | null
          failure_count?: number | null
          gologin_profile_id?: string | null
          id?: string
          is_authenticated?: boolean | null
          last_used?: string | null
          multilogin_profile_id?: string | null
          status?: string
          success_count?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      collections: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          status: Database["public"]["Enums"]["collection_status"] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          status?: Database["public"]["Enums"]["collection_status"] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["collection_status"] | null
          updated_at?: string
        }
        Relationships: []
      }
      collections_products: {
        Row: {
          collection_id: string
          created_at: string | null
          position: number | null
          product_id: string
        }
        Insert: {
          collection_id?: string
          created_at?: string | null
          position?: number | null
          product_id?: string
        }
        Update: {
          collection_id?: string
          created_at?: string | null
          position?: number | null
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collections_products_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collections_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      data_exports: {
        Row: {
          created_at: string | null
          customer_data: Json | null
          id: number
          orders_data: Json | null
          request_id: string
          status: string
        }
        Insert: {
          created_at?: string | null
          customer_data?: Json | null
          id?: number
          orders_data?: Json | null
          request_id: string
          status: string
        }
        Update: {
          created_at?: string | null
          customer_data?: Json | null
          id?: number
          orders_data?: Json | null
          request_id?: string
          status?: string
        }
        Relationships: []
      }
      data_requests: {
        Row: {
          created_at: string | null
          customer_email: string | null
          customer_id: string
          id: number
          orders_requested: Json | null
          request_id: string
          shop_domain: string
          shop_id: string
          status: string
        }
        Insert: {
          created_at?: string | null
          customer_email?: string | null
          customer_id: string
          id?: number
          orders_requested?: Json | null
          request_id: string
          shop_domain: string
          shop_id: string
          status: string
        }
        Update: {
          created_at?: string | null
          customer_email?: string | null
          customer_id?: string
          id?: number
          orders_requested?: Json | null
          request_id?: string
          shop_domain?: string
          shop_id?: string
          status?: string
        }
        Relationships: []
      }
      drop_carts: {
        Row: {
          created_at: string
          drop_store_id: string
          id: string
          quantity: number | null
          session_id: string
          variant_id: string | null
        }
        Insert: {
          created_at: string
          drop_store_id?: string
          id?: string
          quantity?: number | null
          session_id?: string
          variant_id?: string | null
        }
        Update: {
          created_at?: string
          drop_store_id?: string
          id?: string
          quantity?: number | null
          session_id?: string
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "drop_carts_drop_store_id_fkey"
            columns: ["drop_store_id"]
            isOneToOne: false
            referencedRelation: "drop_stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drop_carts_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      drop_session: {
        Row: {
          created_at: string | null
          drop_store_id: string
          email_address: string
          id: string
          session_id: string
        }
        Insert: {
          created_at?: string | null
          drop_store_id: string
          email_address: string
          id?: string
          session_id: string
        }
        Update: {
          created_at?: string | null
          drop_store_id?: string
          email_address?: string
          id?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_drop_store_id"
            columns: ["drop_store_id"]
            isOneToOne: false
            referencedRelation: "drop_stores"
            referencedColumns: ["id"]
          },
        ]
      }
      drop_session_coupon_usage: {
        Row: {
          coupon_id: string
          discount_applied: number
          id: string
          order_id: string
          order_total: number | null
          session_id: string
          store_id: string
          used_at: string
        }
        Insert: {
          coupon_id: string
          discount_applied: number
          id?: string
          order_id: string
          order_total?: number | null
          session_id: string
          store_id: string
          used_at?: string
        }
        Update: {
          coupon_id?: string
          discount_applied?: number
          id?: string
          order_id?: string
          order_total?: number | null
          session_id?: string
          store_id?: string
          used_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "drop_session_coupon_usage_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_coupon_id"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "drop_store_coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_session_id"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "drop_session"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_usage_store_id"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "drop_stores"
            referencedColumns: ["id"]
          },
        ]
      }
      drop_store_coupons: {
        Row: {
          coupon_code: string
          created_at: string
          current_uses: number
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean
          max_uses: number | null
          minimum_order_value: number | null
          store_id: string
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          coupon_code: string
          created_at?: string
          current_uses?: number
          discount_type: string
          discount_value: number
          id?: string
          is_active?: boolean
          max_uses?: number | null
          minimum_order_value?: number | null
          store_id: string
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          coupon_code?: string
          created_at?: string
          current_uses?: number
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean
          max_uses?: number | null
          minimum_order_value?: number | null
          store_id?: string
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_store_id"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "drop_stores"
            referencedColumns: ["id"]
          },
        ]
      }
      drop_store_email_list: {
        Row: {
          created_at: string
          drop_store_id: string
          email_address: string | null
          id: string
          reason: string | null
          session_id: string
        }
        Insert: {
          created_at?: string
          drop_store_id?: string
          email_address?: string | null
          id?: string
          reason?: string | null
          session_id?: string
        }
        Update: {
          created_at?: string
          drop_store_id?: string
          email_address?: string | null
          id?: string
          reason?: string | null
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_drop_store_id"
            columns: ["drop_store_id"]
            isOneToOne: false
            referencedRelation: "drop_stores"
            referencedColumns: ["id"]
          },
        ]
      }
      drop_stores: {
        Row: {
          about_image: string | null
          about_message: string | null
          allows_international_shipping: boolean | null
          created_at: string | null
          creator_image: string | null
          creator_message: string | null
          custom_domain: string | null
          description: string | null
          facebook: string | null
          favicon_url: string | null
          hero_image: string | null
          hero_message: string | null
          id: string
          instagram: string | null
          location: string | null
          logo: string | null
          organization_id: string
          pinterest: string | null
          return_policy: number | null
          slug: string | null
          snapchat: string | null
          store_motto: string | null
          store_name: string | null
          tiktok: string | null
          tiktok_access_token: string | null
          tiktok_pixel: string | null
          top_left_image: string | null
          updated_at: string | null
          user_id: string
          x: string | null
          youtube: string | null
        }
        Insert: {
          about_image?: string | null
          about_message?: string | null
          allows_international_shipping?: boolean | null
          created_at?: string | null
          creator_image?: string | null
          creator_message?: string | null
          custom_domain?: string | null
          description?: string | null
          facebook?: string | null
          favicon_url?: string | null
          hero_image?: string | null
          hero_message?: string | null
          id?: string
          instagram?: string | null
          location?: string | null
          logo?: string | null
          organization_id: string
          pinterest?: string | null
          return_policy?: number | null
          slug?: string | null
          snapchat?: string | null
          store_motto?: string | null
          store_name?: string | null
          tiktok?: string | null
          tiktok_access_token?: string | null
          tiktok_pixel?: string | null
          top_left_image?: string | null
          updated_at?: string | null
          user_id: string
          x?: string | null
          youtube?: string | null
        }
        Update: {
          about_image?: string | null
          about_message?: string | null
          allows_international_shipping?: boolean | null
          created_at?: string | null
          creator_image?: string | null
          creator_message?: string | null
          custom_domain?: string | null
          description?: string | null
          facebook?: string | null
          favicon_url?: string | null
          hero_image?: string | null
          hero_message?: string | null
          id?: string
          instagram?: string | null
          location?: string | null
          logo?: string | null
          organization_id?: string
          pinterest?: string | null
          return_policy?: number | null
          slug?: string | null
          snapchat?: string | null
          store_motto?: string | null
          store_name?: string | null
          tiktok?: string | null
          tiktok_access_token?: string | null
          tiktok_pixel?: string | null
          top_left_image?: string | null
          updated_at?: string | null
          user_id?: string
          x?: string | null
          youtube?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "drop_stores_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_organization_id"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      dropstore_analytics: {
        Row: {
          browser_name: string | null
          browser_version: string | null
          button_click_count: number | null
          city: string | null
          country: string | null
          created_at: string | null
          current_route: string | null
          device_id: string
          device_type: string | null
          duration: number | null
          ip_address: unknown
          journey_path: Json | null
          last_view_timestamp: string | null
          screen_resolution: string | null
          total_view_count: number | null
          updated_at: string | null
          user_id: string | null
          visit_count: number | null
        }
        Insert: {
          browser_name?: string | null
          browser_version?: string | null
          button_click_count?: number | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          current_route?: string | null
          device_id: string
          device_type?: string | null
          duration?: number | null
          ip_address?: unknown
          journey_path?: Json | null
          last_view_timestamp?: string | null
          screen_resolution?: string | null
          total_view_count?: number | null
          updated_at?: string | null
          user_id?: string | null
          visit_count?: number | null
        }
        Update: {
          browser_name?: string | null
          browser_version?: string | null
          button_click_count?: number | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          current_route?: string | null
          device_id?: string
          device_type?: string | null
          duration?: number | null
          ip_address?: unknown
          journey_path?: Json | null
          last_view_timestamp?: string | null
          screen_resolution?: string | null
          total_view_count?: number | null
          updated_at?: string | null
          user_id?: string | null
          visit_count?: number | null
        }
        Relationships: []
      }
      error_logs: {
        Row: {
          chat_id: string | null
          context: Database["public"]["Enums"]["error_context"]
          created_at: string | null
          current_product_json: Json | null
          error: string | null
          error_digest: string | null
          error_message: string | null
          event: string | null
          gen_type: string | null
          id: string
          notes: Json | null
          path: string | null
          retries: number | null
          status: Database["public"]["Enums"]["error_status"] | null
          user_id: string | null
        }
        Insert: {
          chat_id?: string | null
          context?: Database["public"]["Enums"]["error_context"]
          created_at?: string | null
          current_product_json?: Json | null
          error?: string | null
          error_digest?: string | null
          error_message?: string | null
          event?: string | null
          gen_type?: string | null
          id?: string
          notes?: Json | null
          path?: string | null
          retries?: number | null
          status?: Database["public"]["Enums"]["error_status"] | null
          user_id?: string | null
        }
        Update: {
          chat_id?: string | null
          context?: Database["public"]["Enums"]["error_context"]
          created_at?: string | null
          current_product_json?: Json | null
          error?: string | null
          error_digest?: string | null
          error_message?: string | null
          event?: string | null
          gen_type?: string | null
          id?: string
          notes?: Json | null
          path?: string | null
          retries?: number | null
          status?: Database["public"]["Enums"]["error_status"] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_chat_user"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "user_generated_products"
            referencedColumns: ["id"]
          },
        ]
      }
      factories: {
        Row: {
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          contact_wechat: string | null
          contact_whatsapp: string | null
          created_at: string
          custom_design_service: boolean | null
          cutoff_date: string | null
          description: string | null
          details: Json | null
          factory_size: string | null
          factory_type: string | null
          id: string
          image: string | null
          images: string[] | null
          lead_time: string | null
          location: string | null
          name: string | null
          number_of_employees: string | null
          pdp_blurb: string | null
          r_and_d_capability: boolean | null
          sales: number | null
          site_url: string | null
          year_established: string | null
        }
        Insert: {
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contact_wechat?: string | null
          contact_whatsapp?: string | null
          created_at?: string
          custom_design_service?: boolean | null
          cutoff_date?: string | null
          description?: string | null
          details?: Json | null
          factory_size?: string | null
          factory_type?: string | null
          id?: string
          image?: string | null
          images?: string[] | null
          lead_time?: string | null
          location?: string | null
          name?: string | null
          number_of_employees?: string | null
          pdp_blurb?: string | null
          r_and_d_capability?: boolean | null
          sales?: number | null
          site_url?: string | null
          year_established?: string | null
        }
        Update: {
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contact_wechat?: string | null
          contact_whatsapp?: string | null
          created_at?: string
          custom_design_service?: boolean | null
          cutoff_date?: string | null
          description?: string | null
          details?: Json | null
          factory_size?: string | null
          factory_type?: string | null
          id?: string
          image?: string | null
          images?: string[] | null
          lead_time?: string | null
          location?: string | null
          name?: string | null
          number_of_employees?: string | null
          pdp_blurb?: string | null
          r_and_d_capability?: boolean | null
          sales?: number | null
          site_url?: string | null
          year_established?: string | null
        }
        Relationships: []
      }
      factory_order_updates: {
        Row: {
          approved_by_admin_date: string | null
          approved_by_admin_id: string | null
          approved_by_customer_date: string | null
          approved_by_customer_id: string | null
          created_at: string | null
          customer_note: string | null
          domestic_tracking: Json | null
          factory_id: string
          id: string
          images: Json | null
          notes: string | null
          order_id: string | null
          order_item_id: string | null
          status: string | null
          updated_at: string | null
          viewable_by_customer: boolean | null
        }
        Insert: {
          approved_by_admin_date?: string | null
          approved_by_admin_id?: string | null
          approved_by_customer_date?: string | null
          approved_by_customer_id?: string | null
          created_at?: string | null
          customer_note?: string | null
          domestic_tracking?: Json | null
          factory_id?: string
          id?: string
          images?: Json | null
          notes?: string | null
          order_id?: string | null
          order_item_id?: string | null
          status?: string | null
          updated_at?: string | null
          viewable_by_customer?: boolean | null
        }
        Update: {
          approved_by_admin_date?: string | null
          approved_by_admin_id?: string | null
          approved_by_customer_date?: string | null
          approved_by_customer_id?: string | null
          created_at?: string | null
          customer_note?: string | null
          domestic_tracking?: Json | null
          factory_id?: string
          id?: string
          images?: Json | null
          notes?: string | null
          order_id?: string | null
          order_item_id?: string | null
          status?: string | null
          updated_at?: string | null
          viewable_by_customer?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "factory_order_updates_approved_by_admin_id_fkey"
            columns: ["approved_by_admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "factory_order_updates_approved_by_customer_id_fkey"
            columns: ["approved_by_customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "factory_order_updates_factory_id_fkey"
            columns: ["factory_id"]
            isOneToOne: false
            referencedRelation: "factories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "factory_order_updates_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "factory_order_updates_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
        ]
      }
      image_generation_hashes: {
        Row: {
          created_at: string | null
          id: string
          prompt: string
          request_hash: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          prompt: string
          request_hash: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          prompt?: string
          request_hash?: string
          user_id?: string
        }
        Relationships: []
      }
      influencers: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          drop_store_id: string | null
          facebook: Json | null
          id: string
          instagram: Json | null
          name: string
          notes: string | null
          pinterest: Json | null
          snapchat: Json | null
          tiktok: Json | null
          total_followers: number | null
          updated_at: string | null
          x: Json | null
          youtube: Json | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          drop_store_id?: string | null
          facebook?: Json | null
          id?: string
          instagram?: Json | null
          name: string
          notes?: string | null
          pinterest?: Json | null
          snapchat?: Json | null
          tiktok?: Json | null
          total_followers?: number | null
          updated_at?: string | null
          x?: Json | null
          youtube?: Json | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          drop_store_id?: string | null
          facebook?: Json | null
          id?: string
          instagram?: Json | null
          name?: string
          notes?: string | null
          pinterest?: Json | null
          snapchat?: Json | null
          tiktok?: Json | null
          total_followers?: number | null
          updated_at?: string | null
          x?: Json | null
          youtube?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "influencers_drop_store_id_fkey"
            columns: ["drop_store_id"]
            isOneToOne: false
            referencedRelation: "drop_stores"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount_paid: number | null
          amount_refunded: number | null
          amount_remaining: number | null
          billing_address: Json | null
          billing_email: string | null
          billing_name: string | null
          billing_phone: string | null
          created_at: string | null
          created_by: string
          currency: string
          deleted_at: string | null
          due_date: string | null
          id: string
          internal_notes: string | null
          invoice_number: string | null
          issue_date: string | null
          metadata: Json | null
          notes: string | null
          order_id: string | null
          organization_id: string
          paid_date: string | null
          payment_terms: string | null
          shipping_cost: number | null
          status: Database["public"]["Enums"]["invoice_status"]
          stripe_customer_id: string | null
          stripe_invoice_id: string | null
          subtotal: number
          tax: number | null
          tax_id: string | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          amount_paid?: number | null
          amount_refunded?: number | null
          amount_remaining?: number | null
          billing_address?: Json | null
          billing_email?: string | null
          billing_name?: string | null
          billing_phone?: string | null
          created_at?: string | null
          created_by: string
          currency: string
          deleted_at?: string | null
          due_date?: string | null
          id?: string
          internal_notes?: string | null
          invoice_number?: string | null
          issue_date?: string | null
          metadata?: Json | null
          notes?: string | null
          order_id?: string | null
          organization_id: string
          paid_date?: string | null
          payment_terms?: string | null
          shipping_cost?: number | null
          status?: Database["public"]["Enums"]["invoice_status"]
          stripe_customer_id?: string | null
          stripe_invoice_id?: string | null
          subtotal: number
          tax?: number | null
          tax_id?: string | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          amount_paid?: number | null
          amount_refunded?: number | null
          amount_remaining?: number | null
          billing_address?: Json | null
          billing_email?: string | null
          billing_name?: string | null
          billing_phone?: string | null
          created_at?: string | null
          created_by?: string
          currency?: string
          deleted_at?: string | null
          due_date?: string | null
          id?: string
          internal_notes?: string | null
          invoice_number?: string | null
          issue_date?: string | null
          metadata?: Json | null
          notes?: string | null
          order_id?: string | null
          organization_id?: string
          paid_date?: string | null
          payment_terms?: string | null
          shipping_cost?: number | null
          status?: Database["public"]["Enums"]["invoice_status"]
          stripe_customer_id?: string | null
          stripe_invoice_id?: string | null
          subtotal?: number
          tax?: number | null
          tax_id?: string | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      logs: {
        Row: {
          created_at: string | null
          id: string
          input: string | null
          message: string
          product_state: Json | null
          quote_id: string
          source: string | null
          stage: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          input?: string | null
          message: string
          product_state?: Json | null
          quote_id: string
          source?: string | null
          stage?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          input?: string | null
          message?: string
          product_state?: Json | null
          quote_id?: string
          source?: string | null
          stage?: string | null
          status?: string | null
        }
        Relationships: []
      }
      mass_production_rule_factories: {
        Row: {
          created_at: string | null
          daily_capacity: number | null
          factory_id: string
          id: string
          is_active: boolean | null
          priority: number | null
          rule_id: string
          variant_id: string | null
          weight: number | null
        }
        Insert: {
          created_at?: string | null
          daily_capacity?: number | null
          factory_id: string
          id?: string
          is_active?: boolean | null
          priority?: number | null
          rule_id: string
          variant_id?: string | null
          weight?: number | null
        }
        Update: {
          created_at?: string | null
          daily_capacity?: number | null
          factory_id?: string
          id?: string
          is_active?: boolean | null
          priority?: number | null
          rule_id?: string
          variant_id?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mass_production_rule_factories_factory_id_fkey"
            columns: ["factory_id"]
            isOneToOne: false
            referencedRelation: "factories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mass_production_rule_factories_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "mass_production_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mass_production_rule_factories_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      mass_production_rules: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          priority: number | null
          product_id: string
          rule_type: Database["public"]["Enums"]["production_rule_type"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          priority?: number | null
          product_id: string
          rule_type: Database["public"]["Enums"]["production_rule_type"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          priority?: number | null
          product_id?: string
          rule_type?: Database["public"]["Enums"]["production_rule_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mass_production_rules_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          createdAt: string | null
          id: string
          is_read: boolean | null
          message: string | null
          redirect_url: string | null
          sender_user_id: string | null
          type: string | null
          user_id: string | null
        }
        Insert: {
          createdAt?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          redirect_url?: string | null
          sender_user_id?: string | null
          type?: string | null
          user_id?: string | null
        }
        Update: {
          createdAt?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          redirect_url?: string | null
          sender_user_id?: string | null
          type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_sender_user_id_fkey"
            columns: ["sender_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      onboarding_responses: {
        Row: {
          created_at: string | null
          session_id: string
          step_design_categories: string[] | null
          step_own_photos: string[] | null
          step_source: string[] | null
          step_style: string[] | null
          step_why: string[] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          session_id: string
          step_design_categories?: string[] | null
          step_own_photos?: string[] | null
          step_source?: string[] | null
          step_style?: string[] | null
          step_why?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          session_id?: string
          step_design_categories?: string[] | null
          step_own_photos?: string[] | null
          step_source?: string[] | null
          step_style?: string[] | null
          step_why?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_responses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      option_values: {
        Row: {
          created_at: string
          id: string
          option_id: string | null
          position: number | null
          product_id: string | null
          updated_at: string | null
          value: string | null
          variant_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          option_id?: string | null
          position?: number | null
          product_id?: string | null
          updated_at?: string | null
          value?: string | null
          variant_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          option_id?: string | null
          position?: number | null
          product_id?: string | null
          updated_at?: string | null
          value?: string | null
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "option_values_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "option_values_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      options: {
        Row: {
          created_at: string
          id: string
          option_type: string
          position: number | null
          product_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          option_type: string
          position?: number | null
          product_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          option_type?: string
          position?: number | null
          product_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "options_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          acknowledged: boolean | null
          actual_delivery_date: string | null
          arrived_at_forwarder: boolean | null
          assigned_at: string | null
          created_at: string | null
          currency: string | null
          customizations: Json | null
          deleted_at: string | null
          estimated_delivery_date: string | null
          factory_sku: string | null
          id: string
          internal_order_item_status: Database["public"]["Enums"]["order_item_status"]
          local_pickup: boolean | null
          notes: string | null
          order_id: string
          production_factory_id: string | null
          profit: number | null
          quantity: number
          remake_parent_order_item_id: string | null
          remake_reason: string | null
          shipping_method: string | null
          shipping_price: number | null
          sourcing_agent_id: string | null
          specifications: Json | null
          status: Database["public"]["Enums"]["order_status"]
          supervisor_id: string | null
          total_price: number | null
          tracking_number: string | null
          unit_price: number | null
          unit_shipping_air: number | null
          unit_shipping_ocean: number | null
          updated_at: string | null
          variant_id: string | null
        }
        Insert: {
          acknowledged?: boolean | null
          actual_delivery_date?: string | null
          arrived_at_forwarder?: boolean | null
          assigned_at?: string | null
          created_at?: string | null
          currency?: string | null
          customizations?: Json | null
          deleted_at?: string | null
          estimated_delivery_date?: string | null
          factory_sku?: string | null
          id?: string
          internal_order_item_status?: Database["public"]["Enums"]["order_item_status"]
          local_pickup?: boolean | null
          notes?: string | null
          order_id: string
          production_factory_id?: string | null
          profit?: number | null
          quantity: number
          remake_parent_order_item_id?: string | null
          remake_reason?: string | null
          shipping_method?: string | null
          shipping_price?: number | null
          sourcing_agent_id?: string | null
          specifications?: Json | null
          status?: Database["public"]["Enums"]["order_status"]
          supervisor_id?: string | null
          total_price?: number | null
          tracking_number?: string | null
          unit_price?: number | null
          unit_shipping_air?: number | null
          unit_shipping_ocean?: number | null
          updated_at?: string | null
          variant_id?: string | null
        }
        Update: {
          acknowledged?: boolean | null
          actual_delivery_date?: string | null
          arrived_at_forwarder?: boolean | null
          assigned_at?: string | null
          created_at?: string | null
          currency?: string | null
          customizations?: Json | null
          deleted_at?: string | null
          estimated_delivery_date?: string | null
          factory_sku?: string | null
          id?: string
          internal_order_item_status?: Database["public"]["Enums"]["order_item_status"]
          local_pickup?: boolean | null
          notes?: string | null
          order_id?: string
          production_factory_id?: string | null
          profit?: number | null
          quantity?: number
          remake_parent_order_item_id?: string | null
          remake_reason?: string | null
          shipping_method?: string | null
          shipping_price?: number | null
          sourcing_agent_id?: string | null
          specifications?: Json | null
          status?: Database["public"]["Enums"]["order_status"]
          supervisor_id?: string | null
          total_price?: number | null
          tracking_number?: string | null
          unit_price?: number | null
          unit_shipping_air?: number | null
          unit_shipping_ocean?: number | null
          updated_at?: string | null
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_production_factory_id_fkey"
            columns: ["production_factory_id"]
            isOneToOne: false
            referencedRelation: "factories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_remake_parent_order_item_id_fkey"
            columns: ["remake_parent_order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_sourcing_agent_id_fkey"
            columns: ["sourcing_agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "order_items_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      order_timeline: {
        Row: {
          actor_id: string | null
          actor_name: string | null
          actor_type: string | null
          attachments: string[] | null
          created_at: string | null
          event_description: string | null
          event_title: string
          event_type: string
          id: string
          metadata: Json | null
          order_id: string | null
          order_item_id: string | null
          updated_at: string | null
          visibility: string | null
        }
        Insert: {
          actor_id?: string | null
          actor_name?: string | null
          actor_type?: string | null
          attachments?: string[] | null
          created_at?: string | null
          event_description?: string | null
          event_title: string
          event_type: string
          id?: string
          metadata?: Json | null
          order_id?: string | null
          order_item_id?: string | null
          updated_at?: string | null
          visibility?: string | null
        }
        Update: {
          actor_id?: string | null
          actor_name?: string | null
          actor_type?: string | null
          attachments?: string[] | null
          created_at?: string | null
          event_description?: string | null
          event_title?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          order_id?: string | null
          order_item_id?: string | null
          updated_at?: string | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_timeline_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_timeline_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
        ]
      }
      order_timeline_ack: {
        Row: {
          created_at: string | null
          email: string
          id: string
          order_timeline_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          order_timeline_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          order_timeline_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_timeline_ack_order_timeline_id_fkey"
            columns: ["order_timeline_id"]
            isOneToOne: false
            referencedRelation: "order_timeline"
            referencedColumns: ["id"]
          },
        ]
      }
      order_timeline_communication: {
        Row: {
          created_at: string | null
          id: string
          influencer_email: string | null
          last_responder: string | null
          message_count: number | null
          messages: Json
          order_timeline_id: string
          reminder_counter: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          influencer_email?: string | null
          last_responder?: string | null
          message_count?: number | null
          messages?: Json
          order_timeline_id: string
          reminder_counter?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          influencer_email?: string | null
          last_responder?: string | null
          message_count?: number | null
          messages?: Json
          order_timeline_id?: string
          reminder_counter?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_timeline_communication_order_timeline_id_fkey"
            columns: ["order_timeline_id"]
            isOneToOne: false
            referencedRelation: "order_timeline"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          approved_by: string | null
          billing_address: Json | null
          cancelled_by: string | null
          confirmation_date: string | null
          contact_email: string | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          deleted_at: string | null
          factory_id: string | null
          factory_order_number: string | null
          formatted_notes: Json | null
          id: string
          internal_files: Json | null
          internal_notes: string | null
          invoices: Json | null
          metadata: Json | null
          notes: string | null
          order_date: string | null
          order_number: string | null
          order_source: string | null
          organization_id: string
          payment_terms: string | null
          po_number: string | null
          project_id: string | null
          shipping_address: Json | null
          shipping_cost: number | null
          shipping_method: string | null
          shipping_notes: string | null
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number | null
          tags: string[] | null
          tax: number | null
          total_cost: number | null
          updated_at: string | null
        }
        Insert: {
          approved_by?: string | null
          billing_address?: Json | null
          cancelled_by?: string | null
          confirmation_date?: string | null
          contact_email?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          deleted_at?: string | null
          factory_id?: string | null
          factory_order_number?: string | null
          formatted_notes?: Json | null
          id?: string
          internal_files?: Json | null
          internal_notes?: string | null
          invoices?: Json | null
          metadata?: Json | null
          notes?: string | null
          order_date?: string | null
          order_number?: string | null
          order_source?: string | null
          organization_id: string
          payment_terms?: string | null
          po_number?: string | null
          project_id?: string | null
          shipping_address?: Json | null
          shipping_cost?: number | null
          shipping_method?: string | null
          shipping_notes?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number | null
          tags?: string[] | null
          tax?: number | null
          total_cost?: number | null
          updated_at?: string | null
        }
        Update: {
          approved_by?: string | null
          billing_address?: Json | null
          cancelled_by?: string | null
          confirmation_date?: string | null
          contact_email?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          deleted_at?: string | null
          factory_id?: string | null
          factory_order_number?: string | null
          formatted_notes?: Json | null
          id?: string
          internal_files?: Json | null
          internal_notes?: string | null
          invoices?: Json | null
          metadata?: Json | null
          notes?: string | null
          order_date?: string | null
          order_number?: string | null
          order_source?: string | null
          organization_id?: string
          payment_terms?: string | null
          po_number?: string | null
          project_id?: string | null
          shipping_address?: Json | null
          shipping_cost?: number | null
          shipping_method?: string | null
          shipping_notes?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number | null
          tags?: string[] | null
          tax?: number | null
          total_cost?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_departments: {
        Row: {
          budget_code: string | null
          code: string | null
          cost_center: string | null
          created_at: string | null
          id: string
          name: string
          organization_id: string
          parent_department_id: string | null
          updated_at: string | null
        }
        Insert: {
          budget_code?: string | null
          code?: string | null
          cost_center?: string | null
          created_at?: string | null
          id?: string
          name: string
          organization_id: string
          parent_department_id?: string | null
          updated_at?: string | null
        }
        Update: {
          budget_code?: string | null
          code?: string | null
          cost_center?: string | null
          created_at?: string | null
          id?: string
          name?: string
          organization_id?: string
          parent_department_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_departments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_departments_parent_department_id_fkey"
            columns: ["parent_department_id"]
            isOneToOne: false
            referencedRelation: "organization_departments"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_invites: {
        Row: {
          created_at: string | null
          email: string
          expires_at: string | null
          id: string
          invited_by: string | null
          metadata: Json | null
          organization_id: string | null
          permissions: string[] | null
          role: string | null
          token: string
        }
        Insert: {
          created_at?: string | null
          email: string
          expires_at?: string | null
          id?: string
          invited_by?: string | null
          metadata?: Json | null
          organization_id?: string | null
          permissions?: string[] | null
          role?: string | null
          token: string
        }
        Update: {
          created_at?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          invited_by?: string | null
          metadata?: Json | null
          organization_id?: string | null
          permissions?: string[] | null
          role?: string | null
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_invites_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_locations: {
        Row: {
          address: Json
          contact_email: string | null
          contact_person: string | null
          contact_phone: string | null
          created_at: string | null
          id: string
          is_headquarters: boolean | null
          name: string
          organization_id: string
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          address: Json
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          is_headquarters?: boolean | null
          name: string
          organization_id: string
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: Json
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          is_headquarters?: boolean | null
          name?: string
          organization_id?: string
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_locations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_magic_links: {
        Row: {
          created_at: string
          created_by: string
          expires_at: string | null
          id: string
          max_uses: number | null
          organization_id: string
          token: string
          used_count: number | null
        }
        Insert: {
          created_at?: string
          created_by: string
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          organization_id: string
          token: string
          used_count?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          organization_id?: string
          token?: string
          used_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_magic_links_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_member_roles: {
        Row: {
          assigned_at: string | null
          assigned_by_profile_id: string
          created_at: string | null
          deleted_at: string | null
          id: string
          organization_member_id: string
          role_id: string
          updated_at: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by_profile_id: string
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          organization_member_id: string
          role_id: string
          updated_at?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by_profile_id?: string
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          organization_member_id?: string
          role_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_member_roles_assigned_by_profile_id_fkey"
            columns: ["assigned_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "organization_member_roles_organization_member_id_fkey"
            columns: ["organization_member_id"]
            isOneToOne: false
            referencedRelation: "organization_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_member_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "organization_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          approval_limit: number | null
          created_at: string | null
          deleted_at: string | null
          department_id: string | null
          id: string
          invited_at: string | null
          job_title: string | null
          joined_at: string | null
          metadata: Json | null
          organization_id: string
          requires_approval: boolean | null
          role: Database["public"]["Enums"]["organization_role"]
          settings: Json | null
          status: Database["public"]["Enums"]["org_member_status"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          approval_limit?: number | null
          created_at?: string | null
          deleted_at?: string | null
          department_id?: string | null
          id?: string
          invited_at?: string | null
          job_title?: string | null
          joined_at?: string | null
          metadata?: Json | null
          organization_id: string
          requires_approval?: boolean | null
          role?: Database["public"]["Enums"]["organization_role"]
          settings?: Json | null
          status?: Database["public"]["Enums"]["org_member_status"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          approval_limit?: number | null
          created_at?: string | null
          deleted_at?: string | null
          department_id?: string | null
          id?: string
          invited_at?: string | null
          job_title?: string | null
          joined_at?: string | null
          metadata?: Json | null
          organization_id?: string
          requires_approval?: boolean | null
          role?: Database["public"]["Enums"]["organization_role"]
          settings?: Json | null
          status?: Database["public"]["Enums"]["org_member_status"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "organization_departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_user_id_fkey1"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      organization_payment_methods: {
        Row: {
          billing_address: Json | null
          billing_email: string | null
          billing_name: string | null
          billing_phone: string | null
          card_brand: string | null
          card_expiration_month: number | null
          card_expiration_year: number | null
          card_last_four: string | null
          created_at: string | null
          id: string
          is_default: boolean | null
          nickname: string | null
          organization_id: string
          stripe_payment_method_id: string
          updated_at: string | null
        }
        Insert: {
          billing_address?: Json | null
          billing_email?: string | null
          billing_name?: string | null
          billing_phone?: string | null
          card_brand?: string | null
          card_expiration_month?: number | null
          card_expiration_year?: number | null
          card_last_four?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          nickname?: string | null
          organization_id?: string
          stripe_payment_method_id: string
          updated_at?: string | null
        }
        Update: {
          billing_address?: Json | null
          billing_email?: string | null
          billing_name?: string | null
          billing_phone?: string | null
          card_brand?: string | null
          card_expiration_month?: number | null
          card_expiration_year?: number | null
          card_last_four?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          nickname?: string | null
          organization_id?: string
          stripe_payment_method_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_payment_methods_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_roles: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          description: string | null
          id: string
          is_system_role: boolean | null
          name: string
          organization_id: string | null
          permissions: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_system_role?: boolean | null
          name?: string
          organization_id?: string | null
          permissions?: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_system_role?: boolean | null
          name?: string
          organization_id?: string | null
          permissions?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_subscriptions: {
        Row: {
          created_at: string | null
          end_date: string | null
          features: Json
          id: string
          metadata: Json | null
          organization_id: string
          payment_method_id: string | null
          start_date: string
          status: Database["public"]["Enums"]["subscription_status"] | null
          stripe_subscription_id: string | null
          tier: Database["public"]["Enums"]["subscription_tier"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          features: Json
          id?: string
          metadata?: Json | null
          organization_id: string
          payment_method_id?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["subscription_status"] | null
          stripe_subscription_id?: string | null
          tier?: Database["public"]["Enums"]["subscription_tier"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          features?: Json
          id?: string
          metadata?: Json | null
          organization_id?: string
          payment_method_id?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["subscription_status"] | null
          stripe_subscription_id?: string | null
          tier?: Database["public"]["Enums"]["subscription_tier"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_subscriptions_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "organization_payment_methods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          addresses: Json[] | null
          api_access_id: string | null
          business_type: string | null
          created_at: string | null
          credit_limit: number | null
          deleted_at: string | null
          display_name: string | null
          duns_number: string | null
          id: string
          industry: string | null
          integrations: Json | null
          metadata: Json | null
          name: string
          org_path: string | null
          org_size: Database["public"]["Enums"]["org_size"] | null
          parent_org_id: string | null
          payment_terms: string | null
          preferred_currency: string | null
          primary_contact_name: string | null
          primary_contact_phone: string | null
          primary_contact_title: string | null
          primary_email: string | null
          primary_phone: string | null
          purchase_order_prefix: string | null
          registration_number: string | null
          requires_po_number: boolean | null
          root_org_id: string | null
          secondary_email: string | null
          secondary_phone: string | null
          settings: Json | null
          status: Database["public"]["Enums"]["org_status"] | null
          stripe_customer_id: string | null
          tax_id: string | null
          type: string
          updated_at: string | null
          vat_number: string | null
          website: string | null
        }
        Insert: {
          addresses?: Json[] | null
          api_access_id?: string | null
          business_type?: string | null
          created_at?: string | null
          credit_limit?: number | null
          deleted_at?: string | null
          display_name?: string | null
          duns_number?: string | null
          id?: string
          industry?: string | null
          integrations?: Json | null
          metadata?: Json | null
          name: string
          org_path?: string | null
          org_size?: Database["public"]["Enums"]["org_size"] | null
          parent_org_id?: string | null
          payment_terms?: string | null
          preferred_currency?: string | null
          primary_contact_name?: string | null
          primary_contact_phone?: string | null
          primary_contact_title?: string | null
          primary_email?: string | null
          primary_phone?: string | null
          purchase_order_prefix?: string | null
          registration_number?: string | null
          requires_po_number?: boolean | null
          root_org_id?: string | null
          secondary_email?: string | null
          secondary_phone?: string | null
          settings?: Json | null
          status?: Database["public"]["Enums"]["org_status"] | null
          stripe_customer_id?: string | null
          tax_id?: string | null
          type?: string
          updated_at?: string | null
          vat_number?: string | null
          website?: string | null
        }
        Update: {
          addresses?: Json[] | null
          api_access_id?: string | null
          business_type?: string | null
          created_at?: string | null
          credit_limit?: number | null
          deleted_at?: string | null
          display_name?: string | null
          duns_number?: string | null
          id?: string
          industry?: string | null
          integrations?: Json | null
          metadata?: Json | null
          name?: string
          org_path?: string | null
          org_size?: Database["public"]["Enums"]["org_size"] | null
          parent_org_id?: string | null
          payment_terms?: string | null
          preferred_currency?: string | null
          primary_contact_name?: string | null
          primary_contact_phone?: string | null
          primary_contact_title?: string | null
          primary_email?: string | null
          primary_phone?: string | null
          purchase_order_prefix?: string | null
          registration_number?: string | null
          requires_po_number?: boolean | null
          root_org_id?: string | null
          secondary_email?: string | null
          secondary_phone?: string | null
          settings?: Json | null
          status?: Database["public"]["Enums"]["org_status"] | null
          stripe_customer_id?: string | null
          tax_id?: string | null
          type?: string
          updated_at?: string | null
          vat_number?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_parent_org_id_fkey"
            columns: ["parent_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organizations_root_org_id_fkey"
            columns: ["root_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          amount_refunded: number | null
          card_brand: string | null
          card_last4: string | null
          created_at: string | null
          created_by: string
          currency: string
          deleted_at: string | null
          failure_code: string | null
          failure_message: string | null
          id: string
          invoice_id: string | null
          metadata: Json | null
          order_id: string | null
          organization_id: string
          payment_method_type: string | null
          receipt_url: string | null
          refund_reason: string | null
          status: Database["public"]["Enums"]["payment_status"]
          stripe_charge_id: string | null
          stripe_payment_intent_id: string | null
          stripe_payment_method_id: string | null
          stripe_refund_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          amount_refunded?: number | null
          card_brand?: string | null
          card_last4?: string | null
          created_at?: string | null
          created_by: string
          currency: string
          deleted_at?: string | null
          failure_code?: string | null
          failure_message?: string | null
          id?: string
          invoice_id?: string | null
          metadata?: Json | null
          order_id?: string | null
          organization_id: string
          payment_method_type?: string | null
          receipt_url?: string | null
          refund_reason?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          stripe_charge_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_payment_method_id?: string | null
          stripe_refund_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          amount_refunded?: number | null
          card_brand?: string | null
          card_last4?: string | null
          created_at?: string | null
          created_by?: string
          currency?: string
          deleted_at?: string | null
          failure_code?: string | null
          failure_message?: string | null
          id?: string
          invoice_id?: string | null
          metadata?: Json | null
          order_id?: string | null
          organization_id?: string
          payment_method_type?: string | null
          receipt_url?: string | null
          refund_reason?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          stripe_charge_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_payment_method_id?: string | null
          stripe_refund_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      product_feed: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          dimensions: string | null
          enriched_title: string | null
          excluded_terms: string[] | null
          id: string
          image: string | null
          initial_url: string | null
          material: string[] | null
          materials: string | null
          product_state: Json | null
          random_sort: number | null
          search_synonyms: string[] | null
          search_tags: string[] | null
          search_vector: unknown
          specifications: string | null
          style: string | null
          sub_category: string | null
          tag_confidence_score: number | null
          tag_generation_date: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          dimensions?: string | null
          enriched_title?: string | null
          excluded_terms?: string[] | null
          id?: string
          image?: string | null
          initial_url?: string | null
          material?: string[] | null
          materials?: string | null
          product_state?: Json | null
          random_sort?: number | null
          search_synonyms?: string[] | null
          search_tags?: string[] | null
          search_vector?: unknown
          specifications?: string | null
          style?: string | null
          sub_category?: string | null
          tag_confidence_score?: number | null
          tag_generation_date?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          dimensions?: string | null
          enriched_title?: string | null
          excluded_terms?: string[] | null
          id?: string
          image?: string | null
          initial_url?: string | null
          material?: string[] | null
          materials?: string | null
          product_state?: Json | null
          random_sort?: number | null
          search_synonyms?: string[] | null
          search_tags?: string[] | null
          search_vector?: unknown
          specifications?: string | null
          style?: string | null
          sub_category?: string | null
          tag_confidence_score?: number | null
          tag_generation_date?: string | null
        }
        Relationships: []
      }
      product_feed_bookmarks: {
        Row: {
          id: string
          product_feed_id: string
          user_id: string | null
        }
        Insert: {
          id?: string
          product_feed_id?: string
          user_id?: string | null
        }
        Update: {
          id?: string
          product_feed_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_feed_bookmarks_product_feed_id_fkey"
            columns: ["product_feed_id"]
            isOneToOne: false
            referencedRelation: "product_feed"
            referencedColumns: ["id"]
          },
        ]
      }
      product_notes: {
        Row: {
          created_at: string | null
          id: string
          note: string | null
          order_id: string | null
          order_item_id: string | null
          product_id: string
          project_id: string | null
          variant_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          note?: string | null
          order_id?: string | null
          order_item_id?: string | null
          product_id?: string
          project_id?: string | null
          variant_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          note?: string | null
          order_id?: string | null
          order_item_id?: string | null
          product_id?: string
          project_id?: string | null
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_notes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_notes_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_notes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_notes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_notes_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          air_shipping_cost: number | null
          barcode: string | null
          cartons_per_pallet: number | null
          client_restrictions: Json | null
          colors: Json | null
          compare_at_price: number | null
          cost_price: number | null
          country_of_origin: string | null
          created_at: string | null
          deleted_at: string | null
          design_files: string | null
          dimension_unit: string | null
          dimensions: Json | null
          documentation_files: Json | null
          drop_approved: boolean
          drop_custom_price: number | null
          drop_description: string | null
          drop_public: boolean
          factory_id: string | null
          factory_lead_time_days: number | null
          factory_moq: string | null
          factory_price: number | null
          factory_sku: string | null
          fulfillment_service: string | null
          hs_code: string | null
          id: string
          images: Json | null
          international_air_shipping_cost: number | null
          inventory_policy: string | null
          inventory_quantity: number | null
          is_default: boolean | null
          key_features: Json | null
          lead_time_days: number | null
          low_stock_threshold: number | null
          manufacturing_files: Json | null
          margin_percentage: number | null
          markup_percentage: number | null
          materials: Json | null
          moq: number | null
          moq_price: number | null
          ocean_shipping_cost: number | null
          options: Json | null
          package_volume: number | null
          package_volume_unit: string | null
          package_weight: number | null
          package_weight_unit: string | null
          packages_per_carton: number | null
          platform_moq: number | null
          platform_price: number | null
          position: string | null
          price: number | null
          product_id: string | null
          quick_ship: boolean | null
          requires_shipping: boolean | null
          reserved_quantity: number | null
          shipping_instructions: string | null
          sku: string | null
          specifications: Json | null
          stackable_packages: boolean | null
          standard_lead_time: number | null
          status: string | null
          stock_quantity: number | null
          taxable: boolean | null
          title: string | null
          units_per_package: number | null
          updated_at: string | null
          volume: number | null
          volume_price_tiers: Json | null
          volume_unit: string | null
          weight: number | null
          weight_unit: string | null
        }
        Insert: {
          air_shipping_cost?: number | null
          barcode?: string | null
          cartons_per_pallet?: number | null
          client_restrictions?: Json | null
          colors?: Json | null
          compare_at_price?: number | null
          cost_price?: number | null
          country_of_origin?: string | null
          created_at?: string | null
          deleted_at?: string | null
          design_files?: string | null
          dimension_unit?: string | null
          dimensions?: Json | null
          documentation_files?: Json | null
          drop_approved?: boolean
          drop_custom_price?: number | null
          drop_description?: string | null
          drop_public?: boolean
          factory_id?: string | null
          factory_lead_time_days?: number | null
          factory_moq?: string | null
          factory_price?: number | null
          factory_sku?: string | null
          fulfillment_service?: string | null
          hs_code?: string | null
          id?: string
          images?: Json | null
          international_air_shipping_cost?: number | null
          inventory_policy?: string | null
          inventory_quantity?: number | null
          is_default?: boolean | null
          key_features?: Json | null
          lead_time_days?: number | null
          low_stock_threshold?: number | null
          manufacturing_files?: Json | null
          margin_percentage?: number | null
          markup_percentage?: number | null
          materials?: Json | null
          moq?: number | null
          moq_price?: number | null
          ocean_shipping_cost?: number | null
          options?: Json | null
          package_volume?: number | null
          package_volume_unit?: string | null
          package_weight?: number | null
          package_weight_unit?: string | null
          packages_per_carton?: number | null
          platform_moq?: number | null
          platform_price?: number | null
          position?: string | null
          price?: number | null
          product_id?: string | null
          quick_ship?: boolean | null
          requires_shipping?: boolean | null
          reserved_quantity?: number | null
          shipping_instructions?: string | null
          sku?: string | null
          specifications?: Json | null
          stackable_packages?: boolean | null
          standard_lead_time?: number | null
          status?: string | null
          stock_quantity?: number | null
          taxable?: boolean | null
          title?: string | null
          units_per_package?: number | null
          updated_at?: string | null
          volume?: number | null
          volume_price_tiers?: Json | null
          volume_unit?: string | null
          weight?: number | null
          weight_unit?: string | null
        }
        Update: {
          air_shipping_cost?: number | null
          barcode?: string | null
          cartons_per_pallet?: number | null
          client_restrictions?: Json | null
          colors?: Json | null
          compare_at_price?: number | null
          cost_price?: number | null
          country_of_origin?: string | null
          created_at?: string | null
          deleted_at?: string | null
          design_files?: string | null
          dimension_unit?: string | null
          dimensions?: Json | null
          documentation_files?: Json | null
          drop_approved?: boolean
          drop_custom_price?: number | null
          drop_description?: string | null
          drop_public?: boolean
          factory_id?: string | null
          factory_lead_time_days?: number | null
          factory_moq?: string | null
          factory_price?: number | null
          factory_sku?: string | null
          fulfillment_service?: string | null
          hs_code?: string | null
          id?: string
          images?: Json | null
          international_air_shipping_cost?: number | null
          inventory_policy?: string | null
          inventory_quantity?: number | null
          is_default?: boolean | null
          key_features?: Json | null
          lead_time_days?: number | null
          low_stock_threshold?: number | null
          manufacturing_files?: Json | null
          margin_percentage?: number | null
          markup_percentage?: number | null
          materials?: Json | null
          moq?: number | null
          moq_price?: number | null
          ocean_shipping_cost?: number | null
          options?: Json | null
          package_volume?: number | null
          package_volume_unit?: string | null
          package_weight?: number | null
          package_weight_unit?: string | null
          packages_per_carton?: number | null
          platform_moq?: number | null
          platform_price?: number | null
          position?: string | null
          price?: number | null
          product_id?: string | null
          quick_ship?: boolean | null
          requires_shipping?: boolean | null
          reserved_quantity?: number | null
          shipping_instructions?: string | null
          sku?: string | null
          specifications?: Json | null
          stackable_packages?: boolean | null
          standard_lead_time?: number | null
          status?: string | null
          stock_quantity?: number | null
          taxable?: boolean | null
          title?: string | null
          units_per_package?: number | null
          updated_at?: string | null
          volume?: number | null
          volume_price_tiers?: Json | null
          volume_unit?: string | null
          weight?: number | null
          weight_unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          body_html: string | null
          category: string | null
          created_at: string | null
          deleted_at: string | null
          drop_approved: boolean
          drop_public: boolean
          drop_shipping_method: Database["public"]["Enums"]["shipping_method_type"]
          factory_id: string | null
          fts: unknown
          id: string
          important_details: Json[] | null
          metadata: Json | null
          published: boolean | null
          seo_description: string | null
          seo_title: string | null
          slug: string | null
          specifications: string[] | null
          status: string | null
          store_id: string | null
          tags: string | null
          thumbnail_image: string | null
          title: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          body_html?: string | null
          category?: string | null
          created_at?: string | null
          deleted_at?: string | null
          drop_approved?: boolean
          drop_public?: boolean
          drop_shipping_method?: Database["public"]["Enums"]["shipping_method_type"]
          factory_id?: string | null
          fts?: unknown
          id?: string
          important_details?: Json[] | null
          metadata?: Json | null
          published?: boolean | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string | null
          specifications?: string[] | null
          status?: string | null
          store_id?: string | null
          tags?: string | null
          thumbnail_image?: string | null
          title?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          body_html?: string | null
          category?: string | null
          created_at?: string | null
          deleted_at?: string | null
          drop_approved?: boolean
          drop_public?: boolean
          drop_shipping_method?: Database["public"]["Enums"]["shipping_method_type"]
          factory_id?: string | null
          fts?: unknown
          id?: string
          important_details?: Json[] | null
          metadata?: Json | null
          published?: boolean | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string | null
          specifications?: string[] | null
          status?: string | null
          store_id?: string | null
          tags?: string | null
          thumbnail_image?: string | null
          title?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_products_factory"
            columns: ["factory_id"]
            isOneToOne: false
            referencedRelation: "factories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "drop_stores"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          first_name: string | null
          last_name: string | null
          pfp_src: string | null
          phone_number: string | null
          social_links: Json | null
          system_role_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          last_name?: string | null
          pfp_src?: string | null
          phone_number?: string | null
          social_links?: Json | null
          system_role_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          last_name?: string | null
          pfp_src?: string | null
          phone_number?: string | null
          social_links?: Json | null
          system_role_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_system_role_id_fkey"
            columns: ["system_role_id"]
            isOneToOne: false
            referencedRelation: "system_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      project_catalogs: {
        Row: {
          actual_delivery_date: string | null
          created_at: string | null
          created_by: string | null
          custom_price: number | null
          customizations: Json | null
          deleted_at: string | null
          design_id: string | null
          expected_delivery_date: string | null
          id: string
          location_notes: string | null
          notes: string | null
          po_line_item_number: string | null
          product_id: string | null
          project_id: string
          quantity: number
          shipping_option: Database["public"]["Enums"]["shipping_option"] | null
          space_assignment: string | null
          specifications: Json | null
          status: Database["public"]["Enums"]["catalog_item_status"] | null
          supplier_reference: string | null
          updated_at: string | null
          variant_id: string | null
        }
        Insert: {
          actual_delivery_date?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_price?: number | null
          customizations?: Json | null
          deleted_at?: string | null
          design_id?: string | null
          expected_delivery_date?: string | null
          id?: string
          location_notes?: string | null
          notes?: string | null
          po_line_item_number?: string | null
          product_id?: string | null
          project_id: string
          quantity?: number
          shipping_option?:
            | Database["public"]["Enums"]["shipping_option"]
            | null
          space_assignment?: string | null
          specifications?: Json | null
          status?: Database["public"]["Enums"]["catalog_item_status"] | null
          supplier_reference?: string | null
          updated_at?: string | null
          variant_id?: string | null
        }
        Update: {
          actual_delivery_date?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_price?: number | null
          customizations?: Json | null
          deleted_at?: string | null
          design_id?: string | null
          expected_delivery_date?: string | null
          id?: string
          location_notes?: string | null
          notes?: string | null
          po_line_item_number?: string | null
          product_id?: string | null
          project_id?: string
          quantity?: number
          shipping_option?:
            | Database["public"]["Enums"]["shipping_option"]
            | null
          space_assignment?: string | null
          specifications?: Json | null
          status?: Database["public"]["Enums"]["catalog_item_status"] | null
          supplier_reference?: string | null
          updated_at?: string | null
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_catalogs_design_id_fkey"
            columns: ["design_id"]
            isOneToOne: false
            referencedRelation: "user_generated_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_catalogs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_catalogs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_catalogs_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      project_members: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          id: string
          notes: string | null
          permissions: Json | null
          project_id: string
          role_id: string | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          notes?: string | null
          permissions?: Json | null
          project_id: string
          role_id?: string | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          notes?: string | null
          permissions?: Json | null
          project_id?: string
          role_id?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "organization_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          acess_level: string | null
          actual_completion_date: string | null
          budget: number | null
          budget_code: string | null
          code: string | null
          cover_image: string | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          deleted_at: string | null
          delivery_address: Json | null
          department_id: string | null
          description: string | null
          id: string
          installation_address: Json | null
          location_id: string | null
          metadata: Json | null
          name: string
          organization_id: string
          parent_project_id: string | null
          po_number: string | null
          project_owner: string | null
          project_path: string | null
          project_type: Database["public"]["Enums"]["project_type"] | null
          root_project_id: string | null
          settings: Json | null
          share_link: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["project_status"] | null
          target_completion_date: string | null
          updated_at: string | null
        }
        Insert: {
          acess_level?: string | null
          actual_completion_date?: string | null
          budget?: number | null
          budget_code?: string | null
          code?: string | null
          cover_image?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          deleted_at?: string | null
          delivery_address?: Json | null
          department_id?: string | null
          description?: string | null
          id?: string
          installation_address?: Json | null
          location_id?: string | null
          metadata?: Json | null
          name: string
          organization_id: string
          parent_project_id?: string | null
          po_number?: string | null
          project_owner?: string | null
          project_path?: string | null
          project_type?: Database["public"]["Enums"]["project_type"] | null
          root_project_id?: string | null
          settings?: Json | null
          share_link?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"] | null
          target_completion_date?: string | null
          updated_at?: string | null
        }
        Update: {
          acess_level?: string | null
          actual_completion_date?: string | null
          budget?: number | null
          budget_code?: string | null
          code?: string | null
          cover_image?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          deleted_at?: string | null
          delivery_address?: Json | null
          department_id?: string | null
          description?: string | null
          id?: string
          installation_address?: Json | null
          location_id?: string | null
          metadata?: Json | null
          name?: string
          organization_id?: string
          parent_project_id?: string | null
          po_number?: string | null
          project_owner?: string | null
          project_path?: string | null
          project_type?: Database["public"]["Enums"]["project_type"] | null
          root_project_id?: string | null
          settings?: Json | null
          share_link?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"] | null
          target_completion_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "organization_departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "organization_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_parent_project_id_fkey"
            columns: ["parent_project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_root_project_id_fkey"
            columns: ["root_project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_requests: {
        Row: {
          created_at: string
          design_id: string
          id: string
          is_snoozed: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string
          design_id?: string
          id?: string
          is_snoozed?: boolean | null
          user_id?: string
        }
        Update: {
          created_at?: string
          design_id?: string
          id?: string
          is_snoozed?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quote_requests_design_id_fkey"
            columns: ["design_id"]
            isOneToOne: false
            referencedRelation: "user_generated_products"
            referencedColumns: ["id"]
          },
        ]
      }
      redaction_requests: {
        Row: {
          created_at: string | null
          customer_email: string | null
          customer_id: string
          id: number
          orders_to_redact: Json | null
          shop_domain: string
          shop_id: string
          status: string
        }
        Insert: {
          created_at?: string | null
          customer_email?: string | null
          customer_id: string
          id?: number
          orders_to_redact?: Json | null
          shop_domain: string
          shop_id: string
          status: string
        }
        Update: {
          created_at?: string | null
          customer_email?: string | null
          customer_id?: string
          id?: number
          orders_to_redact?: Json | null
          shop_domain?: string
          shop_id?: string
          status?: string
        }
        Relationships: []
      }
      referrers: {
        Row: {
          created_at: string | null
          id: string
          logo: string | null
          name: string
          organization_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          logo?: string | null
          name: string
          organization_id?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          logo?: string | null
          name?: string
          organization_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      request_users: {
        Row: {
          email: string
          name: string
        }
        Insert: {
          email: string
          name: string
        }
        Update: {
          email?: string
          name?: string
        }
        Relationships: []
      }
      requests: {
        Row: {
          assigned_to: string | null
          company_name: string | null
          contact_name: string | null
          created_at: string | null
          created_by: string | null
          customer_notes: Json
          deleted_at: string | null
          details: string | null
          email: string | null
          expected_price_range: Json | null
          factory_id: string | null
          files: Json | null
          follow_up_date: string | null
          id: string
          internal_notes: Json
          order_id: string | null
          phone: string | null
          priority: string | null
          product_name: string
          production_notes: Json
          quantity: number | null
          similar_products: Json | null
          status: string
          target_delivery_date: string | null
          updated_at: string | null
          url: string | null
        }
        Insert: {
          assigned_to?: string | null
          company_name?: string | null
          contact_name?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_notes?: Json
          deleted_at?: string | null
          details?: string | null
          email?: string | null
          expected_price_range?: Json | null
          factory_id?: string | null
          files?: Json | null
          follow_up_date?: string | null
          id?: string
          internal_notes?: Json
          order_id?: string | null
          phone?: string | null
          priority?: string | null
          product_name: string
          production_notes?: Json
          quantity?: number | null
          similar_products?: Json | null
          status?: string
          target_delivery_date?: string | null
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          assigned_to?: string | null
          company_name?: string | null
          contact_name?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_notes?: Json
          deleted_at?: string | null
          details?: string | null
          email?: string | null
          expected_price_range?: Json | null
          factory_id?: string | null
          files?: Json | null
          follow_up_date?: string | null
          id?: string
          internal_notes?: Json
          order_id?: string | null
          phone?: string | null
          priority?: string | null
          product_name?: string
          production_notes?: Json
          quantity?: number | null
          similar_products?: Json | null
          status?: string
          target_delivery_date?: string | null
          updated_at?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "requests_factory_id_fkey"
            columns: ["factory_id"]
            isOneToOne: false
            referencedRelation: "factories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requests_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      sample_manufacturers: {
        Row: {
          approved: boolean | null
          arrival_destination: string | null
          arrived_at_forwarder: boolean | null
          arrived_at_office: boolean | null
          cartons: Json[] | null
          consensus_reason: string | null
          created_at: string
          eta: string | null
          factory_id: string | null
          id: string
          is_selected_for_customer: boolean | null
          notes: string | null
          order_item_id: string | null
          product_id: string | null
          sample_image: string | null
          sample_price: number | null
          sent_to_forwarder: boolean | null
          status: Database["public"]["Enums"]["order_status"] | null
          variant_id: string | null
        }
        Insert: {
          approved?: boolean | null
          arrival_destination?: string | null
          arrived_at_forwarder?: boolean | null
          arrived_at_office?: boolean | null
          cartons?: Json[] | null
          consensus_reason?: string | null
          created_at?: string
          eta?: string | null
          factory_id?: string | null
          id?: string
          is_selected_for_customer?: boolean | null
          notes?: string | null
          order_item_id?: string | null
          product_id?: string | null
          sample_image?: string | null
          sample_price?: number | null
          sent_to_forwarder?: boolean | null
          status?: Database["public"]["Enums"]["order_status"] | null
          variant_id?: string | null
        }
        Update: {
          approved?: boolean | null
          arrival_destination?: string | null
          arrived_at_forwarder?: boolean | null
          arrived_at_office?: boolean | null
          cartons?: Json[] | null
          consensus_reason?: string | null
          created_at?: string
          eta?: string | null
          factory_id?: string | null
          id?: string
          is_selected_for_customer?: boolean | null
          notes?: string | null
          order_item_id?: string | null
          product_id?: string | null
          sample_image?: string | null
          sample_price?: number | null
          sent_to_forwarder?: boolean | null
          status?: Database["public"]["Enums"]["order_status"] | null
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sample_manufacturers_factory_id_fkey"
            columns: ["factory_id"]
            isOneToOne: false
            referencedRelation: "factories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sample_manufacturers_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sample_manufacturers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sample_manufacturers_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      shipments: {
        Row: {
          actual_delivery_date: string | null
          aftership_tracking_id: string | null
          carrier: string | null
          created_at: string | null
          created_by: string
          deleted_at: string | null
          estimated_delivery_date: string | null
          id: string
          metadata: Json | null
          notes: string | null
          order_id: string
          order_item_id: string | null
          organization_id: string
          shipping_method: string | null
          status: Database["public"]["Enums"]["shipping_status"]
          terminal_49_container_id: string | null
          terminal_49_shipment_id: string | null
          terminal_49_tracking_id: string | null
          tracking_number: string | null
          tracking_url: string | null
          updated_at: string | null
        }
        Insert: {
          actual_delivery_date?: string | null
          aftership_tracking_id?: string | null
          carrier?: string | null
          created_at?: string | null
          created_by: string
          deleted_at?: string | null
          estimated_delivery_date?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          order_id: string
          order_item_id?: string | null
          organization_id: string
          shipping_method?: string | null
          status?: Database["public"]["Enums"]["shipping_status"]
          terminal_49_container_id?: string | null
          terminal_49_shipment_id?: string | null
          terminal_49_tracking_id?: string | null
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string | null
        }
        Update: {
          actual_delivery_date?: string | null
          aftership_tracking_id?: string | null
          carrier?: string | null
          created_at?: string | null
          created_by?: string
          deleted_at?: string | null
          estimated_delivery_date?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          order_id?: string
          order_item_id?: string | null
          organization_id?: string
          shipping_method?: string | null
          status?: Database["public"]["Enums"]["shipping_status"]
          terminal_49_container_id?: string | null
          terminal_49_shipment_id?: string | null
          terminal_49_tracking_id?: string | null
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shipments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      shipping_method_tiers: {
        Row: {
          id: number
          max_weight: number | null
          method_name: string | null
          min_weight: number | null
          price_per_kg: number | null
          truck_delivery_fee: number | null
        }
        Insert: {
          id: number
          max_weight?: number | null
          method_name?: string | null
          min_weight?: number | null
          price_per_kg?: number | null
          truck_delivery_fee?: number | null
        }
        Update: {
          id?: number
          max_weight?: number | null
          method_name?: string | null
          min_weight?: number | null
          price_per_kg?: number | null
          truck_delivery_fee?: number | null
        }
        Relationships: []
      }
      shop_deletions: {
        Row: {
          created_at: string | null
          id: number
          shop_domain: string
          shop_id: string
          status: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          shop_domain: string
          shop_id: string
          status: string
        }
        Update: {
          created_at?: string | null
          id?: number
          shop_domain?: string
          shop_id?: string
          status?: string
        }
        Relationships: []
      }
      shopify_products: {
        Row: {
          created_at: string | null
          id: string
          products: Json | null
          project_id: string
          shopify_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          products?: Json | null
          project_id: string
          shopify_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          products?: Json | null
          project_id?: string
          shopify_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      shopify_users: {
        Row: {
          created_at: string | null
          id: string
          products: Json | null
          project_id: string | null
          store_name: string
          store_token: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id: string
          products?: Json | null
          project_id?: string | null
          store_name: string
          store_token: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          products?: Json | null
          project_id?: string | null
          store_name?: string
          store_token?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shopify_users_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shopify_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      system_roles: {
        Row: {
          id: string
          name: string | null
          permissions: Json | null
        }
        Insert: {
          id?: string
          name?: string | null
          permissions?: Json | null
        }
        Update: {
          id?: string
          name?: string | null
          permissions?: Json | null
        }
        Relationships: []
      }
      taobao_product_images: {
        Row: {
          created_at: string | null
          gcs_url: string
          id: string
          image_index: number | null
          original_taobao_url: string | null
          product_id: string
        }
        Insert: {
          created_at?: string | null
          gcs_url: string
          id?: string
          image_index?: number | null
          original_taobao_url?: string | null
          product_id: string
        }
        Update: {
          created_at?: string | null
          gcs_url?: string
          id?: string
          image_index?: number | null
          original_taobao_url?: string | null
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "taobao_product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "taobao_products"
            referencedColumns: ["id"]
          },
        ]
      }
      taobao_products: {
        Row: {
          created_at: string | null
          id: string
          job_id: string
          price: string | null
          seller_name: string | null
          taobao_url: string
          title: string | null
          variant_type: string | null
          variant_value: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          job_id: string
          price?: string | null
          seller_name?: string | null
          taobao_url: string
          title?: string | null
          variant_type?: string | null
          variant_value?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          job_id?: string
          price?: string | null
          seller_name?: string | null
          taobao_url?: string
          title?: string | null
          variant_type?: string | null
          variant_value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "taobao_products_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "taobao_scraping_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      taobao_scraping_jobs: {
        Row: {
          browser_profile_id: string | null
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          id: string
          status: string
          updated_at: string | null
          uploaded_image_url: string
        }
        Insert: {
          browser_profile_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          status?: string
          updated_at?: string | null
          uploaded_image_url: string
        }
        Update: {
          browser_profile_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          status?: string
          updated_at?: string | null
          uploaded_image_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "taobao_scraping_jobs_browser_profile_id_fkey"
            columns: ["browser_profile_id"]
            isOneToOne: false
            referencedRelation: "browser_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      task_board_members: {
        Row: {
          board_id: string
          created_at: string
          role: string
          user_id: string
        }
        Insert: {
          board_id: string
          created_at?: string
          role?: string
          user_id: string
        }
        Update: {
          board_id?: string
          created_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_board_members_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "task_boards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_board_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      task_boards: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image: string | null
          name: string
          owner_user_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image?: string | null
          name?: string
          owner_user_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image?: string | null
          name?: string
          owner_user_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_boards_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      task_comments: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
          images: string[] | null
          task_id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          id?: string
          images?: string[] | null
          task_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          images?: string[] | null
          task_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "task_comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_timeline: {
        Row: {
          actor_id: string | null
          created_at: string
          event_description: string | null
          event_title: string
          event_type: string
          id: string
          metadata: Json | null
          task_id: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          event_description?: string | null
          event_title: string
          event_type: string
          id?: string
          metadata?: Json | null
          task_id: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          event_description?: string | null
          event_title?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_timeline_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "task_timeline_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_to: string | null
          board_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          due_date: string | null
          id: string
          images: string[] | null
          order_id: string
          order_item_id: string
          position: number
          priority: Database["public"]["Enums"]["task_priority"]
          product_id: string | null
          short_code: string
          status: Database["public"]["Enums"]["task_status"]
          tags: string[] | null
          title: string
          updated_at: string
          variant_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          board_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          images?: string[] | null
          order_id: string
          order_item_id: string
          position?: number
          priority?: Database["public"]["Enums"]["task_priority"]
          product_id?: string | null
          short_code: string
          status?: Database["public"]["Enums"]["task_status"]
          tags?: string[] | null
          title: string
          updated_at?: string
          variant_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          board_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          images?: string[] | null
          order_id?: string
          order_item_id?: string
          position?: number
          priority?: Database["public"]["Enums"]["task_priority"]
          product_id?: string | null
          short_code?: string
          status?: Database["public"]["Enums"]["task_status"]
          tags?: string[] | null
          title?: string
          updated_at?: string
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "tasks_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "task_boards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "tasks_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      temp_catalog_items: {
        Row: {
          category: string | null
          created_at: string | null
          dimension: string | null
          extra_details: string | null
          id: string
          image_url: string | null
          materials: string | null
          price_cny: number | null
          price_usd: number | null
          product_id: string | null
          taobao_url: string | null
          user_id_lock: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          dimension?: string | null
          extra_details?: string | null
          id?: string
          image_url?: string | null
          materials?: string | null
          price_cny?: number | null
          price_usd?: number | null
          product_id?: string | null
          taobao_url?: string | null
          user_id_lock?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          dimension?: string | null
          extra_details?: string | null
          id?: string
          image_url?: string | null
          materials?: string | null
          price_cny?: number | null
          price_usd?: number | null
          product_id?: string | null
          taobao_url?: string | null
          user_id_lock?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "temp_catalog_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "temp_catalog_items_user_id_lock_fkey"
            columns: ["user_id_lock"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      temp_catalog_requests: {
        Row: {
          created_at: string | null
          has_requested_sample: boolean | null
          id: string
          temp_catalog_item_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          has_requested_sample?: boolean | null
          id?: string
          temp_catalog_item_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          has_requested_sample?: boolean | null
          id?: string
          temp_catalog_item_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "temp_catalog_requests_temp_catalog_item_id_fkey"
            columns: ["temp_catalog_item_id"]
            isOneToOne: false
            referencedRelation: "temp_catalog_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "temp_catalog_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_carts: {
        Row: {
          created_at: string
          design_id: string | null
          id: string
          product_id: string
          quantity: number
          source: string | null
          updated_at: string
          user_id: string
          variant_id: string
        }
        Insert: {
          created_at?: string
          design_id?: string | null
          id?: string
          product_id: string
          quantity: number
          source?: string | null
          updated_at?: string
          user_id?: string
          variant_id: string
        }
        Update: {
          created_at?: string
          design_id?: string | null
          id?: string
          product_id?: string
          quantity?: number
          source?: string | null
          updated_at?: string
          user_id?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_carts_product_id"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user_carts_variant_id"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_carts_design_id_fkey"
            columns: ["design_id"]
            isOneToOne: false
            referencedRelation: "user_generated_products"
            referencedColumns: ["id"]
          },
        ]
      }
      user_generated_product_notes: {
        Row: {
          created_at: string
          design_id: string
          id: string
          note: string | null
          ref_image: string[] | null
        }
        Insert: {
          created_at?: string
          design_id?: string
          id?: string
          note?: string | null
          ref_image?: string[] | null
        }
        Update: {
          created_at?: string
          design_id?: string
          id?: string
          note?: string | null
          ref_image?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "user_generated_product_notes_design_id_fkey"
            columns: ["design_id"]
            isOneToOne: false
            referencedRelation: "user_generated_products"
            referencedColumns: ["id"]
          },
        ]
      }
      user_generated_products: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          id: string
          image_url: string | null
          init_prompt: string | null
          messages: Json[] | null
          product_data: Json[]
          product_name: string | null
          product_type: string | null
          provenance: string | null
          session_id: string | null
          terra_product_id: string | null
          terra_product_slug: string | null
          updated_at: string | null
          user_id: string | null
          variant_id: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          image_url?: string | null
          init_prompt?: string | null
          messages?: Json[] | null
          product_data: Json[]
          product_name?: string | null
          product_type?: string | null
          provenance?: string | null
          session_id?: string | null
          terra_product_id?: string | null
          terra_product_slug?: string | null
          updated_at?: string | null
          user_id?: string | null
          variant_id?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          image_url?: string | null
          init_prompt?: string | null
          messages?: Json[] | null
          product_data?: Json[]
          product_name?: string | null
          product_type?: string | null
          provenance?: string | null
          session_id?: string | null
          terra_product_id?: string | null
          terra_product_slug?: string | null
          updated_at?: string | null
          user_id?: string | null
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_generated_products_variant"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_generated_products_terra_product_id_fkey"
            columns: ["terra_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      user_image_generations: {
        Row: {
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_interactions: {
        Row: {
          browser_name: string | null
          browser_version: string | null
          city: string | null
          country: string | null
          created_at: string | null
          device_type: string | null
          event_category: string | null
          event_name: string
          event_properties: Json | null
          id: string
          ip_address: unknown
          os_name: string | null
          os_version: string | null
          page_load_time: number | null
          page_title: string | null
          page_url: string | null
          region: string | null
          screen_height: number | null
          screen_width: number | null
          session_id: string
          time_on_page: number | null
          user_agent: string | null
          user_id: string | null
          viewport_height: number | null
          viewport_width: number | null
        }
        Insert: {
          browser_name?: string | null
          browser_version?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          device_type?: string | null
          event_category?: string | null
          event_name: string
          event_properties?: Json | null
          id?: string
          ip_address?: unknown
          os_name?: string | null
          os_version?: string | null
          page_load_time?: number | null
          page_title?: string | null
          page_url?: string | null
          region?: string | null
          screen_height?: number | null
          screen_width?: number | null
          session_id: string
          time_on_page?: number | null
          user_agent?: string | null
          user_id?: string | null
          viewport_height?: number | null
          viewport_width?: number | null
        }
        Update: {
          browser_name?: string | null
          browser_version?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          device_type?: string | null
          event_category?: string | null
          event_name?: string
          event_properties?: Json | null
          id?: string
          ip_address?: unknown
          os_name?: string | null
          os_version?: string | null
          page_load_time?: number | null
          page_title?: string | null
          page_url?: string | null
          region?: string | null
          screen_height?: number | null
          screen_width?: number | null
          session_id?: string
          time_on_page?: number | null
          user_agent?: string | null
          user_id?: string | null
          viewport_height?: number | null
          viewport_width?: number | null
        }
        Relationships: []
      }
      user_purchase_credit: {
        Row: {
          balance: number | null
          id: string
          shipping_coupon: Json | null
          user_id: string
        }
        Insert: {
          balance?: number | null
          id?: string
          shipping_coupon?: Json | null
          user_id?: string
        }
        Update: {
          balance?: number | null
          id?: string
          shipping_coupon?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      user_referrals: {
        Row: {
          created_at: string | null
          created_profile: boolean | null
          id: string
          referrer_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_profile?: boolean | null
          id?: string
          referrer_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_profile?: boolean | null
          id?: string
          referrer_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "referrers"
            referencedColumns: ["id"]
          },
        ]
      }
      users_saved_requests: {
        Row: {
          created_at: string
          email: string
          id: string
          product_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          product_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_email"
            columns: ["email"]
            isOneToOne: false
            referencedRelation: "request_users"
            referencedColumns: ["email"]
          },
          {
            foreignKeyName: "fk_product_id"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      variant_change_requests: {
        Row: {
          created_at: string
          id: string
          metadata: Json
        }
        Insert: {
          created_at?: string
          id?: string
          metadata: Json
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          code: string | null
          created_at: string | null
          email: string
          id: number
          name: string | null
          social_handles: Json | null
          status: string | null
        }
        Insert: {
          code?: string | null
          created_at?: string | null
          email: string
          id?: number
          name?: string | null
          social_handles?: Json | null
          status?: string | null
        }
        Update: {
          code?: string | null
          created_at?: string | null
          email?: string
          id?: number
          name?: string | null
          social_handles?: Json | null
          status?: string | null
        }
        Relationships: []
      }
      whatsapp_messages: {
        Row: {
          created_at: string
          direction: string
          id: number
          message: string
          phone_number: string
          status: string | null
        }
        Insert: {
          created_at?: string
          direction: string
          id?: number
          message: string
          phone_number: string
          status?: string | null
        }
        Update: {
          created_at?: string
          direction?: string
          id?: number
          message?: string
          phone_number?: string
          status?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      user_product_counts: {
        Row: {
          identifier: string | null
          last_product_created: string | null
          product_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_product_to_shopify_user: {
        Args: { p_product: Json; p_user_id: string }
        Returns: undefined
      }
      add_project_catalog_item: {
        Args: {
          auth_id: string
          p_customizations?: Json
          p_expected_delivery_date?: string
          p_location_notes?: string
          p_notes?: string
          p_po_line_item_number?: string
          p_project_id: string
          p_quantity?: number
          p_space_assignment?: string
          p_specifications?: Json
          p_supplier_reference?: string
          p_variant_id: string
        }
        Returns: {
          catalog_id: string
          message: string
          success: boolean
          variant_info: Json
        }[]
      }
      assign_production_factory_for_order_item: {
        Args: { p_order_item_id: string }
        Returns: string
      }
      calculate_modified_volume: {
        Args: never
        Returns: {
          modified_volume: number
          variant_id: string
        }[]
      }
      calculate_shipping_cost: {
        Args: { shipping_method: string; volume_cbm: number; weight_kg: number }
        Returns: {
          actual_weight: number
          shipping_cost: number
          used_weight: number
          volumetric_weight: number
        }[]
      }
      check_user_store_connection: {
        Args: { user_id_input: string }
        Returns: Json
      }
      clear_project_and_skus: {
        Args: { user_id_input: string }
        Returns: undefined
      }
      create_audit_log: {
        Args: {
          p_action: string
          p_entity_id: string
          p_entity_type: string
          p_metadata?: Json
          p_new_values?: Json
          p_old_values?: Json
          p_organization_id: string
          p_user_id: string
        }
        Returns: string
      }
      create_invoice_from_order: {
        Args: {
          auth_id: string
          p_due_date?: string
          p_internal_notes?: string
          p_metadata?: Json
          p_notes?: string
          p_order_id: string
          p_stripe_customer_id?: string
        }
        Returns: {
          invoice_id: string
          message: string
          success: boolean
          total_amount: number
        }[]
      }
      create_order_from_catalog_items: {
        Args: { auth_id: string; p_item_ids: string[]; p_project_id: string }
        Returns: {
          items: string[]
          message: string
          order_id: string
          success: boolean
        }[]
      }
      create_organization: {
        Args: {
          auth_id: string
          p_billing_address?: Json
          p_business_type?: string
          p_credit_limit?: number
          p_display_name?: string
          p_duns_number?: string
          p_industry?: string
          p_metadata?: Json
          p_name: string
          p_org_size?: Database["public"]["Enums"]["org_size"]
          p_parent_org_id?: string
          p_payment_terms?: string
          p_preferred_currency?: string
          p_primary_email?: string
          p_primary_phone?: string
          p_purchase_order_prefix?: string
          p_registration_number?: string
          p_requires_po_number?: boolean
          p_settings?: Json
          p_shipping_addresses?: Json[]
          p_tax_id?: string
          p_vat_number?: string
          p_website?: string
        }
        Returns: {
          message: string
          org_details: Json
          organization_id: string
          success: boolean
        }[]
      }
      create_project: {
        Args: {
          auth_id: string
          p_budget?: number
          p_budget_code?: string
          p_code?: string
          p_currency?: string
          p_delivery_address?: string
          p_department_id?: string
          p_description: string
          p_installation_address?: string
          p_location_id?: string
          p_metadata?: Json
          p_name: string
          p_organization_id: string
          p_parent_project_id?: string
          p_po_number?: string
          p_products?: Json
          p_project_owner?: string
          p_project_type?: string
          p_settings?: Json
          p_start_date?: string
          p_target_completion_date?: string
        }
        Returns: {
          message: string
          project_details: Json
          success: boolean
        }[]
      }
      delete_order: {
        Args: { auth_id: string; p_order_id: string }
        Returns: {
          deleted_order_id: string
          message: string
          restored_catalog_items: string[]
          success: boolean
        }[]
      }
      delete_organization: {
        Args: {
          auth_id: string
          p_confirm_name: string
          p_organization_id: string
        }
        Returns: {
          deleted_details: Json
          message: string
          organization_id: string
          success: boolean
        }[]
      }
      delete_project: {
        Args: { auth_id: string; p_project_id: string }
        Returns: {
          message: string
          rows_affected: number
        }[]
      }
      delete_project_catalog_item: {
        Args: { auth_id: string; p_catalog_item_id: string }
        Returns: {
          deleted_item_id: string
          message: string
          success: boolean
        }[]
      }
      delete_user: {
        Args: { auth_id: string; p_confirm_email: string; p_user_id: string }
        Returns: {
          deleted_user_id: string
          deletion_details: Json
          message: string
          success: boolean
        }[]
      }
      get_analytics_metrics: {
        Args: {
          exclude_test_users?: boolean
          product_filter?: string
          soft_deleted_filter?: string
        }
        Returns: Json
      }
      get_analytics_products: {
        Args: {
          p_exclude_test_users?: boolean
          p_page?: number
          p_page_size?: number
          p_product_filter?: string
          p_search?: string
          p_soft_deleted_filter?: string
          p_user_type?: string
        }
        Returns: {
          created_at: string
          email: string
          first_name: string
          id: string
          image_url: string
          last_name: string
          product_data: Json[]
          product_name: string
          product_type: string
          session_id: string
          terra_product_id: string
          terra_product_slug: string
          total_count: number
          user_id: string
        }[]
      }
      get_analytics_users: {
        Args: {
          p_exclude_test_users?: boolean
          p_page?: number
          p_page_size?: number
          p_product_filter?: string
          p_search?: string
          p_soft_deleted_filter?: string
          p_sort_by?: string
          p_user_type?: string
        }
        Returns: {
          average_messages: number
          email: string
          first_name: string
          generation_count: number
          last_generation: string
          last_name: string
          session_id: string
          total_count: number
          user_id: string
        }[]
      }
      get_category_summary_with_image: {
        Args: never
        Returns: {
          category_id: string
          category_name: string
          item_count: number
          random_image: Json
        }[]
      }
      get_chat_interactions:
        | {
            Args: { id_uuid: string }
            Returns: {
              chat_id: string
              total_duration: number
              visit_count: number
            }[]
          }
        | {
            Args: { session_uuid: string }
            Returns: {
              chat_id: string
              total_duration: number
              visit_count: number
            }[]
          }
      get_enum_values: {
        Args: { enum_name: string }
        Returns: {
          value: string
        }[]
      }
      get_feature_usage_metrics: {
        Args: {
          exclude_test_users?: boolean
          generation_threshold?: number
          product_filter?: string
          soft_deleted_filter?: string
        }
        Returns: Json
      }
      get_home_sites: {
        Args: {
          auth_id: string
          p_include_deleted?: boolean
          p_limit?: number
          p_offset?: number
          p_search?: string
        }
        Returns: {
          created_at: string
          description: string
          id: string
          name: string
          slug: string
          updated_at: string
          url: string
        }[]
      }
      get_orders: {
        Args: {
          auth_id: string
          p_end_date?: string
          p_limit?: number
          p_offset?: number
          p_order_id?: string
          p_project_id?: string
          p_search?: string
          p_start_date?: string
          p_status?: string
        }
        Returns: {
          actual_delivery_date: string
          approved_by: string
          cancelled_by: string
          confirmation_date: string
          created_at: string
          created_by: string
          currency: string
          estimated_delivery_date: string
          factory_id: string
          factory_order_number: string
          id: string
          internal_notes: string
          metadata: Json
          notes: string
          order_date: string
          order_items: Json
          order_number: string
          organization_id: string
          payment_terms: string
          po_number: string
          project_details: Json
          project_id: string
          shipping_address: Json
          shipping_cost: number
          shipping_method: string
          shipping_notes: string
          status: string
          subtotal: number
          tax: number
          total_cost: number
          tracking_number: string
          updated_at: string
        }[]
      }
      get_orders_by_organization: {
        Args: { p_organization_id: string }
        Returns: {
          actual_delivery_date: string
          approved_by: string
          billing_address: Json
          cancelled_by: string
          confirmation_date: string
          created_at: string
          created_by: string
          created_by_email: string
          created_by_first_name: string
          created_by_last_name: string
          currency: string
          estimated_delivery_date: string
          factory_id: string
          factory_order_number: string
          internal_notes: string
          invoice: Json
          metadata: Json
          notes: string
          order_date: string
          order_id: string
          order_items: Json
          order_number: string
          organization_id: string
          payment_terms: string
          po_number: string
          project_id: string
          shipping_address: Json
          shipping_cost: number
          shipping_method: string
          shipping_notes: string
          status: string
          subtotal: number
          tax: number
          total_cost: number
          tracking_number: string
          updated_at: string
        }[]
      }
      get_orders_with_project: {
        Args: { p_organization_id: string }
        Returns: {
          approved_by: string
          billing_address: Json
          cancelled_by: string
          confirmation_date: string
          created_at: string
          created_by: string
          created_by_email: string
          created_by_first_name: string
          created_by_last_name: string
          currency: string
          factory_id: string
          factory_order_number: string
          internal_notes: string
          invoice: Json
          metadata: Json
          notes: string
          order_date: string
          order_id: string
          order_items: Json
          order_number: string
          organization_id: string
          payment_terms: string
          po_number: string
          project: Json
          project_id: string
          shipments: Json
          shipping_address: Json
          shipping_cost: number
          shipping_method: string
          shipping_notes: string
          status: string
          subtotal: number
          tax: number
          total_cost: number
          updated_at: string
        }[]
      }
      get_org_role_counts: {
        Args: { p_organization_id: string }
        Returns: {
          admincount: number
          membercount: number
        }[]
      }
      get_organization_name_and_id_by_user_id: {
        Args: { user_id: string }
        Returns: {
          name: string
          organization_id: string
          role: string
        }[]
      }
      get_organization_roles: {
        Args: { auth_id: string; p_organization_id: string }
        Returns: {
          created_at: string
          description: string
          id: string
          name: string
          permissions: Json
          updated_at: string
        }[]
      }
      get_organizations: {
        Args: {
          auth_id: string
          p_include_deleted?: boolean
          p_limit?: number
          p_offset?: number
          p_organization_id?: string
          p_search?: string
          p_status?: string
        }
        Returns: {
          business_type: string
          created_at: string
          credit_limit: number
          deleted_at: string
          departments: Json
          display_name: string
          duns_number: string
          id: string
          industry: string
          locations: Json
          metadata: Json
          name: string
          org_path: string
          org_size: Database["public"]["Enums"]["org_size"]
          parent_org_id: string
          payment_terms: string
          preferred_currency: string
          primary_contact_name: string
          primary_contact_phone: string
          primary_contact_title: string
          primary_email: string
          primary_phone: string
          purchase_order_prefix: string
          registration_number: string
          requires_po_number: boolean
          root_org_id: string
          secondary_email: string
          secondary_phone: string
          settings: Json
          status: Database["public"]["Enums"]["org_status"]
          tax_id: string
          updated_at: string
          vat_number: string
          website: string
        }[]
      }
      get_organizations_old: {
        Args: {
          p_include_deleted?: boolean
          p_limit?: number
          p_offset?: number
          p_organization_id?: string
          p_search?: string
          p_status?: string
        }
        Returns: {
          business_type: string
          created_at: string
          credit_limit: number
          deleted_at: string
          departments: Json
          display_name: string
          duns_number: string
          id: string
          industry: string
          locations: Json
          metadata: Json
          name: string
          org_path: string
          org_size: string
          parent_org_id: string
          payment_terms: string
          preferred_currency: string
          primary_contact_name: string
          primary_contact_phone: string
          primary_contact_title: string
          primary_email: string
          primary_phone: string
          purchase_order_prefix: string
          registration_number: string
          requires_po_number: boolean
          root_org_id: string
          secondary_email: string
          secondary_phone: string
          settings: Json
          status: string
          tax_id: string
          updated_at: string
          vat_number: string
          website: string
        }[]
      }
      get_projects: {
        Args: {
          auth_id: string
          p_department_id?: string
          p_end_date?: string
          p_limit?: number
          p_offset?: number
          p_organization_id?: string
          p_project_type?: Database["public"]["Enums"]["project_type"]
          p_search?: string
          p_start_date?: string
          p_status?: Database["public"]["Enums"]["project_status"]
        }
        Returns: {
          actual_completion_date: string
          budget: number
          budget_code: string
          catalog_items: Json
          code: string
          created_at: string
          created_by: string
          currency: string
          delivery_address: Json
          department_id: string
          description: string
          id: string
          installation_address: Json
          location_id: string
          metadata: Json
          name: string
          organization_id: string
          parent_project_id: string
          po_number: string
          project_owner: string
          project_path: string
          project_type: Database["public"]["Enums"]["project_type"]
          root_project_id: string
          settings: Json
          start_date: string
          status: Database["public"]["Enums"]["project_status"]
          target_completion_date: string
          updated_at: string
        }[]
      }
      get_projects_by_organization: {
        Args: { p_organization_id: string }
        Returns: {
          budget: number
          created_at: string
          deadline: string
          description: string
          name: string
          organization_name: string
          product_count: number
          products: Json
          project_id: string
          status: string
          total_price: number
          updated_at: string
        }[]
      }
      get_random_products: {
        Args: { limit_count: number; offset_count: number; seed_value: number }
        Returns: {
          created_at: string
          id: string
          image: string
        }[]
      }
      get_route_analytics: {
        Args: { days_back?: number }
        Returns: {
          avg_duration: number
          route: string
          total_visits: number
          unique_sessions: number
        }[]
      }
      get_temp_catalog_categories: { Args: never; Returns: string[] }
      get_user_analytics: {
        Args: {
          p_exclude_test_users?: boolean
          p_product_filter?: string
          p_session_id?: string
          p_soft_deleted_filter?: string
          p_user_id?: string
        }
        Returns: {
          email: string
          first_name: string
          generations: Json
          last_name: string
          session_id: string
          total_generations: number
          user_id: string
        }[]
      }
      get_user_home_site: {
        Args: { p_user_id: string }
        Returns: {
          home_site_id: string
          site_id: string
          site_slug: string
          site_url: string
          user_id: string
        }[]
      }
      get_user_org_permissions: {
        Args: { p_user_id: string }
        Returns: {
          org_id: string
          org_member_id: string
          role_id: string
        }[]
      }
      get_user_products_with_variants: {
        Args: {
          p_active_tab?: string
          p_page?: number
          p_page_size?: number
          p_search_query?: string
          p_sort_by?: string
          p_user_id: string
        }
        Returns: {
          created_at: string
          deleted_at: string
          id: string
          image_url: string
          init_prompt: string
          messages: Json[]
          product: Json
          product_data: Json[]
          product_name: string
          product_type: string
          provenance: string
          session_id: string
          terra_product_id: string
          terra_product_slug: string
          total_count: number
          updated_at: string
          user_id: string
          variant: Json
          variant_id: string
        }[]
      }
      get_user_profile: {
        Args: { p_user_id: string }
        Returns: {
          email: string
          first_name: string
          last_name: string
          system_role_name: string
          system_role_permissions: Json
          user_id: string
        }[]
      }
      get_users: {
        Args: {
          auth_id: string
          p_department_id?: string
          p_limit?: number
          p_offset?: number
          p_org_role_id?: string
          p_organization_id?: string
          p_project_id?: string
          p_search?: string
          p_status?: Database["public"]["Enums"]["org_member_status"]
          p_system_role_id?: string
          p_user_id?: string
        }
        Returns: {
          created_at: string
          email: string
          first_name: string
          home_site_id: string
          id: string
          last_name: string
          organization_details: Json
          project_memberships: Json
          system_role_id: string
        }[]
      }
      has_permission: {
        Args: { action: string; resource: string; role_permissions: Json }
        Returns: boolean
      }
      insert_skus_to_shopify_user: {
        Args: { p_skus: Json; p_user_id: string }
        Returns: {
          message: string
          updated_products: Json
        }[]
      }
      is_admin: { Args: never; Returns: boolean }
      is_support: { Args: never; Returns: boolean }
      mark_catalog_items_ready: {
        Args: { auth_id: string; p_item_ids: string[]; p_project_id: string }
        Returns: {
          message: string
          success: boolean
          updated_items: string[]
        }[]
      }
      migrate_session_products_to_user: {
        Args: { p_session_id: string; p_user_id: string }
        Returns: undefined
      }
      remove_product_from_shopify_user: {
        Args: { p_product_id: string; p_user_id: string }
        Returns: undefined
      }
      remove_shopify_user_by_user_id: {
        Args: { user_id_input: string }
        Returns: undefined
      }
      search_all_products: {
        Args: {
          category_id?: string
          include_shipping?: boolean
          max_price?: number
          min_price?: number
          page_number?: number
          page_size?: number
          search_query?: string
          sort_order?: string
        }
        Returns: {
          body_html: string
          category_name: string
          compare_at_price: number
          cost_price: number
          dimensions: Json
          factory_id: string
          id: string
          images: Json
          match_rank: number
          metadata: Json
          rank: number
          slug: string
          status: string
          title: string
          total_count: number
          variant_count: number
          variants: Json
        }[]
      }
      search_all_products_new: {
        Args: {
          category_ids?: string[]
          include_shipping?: boolean
          max_price?: number
          min_price?: number
          page_number?: number
          page_size?: number
          search_query?: string
          sort_order?: string
        }
        Returns: {
          body_html: string
          category_name: string
          compare_at_price: number
          cost_price: number
          dimensions: Json
          factory_id: string
          id: string
          images: Json
          match_rank: number
          metadata: Json
          rank: number
          slug: string
          status: string
          title: string
          total_count: number
          variant_count: number
          variants: Json
        }[]
      }
      search_all_products_new_new: {
        Args: {
          category_ids?: string[]
          include_shipping?: boolean
          max_price?: number
          min_price?: number
          page_number?: number
          page_size?: number
          search_query?: string
          sort_order?: string
        }
        Returns: {
          body_html: string
          category_name: string
          compare_at_price: number
          cost_price: number
          dimensions: Json
          factory_id: string
          id: string
          images: Json
          match_rank: number
          metadata: Json
          rank: number
          slug: string
          status: string
          title: string
          total_count: number
          variant_count: number
          variants: Json
        }[]
      }
      search_products: {
        Args: { search_query: string }
        Returns: {
          body_html: string | null
          category: string | null
          created_at: string | null
          deleted_at: string | null
          drop_approved: boolean
          drop_public: boolean
          drop_shipping_method: Database["public"]["Enums"]["shipping_method_type"]
          factory_id: string | null
          fts: unknown
          id: string
          important_details: Json[] | null
          metadata: Json | null
          published: boolean | null
          seo_description: string | null
          seo_title: string | null
          slug: string | null
          specifications: string[] | null
          status: string | null
          store_id: string | null
          tags: string | null
          thumbnail_image: string | null
          title: string | null
          type: string | null
          updated_at: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "products"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      search_products_advanced: {
        Args: {
          limit_count?: number
          offset_count?: number
          search_query: string
          search_type?: string
        }
        Returns: {
          created_at: string
          id: string
          image: string
          rank: number
          total_count: number
        }[]
      }
      search_products_advanced_filtered: {
        Args: {
          category_filter?: string
          limit_count: number
          offset_count: number
          search_query: string
          search_type?: string
          sub_category_filter?: string
        }
        Returns: {
          created_at: string
          id: string
          image: string
          rank: number
          total_count: number
        }[]
      }
      search_products_fuzzy: {
        Args: {
          limit_count?: number
          search_query: string
          similarity_threshold?: number
        }
        Returns: {
          created_at: string
          enriched_title: string
          id: string
          image: string
          similarity_score: number
        }[]
      }
      search_projects: {
        Args: {
          auth_id: string
          p_department_id?: string
          p_end_date?: string
          p_limit?: number
          p_offset?: number
          p_organization_id?: string
          p_project_type?: Database["public"]["Enums"]["project_type"]
          p_search?: string
          p_start_date?: string
          p_status?: Database["public"]["Enums"]["project_status"]
        }
        Returns: {
          actual_completion_date: string
          budget: number
          budget_code: string
          catalog_items: Json
          code: string
          created_at: string
          created_by: string
          currency: string
          delivery_address: Json
          department_id: string
          description: string
          id: string
          installation_address: Json
          location_id: string
          metadata: Json
          name: string
          organization_id: string
          parent_project_id: string
          po_number: string
          project_owner: string
          project_path: string
          project_type: Database["public"]["Enums"]["project_type"]
          root_project_id: string
          settings: Json
          start_date: string
          status: Database["public"]["Enums"]["project_status"]
          target_completion_date: string
          updated_at: string
        }[]
      }
      setup_new_user: {
        Args: {
          auth_id: string
          p_email: string
          p_first_name: string
          p_home_site_id?: string
          p_last_name: string
          p_org_department_id?: string
          p_org_role_id: string
          p_org_title?: string
          p_organization_id: string
          p_project_ids?: string[]
          p_project_role_id?: string
          p_system_role_id?: string
          p_user_id: string
        }
        Returns: {
          message: string
          success: boolean
          user_details: Json
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      sync_user_store: {
        Args: { p_store_name: string; p_store_token: string; p_user_id: string }
        Returns: undefined
      }
      update_order:
        | {
            Args: {
              auth_id: string
              p_actual_delivery_date?: string
              p_confirmation_date?: string
              p_currency?: string
              p_estimated_delivery_date?: string
              p_internal_notes?: string
              p_metadata?: Json
              p_notes?: string
              p_order_date?: string
              p_order_id: string
              p_order_number?: string
              p_payment_terms?: string
              p_po_number?: string
              p_shipping_address?: Json
              p_shipping_cost?: number
              p_shipping_method?: string
              p_shipping_notes?: string
              p_status?: Database["public"]["Enums"]["order_status"]
              p_supplier_id?: string
              p_supplier_order_number?: string
              p_tax?: number
              p_tracking_number?: string
            }
            Returns: {
              message: string
              new_status: Database["public"]["Enums"]["order_status"]
              order_id: string
              success: boolean
            }[]
          }
        | {
            Args: {
              auth_id: string
              p_actual_delivery_date?: string
              p_confirmation_date?: string
              p_currency?: string
              p_estimated_delivery_date?: string
              p_internal_notes?: string
              p_metadata?: Json
              p_notes?: string
              p_order_date?: string
              p_order_id: string
              p_payment_terms?: string
              p_po_number?: string
              p_shipping_address?: Json
              p_shipping_cost?: number
              p_shipping_method?: string
              p_shipping_notes?: string
              p_status?: string
              p_supplier_order_number?: string
              p_tax?: number
              p_tracking_number?: string
            }
            Returns: {
              message: string
              order_id: string
              success: boolean
              updated_fields: Json
            }[]
          }
      update_organization: {
        Args: {
          auth_id: string
          p_billing_address?: Json
          p_business_type?: string
          p_credit_limit?: number
          p_display_name?: string
          p_duns_number?: string
          p_industry?: string
          p_metadata?: Json
          p_name?: string
          p_org_size?: Database["public"]["Enums"]["org_size"]
          p_organization_id: string
          p_payment_terms?: string
          p_preferred_currency?: string
          p_primary_email?: string
          p_primary_phone?: string
          p_purchase_order_prefix?: string
          p_registration_number?: string
          p_requires_po_number?: boolean
          p_settings?: Json
          p_shipping_addresses?: Json[]
          p_status?: Database["public"]["Enums"]["org_status"]
          p_tax_id?: string
          p_vat_number?: string
          p_website?: string
        }
        Returns: {
          message: string
          organization_id: string
          success: boolean
          updated_fields: Json
        }[]
      }
      update_product_price_in_shopify_user: {
        Args: { p_new_price: number; p_product_id: string; p_user_id: string }
        Returns: undefined
      }
      update_project: {
        Args: {
          auth_id: string
          p_budget?: number
          p_budget_code?: string
          p_code?: string
          p_currency?: string
          p_delivery_address?: Json
          p_department_id?: string
          p_description?: string
          p_installation_address?: Json
          p_location_id?: string
          p_metadata?: Json
          p_name?: string
          p_po_number?: string
          p_project_id: string
          p_project_owner?: string
          p_project_type?: Database["public"]["Enums"]["project_type"]
          p_settings?: Json
          p_start_date?: string
          p_status?: Database["public"]["Enums"]["project_status"]
          p_target_completion_date?: string
        }
        Returns: {
          after_state: Json
          before_state: Json
          changes_made: Json
          message: string
          project_id: string
          success: boolean
        }[]
      }
      update_project_catalog_item: {
        Args: {
          auth_id: string
          p_catalog_id: string
          p_currency?: string
          p_customizations?: Json
          p_expected_delivery_date?: string
          p_location_notes?: string
          p_notes?: string
          p_project_id: string
          p_quantity?: number
          p_space_assignment?: string
          p_specifications?: Json
          p_status?: Database["public"]["Enums"]["catalog_item_status"]
          p_unit_price?: number
        }
        Returns: {
          catalog_id: string
          message: string
          success: boolean
        }[]
      }
      update_project_for_user: {
        Args: { p_project_id: string; p_user_id: string }
        Returns: Json
      }
      update_project_member: {
        Args: {
          auth_id: string
          p_member_id: string
          p_notes?: string
          p_permissions?: Json
          p_project_id: string
          p_role_id?: string
          p_title?: string
        }
        Returns: {
          member_id: string
          message: string
          success: boolean
        }[]
      }
      update_user: {
        Args: {
          auth_id: string
          p_add_project_ids?: string[]
          p_email?: string
          p_first_name?: string
          p_home_site_id?: string
          p_last_name?: string
          p_org_department_id?: string
          p_org_role_id?: string
          p_org_status?: Database["public"]["Enums"]["org_member_status"]
          p_org_title?: string
          p_organization_id?: string
          p_project_role_id?: string
          p_remove_project_ids?: string[]
          p_system_role_id?: string
          p_user_id: string
        }
        Returns: {
          message: string
          success: boolean
          user_details: Json
        }[]
      }
      upsert_user_interaction:
        | {
            Args: {
              p_browser_name?: string
              p_browser_version?: string
              p_chat_id?: string
              p_city?: string
              p_country?: string
              p_current_route?: string
              p_device_type?: string
              p_id: string
              p_ip_address?: unknown
              p_journey_path?: Json
              p_screen_resolution?: string
              p_session_id: string
              p_start_time?: string
              p_total_session_duration?: number
              p_user_id?: string
            }
            Returns: string
          }
        | {
            Args: {
              p_browser_name?: string
              p_browser_version?: string
              p_chat_id?: string
              p_city?: string
              p_country?: string
              p_current_route?: string
              p_device_name?: string
              p_device_type?: string
              p_id: string
              p_ip_address?: unknown
              p_journey_path?: Json
              p_screen_resolution?: string
              p_session_id: string
              p_start_time?: string
              p_total_session_duration?: number
              p_user_id?: string
            }
            Returns: string
          }
        | {
            Args: {
              p_browser_name?: string
              p_browser_version?: string
              p_chat_id?: string
              p_city?: string
              p_country?: string
              p_current_route?: string
              p_device_type?: string
              p_ip_address?: unknown
              p_journey_path?: Json
              p_screen_resolution?: string
              p_session_id: string
              p_start_time?: string
              p_total_session_duration?: number
              p_user_id?: string
            }
            Returns: string
          }
        | {
            Args: {
              p_browser_name?: string
              p_browser_version?: string
              p_chat_id?: string
              p_city?: string
              p_country?: string
              p_current_route?: string
              p_device_type?: string
              p_ip_address?: unknown
              p_journey_path?: Json
              p_screen_resolution?: string
              p_session_id: string
              p_start_time?: string
              p_total_session_duration?: number
              p_user_id?: string
            }
            Returns: string
          }
      user_has_permission: {
        Args: {
          auth_id: string
          p_organization_id?: string
          permission_key: string
        }
        Returns: boolean
      }
    }
    Enums: {
      audit_entity_type:
        | "organization"
        | "user"
        | "subscription"
        | "order"
        | "product"
        | "feature"
        | "project"
        | "share"
        | "payment"
      catalog_item_status:
        | "draft"
        | "pending"
        | "ready"
        | "in_order"
        | "ordered"
        | "processing"
        | "shipped"
        | "in_transit"
        | "delivered"
        | "installed"
        | "cancelled"
        | "returned"
        | "confirmed"
      collection_status: "draft" | "published" | "archived"
      error_context: "terraform" | "app" | "api" | "drop" | "auth" | "db"
      error_status: "unreviewed" | "pending" | "resolved"
      fulfillment_status:
        | "pending"
        | "processing"
        | "partially_fulfilled"
        | "fulfilled"
        | "cancelled"
      invoice_status:
        | "draft"
        | "pending"
        | "partially_paid"
        | "paid"
        | "void"
        | "refunded"
        | "partially_refunded"
      order_item_status:
        | "sourcing"
        | "quoted"
        | "drawing_confirmed"
        | "paid_to_factory"
        | "in_production"
        | "completed"
        | "issue"
        | "removed"
        | "unassigned"
        | "cancelled"
        | "on_hold"
      order_status:
        | "draft"
        | "invoiced"
        | "pending"
        | "approved"
        | "submitted"
        | "confirmed"
        | "in_production"
        | "partial_shipped"
        | "shipped"
        | "partial_delivery"
        | "delivered"
        | "completed"
        | "cancelled"
        | "on_hold"
        | "paid"
        | "sourcing"
        | "review"
      org_member_status:
        | "active"
        | "inactive"
        | "pending"
        | "suspended"
        | "invited"
        | "pending_confirmation"
      org_size: "small" | "medium" | "large" | "enterprise"
      org_status: "active" | "inactive" | "pending" | "suspended"
      organization_role: "member" | "admin" | "owner"
      payment_status:
        | "pending"
        | "requires_action"
        | "processing"
        | "succeeded"
        | "failed"
        | "cancelled"
        | "refunded"
        | "partially_refunded"
      production_rule_type:
        | "variant_based"
        | "round_robin"
        | "percentage"
        | "capacity_based"
      project_status:
        | "draft"
        | "planning"
        | "pending_approval"
        | "approved"
        | "in_procurement"
        | "partially_delivered"
        | "completed"
        | "cancelled"
        | "on_hold"
      project_type:
        | "new_construction"
        | "renovation"
        | "replacement"
        | "expansion"
        | "relocation"
      request_priority: "low" | "medium" | "high" | "urgent"
      request_status:
        | "pending"
        | "in_progress"
        | "awaiting_customer"
        | "converted_to_order"
        | "cancelled"
        | "completed"
      shipping_method_type: "air" | "ocean" | "both"
      shipping_option: "air" | "ocean"
      shipping_status:
        | "pending"
        | "processing"
        | "picked"
        | "in_transit"
        | "delivered"
        | "failed_delivery"
        | "returned"
      subscription_status: "active" | "past_due" | "canceled"
      subscription_tier: "free" | "b2b" | "d2cStarter" | "d2cPremium"
      task_priority: "low" | "medium" | "high" | "urgent"
      task_status: "backlog" | "todo" | "in_progress" | "done"
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
      audit_entity_type: [
        "organization",
        "user",
        "subscription",
        "order",
        "product",
        "feature",
        "project",
        "share",
        "payment",
      ],
      catalog_item_status: [
        "draft",
        "pending",
        "ready",
        "in_order",
        "ordered",
        "processing",
        "shipped",
        "in_transit",
        "delivered",
        "installed",
        "cancelled",
        "returned",
        "confirmed",
      ],
      collection_status: ["draft", "published", "archived"],
      error_context: ["terraform", "app", "api", "drop", "auth", "db"],
      error_status: ["unreviewed", "pending", "resolved"],
      fulfillment_status: [
        "pending",
        "processing",
        "partially_fulfilled",
        "fulfilled",
        "cancelled",
      ],
      invoice_status: [
        "draft",
        "pending",
        "partially_paid",
        "paid",
        "void",
        "refunded",
        "partially_refunded",
      ],
      order_item_status: [
        "sourcing",
        "quoted",
        "drawing_confirmed",
        "paid_to_factory",
        "in_production",
        "completed",
        "issue",
        "removed",
        "unassigned",
        "cancelled",
        "on_hold",
      ],
      order_status: [
        "draft",
        "invoiced",
        "pending",
        "approved",
        "submitted",
        "confirmed",
        "in_production",
        "partial_shipped",
        "shipped",
        "partial_delivery",
        "delivered",
        "completed",
        "cancelled",
        "on_hold",
        "paid",
        "sourcing",
        "review",
      ],
      org_member_status: [
        "active",
        "inactive",
        "pending",
        "suspended",
        "invited",
        "pending_confirmation",
      ],
      org_size: ["small", "medium", "large", "enterprise"],
      org_status: ["active", "inactive", "pending", "suspended"],
      organization_role: ["member", "admin", "owner"],
      payment_status: [
        "pending",
        "requires_action",
        "processing",
        "succeeded",
        "failed",
        "cancelled",
        "refunded",
        "partially_refunded",
      ],
      production_rule_type: [
        "variant_based",
        "round_robin",
        "percentage",
        "capacity_based",
      ],
      project_status: [
        "draft",
        "planning",
        "pending_approval",
        "approved",
        "in_procurement",
        "partially_delivered",
        "completed",
        "cancelled",
        "on_hold",
      ],
      project_type: [
        "new_construction",
        "renovation",
        "replacement",
        "expansion",
        "relocation",
      ],
      request_priority: ["low", "medium", "high", "urgent"],
      request_status: [
        "pending",
        "in_progress",
        "awaiting_customer",
        "converted_to_order",
        "cancelled",
        "completed",
      ],
      shipping_method_type: ["air", "ocean", "both"],
      shipping_option: ["air", "ocean"],
      shipping_status: [
        "pending",
        "processing",
        "picked",
        "in_transit",
        "delivered",
        "failed_delivery",
        "returned",
      ],
      subscription_status: ["active", "past_due", "canceled"],
      subscription_tier: ["free", "b2b", "d2cStarter", "d2cPremium"],
      task_priority: ["low", "medium", "high", "urgent"],
      task_status: ["backlog", "todo", "in_progress", "done"],
    },
  },
} as const
