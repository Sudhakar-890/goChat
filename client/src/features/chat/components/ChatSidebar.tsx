import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { useRealtimeRooms } from '../hooks/useRealtimeMessages';
import { formatChatDate } from '../../../utils/formatDate';
import { supabase } from '../../../config/supabase';
import {
  Search, Plus, MessageCircle, LogOut, Users, X, Loader2
} from 'lucide-react';
import { cn } from '../../../utils/cn';
import type { Profile } from '../../../types/database';

export function ChatSidebar() {
  const { rooms, activeRoomId, isLoadingRooms, setActiveRoom, fetchRooms, createRoom } =
    useChatStore();
  const { user, profile, signOut } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchUsers, setSearchUsers] = useState<Profile[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Subscribe to real-time room updates
  useRealtimeRooms();

  // Fetch rooms on mount
  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // Search for users to start new chat
  const handleSearchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchUsers([]);
      return;
    }

    setIsSearching(true);
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user?.id)
        .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
        .limit(10);

      setSearchUsers(data || []);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Start a new DM with a user
  const handleStartChat = async (targetUser: Profile) => {
    try {
      const room = await createRoom([targetUser.id]);
      setActiveRoom(room.id);
      setShowNewChat(false);
      setSearchUsers([]);
    } catch (err) {
      console.error('Failed to create room:', err);
    }
  };

  // Filter rooms by search query
  const filteredRooms = rooms.filter((room) => {
    if (!searchQuery.trim()) return true;
    const otherUser = room.participants?.find((p) => p.user_id !== user?.id)?.profiles;
    const name = room.is_group
      ? room.name
      : otherUser?.full_name || otherUser?.username || '';
    return name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="w-full lg:w-96 h-screen flex flex-col glass border-r border-white/5">
      {/* Header */}
      <div className="px-6 py-5 border-b border-white/5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-500 to-accent-700 flex items-center justify-center text-white font-semibold">
              {(profile?.username || profile?.full_name || '?')[0]?.toUpperCase()}
            </div>
            <div>
              <h2 className="font-semibold text-white text-lg">goChat</h2>
              <p className="text-xs text-dark-400">{profile?.username || user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowNewChat(true)}
              className="btn-ghost p-2 rounded-xl"
              title="New chat"
            >
              <Plus className="w-5 h-5" />
            </button>
            <button onClick={signOut} className="btn-ghost p-2 rounded-xl" title="Sign out">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-dark-700/50 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-dark-400 focus:outline-none focus:border-accent-500/30 transition-all"
          />
        </div>
      </div>

      {/* Room List */}
      <div className="flex-1 overflow-y-auto">
        {isLoadingRooms ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-accent-400 animate-spin" />
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <MessageCircle className="w-12 h-12 text-dark-500 mb-3" />
            <p className="text-dark-400 text-sm">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowNewChat(true)}
                className="mt-3 text-accent-400 hover:text-accent-300 text-sm font-medium transition-colors"
              >
                Start a new chat
              </button>
            )}
          </div>
        ) : (
          <AnimatePresence>
            {filteredRooms.map((room) => {
              const otherUser = room.participants?.find(
                (p) => p.user_id !== user?.id
              )?.profiles;
              const name = room.is_group
                ? room.name
                : otherUser?.full_name || otherUser?.username || 'Unknown';
              const avatar = room.is_group ? room.avatar_url : otherUser?.avatar_url;
              const isOnline = !room.is_group && otherUser?.is_online;
              const isActive = room.id === activeRoomId;

              return (
                <motion.button
                  key={room.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => setActiveRoom(room.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-6 py-3.5 text-left transition-all duration-200',
                    isActive
                      ? 'bg-accent-500/10 border-r-2 border-accent-500'
                      : 'hover:bg-white/[0.03]'
                  )}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    {avatar ? (
                      <img src={avatar} alt={name || ''} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-dark-500 to-dark-600 flex items-center justify-center text-white font-semibold">
                        {room.is_group ? (
                          <Users className="w-5 h-5" />
                        ) : (
                          (name || '?')[0]?.toUpperCase()
                        )}
                      </div>
                    )}
                    {isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 online-dot" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className={cn('font-medium truncate', isActive ? 'text-white' : 'text-dark-100')}>
                        {name}
                      </h4>
                      <span className="text-[11px] text-dark-400 flex-shrink-0 ml-2">
                        {room.last_message_at && formatChatDate(room.last_message_at)}
                      </span>
                    </div>
                    <p className="text-sm text-dark-400 truncate mt-0.5">
                      {room.last_message_text || 'No messages yet'}
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* New Chat Modal */}
      <AnimatePresence>
        {showNewChat && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-dark-900/95 backdrop-blur-sm z-50 flex flex-col"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
              <h3 className="text-lg font-semibold text-white">New Chat</h3>
              <button onClick={() => setShowNewChat(false)} className="text-dark-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Users */}
            <div className="px-6 py-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                <input
                  type="text"
                  placeholder="Search by username..."
                  onChange={(e) => handleSearchUsers(e.target.value)}
                  className="w-full bg-dark-700/50 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-dark-400 focus:outline-none focus:border-accent-500/30 transition-all"
                  autoFocus
                />
              </div>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto px-6">
              {isSearching ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-accent-400 animate-spin" />
                </div>
              ) : (
                searchUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleStartChat(u)}
                    className="w-full flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-white/5 transition-all"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-dark-500 to-dark-600 flex items-center justify-center text-white font-semibold">
                      {(u.username || u.full_name || '?')[0]?.toUpperCase()}
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-white">{u.full_name || u.username}</p>
                      <p className="text-xs text-dark-400">@{u.username}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
