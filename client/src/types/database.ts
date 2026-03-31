// Database types matching the Supabase schema

export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string;
  is_online: boolean;
  last_seen: string;
  created_at: string;
  updated_at: string;
}

export interface Room {
  id: string;
  name: string | null;
  is_group: boolean;
  created_by: string;
  avatar_url: string | null;
  last_message_text: string | null;
  last_message_at: string;
  created_at: string;
  participants?: ParticipantWithProfile[];
}

export interface Participant {
  id: string;
  room_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
}

export interface ParticipantWithProfile extends Participant {
  profiles: Profile;
}

export type MessageType = 'text' | 'image' | 'video' | 'file';
export type MessageStatus = 'sent' | 'delivered' | 'seen';

export interface Message {
  id: string;
  room_id: string;
  sender_id: string | null;
  content: string | null;
  type: MessageType;
  media_url: string | null;
  media_metadata: {
    width?: number;
    height?: number;
    duration?: number;
    mimetype?: string;
    size?: number;
  };
  status: MessageStatus;
  reply_to: string | null;
  created_at: string;
  updated_at: string;
  sender?: Profile;
}
