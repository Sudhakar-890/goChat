-- ============================================
-- goChat: Rooms Table
-- Supports both DMs (is_group=false) and groups
-- ============================================

CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  is_group BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.profiles(id),
  avatar_url TEXT,
  last_message_text TEXT,
  last_message_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_rooms_last_message ON public.rooms(last_message_at DESC);
