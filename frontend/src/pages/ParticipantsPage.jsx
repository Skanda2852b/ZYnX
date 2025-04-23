import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useParams, useNavigate } from "react-router-dom";
import { User, ThumbsUp, MapPin, Filter, X } from "lucide-react";
import Navbar from "../components/navbar";
import TeamMemberCard from "../components/TeamMembers";

const ParticipantsPage = () => {
  const { hackathonId } = useParams();
  const navigate = useNavigate();
  const [teamMembers, setTeamMembers] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [filters, setFilters] = useState({
    minUpvotes: 0,
    skills: [],
    search: "",
  });
  const [allSkills, setAllSkills] = useState(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("team_members")
        .select("user1_id, user2_id")
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

      const memberIds =
        data?.flatMap((m) =>
          [m.user1_id, m.user2_id].filter((id) => id !== user.id)
        ) || [];

      setTeamMembers(memberIds);
    };

    fetchTeamMembers();
  }, []);

  useEffect(() => {
    const fetchParticipants = async () => {
      setLoading(true);
      let query = supabase.from("profiles").select("*");

      if (filters.minUpvotes > 0) {
        query = query.gte("upvote_count", filters.minUpvotes);
      }
      if (filters.skills.length > 0) {
        query = query.overlaps("skills", filters.skills);
      }
      if (filters.search) {
        query = query.ilike("real_name", `%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) {
        console.error("Error fetching participants:", error);
        setLoading(false);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      let upvotedProfileIds = [];

      if (user) {
        const { data: upvotesData } = await supabase
          .from("upvotes")
          .select("profile_id")
          .eq("user_id", user.id);
        upvotedProfileIds = upvotesData?.map((up) => up.profile_id) || [];
      }

      const participantsWithUpvotes = data.map((participant) => ({
        ...participant,
        hasUpvoted: upvotedProfileIds.includes(participant.id),
      }));

      setParticipants(participantsWithUpvotes);
      setAllSkills(new Set(data.flatMap((p) => p.skills).filter(Boolean)));
      setLoading(false);
    };

    fetchParticipants();
  }, [filters]);

  const sendRequest = async (receiverId) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return navigate("/login");

    const message = prompt("Enter your request message (max 50 characters):");
    if (!message) return;
    if (message.length > 50) {
      alert("Message must be 50 characters or less");
      return;
    }

    try {
      const { error } = await supabase.from("team_requests").insert({
        sender_id: user.id,
        receiver_id: receiverId,
        hackathon_id: hackathonId,
        message,
        status: "pending",
        created_at: new Date().toISOString(),
      });

      if (error) throw error;
      alert("🎉 Request sent successfully!");
    } catch (error) {
      console.error("Request error:", error);
      alert(`❌ Failed to send request: ${error.message}`);
    }
  };

  const handleUpvote = async (profileId) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return navigate("/login");

    try {
      setParticipants((prev) =>
        prev.map((p) =>
          p.id === profileId
            ? { ...p, upvote_count: p.upvote_count + 1, hasUpvoted: true }
            : p
        )
      );

      await supabase.from("upvotes").insert({
        user_id: user.id,
        profile_id: profileId,
      });
    } catch (error) {
      console.error("Upvote error:", error);
      setParticipants((prev) =>
        prev.map((p) =>
          p.id === profileId
            ? { ...p, upvote_count: p.upvote_count - 1, hasUpvoted: false }
            : p
        )
      );
      alert("Failed to upvote: " + error.message);
    }
  };

  return (
    <div className="bg-black text-white min-h-screen py-3 px-6">
      <Navbar />
      <div className="max-w-7xl mt-9 mx-auto">
        <div className="flex flex-col md:flex-row gap-6 mb-10 bg-gray-900 p-6 rounded-2xl shadow-md">
          <div className="flex-1 space-y-5">
            <div className="relative">
              <input
                placeholder="Search by name..."
                className="w-full bg-gray-800 p-3 pl-4 pr-10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
              />
              <User
                className="absolute right-3 top-3.5 text-gray-400"
                size={20}
              />
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <select
                  className="w-full bg-gray-800 p-3 pr-10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      minUpvotes: Number(e.target.value),
                    })
                  }
                >
                  <option value={0}>All Upvotes</option>
                  <option value={10}>10+</option>
                  <option value={25}>25+</option>
                  <option value={50}>50+</option>
                  <option value={100}>100+</option>
                </select>
                <ThumbsUp
                  className="absolute right-3 top-3.5 text-gray-400"
                  size={20}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-400">
                  Filter by Skills
                </label>
                <div className="flex flex-wrap gap-2">
                  {[...allSkills].map((skill) => (
                    <button
                      key={skill}
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          skills: prev.skills.includes(skill)
                            ? prev.skills.filter((s) => s !== skill)
                            : [...prev.skills, skill],
                        }))
                      }
                      className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
                        filters.skills.includes(skill)
                          ? "bg-purple-600 text-white"
                          : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      }`}
                    >
                      {skill}
                      {filters.skills.includes(skill) && <X size={14} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.length > 0 && (
            <div className="col-span-full">
              <h2 className="text-2xl font-bold text-purple-300 mb-4">
                Your Team
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {participants
                  .filter((p) => teamMembers.includes(p.id))
                  .map((participant) => (
                    <TeamMemberCard key={participant.id} member={participant} />
                  ))}
              </div>
            </div>
          )}

          <h2 className="col-span-full text-2xl font-bold text-purple-300 mb-4">
            All Participants
          </h2>

          {loading ? (
            <div className="col-span-full text-center text-purple-400">
              Loading participants...
            </div>
          ) : (
            participants.map((participant) => (
              <div
                key={participant.id}
                className="bg-gray-900 p-6 rounded-2xl shadow-md hover:bg-gray-800 transition duration-300"
              >
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h3 className="text-xl font-semibold text-purple-300">
                      {participant.real_name}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {participant.location}
                    </p>
                  </div>
                  <button
                    onClick={() => handleUpvote(participant.id)}
                    disabled={participant.hasUpvoted}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-sm ${
                      participant.hasUpvoted
                        ? "bg-purple-900/60 text-purple-400/50 cursor-not-allowed"
                        : "bg-purple-900/60 text-purple-200 hover:bg-purple-900/70 cursor-pointer"
                    }`}
                  >
                    <ThumbsUp size={16} /> {participant.upvote_count}
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mb-5">
                  {participant.skills?.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => sendRequest(participant.id)}
                  className="w-full bg-purple-600 hover:bg-purple-700 px-4 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200"
                >
                  <User size={18} /> Send Team Request
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ParticipantsPage;
