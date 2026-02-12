/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import Accounting from './pages/Accounting';
import AdminDashboard from './pages/AdminDashboard';
import Analytics from './pages/Analytics';
import ArtistDashboard from './pages/ArtistDashboard';
import Artists from './pages/Artists';
import Calendars from './pages/Calendars';
import Clips from './pages/Clips';
import ClipsSettings from './pages/ClipsSettings';
import ContentCalendar from './pages/ContentCalendar';
import Dashboard from './pages/Dashboard';
import FinanceDashboard from './pages/FinanceDashboard';
import InvestorDashboard from './pages/InvestorDashboard';
import Landing from './pages/Landing';
import LandingEditor from './pages/LandingEditor';
import Notes from './pages/Notes';
import ProjectDetail from './pages/ProjectDetail';
import Projects from './pages/Projects';
import Revisions from './pages/Revisions';
import Sessions from './pages/Sessions';
import Settings from './pages/Settings';
import SocialAccounts from './pages/SocialAccounts';
import TrackDetail from './pages/TrackDetail';
import Tracks from './pages/Tracks';
import UserProfile from './pages/UserProfile';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Accounting": Accounting,
    "AdminDashboard": AdminDashboard,
    "Analytics": Analytics,
    "ArtistDashboard": ArtistDashboard,
    "Artists": Artists,
    "Calendars": Calendars,
    "Clips": Clips,
    "ClipsSettings": ClipsSettings,
    "ContentCalendar": ContentCalendar,
    "Dashboard": Dashboard,
    "FinanceDashboard": FinanceDashboard,
    "InvestorDashboard": InvestorDashboard,
    "Landing": Landing,
    "LandingEditor": LandingEditor,
    "Notes": Notes,
    "ProjectDetail": ProjectDetail,
    "Projects": Projects,
    "Revisions": Revisions,
    "Sessions": Sessions,
    "Settings": Settings,
    "SocialAccounts": SocialAccounts,
    "TrackDetail": TrackDetail,
    "Tracks": Tracks,
    "UserProfile": UserProfile,
}

export const pagesConfig = {
    mainPage: "Landing",
    Pages: PAGES,
    Layout: __Layout,
};