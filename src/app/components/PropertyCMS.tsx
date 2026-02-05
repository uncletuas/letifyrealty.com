import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Plus, Edit, Trash2, Save } from 'lucide-react';
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

interface PropertyCMSProps {
  onClose: () => void;
  accessToken?: string;
  embedded?: boolean;
}

export function PropertyCMS({ onClose, accessToken, embedded = false }: PropertyCMSProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProperty, setEditingProperty] = useState<Partial<Property> | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-ef402f1d/properties`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken || publicAnonKey}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.properties) {
        setProperties(data.properties);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProperty = async () => {
    if (!editingProperty) return;

    try {
      const url = editingProperty.id
        ? `https://${projectId}.supabase.co/functions/v1/make-server-ef402f1d/properties/${editingProperty.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-ef402f1d/properties`;

      const method = editingProperty.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken || publicAnonKey}`,
        },
        body: JSON.stringify(editingProperty),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        await fetchProperties();
        setIsFormOpen(false);
        setEditingProperty(null);
      } else {
        alert('Error saving property: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error saving property:', error);
      alert('Error saving property');
    }
  };

  const handleDeleteProperty = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-ef402f1d/properties/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken || publicAnonKey}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        await fetchProperties();
      } else {
        alert('Error deleting property');
      }
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Error deleting property');
    }
  };

  const openForm = (property?: Property) => {
    setEditingProperty(property || {
      title: '',
      location: '',
      price: '',
      type: 'Sale',
      description: '',
      bedrooms: 0,
      bathrooms: 0,
      area: '',
      images: [],
      videos: [],
      features: [],
    });
    setIsFormOpen(true);
  };

  const content = (
    <>
      {/* Add Property Button */}
      <div className="mb-8">
        <motion.button
          onClick={() => openForm()}
          className="bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:shadow-lg transition-shadow"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus size={20} />
          <span>Add New Property</span>
        </motion.button>
      </div>

      {/* Properties List */}
      {loading ? (
        <div className="text-center text-foreground/70">Loading properties...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <div
              key={property.id}
              className="bg-card border border-border rounded-xl p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 style={{ fontWeight: 600 }}>{property.title}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => openForm(property)}
                    className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteProperty(property.id)}
                    className="p-2 hover:bg-red-500/10 rounded-lg text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p className="text-foreground/70 text-sm mb-2">{property.location}</p>
              <p className="text-primary" style={{ fontWeight: 600 }}>{property.price}</p>
              <div className="mt-2 inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-xs">
                {property.type}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );

  return (
    <div className={embedded ? '' : 'fixed inset-0 z-50 overflow-y-auto bg-background'}>
      {!embedded && (
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              <h1 style={{ fontWeight: 600, fontSize: '1.5rem' }}>Property Management CMS</h1>
              <button
                onClick={onClose}
                className="p-2 hover:bg-card rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={embedded ? '' : 'container mx-auto px-4 sm:px-6 lg:px-8 py-12'}>
        {embedded && (
          <h2 className="text-xl mb-6" style={{ fontWeight: 700 }}>Property Management</h2>
        )}
        {content}
      </div>

      {/* Property Form Modal */}
      {isFormOpen && editingProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 p-4 overflow-y-auto">
          <motion.div
            className="bg-card border border-border rounded-xl p-8 max-w-2xl w-full my-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h2 className="mb-6" style={{ fontWeight: 600, fontSize: '1.5rem' }}>
              {editingProperty.id ? 'Edit Property' : 'Add New Property'}
            </h2>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              <div>
                <label className="block mb-2 text-sm">Title *</label>
                <input
                  type="text"
                  value={editingProperty.title || ''}
                  onChange={(e) => setEditingProperty({ ...editingProperty, title: e.target.value })}
                  className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Modern Luxury Villa"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm">Location *</label>
                <input
                  type="text"
                  value={editingProperty.location || ''}
                  onChange={(e) => setEditingProperty({ ...editingProperty, location: e.target.value })}
                  className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Lekki Phase 1, Lagos"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm">Price *</label>
                  <input
                    type="text"
                    value={editingProperty.price || ''}
                    onChange={(e) => setEditingProperty({ ...editingProperty, price: e.target.value })}
                    className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="₦85,000,000"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm">Type *</label>
                  <select
                    value={editingProperty.type || 'Sale'}
                    onChange={(e) => setEditingProperty({ ...editingProperty, type: e.target.value })}
                    className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="Sale">Sale</option>
                    <option value="Rent">Rent</option>
                    <option value="Airbnb">Airbnb</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block mb-2 text-sm">Bedrooms</label>
                  <input
                    type="number"
                    value={editingProperty.bedrooms || 0}
                    onChange={(e) => setEditingProperty({ ...editingProperty, bedrooms: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm">Bathrooms</label>
                  <input
                    type="number"
                    value={editingProperty.bathrooms || 0}
                    onChange={(e) => setEditingProperty({ ...editingProperty, bathrooms: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm">Area</label>
                  <input
                    type="text"
                    value={editingProperty.area || ''}
                    onChange={(e) => setEditingProperty({ ...editingProperty, area: e.target.value })}
                    className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="450 sqm"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm">Description</label>
                <textarea
                  value={editingProperty.description || ''}
                  onChange={(e) => setEditingProperty({ ...editingProperty, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  placeholder="Property description..."
                />
              </div>

              <div>
                <label className="block mb-2 text-sm">Images (Up to 5 - Optional)</label>
                <div className="space-y-2">
                  {[0, 1, 2, 3, 4].map((index) => (
                    <input
                      key={index}
                      type="url"
                      value={editingProperty.images?.[index] || ''}
                      onChange={(e) => {
                        const newImages = [...(editingProperty.images || [])];
                        if (e.target.value) {
                          newImages[index] = e.target.value;
                        } else {
                          newImages.splice(index, 1);
                        }
                        setEditingProperty({ ...editingProperty, images: newImages.filter(Boolean) });
                      }}
                      className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder={`Image ${index + 1} URL (optional)`}
                    />
                  ))}
                </div>
                <p className="text-xs text-foreground/60 mt-2">Add up to 5 images for this property. Leave blank if not needed.</p>
              </div>

              <div>
                <label className="block mb-2 text-sm">Features (comma-separated)</label>
                <textarea
                  value={editingProperty.features?.join(', ') || ''}
                  onChange={(e) => setEditingProperty({ ...editingProperty, features: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                  rows={2}
                  className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  placeholder="Swimming Pool, Garden, Parking"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={handleSaveProperty}
                className="flex-1 bg-gradient-to-r from-primary to-accent text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:shadow-lg transition-shadow"
              >
                <Save size={20} />
                <span>Save Property</span>
              </button>
              <button
                onClick={() => {
                  setIsFormOpen(false);
                  setEditingProperty(null);
                }}
                className="px-6 py-3 bg-card border border-border rounded-lg hover:bg-muted transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
