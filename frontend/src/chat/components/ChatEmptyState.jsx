import { MessageCircleMore } from "lucide-react";

const ChatEmptyState = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-base-200/30">
      <div className="w-16 h-16 rounded-full bg-base-200 flex items-center justify-center mb-4">
        <MessageCircleMore className="w-8 h-8 opacity-40" />
      </div>
      <p className="text-base-content/60">No messages yet</p>
      <p className="text-sm text-base-content/40 mt-1">
        Say hello to start the conversation
      </p>
    </div>
  );
};

export default ChatEmptyState;
