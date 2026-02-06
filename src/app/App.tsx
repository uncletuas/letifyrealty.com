import { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
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
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { TermsConditions } from './components/TermsConditions';
import { AboutPage } from './components/AboutPage';
import { ListingsPage } from './components/ListingsPage';
import { supabase } from '../../utils/supabase/client';
import { ADMIN_EMAILS } from './constants/admin';

type View = 'home' | 'property-details' | 'service-detail' | 'admin' | 'account' | 'privacy' | 'terms' | 'about' | 'listings';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<'sales' | 'management' | 'advisory' | 'marketing' | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const userEmail = session?.user?.email?.toLowerCase() || null;
  const isAdmin = !!userEmail && ADMIN_EMAILS.includes(userEmail);

  // Check URL for admin access: /admin-cms-letifi-realty-2026, user account: /account, legal pages.
  useEffect(() => {
    const handlePath = () => {
      const path = window.location.pathname;
      if (path === '/admin-cms-letifi-realty-2026') {
        setCurrentView('admin');
      } else if (path === '/account') {
        setCurrentView('account');
      } else if (path === '/privacy') {
        setCurrentView('privacy');
      } else if (path === '/terms') {
        setCurrentView('terms');
      } else if (path === '/about') {
        setCurrentView('about');
      } else if (path === '/listings') {
        setCurrentView('listings');
      } else {
        setCurrentView('home');
      }
    };

    handlePath();
    window.addEventListener('popstate', handlePath);
    return () => window.removeEventListener('popstate', handlePath);
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

  const handleLegalNavigate = (target: 'privacy' | 'terms') => {
    setCurrentView(target);
    window.history.pushState({}, '', target === 'privacy' ? '/privacy' : '/terms');
  };

  const handleSectionNavigate = (sectionId: string) => {
    setCurrentView('home');
    if (window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
    }
    setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleAuthSuccess = () => {
    setAuthModalOpen(false);
    if (currentView !== 'account') {
      setCurrentView('home');
    }
  };

  const handleNavigate = (target: 'home' | 'about' | 'services' | 'listings' | 'contact') => {
    if (target === 'about') {
      setCurrentView('about');
      window.history.pushState({}, '', '/about');
      return;
    }
    if (target === 'listings') {
      setCurrentView('listings');
      window.history.pushState({}, '', '/listings');
      return;
    }
    if (target === 'home') {
      setCurrentView('home');
      if (window.location.pathname !== '/') {
        window.history.pushState({}, '', '/');
      }
      return;
    }
    handleSectionNavigate(target);
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

  if (currentView === 'privacy') {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header onAccountClick={handleAccountClick} isAuthenticated={!!session} onNavigate={handleNavigate} />
        <main>
          <PrivacyPolicy onBack={handleBack} />
        </main>
        <Footer onLegalNavigate={handleLegalNavigate} onSectionNavigate={handleSectionNavigate} onNavigate={handleNavigate} />
      </div>
    );
  }

  if (currentView === 'terms') {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header onAccountClick={handleAccountClick} isAuthenticated={!!session} onNavigate={handleNavigate} />
        <main>
          <TermsConditions onBack={handleBack} />
        </main>
        <Footer onLegalNavigate={handleLegalNavigate} onSectionNavigate={handleSectionNavigate} onNavigate={handleNavigate} />
      </div>
    );
  }

  if (currentView === 'about') {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header onAccountClick={handleAccountClick} isAuthenticated={!!session} onNavigate={handleNavigate} />
        <main>
          <AboutPage onBack={handleBack} />
        </main>
        <Footer onLegalNavigate={handleLegalNavigate} onSectionNavigate={handleSectionNavigate} onNavigate={handleNavigate} />
      </div>
    );
  }

  if (currentView === 'listings') {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header onAccountClick={handleAccountClick} isAuthenticated={!!session} onNavigate={handleNavigate} />
        <main>
          <ListingsPage onBack={handleBack} onPropertyClick={handlePropertyClick} />
        </main>
        <Footer onLegalNavigate={handleLegalNavigate} onSectionNavigate={handleSectionNavigate} onNavigate={handleNavigate} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header onAccountClick={handleAccountClick} isAuthenticated={!!session} onNavigate={handleNavigate} />
      <main>
        <Hero />
        <Listings
          onPropertyClick={handlePropertyClick}
          title="Featured Listings"
          subtitle="Select a category to preview up to six available properties."
          limit={6}
          sectionId="featured"
        />
        <Services onServiceClick={handleServiceClick} />
        <Contact />
      </main>
      <Footer onLegalNavigate={handleLegalNavigate} onSectionNavigate={handleSectionNavigate} onNavigate={handleNavigate} />
      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
