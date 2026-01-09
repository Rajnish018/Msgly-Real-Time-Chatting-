import { Outlet } from "react-router-dom";
import SidebarNavbar from "../components/SidebarNavbar";

const AppLayout = () => {
  return (
    <div className="h-screen flex bg-base-100">
      {/* Sidebar */}
      <SidebarNavbar />

      {/* Content Area */}
      <main className="flex-1 h-full md:pl-16 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
