import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Auth from './Auth';
import Donations from './Donations';
import AddDonation from './AddDonations';
import Chat from './Chat';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Home from './Home';
import SettingsPage from './SettingsPage';
import Profile from './Profile';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';
import DonationDetails from './DonationDetails';
import EditDonation from "./EditDonation";
import AdminDashboard from "./AdminDashboard";
import { useUserContext } from "../context/UserContext";

import { Navigate } from "react-router-dom";

import AOS from 'aos';
import 'aos/dist/aos.css';

function App() {

  
  

  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'en');

  useEffect(() => {
  AOS.init({
    duration: 1000,      // مدة الأنيميشن بالمللي ثانية
    once: true,          // الأنيميشن يحدث مرة واحدة فقط
    easing: 'ease-in-out'
  });
}, []);


  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);
  
  const AdminRoute = ({ children }) => {
  const { user, loading } = useUserContext();
  if (loading) return <div>Loading admin access...</div>; // ✅ لا تتخذ قرارًا قبل انتهاء التحميل
  if (!user) return <Navigate to="/auth" />;
  if (user.role !== "admin") return <Navigate to="/" />;
  return children;
};


  return (
    <Router>
      <div className="page-wrapper" >
        {/* Pass theme and language to Navbar if needed */}
        <Navbar language={language} setLanguage={setLanguage} />
          
     <main className="main-content" >

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/donations" element={<Donations />} />
            <Route path="/add-donation" element={<AddDonation />} />
            <Route path="/profile" element={<Profile/>} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/settings" element={<SettingsPage setTheme={setTheme} setLanguage={setLanguage} />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/donations/:id" element={<DonationDetails />} />
<Route path="/donations/edit/:id" element={<EditDonation />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/chat/:id" element={<Chat />} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          </Routes>
        </main>

         <Footer />
      </div>
     
    </Router>
    
  );
}

export default App; 
