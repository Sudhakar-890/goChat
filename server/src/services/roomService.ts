import { supabaseAdmin } from '../config/supabase';
import { CreateRoomInput } from '../schemas/room.schema';

export class RoomService {
  /**
   * Create a new chat room (DM or group) and add participants
   */
  async createRoom(userId: string, input: CreateRoomInput) {
    // Create the room
    const { data: room, error: roomError } = await supabaseAdmin
      .from('rooms')
      .insert({
        name: input.name || null,
        is_group: input.is_group,
        created_by: userId,
      })
      .select()
      .single();

    if (roomError) throw roomError;

    // Add creator as admin participant
    const participantInserts = [
      { room_id: room.id, user_id: userId, role: 'admin' },
      ...input.participant_ids
        .filter((id) => id !== userId)
        .map((id) => ({
          room_id: room.id,
          user_id: id,
          role: 'member' as const,
        })),
    ];

    const { error: participantError } = await supabaseAdmin
      .from('participants')
      .insert(participantInserts);

    if (participantError) throw participantError;

    return room;
  }

  /**
   * Get all rooms a user participates in, ordered by last message
   */
  async getUserRooms(userId: string) {
    // Get room IDs the user participates in
    const { data: participations, error: pError } = await supabaseAdmin
      .from('participants')
      .select('room_id')
      .eq('user_id', userId);

    if (pError) throw pError;

    const roomIds = participations.map((p) => p.room_id);

    if (roomIds.length === 0) return [];

    // Fetch rooms with participants and their profiles
    const { data: rooms, error: roomError } = await supabaseAdmin
      .from('rooms')
      .select(
        `
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
      `
      )
      .in('id', roomIds)
      .order('last_message_at', { ascending: false });

    if (roomError) throw roomError;

    return rooms;
  }

  /**
   * Add a participant to an existing room
   */
  async addParticipant(roomId: string, userId: string) {
    const { data, error } = await supabaseAdmin
      .from('participants')
      .insert({ room_id: roomId, user_id: userId })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Check if a DM room already exists between two users
   */
  async findExistingDM(userId1: string, userId2: string) {
    const { data } = await supabaseAdmin.rpc('find_dm_room', {
      user1: userId1,
      user2: userId2,
    });

    return data?.[0] || null;
  }
}

export const roomService = new RoomService();
