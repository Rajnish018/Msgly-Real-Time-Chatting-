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

  typingUsers: {},          // { [userId]: true }
  onlineUsers: {},          // { [userId]: true }
  lastSeenMap: {},          // { [userId]: timestamp }

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
      console.error("getUsers error:", e);
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
  const { selectedUser, messages } = get();
  const authUser = useAuthStore.getState().authUser;

  if (!selectedUser || !authUser) return;

  // ===============================
  // 1️⃣ OPTIMISTIC MESSAGE
  // ===============================
  const optimisticMsg = {
    _id: "temp-" + Date.now(),
    senderId: authUser._id,
    receiverId: selectedUser._id,
    text: data.text || null,
    image: data.image || null,
    audio: data.audio || null,
    createdAt: new Date().toISOString(),
    isRead: false,
    sending: true, // 👈 for UI
  };

  // 🔥 INSTANT UI UPDATE (NO RELOAD)
  set({
    messages: [...messages, optimisticMsg],
  });

  try {
    // ===============================
    // 2️⃣ SEND TO BACKEND
    // ===============================
    await axiosInstance.post(
      `/messages/send/${selectedUser._id}`,
      data
    );
  } catch (error) {
    toast.error("Failed to send message");

    // ===============================
    // 3️⃣ ROLLBACK ON FAILURE
    // ===============================
    set({
      messages: get().messages.filter(
        (m) => m._id !== optimisticMsg._id
      ),
    });
  }
},

editMessage: async (messageId, text) => {
  try {
    await axiosInstance.patch(`/messages/${messageId}`, { text });

    set((state) => ({
      messages: state.messages.map((m) =>
        m._id === messageId ? { ...m, text, edited: true } : m
      ),
    }));
  } catch {
    toast.error("Edit failed");
  }
},

deleteMessage: async (messageId) => {
  try {
    await axiosInstance.delete(`/messages/${messageId}`);

    set((state) => ({
      messages: state.messages.filter((m) => m._id !== messageId),
    }));
  } catch {
    toast.error("Delete failed");
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
      const { selectedUser, messages } = get();

      const isCurrentChat =
        selectedUser &&
        (String(msg.senderId) === String(selectedUser._id) ||
         String(msg.receiverId) === String(selectedUser._id));

      // get().getUsers(true);

      if (!isCurrentChat) return;
      if (messages.some((m) => m._id === msg._id)) return;

      set({ messages: [...messages, msg] });
    });
  },

  unsubscribeFromMessages: () => {
    useAuthStore.getState().socket?.off("newMessage");
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
      const { selectedUser } = get();
      if (String(from) !== String(selectedUser?._id)) return;

      set((state) => ({
        typingUsers: {
          ...state.typingUsers,
          [from]: true,
        },
      }));
    });

    socket.on("stopTyping", ({ from }) => {
      set((state) => {
        const updated = { ...state.typingUsers };
        delete updated[from];
        return { typingUsers: updated };
      });
    });
  },

  unsubscribeFromTyping: () => {
    const socket = useAuthStore.getState().socket;
    socket?.off("typing");
    socket?.off("stopTyping");
  },

 /* =========================================================
   SOCKET — USER STATUS (ONLINE / LAST SEEN) ✅ FIXED
========================================================= */
subscribeToUserStatus: () => {
  const socket = useAuthStore.getState().socket;
  if (!socket) return;

  console.log("🟡 subscribeToUserStatus CALLED:", socket.id);

  // cleanup old listeners
  socket.off("onlineUsers");
  socket.off("userStatus");

  /* =====================================================
     1️⃣ SNAPSHOT — FULL ONLINE USERS LIST (CRITICAL)
  ===================================================== */
  socket.on("onlineUsers", (userIds) => {
    console.log("🟢 onlineUsers snapshot:", userIds);

    const onlineMap = {};
    userIds.forEach((id) => {
      onlineMap[String(id)] = true;
    });

    set({ onlineUsers: onlineMap });
  });

  /* =====================================================
     2️⃣ INCREMENTAL UPDATES
  ===================================================== */
  socket.on("userStatus", ({ userId, status, lastSeen }) => {
    console.log("🟣 userStatus received:", { userId, status, lastSeen });

    if (status === "online") {
      set((state) => ({
        onlineUsers: {
          ...state.onlineUsers,
          [String(userId)]: true,
        },
      }));
    } else {
      set((state) => {
        const online = { ...state.onlineUsers };
        delete online[String(userId)];

        return {
          onlineUsers: online,
          lastSeenMap: {
            ...state.lastSeenMap,
            [String(userId)]: lastSeen,
          },
        };
      });
    }
  });
},


  unsubscribeFromUserStatus: () => {
    useAuthStore.getState().socket?.off("userStatus");
  },

  /* =========================================================
     USER SELECTION
  ========================================================= */
  setSelectedUser: (user) => {
    set({
      selectedUser: user,
      messages: [],
      typingUsers: {},
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
      typingUsers: {},
      onlineUsers: {},
      lastSeenMap: {},
      hasFetchedUsers: false,
    }),
}));
