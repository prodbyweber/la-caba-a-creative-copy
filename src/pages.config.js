import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing';
import SocialAccounts from './pages/SocialAccounts';
import Clips from './pages/Clips';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Landing": Landing,
    "SocialAccounts": SocialAccounts,
    "Clips": Clips,
}

export const pagesConfig = {
    mainPage: "Landing",
    Pages: PAGES,
    Layout: __Layout,
};