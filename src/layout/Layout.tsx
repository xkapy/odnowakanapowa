import { Outlet } from "react-router-dom";
import ScrollToTop from "../components/ScrollToTop";
import Navbar from "./Navbar/Navbar";
import Footer from "./Footer/Footer";

const Layout = () => {
  return (
    <div className="bg-white">
      <ScrollToTop />
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
