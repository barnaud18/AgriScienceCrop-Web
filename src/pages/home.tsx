import { useAuth } from "@/hooks/use-auth";
import Dashboard from "./dashboard";

export default function Home() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Dashboard />;
  }

  return <Dashboard />; // This will be handled by the router in App.tsx
}
