import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MapPin, ArrowRight, Search } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { fetchJson } from '../../../utils/api';
import { defaultProperties } from '../data/default-properties';

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
      const result = await fetchJson<{ properties?: Property[]; error?: string }>(
        `https://${projectId}.supabase.co/functions/v1/server/properties`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      if (result.ok && result.data?.properties) {
        setProperties(result.data.properties);
        setFilteredProperties(result.data.properties);
      } else {
        console.error('Error fetching properties:', result.data?.error || result.errorText);
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
