import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";

const GroupList = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current user
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) throw authError;
        if (!user) throw new Error("User not authenticated");

        // Fetch groups where user is a member
        const { data, error: queryError } = await supabase
          .from("group_members")
          .select(
            `
            groups (
              id,
              name,
              description,
              created_at,
              updated_at
            )
          `
          )
          .eq("user_id", user.id);

        if (queryError) throw queryError;

        // Extract groups from the response
        const userGroups = data.map((item) => item.groups).filter(Boolean);
        setGroups(userGroups);
      } catch (err) {
        console.error("Error fetching groups:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();

    // Set up realtime subscription
    const subscription = supabase
      .channel("group_members_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "group_members",
          filter: `user_id=eq.${supabase.auth.getUser().data.user?.id}`,
        },
        (payload) => {
          console.log("Change received:", payload);
          fetchGroups(); // Refresh groups when changes occur
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-8">Your Groups</h1>
          <div className="text-gray-400">Loading your groups...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-8">Your Groups</h1>
          <div className="text-red-400">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-8">Your Groups</h1>

        {groups.length === 0 ? (
          <div className="bg-gray-900 p-8 rounded-xl border border-gray-800 text-center">
            <p className="text-gray-400 mb-4">
              You're not a member of any groups yet.
            </p>
            <Link
              to="/groups/create"
              className="text-purple-400 hover:text-purple-300 underline"
            >
              Create or join a group
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <div
                key={group.id}
                className="bg-gray-900 p-6 rounded-xl border border-gray-800 hover:border-purple-500/50 transition-colors"
              >
                <h2 className="text-xl font-semibold mb-2">{group.name}</h2>
                <p className="text-gray-400 mb-4">
                  {group.description || "No description"}
                </p>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Created: {new Date(group.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex gap-3">
                    <Link
                      to={`/groups/${group.id}`}
                      className="text-purple-400 hover:text-purple-300 text-sm"
                    >
                      View
                    </Link>
                    <Link
                      to={`/groups/${group.id}/chat`}
                      className="text-purple-400 hover:text-purple-300 text-sm"
                    >
                      Chat
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupList;
