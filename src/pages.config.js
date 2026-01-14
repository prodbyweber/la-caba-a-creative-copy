import Clips from './pages/Clips';
import ClipsSettings from './pages/ClipsSettings';
import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing';
import ProjectDetail from './pages/ProjectDetail';
import Sessions from './pages/Sessions';
import SocialAccounts from './pages/SocialAccounts';
import TrackDetail from './pages/TrackDetail';
import AdminDashboard from './pages/AdminDashboard';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Clips": Clips,
    "ClipsSettings": ClipsSettings,
    "Dashboard": Dashboard,
    "Landing": Landing,
    "ProjectDetail": ProjectDetail,
    "Sessions": Sessions,
    "SocialAccounts": SocialAccounts,
    "TrackDetail": TrackDetail,
    "AdminDashboard": AdminDashboard,
}

export const pagesConfig = {
    mainPage: "Landing",
    Pages: PAGES,
    Layout: __Layout,
};