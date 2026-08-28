export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserLanguage = 'en' | 'hi' | 'as' | 'bn' | 'ta';
export type ComplaintStatus = 'Resolved' | 'In Progress' | 'Needs Attention';
export type CitizenVerificationStatus = 'None' | 'VerifiedFixed' | 'PartiallyFixed' | 'NotFixed';
export type ComplaintSeverity = 'Minor' | 'Moderate' | 'Serious / Safety risk';
export type LocationSource = 'current' | 'search' | 'map' | 'manual';
export type TimelineStatus = 'completed' | 'current' | 'upcoming';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          mobile: string;
          email: string | null;
          state: string;
          district: string;
          residence: string | null;
          landmark: string | null;
          pincode: string | null;
          preferred_language: UserLanguage;
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          mobile: string;
          email?: string | null;
          state?: string;
          district?: string;
          residence?: string | null;
          landmark?: string | null;
          pincode?: string | null;
          preferred_language?: UserLanguage;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          mobile?: string;
          email?: string | null;
          state?: string;
          district?: string;
          residence?: string | null;
          landmark?: string | null;
          pincode?: string | null;
          preferred_language?: UserLanguage;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      complaints: {
        Row: {
          id: string;
          user_id: string | null;
          category: string;
          subcategory: string;
          description: string;
          location_type: LocationSource;
          address: string;
          district: string;
          state: string;
          latitude: number | null;
          longitude: number | null;
          date_observed: string;
          date_submitted: string;
          severity: ComplaintSeverity;
          responsible_department: string;
          status: ComplaintStatus;
          authority_update: string | null;
          expected_resolution_date: string | null;
          citizen_verification: CitizenVerificationStatus;
          citizen_feedback: Json | null;
          affected_citizen_count: number;
          consumer_number: string | null;
          service_type: string | null;
          document_type: string | null;
          reference_number: string | null;
          institution_name: string | null;
          misconduct_type: string | null;
          office_involved: string | null;
          prior_grievance_id: string | null;
          prior_grievance_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          category: string;
          subcategory: string;
          description: string;
          location_type?: LocationSource;
          address: string;
          district: string;
          state: string;
          latitude?: number | null;
          longitude?: number | null;
          date_observed?: string;
          date_submitted?: string;
          severity?: ComplaintSeverity;
          responsible_department: string;
          status?: ComplaintStatus;
          authority_update?: string | null;
          expected_resolution_date?: string | null;
          citizen_verification?: CitizenVerificationStatus;
          citizen_feedback?: Json | null;
          affected_citizen_count?: number;
          consumer_number?: string | null;
          service_type?: string | null;
          document_type?: string | null;
          reference_number?: string | null;
          institution_name?: string | null;
          misconduct_type?: string | null;
          office_involved?: string | null;
          prior_grievance_id?: string | null;
          prior_grievance_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          category?: string;
          subcategory?: string;
          description?: string;
          location_type?: LocationSource;
          address?: string;
          district?: string;
          state?: string;
          latitude?: number | null;
          longitude?: number | null;
          date_observed?: string;
          date_submitted?: string;
          severity?: ComplaintSeverity;
          responsible_department?: string;
          status?: ComplaintStatus;
          authority_update?: string | null;
          expected_resolution_date?: string | null;
          citizen_verification?: CitizenVerificationStatus;
          citizen_feedback?: Json | null;
          affected_citizen_count?: number;
          consumer_number?: string | null;
          service_type?: string | null;
          document_type?: string | null;
          reference_number?: string | null;
          institution_name?: string | null;
          misconduct_type?: string | null;
          office_involved?: string | null;
          prior_grievance_id?: string | null;
          prior_grievance_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      complaint_evidence: {
        Row: {
          id: string;
          complaint_id: string;
          user_id: string | null;
          file_url: string;
          storage_path: string;
          file_type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          complaint_id: string;
          user_id?: string | null;
          file_url: string;
          storage_path: string;
          file_type?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          complaint_id?: string;
          user_id?: string | null;
          file_url?: string;
          storage_path?: string;
          file_type?: string;
          created_at?: string;
        };
      };
      complaint_timeline_events: {
        Row: {
          id: string;
          complaint_id: string;
          title: string;
          description: string;
          event_date: string;
          status: TimelineStatus;
          sequence_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          complaint_id: string;
          title: string;
          description: string;
          event_date?: string;
          status?: TimelineStatus;
          sequence_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          complaint_id?: string;
          title?: string;
          description?: string;
          event_date?: string;
          status?: TimelineStatus;
          sequence_order?: number;
          created_at?: string;
        };
      };
      complaint_supporters: {
        Row: {
          id: string;
          complaint_id: string;
          user_id: string;
          note: string | null;
          address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          complaint_id: string;
          user_id: string;
          note?: string | null;
          address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          complaint_id?: string;
          user_id?: string;
          note?: string | null;
          address?: string | null;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          complaint_id: string | null;
          title: string;
          message: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          complaint_id?: string | null;
          title: string;
          message: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          complaint_id?: string | null;
          title?: string;
          message?: string;
          is_read?: boolean;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      join_complaint: {
        Args: {
          p_complaint_id: string;
          p_note?: string;
          p_address?: string;
        };
        Returns: void;
      };
    };
    Enums: {
      user_language: UserLanguage;
      complaint_status: ComplaintStatus;
      citizen_verification: CitizenVerificationStatus;
      complaint_severity: ComplaintSeverity;
      location_source: LocationSource;
      timeline_status: TimelineStatus;
    };
  };
}
