import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import type { UserProfile, Language } from '../types';

export const authService = {
  async getSession() {
    if (!isSupabaseConfigured()) {
      const localUser = localStorage.getItem('samadhan_user');
      return localUser ? JSON.parse(localUser) : null;
    }
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) return null;
    return session;
  },

  async getUserProfile(userId?: string): Promise<UserProfile | null> {
    if (!isSupabaseConfigured()) {
      const local = localStorage.getItem('samadhan_user');
      return local ? JSON.parse(local) : null;
    }

    const uid = userId || (await supabase.auth.getUser()).data.user?.id;
    if (!uid) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', uid)
      .single();

    if (error || !data) return null;

    return {
      name: data.name,
      mobile: data.mobile,
      email: data.email || undefined,
      state: data.state,
      district: data.district,
      preferredLanguage: data.preferred_language as Language,
      onboardingCompleted: data.onboarding_completed,
      residence: data.residence || undefined,
      landmark: data.landmark || undefined,
      pincode: data.pincode || undefined
    };
  },

  async signInWithPassword(mobileOrEmail: string, password: string): Promise<{ user: UserProfile | null; error?: string }> {
    if (!isSupabaseConfigured()) {
      // Local development fallback: Authenticate without storing passwords in localStorage
      const localUser = localStorage.getItem('samadhan_user');
      if (localUser) {
        const parsed = JSON.parse(localUser);
        if (parsed.mobile === mobileOrEmail || parsed.email === mobileOrEmail) {
          return { user: parsed };
        }
      }
      
      // Default demo profile for offline dev
      const defaultUser: UserProfile = {
        name: 'Riya',
        mobile: mobileOrEmail.replace(/\D/g, '') || '9876543210',
        email: mobileOrEmail.includes('@') ? mobileOrEmail : 'riya@example.com',
        state: 'Karnataka',
        district: 'Bangalore Urban',
        preferredLanguage: 'en',
        onboardingCompleted: true,
        residence: 'House 42, 5th Cross, Indiranagar',
        landmark: 'Near State Bank',
        pincode: '560038'
      };
      localStorage.setItem('samadhan_user', JSON.stringify(defaultUser));
      return { user: defaultUser };
    }

    // Production Supabase Auth: Map phone to email alias if no email provided
    const emailToUse = mobileOrEmail.includes('@') ? mobileOrEmail : `${mobileOrEmail.replace(/\D/g, '')}@samadhan.citizen.gov`;
    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailToUse,
      password
    });

    if (error) {
      return { user: null, error: error.message };
    }

    const profile = await this.getUserProfile(data.user.id);
    return { user: profile };
  },

  async signUp(profileData: UserProfile, password: string): Promise<{ user: UserProfile | null; error?: string }> {
    if (!isSupabaseConfigured()) {
      // Save profile only (NEVER save password to localStorage)
      localStorage.setItem('samadhan_user', JSON.stringify(profileData));
      return { user: profileData };
    }

    const cleanMobile = profileData.mobile.replace(/\D/g, '');
    const emailToUse = profileData.email || `${cleanMobile}@samadhan.citizen.gov`;

    const { data, error } = await supabase.auth.signUp({
      email: emailToUse,
      password,
      options: {
        data: {
          name: profileData.name,
          mobile: cleanMobile,
          state: profileData.state || 'Karnataka',
          district: profileData.district || 'Bangalore Urban',
          preferredLanguage: profileData.preferredLanguage,
          onboardingCompleted: profileData.onboardingCompleted
        }
      }
    });

    if (error) {
      return { user: null, error: error.message };
    }

    if (data.user) {
      // Upsert profile in public.profiles table
      await supabase.from('profiles').upsert({
        id: data.user.id,
        name: profileData.name,
        mobile: cleanMobile,
        email: profileData.email || null,
        state: profileData.state || 'Karnataka',
        district: profileData.district || 'Bangalore Urban',
        residence: profileData.residence || null,
        landmark: profileData.landmark || null,
        pincode: profileData.pincode || null,
        preferred_language: profileData.preferredLanguage,
        onboarding_completed: profileData.onboardingCompleted
      });
    }

    return { user: profileData };
  },

  async signInDemoUser(language: Language = 'en'): Promise<UserProfile> {
    const demoProfile: UserProfile = {
      name: 'Riya',
      mobile: '9876543210',
      email: 'demo@samadhan.citizen.gov',
      state: 'Karnataka',
      district: 'Bangalore Urban',
      preferredLanguage: language,
      onboardingCompleted: false, // Trigger onboarding for demo user
      residence: 'House 42, 5th Cross, Indiranagar',
      landmark: 'Near State Bank',
      pincode: '560038'
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: 'demo@samadhan.citizen.gov',
          password: 'DemoCitizen@2026'
        });
        if (!error && data.user) {
          const profile = await this.getUserProfile(data.user.id);
          if (profile) return { ...profile, onboardingCompleted: false };
        }
      } catch (err) {
        console.warn('Demo login via Supabase failed, falling back to demo session:', err);
      }
    }

    localStorage.setItem('samadhan_user', JSON.stringify(demoProfile));
    return demoProfile;
  },

  async updateProfile(updates: Partial<UserProfile>): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      const local = localStorage.getItem('samadhan_user');
      if (local) {
        const updated = { ...JSON.parse(local), ...updates };
        localStorage.setItem('samadhan_user', JSON.stringify(updated));
      }
      return true;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase.from('profiles').update({
      name: updates.name,
      email: updates.email,
      state: updates.state,
      district: updates.district,
      preferred_language: updates.preferredLanguage,
      onboarding_completed: updates.onboardingCompleted,
      residence: updates.residence,
      landmark: updates.landmark,
      pincode: updates.pincode,
      updated_at: new Date().toISOString()
    }).eq('id', user.id);

    return !error;
  },

  async signOut(): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.error('Supabase signOut error:', e);
      }
    }
    localStorage.removeItem('samadhan_user');
  },

  onAuthStateChange(callback: (user: UserProfile | null) => void) {
    if (!isSupabaseConfigured()) return () => {};

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await this.getUserProfile(session.user.id);
        callback(profile);
      } else {
        callback(null);
      }
    });

    return () => subscription.unsubscribe();
  }
};
