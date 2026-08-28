import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { fileToDataUrl } from '../utils/mediaUtils';

export const storageService = {
  async uploadFile(
    file: File | Blob, 
    bucket: 'grievance-evidence' | 'resolution-verification' = 'grievance-evidence',
    customFileName?: string
  ): Promise<string> {
    if (!isSupabaseConfigured()) {
      if (file instanceof File) {
        try {
          return await fileToDataUrl(file);
        } catch {
          return URL.createObjectURL(file);
        }
      }
      return URL.createObjectURL(file);
    }

    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || 'anonymous';
    const ext = (file instanceof File && file.name.split('.').pop()) || 'jpg';
    const fileName = customFileName || `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const filePath = `${userId}/${fileName}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('Storage upload error:', error);
      if (file instanceof File) {
        return await fileToDataUrl(file);
      }
      return URL.createObjectURL(file);
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrl;
  }
};
