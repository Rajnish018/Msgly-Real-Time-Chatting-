import ChatHeader from "../components/ChatHeader";
import MessageSkeleton from "../../components/skeletons/MessageSkeleton";
import MessageInput from "../components/MessageInput";

const ChatLoadingState = () => {
  return (
    <div className="flex-1 flex flex-col bg-base-100">
      <ChatHeader />
      <MessageSkeleton />
      <MessageInput />
    </div>
  );
};

export default ChatLoadingState;
