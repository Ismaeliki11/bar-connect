"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type User = "Clemen" | "Isabel" | null;

interface UserContextType {
  currentUser: User;
  login: (user: User) => void;
  logout: () => void;
  isLoaded: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("barconnect_user") as User;
    setTimeout(() => {
      if (savedUser === "Clemen" || savedUser === "Isabel") {
        setCurrentUser(savedUser);
      }
      setIsLoaded(true);
    }, 0);
  }, []);

  const login = (user: User) => {
    if (user) {
      setCurrentUser(user);
      localStorage.setItem("barconnect_user", user);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("barconnect_user");
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
