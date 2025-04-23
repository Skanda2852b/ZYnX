import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  Trophy,
  Tag,
  Users,
  Terminal,
  ArrowRight,
} from "lucide-react";
import Navbar from "../components/navbar";
import { supabase } from "../lib/supabase";

const HostEventPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    start_date: "",
    end_date: "",
    location: "",
    participants_count: "",
    prize_pool: "",
    tags: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("You must be logged in to host an event");

      const { data, error: supabaseError } = await supabase
        .from("hackathons")
        .insert([
          {
            ...formData,
            tags: formData.tags.split(",").map((tag) => tag.trim()),
            host_id: user.id,
            participants_count: parseInt(formData.participants_count) || 0,
          },
        ])
        .select();

      if (supabaseError) throw supabaseError;

      navigate(`/hackathons`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-900/20 to-black py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-white">
            Host Your Hackathon
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Create an unforgettable experience for developers worldwide. Set up
            your event details and start accepting submissions.
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto bg-gray-900 p-8 rounded-xl border border-gray-800">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="text-red-400 text-sm text-center p-3 bg-red-900/20 rounded-lg">
                {error}
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-gray-400 mb-2">Event Title</label>
              <div className="relative">
                <Terminal className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                  placeholder="Awesome Hackathon 2024"
                  required
                />
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-400 mb-2">
                  Start Date & Time
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  <input
                    type="datetime-local"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-2">
                  End Date & Time
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  <input
                    type="datetime-local"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-gray-400 mb-2">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                  placeholder="Virtual or Physical Location"
                  required
                />
              </div>
            </div>

            {/* Participants & Prize */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-400 mb-2">
                  Expected Participants
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  <input
                    type="number"
                    name="participants_count"
                    value={formData.participants_count}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                    placeholder="500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-2">Prize Pool</label>
                <div className="relative">
                  <Trophy className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    name="prize_pool"
                    value={formData.prize_pool}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                    placeholder="$10,000 or 5 ETH"
                  />
                </div>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-gray-400 mb-2">
                Tags (comma separated)
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                  placeholder="AI, Blockchain, Web3"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg transition-colors font-medium ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Creating Event..." : "Publish Event"}
              <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 bg-black border-t border-purple-900/50 mt-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center space-x-6 mb-4">
            <a
              href="#"
              className="text-gray-400 hover:text-purple-300 transition-colors"
            >
              Twitter
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-purple-300 transition-colors"
            >
              Discord
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-purple-300 transition-colors"
            >
              Blog
            </a>
          </div>
          <p className="text-gray-500">
            &copy; {new Date().getFullYear()} ZynxHacks. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HostEventPage;
