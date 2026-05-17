"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

type User = "Clemen" | "Isabel" | null;

interface UserContextType {
  currentUser: User;
  login: (user: User, redirect?: boolean) => void;
  logout: () => void;
  isLoaded: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const parts = pathname.split("/");
    const firstSegment = parts[1]?.toLowerCase();
    
    let activeUser: User = null;
    
    if (firstSegment === "clemen" || firstSegment === "isabel") {
      activeUser = firstSegment === "clemen" ? "Clemen" : "Isabel";
    } else {
      const savedUser = localStorage.getItem("barconnect_user") as User;
      if (savedUser === "Clemen" || savedUser === "Isabel") {
        activeUser = savedUser;
      }
    }
    
    setCurrentUser(activeUser);
    
    if (activeUser) {
      localStorage.setItem("barconnect_user", activeUser);
      // Auto-redirect to worker subpath if they land on the root page
      if (pathname === "/") {
        router.replace(`/${activeUser.toLowerCase()}`);
      }
    }
    
    setIsLoaded(true);
  }, [pathname, router]);

  const login = (user: User, redirect = true) => {
    if (user) {
      setCurrentUser(user);
      localStorage.setItem("barconnect_user", user);
      if (redirect) {
        router.push(`/${user.toLowerCase()}`);
      }
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("barconnect_user");
    router.push("/");
  };

  return (
    <UserContext.Provider value={{ currentUser, login, logout, isLoaded }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

