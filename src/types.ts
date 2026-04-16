export type UserRole = 'user' | 'admin';
export type BusinessStatus = 'pending' | 'active' | 'rejected';
export type BusinessPlan = 'free' | 'standard' | 'featured';
export type AdStatus = 'pending' | 'active' | 'expired';
export type AdPlacement = 'ticker' | 'inline' | 'sidebar';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  photoUrl?: string;
  createdAt: any;
}

export interface BusinessListing {
  id: string;
  name: string;
  description: string;
  city: string;
  category: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  lat: number;
  lng: number;
  status: BusinessStatus;
  plan: BusinessPlan;
  pendingPlanUpdate?: BusinessPlan;
  photos: string[];
  ownerUid: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  expiryDate?: any;
  createdAt: any;
}

export interface PalaceAd {
  id: string;
  title: string;
  description: string;
  image: string;
  targetUrl: string;
  placement: AdPlacement;
  city: string;
  status: AdStatus;
  ownerUid: string;
  createdAt: any;
}

export interface Review {
  id: string;
  businessId: string;
  userId: string;
  userName: string;
  rating: number;
  content: string;
  createdAt: any;
}
