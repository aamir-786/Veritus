-- Veritus / Deciding in the Dark - Supabase PostgreSQL Schema

-- 1. Profiles Table (Extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'student',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Function to automatically create a profile when a new user signs up in Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 2. Questions Table
CREATE TABLE public.questions (
  id TEXT PRIMARY KEY,
  question_number INTEGER,
  title TEXT NOT NULL,
  domain TEXT,
  effort TEXT,
  duration TEXT,
  cost TEXT,
  payback TEXT,
  tier TEXT,
  regulator_pressure TEXT,
  leadership_traits TEXT,
  summary TEXT,
  guidance_text TEXT
);

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Questions are viewable by everyone." ON public.questions FOR SELECT USING (true);


-- 3. Courses Table
CREATE TABLE public.courses (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  headline TEXT,
  description TEXT,
  tier TEXT,
  price NUMERIC,
  currency TEXT DEFAULT 'USD',
  author_name TEXT,
  cover_image TEXT,
  published BOOLEAN DEFAULT false
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Courses are viewable by everyone." ON public.courses FOR SELECT USING (true);


-- 4. Modules Table
CREATE TABLE public.modules (
  id TEXT PRIMARY KEY,
  course_id TEXT REFERENCES public.courses ON DELETE CASCADE,
  title TEXT NOT NULL,
  order_index INTEGER
);

ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Modules are viewable by everyone." ON public.modules FOR SELECT USING (true);


-- 5. Lessons Table
CREATE TABLE public.lessons (
  id TEXT PRIMARY KEY,
  module_id TEXT REFERENCES public.modules ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT,
  duration_minutes INTEGER,
  video_url TEXT,
  captions_vtt TEXT,
  content TEXT,
  resource_url TEXT,
  is_free_preview BOOLEAN DEFAULT false
);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lessons are viewable by everyone." ON public.lessons FOR SELECT USING (true);


-- 6. Templates Table
CREATE TABLE public.templates (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  price NUMERIC,
  is_free BOOLEAN DEFAULT false,
  downloads_count INTEGER DEFAULT 0,
  file_path TEXT
);

ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Templates are viewable by everyone." ON public.templates FOR SELECT USING (true);


-- 7. Orders Table
CREATE TABLE public.orders (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  user_email TEXT,
  product_id TEXT,
  product_title TEXT,
  amount NUMERIC,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  paid_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own orders." ON public.orders FOR SELECT USING (auth.uid() = user_id);


-- 8. Entitlements Table
CREATE TABLE public.entitlements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  access_granted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, product_id)
);

ALTER TABLE public.entitlements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own entitlements." ON public.entitlements FOR SELECT USING (auth.uid() = user_id);


-- 9. Progress Table
CREATE TABLE public.progress (
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
CREATE POLICY "Users can view their own progress." ON public.progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own progress." ON public.progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own progress." ON public.progress FOR UPDATE USING (auth.uid() = user_id);

-- 10. Inquiries Table
CREATE TABLE public.inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Inquiries are viewable by admins only." ON public.inquiries FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 11. Reviews Table
CREATE TABLE public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_type TEXT CHECK (product_type IN ('course', 'question', 'template')),
  product_id TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews are viewable by everyone." ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can insert their own reviews." ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Note: Admin policy needed for updates/deletes
CREATE POLICY "Admins can manage all reviews." ON public.reviews FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 12. Promotions Table
CREATE TABLE public.promotions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Promotions are viewable by everyone." ON public.promotions FOR SELECT USING (true);
CREATE POLICY "Promotions are manageable by admins only." ON public.promotions FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 13. Add new columns to lessons table (For reference; apply via ALTER TABLE manually if needed)
-- ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS audio_url TEXT;
-- ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS is_final_assessment BOOLEAN DEFAULT false;

-- 14. Assessment Questions Table
CREATE TABLE public.assessment_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id TEXT REFERENCES public.lessons ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_option_index INTEGER NOT NULL
);

ALTER TABLE public.assessment_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Questions viewable by everyone." ON public.assessment_questions FOR SELECT USING (true);
CREATE POLICY "Admins can manage questions." ON public.assessment_questions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 15. Assessment Submissions Table
CREATE TABLE public.assessment_submissions (
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
CREATE POLICY "Users can view own submissions." ON public.assessment_submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own submissions." ON public.assessment_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 16. Certificates Table
CREATE TABLE public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  course_id TEXT REFERENCES public.courses ON DELETE CASCADE,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, course_id)
);

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own certificates." ON public.certificates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can insert certificates." ON public.certificates FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') 
  OR auth.uid() = user_id
);
