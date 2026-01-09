import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import {
  MessageCircleMore,
  Settings,
  Users,
  Image,
} from "lucide-react";

const SidebarNavbar = () => {
  const { authUser } = useAuthStore();
  const location = useLocation();

  const topNavItems = [
    { path: "/", icon: MessageCircleMore, label: "Chats", hasDot: false },
    { path: "/communities", icon: Users, label: "Communities", hasDot: true },
  ];

  const bottomNavItems = [
    { path: "/media", icon: Image, label: "Media" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  const isActive = (path) =>
    location.pathname === path
      ? "bg-primary/10 text-primary"
      : "text-base-content hover:bg-base-200";

  return (
    <aside className="hidden md:flex fixed inset-y-0 left-0 w-16 bg-base-100 border-r border-base-300 flex-col items-center py-4 z-50">
      
      {/* Top */}
      <div className="flex flex-col items-center gap-2 flex-1">
        {topNavItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            title={item.label}
            className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition ${isActive(item.path)}`}
          >
            <item.icon className="w-5 h-5" />
            {item.hasDot && (
              <span className="absolute top-1 right-1 size-2 bg-primary rounded-full animate-pulse" />
            )}
          </Link>
        ))}
      </div>

      {/* Bottom */}
      <div className="flex flex-col items-center gap-2">
        {bottomNavItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            title={item.label}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${isActive(item.path)}`}
          >
            <item.icon className="w-5 h-5" />
          </Link>
        ))}

        {authUser && (
          <Link to="/profile" title="Profile" className="mt-2">
            <img
              src={authUser.profilePic || "/avatar.png"}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover border-2 border-base-300 hover:border-primary transition"
            />
          </Link>
        )}
      </div>
    </aside>
  );
};

export default SidebarNavbar;
