import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Home from "./pages/Home";
import Navbar from "./components/common/Navbar";
import NewReleases from "./components/categories/NewReleases";
import Footer from "./components/common/Footer";
import Store from "./components/store/Store";
import Product from "./components/categories/ProductDetails";
import Order from "./components/Profile/Orders";
import Check from "./components/categories/checkout2";
import "@fontsource/urbanist";
import "@fontsource/urbanist/400-italic.css";
import Invoice from "../src/components/common/invoice";
import ResetPasswordPage from './components/ResetPasswordPage';




function AppContent() {
  const location = useLocation();

  return (
    <div
      className="font-urbanist"
      style={{
        scrollbarWidth: "thin",
        scrollbarColor: "#888 #f1f1f1",
      }}
    >
      <div className="sticky top-0 z-10">
        {<Navbar />} {/* Render Navbar except on "/" route */}
      </div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/order/:orderid" element={<Invoice />} />
        <Route path="/Navbar" element={<Navbar />} />
        <Route path="/NewReleases" element={<NewReleases />} />
        <Route path="/Footer" element={<Footer />} />
        <Route path="/Store" element={<Store />} />
        <Route path="/Checkout2" element={<Check />} />
        <Route path="/product/:id" element={<Product />} />
        <Route path="/order" element={<Order />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Routes>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
     
    </Router>
  );
}

export default App;
