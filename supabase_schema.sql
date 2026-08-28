-- ==============================================================================
-- SAMADHAN Citizen Grievance Portal - Production Supabase PostgreSQL Schema
-- ==============================================================================

-- 1. Custom ENUM Types
CREATE TYPE user_language AS ENUM ('en', 'hi', 'as', 'bn', 'ta');
CREATE TYPE complaint_status AS ENUM ('Resolved', 'In Progress', 'Needs Attention');
CREATE TYPE citizen_verification AS ENUM ('None', 'VerifiedFixed', 'PartiallyFixed', 'NotFixed');
CREATE TYPE complaint_severity AS ENUM ('Minor', 'Moderate', 'Serious / Safety risk');
CREATE TYPE location_source AS ENUM ('current', 'search', 'map', 'manual');
CREATE TYPE timeline_status AS ENUM ('completed', 'current', 'upcoming');

-- 2. Profiles Table (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    mobile TEXT UNIQUE NOT NULL,
    email TEXT,
    state TEXT NOT NULL DEFAULT 'Karnataka',
    district TEXT NOT NULL DEFAULT 'Bangalore Urban',
    residence TEXT,
    landmark TEXT,
    pincode TEXT,
    preferred_language user_language NOT NULL DEFAULT 'en',
    onboarding_completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Complaints Table
CREATE TABLE IF NOT EXISTS public.complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    category TEXT NOT NULL,
    subcategory TEXT NOT NULL,
    description TEXT NOT NULL,
    location_type location_source NOT NULL DEFAULT 'current',
    address TEXT NOT NULL,
    district TEXT NOT NULL,
    state TEXT NOT NULL,
    latitude NUMERIC(10, 6),
    longitude NUMERIC(10, 6),
    date_observed DATE NOT NULL DEFAULT CURRENT_DATE,
    date_submitted TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    severity complaint_severity NOT NULL DEFAULT 'Moderate',
    responsible_department TEXT NOT NULL,
    status complaint_status NOT NULL DEFAULT 'In Progress',
    authority_update TEXT,
    expected_resolution_date DATE,
    citizen_verification citizen_verification NOT NULL DEFAULT 'None',
    citizen_feedback JSONB,
    affected_citizen_count INTEGER NOT NULL DEFAULT 1,
    
    -- Dynamic Category Specific Fields
    consumer_number TEXT,
    service_type TEXT,
    document_type TEXT,
    reference_number TEXT,
    institution_name TEXT,
    misconduct_type TEXT,
    office_involved TEXT,
    prior_grievance_id TEXT,
    prior_grievance_date DATE,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_complaints_district ON public.complaints(district);
CREATE INDEX IF NOT EXISTS idx_complaints_user ON public.complaints(user_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints(status);

-- 4. Evidence Attachments Table
CREATE TABLE IF NOT EXISTS public.complaint_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    file_url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    file_type TEXT NOT NULL DEFAULT 'photo',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_evidence_complaint ON public.complaint_evidence(complaint_id);

-- 5. Status Milestone Timeline Table
CREATE TABLE IF NOT EXISTS public.complaint_timeline_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    event_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status timeline_status NOT NULL DEFAULT 'upcoming',
    sequence_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_timeline_complaint ON public.complaint_timeline_events(complaint_id);

-- 6. "I'm Facing This Too" Community Supporters Table
CREATE TABLE IF NOT EXISTS public.complaint_supporters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    note TEXT,
    address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_complaint_join UNIQUE(complaint_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_supporters_complaint ON public.complaint_supporters(complaint_id);
CREATE INDEX IF NOT EXISTS idx_supporters_user ON public.complaint_supporters(user_id);

-- 7. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read);

-- 8. Auto-Profile Creation Trigger (PostgreSQL)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        name,
        mobile,
        email,
        state,
        district,
        preferred_language,
        onboarding_completed
    ) VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', 'Citizen'),
        COALESCE(NEW.phone, NEW.raw_user_meta_data->>'mobile', ''),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'state', 'Karnataka'),
        COALESCE(NEW.raw_user_meta_data->>'district', 'Bangalore Urban'),
        COALESCE((NEW.raw_user_meta_data->>'preferredLanguage')::user_language, 'en'),
        COALESCE((NEW.raw_user_meta_data->>'onboardingCompleted')::boolean, false)
    ) ON CONFLICT (id) DO UPDATE SET
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 9. Atomic Join Function
CREATE OR REPLACE FUNCTION public.join_complaint(
    p_complaint_id UUID,
    p_note TEXT DEFAULT NULL,
    p_address TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.complaint_supporters (complaint_id, user_id, note, address)
    VALUES (p_complaint_id, auth.uid(), p_note, p_address)
    ON CONFLICT (complaint_id, user_id) DO NOTHING;

    UPDATE public.complaints
    SET affected_citizen_count = (
        SELECT COUNT(*) FROM public.complaint_supporters WHERE complaint_id = p_complaint_id
    ) + 1,
    updated_at = NOW()
    WHERE id = p_complaint_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_supporters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Read complaints in district or own" ON public.complaints FOR SELECT USING (true);
CREATE POLICY "Authenticated users can submit complaints" ON public.complaints FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Author can update complaint" ON public.complaints FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Read evidence" ON public.complaint_evidence FOR SELECT USING (true);
CREATE POLICY "Insert evidence" ON public.complaint_evidence FOR INSERT WITH CHECK (true);

CREATE POLICY "Read timeline events" ON public.complaint_timeline_events FOR SELECT USING (true);
CREATE POLICY "Insert timeline events" ON public.complaint_timeline_events FOR INSERT WITH CHECK (true);

CREATE POLICY "Read supporters" ON public.complaint_supporters FOR SELECT USING (true);
CREATE POLICY "Insert supporters" ON public.complaint_supporters FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id);
