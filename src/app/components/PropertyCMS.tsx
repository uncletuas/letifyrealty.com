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
  const [typeFilter, setTypeFilter] = useState('all');
  const [isDragging, setIsDragging] = useState(false);
  const maxImages = 5;

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/make-server-ef402f1d/properties`,
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
        ? `https://${projectId}.supabase.co/functions/v1/server/make-server-ef402f1d/properties/${editingProperty.id}`
        : `https://${projectId}.supabase.co/functions/v1/server/make-server-ef402f1d/properties`;

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
        `https://${projectId}.supabase.co/functions/v1/server/make-server-ef402f1d/properties/${id}`,
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

  const isRemoteImage = (value: string) => /^https?:\/\//i.test(value);

  const updateImageUrls = (urls: string[]) => {
    if (!editingProperty) return;
    const localImages = (editingProperty.images || []).filter((img) => !isRemoteImage(img));
    const cleanedUrls = urls.map((url) => url.trim()).filter(Boolean);
    const allowedUrls = cleanedUrls.slice(0, Math.max(0, maxImages - localImages.length));
    setEditingProperty({ ...editingProperty, images: [...localImages, ...allowedUrls] });
  };

  const handleImageFiles = async (files: FileList | File[]) => {
    if (!editingProperty) return;
    const currentImages = editingProperty.images || [];
    const availableSlots = maxImages - currentImages.length;
    if (availableSlots <= 0) return;
    const list = Array.from(files).filter((file) => file.type.startsWith('image/')).slice(0, availableSlots);
    const dataUrls = await Promise.all(
      list.map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = reject;
            reader.readAsDataURL(file);
          })
      )
    );
    setEditingProperty({ ...editingProperty, images: [...currentImages, ...dataUrls] });
  };

  const handleRemoveImage = (image: string) => {
    if (!editingProperty) return;
    const filtered = (editingProperty.images || []).filter((img) => img !== image);
    setEditingProperty({ ...editingProperty, images: filtered });
  };

  const visibleProperties = typeFilter === 'all'
    ? properties
    : properties.filter((property) => property.type?.toLowerCase() === typeFilter.toLowerCase());
  const imageUrls = editingProperty?.images?.filter((img) => isRemoteImage(img)) || [];
  const localImages = editingProperty?.images?.filter((img) => !isRemoteImage(img)) || [];
  const urlSlots = Math.max(imageUrls.length, Math.max(0, maxImages - localImages.length));

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

      <div className="flex flex-wrap gap-3 mb-8">
        {['all', 'sale', 'rent', 'airbnb', 'commercial'].map((type) => (
          <button
            key={type}
            onClick={() => setTypeFilter(type)}
            className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
              typeFilter === type
                ? 'bg-gradient-to-r from-primary to-accent text-white border-transparent'
                : 'border-border text-foreground/70 hover:border-primary/50'
            }`}
          >
            {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Properties List */}
      {loading ? (
        <div className="text-center text-foreground/70">Loading properties...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleProperties.map((property) => (
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
                    <option value="Commercial">Commercial</option>
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
                <label className="block mb-2 text-sm">Images (Up to 5)</label>
                <div
                  className={`rounded-lg border border-dashed p-6 text-center transition-colors ${
                    isDragging ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    handleImageFiles(e.dataTransfer.files);
                  }}
                >
                  <input
                    id="property-images"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) {
                        handleImageFiles(e.target.files);
                      }
                    }}
                  />
                  <div className="text-sm text-foreground/70">Drag and drop images here</div>
                  <label
                    htmlFor="property-images"
                    className="inline-flex items-center justify-center mt-3 px-4 py-2 rounded-lg border border-border text-sm hover:border-primary/50 cursor-pointer transition-colors"
                  >
                    Upload from device
                  </label>
                  <div className="text-xs text-foreground/60 mt-2">JPG, PNG, or WEBP. Max {maxImages} images.</div>
                </div>

                {(editingProperty.images || []).length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                    {(editingProperty.images || []).map((image) => (
                      <div key={image} className="relative group overflow-hidden rounded-lg border border-border">
                        <img src={image} alt="Property" className="h-24 w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(image)}
                          className="absolute inset-0 bg-black/60 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-2 mt-4">
                  {Array.from({ length: urlSlots }).map((_, index) => (
                    <input
                      key={index}
                      type="url"
                      value={imageUrls[index] || ''}
                      onChange={(e) => {
                        const nextUrls = [...imageUrls];
                        nextUrls[index] = e.target.value;
                        updateImageUrls(nextUrls);
                      }}
                      className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder={`Image URL ${index + 1} (optional)`}
                    />
                  ))}
                </div>
                <p className="text-xs text-foreground/60 mt-2">You can paste image URLs or upload from your device.</p>
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
