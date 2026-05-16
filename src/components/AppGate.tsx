"use client";

import { useUser } from "./UserContext";
import ProfileSelector from "./ProfileSelector";

export default function AppGate({ children }: { children: React.ReactNode }) {
  const { currentUser, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="fixed inset-0 bg-surface-white flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentUser) {
    return <ProfileSelector />;
  }

  return <>{children}</>;
}
