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
import Pricing from './pages/Pricing';
import AdminDashboard from './pages/AdminDashboard';
import BannersAdmin from './pages/BannersAdmin';
import { GlobalAudioProvider } from '@/context/GlobalAudioContext';
import GlobalAudioPlayer from '@/components/audio/GlobalAudioPlayer';

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
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  const isLoading = isLoadingPublicSettings || isLoadingAuth;

  // Hide splash only when auth is fully resolved (never show blank screen or spinner)
  React.useEffect(() => {
    if (!isLoading) {
      window.__cabanaHideSplash && window.__cabanaHideSplash();
    }
  }, [isLoading]);

  if (isLoading) {
    // Keep splash visible — render nothing underneath
    return null;
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
          </Router>
          <Toaster />
        </GlobalAudioProvider>
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App