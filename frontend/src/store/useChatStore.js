import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  /* =========================================================
     STATE
  ========================================================= */
  users: [],
  messages: [],
  selectedUser: null,

  typingUser: null, // ✅ REQUIRED

  isUsersLoading: false,
  isMessagesLoading: false,
  hasFetchedUsers: false,

  /* =========================================================
     SIDEBAR USERS
  ========================================================= */
  getUsers: async (force = false) => {
    if (get().hasFetchedUsers && !force) return;

    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data, hasFetchedUsers: true });
    } catch (e) {
      console.log("Error",e)
      toast.error("Failed to load chats");
      set({ hasFetchedUsers: true });
    } finally {
      set({ isUsersLoading: false });
    }
  },

  /* =========================================================
     MESSAGES
  ========================================================= */
  getMessages: async (userId) => {
    if (!userId) return;

    set({ isMessagesLoading: true, messages: [] });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch {
      toast.error("Failed to load messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (data) => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        data
      );

      set((state) => ({
        messages: [...state.messages, res.data],
      }));

      get().getUsers(true);
    } catch {
      toast.error("Failed to send message");
    }
  },

  /* =========================================================
     SOCKET — MESSAGES
  ========================================================= */
  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newMessage");

    socket.on("newMessage", (msg) => {
      const { selectedUser } = get();

      if (
        selectedUser &&
        (msg.senderId === selectedUser._id ||
          msg.receiverId === selectedUser._id)
      ) {
        set((state) => ({
          messages: [...state.messages, msg],
        }));
      }

      get().getUsers(true);
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket?.off("newMessage");
  },

  /* =========================================================
     SOCKET — TYPING (🔥 FIX)
  ========================================================= */
  subscribeToTyping: () => {
  const socket = useAuthStore.getState().socket;
  if (!socket) return;

  socket.off("typing");
  socket.off("stopTyping");

  socket.on("typing", ({ from }) => {
    const { selectedUser } = get();

    // ✅ show typing only for active chat
    if (String(from) === String(selectedUser?._id)) {
      console.log("👀 typing from", from);
      set({ typingUser: from });
    }
  });

  socket.on("stopTyping", ({ from }) => {
    const { selectedUser } = get();

    // ✅ clear only if same chat
    if (String(from) === String(selectedUser?._id)) {
      set({ typingUser: null });
    }
  });
},


  unsubscribeFromTyping: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("typing");
    socket.off("stopTyping");
  },

  /* =========================================================
     USER SELECTION
  ========================================================= */
  setSelectedUser: (user) => {
    set({
      selectedUser: user,
      messages: [],
      typingUser: null, // ✅ reset
      isMessagesLoading: true,
    });

    if (user?._id) {
      get().getMessages(user._id);
    }
  },

  /* =========================================================
     RESET
  ========================================================= */
  resetChat: () =>
    set({
      users: [],
      messages: [],
      selectedUser: null,
      typingUser: null,
      hasFetchedUsers: false,
    }),
}));
