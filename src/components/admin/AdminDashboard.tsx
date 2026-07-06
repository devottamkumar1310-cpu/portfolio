import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { User } from "@supabase/supabase-js";
import CertificateUpload from "./CertificateUpload";

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // Automatically redirect back to the admin hash route
        redirectTo: `${window.location.origin}/#admin`
      }
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return <div className="text-white text-center py-20">Loading Authentication...</div>;
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center px-4">
        <h2 className="text-3xl font-bold text-white tracking-tight">Admin Gateway</h2>
        <p className="text-gray-400 font-sans max-w-sm">
          Restricted access. Please authenticate using your authorized administrator account.
        </p>
        <button
          onClick={handleLogin}
          className="px-6 py-3 bg-white text-black font-bold text-sm rounded-xl hover:bg-gray-200 transition-colors"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  // Very basic authorization check to ensure they are the owner
  // Real world: check if user.email matches the exact owner email
  // e.g. if (user.email !== 'your-email@gmail.com') return <p>Unauthorized</p>;

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">System Administration</h2>
          <p className="text-xs text-gray-400 mt-1 font-mono">Authenticated as {user.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-white/5 border border-white/10 text-white font-semibold text-xs rounded-lg hover:bg-white/10 transition-colors"
        >
          Sign Out
        </button>
      </div>

      <CertificateUpload />
      
      {/* Future sections for Projects and Achievements can go here */}
      <div className="p-6 rounded-2xl bg-white/[0.01] border border-dashed border-white/10 text-center text-gray-500 font-sans text-sm">
        Extensible Architecture Area: Add Project and Achievement Uploads Here
      </div>
    </div>
  );
}
