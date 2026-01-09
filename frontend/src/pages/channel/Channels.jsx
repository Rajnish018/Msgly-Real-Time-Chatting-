import { Search, Plus, Image as ImageIcon, CheckCircle } from "lucide-react";

const channels = [
  {
    id: 1,
    name: "Anime In Hindi",
    avatar: "/anime.jpg",
    lastMessage: "Best of 2025 🔥",
    time: "17:37",
    unread: 1,
  },
  {
    id: 2,
    name: "Python Programming",
    avatar: "/python.png",
    lastMessage: "Python Basics Quiz Answers",
    time: "17:34",
    unread: 1,
    verified: true,
  },
  {
    id: 3,
    name: "Jivjaago Media",
    avatar: "/media.jpg",
    lastMessage: "Photo",
    time: "17:00",
    unread: 2,
    isPhoto: true,
  },
  {
    id: 4,
    name: "Data Science & Machine Learning",
    avatar: "/ds.png",
    lastMessage: "New year, new skills!",
    time: "16:05",
    unread: 1,
  },
  {
    id: 5,
    name: "Jobs & Internships Update",
    avatar: "/jobs.jpg",
    lastMessage: "Important Note For New Joiners",
    time: "Sunday",
  },
  {
    id: 6,
    name: "Hitesh Choudhary",
    avatar: "/hitesh.jpg",
    lastMessage: "Seems like we need to close EARLYBIRD",
    time: "28/11/2025",
  },
];

const Channels = () => {
  return (
    <div className="h-full bg-[#0b141a] text-white w-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4">
        <h1 className="text-xl font-semibold">Channels</h1>
        <button className="p-2 rounded-full hover:bg-white/10">
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Search */}
      <div className="px-4 mb-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
          <input
            placeholder="Search"
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#202c33] text-sm outline-none"
          />
        </div>
      </div>

      {/* Channel List */}
      <div className="flex-1 overflow-y-auto">
        {channels.map((c) => (
          <ChannelItem key={c.id} channel={c} />
        ))}

        {/* Footer section */}
        <div className="px-4 py-6 text-sm text-white/60">
          Find channels to follow
        </div>

        <FollowCard />
      </div>
    </div>
  );
};

/* ---------------- Components ---------------- */

const ChannelItem = ({ channel }) => (
  <button className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5">
    <img
      src={channel.avatar || "/avatar.png"}
      alt={channel.name}
      className="w-12 h-12 rounded-full object-cover"
    />

    <div className="flex-1 text-left min-w-0">
      <div className="flex items-center gap-1">
        <p className="font-medium truncate">{channel.name}</p>
        {channel.verified && (
          <CheckCircle className="w-4 h-4 text-blue-500" />
        )}
      </div>

      <div className="flex items-center gap-1 text-sm text-white/60 truncate">
        {channel.isPhoto && <ImageIcon className="w-4 h-4" />}
        <span className="truncate">{channel.lastMessage}</span>
      </div>
    </div>

    <div className="flex flex-col items-end gap-1">
      <span className="text-xs text-green-500">{channel.time}</span>
      {channel.unread && (
        <span className="min-w-[20px] h-5 px-1 rounded-full bg-green-500 text-black text-xs flex items-center justify-center">
          {channel.unread}
        </span>
      )}
    </div>
  </button>
);

const FollowCard = () => (
  <div className="px-4 py-4 flex items-center gap-3">
    <img
      src="/mi.png"
      className="w-12 h-12 rounded-full object-cover"
      alt="Mumbai Indians"
    />
    <div className="flex-1">
      <p className="font-medium">Mumbai Indians</p>
      <p className="text-sm text-white/60">64.8L followers</p>
    </div>
    <button className="px-4 py-1.5 rounded-full bg-green-600 text-black text-sm font-medium">
      Follow
    </button>
  </div>
);

export default Channels;
