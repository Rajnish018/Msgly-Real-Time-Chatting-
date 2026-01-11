import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

export const useAuthStore = create((set, get) => ({
  authUser: null,
  token: null,                 
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  /* ======================
     CHECK AUTH (ON LOAD)
  ====================== */
  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
    } catch {
      set({ authUser: null, token: null });
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

      set({
        authUser: res.data,
        token: res.data.token, 
      });

      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
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

      set({
        authUser: res.data,
        token: res.data.token,
      });

      toast.success("Logged in successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
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
      token: null,
      onlineUsers: [],
      socket: null,
      isCheckingAuth: false,
    });

    toast.success("Logged out successfully");
  },

  /* ======================
     UPDATE PROFILE
  ====================== */
  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  /* ======================
     SOCKET LOGIC (JWT AUTH)
  ====================== */
  connectSocket: () => {
    const { authUser, token, socket } = get();
    if (!authUser || !token || socket?.connected) return;

    const newSocket = io(SOCKET_URL, {
      auth: { token },              
      transports: ["websocket"],   
    });

    newSocket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });

    set({ socket: newSocket });
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) socket.disconnect();
  },
}));
