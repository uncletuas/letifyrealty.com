import { useState } from 'react';
import { Menu, X, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import logo from '@/assets/letifi-logo.png';

interface HeaderProps {
  onAccountClick?: () => void;
  isAuthenticated?: boolean;
  onNavigate?: (target: 'home' | 'about' | 'services' | 'listings' | 'contact') => void;
}

export function Header({ onAccountClick, isAuthenticated = false, onNavigate }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  const handleNav = (target: 'home' | 'about' | 'services' | 'listings' | 'contact') => {
    if (onNavigate) {
      onNavigate(target);
      setMobileMenuOpen(false);
      return;
    }
    scrollToSection(target);
  };

  const navItems = [
    { label: 'Home', id: 'home' as const },
    { label: 'About', id: 'about' as const },
    { label: 'Services', id: 'services' as const },
    { label: 'Listings', id: 'listings' as const },
    { label: 'Contact', id: 'contact' as const },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <motion.button
            onClick={() => handleNav('home')}
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <img src={logo} alt="Letifi Realty" className="h-12 w-auto" />
          </motion.button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className="text-foreground/80 hover:text-primary transition-colors duration-200"
              >
                {item.label}
              </button>
            ))}
            <motion.button
              onClick={onAccountClick}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border hover:border-primary/50 text-foreground/80 hover:text-primary transition-colors"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <User size={16} />
              <span className="text-sm">{isAuthenticated ? 'Account' : 'Sign In'}</span>
            </motion.button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-card border-b border-border overflow-hidden"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className="text-foreground/80 hover:text-primary transition-colors duration-200 text-left py-2"
                >
                  {item.label}
                </button>
              ))}
              <button
                onClick={onAccountClick}
                className="flex items-center gap-2 text-foreground/80 hover:text-primary transition-colors duration-200 text-left py-2"
              >
                <User size={16} />
                <span>{isAuthenticated ? 'Account' : 'Sign In'}</span>
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
