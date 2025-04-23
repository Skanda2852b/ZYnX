import {
  Globe,
  Home,
  User,
  Bell,
  CheckCircle,
  XCircle,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const Navbar = () => {
  const navigate = useNavigate();
  const [showSidebar, setShowSidebar] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) throw authError;
        if (!user) {
          setRequests([]);
          return;
        }

        const { data, error } = await supabase
          .from("team_requests")
          .select(
            `
      *,
      sender: sender_id (*),
      receiver: receiver_id (*)
    `
          )
          .eq("receiver_id", user.id)
          .eq("status", "pending")
          .order("created_at", { ascending: false });

        // Changed queryError to error
        if (error) throw error;

        // Add fallback for null data
        setRequests(data || []);
        setError(null);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();

    // Realtime subscription
    const channel = supabase
      .channel("team-requests-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "team_requests",
          filter: `receiver_id=eq.${supabase.auth.getUser()?.id}`, // Dynamic filter
        },
        (payload) => {
          console.log("Change received:", payload);
          fetchRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleResponse = async (requestId, accepted) => {
    try {
      const { error } = await supabase
        .from("team_requests")
        .update({
          status: accepted ? "accepted" : "declined",
          responded_at: new Date().toISOString(),
        })
        .eq("id", requestId);

      if (error) throw error;

      if (accepted) {
        // Add to team members
        const request = requests.find((r) => r.id === requestId);
        await supabase.from("team_members").insert({
          hackathon_id: request.hackathon_id,
          user1_id: request.sender_id,
          user2_id: request.receiver_id,
        });
      }

      // Optimistic UI update
      setRequests((prev) => prev.filter((req) => req.id !== requestId));
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update request: " + err.message);
    }
  };

  // Utility function to format dates
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <>
      {/* Navbar */}
      <nav className="p-4 bg-black border-b border-purple-900 shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-purple-400 flex items-center gap-2">
            <Globe className="text-purple-400" />
            Zynx
          </h1>

          <div className="flex space-x-6 text-sm font-medium">
            <button
              onClick={() => navigate("/home")}
              className="text-white hover:text-purple-300 flex items-center gap-1 transition"
            >
              <Home size={18} /> Home
            </button>

            <button
              onClick={() => navigate("/groups")}
              className="text-white hover:text-purple-300 flex items-center gap-1 transition"
            >
              <Users size={18} /> Groups
            </button>

            <button
              onClick={() => navigate("/profile")}
              className="text-white hover:text-purple-300 flex items-center gap-1 transition"
            >
              <User size={18} /> Profile
            </button>

            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="relative text-purple-400 hover:text-purple-300 transition"
            >
              <Bell size={18} />
              {requests.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  {requests.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-screen w-80 bg-gradient-to-br from-gray-900 to-black/80 backdrop-blur-xl border-l border-purple-900 shadow-xl z-50 p-5 transition-transform duration-300 ${
          showSidebar ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-purple-300 tracking-wide">
            Team Requests
          </h2>
          <button
            onClick={() => setShowSidebar(false)}
            className="text-gray-400 hover:text-white text-xl"
          >
            &times;
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-100px)] pr-1">
          {loading ? (
            <div className="text-center py-4 text-gray-400 animate-pulse">
              Loading requests...
            </div>
          ) : error ? (
            <div className="text-center py-4 text-red-400">Error: {error}</div>
          ) : (
            <>
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="bg-gray-800/70 p-4 rounded-xl shadow hover:shadow-purple-700/30 transition"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium text-purple-300">
                        {request.sender?.real_name || "Anonymous"}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {request.sender?.skills?.join(", ") ||
                          "No skills listed"}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {formatDate(request.created_at)}
                    </span>
                  </div>

                  <p className="text-gray-300 text-sm mb-3 italic">
                    “{request.message}”
                  </p>

                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => handleResponse(request.id, false)}
                      className="px-3 py-1 rounded-lg text-sm bg-red-600/20 hover:bg-red-600/40 text-red-400 flex items-center gap-1 transition"
                    >
                      <XCircle size={16} /> Decline
                    </button>
                    <button
                      onClick={() => handleResponse(request.id, true)}
                      className="px-3 py-1 rounded-lg text-sm bg-green-600/20 hover:bg-green-600/40 text-green-400 flex items-center gap-1 transition"
                    >
                      <CheckCircle size={16} /> Accept
                    </button>
                  </div>
                </div>
              ))}

              {requests.length === 0 && (
                <div className="bg-gray-800/50 p-4 rounded-xl text-gray-400 border border-gray-700">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium text-purple-300">
                        Sample User
                      </h3>
                      <p className="text-sm text-gray-400">
                        React, Node.js, Database
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDate(new Date())}
                    </span>
                  </div>

                  <p className="text-sm text-gray-300 mb-3">
                    “Looking to collaborate on an awesome project!”
                  </p>

                  <div className="flex gap-2 justify-end">
                    <button
                      disabled
                      className="px-3 py-1 rounded-lg bg-red-600/20 text-red-400/50 cursor-not-allowed flex items-center gap-1"
                    >
                      <XCircle size={16} /> Decline
                    </button>
                    <button
                      disabled
                      className="px-3 py-1 rounded-lg bg-green-600/20 text-green-400/50 cursor-not-allowed flex items-center gap-1"
                    >
                      <CheckCircle size={16} /> Accept
                    </button>
                  </div>
                  <div className="text-center mt-2 text-xs text-gray-600">
                    Sample Request (Disabled)
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
