import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import type { Notification } from '../types';
import { MOCK_NOTIFICATIONS } from '../mockData';

export const notificationService = {
  async fetchNotifications(): Promise<Notification[]> {
    if (!isSupabaseConfigured()) {
      const saved = localStorage.getItem('samadhan_notifications');
      return saved ? JSON.parse(saved) : MOCK_NOTIFICATIONS;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.error('Error fetching notifications:', error);
      const saved = localStorage.getItem('samadhan_notifications');
      return saved ? JSON.parse(saved) : MOCK_NOTIFICATIONS;
    }

    return data.map((n: any) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      date: n.created_at,
      complaintId: n.complaint_id || '',
      read: n.is_read
    }));
  },

  async markAsRead(notificationId: string): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      const saved = localStorage.getItem('samadhan_notifications');
      const list: Notification[] = saved ? JSON.parse(saved) : MOCK_NOTIFICATIONS;
      const updated = list.map(n => n.id === notificationId ? { ...n, read: true } : n);
      localStorage.setItem('samadhan_notifications', JSON.stringify(updated));
      return true;
    }

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    return !error;
  },

  async createNotification(title: string, message: string, complaintId?: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      const saved = localStorage.getItem('samadhan_notifications');
      const list: Notification[] = saved ? JSON.parse(saved) : MOCK_NOTIFICATIONS;
      const newNotif: Notification = {
        id: `n-${Date.now()}`,
        title,
        message,
        date: new Date().toISOString(),
        complaintId: complaintId || '',
        read: false
      };
      localStorage.setItem('samadhan_notifications', JSON.stringify([newNotif, ...list]));
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('notifications').insert({
      user_id: user.id,
      title,
      message,
      complaint_id: complaintId || null,
      is_read: false
    });
  }
};
