import { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { motion } from 'motion/react';
import { X, MapPin, Phone, Mail, MessageCircle, ArrowLeft, Home, Check } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { fetchJson } from '../../../utils/api';
import { supabase } from '../../../utils/supabase/client';

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
  const [session, setSession] = useState<Session | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const reservationDefaults = {
    name: '',
    email: '',
    phone: '',
    checkIn: '',
    checkOut: '',
    moveIn: '',
    guests: 1,
    leaseTerm: '12 months',
    notes: '',
    createAccount: false,
    paymentMethod: 'Card',
  };
  const [reservationData, setReservationData] = useState(reservationDefaults);
  const [isReservationSubmitting, setIsReservationSubmitting] = useState(false);
  const [reservationStatus, setReservationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const inspectionDefaults = {
    name: '',
    email: '',
    phone: '',
    preferredDate: '',
    preferredTime: '',
    notes: '',
  };
  const [inspectionData, setInspectionData] = useState(inspectionDefaults);
  const [inspectionStatus, setInspectionStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const consultationDefaults = {
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    topic: 'Property Consultation',
    notes: '',
  };
  const [consultationData, setConsultationData] = useState(consultationDefaults);
  const [consultationStatus, setConsultationStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [showInspectionForm, setShowInspectionForm] = useState(false);
  const [showConsultationForm, setShowConsultationForm] = useState(false);
  const [showInquiryForm, setShowInquiryForm] = useState(false);

  useEffect(() => {
    fetchProperty();
  }, [propertyId]);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setSession(data.session);
      }
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const fetchProperty = async () => {
    try {
      const result = await fetchJson<{ property?: Property; error?: string }>(
        `https://${projectId}.supabase.co/functions/v1/server/properties/${propertyId}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (result.ok && result.data?.property) {
        setProperty(result.data.property);
      } else {
        console.error('Error fetching property:', result.data?.error || result.errorText);
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
      const result = await fetchJson<{ success?: boolean; error?: string }>(
        `https://${projectId}.supabase.co/functions/v1/server/property-inquiries`,
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

      if (result.ok && result.data?.success) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', phone: '', message: '' });
        setTimeout(() => setSubmitStatus('idle'), 5000);
      } else {
        console.error('Error submitting inquiry:', result.data?.error || result.errorText);
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

  const handleReservationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setReservationData((prev) => ({
      ...prev,
      [name]: name === 'guests'
        ? Math.max(1, parseInt(value, 10) || 1)
        : type === 'checkbox'
          ? checked
          : value,
    }));
  };

  const buildReservationMessage = (reservationType: 'airbnb' | 'rent') => {
    const details = [
      `Reservation Type: ${reservationType === 'airbnb' ? 'Airbnb' : 'Rent'}`,
    ];

    if (reservationType === 'airbnb') {
      details.push(`Check-in: ${reservationData.checkIn}`);
      details.push(`Check-out: ${reservationData.checkOut}`);
      details.push(`Guests: ${reservationData.guests}`);
    } else {
      details.push(`Move-in Date: ${reservationData.moveIn}`);
      details.push(`Lease Term: ${reservationData.leaseTerm}`);
      details.push(`Household Size: ${reservationData.guests}`);
    }

    details.push(`Payment Method: ${reservationData.paymentMethod}`);
    details.push(`Account Requested: ${reservationData.createAccount ? 'Yes' : 'No'}`);

    if (reservationData.notes) {
      details.push(`Notes: ${reservationData.notes}`);
    }

    return details.join('\n');
  };

  const handleReservationSubmit = async (reservationType: 'airbnb' | 'rent', e: React.FormEvent) => {
    e.preventDefault();
    setIsReservationSubmitting(true);
    setReservationStatus('idle');
    if (!property) {
      setReservationStatus('error');
      setIsReservationSubmitting(false);
      return;
    }

    try {
      const inquiryResult = await fetchJson<{ success?: boolean; error?: string }>(
        `https://${projectId}.supabase.co/functions/v1/server/property-inquiries`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            propertyId,
            name: reservationData.name,
            email: reservationData.email,
            phone: reservationData.phone,
            message: buildReservationMessage(reservationType),
          }),
        }
      );

      if (inquiryResult.ok && inquiryResult.data?.success) {
        const reservationResult = await fetchJson<{ success?: boolean; error?: string }>(
          `https://${projectId}.supabase.co/functions/v1/server/reservations`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({
              propertyId,
              propertyTitle: property.title,
              propertyType: property.type,
              name: reservationData.name,
              email: reservationData.email,
              phone: reservationData.phone,
              checkIn: reservationData.checkIn,
              checkOut: reservationData.checkOut,
              moveIn: reservationData.moveIn,
              guests: reservationData.guests,
              leaseTerm: reservationData.leaseTerm,
              notes: reservationData.notes,
              paymentMethod: reservationData.paymentMethod,
            }),
          }
        );
        if (!reservationResult.ok) {
          console.error('Error submitting reservation:', reservationResult.data?.error || reservationResult.errorText);
        }
        setReservationStatus('success');
        if (session?.access_token) {
          const requestResult = await fetchJson<{ success?: boolean; error?: string }>(
            `https://${projectId}.supabase.co/functions/v1/server/requests`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({
                requestType: 'purchase',
                serviceType: 'Reservation',
                propertyType: property.type,
                propertyId,
                budget: property.price,
                message: `Reservation for ${property.title}\n${buildReservationMessage(reservationType)}`,
              }),
            }
          );
          if (!requestResult.ok) {
            console.error('Error submitting purchase request:', requestResult.data?.error || requestResult.errorText);
          }
        }
        setReservationData(reservationDefaults);
        setTimeout(() => setReservationStatus('idle'), 5000);
      } else {
        console.error('Error submitting reservation:', inquiryResult.data?.error || inquiryResult.errorText);
        setReservationStatus('error');
      }
    } catch (error) {
      console.error('Error submitting reservation:', error);
      setReservationStatus('error');
    } finally {
      setIsReservationSubmitting(false);
    }
  };

  const handleInspectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property) return;
    setInspectionStatus('sending');
    try {
      const result = await fetchJson<{ success?: boolean; error?: string }>(
        `https://${projectId}.supabase.co/functions/v1/server/inspections`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            propertyId,
            propertyTitle: property.title,
            propertyType: property.type,
            name: inspectionData.name,
            email: inspectionData.email,
            phone: inspectionData.phone,
            preferredDate: inspectionData.preferredDate,
            preferredTime: inspectionData.preferredTime,
            notes: inspectionData.notes,
          }),
        }
      );
      if (result.ok && result.data?.success) {
        setInspectionStatus('sent');
        setInspectionData(inspectionDefaults);
        setTimeout(() => setInspectionStatus('idle'), 4000);
      } else {
        console.error('Error booking inspection:', result.data?.error || result.errorText);
        setInspectionStatus('error');
      }
    } catch (error) {
      console.error('Error booking inspection:', error);
      setInspectionStatus('error');
    }
  };

  const handleConsultationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property) return;
    setConsultationStatus('sending');
    try {
      const result = await fetchJson<{ success?: boolean; error?: string }>(
        `https://${projectId}.supabase.co/functions/v1/server/consultations`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            propertyId,
            propertyTitle: property.title,
            name: consultationData.name,
            email: consultationData.email,
            phone: consultationData.phone,
            date: consultationData.date,
            time: consultationData.time,
            topic: consultationData.topic,
            notes: consultationData.notes,
          }),
        }
      );
      if (result.ok && result.data?.success) {
        setConsultationStatus('sent');
        setConsultationData(consultationDefaults);
        setTimeout(() => setConsultationStatus('idle'), 4000);
      } else {
        console.error('Error submitting consultation:', result.data?.error || result.errorText);
        setConsultationStatus('error');
      }
    } catch (error) {
      console.error('Error requesting consultation:', error);
      setConsultationStatus('error');
    }
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
  const propertyType = property.type.toLowerCase();
  const isAirbnb = propertyType === 'airbnb';
  const isRent = propertyType === 'rent';
  const supportsReservation = isAirbnb || isRent;

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
              {supportsReservation && (
                <motion.div
                  className="bg-card border border-border rounded-xl p-6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 style={{ fontWeight: 600, fontSize: '1.25rem' }}>
                      {isAirbnb ? 'Book This Stay' : 'Reserve & Pay Rent'}
                    </h3>
                    <span className="text-xs text-foreground/60">Account optional</span>
                  </div>

                  <form
                    onSubmit={(e) => handleReservationSubmit(isAirbnb ? 'airbnb' : 'rent', e)}
                    className="space-y-4 max-h-[65vh] overflow-y-auto pr-2"
                  >
                    {isAirbnb ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="checkIn" className="block mb-2 text-sm text-foreground/80">
                            Check-In
                          </label>
                          <input
                            type="date"
                            id="checkIn"
                            name="checkIn"
                            value={reservationData.checkIn}
                            onChange={handleReservationChange}
                            required
                            className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                          />
                        </div>
                        <div>
                          <label htmlFor="checkOut" className="block mb-2 text-sm text-foreground/80">
                            Check-Out
                          </label>
                          <input
                            type="date"
                            id="checkOut"
                            name="checkOut"
                            value={reservationData.checkOut}
                            onChange={handleReservationChange}
                            required
                            className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                          />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label htmlFor="moveIn" className="block mb-2 text-sm text-foreground/80">
                          Move-In Date
                        </label>
                        <input
                          type="date"
                          id="moveIn"
                          name="moveIn"
                          value={reservationData.moveIn}
                          onChange={handleReservationChange}
                          required
                          className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                        />
                      </div>
                    )}

                    {isAirbnb ? (
                      <div>
                        <label htmlFor="guests" className="block mb-2 text-sm text-foreground/80">
                          Guests
                        </label>
                        <input
                          type="number"
                          id="guests"
                          name="guests"
                          min={1}
                          value={reservationData.guests}
                          onChange={handleReservationChange}
                          className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                        />
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="guests" className="block mb-2 text-sm text-foreground/80">
                            Household Size
                          </label>
                          <input
                            type="number"
                            id="guests"
                            name="guests"
                            min={1}
                            value={reservationData.guests}
                            onChange={handleReservationChange}
                            className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                          />
                        </div>
                        <div>
                          <label htmlFor="leaseTerm" className="block mb-2 text-sm text-foreground/80">
                            Lease Term
                          </label>
                          <select
                            id="leaseTerm"
                            name="leaseTerm"
                            value={reservationData.leaseTerm}
                            onChange={handleReservationChange}
                            className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                          >
                            <option value="6 months">6 months</option>
                            <option value="12 months">12 months</option>
                            <option value="24 months">24 months</option>
                          </select>
                        </div>
                      </div>
                    )}

                    <div>
                      <label htmlFor="reservationName" className="block mb-2 text-sm text-foreground/80">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="reservationName"
                        name="name"
                        value={reservationData.name}
                        onChange={handleReservationChange}
                        required
                        className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label htmlFor="reservationEmail" className="block mb-2 text-sm text-foreground/80">
                        Email
                      </label>
                      <input
                        type="email"
                        id="reservationEmail"
                        name="email"
                        value={reservationData.email}
                        onChange={handleReservationChange}
                        required
                        className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                        placeholder="you@example.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="reservationPhone" className="block mb-2 text-sm text-foreground/80">
                        Phone
                      </label>
                      <input
                        type="tel"
                        id="reservationPhone"
                        name="phone"
                        value={reservationData.phone}
                        onChange={handleReservationChange}
                        required
                        className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                        placeholder="+234 800 000 0000"
                      />
                    </div>

                    <div>
                      <label htmlFor="paymentMethod" className="block mb-2 text-sm text-foreground/80">
                        Payment Method
                      </label>
                      <select
                        id="paymentMethod"
                        name="paymentMethod"
                        value={reservationData.paymentMethod}
                        onChange={handleReservationChange}
                        className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                      >
                        <option value="Card">Card</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Split Payment">Split Payment</option>
                      </select>
                    </div>

                    <label className="flex items-start gap-3 text-sm text-foreground/80">
                      <input
                        type="checkbox"
                        name="createAccount"
                        checked={reservationData.createAccount}
                        onChange={handleReservationChange}
                        className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary/50"
                      />
                      <span>
                        Create a Letifi account to manage reservations and payment history.
                        <span className="block text-xs text-foreground/60">We will email an account setup link after payment.</span>
                      </span>
                    </label>

                    <div>
                      <label htmlFor="notes" className="block mb-2 text-sm text-foreground/80">
                        Notes (Optional)
                      </label>
                      <textarea
                        id="notes"
                        name="notes"
                        value={reservationData.notes}
                        onChange={handleReservationChange}
                        rows={3}
                        className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none text-sm"
                        placeholder="Any special requests or questions?"
                      />
                    </div>

                    <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-xs text-foreground/70">
                      Secure payments supported. You can checkout as a guest or create an account for faster future bookings.
                    </div>

                    <motion.button
                      type="submit"
                      disabled={isReservationSubmitting}
                      className="w-full bg-gradient-to-r from-primary to-accent text-white py-3 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      whileHover={{ scale: isReservationSubmitting ? 1 : 1.02 }}
                      whileTap={{ scale: isReservationSubmitting ? 1 : 0.98 }}
                    >
                      {isReservationSubmitting ? 'Processing...' : 'Proceed to Payment'}
                    </motion.button>

                    {reservationStatus === 'success' && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-green-500/10 border border-green-500/50 text-green-500 px-4 py-3 rounded-lg text-center text-sm"
                      >
                        Reservation received! We will email your confirmation and payment details shortly.
                      </motion.div>
                    )}

                    {reservationStatus === 'error' && (
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
              )}

              <motion.div
                className="bg-card border border-border rounded-xl p-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 style={{ fontWeight: 600, fontSize: '1.25rem' }}>
                    Book an Inspection
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowInspectionForm((prev) => !prev)}
                    className="text-sm text-primary hover:text-accent transition-colors"
                  >
                    {showInspectionForm ? 'Hide Form' : 'Open Form'}
                  </button>
                </div>
                {showInspectionForm && (
                  <div className="max-h-[60vh] overflow-y-auto pr-2">
                    <form onSubmit={handleInspectionSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2 text-sm text-foreground/80">Preferred Date</label>
                      <input
                        type="date"
                        value={inspectionData.preferredDate}
                        onChange={(e) => setInspectionData({ ...inspectionData, preferredDate: e.target.value })}
                        required
                        className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm text-foreground/80">Preferred Time</label>
                      <input
                        type="time"
                        value={inspectionData.preferredTime}
                        onChange={(e) => setInspectionData({ ...inspectionData, preferredTime: e.target.value })}
                        className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block mb-2 text-sm text-foreground/80">Full Name</label>
                    <input
                      type="text"
                      value={inspectionData.name}
                      onChange={(e) => setInspectionData({ ...inspectionData, name: e.target.value })}
                      required
                      className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm text-foreground/80">Email</label>
                    <input
                      type="email"
                      value={inspectionData.email}
                      onChange={(e) => setInspectionData({ ...inspectionData, email: e.target.value })}
                      required
                      className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm text-foreground/80">Phone</label>
                    <input
                      type="tel"
                      value={inspectionData.phone}
                      onChange={(e) => setInspectionData({ ...inspectionData, phone: e.target.value })}
                      required
                      className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                      placeholder="+234 800 000 0000"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm text-foreground/80">Notes (Optional)</label>
                    <textarea
                      value={inspectionData.notes}
                      onChange={(e) => setInspectionData({ ...inspectionData, notes: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none text-sm"
                      placeholder="Any scheduling preferences?"
                    />
                  </div>
                  <motion.button
                    type="submit"
                    className="w-full bg-gradient-to-r from-primary to-accent text-white py-3 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Book Inspection
                  </motion.button>
                  {inspectionStatus === 'sent' && (
                    <div className="bg-green-500/10 border border-green-500/50 text-green-500 px-4 py-3 rounded-lg text-center text-sm">
                      Inspection request received. We will confirm the date shortly.
                    </div>
                  )}
                  {inspectionStatus === 'error' && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg text-center text-sm">
                      Unable to submit your inspection request.
                    </div>
                  )}
                    </form>
                  </div>
                )}
              </motion.div>

              <motion.div
                className="bg-card border border-border rounded-xl p-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 style={{ fontWeight: 600, fontSize: '1.25rem' }}>
                    Request a Consultation
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowConsultationForm((prev) => !prev)}
                    className="text-sm text-primary hover:text-accent transition-colors"
                  >
                    {showConsultationForm ? 'Hide Form' : 'Open Form'}
                  </button>
                </div>
                {showConsultationForm && (
                  <div className="max-h-[60vh] overflow-y-auto pr-2">
                    <form onSubmit={handleConsultationSubmit} className="space-y-4">
                  <div>
                    <label className="block mb-2 text-sm text-foreground/80">Preferred Date</label>
                    <input
                      type="date"
                      value={consultationData.date}
                      onChange={(e) => setConsultationData({ ...consultationData, date: e.target.value })}
                      required
                      className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm text-foreground/80">Preferred Time</label>
                    <input
                      type="time"
                      value={consultationData.time}
                      onChange={(e) => setConsultationData({ ...consultationData, time: e.target.value })}
                      className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm text-foreground/80">Consultation Topic</label>
                    <input
                      type="text"
                      value={consultationData.topic}
                      onChange={(e) => setConsultationData({ ...consultationData, topic: e.target.value })}
                      className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                      placeholder="Investment guidance, property search, etc."
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm text-foreground/80">Full Name</label>
                    <input
                      type="text"
                      value={consultationData.name}
                      onChange={(e) => setConsultationData({ ...consultationData, name: e.target.value })}
                      required
                      className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm text-foreground/80">Email</label>
                    <input
                      type="email"
                      value={consultationData.email}
                      onChange={(e) => setConsultationData({ ...consultationData, email: e.target.value })}
                      required
                      className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm text-foreground/80">Phone</label>
                    <input
                      type="tel"
                      value={consultationData.phone}
                      onChange={(e) => setConsultationData({ ...consultationData, phone: e.target.value })}
                      required
                      className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                      placeholder="+234 800 000 0000"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm text-foreground/80">Notes (Optional)</label>
                    <textarea
                      value={consultationData.notes}
                      onChange={(e) => setConsultationData({ ...consultationData, notes: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none text-sm"
                      placeholder="What would you like to discuss?"
                    />
                  </div>
                  <motion.button
                    type="submit"
                    className="w-full bg-gradient-to-r from-primary to-accent text-white py-3 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Request Consultation
                  </motion.button>
                  {consultationStatus === 'sent' && (
                    <div className="bg-green-500/10 border border-green-500/50 text-green-500 px-4 py-3 rounded-lg text-center text-sm">
                      Consultation request received. We will confirm the time shortly.
                    </div>
                  )}
                  {consultationStatus === 'error' && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg text-center text-sm">
                      Unable to submit your consultation request.
                    </div>
                  )}
                    </form>
                  </div>
                )}
              </motion.div>

              {/* Contact Card */}
              <motion.div
                className="bg-card border border-border rounded-xl p-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 style={{ fontWeight: 600, fontSize: '1.25rem' }}>
                    Interested in this property?
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowInquiryForm((prev) => !prev)}
                    className="text-sm text-primary hover:text-accent transition-colors"
                  >
                    {showInquiryForm ? 'Hide Form' : 'Open Form'}
                  </button>
                </div>

                {showInquiryForm && (
                  <div className="max-h-[60vh] overflow-y-auto pr-2">
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
                  </div>
                )}
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
                    href="mailto:info@letifirealty.com"
                    className="flex items-center gap-3 p-3 bg-card rounded-lg hover:bg-primary/10 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Mail className="text-white" size={18} />
                    </div>
                    <div>
                      <div className="text-xs text-foreground/60">Email</div>
                      <div className="text-sm">info@letifirealty.com</div>
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
