import { MessageCircleMore } from "lucide-react";

const NoChatSelected = () => {
  return (
    <div className="h-full w-full flex items-center justify-center bg-base-200/40">
      <div className="flex flex-col items-center text-center gap-4 px-4">
        
        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <MessageCircleMore
            className="w-8 h-8 text-primary"
            strokeWidth={1.8}
          />
        </div>

        <h2 className="text-xl font-bold leading-none">
          Welcome
        </h2>

        <p className="text-sm opacity-60 leading-tight max-w-xs">
          Select a chat to start messaging
        </p>
      </div>
    </div>
  );
};

export default NoChatSelected;
