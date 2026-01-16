import ChatBubble from "./ChatBubble";
import MessageActionMenu from "./MessageActionMenu";
import { useMessageMenu } from "./useMessageMenu";

const Messages = ({ messages, user, handleReact }) => {
  const { menu, openMenu, closeMenu } = useMessageMenu();

  return (
    <div className="relative">
      {messages.map((msg) => (
        <ChatBubble
          key={msg._id}
          msg={msg}
          isMine={msg.senderId === user._id}
          onReact={handleReact}
          onOpenMenu={openMenu} // ✅ correct prop
        />
      ))}

      <MessageActionMenu
        menu={menu}
        closeMenu={closeMenu}
      />
    </div>
  );
};

export default Messages;
