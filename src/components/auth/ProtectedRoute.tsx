import { Navigate, useLocation } from "react-router-dom";
import { useAuth, AppRole } from "@/hooks/use-auth";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  allow?: AppRole[]; // if omitted, any authenticated user
}

export default function ProtectedRoute({ children, allow }: Props) {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Memuat...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allow && (!role || !allow.includes(role))) {
    return <Navigate to="/mode-select" replace />;
  }

  return <>{children}</>;
}
