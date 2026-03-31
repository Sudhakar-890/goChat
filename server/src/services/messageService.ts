import { supabaseAdmin } from '../config/supabase';
import { SendMessageInput } from '../schemas/message.schema';

export class MessageService {
  /**
   * Send a new message in a room
   */
  async sendMessage(senderId: string, input: SendMessageInput) {
    const { data, error } = await supabaseAdmin
      .from('messages')
      .insert({
        room_id: input.room_id,
        sender_id: senderId,
        content: input.content,
        type: input.type,
        media_url: input.media_url,
        media_metadata: input.media_metadata || {},
        reply_to: input.reply_to,
      })
      .select(
        `
        *,
        sender:sender_id (
          id,
          username,
          full_name,
          avatar_url
        )
      `
      )
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get paginated messages for a room
   */
  async getMessages(roomId: string, limit = 50, before?: string) {
    let query = supabaseAdmin
      .from('messages')
      .select(
        `
        *,
        sender:sender_id (
          id,
          username,
          full_name,
          avatar_url
        )
      `
      )
      .eq('room_id', roomId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (before) {
      query = query.lt('created_at', before);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []).reverse(); // Return in chronological order
  }

  /**
   * Update message status (delivered, seen)
   */
  async updateStatus(messageId: string, status: 'delivered' | 'seen') {
    const { data, error } = await supabaseAdmin
      .from('messages')
      .update({ status })
      .eq('id', messageId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Mark all messages in a room as seen for a user
   */
  async markRoomAsSeen(roomId: string, userId: string) {
    const { error } = await supabaseAdmin
      .from('messages')
      .update({ status: 'seen' })
      .eq('room_id', roomId)
      .neq('sender_id', userId)
      .neq('status', 'seen');

    if (error) throw error;
    return { success: true };
  }
}

export const messageService = new MessageService();
