import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import type { Complaint, CitizenVerificationStatus } from '../types';
import { INITIAL_COMPLAINTS } from '../mockData';

export const complaintService = {
  async fetchComplaints(district?: string): Promise<Complaint[]> {
    if (!isSupabaseConfigured()) {
      const saved = localStorage.getItem('samadhan_complaints');
      return saved ? JSON.parse(saved) : INITIAL_COMPLAINTS;
    }

    let query = supabase
      .from('complaints')
      .select(`
        *,
        evidence:complaint_evidence(file_url),
        timeline:complaint_timeline_events(*),
        supporters:complaint_supporters(user_id)
      `)
      .order('created_at', { ascending: false });

    if (district) {
      query = query.eq('district', district);
    }

    const { data, error } = await query;
    if (error || !data) {
      console.error('Error fetching complaints from Supabase:', error);
      const saved = localStorage.getItem('samadhan_complaints');
      return saved ? JSON.parse(saved) : INITIAL_COMPLAINTS;
    }

    const { data: { user } } = await supabase.auth.getUser();
    const currentUserId = user?.id;

    return data.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      category: row.category,
      subcategory: row.subcategory,
      description: row.description,
      location: {
        type: row.location_type,
        address: row.address,
        district: row.district,
        coordinates: row.latitude && row.longitude ? { lat: Number(row.latitude), lng: Number(row.longitude) } : undefined
      },
      dateSubmitted: row.date_submitted,
      dateObserved: row.date_observed,
      severity: row.severity,
      evidence: (row.evidence || []).map((e: any) => e.file_url),
      responsibleDepartment: row.responsible_department,
      status: row.status,
      timeline: (row.timeline || [])
        .sort((a: any, b: any) => a.sequence_order - b.sequence_order)
        .map((t: any) => ({
          title: t.title,
          description: t.description,
          date: t.event_date,
          status: t.status
        })),
      authorityUpdate: row.authority_update,
      expectedResolutionDate: row.expected_resolution_date,
      citizenVerification: row.citizen_verification,
      citizenFeedback: row.citizen_feedback,
      affectedCitizenCount: row.affected_citizen_count,
      joinedByMe: Boolean(currentUserId && (row.supporters || []).some((s: any) => s.user_id === currentUserId)),
      consumerNumber: row.consumer_number,
      serviceType: row.service_type,
      documentType: row.document_type,
      referenceNumber: row.reference_number,
      institutionName: row.institution_name,
      misconductType: row.misconduct_type,
      officeInvolved: row.office_involved,
      priorGrievanceId: row.prior_grievance_id,
      priorGrievanceDate: row.prior_grievance_date
    }));
  },

  async createComplaint(complaint: Partial<Complaint>): Promise<Complaint> {
    if (!isSupabaseConfigured()) {
      const newComp: Complaint = {
        id: `GRV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        category: complaint.category || '',
        subcategory: complaint.subcategory || '',
        description: complaint.description || '',
        location: complaint.location || { type: 'current', address: '', district: 'Bangalore Urban' },
        dateSubmitted: new Date().toISOString(),
        dateObserved: complaint.dateObserved || new Date().toISOString().split('T')[0],
        severity: complaint.severity || 'Moderate',
        evidence: complaint.evidence || [],
        responsibleDepartment: complaint.responsibleDepartment || '',
        status: 'In Progress',
        timeline: complaint.timeline || [
          { title: 'Complaint Registered', description: 'Grievance submitted by citizen.', date: new Date().toISOString().split('T')[0], status: 'completed' },
          { title: 'Routed to Department', description: `Assigned to ${complaint.responsibleDepartment}`, date: new Date().toISOString().split('T')[0], status: 'current' }
        ],
        citizenVerification: 'None',
        affectedCitizenCount: 1,
        ...complaint
      } as Complaint;

      const saved = localStorage.getItem('samadhan_complaints');
      const list = saved ? JSON.parse(saved) : INITIAL_COMPLAINTS;
      const updated = [newComp, ...list];
      localStorage.setItem('samadhan_complaints', JSON.stringify(updated));
      return newComp;
    }

    const { data: { user } } = await supabase.auth.getUser();

    const { data: inserted, error } = await supabase
      .from('complaints')
      .insert({
        user_id: user?.id || null,
        category: complaint.category!,
        subcategory: complaint.subcategory!,
        description: complaint.description!,
        location_type: complaint.location?.type || 'current',
        address: complaint.location?.address || '',
        district: complaint.location?.district || 'Bangalore Urban',
        state: 'Karnataka',
        latitude: complaint.location?.coordinates?.lat || null,
        longitude: complaint.location?.coordinates?.lng || null,
        date_observed: complaint.dateObserved || new Date().toISOString().split('T')[0],
        severity: complaint.severity || 'Moderate',
        responsible_department: complaint.responsibleDepartment || 'District Administration',
        status: 'In Progress',
        citizen_verification: 'None',
        affected_citizen_count: 1,
        consumer_number: complaint.consumerNumber || null,
        service_type: complaint.serviceType || null,
        document_type: complaint.documentType || null,
        reference_number: complaint.referenceNumber || null,
        institutionName: complaint.institutionName || null,
        misconduct_type: complaint.misconductType || null,
        office_involved: complaint.officeInvolved || null,
        prior_grievance_id: complaint.priorGrievanceId || null,
        prior_grievance_date: complaint.priorGrievanceDate || null
      } as any)
      .select()
      .single();

    if (error || !inserted) {
      throw new Error(error?.message || 'Failed to insert complaint');
    }

    // Insert timeline items
    const timelineItems = complaint.timeline && complaint.timeline.length > 0 ? complaint.timeline : [
      { title: 'Complaint Registered', description: 'Grievance submitted by citizen.', date: new Date().toISOString().split('T')[0], status: 'completed' as const },
      { title: 'Routed to Department', description: `Assigned to ${complaint.responsibleDepartment}`, date: new Date().toISOString().split('T')[0], status: 'current' as const }
    ];

    await supabase.from('complaint_timeline_events').insert(
      timelineItems.map((t, idx) => ({
        complaint_id: inserted.id,
        title: t.title,
        description: t.description,
        event_date: t.date,
        status: t.status,
        sequence_order: idx
      }))
    );

    // Insert evidence attachments
    if (complaint.evidence && complaint.evidence.length > 0) {
      await supabase.from('complaint_evidence').insert(
        complaint.evidence.map(url => ({
          complaint_id: inserted.id,
          user_id: user?.id || null,
          file_url: url,
          storage_path: url,
          file_type: 'photo'
        }))
      );
    }

    return {
      id: inserted.id,
      userId: inserted.user_id,
      category: inserted.category,
      subcategory: inserted.subcategory,
      description: inserted.description,
      location: {
        type: inserted.location_type,
        address: inserted.address,
        district: inserted.district,
        coordinates: inserted.latitude && inserted.longitude ? { lat: Number(inserted.latitude), lng: Number(inserted.longitude) } : undefined
      },
      dateSubmitted: inserted.date_submitted,
      dateObserved: inserted.date_observed,
      severity: inserted.severity,
      evidence: complaint.evidence || [],
      responsibleDepartment: inserted.responsible_department,
      status: inserted.status,
      timeline: timelineItems,
      citizenVerification: 'None',
      affectedCitizenCount: 1
    };
  },

  async joinComplaint(complaintId: string, note?: string, address?: string): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      const saved = localStorage.getItem('samadhan_complaints');
      const list: Complaint[] = saved ? JSON.parse(saved) : INITIAL_COMPLAINTS;
      const updated = list.map(c => {
        if (c.id === complaintId) {
          return { ...c, affectedCitizenCount: c.affectedCitizenCount + 1, joinedByMe: true };
        }
        return c;
      });
      localStorage.setItem('samadhan_complaints', JSON.stringify(updated));
      return true;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Use atomic join function
    const { error } = await supabase.rpc('join_complaint', {
      p_complaint_id: complaintId,
      p_note: note,
      p_address: address
    });

    return !error;
  },

  async verifyResolution(
    complaintId: string,
    status: CitizenVerificationStatus,
    feedback?: { comment: string; photo?: string }
  ): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      const saved = localStorage.getItem('samadhan_complaints');
      const list: Complaint[] = saved ? JSON.parse(saved) : INITIAL_COMPLAINTS;
      const updated = list.map(c => {
        if (c.id === complaintId) {
          return {
            ...c,
            status: status === 'VerifiedFixed' ? 'Resolved' : 'Needs Attention',
            citizenVerification: status,
            citizenFeedback: feedback
          };
        }
        return c;
      });
      localStorage.setItem('samadhan_complaints', JSON.stringify(updated));
      return true;
    }

    const nextStatus = status === 'VerifiedFixed' ? 'Resolved' : 'Needs Attention';

    const { error } = await supabase
      .from('complaints')
      .update({
        status: nextStatus,
        citizen_verification: status,
        citizen_feedback: feedback ? (feedback as any) : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', complaintId);

    // Add timeline event
    await supabase.from('complaint_timeline_events').insert({
      complaint_id: complaintId,
      title: status === 'VerifiedFixed' ? 'Resolution Verified ✓' : 'Resolution Disputed',
      description: status === 'VerifiedFixed'
        ? 'Citizen confirmed the issue is fully fixed.'
        : `Citizen reported: ${status === 'PartiallyFixed' ? 'Partially Fixed' : 'Still Broken'}. Notes: ${feedback?.comment || 'No notes'}`,
      event_date: new Date().toISOString().split('T')[0],
      status: status === 'VerifiedFixed' ? 'completed' : 'current',
      sequence_order: 99
    });

    return !error;
  }
};
