import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MapPin, ArrowRight, Search } from 'lucide-react';
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

interface ListingsProps {
  onPropertyClick?: (propertyId: string) => void;
  limit?: number;
  showFilters?: boolean;
  showSearch?: boolean;
  title?: string;
  subtitle?: string;
  sectionId?: string;
}

export function Listings({
  onPropertyClick,
  limit,
  showFilters = true,
  showSearch = true,
  title = 'Featured Listings',
  subtitle = 'Explore our curated selection of premium properties',
  sectionId = 'listings',
}: ListingsProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    filterProperties();
  }, [searchTerm, typeFilter, properties]);

  const fetchProperties = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/make-server-ef402f1d/properties`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.properties) {
        setProperties(data.properties);
        setFilteredProperties(data.properties);
      } else {
        console.error('Error fetching properties:', data.error);
        // Use default properties if backend is empty
        setProperties(defaultProperties);
        setFilteredProperties(defaultProperties);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      // Use default properties on error
      setProperties(defaultProperties);
      setFilteredProperties(defaultProperties);
    } finally {
      setLoading(false);
    }
  };

  const filterProperties = () => {
    let filtered = [...properties];

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(p => p.type.toLowerCase() === typeFilter.toLowerCase());
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(searchLower) ||
        p.location.toLowerCase().includes(searchLower)
      );
    }

    setFilteredProperties(filtered);
  };

  const defaultProperties: Property[] = [
    {
      id: 'default_1',
      title: 'Modern Luxury Villa',
      location: 'Lekki Phase 1, Lagos',
      price: '₦85,000,000',
      type: 'Sale',
      images: ['https://images.unsplash.com/photo-1638369022547-1c763b1b9b3b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBsdXh1cnklMjBob3VzZXxlbnwxfHx8fDE3NjczNTI3ODB8MA&ixlib=rb-4.1.0&q=80&w=1080'],
      bedrooms: 5,
      bathrooms: 4,
      area: '450 sqm',
      description: 'Stunning modern villa with premium finishes',
      features: ['Swimming Pool', 'Garden', 'Parking']
    },
    {
      id: 'default_2',
      title: 'Luxury Apartment',
      location: 'Victoria Island, Lagos',
      price: '₦3,500,000/yr',
      type: 'Rent',
      images: ['https://images.unsplash.com/photo-1638454668466-e8dbd5462f20?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBhcGFydG1lbnQlMjBpbnRlcmlvcnxlbnwxfHx8fDE3Njc0MDc1NjN8MA&ixlib=rb-4.1.0&q=80&w=1080'],
      bedrooms: 3,
      bathrooms: 3,
      area: '200 sqm',
      description: 'Elegant apartment with modern amenities',
      features: ['Gym', '24/7 Security', 'Elevator']
    },
    {
      id: 'default_3',
      title: 'Contemporary Villa',
      location: 'Banana Island, Lagos',
      price: '₦150,000,000',
      type: 'Sale',
      images: ['https://images.unsplash.com/photo-1622015663381-d2e05ae91b72?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB2aWxsYSUyMGV4dGVyaW9yfGVufDF8fHx8MTc2NzQyMDEwM3ww&ixlib=rb-4.1.0&q=80&w=1080'],
      bedrooms: 6,
      bathrooms: 5,
      area: '600 sqm',
      description: 'Ultra-luxury waterfront property',
      features: ['Private Beach', 'Boat Dock', 'Cinema Room']
    },
    {
      id: 'default_4',
      title: 'Premium Penthouse',
      location: 'Ikoyi, Lagos',
      price: '₦8,000,000/yr',
      type: 'Rent',
      images: ['https://images.unsplash.com/photo-1606723325559-ad1bffa19bde?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb250ZW1wb3JhcnklMjBwZW50aG91c2V8ZW58MXx8fHwxNzY3NDc3NDkwfDA&ixlib=rb-4.1.0&q=80&w=1080'],
      bedrooms: 4,
      bathrooms: 4,
      area: '350 sqm',
      description: 'Spectacular penthouse with city views',
      features: ['Rooftop Terrace', 'Smart Home', 'Concierge']
    },
    {
      id: 'default_5',
      title: 'Executive Estate',
      location: 'Lekki Phase 2, Lagos',
      price: '₦120,000,000',
      type: 'Sale',
      images: ['https://images.unsplash.com/photo-1531971589569-0d9370cbe1e5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjByZWFsJTIwZXN0YXRlfGVufDF8fHx8MTc2NzM5Mjk1OHww&ixlib=rb-4.1.0&q=80&w=1080'],
      bedrooms: 5,
      bathrooms: 5,
      area: '500 sqm',
      description: 'Gated estate with premium security',
      features: ['Club House', 'Tennis Court', 'Playground']
    },
    {
      id: 'default_6',
      title: 'Commercial Building',
      location: 'Marina, Lagos',
      price: '₦250,000,000',
      type: 'Sale',
      images: ['https://images.unsplash.com/photo-1694702740570-0a31ee1525c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2UlMjBidWlsZGluZ3xlbnwxfHx8fDE3Njc0NDcyMTh8MA&ixlib=rb-4.1.0&q=80&w=1080'],
      bedrooms: 0,
      bathrooms: 10,
      area: '2000 sqm',
      description: 'Prime commercial property in business district',
      features: ['Parking Lot', 'Backup Generator', 'High-Speed Internet']
    },
    {
      id: 'default_7',
      title: 'Oceanview Airbnb Retreat',
      location: 'Oniru, Lagos',
      price: 'â‚¦120,000/night',
      type: 'Airbnb',
      images: ['https://images.unsplash.com/photo-1505691938895-1758d7feb511?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxtb2Rlcm4lMjBhaXJibmIlMjBhcGFydG1lbnR8ZW58MXx8fHwxNzY3NDc3NDkwfDA&ixlib=rb-4.1.0&q=80&w=1080'],
      bedrooms: 2,
      bathrooms: 2,
      area: '120 sqm',
      description: 'Luxury short-stay apartment with skyline views',
      features: ['Self Check-In', 'High-Speed Wi-Fi', 'Fully Equipped Kitchen', 'Daily Cleaning']
    },
  ];

  if (loading) {
    return (
      <section id="listings" className="py-24 bg-gradient-to-b from-background to-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-foreground/70">Loading properties...</div>
          </div>
        </div>
      </section>
    );
  }

  const visibleProperties = limit ? filteredProperties.slice(0, limit) : filteredProperties;

  return (
    <section id={sectionId} className="py-24 bg-gradient-to-b from-background to-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent" style={{ fontWeight: 700 }}>
            {title}
          </h2>
          <p className="text-foreground/70 max-w-2xl mx-auto text-lg">
            {subtitle}
          </p>
        </motion.div>

        {/* Filters */}
        {showFilters && (
          <div className="max-w-4xl mx-auto mb-12 space-y-4">
            {/* Search Bar */}
            {showSearch && (
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40" size={20} />
                <input
                  type="text"
                  placeholder="Search by location or property name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
            )}

            {/* Type Filter */}
            <div className="flex flex-wrap gap-3 justify-center">
              {['all', 'sale', 'rent', 'airbnb', 'commercial'].map((type) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-6 py-2 rounded-lg transition-all ${
                    typeFilter === type
                      ? 'bg-gradient-to-r from-primary to-accent text-white'
                      : 'bg-card border border-border text-foreground/70 hover:border-primary/50'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Properties Grid */}
        {filteredProperties.length === 0 ? (
          <div className="text-center text-foreground/70 py-12">
            No properties found matching your criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {visibleProperties.map((property, index) => (
              <motion.div
                key={property.id}
                className="bg-card border border-border rounded-xl overflow-hidden group hover:border-primary/50 transition-all duration-300 cursor-pointer"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -8 }}
                onClick={() => onPropertyClick && onPropertyClick(property.id)}
              >
                {/* Image */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={property.images?.[0] || 'https://images.unsplash.com/photo-1638369022547-1c763b1b9b3b'}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-sm">
                    {property.type}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="mb-2" style={{ fontWeight: 600 }}>
                    {property.title}
                  </h3>
                  <div className="flex items-center gap-2 text-foreground/70 text-sm mb-4">
                    <MapPin size={16} className="text-primary" />
                    <span>{property.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-primary" style={{ fontWeight: 700, fontSize: '1.25rem' }}>
                      {property.price}
                    </p>
                    <motion.button
                      className="bg-gradient-to-r from-primary to-accent text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:shadow-lg transition-shadow"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onPropertyClick && onPropertyClick(property.id);
                      }}
                    >
                      <span className="text-sm">View Details</span>
                      <ArrowRight size={16} />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
