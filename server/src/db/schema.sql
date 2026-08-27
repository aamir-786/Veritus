-- Veritus Executive Risk Platform - Complete Supabase PostgreSQL Schema
-- Run this script in your Supabase SQL Editor to initialize or update the platform database.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. PROFILES TABLE (Extends Supabase auth.users)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can manage all profiles." ON public.profiles;
CREATE POLICY "Admins can manage all profiles." ON public.profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Trigger function to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'role', 'student')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- ============================================================================
-- 2. QUESTIONS TABLE (100 Risk Taxonomy Matrix)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.questions (
  id TEXT PRIMARY KEY,
  question_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  domain TEXT NOT NULL,
  effort TEXT,
  duration TEXT,
  cost TEXT,
  payback TEXT,
  tier TEXT,
  regulator_pressure TEXT CHECK (regulator_pressure IN ('High', 'Moderate', 'Medium', 'Low')),
  leadership_traits TEXT,
  summary TEXT,
  guidance_text TEXT
);

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Questions are viewable by everyone." ON public.questions;
CREATE POLICY "Questions are viewable by everyone." ON public.questions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage questions." ON public.questions;
CREATE POLICY "Admins can manage questions." ON public.questions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);


-- ============================================================================
-- 3. COURSES TABLE (Executive Masterclasses)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.courses (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  headline TEXT,
  description TEXT,
  tier TEXT,
  price NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  author_name TEXT,
  cover_image TEXT,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Courses are viewable by everyone." ON public.courses;
CREATE POLICY "Courses are viewable by everyone." ON public.courses FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage courses." ON public.courses;
CREATE POLICY "Admins can manage courses." ON public.courses FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);


-- ============================================================================
-- 4. MODULES TABLE (Course Modules)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.modules (
  id TEXT PRIMARY KEY,
  course_id TEXT REFERENCES public.courses ON DELETE CASCADE,
  title TEXT NOT NULL,
  order_index INTEGER DEFAULT 0
);

ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Modules are viewable by everyone." ON public.modules;
CREATE POLICY "Modules are viewable by everyone." ON public.modules FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage modules." ON public.modules;
CREATE POLICY "Admins can manage modules." ON public.modules FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);


-- ============================================================================
-- 5. LESSONS TABLE (Course Lessons & Media)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.lessons (
  id TEXT PRIMARY KEY,
  module_id TEXT REFERENCES public.modules ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT DEFAULT 'video',
  duration_minutes INTEGER DEFAULT 10,
  video_url TEXT,
  audio_url TEXT,
  captions_vtt TEXT,
  content TEXT,
  content_blocks JSONB,
  resource_url TEXT,
  is_free_preview BOOLEAN DEFAULT false,
  is_final_assessment BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0
);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lessons are viewable by everyone." ON public.lessons;
CREATE POLICY "Lessons are viewable by everyone." ON public.lessons FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage lessons." ON public.lessons;
CREATE POLICY "Admins can manage lessons." ON public.lessons FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);


-- ============================================================================
-- 6. TEMPLATES TABLE (Digital Frameworks & Document Hub)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.templates (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  price NUMERIC DEFAULT 0,
  is_free BOOLEAN DEFAULT false,
  downloads_count INTEGER DEFAULT 0,
  file_path TEXT
);

ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Templates are viewable by everyone." ON public.templates;
CREATE POLICY "Templates are viewable by everyone." ON public.templates FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage templates." ON public.templates;
CREATE POLICY "Admins can manage templates." ON public.templates FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);


-- ============================================================================
-- 7. ORDERS TABLE (Purchase Receipts)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  user_email TEXT,
  product_id TEXT,
  product_title TEXT,
  amount NUMERIC,
  original_amount NUMERIC,
  discount_amount NUMERIC DEFAULT 0,
  coupon_code TEXT,
  refund_reason TEXT,
  refund_requested_at TIMESTAMP WITH TIME ZONE,
  admin_reply TEXT,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'refunded', 'cancelled', 'refund_requested')),
  stripe_payment_intent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  paid_at TIMESTAMP WITH TIME ZONE
);

-- Migration for existing orders tables
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS original_amount NUMERIC;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS refund_reason TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS refund_requested_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS admin_reply TEXT;

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own orders." ON public.orders;
CREATE POLICY "Users can view their own orders." ON public.orders FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all orders." ON public.orders;
CREATE POLICY "Admins can manage all orders." ON public.orders FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);


-- ============================================================================
-- PROMOTIONS TABLE (Discount Coupons & Promo Banners)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.promotions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  promo_code TEXT UNIQUE NOT NULL,
  discount_percentage NUMERIC DEFAULT 0,
  banner_message TEXT,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  max_redemptions INTEGER,
  times_redeemed INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Promotions are viewable by everyone." ON public.promotions;
CREATE POLICY "Promotions are viewable by everyone." ON public.promotions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage promotions." ON public.promotions;
CREATE POLICY "Admins can manage promotions." ON public.promotions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);


-- ============================================================================
-- 8. ENTITLEMENTS TABLE (Purchased / Granted Access)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.entitlements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  access_granted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, product_id)
);

ALTER TABLE public.entitlements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own entitlements." ON public.entitlements;
CREATE POLICY "Users can view their own entitlements." ON public.entitlements FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all entitlements." ON public.entitlements;
CREATE POLICY "Admins can manage all entitlements." ON public.entitlements FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);


-- ============================================================================
-- 9. PROGRESS TABLE (Student Completion Tracker)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  course_id TEXT,
  lesson_id TEXT,
  completed BOOLEAN DEFAULT false,
  last_position_seconds INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, lesson_id)
);

ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own progress." ON public.progress;
CREATE POLICY "Users can view their own progress." ON public.progress FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own progress." ON public.progress;
CREATE POLICY "Users can insert their own progress." ON public.progress FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own progress." ON public.progress;
CREATE POLICY "Users can update their own progress." ON public.progress FOR UPDATE USING (auth.uid() = user_id);


-- ============================================================================
-- 10. INQUIRIES TABLE (Contact Form Messages)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'replied', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit inquiries." ON public.inquiries;
CREATE POLICY "Anyone can submit inquiries." ON public.inquiries FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Inquiries are viewable by admins only." ON public.inquiries;
CREATE POLICY "Inquiries are viewable by admins only." ON public.inquiries FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);


-- ============================================================================
-- 11. REVIEWS TABLE (Testimonials & Single-Review Enforcement)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_type TEXT CHECK (product_type IN ('course', 'masterclass', 'question', 'template')),
  product_id TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, product_type, product_id)
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Reviews are viewable by everyone." ON public.reviews;
CREATE POLICY "Reviews are viewable by everyone." ON public.reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own reviews." ON public.reviews;
CREATE POLICY "Users can insert their own reviews." ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all reviews." ON public.reviews;
CREATE POLICY "Admins can manage all reviews." ON public.reviews FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);


-- ============================================================================
-- 12. PROMOTIONS TABLE (Discount Coupons & Site-Wide Banners)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.promotions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  promo_code TEXT UNIQUE,
  discount_percentage INTEGER DEFAULT 20,
  banner_message TEXT NOT NULL,
  show_banner BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  max_redemptions INTEGER,
  times_redeemed INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Promotions are viewable by everyone." ON public.promotions;
CREATE POLICY "Promotions are viewable by everyone." ON public.promotions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Promotions are manageable by admins only." ON public.promotions;
CREATE POLICY "Promotions are manageable by admins only." ON public.promotions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);


-- ============================================================================
-- 13. ASSESSMENT QUESTIONS TABLE (Interactive Quiz Questions)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.assessment_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id TEXT REFERENCES public.lessons ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_option_index INTEGER NOT NULL
);

ALTER TABLE public.assessment_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Assessment questions viewable by everyone." ON public.assessment_questions;
CREATE POLICY "Assessment questions viewable by everyone." ON public.assessment_questions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage assessment questions." ON public.assessment_questions;
CREATE POLICY "Admins can manage assessment questions." ON public.assessment_questions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);


-- ============================================================================
-- 14. ASSESSMENT SUBMISSIONS TABLE (Student Quiz Attempts)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.assessment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  lesson_id TEXT REFERENCES public.lessons ON DELETE CASCADE,
  score INTEGER,
  passed BOOLEAN,
  agreed BOOLEAN DEFAULT false,
  attempts INTEGER DEFAULT 0,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, lesson_id)
);

ALTER TABLE public.assessment_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own submissions." ON public.assessment_submissions;
CREATE POLICY "Users can view own submissions." ON public.assessment_submissions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own submissions." ON public.assessment_submissions;
CREATE POLICY "Users can insert own submissions." ON public.assessment_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);


-- ============================================================================
-- 15. CERTIFICATES TABLE (Verified & Permanent Recipient Locking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  course_id TEXT,
  course_slug TEXT,
  course_title TEXT,
  student_name TEXT NOT NULL,
  cert_number INTEGER NOT NULL,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, course_id)
);

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Certificates are viewable by everyone." ON public.certificates;
CREATE POLICY "Certificates are viewable by everyone." ON public.certificates FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own certificate." ON public.certificates;
CREATE POLICY "Users can insert own certificate." ON public.certificates FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all certificates." ON public.certificates;
CREATE POLICY "Admins can manage all certificates." ON public.certificates FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') 
  OR auth.uid() = user_id
);


-- ============================================================================
-- 16. PERFORMANCE INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_progress_user_course ON public.progress(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_certificates_user_course ON public.certificates(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON public.reviews(product_type, product_id);
CREATE INDEX IF NOT EXISTS idx_entitlements_user_product ON public.entitlements(user_id, product_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_lessons_module ON public.lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_modules_course ON public.modules(course_id);
