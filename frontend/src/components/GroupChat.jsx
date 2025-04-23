import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import { Send } from "lucide-react";

const GroupChat = ({ groupId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch messages with proper error handling
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
        .eq("group_id", groupId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
      alert("Failed to load messages");
    }
  };

  useEffect(() => {
    const initializeChat = async () => {
      // Get authenticated user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error("Authentication error:", authError);
        return;
      }
      setUser(user);

      // Load initial messages
      await fetchMessages();

      // Setup real-time updates
      const channel = supabase
        .channel("group_messages")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "group_messages",
            filter: `group_id=eq.${groupId}`,
          },
          async (payload) => {
            // Get full message data with profile
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
    };

    initializeChat();
  }, [groupId]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user?.id || loading) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("group_messages").insert({
        group_id: groupId,
        sender_id: user.id,
        content: newMessage,
      });

      if (error) throw error;
      setNewMessage("");
    } catch (error) {
      console.error("Message send error:", error);
      alert(`Failed to send message: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      {/* Messages list */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`max-w-[75%] ${
              msg.sender_id === user?.id ? "ml-auto" : "mr-auto"
            }`}
          >
            {msg.sender_id !== user?.id && (
              <div className="text-xs text-purple-300 mb-1">
                {msg.profiles?.real_name || "Unknown"}
              </div>
            )}
            <div
              className={`p-3 rounded-lg ${
                msg.sender_id === user?.id
                  ? "bg-purple-600 text-white"
                  : "bg-gray-800 text-gray-200"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-gray-800 bg-gray-900">
        <div className="flex gap-3">
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type your message..."
            className="flex-1 bg-gray-800 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupChat;
