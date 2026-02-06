import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

export function Hero() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const actions = [
    { label: 'Buy', color: 'bg-primary hover:bg-primary/90' },
    { label: 'Sell', color: 'bg-accent hover:bg-accent/90' },
    { label: 'Rent', color: 'bg-primary hover:bg-primary/90' },
    { label: 'Manage', color: 'bg-accent hover:bg-accent/90' },
  ];

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1638369022547-1c763b1b9b3b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBsdXh1cnklMjBob3VzZXxlbnwxfHx8fDE3NjczNTI3ODB8MA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Luxury Property"
          className="w-full h-full object-cover"
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/70 to-background/60" />
      </div>
      
      {/* Animated Gradient Orbs */}
      <motion.div
        className="absolute top-1/4 -right-48 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute -bottom-48 -left-48 w-96 h-96 bg-accent/20 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.5, 0.3, 0.5],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1 
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl max-w-5xl mx-auto mb-6 bg-gradient-to-r from-foreground via-accent to-primary bg-clip-text text-transparent"
            style={{ fontWeight: 700, lineHeight: 1.2 }}
          >
            Your Compass to Better Property
          </motion.h1>
          
          <motion.p
            className="text-lg sm:text-xl text-foreground/70 max-w-2xl mx-auto mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Experience a new era of real estate with Letifi Realty. We deliver transparency, trust, and value in every transaction.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-4 mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            {actions.map((action, index) => (
              <motion.button
                key={action.label}
                onClick={() => scrollToSection('contact')}
                className={`${action.color} text-white px-8 py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl`}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                {action.label}
              </motion.button>
            ))}
          </motion.div>

          {/* CTA to Services */}
          <motion.button
            onClick={() => scrollToSection('services')}
            className="inline-flex items-center gap-2 text-primary hover:text-accent transition-colors group"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            <span>Explore Our Services</span>
            <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
