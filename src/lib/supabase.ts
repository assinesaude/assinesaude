import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'admin' | 'professional' | 'patient';

export interface UserProfile {
  id: string;
  role: UserRole;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Professional {
  id: string;
  user_id: string;
  professional_type: 'consultorio' | 'clinica' | 'hospital';
  profession: string;
  specialties: string[];
  council_number: string;
  council_uf: string;
  verified: boolean;
  plan_nomenclature: string;
  cep: string;
  address: string;
  city: string;
  state: string;
  country: string;
  neighborhood?: string;
  business_name: string;
  description?: string;
  business_photos?: string[];
  opening_hours?: any;
  social_links?: any;
  payment_preference: 'platform' | 'direct_pix';
  pix_key?: string;
  bank_details?: any;
  platform_plan?: string;
  platform_plan_active: boolean;
  average_rating: number;
  total_reviews: number;
  is_online: boolean;
  last_online_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Patient {
  id: string;
  user_id: string;
  cpf: string;
  birth_date?: string;
  address?: string;
  cep?: string;
  city?: string;
  state?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  blood_type?: string;
  allergies?: string[];
  chronic_conditions?: string[];
  created_at: string;
  updated_at: string;
}

export interface BenefitPlan {
  id: string;
  professional_id: string;
  name: string;
  description: string;
  included_services: string[];
  excluded_services?: string[];
  service_limits?: any;
  monthly_price: number;
  annual_price?: number;
  waiting_periods?: any;
  is_published: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  patient_id: string;
  plan_id: string;
  professional_id: string;
  status: 'active' | 'suspended' | 'cancelled' | 'pending';
  start_date: string;
  end_date?: string;
  next_billing_date?: string;
  monthly_amount: number;
  contract_accepted: boolean;
  contract_accepted_at?: string;
  contract_ip?: string;
  contract_pdf_url?: string;
  dependents?: any;
  coupon_code?: string;
  discount_amount: number;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  professional_id: string;
  patient_id: string;
  subscription_id?: string;
  appointment_type: 'online' | 'presencial';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  scheduled_at: string;
  duration_minutes: number;
  meeting_url?: string;
  meeting_password?: string;
  patient_notes?: string;
  professional_notes?: string;
  reminder_sent: boolean;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  subject?: string;
  content: string;
  status: 'sent' | 'delivered' | 'read';
  is_system_message: boolean;
  is_birthday_message: boolean;
  read_at?: string;
  created_at: string;
}

export interface Review {
  id: string;
  professional_id: string;
  patient_id: string;
  subscription_id?: string;
  appointment_id?: string;
  rating: number;
  comment?: string;
  is_approved: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Testimonial {
  id: string;
  type: 'professional' | 'patient';
  name: string;
  photo_url: string;
  city: string;
  testimonial: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Coupon {
  id: string;
  created_by: string;
  professional_id?: string;
  code: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  valid_from: string;
  valid_until: string;
  max_uses?: number;
  current_uses: number;
  max_uses_per_user: number;
  applicable_to: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CarouselItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  title?: string;
  description?: string;
  display_order: number;
  is_active: boolean;
  duration_seconds?: number;
  created_at: string;
  updated_at: string;
}

export interface FeatureVector {
  id: string;
  image_url: string;
  caption: string;
  font_family: string;
  font_size: string;
  font_color: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface NewsHighlight {
  id: string;
  image_url: string;
  title: string;
  subtitle: string;
  article_url?: string;
  source: string;
  display_order: number;
  is_active: boolean;
  last_fetched_at?: string;
  created_at: string;
  updated_at: string;
}

export interface BannerCarousel {
  id: string;
  title: string;
  media_url: string;
  media_type: 'image' | 'video';
  link_url?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
