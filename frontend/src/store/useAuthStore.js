import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { useChatStore } from "./useChatStore";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

export const useAuthStore = create((set, get) => ({
  /* ======================
     STATE
  ====================== */
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isCheckingAuth: true,

  socket: null,
  socketConnecting: false,
  isSocketConnected: false,

  onlineUsers: {},

  /* ======================
     AUTH CHECK
  ====================== */
  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");

      set({ authUser: res.data.data });
      console.log("✅ Authenticated as", res.data.data);

      // 🔥 ensure clean chat state on fresh session
      useChatStore.getState().resetChat();

      get().connectSocket();
    } catch {
      set({ authUser: null });

      // 🔥 reset chat if auth fails
      useChatStore.getState().resetChat();

      get().disconnectSocket();
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  /* ======================
     SIGNUP
  ====================== */
  signup: async (data) => {
    set({ isSigningUp: true });

    try {
      const res = await axiosInstance.post("/auth/signup", data);

      set({ authUser: res.data });
      toast.success("Account created");

      // 🔥 fresh chat state
      useChatStore.getState().resetChat();

      get().connectSocket();
    } catch (e) {
      toast.error(e.response?.data?.message || "Signup failed");
    } finally {
      set({ isSigningUp: false });
    }
  },

  /* ======================
     LOGIN
  ====================== */
  login: async (data) => {
    set({ isLoggingIn: true });

    try {
      const res = await axiosInstance.post("/auth/login", data);

      set({ authUser: res.data });
      toast.success("Logged in");

      // 🔥 VERY IMPORTANT: reset chat on login
      useChatStore.getState().resetChat();

      get().connectSocket();
    } catch (e) {
      toast.error(e.response?.data?.message || "Login failed");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  /* ======================
     LOGOUT
  ====================== */
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
    } catch {}

    // 🔌 disconnect socket
    get().disconnectSocket();

    // 🔥 clear ALL chat state
    useChatStore.getState().resetChat();

    // 🔐 clear auth state
    set({
      authUser: null,
      onlineUsers: {},
      socket: null,
      isSocketConnected: false,
    });

    toast.success("Logged out");
  },

  /* ======================
     SOCKET CONNECT
  ====================== */
  connectSocket: () => {
    const { authUser, socketConnecting, isSocketConnected } = get();
    if (!authUser || socketConnecting || isSocketConnected) return;

    set({ socketConnecting: true });

    const socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      set({
        socket,
        isSocketConnected: true,
        socketConnecting: false,
      });
    });

    socket.on("onlineUsers", (users) => {
      const map = {};
      users.forEach((id) => (map[String(id)] = true));
      set({ onlineUsers: map });
    });

    socket.on("userStatus", ({ userId, status }) => {
      set((state) => {
        const online = { ...state.onlineUsers };
        if (status === "online") online[String(userId)] = true;
        else delete online[String(userId)];
        return { onlineUsers: online };
      });
    });

    socket.on("disconnect", () => {
      set({
        socket: null,
        isSocketConnected: false,
      });
    });

    socket.on("connect_error", () => {
      set({ socketConnecting: false });
    });
  },

  /* ======================
     SOCKET DISCONNECT
  ====================== */
  disconnectSocket: () => {
    const socket = get().socket;

    if (socket) {
      socket.off();
      socket.disconnect();
    }

    set({
      socket: null,
      onlineUsers: {},
      isSocketConnected: false,
      socketConnecting: false,
    });
  },
}));
