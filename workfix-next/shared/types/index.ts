export type UserRole = 'customer' | 'provider' | 'admin' | 'superadmin'
export type KycStatus = 'not_submitted' | 'pending' | 'approved' | 'rejected'
export type Language = 'en' | 'ar' | 'no' | 'sv'

export interface Profile {
  id: string
  display_name: string
  email?: string
  phone?: string
  role: UserRole
  is_active: boolean
  is_banned: boolean
  ban_reason?: string
  photo_url?: string
  kyc_status?: KycStatus
  kyc_documents?: Record<string, string>
  kyc_rejection_reason?: string
  country?: string
  preferred_language?: Language
  created_at: string
  updated_at?: string
}

export interface ProviderProfile {
  id: string
  is_available: boolean
  is_verified: boolean
  avg_rating?: number
  rating_count?: number
  avg_response_minutes?: number
  acceptance_rate?: number
  completed_orders?: number
  location_lat?: number
  location_lng?: number
  service_categories?: string[]
  hourly_rate?: number
  bio?: string
  subscription_tier?: string
  has_active_boost?: boolean
  created_at?: string
}

export type OrderStatus =
  | 'pending'
  | 'quoted'
  | 'confirmed'
  | 'payment_pending'
  | 'in_progress'
  | 'completed'
  | 'closed'
  | 'cancelled'
  | 'disputed'

export type PaymentMethod = 'card' | 'apple_pay' | 'mada' | 'stc_pay' | 'cash' | 'vipps' | 'swish'

export interface Order {
  id: string
  customer_id: string
  provider_id?: string
  category_id: string
  title: string
  description: string
  location_lat?: number
  location_lng?: number
  location_address?: string
  geohash?: string
  photo_urls?: string[]
  budget?: number
  currency: string
  status: OrderStatus
  payment_status?: string
  payment_method?: PaymentMethod
  quoted_price?: number
  final_price?: number
  commission_amount?: number
  net_amount?: number
  created_at: string
  updated_at?: string
  categories?: Category
}

export interface Quote {
  id: string
  order_id: string
  provider_id: string
  customer_id?: string
  price: number
  currency?: string
  estimated_hours?: number
  notes?: string
  status: 'pending' | 'accepted' | 'rejected' | 'expired'
  expires_at?: string
  created_at: string
  profiles?: { display_name?: string; photo_url?: string }
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  text?: string
  media_url?: string
  type: 'text' | 'media' | 'system'
  created_at: string
}

export interface Conversation {
  id: string
  order_id?: string
  participants: string[]
  last_message?: string
  last_message_at?: string
  created_at: string
}

export interface Payment {
  id: string
  order_id: string
  customer_id: string
  provider_id: string
  amount: number
  commission: number
  net_amount: number
  status: 'initiated' | 'held' | 'captured' | 'failed' | 'refunded'
  method: PaymentMethod
  currency: string
  captured_at?: string
  created_at: string
}

export interface Category {
  id: string
  name_en?: string
  name_ar?: string
  name_no?: string
  name_sv?: string
  icon: string
  is_active?: boolean
  sort_order?: number
}

export interface Dispute {
  id: string
  order_id: string
  customer_id?: string
  provider_id?: string
  reason: string
  status: 'open' | 'investigating' | 'resolved'
  resolution?: 'customer_favor' | 'provider_favor' | 'settlement'
  admin_note?: string
  created_at: string
  resolved_at?: string
  orders?: { title?: string }
}

export interface AuditLog {
  id: string
  action: string
  actor_id: string
  payload?: Record<string, unknown>
  created_at: string
}

export interface AdminStats {
  totalUsers: number
  activeOrders: number
  pendingKyc: number
  openDisputes: number
}

export interface ReportData {
  totalRevenue: number
  totalCommission: number
  totalOrders: number
  avgOrderValue: number
  cancelledOrders: number
  disputeRate: number | string
  newUsers: number
  activeProviders: number
  weeklyData: number[]
}

export interface ProviderDashboardData {
  pendingQuotes: number
  activeJobs: number
  earnedToday: number
}

export interface EarningsData {
  available: number
  pending: number
  history: Payment[]
}

export type ToastType = 'success' | 'error' | 'info'
