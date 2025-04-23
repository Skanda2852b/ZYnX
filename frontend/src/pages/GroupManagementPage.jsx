import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  User,
  UserPlus,
  UserMinus,
  UserCheck,
  UserX,
  MessageSquare,
  ChevronLeft,
  Users,
} from "lucide-react";

const GroupManagement = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        const { data: groupData } = await supabase
          .from("groups")
          .select("*")
          .eq("id", groupId)
          .single();

        const { data: membersData } = await supabase
          .from("group_members")
          .select("*, profiles(*)")
          .eq("group_id", groupId);

        const adminCheck = membersData.find(
          (m) => m.user_id === user.id && m.is_admin
        );

        setGroup(groupData);
        setMembers(membersData);
        setIsAdmin(!!adminCheck);
      } catch (error) {
        console.error("Error fetching group data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [groupId]);

  const addMember = async (userId) => {
    try {
      await supabase.from("group_members").insert({
        group_id: groupId,
        user_id: userId,
        is_admin: false,
      });
      // Refresh members list
      const { data } = await supabase
        .from("group_members")
        .select("*, profiles(*)")
        .eq("group_id", groupId);
      setMembers(data || []);
    } catch (error) {
      console.error("Error adding member:", error);
    }
  };

  const removeMember = async (userId) => {
    try {
      await supabase
        .from("group_members")
        .delete()
        .eq("group_id", groupId)
        .eq("user_id", userId);
      setMembers(members.filter((m) => m.user_id !== userId));
    } catch (error) {
      console.error("Error removing member:", error);
    }
  };

  const updateAdminStatus = async (userId, isAdmin) => {
    try {
      await supabase
        .from("group_members")
        .update({ is_admin: isAdmin })
        .eq("group_id", groupId)
        .eq("user_id", userId);
      setMembers(
        members.map((m) =>
          m.user_id === userId ? { ...m, is_admin: isAdmin } : m
        )
      );
    } catch (error) {
      console.error("Error updating admin status:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-8 flex justify-center items-center">
        <div className="animate-pulse text-lg text-purple-400">
          Loading group data...
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-black text-white p-8 flex flex-col justify-center items-center">
        <div className="text-xl text-red-400 mb-4">Group not found</div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-purple-400 hover:text-purple-300"
        >
          <ChevronLeft size={18} /> Go back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with back button and group info */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-gray-800 transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-white">
                {group.name}
              </h1>
              <p className="text-gray-400">{group.description}</p>
            </div>
          </div>

          <Link
            to={`/groups/${groupId}/chat`}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors"
          >
            <MessageSquare size={18} /> Group Chat
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Members List */}
          <div className="lg:col-span-2 bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Users size={20} /> Members ({members.length})
              </h2>
              {isAdmin && (
                <div className="relative w-1/2">
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search members..."
                    className="w-full bg-gray-800 px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              )}
            </div>

            <div className="space-y-3">
              {members
                .filter((member) =>
                  member.profiles.real_name
                    .toLowerCase()
                    .includes(searchInput.toLowerCase())
                )
                .map((member) => (
                  <div
                    key={member.id}
                    className={`p-4 rounded-lg flex justify-between items-center transition-colors ${
                      member.is_admin
                        ? "bg-purple-900/30 border border-purple-800/50"
                        : "bg-gray-800 hover:bg-gray-750"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-full ${
                          member.is_admin
                            ? "bg-purple-600/20 text-purple-300"
                            : "bg-gray-700 text-gray-300"
                        }`}
                      >
                        {member.is_admin ? (
                          <UserCheck size={18} />
                        ) : (
                          <User size={18} />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">
                          {member.profiles.real_name}
                        </div>
                        <div className="text-sm text-gray-400">
                          {member.is_admin ? "Admin" : "Member"}
                        </div>
                      </div>
                    </div>

                    {isAdmin && (
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            updateAdminStatus(member.user_id, !member.is_admin)
                          }
                          className={`p-2 rounded-full ${
                            member.is_admin
                              ? "text-yellow-400 hover:bg-yellow-900/20"
                              : "text-purple-400 hover:bg-purple-900/20"
                          }`}
                          title={
                            member.is_admin
                              ? "Demote to member"
                              : "Promote to admin"
                          }
                        >
                          {member.is_admin ? (
                            <UserX size={18} />
                          ) : (
                            <UserCheck size={18} />
                          )}
                        </button>
                        <button
                          onClick={() => removeMember(member.user_id)}
                          className="p-2 rounded-full text-red-400 hover:bg-red-900/20"
                          title="Remove member"
                        >
                          <UserMinus size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>

          {/* Admin Panel */}
          {isAdmin && (
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <UserPlus size={20} /> Add Members
              </h2>

              <div className="space-y-4">
                <div className="bg-gray-800 p-4 rounded-lg border border-dashed border-gray-700">
                  <p className="text-gray-400 mb-3">Invite via link:</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={`${window.location.origin}/groups/${groupId}/join`}
                      readOnly
                      className="flex-1 bg-gray-700 px-3 py-2 rounded text-sm truncate"
                    />
                    <button
                      onClick={() =>
                        navigator.clipboard.writeText(
                          `${window.location.origin}/groups/${groupId}/join`
                        )
                      }
                      className="bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded text-sm"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div className="bg-gray-800 p-4 rounded-lg">
                  <p className="text-gray-400 mb-3">Search users to add:</p>
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    className="w-full bg-gray-700 px-4 py-2 rounded-lg mb-3"
                  />
                  <div className="space-y-2">
                    {/* Sample - in real app you would map through search results */}
                    <div className="flex justify-between items-center p-2 hover:bg-gray-700 rounded">
                      <div>Jane Doe</div>
                      <button
                        onClick={() => addMember("user-id-here")}
                        className="text-purple-400 hover:text-purple-300 text-sm"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Group Settings</h3>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-400">Public Group</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupManagement;
