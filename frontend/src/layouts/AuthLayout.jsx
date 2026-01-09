import { Outlet, Navigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

const AuthLayout = () => {
  const { authUser } = useAuthStore();

  if (authUser) return <Navigate to="/" replace />;

  return (
    <main>
      <Outlet />
    </main>
  );
};

export default AuthLayout;
