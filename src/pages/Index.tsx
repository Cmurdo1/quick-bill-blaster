
import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import Dashboard from '@/components/Dashboard';
import InvoiceForm from '@/components/InvoiceForm';
import ClientForm from '@/components/ClientForm';

const Index = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'create-invoice':
        return <InvoiceForm />;
      case 'clients':
        return <ClientForm />;
      case 'invoices':
        return <Dashboard onNavigate={setCurrentPage} />; // For now, showing dashboard
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="p-6">
        {renderPage()}
      </main>
    </div>
  );
};

export default Index;
