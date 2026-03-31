import { supabaseAdmin } from '../config/supabase';

export class MediaService {
  private bucketId = 'chat-media';

  /**
   * Generate a signed upload URL for a file
   */
  async createSignedUploadUrl(userId: string, filePath: string) {
    const fullPath = `${userId}/${filePath}`;

    const { data, error } = await supabaseAdmin.storage
      .from(this.bucketId)
      .createSignedUploadUrl(fullPath);

    if (error) throw error;

    return {
      signed_url: data.signedUrl,
      path: data.path,
      token: data.token,
    };
  }

  /**
   * Generate a signed download URL for viewing media
   */
  async createSignedDownloadUrl(filePath: string, expiresIn = 3600) {
    const { data, error } = await supabaseAdmin.storage
      .from(this.bucketId)
      .createSignedUrl(filePath, expiresIn);

    if (error) throw error;

    return {
      signed_url: data.signedUrl,
    };
  }

  /**
   * Delete a media file
   */
  async deleteFile(filePath: string) {
    const { error } = await supabaseAdmin.storage
      .from(this.bucketId)
      .remove([filePath]);

    if (error) throw error;
    return { success: true };
  }
}

export const mediaService = new MediaService();
