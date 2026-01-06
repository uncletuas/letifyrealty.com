import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, MapPin, Phone, Mail, MessageCircle, ArrowLeft, Home, Check } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

interface Property {
  id: string;
  title: string;
  location: string;
  price: string;
  type: string;
  description?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: string;
  images?: string[];
  videos?: string[];
  features?: string[];
}

interface PropertyDetailsProps {
  propertyId: string;
  onClose: () => void;
}

export function PropertyDetails({ propertyId, onClose }: PropertyDetailsProps) {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    fetchProperty();
  }, [propertyId]);

  const fetchProperty = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-ef402f1d/properties/${propertyId}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.property) {
        setProperty(data.property);
      } else {
        console.error('Error fetching property:', data.error);
      }
    } catch (error) {
      console.error('Error fetching property:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-ef402f1d/property-inquiries`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            propertyId,
            ...formData,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', phone: '', message: '' });
        setTimeout(() => setSubmitStatus('idle'), 5000);
      } else {
        console.error('Error submitting inquiry:', data.error);
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95">
        <div className="text-foreground">Loading property details...</div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95">
        <div className="text-center">
          <div className="text-foreground mb-4">Property not found</div>
          <button
            onClick={onClose}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const images = property.images && property.images.length > 0 ? property.images : [
    'https://images.unsplash.com/photo-1638369022547-1c763b1b9b3b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBsdXh1cnklMjBob3VzZXxlbnwxfHx8fDE3NjczNTI3ODB8MA&ixlib=rb-4.1.0&q=80&w=1080'
  ];

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
              <span>Back to Listings</span>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Images and Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Main Image */}
            <motion.div
              className="relative rounded-xl overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <img
                src={images[selectedImageIndex]}
                alt={property.title}
                className="w-full h-96 lg:h-[500px] object-cover"
              />
              <div className="absolute top-4 right-4 bg-primary text-white px-4 py-2 rounded-full">
                {property.type}
              </div>
            </motion.div>

            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-4 gap-4">
              {images.map((image, index) => (
                <motion.button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImageIndex === index ? 'border-primary' : 'border-transparent'
                  }`}
                  whileHover={{ scale: 1.05 }}
                >
                  <img
                    src={image}
                    alt={`${property.title} ${index + 1}`}
                    className="w-full h-24 object-cover"
                  />
                </motion.button>
              ))}
            </div>

            {/* Videos Section */}
            {property.videos && property.videos.length > 0 && (
              <div>
                <h3 className="mb-4" style={{ fontWeight: 600, fontSize: '1.5rem' }}>
                  Property Videos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {property.videos.map((video, index) => (
                    <div key={index} className="rounded-lg overflow-hidden bg-card">
                      <video
                        src={video}
                        controls
                        className="w-full h-64 object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Property Details */}
            <div className="bg-card border border-border rounded-xl p-8">
              <h1 className="mb-4" style={{ fontWeight: 700, fontSize: '2rem' }}>
                {property.title}
              </h1>
              <div className="flex items-center gap-2 text-foreground/70 mb-6">
                <MapPin size={20} className="text-primary" />
                <span className="text-lg">{property.location}</span>
              </div>
              <div className="text-primary mb-8" style={{ fontWeight: 700, fontSize: '2.5rem' }}>
                {property.price}
              </div>

              {/* Specs */}
              <div className="grid grid-cols-3 gap-6 mb-8 pb-8 border-b border-border">
                {property.bedrooms ? (
                  <div className="text-center">
                    <div className="text-2xl mb-1" style={{ fontWeight: 600 }}>
                      {property.bedrooms}
                    </div>
                    <div className="text-foreground/60 text-sm">Bedrooms</div>
                  </div>
                ) : null}
                {property.bathrooms ? (
                  <div className="text-center">
                    <div className="text-2xl mb-1" style={{ fontWeight: 600 }}>
                      {property.bathrooms}
                    </div>
                    <div className="text-foreground/60 text-sm">Bathrooms</div>
                  </div>
                ) : null}
                {property.area ? (
                  <div className="text-center">
                    <div className="text-2xl mb-1" style={{ fontWeight: 600 }}>
                      {property.area}
                    </div>
                    <div className="text-foreground/60 text-sm">Area</div>
                  </div>
                ) : null}
              </div>

              {/* Description */}
              {property.description && (
                <div className="mb-8">
                  <h3 className="mb-4" style={{ fontWeight: 600, fontSize: '1.25rem' }}>
                    Description
                  </h3>
                  <p className="text-foreground/80 leading-relaxed">{property.description}</p>
                </div>
              )}

              {/* Features */}
              {property.features && property.features.length > 0 && (
                <div>
                  <h3 className="mb-4" style={{ fontWeight: 600, fontSize: '1.25rem' }}>
                    Features & Amenities
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {property.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                          <Check size={12} className="text-white" />
                        </div>
                        <span className="text-foreground/80">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Contact Card */}
              <motion.div
                className="bg-card border border-border rounded-xl p-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="mb-6" style={{ fontWeight: 600, fontSize: '1.25rem' }}>
                  Interested in this property?
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block mb-2 text-sm text-foreground/80">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block mb-2 text-sm text-foreground/80">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block mb-2 text-sm text-foreground/80">
                      Phone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                      placeholder="+234 800 000 0000"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block mb-2 text-sm text-foreground/80">
                      Message (Optional)
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none text-sm"
                      placeholder="I'm interested in this property..."
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-primary to-accent text-white py-3 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                    whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                  >
                    {isSubmitting ? 'Sending...' : 'Send Inquiry'}
                  </motion.button>

                  {submitStatus === 'success' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-green-500/10 border border-green-500/50 text-green-500 px-4 py-3 rounded-lg text-center text-sm"
                    >
                      Thank you! We'll contact you soon.
                    </motion.div>
                  )}

                  {submitStatus === 'error' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg text-center text-sm"
                    >
                      Something went wrong. Please try again.
                    </motion.div>
                  )}
                </form>
              </motion.div>

              {/* Direct Contact Options */}
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-6">
                <h3 className="mb-4" style={{ fontWeight: 600 }}>
                  Or Contact Us Directly
                </h3>
                <div className="space-y-3">
                  <a
                    href="tel:+2349067435048"
                    className="flex items-center gap-3 p-3 bg-card rounded-lg hover:bg-primary/10 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Phone className="text-white" size={18} />
                    </div>
                    <div>
                      <div className="text-xs text-foreground/60">Call Us</div>
                      <div className="text-sm">+234 906 743 5048</div>
                    </div>
                  </a>

                  <a
                    href="https://wa.me/2349067435048"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-card rounded-lg hover:bg-primary/10 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center group-hover:scale-110 transition-transform">
                      <MessageCircle className="text-white" size={18} />
                    </div>
                    <div>
                      <div className="text-xs text-foreground/60">WhatsApp</div>
                      <div className="text-sm">Chat with us</div>
                    </div>
                  </a>

                  <a
                    href="mailto:info@letifyrealty.com"
                    className="flex items-center gap-3 p-3 bg-card rounded-lg hover:bg-primary/10 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Mail className="text-white" size={18} />
                    </div>
                    <div>
                      <div className="text-xs text-foreground/60">Email</div>
                      <div className="text-sm">info@letifyrealty.com</div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}