import {
  Globe,
  Sparkles,
  Trophy,
  Users,
  Clock,
  Terminal,
  UserSearch,
  X,
} from "lucide-react";
import Navbar from "../components/navbar";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const HomePage = () => {
  const navigate = useNavigate();
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  useEffect(() => {
    const fetchHackathons = async () => {
      try {
        const { data, error } = await supabase
          .from("hackathons")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(3);

        if (error) throw error;
        setHackathons(data || []);
      } catch (error) {
        console.error("Error fetching hackathons:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHackathons();
  }, []);

  const formatDateRange = (start, end) => {
    const options = { month: "short", day: "numeric" };
    const startDate = new Date(start).toLocaleDateString("en-US", options);
    const endDate = new Date(end).toLocaleDateString("en-US", options);
    return `${startDate} - ${endDate}`;
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative flex items-center justify-center py-24 bg-gradient-to-b from-black via-purple-900 to-black text-center px-4">
          <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-6xl sm:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-white drop-shadow-[0_2px_8px_rgba(168,85,247,0.4)]">
              Build the Future
            </h1>
            <p className="text-xl sm:text-l text-gray-200">
              Join the world’s most innovative hackathons. Collaborate, create,
              and compete with developers worldwide.
            </p>
            <div className="flex flex-col md:flex-row justify-center gap-4">
              <button
                onClick={() => navigate("/hackathons")}
                className="inline-flex items-center gap-2 px-8 py-3 border-2 border-purple-500 rounded-full text-white font-semibold transition-all hover:bg-purple-600 hover:border-purple-600"
              >
                <Sparkles className="w-5 h-5" />
                Explore Hackathons
              </button>
              <button
                onClick={() => navigate("/host-event")}
                className="inline-flex items-center gap-2 px-8 py-3 border-2 border-purple-500 rounded-full text-white font-semibold transition-all hover:bg-purple-600 hover:border-purple-600"
              >
                <Terminal className="w-5 h-5" />
                Host a New Event
              </button>
            </div>
            <div className="flex flex-col md:flex-row justify-center gap-4">
              <button
                onClick={() => navigate("/participants")}
                className="inline-flex items-center gap-2 px-8 py-3 border-2 border-purple-500 rounded-full text-white font-semibold transition-all hover:bg-purple-600 hover:border-purple-600"
              >
                <UserSearch className="w-5 h-5" />
                Find Members
              </button>
              <button
                onClick={() => navigate("/group-creator")}
                className="inline-flex items-center gap-2 px-8 py-3 border-2 border-purple-500 rounded-full text-white font-semibold transition-all hover:bg-purple-600 hover:border-purple-600"
              >
                <Users className="w-5 h-5" />
                Create Group
              </button>
            </div>
          </div>
        </section>

        {/* Hackathons Grid */}
        <section className="py-20 bg-gray-900">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-12 text-purple-300">
              Featured Events
            </h2>
            {loading ? (
              <p className="text-center text-gray-400">Loading hackathons...</p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {hackathons.map((hackathon) => (
                  <div
                    key={hackathon.id}
                    onClick={() => navigate(`/hackathons/${hackathon.id}`)}
                    className="bg-gray-800 rounded-xl border border-gray-700 hover:border-purple-500 transition p-6 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <Terminal className="text-purple-400 size-6" />
                      <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition">
                        {hackathon.title}
                      </h3>
                    </div>
                    <div className="space-y-2 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <Clock className="size-4" />
                        <span>
                          {formatDateRange(
                            hackathon.start_date,
                            hackathon.end_date
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="size-4" />
                        <span>{hackathon.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="size-4" />
                        <span>
                          {hackathon.participants_count?.toLocaleString()}+
                          participants
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Trophy className="size-4 text-purple-300" />
                        <span>{hackathon.prize_pool} prize pool</span>
                      </div>
                    </div>
                    {hackathon.tags?.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {hackathon.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 bg-purple-900/40 text-purple-300 rounded-full text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 bg-black border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
          <div className="flex space-x-6 mb-4 md:mb-0">
            <a
              href="#"
              className="text-gray-500 hover:text-purple-400 transition-colors"
              aria-label="Twitter"
            >
              <X className="w-6 h-6" />
            </a>
            <a
              href="#"
              className="text-gray-500 hover:text-purple-400 transition-colors"
            >
              Discord
            </a>
            <a
              href="#"
              className="text-gray-500 hover:text-purple-400 transition-colors"
            >
              Blog
            </a>
          </div>
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} ZynxHacks. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
