-- WorkFix Database Schema for Supabase
-- Run this in the Supabase SQL Editor

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE user_role AS ENUM ('customer', 'provider', 'admin', 'superadmin');
CREATE TYPE kyc_status AS ENUM ('not_submitted', 'pending', 'approved', 'rejected');
CREATE TYPE order_status AS ENUM (
  'pending', 'quoted', 'confirmed', 'payment_pending',
  'in_progress', 'completed', 'closed', 'cancelled', 'disputed'
);
CREATE TYPE quote_status AS ENUM ('pending', 'accepted', 'rejected', 'expired');
CREATE TYPE payment_status AS ENUM ('initiated', 'held', 'captured', 'failed', 'refunded');
CREATE TYPE payment_method AS ENUM ('card', 'apple_pay', 'stc_pay', 'mada', 'cash', 'vipps', 'swish');
CREATE TYPE dispute_status AS ENUM ('open', 'investigating', 'resolved');
CREATE TYPE dispute_resolution AS ENUM ('customer_favor', 'provider_favor', 'settlement');
CREATE TYPE subscription_tier AS ENUM ('pro', 'business');
CREATE TYPE subscription_period AS ENUM ('monthly', 'yearly');
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'expired', 'past_due');
CREATE TYPE message_type AS ENUM ('text', 'media', 'system');
CREATE TYPE currency_code AS ENUM ('SAR', 'AED', 'KWD', 'QAR', 'BHD', 'OMR', 'EGP', 'NOK', 'SEK');

-- ============================================
-- TABLES
-- ============================================

-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  email TEXT,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'customer',
  is_active BOOLEAN DEFAULT false,
  is_banned BOOLEAN DEFAULT false,
  ban_reason TEXT,
  photo_url TEXT,
  kyc_status kyc_status DEFAULT 'not_submitted',
  kyc_rejection_reason TEXT,
  preferred_language TEXT DEFAULT 'en' CHECK (preferred_language IN ('ar', 'en', 'no', 'sv')),
  country TEXT DEFAULT 'SA',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Provider profiles (1:1 with provider users)
CREATE TABLE provider_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  bio TEXT,
  service_categories TEXT[] DEFAULT '{}',
  service_area_geohash TEXT,
  hourly_rate NUMERIC(10,2),
  is_verified BOOLEAN DEFAULT false,
  avg_rating NUMERIC(3,2) DEFAULT 4.00,
  rating_count INTEGER DEFAULT 0,
  sum_ratings INTEGER DEFAULT 0,
  avg_response_minutes NUMERIC(6,1) DEFAULT 30,
  total_orders INTEGER DEFAULT 0,
  acceptance_rate NUMERIC(3,2) DEFAULT 0.80,
  completed_orders INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT false,
  location_lat NUMERIC(10,7),
  location_lng NUMERIC(10,7),
  location_geohash TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Service categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  name_no TEXT,
  name_sv TEXT,
  icon TEXT NOT NULL DEFAULT '🔧',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES profiles(id),
  provider_id UUID REFERENCES profiles(id),
  category_id UUID NOT NULL REFERENCES categories(id),
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 3 AND 200),
  description TEXT NOT NULL CHECK (char_length(description) BETWEEN 10 AND 2000),
  location_lat NUMERIC(10,7) NOT NULL,
  location_lng NUMERIC(10,7) NOT NULL,
  location_address TEXT NOT NULL,
  location_geohash TEXT NOT NULL,
  photos TEXT[] DEFAULT '{}',
  budget NUMERIC(10,2),
  currency currency_code NOT NULL DEFAULT 'SAR',
  status order_status NOT NULL DEFAULT 'pending',
  payment_status payment_status,
  payment_method payment_method,
  quoted_price NUMERIC(10,2),
  final_price NUMERIC(10,2),
  commission_amount NUMERIC(10,2),
  net_amount NUMERIC(10,2),
  escrow_payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Quotes (subcollection of orders)
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES profiles(id),
  customer_id UUID NOT NULL REFERENCES profiles(id),
  price NUMERIC(10,2) NOT NULL CHECK (price > 0),
  currency currency_code NOT NULL DEFAULT 'SAR',
  estimated_hours NUMERIC(4,1),
  notes TEXT CHECK (notes IS NULL OR char_length(notes) <= 500),
  status quote_status NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Conversations
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  participants UUID[] NOT NULL,
  last_message TEXT,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id),
  text TEXT,
  media_url TEXT,
  type message_type NOT NULL DEFAULT 'text',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  customer_id UUID NOT NULL REFERENCES profiles(id),
  provider_id UUID NOT NULL REFERENCES profiles(id),
  tap_charge_id TEXT,
  amount NUMERIC(10,2) NOT NULL,
  commission NUMERIC(10,2) NOT NULL,
  net_amount NUMERIC(10,2) NOT NULL,
  status payment_status NOT NULL DEFAULT 'initiated',
  method payment_method NOT NULL,
  currency currency_code NOT NULL,
  captured_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  reviewer_id UUID NOT NULL REFERENCES profiles(id),
  target_id UUID NOT NULL REFERENCES profiles(id),
  target_type TEXT NOT NULL CHECK (target_type IN ('provider', 'customer')),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(order_id, reviewer_id)
);

-- Disputes
CREATE TABLE disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  customer_id UUID NOT NULL REFERENCES profiles(id),
  provider_id UUID NOT NULL REFERENCES profiles(id),
  reason TEXT NOT NULL,
  status dispute_status NOT NULL DEFAULT 'open',
  resolution dispute_resolution,
  admin_note TEXT,
  evidence TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES profiles(id),
  tier subscription_tier NOT NULL,
  period subscription_period NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  currency currency_code NOT NULL DEFAULT 'SAR',
  tap_id TEXT,
  status subscription_status NOT NULL DEFAULT 'active',
  current_period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- IBANs (encrypted)
CREATE TABLE ibans (
  uid UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  encrypted_iban TEXT NOT NULL,
  country TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Boosts
CREATE TABLE boosts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES profiles(id),
  duration INTEGER NOT NULL CHECK (duration IN (7, 14, 30)),
  price NUMERIC(10,2) NOT NULL,
  currency currency_code NOT NULL DEFAULT 'SAR',
  active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Audit logs (append-only)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  actor_id TEXT NOT NULL DEFAULT 'system',
  payload JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- FCM / Push tokens
CREATE TABLE push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('web', 'ios', 'android')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, token)
);

-- Unread counts
CREATE TABLE unread_counts (
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  count INTEGER DEFAULT 0,
  PRIMARY KEY (conversation_id, user_id)
);

-- Feature flags
CREATE TABLE feature_flags (
  key TEXT PRIMARY KEY,
  enabled BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Invoice counters
CREATE TABLE invoice_counters (
  key TEXT PRIMARY KEY,
  value INTEGER DEFAULT 0
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_orders_customer ON orders(customer_id, created_at DESC);
CREATE INDEX idx_orders_provider ON orders(provider_id, created_at DESC);
CREATE INDEX idx_orders_status ON orders(status, created_at DESC);
CREATE INDEX idx_orders_geohash ON orders(location_geohash);
CREATE INDEX idx_quotes_order ON quotes(order_id, status);
CREATE INDEX idx_quotes_provider ON quotes(provider_id, created_at DESC);
CREATE INDEX idx_quotes_expiry ON quotes(status, expires_at ASC) WHERE status = 'pending';
CREATE INDEX idx_messages_conv ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_reviews_target ON reviews(target_id, target_type);
CREATE INDEX idx_payments_provider ON payments(provider_id, status);
CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_disputes_status ON disputes(status, created_at DESC);
CREATE INDEX idx_provider_geohash ON provider_profiles(location_geohash) WHERE is_available = true AND is_verified = true;
CREATE INDEX idx_provider_available ON provider_profiles(is_available, is_verified);
CREATE INDEX idx_boosts_active ON boosts(provider_id, active) WHERE active = true;
CREATE INDEX idx_audit_action ON audit_logs(action, created_at DESC);
CREATE INDEX idx_subscriptions_provider ON subscriptions(provider_id, status);
CREATE INDEX idx_conversations_participants ON conversations USING GIN(participants);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ibans ENABLE ROW LEVEL SECURITY;
ALTER TABLE boosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE unread_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

-- Helper function to get user role
CREATE OR REPLACE FUNCTION get_user_role(uid UUID)
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = uid;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: is admin or superadmin
CREATE OR REPLACE FUNCTION is_admin(uid UUID)
RETURNS BOOLEAN AS $$
  SELECT role IN ('admin', 'superadmin') FROM profiles WHERE id = uid;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Profiles: read own or admin reads all
CREATE POLICY profiles_select ON profiles FOR SELECT USING (
  id = auth.uid() OR is_admin(auth.uid())
);
CREATE POLICY profiles_update ON profiles FOR UPDATE USING (
  id = auth.uid() OR is_admin(auth.uid())
);
CREATE POLICY profiles_insert ON profiles FOR INSERT WITH CHECK (id = auth.uid());

-- Provider profiles
CREATE POLICY provider_profiles_select ON provider_profiles FOR SELECT USING (true);
CREATE POLICY provider_profiles_update ON provider_profiles FOR UPDATE USING (
  id = auth.uid() OR is_admin(auth.uid())
);
CREATE POLICY provider_profiles_insert ON provider_profiles FOR INSERT WITH CHECK (id = auth.uid());

-- Categories: everyone can read
CREATE POLICY categories_select ON categories FOR SELECT USING (true);
CREATE POLICY categories_admin ON categories FOR ALL USING (is_admin(auth.uid()));

-- Orders: participant or admin
CREATE POLICY orders_select ON orders FOR SELECT USING (
  customer_id = auth.uid() OR provider_id = auth.uid() OR is_admin(auth.uid())
);
CREATE POLICY orders_insert ON orders FOR INSERT WITH CHECK (customer_id = auth.uid());
CREATE POLICY orders_update ON orders FOR UPDATE USING (
  customer_id = auth.uid() OR provider_id = auth.uid() OR is_admin(auth.uid())
);

-- Quotes: customer or provider of order, or admin
CREATE POLICY quotes_select ON quotes FOR SELECT USING (
  customer_id = auth.uid() OR provider_id = auth.uid() OR is_admin(auth.uid())
);
CREATE POLICY quotes_insert ON quotes FOR INSERT WITH CHECK (provider_id = auth.uid());
CREATE POLICY quotes_update ON quotes FOR UPDATE USING (
  customer_id = auth.uid() OR provider_id = auth.uid() OR is_admin(auth.uid())
);

-- Conversations: participant only
CREATE POLICY conversations_select ON conversations FOR SELECT USING (
  auth.uid() = ANY(participants) OR is_admin(auth.uid())
);
CREATE POLICY conversations_insert ON conversations FOR INSERT WITH CHECK (
  auth.uid() = ANY(participants)
);

-- Messages: conversation participant
CREATE POLICY messages_select ON messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = conversation_id AND (auth.uid() = ANY(c.participants) OR is_admin(auth.uid()))
  )
);
CREATE POLICY messages_insert ON messages FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Payments: participant or admin
CREATE POLICY payments_select ON payments FOR SELECT USING (
  customer_id = auth.uid() OR provider_id = auth.uid() OR is_admin(auth.uid())
);

-- Reviews: public read, reviewer insert
CREATE POLICY reviews_select ON reviews FOR SELECT USING (true);
CREATE POLICY reviews_insert ON reviews FOR INSERT WITH CHECK (reviewer_id = auth.uid());

-- Disputes: participant or admin
CREATE POLICY disputes_select ON disputes FOR SELECT USING (
  customer_id = auth.uid() OR provider_id = auth.uid() OR is_admin(auth.uid())
);
CREATE POLICY disputes_insert ON disputes FOR INSERT WITH CHECK (customer_id = auth.uid());
CREATE POLICY disputes_update ON disputes FOR UPDATE USING (is_admin(auth.uid()));

-- Subscriptions: own or admin
CREATE POLICY subscriptions_select ON subscriptions FOR SELECT USING (
  provider_id = auth.uid() OR is_admin(auth.uid())
);

-- IBANs: admin read only
CREATE POLICY ibans_select ON ibans FOR SELECT USING (
  uid = auth.uid() OR is_admin(auth.uid())
);
CREATE POLICY ibans_upsert ON ibans FOR INSERT WITH CHECK (uid = auth.uid());
CREATE POLICY ibans_update ON ibans FOR UPDATE USING (uid = auth.uid());

-- Boosts: own or admin
CREATE POLICY boosts_select ON boosts FOR SELECT USING (
  provider_id = auth.uid() OR is_admin(auth.uid())
);

-- Audit logs: admin read, system insert
CREATE POLICY audit_logs_select ON audit_logs FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY audit_logs_insert ON audit_logs FOR INSERT WITH CHECK (true);

-- Push tokens: own only
CREATE POLICY push_tokens_select ON push_tokens FOR SELECT USING (user_id = auth.uid());
CREATE POLICY push_tokens_insert ON push_tokens FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY push_tokens_delete ON push_tokens FOR DELETE USING (user_id = auth.uid());

-- Unread counts: own only
CREATE POLICY unread_counts_select ON unread_counts FOR SELECT USING (user_id = auth.uid());
CREATE POLICY unread_counts_update ON unread_counts FOR UPDATE USING (user_id = auth.uid());

-- Feature flags: everyone reads
CREATE POLICY feature_flags_select ON feature_flags FOR SELECT USING (true);
CREATE POLICY feature_flags_admin ON feature_flags FOR ALL USING (is_admin(auth.uid()));

-- ============================================
-- FUNCTIONS (RPC)
-- ============================================

-- Create order + dispatch notifications
CREATE OR REPLACE FUNCTION create_order(
  p_category_id UUID,
  p_title TEXT,
  p_description TEXT,
  p_lat NUMERIC,
  p_lng NUMERIC,
  p_address TEXT,
  p_geohash TEXT,
  p_photos TEXT[] DEFAULT '{}',
  p_budget NUMERIC DEFAULT NULL,
  p_currency currency_code DEFAULT 'SAR'
)
RETURNS UUID AS $$
DECLARE
  v_order_id UUID;
BEGIN
  INSERT INTO orders (customer_id, category_id, title, description,
    location_lat, location_lng, location_address, location_geohash,
    photos, budget, currency, status)
  VALUES (auth.uid(), p_category_id, p_title, p_description,
    p_lat, p_lng, p_address, p_geohash,
    p_photos, p_budget, p_currency, 'pending')
  RETURNING id INTO v_order_id;

  INSERT INTO audit_logs (action, actor_id, payload)
  VALUES ('order_created', auth.uid()::text, jsonb_build_object('order_id', v_order_id));

  RETURN v_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Submit quote
CREATE OR REPLACE FUNCTION submit_quote(
  p_order_id UUID,
  p_price NUMERIC,
  p_estimated_hours NUMERIC DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_quote_id UUID;
  v_order RECORD;
  v_quote_count INTEGER;
BEGIN
  SELECT * INTO v_order FROM orders WHERE id = p_order_id;
  IF v_order IS NULL THEN RAISE EXCEPTION 'Order not found'; END IF;
  IF v_order.status NOT IN ('pending', 'quoted') THEN RAISE EXCEPTION 'Order not accepting quotes'; END IF;

  SELECT COUNT(*) INTO v_quote_count FROM quotes WHERE order_id = p_order_id AND status = 'pending';
  IF v_quote_count >= 8 THEN RAISE EXCEPTION 'Maximum quotes reached'; END IF;

  IF EXISTS (SELECT 1 FROM quotes WHERE order_id = p_order_id AND provider_id = auth.uid()) THEN
    RAISE EXCEPTION 'Already quoted';
  END IF;

  INSERT INTO quotes (order_id, provider_id, customer_id, price, currency, estimated_hours, notes, status, expires_at)
  VALUES (p_order_id, auth.uid(), v_order.customer_id, p_price, v_order.currency,
    p_estimated_hours, p_notes, 'pending', now() + interval '24 hours')
  RETURNING id INTO v_quote_id;

  IF v_order.status = 'pending' THEN
    UPDATE orders SET status = 'quoted', updated_at = now() WHERE id = p_order_id;
  END IF;

  RETURN v_quote_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Accept quote
CREATE OR REPLACE FUNCTION accept_quote(p_order_id UUID, p_quote_id UUID)
RETURNS VOID AS $$
DECLARE
  v_order RECORD;
  v_quote RECORD;
BEGIN
  SELECT * INTO v_order FROM orders WHERE id = p_order_id AND customer_id = auth.uid();
  IF v_order IS NULL THEN RAISE EXCEPTION 'Order not found'; END IF;
  IF v_order.status != 'quoted' THEN RAISE EXCEPTION 'Order not in quoted status'; END IF;

  SELECT * INTO v_quote FROM quotes WHERE id = p_quote_id AND order_id = p_order_id AND status = 'pending';
  IF v_quote IS NULL THEN RAISE EXCEPTION 'Quote not found'; END IF;

  UPDATE quotes SET status = 'accepted', updated_at = now() WHERE id = p_quote_id;
  UPDATE quotes SET status = 'rejected', updated_at = now()
    WHERE order_id = p_order_id AND id != p_quote_id AND status = 'pending';

  UPDATE orders SET
    status = 'confirmed',
    provider_id = v_quote.provider_id,
    quoted_price = v_quote.price,
    updated_at = now()
  WHERE id = p_order_id;

  INSERT INTO conversations (order_id, participants)
  VALUES (p_order_id, ARRAY[v_order.customer_id, v_quote.provider_id]);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mark order complete (provider)
CREATE OR REPLACE FUNCTION mark_order_complete(p_order_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE orders SET status = 'completed', updated_at = now()
  WHERE id = p_order_id AND provider_id = auth.uid() AND status = 'in_progress';
  IF NOT FOUND THEN RAISE EXCEPTION 'Cannot complete order'; END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Confirm completion (customer)
CREATE OR REPLACE FUNCTION confirm_completion(p_order_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE orders SET status = 'closed', updated_at = now()
  WHERE id = p_order_id AND customer_id = auth.uid() AND status = 'completed';
  IF NOT FOUND THEN RAISE EXCEPTION 'Cannot confirm order'; END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cancel order
CREATE OR REPLACE FUNCTION cancel_order(p_order_id UUID, p_reason TEXT DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
  UPDATE orders SET status = 'cancelled', updated_at = now()
  WHERE id = p_order_id AND customer_id = auth.uid()
    AND status IN ('pending', 'quoted', 'confirmed');
  IF NOT FOUND THEN RAISE EXCEPTION 'Cannot cancel order'; END IF;

  INSERT INTO audit_logs (action, actor_id, payload)
  VALUES ('order_cancelled', auth.uid()::text, jsonb_build_object('order_id', p_order_id, 'reason', p_reason));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Submit review
CREATE OR REPLACE FUNCTION submit_review(
  p_order_id UUID,
  p_rating INTEGER,
  p_comment TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_order RECORD;
  v_review_id UUID;
  v_sum INTEGER;
  v_count INTEGER;
BEGIN
  SELECT * INTO v_order FROM orders WHERE id = p_order_id AND customer_id = auth.uid() AND status = 'closed';
  IF v_order IS NULL THEN RAISE EXCEPTION 'Order not found or not closed'; END IF;

  INSERT INTO reviews (order_id, reviewer_id, target_id, target_type, rating, comment)
  VALUES (p_order_id, auth.uid(), v_order.provider_id, 'provider', p_rating, p_comment)
  RETURNING id INTO v_review_id;

  SELECT COALESCE(SUM(rating), 0), COUNT(*) INTO v_sum, v_count
  FROM reviews WHERE target_id = v_order.provider_id AND target_type = 'provider';

  UPDATE provider_profiles SET
    sum_ratings = v_sum,
    rating_count = v_count,
    avg_rating = ROUND(((10 * 4.0 + v_sum) / (10 + v_count))::NUMERIC, 2),
    updated_at = now()
  WHERE id = v_order.provider_id;

  RETURN v_review_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Open dispute
CREATE OR REPLACE FUNCTION open_dispute(
  p_order_id UUID,
  p_reason TEXT,
  p_evidence TEXT[] DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_order RECORD;
  v_dispute_id UUID;
BEGIN
  SELECT * INTO v_order FROM orders WHERE id = p_order_id AND customer_id = auth.uid()
    AND status IN ('completed', 'closed');
  IF v_order IS NULL THEN RAISE EXCEPTION 'Order not found'; END IF;

  INSERT INTO disputes (order_id, customer_id, provider_id, reason, evidence)
  VALUES (p_order_id, auth.uid(), v_order.provider_id, p_reason, p_evidence)
  RETURNING id INTO v_dispute_id;

  UPDATE orders SET status = 'disputed', updated_at = now() WHERE id = p_order_id;

  RETURN v_dispute_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin: ban/unban user
CREATE OR REPLACE FUNCTION admin_ban_user(p_user_id UUID, p_ban BOOLEAN, p_reason TEXT DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
  IF NOT is_admin(auth.uid()) THEN RAISE EXCEPTION 'Unauthorized'; END IF;

  UPDATE profiles SET is_banned = p_ban, ban_reason = p_reason, updated_at = now()
  WHERE id = p_user_id;

  INSERT INTO audit_logs (action, actor_id, payload)
  VALUES (CASE WHEN p_ban THEN 'user_banned' ELSE 'user_unbanned' END,
    auth.uid()::text, jsonb_build_object('user_id', p_user_id, 'reason', p_reason));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin: approve/reject KYC
CREATE OR REPLACE FUNCTION admin_kyc_decision(p_uid UUID, p_approved BOOLEAN, p_reason TEXT DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
  IF NOT is_admin(auth.uid()) THEN RAISE EXCEPTION 'Unauthorized'; END IF;

  UPDATE profiles SET
    kyc_status = CASE WHEN p_approved THEN 'approved'::kyc_status ELSE 'rejected'::kyc_status END,
    kyc_rejection_reason = CASE WHEN p_approved THEN NULL ELSE p_reason END,
    updated_at = now()
  WHERE id = p_uid;

  IF p_approved THEN
    UPDATE provider_profiles SET is_verified = true, updated_at = now() WHERE id = p_uid;
  END IF;

  INSERT INTO audit_logs (action, actor_id, payload)
  VALUES ('kyc_decision', auth.uid()::text,
    jsonb_build_object('uid', p_uid, 'approved', p_approved, 'reason', p_reason));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin: resolve dispute
CREATE OR REPLACE FUNCTION resolve_dispute(
  p_dispute_id UUID,
  p_resolution dispute_resolution,
  p_admin_note TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  v_dispute RECORD;
BEGIN
  IF NOT is_admin(auth.uid()) THEN RAISE EXCEPTION 'Unauthorized'; END IF;

  SELECT * INTO v_dispute FROM disputes WHERE id = p_dispute_id AND status != 'resolved';
  IF v_dispute IS NULL THEN RAISE EXCEPTION 'Dispute not found'; END IF;

  UPDATE disputes SET
    status = 'resolved',
    resolution = p_resolution,
    admin_note = p_admin_note,
    resolved_at = now()
  WHERE id = p_dispute_id;

  UPDATE orders SET status = 'closed', updated_at = now() WHERE id = v_dispute.order_id;

  INSERT INTO audit_logs (action, actor_id, payload)
  VALUES ('dispute_resolved', auth.uid()::text,
    jsonb_build_object('dispute_id', p_dispute_id, 'resolution', p_resolution));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Expire old quotes (called by cron/edge function)
CREATE OR REPLACE FUNCTION expire_old_quotes()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
  v_order RECORD;
BEGIN
  UPDATE quotes SET status = 'expired', updated_at = now()
  WHERE status = 'pending' AND expires_at < now();
  GET DIAGNOSTICS v_count = ROW_COUNT;

  FOR v_order IN
    SELECT DISTINCT o.id FROM orders o
    WHERE o.status = 'quoted'
    AND NOT EXISTS (
      SELECT 1 FROM quotes q WHERE q.order_id = o.id AND q.status = 'pending'
    )
  LOOP
    UPDATE orders SET status = 'pending', updated_at = now() WHERE id = v_order.id;
    INSERT INTO audit_logs (action, actor_id, payload)
    VALUES ('order_reset', 'system', jsonb_build_object('order_id', v_order.id, 'reason', 'all_quotes_expired'));
  END LOOP;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, display_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'customer')
  );

  IF COALESCE((NEW.raw_user_meta_data->>'role')::text, 'customer') = 'provider' THEN
    INSERT INTO provider_profiles (id) VALUES (NEW.id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON provider_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON quotes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- SEED DATA: Categories
-- ============================================

INSERT INTO categories (name_en, name_ar, name_no, name_sv, icon, sort_order) VALUES
  ('Plumbing', 'سباكة', 'Rørlegger', 'VVS', '🔧', 1),
  ('Electrical', 'كهرباء', 'Elektriker', 'Elektriker', '⚡', 2),
  ('Painting', 'دهان', 'Maling', 'Målning', '🎨', 3),
  ('Cleaning', 'تنظيف', 'Rengjøring', 'Städning', '🧹', 4),
  ('AC & HVAC', 'تكييف', 'Ventilasjon', 'Ventilation', '❄️', 5),
  ('Carpentry', 'نجارة', 'Snekker', 'Snickare', '🪚', 6),
  ('Moving', 'نقل', 'Flytting', 'Flytt', '📦', 7),
  ('Gardening', 'حدائق', 'Hage', 'Trädgård', '🌱', 8),
  ('Appliance Repair', 'إصلاح أجهزة', 'Reparasjon', 'Reparation', '🔌', 9),
  ('General Maintenance', 'صيانة عامة', 'Vedlikehold', 'Underhåll', '🏠', 10);

-- Seed feature flags
INSERT INTO feature_flags (key, enabled) VALUES
  ('subscriptions_enabled', false),
  ('boost_enabled', false),
  ('disputes_enabled', true),
  ('cash_payment_enabled', false),
  ('agency_model_enabled', false),
  ('norway_market_enabled', false),
  ('sweden_market_enabled', false);
