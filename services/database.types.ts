export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      businesses: {
        Row: {
          id: string;
          name: string;
          nameAr: string | null;
          nameKu: string | null;
          imageUrl: string | null;
          coverImage: string | null;
          category: string;
          subcategory: string | null;
          rating: number;
          distance: number | null;
          status: string | null;
          isVerified: boolean | null;
          verified: boolean | null;
          reviewCount: number | null;
          governorate: string | null;
          city: string | null;
          address: string | null;
          phone: string | null;
          whatsapp: string | null;
          website: string | null;
          description: string | null;
          descriptionAr: string | null;
          descriptionKu: string | null;
          openHours: string | null;
          priceRange: number | null;
          tags: string[] | null;
          lat: number | null;
          lng: number | null;
          isFeatured: boolean | null;
          isPremium: boolean | null;
        };
        Insert: Partial<Database['public']['Tables']['businesses']['Row']> & { id?: string };
        Update: Partial<Database['public']['Tables']['businesses']['Row']>;
      };
      deals: {
        Row: {
          id: string;
          discount: number;
          businessLogo: string;
          title: string;
          titleKey: string | null;
          description: string;
          descriptionKey: string | null;
          expiresIn: string;
          expiresInKey: string | null;
          claimed: number;
          total: number;
          createdAt: string | null;
        };
        Insert: Partial<Database['public']['Tables']['deals']['Row']>;
        Update: Partial<Database['public']['Tables']['deals']['Row']>;
      };
      stories: {
        Row: {
          id: string;
          avatar: string;
          name: string;
          viewed: boolean | null;
          verified: boolean | null;
          thumbnail: string;
          userName: string;
          type: 'business' | 'community';
          aiVerified: boolean | null;
          isLive: boolean | null;
          media: string[];
          timeAgo: string;
          createdAt: string | null;
        };
        Insert: Partial<Database['public']['Tables']['stories']['Row']>;
        Update: Partial<Database['public']['Tables']['stories']['Row']>;
      };
      events: {
        Row: {
          id: string;
          image: string;
          title: string;
          titleKey: string | null;
          aiRecommended: boolean | null;
          date: string;
          venue: string;
          venueKey: string | null;
          location: string | null;
          attendees: number;
          price: number;
          category: string;
          governorate: string;
          accessibility: Json | null;
        };
        Insert: Partial<Database['public']['Tables']['events']['Row']>;
        Update: Partial<Database['public']['Tables']['events']['Row']>;
      };
      posts: {
        Row: {
          id: string;
          businessId: string;
          businessName: string;
          businessAvatar: string;
          caption: string;
          imageUrl: string;
          createdAt: string;
          likes: number;
          isVerified: boolean | null;
        };
        Insert: Partial<Database['public']['Tables']['posts']['Row']>;
        Update: Partial<Database['public']['Tables']['posts']['Row']>;
      };
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          avatar: string;
          role: 'owner' | 'user' | 'admin';
          businessId: string | null;
          updatedAt: string | null;
        };
        Insert: Partial<Database['public']['Tables']['users']['Row']> & { id: string };
        Update: Partial<Database['public']['Tables']['users']['Row']>;
      };
      business_postcards: {
        Row: {
          id: string;
          title: string;
          city: string;
          neighborhood: string;
          governorate: string;
          category_tag: 'Cafe' | 'Restaurant' | 'Bakery' | 'Hotel' | 'Gym' | 'Salon' | 'Pharmacy' | 'Supermarket';
          phone: string;
          website: string | null;
          instagram: string | null;
          hero_image: string;
          image_gallery: string[];
          postcard_content: string;
          google_maps_url: string;
          rating: number;
          review_count: number;
          verified: boolean;
          updatedAt: string | null;
          isVerified: boolean | null;
        };
        Insert: Partial<Database['public']['Tables']['business_postcards']['Row']>;
        Update: Partial<Database['public']['Tables']['business_postcards']['Row']>;
      };
    };
  };
}

export type TableRow<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type TableInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type TableUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
