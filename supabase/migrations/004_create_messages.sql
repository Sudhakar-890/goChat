-- ============================================
-- goChat: Messages Table
-- Supports text, image, video, file types
-- Tracks sent/delivered/seen status
-- ============================================

CREATE TYPE message_type AS ENUM ('text', 'image', 'video', 'file');
CREATE TYPE message_status AS ENUM ('sent', 'delivered', 'seen');

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  content TEXT,
  type message_type DEFAULT 'text',
  media_url TEXT,
  media_metadata JSONB DEFAULT '{}',
  status message_status DEFAULT 'sent',
  reply_to UUID REFERENCES public.messages(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_messages_room ON public.messages(room_id, created_at DESC);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);

-- Auto-update updated_at
CREATE TRIGGER messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
