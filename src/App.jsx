import React from "react"
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { base44 } from '@/api/base44Client';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import GuestCatalogPreview from './pages/GuestCatalogPreview';
import PoliticaPrivacidad from './pages/PoliticaPrivacidad';
import AvisoLegal from './pages/AvisoLegal';
import PoliticaCookies from './pages/PoliticaCookies';
import CookieBanner from './components/common/CookieBanner';
import StudioSession from './pages/StudioSession';
import Meeting from './pages/Meeting';
import Start from './pages/Start';
import ContactLeads from './pages/ContactLeads';
import CatalogoAdmin from './pages/CatalogoAdmin.jsx';
import ArtistPanelList from './pages/ArtistPanelList';
import UserProfiles from './pages/UserProfiles';
import Pricing from './pages/Pricing';
import AdminDashboard from './pages/AdminDashboard';
import BannersAdmin from './pages/BannersAdmin';
import Explorar from './pages/Explorar';
import ExplorarAdmin from './pages/ExplorarAdmin';
import DesignEditor from './pages/DesignEditor';
import ADNdeMarca from './pages/ADNdeMarca';
import PublicProfile from './pages/PublicProfile';
import UserPublicProfile from './pages/UserPublicProfile';
import CreatorProfile from './pages/CreatorProfile';
import Marcas from './pages/Marcas';
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
  const { isLoadingAuth, isLoadingPublicSettings } = useAuth();
  const isLoading = isLoadingPublicSettings || isLoadingAuth;

  React.useEffect(() => {
    if (!isLoading) {
      window.__cabanaHideSplash && window.__cabanaHideSplash();
    }
  }, [isLoading]);

  if (isLoading) {
    return null;
  }

  // Redirect authenticated users: admin → /AdminDashboard, others → /Explorar
  const AuthRedirect = () => {
    const [checked, setChecked] = React.useState(false);
    React.useEffect(() => {
      base44.auth.isAuthenticated().then(async (auth) => {
        if (auth) {
          const user = await base44.auth.me();
          if (user?.role === 'admin') {
            window.location.replace('/AdminDashboard');
          } else {
            window.location.replace('/Explorar');
          }
        }
        setChecked(true);
      });
    }, []);
    if (!checked) return null;
    return (
      <LayoutWrapper currentPageName={mainPageKey}>
        <MainPage />
      </LayoutWrapper>
    );
  };

  // Render the main app
  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Home redirect */}
      <Route path="/" element={<AuthRedirect />} />

      {/* Public pages (no auth required) */}
      <Route path="/start" element={<Start />} />
      <Route path="/Marcas" element={<Marcas />} />
      <Route path="/Pricing" element={<Pricing />} />
      <Route path="/GuestCatalogPreview" element={<GuestCatalogPreview />} />
      <Route path="/ContactLeads" element={<ContactLeads />} />
      <Route path="/PublicProfile" element={<PublicProfile />} />
      <Route path="/creator/:username" element={<CreatorProfile />} />
      <Route path="/:username" element={<UserPublicProfile />} />
      <Route path="/politica-de-privacidad" element={<PoliticaPrivacidad />} />
      <Route path="/aviso-legal" element={<AvisoLegal />} />
      <Route path="/politica-de-cookies" element={<PoliticaCookies />} />

      {/* Protected pages (require login) */}
      <Route path="/Explorar" element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}><Route index element={<Explorar />} /></Route>
      <Route path="/StudioSession" element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}><Route index element={<StudioSession />} /></Route>
      <Route path="/meeting" element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}><Route index element={<Meeting />} /></Route>

      {/* Admin-only pages */}
      <Route path="/AdminDashboard" element={<ProtectedAdminRoute element={<AdminDashboard />} />} />
      <Route path="/BannersAdmin" element={<ProtectedAdminRoute element={<BannersAdmin />} />} />
      <Route path="/ExplorarAdmin" element={<ProtectedAdminRoute element={<ExplorarAdmin />} />} />
      <Route path="/UserProfiles" element={<ProtectedAdminRoute element={<UserProfiles />} />} />
      <Route path="/DesignEditor" element={<ProtectedAdminRoute element={<DesignEditor />} />} />
      <Route path="/CatalogoAdmin" element={<ProtectedAdminRoute element={<CatalogoAdmin />} />} />
      <Route path="/ArtistPanelList" element={<ProtectedAdminRoute element={<ArtistPanelList />} />} />
      <Route path="/ADNdeMarca" element={<ProtectedAdminRoute element={<ADNdeMarca />} />} />

      {/* Legacy pages config loop */}
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
          <CookieBanner />
          <Toaster />
        </GlobalAudioProvider>
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App