import { useEffect, useRef, useState, useCallback } from 'react';
import type { FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { useRealtimeMessages, useTypingIndicator } from '../hooks/useRealtimeMessages';
import { formatMessageTime, formatRelativeTime } from '../../../utils/formatDate';
import { supabase } from '../../../config/supabase';
import {
  Send, ImagePlus, Smile, ArrowLeft, MoreVertical, Check, CheckCheck,
  Phone, Video, Loader2, X
} from 'lucide-react';
import { cn } from '../../../utils/cn';
import type { Message } from '../../../types/database';

export function ChatWindow() {
  const { activeRoomId, messages, isLoadingMessages, rooms, setActiveRoom, sendMessage } =
    useChatStore();
  const { user } = useAuthStore();
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real-time subscriptions
  useRealtimeMessages(activeRoomId);
  const { sendTyping } = useTypingIndicator(activeRoomId);
  const typingUsers = useChatStore((s) => s.typingUsers);

  const activeRoom = rooms.find((r) => r.id === activeRoomId);

  // Get the other participant for DM rooms
  const otherParticipant = activeRoom?.participants?.find(
    (p) => p.user_id !== user?.id
  )?.profiles;

  const roomName = activeRoom?.is_group
    ? activeRoom.name
    : otherParticipant?.full_name || otherParticipant?.username || 'Chat';

  const roomAvatar = activeRoom?.is_group
    ? activeRoom.avatar_url
    : otherParticipant?.avatar_url;

  const isOtherOnline = otherParticipant?.is_online || false;

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    if (user?.id) {
      sendTyping(user.id);
    }
  }, [user?.id, sendTyping]);

  // Handle send message
  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedMedia) || !activeRoomId || isSending) return;

    setIsSending(true);
    try {
      let mediaUrl: string | undefined;

      // Upload media if selected
      if (selectedMedia) {
        const fileExt = selectedMedia.name.split('.').pop();
        const filePath = `${user?.id}/${activeRoomId}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('chat-media')
          .upload(filePath, selectedMedia);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('chat-media')
          .getPublicUrl(filePath);

        mediaUrl = urlData.publicUrl;
      }

      const msgType = selectedMedia
        ? selectedMedia.type.startsWith('image/')
          ? 'image'
          : 'video'
        : 'text';

      await sendMessage(activeRoomId, newMessage.trim() || '', msgType as Message['type'], mediaUrl);

      setNewMessage('');
      setSelectedMedia(null);
      setMediaPreview(null);
    } catch (error: any) {
      console.error('Send failed:', error);
    } finally {
      setIsSending(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedMedia(file);
    const reader = new FileReader();
    reader.onload = () => setMediaPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  // No active room — show empty state
  if (!activeRoomId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-dark-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-accent-500/20 to-accent-700/20 flex items-center justify-center mx-auto mb-6">
            <Send className="w-10 h-10 text-accent-400" />
          </div>
          <h2 className="text-2xl font-semibold text-white mb-2">goChat</h2>
          <p className="text-dark-300 max-w-sm">
            Select a conversation from the sidebar or start a new chat to begin messaging.
          </p>
        </motion.div>
      </div>
    );
  }

  const currentTyping = typingUsers[activeRoomId] || [];

  return (
    <div className="flex-1 flex flex-col bg-dark-900 h-screen">
      {/* Chat Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between px-6 py-4 glass border-b border-white/5"
      >
        <div className="flex items-center gap-4">
          {/* Back button (mobile) */}
          <button
            onClick={() => setActiveRoom(null)}
            className="lg:hidden text-dark-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          {/* Avatar */}
          <div className="relative">
            {roomAvatar ? (
              <img src={roomAvatar} alt={roomName || ''} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-500 to-accent-700 flex items-center justify-center text-white font-semibold">
                {(roomName || '?')[0]?.toUpperCase()}
              </div>
            )}
            {!activeRoom?.is_group && (
              <div className={cn(
                'absolute -bottom-0.5 -right-0.5',
                isOtherOnline ? 'online-dot' : 'offline-dot'
              )} />
            )}
          </div>

          {/* Name & status */}
          <div>
            <h3 className="font-semibold text-white">{roomName}</h3>
            <p className="text-xs text-dark-400">
              {activeRoom?.is_group
                ? `${activeRoom.participants?.length || 0} members`
                : isOtherOnline
                ? 'Online'
                : otherParticipant?.last_seen
                ? `Last seen ${formatRelativeTime(otherParticipant.last_seen)}`
                : 'Offline'}
            </p>
          </div>
        </div>

        {/* Header actions */}
        <div className="flex items-center gap-2">
          <button className="btn-ghost p-2 rounded-xl">
            <Phone className="w-5 h-5" />
          </button>
          <button className="btn-ghost p-2 rounded-xl">
            <Video className="w-5 h-5" />
          </button>
          <button className="btn-ghost p-2 rounded-xl">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </motion.div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1">
        {isLoadingMessages ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 text-accent-400 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-dark-400">
            <p>No messages yet. Say hello! 👋</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => {
              const isMine = msg.sender_id === user?.id;
              const showAvatar =
                !isMine &&
                (idx === 0 || messages[idx - 1]?.sender_id !== msg.sender_id);

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn('flex gap-2', isMine ? 'justify-end' : 'justify-start')}
                >
                  {/* Avatar for received messages */}
                  {!isMine && (
                    <div className="w-8 flex-shrink-0">
                      {showAvatar && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-dark-500 to-dark-600 flex items-center justify-center text-xs font-medium text-white">
                          {(msg.sender?.username || msg.sender?.full_name || '?')[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div className={cn('max-w-[70%] group', isMine ? 'order-1' : '')}>
                    {/* Sender name for group chats */}
                    {!isMine && showAvatar && activeRoom?.is_group && (
                      <p className="text-xs text-accent-400 mb-1 ml-1">
                        {msg.sender?.full_name || msg.sender?.username}
                      </p>
                    )}

                    <div className={cn(isMine ? 'bubble-sent' : 'bubble-received', 'px-4 py-2.5')}>
                      {/* Media content */}
                      {msg.media_url && (msg.type === 'image' || msg.type === 'video') && (
                        <div className="mb-2 rounded-xl overflow-hidden">
                          {msg.type === 'image' ? (
                            <img
                              src={msg.media_url}
                              alt="Shared image"
                              className="max-w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                            />
                          ) : (
                            <video
                              src={msg.media_url}
                              controls
                              className="max-w-full rounded-lg"
                            />
                          )}
                        </div>
                      )}

                      {/* Text content */}
                      {msg.content && (
                        <p className="text-sm leading-relaxed break-words">{msg.content}</p>
                      )}

                      {/* Timestamp & status */}
                      <div className={cn('flex items-center gap-1 mt-1', isMine ? 'justify-end' : '')}>
                        <span className="text-[10px] opacity-60">
                          {formatMessageTime(msg.created_at)}
                        </span>
                        {isMine && (
                          <span className="opacity-60">
                            {msg.status === 'seen' ? (
                              <CheckCheck className="w-3.5 h-3.5 text-blue-400" />
                            ) : msg.status === 'delivered' ? (
                              <CheckCheck className="w-3.5 h-3.5" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}

        {/* Typing indicator */}
        {currentTyping.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-dark-400 text-sm ml-10"
          >
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-dark-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-dark-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-dark-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span>typing...</span>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Media Preview */}
      <AnimatePresence>
        {mediaPreview && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-6 border-t border-white/5"
          >
            <div className="relative inline-block py-3">
              <img
                src={mediaPreview}
                alt="Preview"
                className="h-20 rounded-xl object-cover"
              />
              <button
                onClick={() => {
                  setSelectedMedia(null);
                  setMediaPreview(null);
                }}
                className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message Input */}
      <form onSubmit={handleSend} className="px-6 py-4 border-t border-white/5">
        <div className="flex items-center gap-3">
          {/* Media upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-dark-400 hover:text-accent-400 transition-colors p-2"
          >
            <ImagePlus className="w-5 h-5" />
          </button>

          {/* Text input */}
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              className="input-dark pr-12"
            />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-accent-400 transition-colors">
              <Smile className="w-5 h-5" />
            </button>
          </div>

          {/* Send button */}
          <motion.button
            type="submit"
            disabled={isSending || (!newMessage.trim() && !selectedMedia)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              'p-3 rounded-xl transition-all duration-200',
              newMessage.trim() || selectedMedia
                ? 'bg-gradient-to-r from-accent-500 to-accent-600 text-white shadow-lg shadow-accent-500/25'
                : 'bg-dark-700 text-dark-400'
            )}
          >
            {isSending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </motion.button>
        </div>
      </form>
    </div>
  );
}
