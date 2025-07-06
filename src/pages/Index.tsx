
import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import LandingPage from '@/components/LandingPage';
import Dashboard from '@/components/Dashboard';
import InvoiceForm from '@/components/InvoiceForm';
import ClientForm from '@/components/ClientForm';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AuthModal } from '@/components/AuthModal';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const [currentPage, setCurrentPage] = useState('landing');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user } = useAuth();

  // If user is authenticated, default to dashboard instead of landing
  React.useEffect(() => {
    if (user && currentPage === 'landing') {
      setCurrentPage('dashboard');
    }
  }, [user, currentPage]);

  const handleShowAuth = () => {
    setShowAuthModal(true);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onNavigate={setCurrentPage} onShowAuth={handleShowAuth} />;
      case 'dashboard':
        return (
          <ProtectedRoute onShowAuth={handleShowAuth}>
            <Dashboard onNavigate={setCurrentPage} />
          </ProtectedRoute>
        );
      case 'create-invoice':
        return (
          <ProtectedRoute onShowAuth={handleShowAuth}>
            <InvoiceForm />
          </ProtectedRoute>
        );
      case 'clients':
        return (
          <ProtectedRoute onShowAuth={handleShowAuth}>
            <ClientForm />
          </ProtectedRoute>
        );
      case 'invoices':
        return (
          <ProtectedRoute onShowAuth={handleShowAuth}>
            <Dashboard onNavigate={setCurrentPage} />
          </ProtectedRoute>
        );
      default:
        return <LandingPage onNavigate={setCurrentPage} onShowAuth={handleShowAuth} />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation 
        currentPage={currentPage} 
        onNavigate={setCurrentPage} 
        onShowAuth={handleShowAuth}
      />
      <main>
        {renderPage()}
      </main>
      
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
};

export default Index;
