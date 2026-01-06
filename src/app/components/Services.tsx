import { motion } from 'motion/react';
import { Building, Key, MapPin, Star } from 'lucide-react';

interface ServicesProps {
  onServiceClick?: (serviceType: 'sales' | 'management' | 'advisory' | 'marketing') => void;
}

export function Services({ onServiceClick }: ServicesProps) {
  const services = [
    {
      icon: Building,
      title: 'Property Sales & Leasing',
      description: 'Find your dream property or secure the perfect tenant. We handle sales and leases with professionalism and care.',
      gradient: 'from-primary to-accent',
      type: 'sales' as const,
    },
    {
      icon: Key,
      title: 'Property Management',
      description: 'Let us manage your property while you enjoy passive income. Full-service management tailored to your needs.',
      gradient: 'from-accent to-primary',
      type: 'management' as const,
    },
    {
      icon: MapPin,
      title: 'Real Estate Advisory',
      description: 'Expert guidance on market trends, investment opportunities, and strategic property decisions.',
      gradient: 'from-primary to-accent',
      type: 'advisory' as const,
    },
    {
      icon: Star,
      title: 'Property Marketing',
      description: 'Professional marketing strategies to showcase your property to the right audience and maximize value.',
      gradient: 'from-accent to-primary',
      type: 'marketing' as const,
    },
  ];

  return (
    <section id="services" className="py-24 bg-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(255, 107, 26) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent" style={{ fontWeight: 700 }}>
            Our Services
          </h2>
          <p className="text-foreground/70 max-w-2xl mx-auto text-lg">
            Comprehensive real estate solutions designed to meet all your property needs
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all duration-300 group cursor-pointer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              whileHover={{ y: -8, scale: 1.02 }}
              onClick={() => onServiceClick && onServiceClick(service.type)}
            >
              <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${service.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <service.icon className="text-white" size={28} />
              </div>
              <h3 className="mb-3" style={{ fontWeight: 600 }}>
                {service.title}
              </h3>
              <p className="text-foreground/70 text-sm leading-relaxed mb-4">
                {service.description}
              </p>
              <button className="text-primary text-sm group-hover:text-accent transition-colors">
                Learn More →
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}