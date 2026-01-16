import MessageSkeleton from "../../components/skeletons/MessageSkeleton";

const ChatLoadingState = () => {
  return (
    <div className="flex-1 flex flex-col">
      <MessageSkeleton />
    </div>
  );
};


export default ChatLoadingState;
