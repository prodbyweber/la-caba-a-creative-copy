import Clips from './pages/Clips';
import ClipsSettings from './pages/ClipsSettings';
import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing';
import SocialAccounts from './pages/SocialAccounts';
import Sessions from './pages/Sessions';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Clips": Clips,
    "ClipsSettings": ClipsSettings,
    "Dashboard": Dashboard,
    "Landing": Landing,
    "SocialAccounts": SocialAccounts,
    "Sessions": Sessions,
}

export const pagesConfig = {
    mainPage: "Landing",
    Pages: PAGES,
    Layout: __Layout,
};