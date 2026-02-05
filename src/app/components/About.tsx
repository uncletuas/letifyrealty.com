import { motion } from 'motion/react';
import { Check } from 'lucide-react';

export function About() {
  const values = [
    'Transparency in every transaction',
    'Client-focused approach',
    'Market expertise and insights',
    'Innovative real estate solutions',
    'Professional and reliable service',
    'Long-term relationship building',
  ];

  return (
    <section id="about" className="py-24 bg-card relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/5 to-transparent" />
      <div className="absolute bottom-0 left-0 w-1/3 h-full bg-gradient-to-r from-accent/5 to-transparent" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent" style={{ fontWeight: 700 }}>
              About Letifi Realty
            </h2>
            <p className="text-foreground/80 text-lg mb-6 leading-relaxed">
              Letifi Realty is a modern real estate company committed to revolutionizing the property industry. We believe in providing smart, transparent, and value-driven solutions that put our clients first.
            </p>
            <p className="text-foreground/80 text-lg mb-8 leading-relaxed">
              Our mission is to simplify real estate transactions through innovation, expertise, and unwavering commitment to excellence. Whether you're buying, selling, renting, or managing property, we're here to guide you every step of the way.
            </p>

            {/* Vision Statement */}
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 border-l-4 border-primary p-6 rounded-r-lg mb-8">
              <h3 className="mb-2" style={{ fontWeight: 600 }}>Our Vision</h3>
              <p className="text-foreground/80">
                To become the most trusted and innovative real estate partner, setting new standards for service excellence and client satisfaction.
              </p>
            </div>
          </motion.div>

          {/* Right Content - Values */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-background border border-border rounded-xl p-8">
              <h3 className="mb-6" style={{ fontWeight: 600, fontSize: '1.5rem' }}>
                Why Choose Us
              </h3>
              <div className="space-y-4">
                {values.map((value, index) => (
                  <motion.div
                    key={value}
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                  >
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mt-0.5">
                      <Check size={14} className="text-white" />
                    </div>
                    <p className="text-foreground/80">{value}</p>
                  </motion.div>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mt-8 pt-8 border-t border-border">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent" style={{ fontWeight: 700 }}>
                    500+
                  </div>
                  <div className="text-foreground/60 text-sm mt-1">Properties</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent" style={{ fontWeight: 700 }}>
                    1000+
                  </div>
                  <div className="text-foreground/60 text-sm mt-1">Happy Clients</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent" style={{ fontWeight: 700 }}>
                    5+
                  </div>
                  <div className="text-foreground/60 text-sm mt-1">Years</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
