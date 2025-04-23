import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  User,
  ThumbsUp,
  Link,
  Sparkles,
  UserCheck,
  UserX,
  Save,
  Edit,
  Globe,
  Briefcase,
  BookOpen,
  X,
  MapPin,
  Award,
} from "lucide-react";

const ProfilePage = () => {
  const [profile, setProfile] = useState({
    real_name: "",
    gender: "",
    bio: "",
    linkedin_url: "",
    skills: [],
    available: true,
    upvote_count: 0,
    phone_number: "",
    location: "",
    experience: "",
  });
  const [skillsInput, setSkillsInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return navigate("/login");

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      const skillsArray = data?.skills || [];

      setProfile({
        real_name: data?.real_name || "Anonymous Hacker",
        gender: data?.gender || "",
        bio: data?.bio || "",
        linkedin_url: data?.linkedin_url || "",
        skills: skillsArray,
        available: data?.available ?? true,
        upvote_count: data?.upvote_count || 0,
        phone_number: data?.phone_number || "",
        location: data?.location || "",
        experience: data?.experience || "",
      });
      setSkillsInput(skillsArray.join(", "));
      setLoading(false);
    };

    fetchData();
  }, [navigate]);

  const handleUpdate = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const cleanedSkills = skillsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const { error } = await supabase
      .from("profiles")
      .update({
        real_name: profile.real_name,
        gender: profile.gender,
        bio: profile.bio,
        linkedin_url: profile.linkedin_url,
        skills: cleanedSkills,
        available: profile.available,
        location: profile.location,
        experience: profile.experience,
        phone_number: profile.phone_number,
      })
      .eq("id", user.id);

    if (!error) {
      setProfile((p) => ({
        ...p,
        skills: skillsInput
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      }));
      setEditing(false);
    }
  };

  const handleUpvote = async () => {
    const { error } = await supabase.rpc("increment_upvote", {
      profile_id: profile.id,
    });

    if (!error) {
      setProfile((p) => ({ ...p, upvote_count: p.upvote_count + 1 }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-black text-white">
        <div className="animate-pulse text-lg font-medium text-purple-400">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-900 rounded-2xl p-8 shadow-xl border border-gray-800">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <div className="p-3 bg-purple-900/50 rounded-full">
                <User size={32} className="text-purple-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-purple-300">
                  {profile.real_name}
                </h1>
                <div
                  className={`flex items-center gap-2 mt-1 ${
                    profile.available ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {profile.available ? (
                    <UserCheck size={18} />
                  ) : (
                    <UserX size={18} />
                  )}
                  <span className="text-sm">
                    {profile.available
                      ? "Available for opportunities"
                      : "Not currently available"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setEditing(!editing)}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-5 py-2.5 rounded-lg transition-colors"
              >
                {editing ? <X size={18} /> : <Edit size={18} />}
                {editing ? "Cancel" : "Edit Profile"}
              </button>
              {editing && (
                <button
                  onClick={handleUpdate}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-5 py-2.5 rounded-lg transition-colors"
                >
                  <Save size={18} /> Save
                </button>
              )}
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-800 p-4 rounded-xl flex items-center gap-3">
              <Briefcase size={20} className="text-purple-400" />
              <div>
                <div className="text-sm text-gray-400">Skills</div>
                <div className="font-medium">{profile.skills.length}</div>
              </div>
            </div>
            <div className="bg-gray-800 p-4 rounded-xl flex items-center gap-3">
              <ThumbsUp size={20} className="text-purple-400" />
              <div>
                <div className="text-sm text-gray-400">Upvotes</div>
                <div className="font-medium">{profile.upvote_count}</div>
              </div>
            </div>

            {/* Location Section */}
            <div className="bg-gray-800 p-4 rounded-xl flex items-center gap-3">
              <MapPin size={20} className="text-purple-400" />
              <div className="w-full">
                <div className="text-sm text-gray-400 mb-1">Location</div>
                {editing ? (
                  <input
                    type="text"
                    value={profile.location}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, location: e.target.value }))
                    }
                    className="w-full bg-gray-700/50 p-2 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter your location"
                  />
                ) : (
                  <div className="font-medium">
                    {profile.location || "Not specified"}
                  </div>
                )}
              </div>
            </div>

            {/* Experience Section */}
            <div className="bg-gray-800 p-4 rounded-xl flex items-center gap-3">
              <Award size={20} className="text-purple-400" />
              <div className="w-full">
                <div className="text-sm text-gray-400 mb-1">Experience</div>
                {editing ? (
                  <select
                    value={profile.experience}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, experience: e.target.value }))
                    }
                    className="w-full bg-gray-700/50 p-2 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select level</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                ) : (
                  <div className="font-medium">
                    {profile.experience || "Not specified"}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="space-y-8">
            {/* Bio Section */}
            <div className="bg-gray-800 p-6 rounded-xl">
              <div className="flex items-center gap-2 mb-4 text-purple-300">
                <Sparkles size={20} />
                <h2 className="text-xl font-semibold">About Me</h2>
              </div>
              <textarea
                value={profile.bio}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, bio: e.target.value }))
                }
                className="w-full bg-gray-700/50 p-3 rounded-lg min-h-[120px] focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Tell us about yourself..."
                disabled={!editing}
              />
            </div>

            {/* Details Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Personal Info */}
              <div className="bg-gray-800 p-6 rounded-xl">
                <div className="flex items-center gap-2 mb-4 text-purple-300">
                  <User size={20} />
                  <h2 className="text-xl font-semibold">
                    Personal Information
                  </h2>
                </div>
                <div className="space-y-4">
                  {/* Phone Number Section */}
                  <div>
                    <label className="block text-sm font-medium text-purple-300 mb-2">
                      Phone Number
                    </label>
                    <div className="flex items-center gap-2 bg-gray-700/50 p-3 rounded-lg border border-gray-600 hover:border-purple-500 transition-colors">
                      {editing ? (
                        <input
                          type="text"
                          value={profile.phone_number}
                          onChange={(e) => {
                            let value = e.target.value;

                            // Allow starting with '+', and digits after that
                            if (value.startsWith("+")) {
                              value = "+" + value.slice(1).replace(/\D/g, "");
                            } else {
                              value = value.replace(/\D/g, "");
                            }

                            // Optional: Limit total length (e.g., 13 for '+91' + 10 digits)
                            if (value.length <= 13) {
                              setProfile((p) => ({
                                ...p,
                                phone_number: value,
                              }));
                            }
                          }}
                          className="w-full bg-transparent focus:outline-none"
                          placeholder="+91 XXXXXXXXXX"
                          maxLength={13}
                        />
                      ) : (
                        <span
                          className={
                            profile.phone_number
                              ? "text-white"
                              : "text-gray-400"
                          }
                        >
                          {profile.phone_number || "Not provided"}
                        </span>
                      )}
                    </div>
                    {editing && (
                      <p className="mt-1 text-xs text-gray-400">
                        Format: +[country code] [number] (e.g., +1 1234567890)
                      </p>
                    )}
                  </div>

                  {/* Gender Section */}
                  <div>
                    <label className="block text-sm text-purple-300 mb-2">
                      Gender
                    </label>
                    <div className="bg-gray-700/50 p-3 rounded-lg border border-gray-600 hover:border-purple-500">
                      <select
                        value={profile.gender}
                        onChange={(e) =>
                          setProfile((p) => ({ ...p, gender: e.target.value }))
                        }
                        className="w-full bg-transparent focus:outline-none"
                        disabled={!editing}
                      >
                        <option value="">Prefer not to say</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Non-binary">Non-binary</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* LinkedIn Section */}
                  <div>
                    <label className="block text-sm text-purple-300 mb-2">
                      LinkedIn Profile
                    </label>
                    <div className="flex items-center gap-2 bg-gray-700/50 p-3 rounded-lg border border-gray-600 hover:border-purple-500">
                      <Link size={18} className="text-gray-400" />
                      <input
                        type="url"
                        value={profile.linkedin_url}
                        onChange={(e) =>
                          setProfile((p) => ({
                            ...p,
                            linkedin_url: e.target.value,
                          }))
                        }
                        className="w-full bg-transparent focus:outline-none"
                        placeholder="https://linkedin.com/in/yourprofile"
                        disabled={!editing}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills Section */}
              <div className="bg-gray-800 p-6 rounded-xl">
                <div className="flex items-center gap-2 mb-4 text-purple-300">
                  <Briefcase size={20} />
                  <h2 className="text-xl font-semibold">Skills & Expertise</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-purple-300 mb-2">
                      Add Skills (comma separated)
                    </label>
                    <div className="bg-gray-700/50 p-3 rounded-lg border border-gray-600 hover:border-purple-500">
                      <input
                        type="text"
                        value={skillsInput}
                        onChange={(e) => {
                          setSkillsInput(e.target.value);
                          // Auto-split while typing
                          const skills = e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean);
                          setProfile((p) => ({ ...p, skills }));
                        }}
                        className="w-full bg-transparent focus:outline-none"
                        disabled={!editing}
                        placeholder="e.g., React, Node.js, Python"
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(editing ? profile.skills : profile.skills).map(
                      (skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-purple-900/50 text-purple-300 rounded-full text-sm flex items-center gap-1"
                        >
                          {skill}
                          {editing && (
                            <button
                              onClick={() => {
                                // Remove from both input and profile skills
                                const newSkills = profile.skills.filter(
                                  (_, i) => i !== index
                                );
                                setProfile((p) => ({
                                  ...p,
                                  skills: newSkills,
                                }));
                                setSkillsInput(newSkills.join(", "));
                              }}
                              className="text-red-400 hover:text-red-300 ml-1"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
