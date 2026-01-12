import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing';
import SocialAccounts from './pages/SocialAccounts';
import Clips from './pages/Clips';
import ClipsSettings from './pages/ClipsSettings';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Landing": Landing,
    "SocialAccounts": SocialAccounts,
    "Clips": Clips,
    "ClipsSettings": ClipsSettings,
}

export const pagesConfig = {
    mainPage: "Landing",
    Pages: PAGES,
    Layout: __Layout,
};