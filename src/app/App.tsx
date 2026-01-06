import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Services } from './components/Services';
import { Listings } from './components/Listings';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { PropertyDetails } from './components/PropertyDetails';
import { ServiceDetail } from './components/ServiceDetail';
import { PropertyCMS } from './components/PropertyCMS';

type View = 'home' | 'property-details' | 'service-detail' | 'cms';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<'sales' | 'management' | 'advisory' | 'marketing' | null>(null);

  // Check URL for admin access: /admin-cms-letify-realty-2026
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/admin-cms-letify-realty-2026') {
      setCurrentView('cms');
    }
  }, []);

  // Access CMS with keyboard shortcut: Ctrl+Shift+C or Cmd+Shift+C
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
        setCurrentView(prev => prev === 'cms' ? 'home' : 'cms');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handlePropertyClick = (propertyId: string) => {
    setSelectedPropertyId(propertyId);
    setCurrentView('property-details');
  };

  const handleServiceClick = (serviceType: 'sales' | 'management' | 'advisory' | 'marketing') => {
    setSelectedService(serviceType);
    setCurrentView('service-detail');
  };

  const handleBack = () => {
    setCurrentView('home');
    setSelectedPropertyId(null);
    setSelectedService(null);
    // Clear the URL if coming from admin
    if (window.location.pathname === '/admin-cms-letify-realty-2026') {
      window.history.pushState({}, '', '/');
    }
  };

  if (currentView === 'property-details' && selectedPropertyId) {
    return <PropertyDetails propertyId={selectedPropertyId} onClose={handleBack} />;
  }

  if (currentView === 'service-detail' && selectedService) {
    return <ServiceDetail serviceType={selectedService} onClose={handleBack} />;
  }

  if (currentView === 'cms') {
    return <PropertyCMS onClose={handleBack} />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <Hero />
        <About />
        <Services onServiceClick={handleServiceClick} />
        <Listings onPropertyClick={handlePropertyClick} />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}