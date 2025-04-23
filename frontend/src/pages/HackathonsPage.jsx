import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Terminal, Clock, Globe, Users, Trophy } from "lucide-react";
import Navbar from "../components/navbar";

const HackathonsPage = () => {
  const navigate = useNavigate();
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHackathons = async () => {
      try {
        const { data, error } = await supabase
          .from("hackathons")
          .select("*")
          .order("created_at", { ascending: false });

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
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl p-2 font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-white">
          All Ongoing Hackathons
        </h1>

        {loading ? (
          <div className="text-center text-gray-400">Loading hackathons...</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {hackathons.map((hackathon) => (
              <div
                key={hackathon.id}
                onClick={() => navigate(`/hackathons/${hackathon.id}`)}
                className="bg-gray-900 p-6 rounded-xl hover:bg-gray-800 transition-all border border-gray-800 hover:border-purple-500/50 cursor-pointer group"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Terminal className="text-purple-400 size-6" />
                  <h2 className="text-xl font-semibold">{hackathon.title}</h2>
                </div>

                <div className="space-y-3 text-gray-300">
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
                      {hackathon.participants_count?.toLocaleString() || "0"}+
                      participants
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="size-4" />
                    <span className="text-purple-300">
                      {hackathon.prize_pool}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {hackathon.tags?.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-900/50 text-purple-300 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HackathonsPage;
