import {
  Search,
  ArrowLeft,
  Users,
  Megaphone,
  FileText,
} from "lucide-react";

const communities = [
  {
    id: 1,
    name: "UNIFIED INTERNA DPV 002",
    announcement: "Piyush: 🔴 Final Seat Alert 🔴 Today is...",
    time: "10:57",
    type: "alert",
  },
  {
    id: 2,
    name: "Banking Wallah DAILY 3",
    announcement: "IE-Delhi 07-01.pdf • 20 pages",
    time: "10:18",
    type: "file",
  },
  {
    id: 3,
    name: "UMAM INTERNSHIP #004JN",
  },
];

const CommunitiesSidebar = ({ onBack }) => {
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
        <h2 className="text-lg font-semibold">Communities</h2>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/50" />
          <input
            placeholder="Search communities"
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-base-200 focus:ring-2 focus:ring-primary/40 outline-none"
          />
        </div>
      </div>

      {/* New Community */}
      <div className="px-2">
        <ActionItem icon={Users} label="New community" />
      </div>

      {/* Community List */}
      <div className="flex-1 overflow-y-auto mt-2">
        {communities.map((c) => (
          <CommunityCard key={c.id} community={c} />
        ))}
      </div>
    </div>
  );
};

/* ---------------- Components ---------------- */

const ActionItem = ({ icon: Icon, label }) => (
  <button className="w-full px-4 py-3 flex items-center gap-4 hover:bg-base-200 rounded-lg">
    <div className="w-10 h-10 rounded-xl bg-primary text-primary-content flex items-center justify-center">
      <Icon className="w-5 h-5" />
    </div>
    <span className="font-medium">{label}</span>
  </button>
);

const CommunityCard = ({ community }) => (
  <div className="mt-4">
    {/* Community Header */}
    <div className="px-4 py-3 flex items-center gap-3">
      <div className="w-11 h-11 rounded-xl bg-base-300 flex items-center justify-center">
        <Users className="w-5 h-5 opacity-60" />
      </div>
      <span className="font-medium">{community.name}</span>
    </div>

    {/* Announcement */}
    {community.announcement && (
      <>
        <div className="px-6 py-2 flex items-start gap-3 text-sm text-base-content/70">
          {community.type === "file" ? (
            <FileText className="w-4 h-4 text-primary mt-1" />
          ) : (
            <Megaphone className="w-4 h-4 text-primary mt-1" />
          )}

          <p className="flex-1 truncate">
            {community.announcement}
          </p>

          <span className="text-xs text-primary">
            {community.time}
          </span>
        </div>

        <button className="px-6 pb-2 text-primary text-sm hover:underline">
          View all
        </button>
      </>
    )}

    <div className="h-px bg-base-300 mx-4" />
  </div>
);

export default CommunitiesSidebar;
