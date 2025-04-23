import React, { useEffect } from "react";
import {
  useNavigate,
  useParams,
  Routes,
  Route,
  BrowserRouter as Router,
} from "react-router-dom";
import { supabase } from "./lib/supabase";

import WelcomePage from "./pages/WelcomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import HackathonDetailsPage from "./pages/HackathonDetailsPage";
import HackathonsPage from "./pages/HackathonsPage";
import ParticipantsPage from "./pages/ParticipantsPage";
import HostEventPage from "./pages/HostEventPage";
import GroupManagement from "./pages/GroupManagementPage";
import GroupCreator from "./pages/GroupCreator";
import GroupChatPage from "./pages/GroupChatPage";
import GroupCreatorPage from "./pages/GroupCreatorPage";

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) navigate("/login");
    };
    checkAuth();
  }, [navigate]);

  return children;
};

const isValidUUID = (uuid) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

const HackathonDetailsWrapper = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  if (!isValidUUID(id)) {
    navigate("/hackathons", { replace: true });
    return null;
  }

  return <HackathonDetailsPage />;
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/group-creator" element={<GroupCreatorPage />} />

        <Route
          path="/groups"
          element={
            <ProtectedRoute>
              <GroupChatPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/groups/:groupId"
          element={
            <ProtectedRoute>
              <GroupChatPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/groups/:groupId/manage"
          element={
            <ProtectedRoute>
              <GroupManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/host-event"
          element={
            <ProtectedRoute>
              <HostEventPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route path="/hackathons" element={<HackathonsPage />} />
        <Route path="/hackathons/:id" element={<HackathonDetailsWrapper />} />
        <Route path="/participants" element={<ParticipantsPage />} />

        <Route
          path="*"
          element={
            <div className="text-center p-8 text-red-500">
              404 - Page Not Found
            </div>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
