export interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  category: 'painting' | 'watercolor' | 'mixed_media' | 'cake' | 'other';
  image_url: string;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
}

export interface CakeOrder {
  id: string;
  reference_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  event_type: string;
  event_date: string;
  theme: string;
  cake_size: string;
  tiers: number;
  flavour?: string;
  dietary_notes?: string;
  special_requests?: string;
  budget_range?: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'ready' | 'delivered' | 'cancelled';
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export type CakeOrderFormData = Omit<CakeOrder, 'id' | 'reference_number' | 'status' | 'admin_notes' | 'created_at' | 'updated_at'>;

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export type ContactFormData = Omit<ContactMessage, 'id' | 'is_read' | 'created_at'>;

export interface Perfume {
  id: string;
  name: string;
  brand: string;
  description: string;
  scent_family: 'floral' | 'woody' | 'oriental' | 'fresh' | 'citrus' | 'gourmand' | 'aquatic' | 'spicy';
  notes_top: string;
  notes_middle: string;
  notes_base: string;
  mood: string[];
  season: string[];
  occasion: string[];
  image_url: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface PerfumeMatch {
  id: string;
  reference_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  occasion: string;
  mood: string;
  preferred_intensity: string;
  preferred_families: string[];
  avoid_notes?: string;
  budget_range?: string;
  additional_info?: string;
  matched_perfume_ids: string[];
  status: 'pending' | 'in_review' | 'matched' | 'sent';
  admin_notes?: string;
  created_at: string;
}

export interface Testimonial {
  id: string;
  customer_name: string;
  quote: string;
  event_type?: string;
  is_visible: boolean;
  sort_order: number;
  created_at: string;
}
