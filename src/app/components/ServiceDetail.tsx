import { motion } from 'motion/react';
import { X, ArrowLeft, Check } from 'lucide-react';

interface ServiceDetailProps {
  serviceType: 'sales' | 'management' | 'advisory' | 'marketing';
  onClose: () => void;
}

export function ServiceDetail({ serviceType, onClose }: ServiceDetailProps) {
  const services = {
    sales: {
      title: 'Property Sales & Leasing',
      subtitle: 'Find Your Perfect Property or Secure the Ideal Tenant',
      description: 'Whether you\'re looking to buy your dream home or lease a premium property, Letify Realty offers comprehensive sales and leasing services tailored to your needs.',
      image: 'https://images.unsplash.com/photo-1638369022547-1c763b1b9b3b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBsdXh1cnklMjBob3VzZXxlbnwxfHx8fDE3NjczNTI3ODB8MA&ixlib=rb-4.1.0&q=80&w=1080',
      benefits: [
        'Extensive property database with verified listings',
        'Expert negotiation to get you the best deals',
        'Complete legal documentation and support',
        'Virtual and physical property tours',
        'Market value assessments',
        'Flexible payment plans',
      ],
      process: [
        { step: 'Consultation', description: 'Understand your requirements and budget' },
        { step: 'Property Search', description: 'Find properties matching your criteria' },
        { step: 'Site Visits', description: 'Tour selected properties' },
        { step: 'Negotiation', description: 'Secure the best price and terms' },
        { step: 'Documentation', description: 'Handle all legal paperwork' },
        { step: 'Handover', description: 'Complete the transaction smoothly' },
      ],
    },
    management: {
      title: 'Property Management',
      subtitle: 'Professional Management for Maximum Returns',
      description: 'Let us handle the day-to-day management of your property while you enjoy hassle-free passive income. Our comprehensive property management services ensure your investment is well-maintained and profitable.',
      image: 'https://images.unsplash.com/photo-1638454668466-e8dbd5462f20?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBhcGFydG1lbnQlMjBpbnRlcmlvcnxlbnwxfHx8fDE3Njc0MDc1NjN8MA&ixlib=rb-4.1.0&q=80&w=1080',
      benefits: [
        'Tenant screening and placement',
        'Rent collection and financial reporting',
        'Property maintenance and repairs',
        '24/7 emergency response',
        'Legal compliance and documentation',
        'Regular property inspections',
      ],
      process: [
        { step: 'Property Assessment', description: 'Evaluate your property and set competitive rates' },
        { step: 'Marketing', description: 'Advertise to attract quality tenants' },
        { step: 'Tenant Screening', description: 'Thorough background and credit checks' },
        { step: 'Lease Agreement', description: 'Professional contracts and documentation' },
        { step: 'Ongoing Management', description: 'Handle maintenance, repairs, and tenant relations' },
        { step: 'Reporting', description: 'Regular financial and property status reports' },
      ],
    },
    advisory: {
      title: 'Real Estate Advisory',
      subtitle: 'Expert Guidance for Smart Investment Decisions',
      description: 'Make informed real estate decisions with our expert advisory services. We provide market insights, investment strategies, and professional guidance to help you maximize your real estate portfolio.',
      image: 'https://images.unsplash.com/photo-1531971589569-0d9370cbe1e5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjByZWFsJTIwZXN0YXRlfGVufDF8fHx8MTc2NzM5Mjk1OHww&ixlib=rb-4.1.0&q=80&w=1080',
      benefits: [
        'Market trend analysis and forecasting',
        'Investment opportunity identification',
        'Portfolio diversification strategies',
        'Risk assessment and mitigation',
        'Property valuation services',
        'Exit strategy planning',
      ],
      process: [
        { step: 'Initial Consultation', description: 'Understand your investment goals' },
        { step: 'Market Analysis', description: 'Research current trends and opportunities' },
        { step: 'Strategy Development', description: 'Create customized investment plan' },
        { step: 'Property Evaluation', description: 'Assess potential investments' },
        { step: 'Implementation Support', description: 'Guide through the investment process' },
        { step: 'Ongoing Monitoring', description: 'Regular portfolio reviews and updates' },
      ],
    },
    marketing: {
      title: 'Property Marketing',
      subtitle: 'Showcase Your Property to the Right Audience',
      description: 'Our professional marketing services ensure your property gets maximum exposure to qualified buyers and tenants. We use cutting-edge marketing strategies to showcase your property\'s best features.',
      image: 'https://images.unsplash.com/photo-1694702740570-0a31ee1525c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2UlMjBidWlsZGluZ3xlbnwxfHx8fDE3Njc0NDcyMTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
      benefits: [
        'Professional photography and videography',
        'Virtual tours and 3D walkthroughs',
        'Multi-channel digital marketing',
        'Social media promotion',
        'Targeted advertising campaigns',
        'Open house organization',
      ],
      process: [
        { step: 'Property Preparation', description: 'Prepare and stage your property' },
        { step: 'Content Creation', description: 'Professional photos, videos, and descriptions' },
        { step: 'Listing Optimization', description: 'Create compelling property listings' },
        { step: 'Multi-Channel Distribution', description: 'Advertise across platforms' },
        { step: 'Lead Management', description: 'Handle inquiries and schedule viewings' },
        { step: 'Performance Tracking', description: 'Monitor and optimize campaign results' },
      ],
    },
  };

  const service = services[serviceType];

  const scrollToContact = () => {
    onClose();
    setTimeout(() => {
      const element = document.getElementById('contact');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <motion.button
              onClick={onClose}
              className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
              whileHover={{ x: -4 }}
            >
              <ArrowLeft size={20} />
              <span>Back to Home</span>
            </motion.button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-card rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <motion.div
          className="relative rounded-2xl overflow-hidden mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <img
            src={service.image}
            alt={service.title}
            className="w-full h-96 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent flex items-end">
            <div className="p-8 w-full">
              <h1 className="text-4xl sm:text-5xl mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent" style={{ fontWeight: 700 }}>
                {service.title}
              </h1>
              <p className="text-xl text-foreground/80 max-w-3xl">
                {service.subtitle}
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-2xl sm:text-3xl mb-4" style={{ fontWeight: 600 }}>
                Overview
              </h2>
              <p className="text-foreground/80 text-lg leading-relaxed">
                {service.description}
              </p>
            </motion.div>

            {/* Benefits */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-2xl sm:text-3xl mb-6" style={{ fontWeight: 600 }}>
                What We Offer
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {service.benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start gap-3 bg-card border border-border rounded-lg p-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check size={14} className="text-white" />
                    </div>
                    <span className="text-foreground/80">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Process */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-2xl sm:text-3xl mb-6" style={{ fontWeight: 600 }}>
                Our Process
              </h2>
              <div className="space-y-4">
                {service.process.map((item, index) => (
                  <motion.div
                    key={index}
                    className="bg-card border border-border rounded-xl p-6 flex gap-6"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <span className="text-white" style={{ fontWeight: 700, fontSize: '1.25rem' }}>
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <h3 className="mb-2" style={{ fontWeight: 600 }}>
                        {item.step}
                      </h3>
                      <p className="text-foreground/70">{item.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar - CTA */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <motion.div
                className="bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-8"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="mb-4" style={{ fontWeight: 600, fontSize: '1.5rem' }}>
                  Ready to Get Started?
                </h3>
                <p className="text-foreground/80 mb-6">
                  Contact us today to learn more about our {service.title.toLowerCase()} services and how we can help you achieve your real estate goals.
                </p>
                <motion.button
                  onClick={scrollToContact}
                  className="w-full bg-gradient-to-r from-primary to-accent text-white py-3 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Contact Us Now
                </motion.button>

                <div className="mt-8 pt-8 border-t border-border">
                  <div className="space-y-4">
                    <div>
                      <div className="text-foreground/60 text-sm mb-1">Call Us</div>
                      <a href="tel:+2348000000000" className="text-primary hover:text-accent transition-colors">
                        +234 800 000 0000
                      </a>
                    </div>
                    <div>
                      <div className="text-foreground/60 text-sm mb-1">Email</div>
                      <a href="mailto:info@letifyrealty.com" className="text-primary hover:text-accent transition-colors">
                        info@letifyrealty.com
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Why Choose Us */}
              <motion.div
                className="mt-6 bg-card border border-border rounded-xl p-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="mb-4" style={{ fontWeight: 600 }}>
                  Why Choose Letify Realty?
                </h3>
                <ul className="space-y-3 text-foreground/80 text-sm">
                  <li className="flex items-start gap-2">
                    <Check size={16} className="text-primary mt-0.5 flex-shrink-0" />
                    <span>Experienced professionals</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check size={16} className="text-primary mt-0.5 flex-shrink-0" />
                    <span>Transparent processes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check size={16} className="text-primary mt-0.5 flex-shrink-0" />
                    <span>Client-focused approach</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check size={16} className="text-primary mt-0.5 flex-shrink-0" />
                    <span>Proven track record</span>
                  </li>
                </ul>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
