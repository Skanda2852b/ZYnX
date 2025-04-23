import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Plus, Minus, Save } from "lucide-react";

const GroupCreator = () => {
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [members, setMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAcceptedMembers = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data } = await supabase
        .from("team_requests")
        .select("sender: sender_id(*), receiver: receiver_id(*)")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .eq("status", "accepted");

      const uniqueMembers = [
        ...new Map(
          data
            ?.flatMap((req) => [
              req.sender?.id ? [req.sender.id, req.sender] : null,
              req.receiver?.id ? [req.receiver.id, req.receiver] : null,
            ])
            .filter(Boolean)
        ).values(),
      ].filter((m) => m.id !== user?.id);

      setMembers(uniqueMembers);
      setLoading(false);
    };

    fetchAcceptedMembers();
  }, []);

  const toggleMember = (memberId) => {
    setSelectedMembers((prev) => {
      if (prev.includes(memberId)) {
        return prev.filter((id) => id !== memberId);
      } else if (prev.length < 4) {
        return [...prev, memberId];
      }
      return prev;
    });
  };

  const createGroup = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (selectedMembers.length > 4) {
        throw new Error("Maximum 4 members allowed plus admin");
      }

      const { data: group, error } = await supabase
        .from("user_groups")
        .insert({
          name: groupName,
          description,
          admin_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      if (!group) throw new Error("Failed to create group");

      const membersToInsert = [
        { user_id: user.id, group_id: group.id, is_admin: true },
        ...selectedMembers.map((memberId) => ({
          user_id: memberId,
          group_id: group.id,
          is_admin: false,
        })),
      ];

      const { error: memberError, count } = await supabase
        .from("group_members")
        .insert(membersToInsert, { count: "exact" });

      if (memberError) throw memberError;
      if (count !== membersToInsert.length) {
        throw new Error("Failed to add some members");
      }

      window.location.href = `/groups/${group.id}`;
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 bg-gray-950 rounded-2xl shadow-xl">
      <h2 className="text-3xl font-bold text-purple-400 mb-8 text-center">
        Create a New Group
      </h2>

      <div className="space-y-6">
        <input
          type="text"
          placeholder="Group Name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="w-full p-4 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <textarea
          placeholder="Group Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-4 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <div>
          <h3 className="text-xl font-semibold text-white mb-4">
            Add Members <span className="text-sm text-gray-400">(max 4)</span>
          </h3>

          {loading ? (
            <p className="text-gray-400">Loading accepted members...</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 bg-gray-900 border border-gray-800 rounded-xl transition hover:shadow-lg"
                >
                  <div>
                    <p className="text-white font-medium">{member.real_name}</p>
                    {member.skills?.length > 0 && (
                      <p className="text-sm text-gray-400 mt-1">
                        {member.skills.join(", ")}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => toggleMember(member.id)}
                    className={`p-2 rounded-full transition ${
                      selectedMembers.includes(member.id)
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-purple-600 hover:bg-purple-700"
                    }`}
                  >
                    {selectedMembers.includes(member.id) ? (
                      <Minus size={20} className="text-white" />
                    ) : (
                      <Plus size={20} className="text-white" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="text-red-400 bg-red-900/20 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button
          onClick={createGroup}
          disabled={!groupName || selectedMembers.length === 0}
          className="flex items-center justify-center w-full gap-2 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={18} />
          Create Group
        </button>
      </div>
    </div>
  );
};

export default GroupCreator;
