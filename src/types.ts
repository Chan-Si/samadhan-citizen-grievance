export type Language = 'en' | 'hi' | 'as' | 'bn' | 'ta';

export interface UserProfile {
  name: string;
  mobile: string;
  email?: string;
  state?: string;
  district: string;
  preferredLanguage: Language;
  onboardingCompleted: boolean;
  residence?: string;
  landmark?: string;
  pincode?: string;
}

export type ComplaintStatus = 'Resolved' | 'In Progress' | 'Needs Attention';

export type CitizenVerificationStatus = 'None' | 'VerifiedFixed' | 'PartiallyFixed' | 'NotFixed';

export interface LocationData {
  type: 'current' | 'search' | 'map' | 'manual';
  address: string;
  district: string;
  coordinates?: { lat: number; lng: number };
}

export interface TimelineEvent {
  title: string;
  description: string;
  date: string;
  status: 'completed' | 'current' | 'upcoming';
}

export interface Complaint {
  id: string;
  userId?: string;
  category: string;
  subcategory: string;
  description: string;
  location: LocationData;
  dateSubmitted: string;
  dateObserved: string;
  severity: 'Minor' | 'Moderate' | 'Serious / Safety risk';
  evidence: string[]; // Mock file names/dataUrls
  responsibleDepartment: string;
  status: ComplaintStatus;
  timeline: TimelineEvent[];
  authorityUpdate?: string;
  expectedResolutionDate?: string;
  citizenVerification: CitizenVerificationStatus;
  citizenFeedback?: {
    comment: string;
    photo?: string;
  };
  affectedCitizenCount: number;
  joinedByMe?: boolean;
  consumerNumber?: string; // Electricity specific
  serviceType?: string;    // Gov Service / Pension specific
  documentType?: string;   // Certificate / Education specific
  referenceNumber?: string;// Reference number for gov services
  institutionName?: string;// Education specific
  misconductType?: string; // Misconduct specific
  officeInvolved?: string; // Misconduct specific
  priorGrievanceId?: string;
  priorGrievanceDate?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  complaintId: string;
  read: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  quickActionRedirect?: string; // Redirection command
}
