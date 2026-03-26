import type React from 'react';

export interface Story {
  id: number;
  avatar: string;
  name: string;
  viewed?: boolean;
  verified?: boolean;
  thumbnail: string;
  userName: string;
  type: 'business' | 'community';
  aiVerified?: boolean;
  isLive?: boolean;
  media: string[];
  timeAgo: string;
}

export interface Subcategory {
  id: string;
  icon: React.ReactNode;
  nameKey: string;
  count?: number;
  subcategories?: Subcategory[];
}

export interface Category {
  id: string;
  icon: React.ReactNode;
  nameKey: string;
  eventCount: number;
  recommended?: boolean;
  subcategories?: Subcategory[];
}

export interface Business {
  id: string | number;
  name: string;
  nameAr?: string;
  nameKu?: string;
  coverImage?: string;
  imageUrl?: string;
  isPremium?: boolean;
  isFeatured?: boolean;
  category: string;
  subcategory?: string;
  rating: number;
  distance?: number;
  status?: string;
  image?: string;
  verified?: boolean;
  isVerified?: boolean;
  reviews?: number;
  reviewCount?: number;
  governorate?: string;
  governorateId?: string;
  city?: string;
  address?: string;
  phone?: string;
  whatsapp?: string;
  website?: string;
  description?: string;
  descriptionAr?: string;
  descriptionKu?: string;
  openHours?: string;
  priceRange?: 1 | 2 | 3 | 4;
  tags?: string[];
  lat?: number;
  lng?: number;
}

export interface Event {
  id: number;
  image: string;
  title: string;
  aiRecommended?: boolean;
  date: Date;
  venue: string;
  attendees: number;
  price: number;
  accessibility?: {
    wheelchairAccessible?: boolean;
    familyFriendly?: boolean;
    womenOnly?: boolean;
    sensoryFriendly?: boolean;
    signLanguage?: boolean;
    audioDescription?: boolean;
  };
}

export interface Deal {
  id: number;
  discount: number;
  businessLogo: string;
  title: string;
  description: string;
  expiresIn: string;
  claimed: number;
  total: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'owner' | 'user' | 'admin';
  businessId?: string;
}

export interface Post {
  id: string;
  businessId: string;
  businessName: string;
  businessAvatar: string;
  caption: string;
  imageUrl: string;
  createdAt: any;
  likes: number;
  verified?: boolean;
}

export interface BusinessPostcard {
  id?: string;
  title: string;
  city: string;
  neighborhood: string;
  governorate: string;
  category_tag: 'Cafe' | 'Restaurant' | 'Bakery' | 'Hotel' | 'Gym' | 'Salon' | 'Pharmacy' | 'Supermarket';
  phone: string;
  website?: string;
  instagram?: string;
  hero_image: string;
  image_gallery: string[];
  postcard_content: string;
  google_maps_url: string;
  rating: number;
  review_count: number;
  verified: boolean;
  updatedAt?: any;
}

export interface HeroSlide {
    id: number;
    title: string;
    subtitle: string;
    image: string;
}