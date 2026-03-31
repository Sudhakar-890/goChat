import { useEffect } from 'react';
import { supabase } from '../../../config/supabase';
import { useChatStore } from '../store/useChatStore';
import type { Message } from '../../../types/database';

/**
 * Hook to subscribe to real-time message inserts for a given room.
 * Automatically adds new messages to the Zustand store.
 */
export function useRealtimeMessages(roomId: string | null) {
  const addMessage = useChatStore((s) => s.addMessage);

  useEffect(() => {
    if (!roomId) return;

    const channel = supabase
      .channel(`room-messages:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          // Fetch the complete message with sender profile
          const { data } = await supabase
            .from('messages')
            .select(`
              *,
              sender:sender_id (
                id,
                username,
                full_name,
                avatar_url
              )
            `)
            .eq('id', payload.new.id)
            .single();

          if (data) {
            addMessage(data as Message);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, addMessage]);
}

/**
 * Hook to subscribe to room list updates (new rooms, last message changes)
 */
export function useRealtimeRooms() {
  const fetchRooms = useChatStore((s) => s.fetchRooms);

  useEffect(() => {
    const channel = supabase
      .channel('room-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rooms',
        },
        () => {
          // Re-fetch rooms when any room is updated
          fetchRooms();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'participants',
        },
        () => {
          // Re-fetch when added to a new room
          fetchRooms();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchRooms]);
}

/**
 * Hook for typing indicators using Supabase Broadcast
 */
export function useTypingIndicator(roomId: string | null) {
  const addTypingUser = useChatStore((s) => s.addTypingUser);
  const removeTypingUser = useChatStore((s) => s.removeTypingUser);

  useEffect(() => {
    if (!roomId) return;

    const channel = supabase.channel(`typing:${roomId}`);

    channel
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload?.user_id) {
          addTypingUser(roomId, payload.user_id);
          // Auto-remove after 3 seconds
          setTimeout(() => removeTypingUser(roomId, payload.user_id), 3000);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, addTypingUser, removeTypingUser]);

  const sendTyping = async (userId: string) => {
    if (!roomId) return;
    await supabase.channel(`typing:${roomId}`).send({
      type: 'broadcast',
      event: 'typing',
      payload: { user_id: userId },
    });
  };

  return { sendTyping };
}
