import { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
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
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthModal } from './components/AuthModal';
import { UserDashboard } from './components/UserDashboard';
import { supabase } from '../../utils/supabase/client';
import { ADMIN_EMAILS } from './constants/admin';

type View = 'home' | 'property-details' | 'service-detail' | 'admin' | 'account';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<'sales' | 'management' | 'advisory' | 'marketing' | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const userEmail = session?.user?.email?.toLowerCase() || null;
  const isAdmin = !!userEmail && ADMIN_EMAILS.includes(userEmail);

  // Check URL for admin access: /admin-cms-letifi-realty-2026 or user account: /account
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/admin-cms-letifi-realty-2026') {
      setCurrentView('admin');
    } else if (path === '/account') {
      setCurrentView('account');
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setSession(data.session);
      }
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
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
    if (window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
    }
  };

  const handleAccountClick = () => {
    if (session) {
      setCurrentView('account');
      window.history.pushState({}, '', '/account');
      return;
    }
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = () => {
    setAuthModalOpen(false);
    setCurrentView('account');
    window.history.pushState({}, '', '/account');
  };

  if (currentView === 'property-details' && selectedPropertyId) {
    return <PropertyDetails propertyId={selectedPropertyId} onClose={handleBack} />;
  }

  if (currentView === 'service-detail' && selectedService) {
    return <ServiceDetail serviceType={selectedService} onClose={handleBack} />;
  }

  if (currentView === 'admin') {
    if (!session || !isAdmin) {
      return (
        <AdminLogin
          onBack={handleBack}
          onAuthenticated={() => {
            setCurrentView('admin');
          }}
        />
      );
    }

    return (
      <AdminDashboard
        onClose={handleBack}
        accessToken={session.access_token}
      >
        <PropertyCMS onClose={handleBack} accessToken={session.access_token} embedded />
      </AdminDashboard>
    );
  }

  if (currentView === 'account') {
    if (!session) {
      return (
        <AuthModal
          open
          onClose={handleBack}
          onSuccess={handleAuthSuccess}
        />
      );
    }

    return (
      <UserDashboard
        session={session}
        onClose={handleBack}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header onAccountClick={handleAccountClick} isAuthenticated={!!session} />
      <main>
        <Hero />
        <About />
        <Services onServiceClick={handleServiceClick} />
        <Listings onPropertyClick={handlePropertyClick} />
        <Contact />
      </main>
      <Footer />
      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
