-- ============================================
-- goChat: Participants Table
-- Junction table: many users <-> many rooms
-- ============================================

CREATE TABLE public.participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(room_id, user_id)
);

CREATE INDEX idx_participants_user ON public.participants(user_id);
CREATE INDEX idx_participants_room ON public.participants(room_id);
