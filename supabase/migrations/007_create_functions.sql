-- ============================================
-- goChat: Database Functions & Triggers
-- ============================================

-- Update room's last_message when a new message is inserted
CREATE OR REPLACE FUNCTION public.update_room_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.rooms
  SET last_message_text = CASE
    WHEN NEW.type = 'text' THEN NEW.content
    WHEN NEW.type = 'image' THEN '📷 Image'
    WHEN NEW.type = 'video' THEN '🎥 Video'
    WHEN NEW.type = 'file' THEN '📎 File'
    ELSE NEW.content
  END,
  last_message_at = NEW.created_at
  WHERE id = NEW.room_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_new_message
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.update_room_last_message();

-- Enable real-time for messages and rooms tables
-- Run this in Supabase Dashboard > Database > Replication
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
