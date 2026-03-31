-- ============================================
-- goChat: Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- ==================
-- PROFILES POLICIES
-- ==================
-- Anyone authenticated can read profiles (for displaying names/avatars)
CREATE POLICY "Profiles: public read"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- Users can only update their own profile
CREATE POLICY "Profiles: self update"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ==================
-- ROOMS POLICIES
-- ==================
-- Users can only see rooms they participate in
CREATE POLICY "Rooms: read participated"
  ON public.rooms FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.participants
      WHERE participants.room_id = rooms.id
      AND participants.user_id = auth.uid()
    )
  );

-- Any authenticated user can create a room
CREATE POLICY "Rooms: create"
  ON public.rooms FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Room creator can update room details
CREATE POLICY "Rooms: update own"
  ON public.rooms FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

-- Function to check if user is in a room (bypasses RLS to prevent recursion)
CREATE OR REPLACE FUNCTION public.is_room_participant(room_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.participants
    WHERE participants.room_id = $1
    AND participants.user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Users can see participants of rooms they belong to
CREATE POLICY "Participants: read own rooms"
  ON public.participants FOR SELECT
  TO authenticated
  USING (
    public.is_room_participant(room_id)
  );

-- Users can add themselves or be added to rooms
CREATE POLICY "Participants: insert"
  ON public.participants FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ==================
-- MESSAGES POLICIES
-- ==================
-- Users can read messages in rooms they belong to
CREATE POLICY "Messages: read in room"
  ON public.messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.participants
      WHERE participants.room_id = messages.room_id
      AND participants.user_id = auth.uid()
    )
  );

-- Users can send messages in rooms they belong to
CREATE POLICY "Messages: insert in room"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.participants
      WHERE participants.room_id = messages.room_id
      AND participants.user_id = auth.uid()
    )
  );

-- Users can update their own messages (for status)
CREATE POLICY "Messages: update own"
  ON public.messages FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.participants
      WHERE participants.room_id = messages.room_id
      AND participants.user_id = auth.uid()
    )
  );
