import { useChatStore } from '../features/chat/store/useChatStore';
import { ChatSidebar } from '../features/chat/components/ChatSidebar';
import { ChatWindow } from '../features/chat/components/ChatWindow';
import { cn } from '../utils/cn';

export function ChatPage() {
  const activeRoomId = useChatStore((s) => s.activeRoomId);

  return (
    <div className="flex h-screen bg-dark-900 overflow-hidden">
      {/* Sidebar — hidden on mobile when a chat is active */}
      <div
        className={cn(
          'relative',
          activeRoomId ? 'hidden lg:flex' : 'flex',
          'w-full lg:w-auto'
        )}
      >
        <ChatSidebar />
      </div>

      {/* Chat Window — hidden on mobile when no chat is active */}
      <div
        className={cn(
          activeRoomId ? 'flex' : 'hidden lg:flex',
          'flex-1'
        )}
      >
        <ChatWindow />
      </div>
    </div>
  );
}
