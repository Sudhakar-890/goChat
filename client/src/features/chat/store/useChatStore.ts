import { create } from 'zustand';
import type { Room, Message } from '../../../types/database';
import { supabase } from '../../../config/supabase';

interface ChatState {
  rooms: Room[];
  activeRoomId: string | null;
  messages: Message[];
  isLoadingRooms: boolean;
  isLoadingMessages: boolean;
  typingUsers: Record<string, string[]>; // roomId -> userId[]

  // Actions
  setRooms: (rooms: Room[]) => void;
  setActiveRoom: (roomId: string | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  prependMessages: (messages: Message[]) => void;
  updateMessageStatus: (messageId: string, status: Message['status']) => void;
  addTypingUser: (roomId: string, userId: string) => void;
  removeTypingUser: (roomId: string, userId: string) => void;
  fetchRooms: () => Promise<void>;
  fetchMessages: (roomId: string) => Promise<void>;
  sendMessage: (roomId: string, content: string, type?: Message['type'], mediaUrl?: string) => Promise<void>;
  createRoom: (participantIds: string[], name?: string, isGroup?: boolean) => Promise<Room>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  rooms: [],
  activeRoomId: null,
  messages: [],
  isLoadingRooms: false,
  isLoadingMessages: false,
  typingUsers: {},

  setRooms: (rooms) => set({ rooms }),

  setActiveRoom: (roomId) => {
    set({ activeRoomId: roomId, messages: [] });
    if (roomId) {
      get().fetchMessages(roomId);
    }
  },

  setMessages: (messages) => set({ messages }),

  addMessage: (message) => {
    set((state) => {
      // Avoid duplicates
      if (state.messages.some((m) => m.id === message.id)) {
        return state;
      }
      return { messages: [...state.messages, message] };
    });

    // Update room's last message in the rooms list
    set((state) => ({
      rooms: state.rooms
        .map((room) =>
          room.id === message.room_id
            ? {
                ...room,
                last_message_text: message.content || (message.type === 'image' ? '📷 Image' : '📎 File'),
                last_message_at: message.created_at,
              }
            : room
        )
        .sort(
          (a, b) =>
            new Date(b.last_message_at).getTime() -
            new Date(a.last_message_at).getTime()
        ),
    }));
  },

  prependMessages: (messages) => {
    set((state) => ({
      messages: [...messages, ...state.messages],
    }));
  },

  updateMessageStatus: (messageId, status) => {
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === messageId ? { ...m, status } : m
      ),
    }));
  },

  addTypingUser: (roomId, userId) => {
    set((state) => ({
      typingUsers: {
        ...state.typingUsers,
        [roomId]: [...new Set([...(state.typingUsers[roomId] || []), userId])],
      },
    }));
  },

  removeTypingUser: (roomId, userId) => {
    set((state) => ({
      typingUsers: {
        ...state.typingUsers,
        [roomId]: (state.typingUsers[roomId] || []).filter((id) => id !== userId),
      },
    }));
  },

  fetchRooms: async () => {
    set({ isLoadingRooms: true });
    try {
      const { data: participations } = await supabase
        .from('participants')
        .select('room_id')
        .order('joined_at', { ascending: false });

      if (!participations?.length) {
        set({ rooms: [], isLoadingRooms: false });
        return;
      }

      const roomIds = participations.map((p) => p.room_id);

      const { data: rooms, error } = await supabase
        .from('rooms')
        .select(`
          *,
          participants (
            user_id,
            role,
            profiles:user_id (
              id,
              username,
              full_name,
              avatar_url,
              is_online,
              last_seen
            )
          )
        `)
        .in('id', roomIds)
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      set({ rooms: rooms || [] });
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
    } finally {
      set({ isLoadingRooms: false });
    }
  },

  fetchMessages: async (roomId: string) => {
    set({ isLoadingMessages: true });
    try {
      const { data, error } = await supabase
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
        .eq('room_id', roomId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      set({ messages: (data || []).reverse() });
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      set({ isLoadingMessages: false });
    }
  },

  sendMessage: async (roomId, content, type = 'text', mediaUrl) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('messages')
      .insert({
        room_id: roomId,
        sender_id: session.user.id,
        content,
        type,
        media_url: mediaUrl,
      })
      .select(`
        *,
        sender:sender_id (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .single();

    if (error) throw error;
    // The realtime subscription will add the message to the store
    return data;
  },

  createRoom: async (participantIds, name, isGroup = false) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    // Create the room
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .insert({
        name: name || null,
        is_group: isGroup,
        created_by: session.user.id,
      })
      .select()
      .single();

    if (roomError) throw roomError;

    // Add all participants
    const allParticipants = [
      { room_id: room.id, user_id: session.user.id, role: 'admin' },
      ...participantIds
        .filter((id) => id !== session.user.id)
        .map((id) => ({ room_id: room.id, user_id: id, role: 'member' })),
    ];

    const { error: pError } = await supabase
      .from('participants')
      .insert(allParticipants);

    if (pError) throw pError;

    // Refresh rooms list
    await get().fetchRooms();
    return room;
  },
}));
