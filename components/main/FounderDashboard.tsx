"use client";

import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

const FounderDashboard = ({ user }) => {
  const router = useRouter();

  const handleLogout = async () => {
    if (!auth) {
      console.error("Firebase auth is not initialized.");
      return;
    }
    await signOut(auth);
    router.push('/'); // Redirect to homepage after logout
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Welcome, Founder!</h1>
      <p>Email: {user ? user.email : 'Loading...'}</p>
      <Button onClick={handleLogout} className="mt-4">
        Log Out
      </Button>
    </div>
  );
};

export default FounderDashboard;
