import { Search, ArrowLeft, Users, UserPlus, UsersRound } from "lucide-react";
import { useState, useEffect } from "react";
import { useChatStore } from "../../store/useChatStore";
import { axiosInstance } from "../../lib/axios";

const NewChatSidebar = ({ onBack }) => {
  const setSelectedUser = useChatStore((s) => s.setSelectedUser);

  const [email, setEmail] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  /* =========================================================
     DEBOUNCED SEARCH 
  ========================================================= */
  useEffect(() => {
  const trimmed = email.trim();

  if (!trimmed) {
    setLoading(false);
    setResult(null);
    setSearched(false);
    return;
  }

  // optional: minimum length
  if (trimmed.length < 3) {
    setLoading(false);
    setResult(null);
    setSearched(false);
    return;
  }

  setLoading(true);

  const timer = setTimeout(async () => {
    try {
      const res = await axiosInstance.get(
        `/auth/search?email=${trimmed}`
      );
      setResult(res.data);
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }, 600);

  return () => clearTimeout(timer);
}, [email]);

  const openChat = () => {
    // IMPORTANT: this does NOT create a chat
    setSelectedUser(result);
    onBack();
  };

  return (
    <div className="h-full flex flex-col bg-base-100">
      {/* Header */}
      <div className="p-4 flex items-center gap-3 border-b border-base-300">
        <button
          onClick={onBack}
          className="p-2 hover:bg-base-200 rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold">New chat</h2>
      </div>

      {/* Search by email */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/50" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email address"
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-base-200 focus:ring-2 focus:ring-primary/40 outline-none"
          />
        </div>
      </div>

      {/* Actions (UI only) */}
      <div className="px-2">
        <ActionItem icon={Users} label="New group" />
        <ActionItem icon={UserPlus} label="New contact" />
        <ActionItem icon={UsersRound} label="New community" />
      </div>

      <p className="px-4 mt-4 mb-2 text-xs text-base-content/60">
        Search result
      </p>

      {/* Result */}
      <div className="flex-1 overflow-y-auto px-2">
        {loading && (
          <p className="text-center mt-6 text-sm opacity-60">
            Searching…
          </p>
        )}

        {!loading && result && (
          <button
            onClick={openChat}
            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-base-200 rounded-lg"
          >
            <img
              src={result.profilePic || "/avatar.png"}
              className="w-11 h-11 rounded-full object-cover"
            />
            <div className="text-left">
              <p className="font-medium">{result.fullName}</p>
              <p className="text-xs text-base-content/60">
                {result.email}
              </p>
            </div>
          </button>
        )}

        {!loading && searched && !result && (
          <p className="text-center mt-6 text-sm opacity-60">
            User not registered
          </p>
        )}
      </div>
    </div>
  );
};

const ActionItem = ({ icon: Icon, label }) => (
  <button className="w-full px-4 py-3 flex items-center gap-4 hover:bg-base-200 rounded-lg">
    <div className="w-10 h-10 rounded-full bg-primary text-primary-content flex items-center justify-center">
      <Icon className="w-5 h-5" />
    </div>
    <span className="font-medium">{label}</span>
  </button>
);

export default NewChatSidebar;
