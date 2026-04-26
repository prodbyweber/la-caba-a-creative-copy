import React from "react"
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { base44 } from '@/api/base44Client';
import ContactLeads from './pages/ContactLeads';
import UserProfiles from './pages/UserProfiles';
import Pricing from './pages/Pricing';
import AdminDashboard from './pages/AdminDashboard';
import BannersAdmin from './pages/BannersAdmin';
import Explorar from './pages/Explorar';
import ExplorarAdmin from './pages/ExplorarAdmin';
import { GlobalAudioProvider } from '@/context/GlobalAudioContext';
import GlobalAudioPlayer from '@/components/audio/GlobalAudioPlayer';
import DesktopAudioPlayer from '@/components/audio/DesktopAudioPlayer';
import OnboardingForm from '@/components/onboarding/OnboardingForm';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const ProtectedAdminRoute = ({ element }) => {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const checkAdmin = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        if (currentUser?.role !== 'admin') {
          window.location.href = '/';
        }
      } catch (e) {
        window.location.href = '/';
      } finally {
        setLoading(false);
      }
    };
    checkAdmin();
  }, []);

  if (loading) {
    return null;
  }

  if (!user || user.role !== 'admin') return null;

  return element;
};

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin, user: contextUser, isAuthenticated } = useAuth();
  const isLoading = isLoadingPublicSettings || isLoadingAuth;
  // undefined = not checked yet, null = checked but no profile, object = has profile
  const [userProfile, setUserProfile] = React.useState(undefined);

  React.useEffect(() => {
    if (!isLoading && isAuthenticated && contextUser) {
      setUserProfile(undefined); // reset while fetching
      base44.entities.UserProfile.filter({ user_id: contextUser.id })
        .then(profiles => setUserProfile(profiles.length > 0 ? profiles[0] : null))
        .catch(() => setUserProfile(null));
    } else if (!isLoading && !isAuthenticated) {
      setUserProfile(undefined);
    }
  }, [isLoading, isAuthenticated, contextUser?.id]);

  // Hide splash only when auth is fully resolved
  React.useEffect(() => {
    if (!isLoading) {
      window.__cabanaHideSplash && window.__cabanaHideSplash();
    }
  }, [isLoading]);

  // Wait for auth + profile check to complete
  if (isLoading || (isAuthenticated && userProfile === undefined)) {
    return null;
  }

  // Show onboarding for ANY authenticated user without a profile (Google auth or email)
  if (isAuthenticated && contextUser && userProfile === null) {
    return (
      <OnboardingForm
        user={contextUser}
        onComplete={() =>
          base44.entities.UserProfile.filter({ user_id: contextUser.id })
            .then(p => setUserProfile(p[0] || null))
        }
      />
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={
        <LayoutWrapper currentPageName={mainPageKey}>
          <MainPage />
        </LayoutWrapper>
      } />
      {Object.entries(Pages).map(([path, Page]) => (
        <Route
          key={path}
          path={`/${path}`}
          element={
            <LayoutWrapper currentPageName={path}>
              <Page />
            </LayoutWrapper>
          }
        />
      ))}
      <Route path="/ContactLeads" element={<ContactLeads />} />
      <Route path="/Pricing" element={<Pricing />} />
      <Route path="/AdminDashboard" element={<ProtectedAdminRoute element={<AdminDashboard />} />} />
      <Route path="/BannersAdmin" element={<ProtectedAdminRoute element={<BannersAdmin />} />} />
      <Route path="/Explorar" element={<Explorar />} />
      <Route path="/ExplorarAdmin" element={<ProtectedAdminRoute element={<ExplorarAdmin />} />} />
      <Route path="/UserProfiles" element={<ProtectedAdminRoute element={<UserProfiles />} />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <GlobalAudioProvider>
          <Router>
            <NavigationTracker />
            <AuthenticatedApp />
            <GlobalAudioPlayer />
            <DesktopAudioPlayer />
          </Router>
          <Toaster />
        </GlobalAudioProvider>
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App