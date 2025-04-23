import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, Globe, ArrowRight, Sparkles } from "lucide-react";
import { supabase } from "../lib/supabase";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      navigate("/home");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `http://localhost:5173/home`,
        },
      });

      if (error) throw error;
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-black text-white">
      {/* Left Design Half */}
      <div className="w-full md:w-1/2 bg-gradient-to-br from-purple-900/20 to-black p-12 flex flex-col justify-center">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <Globe className="text-purple-400 size-22" />
            <span className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-white">
              Zynx
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome Back</h1>
          <p className="text-gray-400 mb-8 text-2xl font-mono">
            SWIPE SQUAD SHINE
          </p>

          <div className="space-y-4">
            {[
              "Secure authentication",
              "Minimalistic UI",
              "Pure Participant Profiles",
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="p-1 rounded-full bg-purple-900/50 border border-purple-800">
                  <Sparkles className="w-3 h-3 text-purple-300" />
                </div>
                <span className="text-gray-300">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Form Half */}
      <div className="w-full md:w-1/2 bg-gray-900 p-8 md:p-12 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="flex justify-between mb-8 border-b border-gray-800 pb-4">
            <button className="text-xl font-bold text-purple-300 border-b-2 border-purple-500 pb-2 px-4">
              Sign In
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="text-xl font-bold text-gray-500 hover:text-white transition-colors pb-2 px-4"
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="text-red-400 text-sm text-center">{error}</div>
            )}

            <div>
              <label className="block text-gray-400 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox bg-gray-800 border-gray-700 rounded text-purple-500 focus:ring-purple-500"
                />
                <span className="ml-2 text-gray-400">Remember me</span>
              </label>
              <button
                type="button"
                className="text-purple-400 hover:text-purple-300 text-sm"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg transition-colors font-medium ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Signing In..." : "Sign In"} <ArrowRight size={18} />
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-900 text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="w-5 h-5"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
