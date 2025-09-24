import { createBrowserRouter } from "react-router-dom";
import Layout from "../layout/Layout";
import Home from "../pages/Home";
import Services from "../pages/Services";
import About from "../pages/About";
import Contact from "../pages/Contact";
import NotFound from "../pages/NotFound";
import PrivacyPolicy from "../pages/PrivacyPolicy";
import TermsOfUse from "../pages/TermsOfUse";
import Faq from "../pages/Faq";
// New pages - will create these
import Booking from "../pages/Booking";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Profile from "../pages/Profile";
import Admin from "../pages/Admin";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "services", element: <Services /> },
      { path: "booking", element: <Booking /> },
      { path: "about", element: <About /> },
      { path: "contact", element: <Contact /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "profile", element: <Profile /> },
      { path: "admin", element: <Admin /> },
      { path: "privacy-policy", element: <PrivacyPolicy /> },
      { path: "terms-of-use", element: <TermsOfUse /> },
      { path: "FAQ", element: <Faq /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

export default router;
