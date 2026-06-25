"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { LogOut, User as UserIcon } from "lucide-react";
import Image from "next/image";

export function AuthButton() {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  const user = session?.user;

  const handleLogin = () => {
    signIn("google");
  };

  const handleLogout = () => {
    signOut();
  };

  if (isLoading) {
    return <div className="w-24 h-9 bg-slate-200 animate-pulse rounded-full"></div>;
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/50 border border-slate-200 rounded-full shadow-sm">
          {user.image ? (
            <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
              <img 
                src={user.image} 
                alt="Avatar" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <UserIcon className="w-3 h-3" />
            </div>
          )}
          <span className="text-sm font-medium text-slate-700 hidden sm:block">
            {user.name?.split(" ")[0] || "User"}
          </span>
          <button 
            onClick={handleLogout}
            className="ml-2 p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <button 
      onClick={handleLogin}
      className="px-4 py-2 bg-[#1E1B4B] hover:bg-indigo-900 text-white text-sm font-medium rounded-full shadow-sm hover:shadow transition-all duration-200 flex items-center gap-2"
    >
      <svg viewBox="0 0 24 24" className="w-4 h-4 bg-white rounded-full p-0.5">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
      Login
    </button>
  );
}
