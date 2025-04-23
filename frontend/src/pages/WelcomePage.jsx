import { X, Sparkles, Users, Zap } from "lucide-react";
import Navbar from "../components/navbar";
import { useNavigate } from "react-router-dom";

// Define features data
const features = [
  {
    title: "Fast Choices",
    description: "Zero friction, instant flow, make moves quick.",
    icon: <Zap className="w-8 h-8 text-white" />,
  },
  {
    title: "Squad",
    description: "Your go-to crew for collab, chaos, and creation.",
    icon: <Users className="w-8 h-8 text-white" />,
  },
  {
    title: "Shine",
    description: "Glow-up, stand out, flex your best self.",
    icon: <Sparkles className="w-8 h-8 text-white" />,
  },
];

const WelcomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative flex items-center justify-center py-24 bg-gradient-to-b from-black via-purple-900 to-black text-center px-4">
          <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-6xl sm:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-purple-500">
              Zynx
            </h1>
            <p className="text-xl sm:text-l text-gray-200">
              Zeal . Youth . Network . Xploration
            </p>
            <button
              onClick={() => navigate("/login")}
              className="inline-flex items-center gap-2 px-10 py-4 border-2 border-purple-500 rounded-full text-white font-semibold transition-all hover:bg-purple-600 hover:border-purple-600"
            >
              <Sparkles className="w-5 h-5" />
              Get Started
            </button>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-900">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-12 text-purple-300">
              Why we&#39;re Lit
              <span className="inline-block animate-pulse">🔥</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="bg-gray-800 rounded-xl border border-gray-700 hover:border-purple-500 transition p-8 flex flex-col items-center text-center"
                >
                  <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-tr from-purple-700 to-purple-500 mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-gray-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 bg-black border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
          <div className="flex space-x-6 mb-4 md:mb-0">
            <a
              href="https://twitter.com"
              className="text-gray-500 hover:text-purple-400 transition-colors"
              aria-label="Twitter"
            >
              <X className="w-6 h-6" />
            </a>
            {/* Add more social icons here */}
          </div>
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Zynx. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default WelcomePage;
