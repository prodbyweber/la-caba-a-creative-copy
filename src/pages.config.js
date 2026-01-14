import Artists from './pages/Artists';
import Calendars from './pages/Calendars';
import Clips from './pages/Clips';
import ClipsSettings from './pages/ClipsSettings';
import ContentCalendar from './pages/ContentCalendar';
import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing';
import Notes from './pages/Notes';
import ProjectDetail from './pages/ProjectDetail';
import Revisions from './pages/Revisions';
import Sessions from './pages/Sessions';
import Settings from './pages/Settings';
import SocialAccounts from './pages/SocialAccounts';
import TrackDetail from './pages/TrackDetail';
import AdminDashboard from './pages/AdminDashboard';
import Projects from './pages/Projects';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Artists": Artists,
    "Calendars": Calendars,
    "Clips": Clips,
    "ClipsSettings": ClipsSettings,
    "ContentCalendar": ContentCalendar,
    "Dashboard": Dashboard,
    "Landing": Landing,
    "Notes": Notes,
    "ProjectDetail": ProjectDetail,
    "Revisions": Revisions,
    "Sessions": Sessions,
    "Settings": Settings,
    "SocialAccounts": SocialAccounts,
    "TrackDetail": TrackDetail,
    "AdminDashboard": AdminDashboard,
    "Projects": Projects,
}

export const pagesConfig = {
    mainPage: "Landing",
    Pages: PAGES,
    Layout: __Layout,
};