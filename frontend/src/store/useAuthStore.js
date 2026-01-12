import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

export const useAuthStore = create((set, get) => ({
  /* ======================
     STATE
  ====================== */
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,

  onlineUsers: {}, // 🔥 { [userId]: true }

  socket: null,
  socketConnecting: false,
  isSocketConnected: false,

  /* ======================
     CHECK AUTH
  ====================== */
  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();
    } catch {
      set({ authUser: null });
      get().disconnectSocket();
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  /* ======================
     SIGNUP / LOGIN
  ====================== */
  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created");
      get().connectSocket();
    } catch (e) {
      toast.error(e.response?.data?.message || "Signup failed");
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in");
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

    get().disconnectSocket();

    set({
      authUser: null,
      onlineUsers: {},
      socket: null,
      isSocketConnected: false,
    });

    toast.success("Logged out");
  },

  /* ======================
     SOCKET CONNECT (FINAL)
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
      // console.log("🟢 SOCKET CONNECTED:", socket.id);

      set({
        socket,
        isSocketConnected: true,
        socketConnecting: false,
      });
    });

    /* FULL SNAPSHOT (CRITICAL FIX) */
    socket.on("onlineUsers", (users) => {
      const map = {};
      users.forEach((id) => {
        map[String(id)] = true;
      });

      console.log("📡 ONLINE SNAPSHOT:", map);
      set({ onlineUsers: map });
    });

    /* 🔥 REALTIME PRESENCE */
    socket.on("userStatus", ({ userId, status }) => {
      set((state) => {
        const online = { ...state.onlineUsers };

        if (status === "online") {
          online[String(userId)] = true;
        } else {
          delete online[String(userId)];
        }

        return { onlineUsers: online };
      });
    });

    socket.on("disconnect", () => {
      console.log(" SOCKET DISCONNECTED");
      set({
        socket: null,
        isSocketConnected: false,
      });
    });

    socket.on("connect_error", (err) => {
      console.error("SOCKET ERROR:", err.message);
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
