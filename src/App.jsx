import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import VerifyEmail from './components/VerifyEmail';
import LandingPage from './components/LandingPage';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import CreateBill from './pages/CreateBill';
import BillHistory from './pages/BillHistory';
import Products from './pages/Products';
import Companies from './pages/Companies';
import Buyers from './pages/Buyers';
import BillingReports from './pages/BillingReports';
import Downloads from './pages/Downloads';
import { onAuthStateChange, signOut } from './services/authService';
import './styles/form.css';
import './styles/invoice.css';
import './styles/icons.css';

function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authView, setAuthView] = useState('login');

  useEffect(() => {
    const { data: { subscription } } = onAuthStateChange((event, session) => {
      if (session?.user) {
        setIsAuthenticated(true);
        setCurrentUser(session.user);
      } else {
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
      setAuthLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('type=signup') || hash.includes('type=email') || hash.includes('type=recovery')) {
      setAuthView('verify-email');
    }
  }, []);

  const handleGetStarted = () => {
    setShowLanding(false);
  };

  const handleLogin = (user) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
    setAuthView('login');
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      setIsAuthenticated(false);
      setCurrentUser(null);
      setAuthView('login');
      setShowLanding(true);
    }
  };

  if (authLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#666' }}>
        Loading...
      </div>
    );
  }

  // Public Routes (Landing & Auth)
  if (!isAuthenticated) {
    if (showLanding) return <LandingPage onGetStarted={handleGetStarted} />;

    if (authView === 'register') return <Register onBackToLogin={() => setAuthView('login')} />;
    if (authView === 'forgot-password') return <ForgotPassword onBackToLogin={() => setAuthView('login')} />;
    if (authView === 'verify-email') return <VerifyEmail onBackToLogin={() => setAuthView('login')} />;

    return (
      <Login
        onLogin={handleLogin}
        onShowRegister={() => setAuthView('register')}
        onShowForgotPassword={() => setAuthView('forgot-password')}
      />
    );
  }

  // Protected Routes (Dashboard)
  return (
    <Routes>
      <Route element={<DashboardLayout onLogout={handleLogout} />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-bill" element={<CreateBill userId={currentUser?.id} />} />
        <Route path="/bills" element={<BillHistory userId={currentUser?.id} />} />
        <Route path="/products" element={<Products />} />
        <Route path="/companies" element={<Companies />} />
        <Route path="/buyers" element={<Buyers />} />
        <Route path="/billing-reports" element={<BillingReports />} />
        <Route path="/downloads" element={<Downloads />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
