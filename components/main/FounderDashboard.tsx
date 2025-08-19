"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const FounderDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#0D1B2A] text-white p-8">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Founder Dashboard</h1>
            <Button onClick={logout} variant="outline" className="text-white border-white hover:bg-white hover:text-black">
                Log Out
            </Button>
        </div>
        <p className="text-lg">Welcome, <span className="font-semibold text-[#3BB273]">{user ? user.email : 'Founder'}</span>!</p>
      </div>
    </div>
  );
};

export default FounderDashboard;
