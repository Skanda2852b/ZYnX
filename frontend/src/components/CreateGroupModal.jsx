import { useState } from "react";
import { supabase } from "../lib/supabase";

const CreateGroupModal = ({ onClose, hackathonId }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("groups")
      .insert({
        name,
        description,
        hackathon_id: hackathonId,
        admin_id: user.id,
      })
      .select()
      .single();

    if (!error) {
      await supabase.from("group_members").insert({
        group_id: data.id,
        user_id: user.id,
        is_admin: true,
      });
      onClose(data.id);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-gray-900 p-6 rounded-xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Create New Group</h2>
        <input
          type="text"
          placeholder="Group Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-gray-800 p-3 rounded-lg mb-4"
        />
        <textarea
          placeholder="Group Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-gray-800 p-3 rounded-lg mb-4 h-32"
        />
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-700 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 rounded-lg disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Group"}
          </button>
        </div>
      </div>
      {showModal && (
        <CreateGroupModal
          hackathonId={hackathon.id}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default CreateGroupModal;
