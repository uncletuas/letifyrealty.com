import { motion } from 'motion/react';
import logo from '@/assets/b0156df81bf0597ec03084c78325b8634e5c8780.png';

interface FooterProps {
  onLegalNavigate: (target: 'privacy' | 'terms') => void;
  onSectionNavigate: (sectionId: string) => void;
}

export function Footer({ onLegalNavigate, onSectionNavigate }: FooterProps) {
  const quickLinks = [
    { label: 'Home', id: 'home' },
    { label: 'About', id: 'about' },
    { label: 'Services', id: 'services' },
    { label: 'Listings', id: 'listings' },
    { label: 'Contact', id: 'contact' },
  ];

  const services = [
    'Property Sales',
    'Property Leasing',
    'Property Management',
    'Real Estate Advisory',
  ];

  const socialLinks = [
    { name: 'Facebook', url: '#', icon: 'facebook' },
    { name: 'Instagram', url: '#', icon: 'instagram' },
    { name: 'Twitter', url: '#', icon: 'twitter' },
    { name: 'LinkedIn', url: '#', icon: 'linkedin' },
  ];

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <div>
            <motion.div
              className="mb-6"
              whileHover={{ scale: 1.05 }}
            >
              <img src={logo} alt="Letifi Realty" className="h-12 w-auto" />
            </motion.div>
            <p className="text-foreground/70 mb-6 leading-relaxed">
              Smart real estate solutions made simple. Your trusted partner in property sales, leasing, and management.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.url}
                  className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white hover:shadow-lg transition-shadow"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={social.name}
                >
                  {social.icon === 'facebook' && (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                    </svg>
                  )}
                  {social.icon === 'instagram' && (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2" />
                      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
                      <circle cx="17.5" cy="6.5" r="1.5" />
                    </svg>
                  )}
                  {social.icon === 'twitter' && (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                    </svg>
                  )}
                  {social.icon === 'linkedin' && (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
                      <circle cx="4" cy="4" r="2" />
                    </svg>
                  )}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-6" style={{ fontWeight: 600 }}>
              Quick Links
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.id}>
                  <button
                    type="button"
                    onClick={() => onSectionNavigate(link.id)}
                    className="text-foreground/70 hover:text-primary transition-colors duration-200"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="mb-6" style={{ fontWeight: 600 }}>
              Our Services
            </h3>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service} className="text-foreground/70">
                  {service}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="mb-6" style={{ fontWeight: 600 }}>
              Contact Us
            </h3>
            <ul className="space-y-3 text-foreground/70">
              <li>
                <a href="tel:+2349067435048" className="hover:text-primary transition-colors">
                  +234 906 743 5048
                </a>
              </li>
              <li>
                <a href="mailto:info@letifirealty.com" className="hover:text-primary transition-colors">
                  info@letifirealty.com
                </a>
              </li>
              <li>
                25 Kpalukwu Street, D-line, Port Harcourt, Rivers State, Nigeria
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-foreground/60 text-sm text-center md:text-left">
              &copy; {new Date().getFullYear()} Letifi Realty. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-foreground/60">
              <button
                type="button"
                onClick={() => onLegalNavigate('privacy')}
                className="hover:text-primary transition-colors"
              >
                Privacy Policy
              </button>
              <button
                type="button"
                onClick={() => onLegalNavigate('terms')}
                className="hover:text-primary transition-colors"
              >
                Terms &amp; Conditions
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
