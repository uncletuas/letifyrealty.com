import { motion } from 'motion/react';
import { ArrowLeft, Check } from 'lucide-react';

interface AboutPageProps {
  onBack: () => void;
}

export function AboutPage({ onBack }: AboutPageProps) {
  const values = [
    'Transparency in every transaction',
    'Client-focused approach',
    'Market expertise and insights',
    'Innovative real estate solutions',
    'Professional and reliable service',
    'Long-term relationship building',
  ];

  return (
    <section className="py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.button
          onClick={onBack}
          className="flex items-center gap-2 text-foreground/70 hover:text-primary transition-colors"
          whileHover={{ x: -4 }}
        >
          <ArrowLeft size={18} />
          Back to Home
        </motion.button>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div>
              <h1 className="text-4xl sm:text-5xl mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent" style={{ fontWeight: 700 }}>
                About Letifi Realty
              </h1>
              <p className="text-foreground/80 text-lg leading-relaxed">
                Letifi Realty is a modern real estate company committed to revolutionizing the property industry. We deliver
                smart, transparent, and value-driven solutions that put our clients first.
              </p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-2xl mb-3" style={{ fontWeight: 600 }}>Our Mission</h2>
              <p className="text-foreground/80 leading-relaxed">
                Our mission is to simplify real estate transactions through innovation, expertise, and unwavering commitment
                to excellence. Whether you're buying, selling, renting, or managing property, we're here to guide you every
                step of the way.
              </p>
            </div>

            <div className="bg-gradient-to-r from-primary/10 to-accent/10 border-l-4 border-primary p-6 rounded-r-lg">
              <h3 className="mb-2" style={{ fontWeight: 600 }}>Our Vision</h3>
              <p className="text-foreground/80">
                To become the most trusted and innovative real estate partner, setting new standards for service excellence
                and client satisfaction.
              </p>
            </div>
          </motion.div>

          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="absolute -inset-6 bg-gradient-to-br from-primary/20 to-accent/20 blur-2xl rounded-3xl" />
            <div className="relative overflow-hidden rounded-3xl border border-border">
              <img
                src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1400&q=80"
                alt="Modern city skyline"
                className="w-full h-[420px] object-cover"
              />
            </div>
          </motion.div>
        </div>

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-8">
            <h2 className="text-2xl mb-6" style={{ fontWeight: 600 }}>Why Choose Letifi Realty</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {values.map((value, index) => (
                <motion.div
                  key={value}
                  className="flex items-start gap-3 bg-background border border-border rounded-lg p-4"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Check size={14} className="text-white" />
                  </div>
                  <div className="text-foreground/80">{value}</div>
                </motion.div>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="text-lg mb-3" style={{ fontWeight: 600 }}>Core Services</h3>
              <ul className="space-y-2 text-sm text-foreground/70">
                <li>Property Sales & Leasing</li>
                <li>Property Management</li>
                <li>Real Estate Advisory</li>
                <li>Property Marketing</li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-2xl p-6">
              <h3 className="text-lg mb-3" style={{ fontWeight: 600 }}>Let?s Work Together</h3>
              <p className="text-sm text-foreground/70 mb-4">
                Ready to take the next step? We are here to guide your property journey with clarity and confidence.
              </p>
              <a
                href="mailto:info@letifirealty.com"
                className="inline-flex items-center gap-2 text-primary hover:text-accent transition-colors"
              >
                info@letifirealty.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
