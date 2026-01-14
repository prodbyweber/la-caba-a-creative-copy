import Clips from './pages/Clips';
import ClipsSettings from './pages/ClipsSettings';
import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing';
import ProjectDetail from './pages/ProjectDetail';
import Sessions from './pages/Sessions';
import SocialAccounts from './pages/SocialAccounts';
import TrackDetail from './pages/TrackDetail';
import AdminDashboard from './pages/AdminDashboard';
import Artists from './pages/Artists';
import Projects from './pages/Projects';
import Calendars from './pages/Calendars';
import Revisions from './pages/Revisions';
import Notes from './pages/Notes';
import ContentCalendar from './pages/ContentCalendar';
import Settings from './pages/Settings';
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
    "Artists": Artists,
    "Projects": Projects,
    "Calendars": Calendars,
    "Revisions": Revisions,
    "Notes": Notes,
    "ContentCalendar": ContentCalendar,
    "Settings": Settings,
}

export const pagesConfig = {
    mainPage: "Landing",
    Pages: PAGES,
    Layout: __Layout,
};