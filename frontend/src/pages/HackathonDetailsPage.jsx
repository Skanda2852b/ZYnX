import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  Calendar,
  Clock,
  MapPin,
  Trophy,
  Tag,
  Users,
  Terminal,
  ChevronLeft,
} from "lucide-react";
import Navbar from "../components/navbar";

const HackathonDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hackathon, setHackathon] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHackathon = async () => {
      try {
        // Validate ID before query
        if (!id || !isValidUUID(id)) {
          throw new Error("Invalid hackathon ID");
        }

        const { data, error } = await supabase
          .from("hackathons")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setHackathon(data);
      } catch (err) {
        console.error("Error in fetching hackathon:", err);
        navigate("/home");
      } finally {
        setLoading(false);
      }
    };

    fetchHackathon();
  }, [id, navigate]);

  // UUID validation function
  const isValidUUID = (uuid) => {
    const regex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return regex.test(uuid);
  };

  if (loading)
    return <div className="text-center p-8 text-gray-400">Loading...</div>;
  if (!hackathon)
    return (
      <div className="text-center p-8 text-red-400">Hackathon not found</div>
    );

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-2 text-purple-400 hover:text-purple-300"
        >
          <ChevronLeft size={20} /> Back to Hackathons
        </button>

        <div className="bg-gray-900 rounded-xl p-8 border border-gray-800">
          <h1 className="text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-white">
            {hackathon.title}
          </h1>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="text-purple-400" />
                <div>
                  <h3 className="text-gray-400">Start Date</h3>
                  <p>{new Date(hackathon.start_date).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="text-purple-400" />
                <div>
                  <h3 className="text-gray-400">End Date</h3>
                  <p>{new Date(hackathon.end_date).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="text-purple-400" />
                <div>
                  <h3 className="text-gray-400">Location</h3>
                  <p>{hackathon.location}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Users className="text-purple-400" />
                <div>
                  <h3 className="text-gray-400">Participants</h3>
                  <p>{hackathon.participants_count}+ registered</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Trophy className="text-purple-400" />
                <div>
                  <h3 className="text-gray-400">Prize Pool</h3>
                  <p className="text-purple-300">{hackathon.prize_pool}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Tag className="text-purple-400" />
                <div className="flex flex-wrap gap-2">
                  {hackathon.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-900/50 text-purple-300 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={() => navigate(`/participants`)}
              className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg flex items-center gap-2"
            >
              <Users size={18} /> Find Teammates
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HackathonDetailsPage;
