import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";
import { Send } from "lucide-react";
import { useParams } from "react-router-dom"; // Add this

const GroupChatPage = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const { groupId } = useParams(); // Add this

  const [user, setUser] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (groupId) setSelectedGroupId(groupId);
  }, [groupId]);

  // Fetch current user
  useEffect(() => {
    const initUser = async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error("Auth error:", authError);
        setError("User not authenticated");
      } else {
        setUser(user);
      }
    };
    initUser();
  }, []);

  // Fetch groups
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoadingGroups(true);

        // Step 1: Get current user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) throw userError || new Error("User not found");

        // Step 2: Get group memberships
        const { data: memberships, error: memberError } = await supabase
          .from("group_members")
          .select("group_id")
          .eq("user_id", user.id);

        if (memberError) throw memberError;

        const groupIds = memberships.map((m) => m.group_id);

        if (groupIds.length === 0) {
          setGroups([]);
          return;
        }

        // Step 3: Get group details from user_groups
        const { data: groupDetails, error: groupError } = await supabase
          .from("user_groups")
          .select("*")
          .in("id", groupIds);

        if (groupError) throw groupError;

        setGroups(groupDetails);

        // Step 4: Default select first group
        if (groupDetails.length > 0 && !selectedGroupId) {
          setSelectedGroupId(groupDetails[0].id);
        }
      } catch (err) {
        console.error("Error fetching groups:", err);
        setError(err.message);
      } finally {
        setLoadingGroups(false);
      }
    };

    fetchGroups();

    const setupSubscription = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const subscription = supabase
        .channel("group_members_changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "group_members",
            filter: `user_id=eq.${user?.id}`,
          },
          (payload) => {
            console.log("Group membership changed:", payload);
            fetchGroups();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    };

    setupSubscription();
  }, [selectedGroupId]);

  // Fetch messages for selected group
  useEffect(() => {
    if (!selectedGroupId || !user) return;

    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from("group_messages")
          .select(
            `
            id,
            content,
            created_at,
            sender_id,
            profiles:profiles (real_name)
          `
          )
          .eq("group_id", selectedGroupId)
          .order("created_at", { ascending: true });

        if (error) throw error;
        setMessages(data || []);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();

    const channel = supabase
      .channel("group_messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "group_messages",
          filter: `group_id=eq.${selectedGroupId}`,
        },
        async (payload) => {
          const { data, error } = await supabase
            .from("group_messages")
            .select(
              `
              id,
              content,
              created_at,
              sender_id,
              profiles:profiles (real_name)
            `
            )
            .eq("id", payload.new.id)
            .single();

          if (!error) setMessages((prev) => [...prev, data]);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [selectedGroupId, user]);

  // Send message function
  const sendMessage = async () => {
    if (!newMessage.trim() || !user?.id || loadingMessage) return;
    setLoadingMessage(true);
    try {
      // Insert the new message into the group_messages table
      const { error } = await supabase.from("group_messages").insert({
        group_id: selectedGroupId,
        sender_id: user.id,
        content: newMessage,
      });

      if (error) throw error;

      // Immediately update the messages UI to show the new message
      const newMessageData = {
        id: "temp-id", // A temporary ID for immediate display (supabase will assign a real ID)
        content: newMessage,
        created_at: new Date().toISOString(), // Use the current time
        sender_id: user.id,
        profiles: { real_name: user?.email || "Unknown" },
      };

      // Update state with the new message
      setMessages((prevMessages) => [...prevMessages, newMessageData]);

      setNewMessage("");
    } catch (error) {
      alert(`Failed to send message: ${error.message}`);
    } finally {
      setLoadingMessage(false);
    }
  };

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Left: Chat */}
      <div className="flex-1 flex flex-col border-r border-gray-800">
        {/* Chat Header */}
        <div className="p-5 border-b border-gray-800 bg-gradient-to-r from-gray-900 to-black shadow-sm">
          <h2 className="text-2xl font-bold text-purple-400">
            {groups.find((g) => g.id === selectedGroupId)?.name || "Group Chat"}
          </h2>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 bg-gradient-to-b from-black to-gray-900">
          {messages.map((msg) => {
            const isUser = msg.sender_id === user?.id;

            return (
              <div
                key={msg.id}
                className={`max-w-[75%] ${
                  isUser ? "ml-auto text-right" : "mr-auto text-left"
                }`}
              >
                {!isUser && (
                  <div className="text-xs text-purple-300 mb-1">
                    {msg.profiles?.real_name || "Unknown"}
                  </div>
                )}

                <div
                  className={`inline-block px-4 py-3 rounded-2xl shadow-md transition-all duration-300 ${
                    isUser
                      ? "bg-purple-600 text-white rounded-br-none"
                      : "bg-gray-800 text-gray-200 rounded-bl-none"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-gray-800 bg-gray-900">
          <div className="flex gap-3">
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type your message..."
              className="flex-1 bg-gray-800 text-white px-4 py-3 rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
              disabled={loadingMessage}
            />
            <button
              onClick={sendMessage}
              disabled={loadingMessage}
              className="bg-purple-600 hover:bg-purple-700 transition px-4 py-3 rounded-xl text-white disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Right: Group List */}
      <div className="w-[350px] bg-gray-950 border-l border-gray-800 overflow-y-auto p-6">
        <h2 className="text-xl font-bold text-purple-300 mb-6">Your Groups</h2>

        {loadingGroups ? (
          <p className="text-gray-400">Loading groups...</p>
        ) : groups.length === 0 ? (
          <div className="bg-gray-900 p-4 rounded-lg border border-gray-800 text-center">
            <p className="text-gray-400 mb-2">No groups joined yet.</p>
            <Link
              to="/group-creator"
              className="text-purple-400 hover:text-purple-300 underline"
            >
              Create or join one
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {groups.map((group) => (
              <li
                key={group.id}
                onClick={() => setSelectedGroupId(group.id)}
                className={`cursor-pointer p-4 rounded-xl border transition-all duration-300 ${
                  selectedGroupId === group.id
                    ? "border-purple-500 bg-gray-800 shadow-inner"
                    : "border-gray-800 hover:border-purple-400 hover:bg-gray-900"
                }`}
              >
                <h3 className="font-semibold text-white">{group.name}</h3>
                <p className="text-sm text-gray-400 truncate">
                  {group.description || "No description"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default GroupChatPage;
