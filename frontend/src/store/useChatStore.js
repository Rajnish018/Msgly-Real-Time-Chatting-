import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  /* =========================================================
     STATE
  ========================================================= */
  users: [],
  selectedUser: null,
  messages: [],

  typingUsers: {},
  onlineUsers: {},
  lastSeenMap: {},

  isUsersLoading: false,
  isMessagesLoading: false,
  hasFetchedUsers: false,

  /* =========================================================
     USERS
  ========================================================= */
  getUsers: async (force = false) => {
    if (get().hasFetchedUsers && !force) return;

    set({ isUsersLoading: true });

    try {
      const res = await axiosInstance.get("/messages/users");

      set({
        users: Array.isArray(res.data?.data) ? res.data.data : [],
        hasFetchedUsers: true,
      });
    } catch (err) {
      console.error("❌ getUsers error", err);
      toast.error("Failed to load users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  /* =========================================================
     MESSAGES (SAFE AGAINST RACE CONDITIONS)
  ========================================================= */
  getMessages: async (userId) => {
  if (!userId) return;

  const requestForUser = String(userId);
  set({ isMessagesLoading: true });

  try {
    const res = await axiosInstance.get(`/messages/${userId}`);

    // ✅ SAFE ID COMPARISON
    if (String(get().selectedUser?._id) !== requestForUser) return;

    set({
      messages: Array.isArray(res.data?.data) ? res.data.data : [],
    });
  } catch (err) {
    console.error("❌ getMessages error", err);
  } finally {
    if (String(get().selectedUser?._id) === requestForUser) {
      set({ isMessagesLoading: false });
    }
  }
},


  clearMessages: () => {
    set({ messages: [] });
  },

  /* =========================================================
     SEND MESSAGE (OPTIMISTIC UI)
  ========================================================= */
  sendMessage: ({ text, image, audio }) => {
    const { selectedUser } = get();
    const { authUser, socket } = useAuthStore.getState();

    if (!selectedUser || !authUser || !socket) return;

    socket.emit("stopTyping", {
      to: selectedUser._id,
      from: authUser._id,
    });

    const tempId = `temp-${Date.now()}`;

    const optimisticMsg = {
      _id: tempId,
      senderId: authUser._id,
      receiverId: selectedUser._id,
      text,
      image,
      audio,
      createdAt: new Date().toISOString(),
      sending: true,
    };

    set((state) => ({
      messages: [...state.messages, optimisticMsg],
    }));

    socket.emit(
      "sendMessage",
      { receiverId: selectedUser._id, text, image, audio },
      ({ success, message }) => {
        if (!success) {
          set((state) => ({
            messages: state.messages.filter((m) => m._id !== tempId),
          }));
          toast.error("Message failed to send");
          return;
        }

        set((state) => ({
          messages: state.messages.map((m) =>
            m._id === tempId ? message : m
          ),
        }));
      }
    );
  },

  /* =========================================================
     USER SELECTION
  ========================================================= */
 setSelectedUser: (user) => {
  if (!user?._id) return;
  if (get().selectedUser?._id === user._id) return;

  set({
    selectedUser: { ...user },
    messages: [],
    typingUsers: {},
  });
},


  clearSelectedUser: () => {
    set({
      selectedUser: null,
      messages: [],
      typingUsers: {},
      isMessagesLoading: false,
    });
  },

  clearTyping: () => {
    set({ typingUsers: {} });
  },

  /* =========================================================
     SOCKET — RECEIVE MESSAGES
  ========================================================= */
  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newMessage");

    socket.on("newMessage", (msg) => {
      const selectedUserId = get().selectedUser?._id;
      if (!selectedUserId) return;

      const relevant =
        String(msg.senderId) === String(selectedUserId) ||
        String(msg.receiverId) === String(selectedUserId);

      if (!relevant) return;

      set((state) => {
        const exists = state.messages.some(
          (m) =>
            m._id === msg._id ||
            (m.sending &&
              m.text === msg.text &&
              String(m.senderId) === String(msg.senderId) &&
              Math.abs(
                new Date(m.createdAt) - new Date(msg.createdAt)
              ) < 3000)
        );

        if (exists) return state;

        return { messages: [...state.messages, msg] };
      });
    });
  },

  unsubscribeFromMessages: () => {
    useAuthStore.getState().socket?.off("newMessage");
  },

  /* =========================================================
     SOCKET — PRESENCE
  ========================================================= */
  subscribeToPresence: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("userStatus");
    socket.off("onlineUsers");

    socket.on("userStatus", ({ userId, status, lastSeen }) => {
      const uid = String(userId);

      set((state) => {
        const onlineUsers = { ...state.onlineUsers };
        const lastSeenMap = { ...state.lastSeenMap };

        if (status === "online") {
          onlineUsers[uid] = true;
          delete lastSeenMap[uid];
        } else {
          delete onlineUsers[uid];
          if (lastSeen) lastSeenMap[uid] = lastSeen;
        }

        return { onlineUsers, lastSeenMap };
      });
    });

    socket.on("onlineUsers", (users) => {
      const map = {};
      users.forEach((id) => (map[String(id)] = true));
      set({ onlineUsers: map });
    });
  },

  unsubscribeFromPresence: () => {
    const socket = useAuthStore.getState().socket;
    socket?.off("userStatus");
    socket?.off("onlineUsers");
  },

  /* =========================================================
     SOCKET — TYPING
  ========================================================= */
  subscribeToTyping: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("typing");
    socket.off("stopTyping");

    socket.on("typing", ({ from }) => {
      const selectedUserId = get().selectedUser?._id;
      if (!selectedUserId) return;
      if (String(from) !== String(selectedUserId)) return;

      set((state) => ({
        typingUsers: { ...state.typingUsers, [from]: true },
      }));
    });

    socket.on("stopTyping", ({ from }) => {
      set((state) => {
        const copy = { ...state.typingUsers };
        delete copy[from];
        return { typingUsers: copy };
      });
    });
  },

  unsubscribeFromTyping: () => {
    const socket = useAuthStore.getState().socket;
    socket?.off("typing");
    socket?.off("stopTyping");
  },

  /* =========================================================
     RESET
  ========================================================= */
  resetChat: () => {
    set({
      users: [],
      selectedUser: null,
      messages: [],
      typingUsers: {},
      onlineUsers: {},
      lastSeenMap: {},
      hasFetchedUsers: false,
      isUsersLoading: false,
      isMessagesLoading: false,
    });
  },
}));
